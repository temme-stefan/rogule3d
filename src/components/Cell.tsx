import {CellTypes, type TCell} from "../logic/Map.ts";

export function Cell({cell}: { cell: TCell }) {
    const cellTypeToClass = (c: TCell) => {
        switch (c.type) {
            case CellTypes.start:
            case CellTypes.gate:
            case CellTypes.free:
                return "free";
            case CellTypes.door:
                return "door";
            case CellTypes.wall:
                const show = (c.freeNeighbours.length > 0 || c.neighbours.filter(n => n.freeNeighbours.length > 0).length > 1);
                return show ? "wall" : "";

        }
    }
    const cellTypeToContent = (c: TCell) => {
        const alive = cell.characters.find(c => c.current > 0);
        if (alive) {
            return alive.unicode;
        }
        if (cell.items.length > 0) {
            return cell.items[0].unicode;
        }
        if (cell.characters.length > 0) {
            return "☠️";
        }
        switch (c.type) {
            case CellTypes.gate:
                return "⛩"
            case CellTypes.start:
            case CellTypes.free:
            case CellTypes.wall:
                return ""

        }
    }

    return <span className={"cell " + cellTypeToClass(cell)}>{cellTypeToContent(cell)}</span>
}