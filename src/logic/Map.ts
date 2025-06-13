import {SeededRandom} from "./PseudoRandomNumberGenerator.ts";
import type {TItem} from "./TItem.ts";
import type {TCharacter} from "./Character.ts";
import type {TOptions} from "./GameGenerator.ts";

export const CellTypes = {
    wall: 0,
    free: 1,
    start: 2,
    gate: 3,
    door: 4,
} as const;
export type TCellType = typeof CellTypes[keyof typeof CellTypes]
export const freeCellTypes: Set<TCellType> = new Set([CellTypes.free, CellTypes.door, CellTypes.gate, CellTypes.start]);
export type TCell = {
    x: number,
    y: number,
    type: TCellType,
    freeNeighbours: TCell[]
    neighbours: TCell[],
    items: TItem[],
    characters: TCharacter[]
}

function createCell(x: number, y: number) {
    return {x, y, type: CellTypes.wall, freeNeighbours: [], neighbours: [], items: [], characters: []} as TCell;
}

export function createMap(options: TOptions, random: SeededRandom) {
    let density = 0;
    let map: TCell[][] = [];
    let distance = 0;
    let pair: TCell[] = []
    do {
        map = Array.from({length: options.size.y},
            ((_, y) => Array.from({length: options.size.x},
                ((_, x) => createCell(x, y))
            ))
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
                || (n.neighbours.length == 2 && !(n.freeNeighbours[0].x == n.freeNeighbours[1].x || n.freeNeighbours[0].y == n.freeNeighbours[1].y))
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

const distance = new Map<TCell, Map<TCell, number>>;

function computeAllDistances(map: TCell[][]) {
    const cells = map.flat().filter(c => c.type !== CellTypes.wall);
    distance.clear();
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
}

export function getDistance(cell1: TCell, cell2: TCell, map: TCell[][]) {
    if (distance.size === 0) {
        computeAllDistances(map);
    }
    return distance.get(cell1)!.get(cell2)!;
}
export function nextCellOnShortestPath(from: TCell, to: TCell, map: TCell[][], cellFilter: (cell: TCell) => boolean): TCell | null {
    // Menge der begehbaren Zellen für diese spezifische Situation
    const walkableCells = new Set(map.flat().filter(c => c.type !== CellTypes.wall && c.characters.length === 0 && cellFilter(c)));
    walkableCells.add(from); // Die Startzelle ist immer begehbar
    walkableCells.add(to);   // Die Zielzelle ist immer begehbar
    
    // Wenn Start und Ziel identisch sind
    if (from === to) {
        return from;
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
            
            // Gib die nächste Zelle im Pfad zurück
            return path.length > 1 ? path[1] : null;
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