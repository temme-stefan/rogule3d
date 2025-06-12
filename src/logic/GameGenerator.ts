import {SeededRandom} from "./PseudoRandomNumberGenerator.ts";

export const defaultOptions = {
    size: {
        x: 20,
        y: 20
    },
    density: {
        seed: 60,
        min: 40
    },
    maxDeadEnds: 2,
    minDistanz: 10,
    enemies: {
        min: 5,
        max: 5
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
export const CellTypes = {
    wall: 0,
    free: 1,
    start: 2,
    gate: 3,
    door: 4,
} as const;

type TCellType = typeof CellTypes[keyof typeof CellTypes]

const freeCellTypes: Set<TCellType> = new Set([CellTypes.free, CellTypes.door, CellTypes.gate, CellTypes.start]);


export type TCell = {
    x: number,
    y: number,
    type: TCellType,
    freeNeighbours: TCell[]
    neighbours: TCell[]
}

export type TGame = {
    seed: string,
    random: SeededRandom,
    board: TCell[][],
    options: TOptions
}

function createMap(options: TOptions, random: SeededRandom) {
    let density = 0;
    let map: TCell[][] = [];
    let distance = 0;
    let pair: TCell[] = []
    do {
        map = Array.from({length: options.size.y},
            ((_, y) => Array.from({length: options.size.x},
                    ((_, x) => ({x, y, type: CellTypes.wall, freeNeighbours: [], neighbours: []})))
            )
        );
        for (let y = 0; y < options.size.y; y++) {
            for (let x = 0; x < options.size.x; x++) {
                if (y === 0 || y === options.size.y - 1 || x === 0 || x === options.size.x - 1) {
                    continue;
                }
                map[y][x].type = random.chance(options.density.seed / 100) ? CellTypes.free : CellTypes.wall;
            }
        }
        const freeCells = map.flat().filter(cell => cell.type === CellTypes.free);
        const components: Set<TCell>[] = [];
        const visited = new Set<TCell>();
        while (freeCells.length > 0) {
            const current = freeCells.pop()!;
            if (visited.has(current)) {
                continue;
            }
            const component: TCell[] = [current];
            visited.add(current);
            const neighbours = getFreeNeighbours(current, map);
            while (neighbours.length > 0) {
                const next = neighbours.pop()!;
                if (visited.has(next)) {
                    continue;
                }
                visited.add(next);
                component.push(next);
                neighbours.push(...getFreeNeighbours(next, map));
            }

            components.push(new Set(component));
        }
        const maxSizeComponent = [...components].reduce((a, b) => a.size > b.size ? a : b, components[0]);
        for (const component of components) {
            if (component != maxSizeComponent) {
                for (const cell of component) {
                    map[cell.y][cell.x].type = CellTypes.wall;
                }
            }

        }
        let deadEnds = map.flat().filter(c => c.type === CellTypes.free && getFreeNeighbours(c, map).length === 1);
        while (deadEnds.length > options.maxDeadEnds) {
            deadEnds.forEach(cell => map[cell.y][cell.x].type = CellTypes.wall)
            deadEnds = map.flat().filter(c => c.type === CellTypes.free && getFreeNeighbours(c, map).length === 1);
        }

        density = map.flat().filter(cell => cell.type === CellTypes.free).length / map.flat().length * 100;

        const innerCells = map.flat().filter(cell => cell.type === CellTypes.free && getFreeNeighbours(cell, map).length == 4);
        for (let i = 0; i < innerCells.length; i++) {
            for (let j = i + 1; j < innerCells.length; j++) {
                const d = Math.sqrt(Math.pow(innerCells[i].x - innerCells[j].x, 2) + Math.pow(innerCells[i].y - innerCells[j].y, 2));
                if (d > distance) {
                    pair = [innerCells[i], innerCells[j]];
                    distance = d;
                }
            }
        }
    } while (density < options.density.min && distance < options.minDistanz);
    map.flat().forEach(c => {
        c.neighbours = getNeighbours(c, map)
        c.freeNeighbours = getFreeNeighbours(c, map)
        const isDoor = c.freeNeighbours.length === 2
            && (c.freeNeighbours[0].x == c.freeNeighbours[1].x || c.freeNeighbours[0].y == c.freeNeighbours[1].y)
            && c.freeNeighbours.some(n => n.freeNeighbours.length > 2
                || n.neighbours.length == 2 && !(n.freeNeighbours[0].x == n.freeNeighbours[1].x || n.freeNeighbours[0].y == n.freeNeighbours[1].y)
            )
        ;
        if (isDoor) {
            c.type = CellTypes.door;
        }
    });
    pair[0].type = CellTypes.start;
    pair[1].type = CellTypes.gate;
    return map;
}

function getNeighbours(cell: TCell, map: TCell[][]) {
    return [[-1, 0], [1, 0], [0, -1], [0, 1]].map(([dx, dy]) => map[cell.y + dy]?.[cell.x + dx]).filter(Boolean);
}


function getFreeNeighbours(cell: TCell, map: TCell[][]) {
    return getNeighbours(cell, map).filter(c => freeCellTypes.has(c.type));
}

export function createGame(seed: string, options: TOptions = defaultOptions) {
    const game: TGame = {seed, random: new SeededRandom(seed), board: [[]], options}
    game.board = createMap(options, game.random);
    console.log(game);
    return game;
}
