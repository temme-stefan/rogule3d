import {SeededRandom} from "./PseudoRandomNumberGenerator.ts";
import type {TItem} from "./Item.ts";
import type {TCharacter} from "./Character.ts";
import Digger from "rot-js/lib/map/digger";
import RNG from "rot-js/lib/rng"

export const CellTypes = {
    wall: 0,
    free: 1,
    start: 2,
    gate: 3,
    door: 4,
} as const;
export type TCellType = typeof CellTypes[keyof typeof CellTypes]
export const wallCellTypes: Set<TCellType> = new Set([CellTypes.wall]);
export const freeCellTypes: Set<TCellType> = new Set([CellTypes.free, CellTypes.door, CellTypes.gate, CellTypes.start]);
export type TCell = {
    x: number,
    y: number,
    type: TCellType,
    neighbours: TCell[],
    freeNeighbours: TCell[]
    items: TItem[],
    characters: TCharacter[]
}

function createCell(x: number, y: number) {
    return {x, y, type: CellTypes.wall, freeNeighbours: [], neighbours: [], items: [], characters: []} as TCell;
}

function identifyDoors(map: TCell[][]) {
    map.flat().filter(c => c.type === CellTypes.free).forEach(c => {
        const isCorridor = (c: TCell) => c.freeNeighbours.length === 2
        const isStraightCorridor = (c: TCell) => isCorridor(c) && (c.freeNeighbours[0].x == c.freeNeighbours[1].x || c.freeNeighbours[0].y == c.freeNeighbours[1].y);
        const amountOfAdjacentCorridors = (c: TCell) => c.freeNeighbours.filter(isCorridor).length;
        const isDoor = freeCellTypes.has(c.type) && (
            isStraightCorridor(c) && amountOfAdjacentCorridors(c) <= 1
            // || isCorridor(c) && amountOfAdjacentCorridors(c) === 1
        );
        if (isDoor) {
            c.type = CellTypes.door;
        }
    })
}

function setNeighbours(map: TCell[][]) {
    map.flat().forEach(c => {
        c.neighbours = getNeighbours(c, map)
        c.freeNeighbours = getFreeNeighbours(c, map)
    });
}

function createEmptyMap(options: TMapOptions): TCell[][] {
    return Array.from({length: options.size.y},
        ((_, y) => Array.from({length: options.size.x},
            ((_, x) => createCell(x, y))
        ))
    );
}

function removeDeadEnds(map: TCell[][], options: TMapOptions) {
    let deadEnds = map.flat().filter(c => c.type === CellTypes.free && getFreeNeighbours(c, map).length === 1);
    while (deadEnds.length > options.maxDeadEnds) {
        deadEnds.forEach(cell => map[cell.y][cell.x].type = CellTypes.wall)
        deadEnds = map.flat().filter(c => c.type === CellTypes.free && getFreeNeighbours(c, map).length === 1);
    }
}

function createOrganicMap(options: TOrganicDungeonMapOptions, random: SeededRandom) {
    let density = 0;
    let map: TCell[][] = [];
    do {
        map = createEmptyMap(options);
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
        removeDeadEnds(map, options);

        density = map.flat().filter(cell => cell.type === CellTypes.free).length / map.flat().length * 100;
    } while (density < options.density.min);
    return map;
}

function setStartEnd(map: TMap) {
    let pair: TCell[] = [];
    let distance = 0;
    const innerCells = map.board.flat().filter(cell => cell.type === CellTypes.free && cell.freeNeighbours.length == 4
        && [[-1, -1], [-1, 1], [1, -1], [1, 1]].filter(([dx, dy]) => map.board[cell.y + dy]?.[cell.x + dx]?.type === CellTypes.free).length >= 3
    );
    for (let i = 0; i < innerCells.length; i++) {
        for (let j = i + 1; j < innerCells.length; j++) {
            const d = getDistance(innerCells[i], innerCells[j], map);
            if (d > distance) {
                pair = [innerCells[i], innerCells[j]];
                distance = d;
            }
        }
    }
    pair[0].type = CellTypes.start;
    pair[1].type = CellTypes.gate;
    return distance;
}


function createRoomMap(options: TRoomDungeonMapOptions, random: SeededRandom) {
    RNG.setSeed(random.state);
    const digger = new Digger(options.size.x, options.size.y, {
        roomWidth: [options.room.x.min, options.room.x.max],
        roomHeight: [options.room.y.min, options.room.y.max],
        corridorLength: [options.corridor.min, options.corridor.max],
        dugPercentage: options.density.min
    });
    const map = createEmptyMap(options);
    digger.create((x, y, value) => {
        if (value == 0) {
            map[y][x].type = CellTypes.free;
        }
    })
    removeDeadEnds(map, options)
    digger.getRooms().forEach(room => {
        room.getDoors((x, y) => {
            if (map[y][x].type === CellTypes.free) {
                map[y][x].type = CellTypes.door;
            }
        });
    });
    return map;
}

export function createMap(options: TMapOptions, random: SeededRandom) {
    const map = {
        board: [],
        distance: new Map()
    } as TMap;
    let distance: number;
    do {
        if (isRoomDungeonMapOptions(options)) {
            map.board = createRoomMap(options, random)
        }
        if (isOrganicDungeonMapOptions(options)) {
            map.board = createOrganicMap(options, random);
        }
        setNeighbours(map.board);
        map.distance = computeAllDistances(map.board);
        distance = setStartEnd(map);
    } while (distance < options.minDistanz);
    if (options.doorDetection) {
        identifyDoors(map.board);
    }
    return map;

}


function getNeighbours(cell: TCell, map: TCell[][]) {
    return [[-1, 0], [1, 0], [0, -1], [0, 1]].map(([dx, dy]) => map[cell.y + dy]?.[cell.x + dx]).filter(Boolean);
}

function getFreeNeighbours(cell: TCell, map: TCell[][]) {
    return getNeighbours(cell, map).filter(c => freeCellTypes.has(c.type));
}

function computeAllDistances(map: TCell[][]) {
    const distance = new Map<TCell, Map<TCell, number>>();

    const cells = map.flat().filter(c => !wallCellTypes.has(c.type));
    // Initialisiere die Distanz-Map
    cells.forEach(cell => {
        distance.set(cell, new Map());
        // Setze Distanz zu sich selbst auf 0
        distance.get(cell)!.set(cell, 0);
    });

    // Floyd-Warshall Algorithmus für kürzeste Pfade zwischen allen Paaren
    for (const cell of cells) {
        // BFS für kürzeste Pfade von dieser Zelle aus
        const queue: TCell[] = [cell];
        const visited = new Set<TCell>([cell]);
        let currentDistance = 0;
        let currentLevelSize = 1;
        let nextLevelSize = 0;

        while (queue.length > 0) {
            const current = queue.shift()!;

            // Setze die Distanz
            if (!distance.get(cell)!.has(current)) {
                distance.get(cell)!.set(current, currentDistance);
            }
            if (!distance.get(current)!.has(cell)) {
                distance.get(current)!.set(cell, currentDistance);
            }

            // Füge Nachbarn zur Queue hinzu
            for (const neighbor of current.freeNeighbours) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                    nextLevelSize++;
                }
            }

            currentLevelSize--;
            if (currentLevelSize === 0) {
                currentLevelSize = nextLevelSize;
                nextLevelSize = 0;
                currentDistance++;
            }
        }
    }
    return distance;
}

export function getDistance(cell1: TCell, cell2: TCell, map: TMap): number {
    return map.distance.get(cell1)?.get(cell2) ?? Infinity;
}

export function getShortestPath(from: TCell, to: TCell, map: TCell[][], cellFilter: (cell: TCell) => boolean): TCell[] | null {
    // Menge der begehbaren Zellen für diese spezifische Situation
    const walkableCells = new Set(map.flat().filter(c => !wallCellTypes.has(c.type) && c.characters.filter(c => c.current > 0).length === 0 && cellFilter(c)));
    walkableCells.add(from); // Die Startzelle ist immer begehbar
    walkableCells.add(to);   // Die Zielzelle ist immer begehbar

    // Wenn Start und Ziel identisch sind
    if (from === to) {
        return [from];
    }

    // BFS für kürzesten Pfad
    const queue: TCell[] = [from];
    const visited = new Set<TCell>([from]);
    const cameFrom = new Map<TCell, TCell>();

    while (queue.length > 0) {
        const current = queue.shift()!;

        // Wenn das Ziel erreicht wurde
        if (current === to) {
            // Rekonstruiere den Pfad
            const path: TCell[] = [current];
            let temp = current;

            while (cameFrom.has(temp)) {
                temp = cameFrom.get(temp)!;
                path.unshift(temp);
            }

            return path;
        }

        // Prüfe alle Nachbarn
        for (const neighbor of current.freeNeighbours) {
            // Überspringe nicht begehbare oder bereits besuchte Zellen
            if (!walkableCells.has(neighbor) || visited.has(neighbor)) {
                continue;
            }

            // Markiere als besucht
            visited.add(neighbor);
            cameFrom.set(neighbor, current);
            queue.push(neighbor);
        }
    }

    // Kein Pfad gefunden
    return null;
}

export function nextCellOnShortestPath(from: TCell, to: TCell, map: TCell[][], cellFilter: (cell: TCell) => boolean): TCell | null {
    const path = getShortestPath(from, to, map, cellFilter);

    if (!path || path.length <= 1) {
        return null;
    }

    // Gib die nächste Zelle im Pfad zurück (Index 1, da Index 0 die Startzelle ist)
    return path[1];
}

export const serializeCell = (cell: TCell) => {
    return {
        x: cell.x,
        y: cell.y,
        type: cell.type
    }
}

export const organicDungeonMapDefaultOptions = () => ({
    type: "organic",
    size: {
        x: 32 as number,
        y: 32 as number
    },
    density: {
        seed: 60 as number,
        min: 40 as number
    },
    maxDeadEnds: 0 as number,
    minDistanz: 10 as number,
    doorDetection: false as boolean,
});
export type TOrganicDungeonMapOptions = ReturnType<typeof organicDungeonMapDefaultOptions>;
const isOrganicDungeonMapOptions = (options: TMapOptions): options is TOrganicDungeonMapOptions => options.type === "organic";
export const roomDungeonMapDefaultOptions = () => ({
    type: "room",
    size: {
        x: 32 as number,
        y: 32 as number
    },
    room: {
        x: {
            min: 3 as number,
            max: 9 as number
        },
        y: {
            min: 3 as number,
            max: 5 as number
        }
    },
    corridor: {
        min: 1 as number,
        max: 5 as number,
    },
    density: {
        min: 20 as number
    },
    maxDeadEnds: 2 as number,
    doorDetection: false as boolean,
    minDistanz: 10 as number,
});
export type TRoomDungeonMapOptions = ReturnType<typeof roomDungeonMapDefaultOptions>;
const isRoomDungeonMapOptions = (options: TMapOptions): options is TRoomDungeonMapOptions => options.type === "room";

export const defaultMapOptions = organicDungeonMapDefaultOptions;
export type TMapOptions = TOrganicDungeonMapOptions | TRoomDungeonMapOptions;
export type TMap = {
    board: TCell[][],
    distance: Map<TCell, Map<TCell, number>>
}