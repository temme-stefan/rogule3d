import {SeededRandom} from "./PseudoRandomNumberGenerator.ts";
import {CellTypes, createMap, getDistance, nextCellOnShortestPath, serializeCell, type TCell} from "./Map.ts";
import {createCharacter, isPlayer, serializeCharacter, type TCharacter, type TPlayer} from "./Character.ts";
import {combatItems, createDecoration, createTreasure, serializeItem, type TItem, TreasureTypes} from "./Item.ts";

export const defaultOptions = {
    size: {
        x: 32,
        y: 32
    },
    room:{
        x:{
            min: 3,
            max: 9
        }
        ,
        y:{
            min: 3,
            max: 5
        }
    },
    density: {
        seed: 60,
        min: 40
    },
    maxDeadEnds: 0,
    minDistanz: 10,
    naturalHealing: {
        steps: 100,
        amount: 2
    },
    enemies: {
        min: 5,
        max: 5,
    },
    decorations: {
        min: 15,
        max: 15
    },
    treasures: {
        propabilty: {
            enemy: 0.5,
            decoration: 0.9
        }
    },

} as const

export type TOptions = typeof defaultOptions;

export type TState = {
    step: number,
    transitions: { type: typeof GameEvent[keyof typeof GameEvent], cell: TCell, character?: TCharacter }[],
    state: "playing" | "win" | "lose"
}

export type TGame = {
    seed: string,
    player?: TPlayer,
    monsters: TCharacter[],
    treasures: TItem[],
    decorations: TItem[],
    random: SeededRandom,
    board: TCell[][],
    options: TOptions,
    mover: (action: TInputActions) => TState,
    state: TState
}


function getEmptyCells(count: number, map: TCell[][], random: SeededRandom) {
    const freeCells = map.flat().filter(c => c.type === CellTypes.free && c.characters.length === 0 && c.items.length === 0);
    const cells = new Set<TCell>();
    while (cells.size < count) {
        cells.add(random.pickElement(freeCells));
    }
    return [...cells];
}

function addMonsters(random: SeededRandom, board: TCell[][], player: TCharacter, options: TOptions, startGoalDistance: number) {
    const monsterCount = random.nextInt(options.enemies.min, options.enemies.max);
    const cellMap = new Map<TCell, TCharacter>();

    let monsters: TCharacter[] = [];
    const monsterCells = getEmptyCells(monsterCount, board, random);
    cellMap.clear();
    monsterCells.forEach(c => {
        const distance = getDistance(c, player.cell!, board);
        const difficulty = Math.min(1, distance / startGoalDistance * 0.75);
        cellMap.set(c, createCharacter(false, random, difficulty));
    });
    [...cellMap.entries()].forEach(([cell, m]) => {
        cell.characters.push(m);
        m.cell = cell;
        monsters.push(m)
    })
    return monsters;
}

function addPlayer(random: SeededRandom, board: TCell[][]) {
    const player = createCharacter(true, random) as TPlayer;
    player.cell = board.flat().find(c => c.type === CellTypes.start)!;
    player.cell.characters.push(player);
    return player;
}

function addDecorations(random: SeededRandom, board: TCell[][], options: TOptions) {
    const decorationCount = random.nextInt(options.decorations.min, options.decorations.max);
    const decorations: TItem[] = Array.from({length: decorationCount}).map(_ => createDecoration(random));
    const decoCells = getEmptyCells(decorationCount, board, random);
    decorations.forEach((d, i) => {
        const cell = decoCells[i];
        cell.items.push(d);
        d.cell = cell;
    });
    return decorations;
}

function addTreasures(random: SeededRandom, monsters: TCharacter[], decorations: TItem[], player: TPlayer, map: TCell[][], options: TOptions, maxDistanz: number) {
    let treasures: TItem[] = []
    do {
        treasures = [];
        monsters.forEach(m => {
            m.treasure = undefined;
            if (random.chance(options.treasures.propabilty.enemy)) {
                m.treasure = createTreasure(random)
                treasures.push(m.treasure);
            }
        });
        decorations.forEach(d => {
            d.treasure = undefined;
            const difficulty = Math.min(1, getDistance(d.cell!, player.cell!, map) / maxDistanz) * options.treasures.propabilty.decoration;
            if (random.chance(difficulty)) {
                d.treasure = createTreasure(random)
                treasures.push(d.treasure);
            }
        })
    } while (treasures.every(t => combatItems.has(t.type)))
    return treasures;
}

function handleFight(combatActions: TAction[], random: SeededRandom) {
    const transitions: TState["transitions"] = [];
    combatActions.map(a => ({action: a, ini: random.nextInt(0, 5) + a.actor.level}))
        .sort((a, b) => b.ini - a.ini)
        .forEach(({action}) => {
            if (action.actor.current > 0 && action.defender!.current > 0) {
                const isHit = random.chance(5 / 6);
                let damage = random.nextInt(0, action.actor.level - 1);
                let defense = 0;

                if (isPlayer(action.actor)) {
                    action.actor.inventory.forEach(i => {
                        if (i.type == TreasureTypes.dagger) {
                            damage += 1;
                        }
                        if (i.type == TreasureTypes.axe) {
                            damage += 2;
                        }
                    })
                }
                if (isPlayer(action.defender!)) {
                    action.defender.inventory.forEach(i => {
                        if (i.type == TreasureTypes.shield) {
                            defense += 2;
                        }
                    })
                }
                damage = Math.max(0, damage - defense);
                if (damage > 0 && isHit) {
                    transitions.push({type: GameEvent.damaged, cell: action.defender!.cell!})
                    action.defender!.current = Math.max(0, action.defender!.current - damage);
                    if (action.defender!.current <= 0 && isPlayer(action.actor!)) {
                        action.actor.exp += action.defender!.exp;
                        action.actor.kills.push(action.defender!);
                        const treasure = action.defender!.treasure;
                        if (treasure) {
                            treasure.cell = action.defender!.cell;
                            treasure.cell!.items.push(treasure);
                            action.defender!.treasure = undefined;
                        }
                    }
                } else {
                    transitions.push({type: GameEvent.blocked, cell: action.defender!.cell!})
                }
                transitions.push({type: GameEvent.attacked, cell: action.defender!.cell!, character: action.actor!})
            }
        })
    return transitions;
}

export function createGame(seed: string, options: TOptions = defaultOptions) {
    const random = new SeededRandom(seed);
    const board = createMap(options, random);
    const distance = getDistance(board.flat().find(c => c.type === CellTypes.start)!, board.flat().find(c => c.type === CellTypes.gate)!, board);
    const player = addPlayer(random, board);
    const monsters = addMonsters(random, board, player, options, distance);
    const decorations = addDecorations(random, board, options);
    const treasures = addTreasures(random, monsters, decorations, player, board, options, distance);
    const state: TState = {
        step: 0,
        transitions: [],
        state: "playing"
    }
    const mover = (input: TInputActions) => {
        state.transitions = [];
        const actions = [] as TAction[];
        //add player actions
        actions.push(...getPlayerActions(input, player, board));
        if (!actions.some(a => a.type === GameAction.increaseStepCounter)) {
            return state;
        }
        //player move
        const move = actions.findIndex(a => a.type === GameAction.move);
        if (move >= 0) {
            const moveAction = actions[move];
            actions.splice(move, 1);
            handleMove([moveAction], player, board);
        }
        //player win
        if (player.cell?.type === CellTypes.gate) {
            state.state = "win";
            return state;
        }
        //add monster actions
        monsters.filter(m => m.current > 0).forEach(m => {
            actions.push(...getMonsterActions(m, player, board, random));
        })
        //monster move
        const grouped = Map.groupBy(actions, a => a.type);
        handleMove(grouped.get(GameAction.move) ?? [], player, board);
        //resolve combat actions
        const combatActions = grouped.get(GameAction.fight) ?? [];
        state.transitions.push(...handleFight(combatActions, random));
        //player loose
        if (player.current <= 0) {
            state.state = "lose";
            return state;
        }
        //resolve item actions
        const itemActions = grouped.get(GameAction.pickUp) ?? [];
        itemActions.forEach(a => {
            if (a.item!.type == TreasureTypes.health) {
                if (a.actor.current < a.actor.hitpoints) {
                    a.item!.cell!.items.splice(a.item!.cell!.items.indexOf(a.item!), 1);
                    a.actor.current = Math.min(a.actor.current + 2, a.actor.hitpoints);
                    a.item!.cell = undefined;
                }
            } else {
                (a.actor as TPlayer).inventory.push(a.item!);
                a.item!.cell!.items.splice(a.item!.cell!.items.indexOf(a.item!), 1);
                a.item!.cell = undefined;
            }
        });
        const destroyActions = grouped.get(GameAction.destroy) ?? [];
        destroyActions.forEach(a => {
            const treasure = a.item!.treasure;
            if (treasure) {
                treasure.cell = a.item!.cell!;
                treasure.cell!.items.push(treasure);
                a.item!.treasure = undefined;
            }
            a.item!.cell!.items.splice(a.item!.cell!.items.indexOf(a.item!), 1);

            state.transitions.push({type: GameEvent.destroyed, cell: a.item!.cell!, character: a.actor})
            a.item!.cell = undefined;
        });


        // resolve step & natural Healing
        state.step++;
        if (player.current < player.hitpoints) {
            player.counter!++;
            if (player.counter! == options.naturalHealing.steps) {
                player.current = Math.min(player.current + 2, player.hitpoints);
                player.counter = 0
            }
        }
        if (player.current == player.hitpoints) {
            player.counter = 0;
        }
        return state;
    }
    return {seed, player, monsters, treasures, decorations, board, options, random, mover, state} as TGame;
}

function handleMove(actions: TAction[], player: TCharacter, map: TCell[][]) {
    actions.sort((a, b) => (a.actor == player) ? -1 : ((b.actor == player) ? 1 : (b.actor.exp - a.actor.exp)));
    actions.forEach(({actor, targetCell}) => {
        let target = targetCell ?? null;
        if (!target) {
            //monster move!
            target = nextCellOnShortestPath(actor.cell!, player.cell!, map, (cell) => getDistance(actor.cell!, cell, map) < actor.vision);
        }
        if (target && actor.current > 0 && target.characters.filter(c => c.current > 0).length === 0) {
            target.characters.push(actor);
            actor.cell?.characters.splice(actor.cell?.characters.indexOf(actor), 1);
            actor.cell = target;
        }
    })
}


function getPlayerActions(input: TInputActions, player: TCharacter, board: TCell[][]) {
    const actions: TAction[] = []
    if (input == InputActions.idle) {
        actions.push({type: GameAction.increaseStepCounter, actor: player});
    } else {
        const playerCell = player.cell!;
        let targetCell = playerCell;
        switch (input) {
            case InputActions.moveUp:
                targetCell = board[playerCell.y - 1][playerCell.x];
                break;
            case InputActions.moveDown:
                targetCell = board[playerCell.y + 1][playerCell.x];
                break;
            case InputActions.moveLeft:
                targetCell = board[playerCell.y][playerCell.x - 1];
                break;
            case InputActions.moveRight:
                targetCell = board[playerCell.y][playerCell.x + 1];
                break;
        }
        if (targetCell.type !== CellTypes.wall) {
            actions.push({type: GameAction.increaseStepCounter, actor: player});
            let move = true;
            if (targetCell.characters.filter(c => c.current > 0).length > 0) {
                actions.push({
                    type: GameAction.fight,
                    actor: player,
                    defender: targetCell.characters.filter(c => c.current > 0)[0]
                });
                move = false;
            }
            if (targetCell.items.length > 0) {
                const hasObstacle = targetCell.items[0].obstacle;
                if (hasObstacle) {
                    actions.push({type: GameAction.destroy, item: targetCell.items[0], actor: player});
                    move = false;
                } else {
                    actions.push({type: GameAction.pickUp, item: targetCell.items[0], actor: player});
                }
            }
            if (targetCell.type === CellTypes.gate) {
                actions.push({type: GameAction.win, actor: player});
            }
            if (move) {
                actions.push({type: GameAction.move, targetCell: targetCell, actor: player});
            }
        }
    }
    return actions;
}

function getMonsterActions(m: TCharacter, player: TCharacter, board: TCell[][], random: SeededRandom) {
    const mActions = [];
    const distance = getDistance(m.cell!, player.cell!, board);
    if (distance == 1) {
        mActions.push({type: GameAction.fight, actor: m, defender: player});
    } else if (distance < m.vision) {
        const propOfMove = Math.min(0.9, (m.vision / (distance * distance)) + 0.3);
        if (random.chance(propOfMove)) {
            mActions.push({type: GameAction.move, actor: m});
        }
    }
    return mActions;
}

export const InputActions = {
    moveUp: "moveUp",
    moveDown: "moveDown",
    moveLeft: "moveLeft",
    moveRight: "moveRight",
    idle: "idle",
} as const;
export type TInputActions = (typeof InputActions)[keyof typeof InputActions]


export const GameAction = {
    increaseStepCounter: "increaseStepCounter",
    win: "win",
    fight: "fight",
    destroy: "destroy",
    pickUp: "pickUp",
    move: "move",
} as const;

export const GameEvent = {
    destroyed: "destroyed",
    damaged: "damaged",
    blocked: "blocked",
    attacked: "attacked",
} as const;
export type TGameEvent = typeof GameEvent[keyof typeof GameEvent];
export type TAction = {
    type: typeof GameAction[keyof typeof GameAction],
    actor: TCharacter,
    defender?: TCharacter,
    item?: TItem,
    targetCell?: TCell,
}

export const serializeGame = (game: TGame) => {
    return {
        seed: game.seed,
        player: serializeCharacter(game.player!),
        monsters: game.monsters.map(serializeCharacter),
        treasures: game.treasures.map(serializeItem),
        decorations: game.decorations.map(serializeItem),
        board: game.board.map(row => row.map(serializeCell)),
        options: game.options,
        state: {
            ...game.state,
            transitions: game.state.transitions.map(({type, cell}) => ({type, cell: serializeCell(cell)}))
        },
    }
}

export const stringifyGame = (game: TGame) => {
    return JSON.stringify(serializeGame(game));
}
