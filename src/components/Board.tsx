import type {TCell, TMap} from "../logic/Map.ts";
import {Cell} from "./Cell.tsx";
import './Board.css'
import type {TPlayer} from "../logic/Character.ts";
import {InputActions, type TInputActions, type TState} from "../logic/GameGenerator.ts";

export function Board({board, player, full = false, events, step, Preview3D = false, facing}: {
    board: TCell[][],
    player: TPlayer,
    full?: boolean,
    events: TState["transitions"],
    step: TState["step"]
    Preview3D?: boolean,
    facing?: TInputActions
}) {
    const eventMap = new Map(events.map(ev => [ev.cell, ev.type]));
    const characterEventMap = new Map(events.filter(ev => ev.character).map(ev => {
        const from = ev.character!.cell!;
        const target = ev.cell;
        let direction: TInputActions;
        if (from.x === target.x) {
            direction = from.y < target.y ? InputActions.moveDown : InputActions.moveUp;
        } else {
            direction = from.x < target.x ? InputActions.moveRight : InputActions.moveLeft;
        }
        return [from, direction]
    }));

    return (
        <section className={"board"}>
            {!full ?
                <FogOfWarBoard
                    board={board}
                    player={player}
                    eventMap={eventMap}
                    characterEventMap={characterEventMap}
                    step={step}
                    Preview3D={Preview3D}
                    facing={facing}
                /> :
                <FullBoard
                    board={board}
                    eventMap={eventMap}
                    characterEventMap={characterEventMap}
                    step={step}
                />
            }
        </section>
    )
}

function FogOfWarBoard({board, player, eventMap, characterEventMap, step, Preview3D=false, facing=InputActions.idle}: {
    board: TCell[][],
    player: TPlayer,
    eventMap: Map<TCell, TState["transitions"][0]["type"]>,
    characterEventMap: Map<TCell, TInputActions>,
    step: number,
    Preview3D?: boolean,
    facing?: TInputActions
}) {
    const {x, y} = player.cell!;
    const vision = player.vision;
    const indices = Array.from({length: 2 * vision - 1}).map((_, i) => -vision + 1 + i);

    const distanceClass = (dx: number, dy: number) => {
        const d = Math.abs(dx) + Math.abs(dy);
        if (d > vision) return "far";
        if (d > vision * 0.8) return "medium";
        return "close";
    }

    return (
        <>
            {indices.map(dy =>
                <div key={dy} className={"row"}>
                    {indices.map(dx => {
                        const cell = board[dy + y]?.[dx + x]
                        return <Cell key={`${dx + x}|${dy + y}~${step}`}
                                     cell={cell}
                                     className={distanceClass(dx, dy)}
                                     cellEvent={eventMap.get(cell)}
                                     characterEvent={characterEventMap.get(cell)}
                                     Preview3D={Preview3D}
                                     facing={facing}
                        />
                    })}
                </div>
            )}
        </>
    )
}

function FullBoard({board, eventMap, characterEventMap, step}: {
    board: TMap["board"],
    eventMap: Map<TCell, TState["transitions"][0]["type"]>,
    characterEventMap: Map<TCell, TInputActions>,
    step: number
}) {
    return (
        <>
            {board.map((row, y) => (
                <div key={y} className={"row"}>
                    {row.map((cell, x) => (
                        <Cell cell={cell} key={`${x}~${y}~${step}`}
                              cellEvent={eventMap.get(cell)}
                              characterEvent={characterEventMap.get(cell)}
                        />
                    ))}
                </div>
            ))}
        </>
    )
}