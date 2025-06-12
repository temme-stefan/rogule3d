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


export type TGame = {
    seed: string,
    player?: TCharacter,
    monsters: TCharacter[],
    treasures: TItem[],
    decorations: TItem[],
    random: SeededRandom,
    board: TCell[][],
    options: TOptions
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
    return {seed, player, monsters, treasures, decorations, board, options, random,} as TGame;
}
