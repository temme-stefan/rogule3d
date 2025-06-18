import {CellTypes, type TCell} from "../logic/Map.ts";
import "./Cell.css"
import {GameEvent, InputActions, type TGameEvent, type TInputActions} from "../logic/GameGenerator.ts";

export function Cell({cell, className = "", cellEvent, characterEvent}: {
    cell: TCell | undefined,
    className?: string,
    cellEvent?: TGameEvent,
    characterEvent?: TInputActions
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
                const show = (cell?.freeNeighbours.length > 0 || cell?.neighbours.filter(n => n.freeNeighbours.length > 0).length > 1);
                return show ? "wall" : "";
            default:
                return "";
        }
    }
    const cellTypeToContent = () => {
        const alive = cell?.characters.find(c => c.current > 0);
        if (alive) {
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