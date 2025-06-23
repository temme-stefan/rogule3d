import {CellTypes, type TCell} from "../logic/Map.ts";
import "./Cell.css"
import {GameEvent, InputActions, type TGameEvent, type TInputActions} from "../logic/GameGenerator.ts";
import {isPlayer} from "../logic/Character.ts";


const checkDiagonalIsFree = (cell:TCell) => {
    const allCells = [...new Set(cell.neighbours.map(n=>n.freeNeighbours).flat())];
    const {x,y}=cell;
    return [[-1,-1],[1,-1],[-1,1],[1,1]].some(([dx,dy])=>allCells.some(c=>c.x===x+dx&&c.y===y+dy))
}
export function Cell({cell, className = "", cellEvent, characterEvent, Preview3D=false, facing=InputActions.idle}: {
    cell: TCell | undefined,
    className?: string,
    cellEvent?: TGameEvent,
    characterEvent?: TInputActions,
    Preview3D?: boolean,
    facing?: TInputActions
}) {
    // characterEvent && console.log(characterEvent,cell)
    const cellTypeToClass = () => {
        switch (cell?.type) {
            case CellTypes.start:
            case CellTypes.gate:
            case CellTypes.free:
                return "free";
            case CellTypes.door:
                return "door";
            case CellTypes.wall:
                let show = cell?.freeNeighbours.length > 0 || checkDiagonalIsFree(cell!);
                return show ? "wall" : "";
            default:
                return "";
        }
    }
    const cellTypeToContent = () => {
        const alive = cell?.characters.find(c => c.current > 0);
        if (alive) {
            if (Preview3D && facing && isPlayer(alive)) {
                switch (facing) {
                    case InputActions.moveLeft:
                        return "⬅️";
                    case InputActions.moveRight:
                        return "➡️";
                    case InputActions.moveUp:
                        return "⬆️";
                    case InputActions.moveDown:
                        return "⬇️";
                }
            }
            return alive.unicode;
        }
        if ((cell?.items.length ?? 0) > 0) {
            return cell!.items[0].unicode;
        }
        if ((cell?.characters.length ?? 0) > 0) {
            return "☠️";
        }
        switch (cell?.type) {
            case CellTypes.gate:
                return "⛩"
            case CellTypes.start:
            case CellTypes.free:
            case CellTypes.wall:
            default:
                return ""

        }
    }

    const getEventContent = () => {
        switch (cellEvent) {
            case GameEvent.damaged:
                return "💥";
            case GameEvent.blocked:
                return "🛡️"
            case GameEvent.destroyed:
            default:
                return "☁️"
        }
    }

    const getEventClass = () => {
        if (cellTypeToContent() != "☠️") {
            switch (characterEvent) {
                case InputActions.moveLeft:
                    return "left";
                case InputActions.moveRight:
                    return "right";
                case InputActions.moveUp:
                    return "up";
                case InputActions.moveDown:
                    return "down";
                default:
                    return "";
            }
        }
    }

    return <span className={[className, "cell", cellTypeToClass()].join(" ")}>
        {cell && (
            <>
                <span className={"cell inner " + getEventClass()}> {cellTypeToContent()}</span>
                {cellEvent && <span className={"event " + cellEvent}>{getEventContent()}</span>}
            </>
        )}
        </span>
}