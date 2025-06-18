import type {TCell} from "../logic/Map.ts";
import {Cell} from "./Cell.tsx";
import './Board.css'
import type {TPlayer} from "../logic/Character.ts";
import {InputActions, type TInputActions, type TState} from "../logic/GameGenerator.ts";

export function Board({board, player, full = false, events, step}: {
    board: TCell[][],
    player: TPlayer,
    full?: boolean,
    events: TState["transitions"],
    step: TState["step"]
}) {
    const {x, y} = player.cell!
    const vision = player.vision;
    const indices = Array.from({length: 2 * vision - 1}).map((_, i) => -vision + 1 + i);
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
    console.log(characterEventMap)
    const distanceClass = (x: number, y: number) => {
        const d = Math.abs(x) + Math.abs(y);
        if (d > vision) return "far";
        if (d > vision * 0.8) return "medium";
        return "close";
    }
    return (
        <section className={"board"}>

            {!full ? indices.map(dy => <div key={dy} className={"row"}>
                    {indices.map(dx => {
                        const cell = board[dy + y]?.[dx + x]
                       return <Cell key={`${dx + x}|${dy + y}~${step}`}
                              cell={cell}
                              className={distanceClass(dx, dy)}
                              cellEvent={eventMap.get(cell)}
                              characterEvent={characterEventMap.get(cell)}
                        />
                    })}
                </div>)
                : board.map((row, y) => (
                    <div key={y} className={"row"}>
                        {row.map((cell, x) => (
                            <Cell cell={cell} key={`${x}~${y}~${step}`}
                                  cellEvent={eventMap.get(cell)}
                                  characterEvent={characterEventMap.get(cell)}/>
                        ))}
                    </div>
                ))}
        </section>
    )
}