import {SeededRandom} from "./PseudoRandomNumberGenerator.ts";
import {CellTypes, createMap, getDistance, type TCell} from "./Map.ts";
import {createCharacter, type TCharacter} from "./Character.ts";
import {createDecoration, createTreasure, type TItem} from "./TItem.ts";

export const defaultOptions = {
    size: {
        x: 20,
        y: 20
    },
    density: {
        seed: 60,
        min: 40
    },
    maxDeadEnds: 0,
    minDistanz: 10,
    naturalHealing:{
        steps:100,
        amount: 2
    },
    enemies: {
        min: 5,
        max: 5,
        exp: {
            min: 5,
            max: 30
        },
    },
    decorations: {
        min: 3,
        max: 10
    },
    treasures: {
        min: 1,
        max: 10
    },

} as const

export type TOptions = typeof defaultOptions;

export type TState = {
    step:number,
    transitions:any[],
    state:"playing"|"win"|"lose"
}

export type TGame = {
    seed: string,
    player?: TCharacter,
    monsters: TCharacter[],
    treasures: TItem[],
    decorations: TItem[],
    random: SeededRandom,
    board: TCell[][],
    options: TOptions,
    mover: (action: TInputActions) => TState,
    state:TState
}


function getEmptyCells(count: number, map: TCell[][], random: SeededRandom) {
    const freeCells = map.flat().filter(c => c.type === CellTypes.free && c.characters.length === 0 && c.items.length === 0);
    const cells = new Set<TCell>();
    while (cells.size < count) {
        cells.add(random.pickElement(freeCells));
    }
    return [...cells];
}

function addMonsters(random: SeededRandom, board: TCell[][], player: TCharacter, options: TOptions) {
    const monsterCount = random.nextInt(options.enemies.min, options.enemies.max);
    let monsterxpSum = 0;
    let monsters: TCharacter[] = [];
    while (monsterxpSum > options.enemies.exp.max || monsterxpSum < options.enemies.exp.min) {
        monsters = Array.from({length: monsterCount}, () => createCharacter(false, random));
        monsterxpSum = monsters.map(m => m.exp).reduce((a, b) => a + b, 0);
    }
    monsters.sort((a, b) => a.exp - b.exp);
    const monsterCells = getEmptyCells(monsterCount, board, random);
    monsterCells.sort((a, b) => getDistance(a, player.cell!, board) - getDistance(b, player.cell!, board));
    monsters.forEach((m, i) => {
        const cell = monsterCells[i];
        cell.characters.push(m);
        m.cell = cell;
    })
    return monsters;
}

function addPlayer(random: SeededRandom, board: TCell[][]) {
    const player = createCharacter(true, random);
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

function addTreasures(random: SeededRandom, monsters: TCharacter[], decorations: TItem[], options: TOptions) {
    const treasureKeeperCount = monsters.length + decorations.length;
    let treasureCount = random.nextInt(options.treasures.min, Math.min(options.treasures.max, treasureKeeperCount));
    const treasures: TItem[] = Array.from({length: treasureCount}).map(_ => createTreasure(random));
    const possibleBearer = [...monsters, ...decorations];
    const treasureBearer = new Set<{ treasure?: TItem }>();
    while (treasureBearer.size < treasureCount) {
        treasureBearer.add(random.pickElement(possibleBearer));
    }
    const treasureBearerArr = [...treasureBearer];
    treasures.forEach((t, i) => {
        treasureBearerArr[i].treasure = t;
    })
    return treasures;
}

export function createGame(seed: string, options: TOptions = defaultOptions) {
    const random = new SeededRandom(seed);
    const board = createMap(options, random);
    const player = addPlayer(random, board);
    const monsters = addMonsters(random, board, player, options);
    const decorations = addDecorations(random, board, options);
    const treasures = addTreasures(random, monsters, decorations, options);
    const state= {
        step:0,
        transitions:[],
        state:"playing"
    }
    const mover = (input: TInputActions) => {
        state.transitions=[];
        const actions = getActions(input, board, player, monsters, random);
        const grouped = Map.groupBy(actions, a => a.type);

        handleMove(grouped.get(TGameAction.move)??[],player);
        if (grouped.has(TGameAction.increaseStepCounter)) {
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


        }
        return state;
    }
    return {seed, player, monsters, treasures, decorations, board, options, random, mover, state} as TGame;
}

function handleMove(actions:TAction[], player:TCharacter) {
    actions.sort((a, b) => (a.actor == player)?-1:( (b.actor==player)?1: (b.actor.exp - a.actor.exp)));
    actions.forEach(({actor,targetCell}) => {
        if (targetCell && actor.current>0 && targetCell.characters.length === 0) {
            targetCell.characters.push(actor);
            actor.cell?.characters.splice(actor.cell?.characters.indexOf(actor),1);
            actor.cell = targetCell;
        }
    })
}


function getPlayerActions(input: "moveUp" | "moveDown" | "moveLeft" | "moveRight" | "idle", player: TCharacter, board: TCell[][]) {
    const actions: TAction[] = []
    if (input == InputActions.idle) {
        actions.push({type: TGameAction.increaseStepCounter, actor:player});
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
            actions.push({type: TGameAction.increaseStepCounter, actor:player});
            let move = true;
            if (targetCell.characters.length > 0) {
                actions.push({type: TGameAction.fight, actor: player, defender: targetCell.characters[0]});
                move = false;
            }
            if (targetCell.items.length > 0) {
                const hasObstacle = targetCell.items[0].obstacle;
                if (hasObstacle) {
                    actions.push({type: TGameAction.destroy, item: targetCell.items[0], actor:player});
                    move = false;
                } else {
                    actions.push({type: TGameAction.pickUp, item: targetCell.items[0], actor:player});
                }
            }
            if (targetCell.type === CellTypes.gate) {
                actions.push({type: TGameAction.win, actor:player});
            }
            if (move) {
                actions.push({type: TGameAction.move, targetCell: targetCell, actor: player});
            }
        }
    }
    return actions;
}

function getMonsterActions(m: TCharacter, player: TCharacter, board: TCell[][], random: SeededRandom) {
    const mActions = [];
    const distance = getDistance(m.cell!, player.cell!, board);
    if (distance == 1) {
        mActions.push({type: TGameAction.fight, actor: m, defender: player});
    } else if (distance < m.vision) {
        const closestCells = m.cell?.freeNeighbours.reduce(({distance, cells}, cell) => {
            const d = getDistance(cell, player.cell!, board);
            if (d < distance) {
                cells = [];
                distance = d;
            }
            if (d == distance) {
                cells.push(cell);
            }
            return {distance, cells}
        }, {distance: Number.MAX_SAFE_INTEGER, cells: [] as TCell[]}).cells!;
        const moveTo = random.pickElement(closestCells);
        mActions.push({type: TGameAction.move, targetCell: moveTo, actor: m});
    }
    return mActions;
}

function getActions(input: TInputActions, board: TCell[][], player: TCharacter, monsters: TCharacter[],random:SeededRandom) {
    const actions = getPlayerActions(input, player, board);
    if (actions.length > 0) {
        monsters.forEach(m => {
            const mActions = getMonsterActions(m, player, board, random);
            actions.push(...mActions);
        })
    }
    return actions;
}

export const InputActions = {
    moveUp: "moveUp",
    moveDown: "moveDown",
    moveLeft: "moveLeft",
    moveRight: "moveRight",
    idle: "idle",
} as const;
export type TInputActions = (typeof InputActions)[keyof typeof InputActions]


export const TGameAction = {
    increaseStepCounter: "increaseStepCounter",
    win: "win",
    fight: "fight",
    destroy: "destroy",
    pickUp: "pickUp",
    move: "move",
}

export type TAction = {
    type: typeof TGameAction[keyof typeof TGameAction],
    actor: TCharacter,
    defender?: TCharacter,
    item?: TItem,
    targetCell?: TCell,
}