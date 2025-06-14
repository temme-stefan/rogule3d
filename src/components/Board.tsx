import type {TCell} from "../logic/Map.ts";
import {Cell} from "./Cell.tsx";
import './Board.css'
import type {TPlayer} from "../logic/Character.ts";

export function Board({board, player, full = false}: { board: TCell[][], player: TPlayer, full?: boolean }) {
    const {x, y} = player.cell!
    const vision = player.vision;
    const indices = Array.from({length: 2 * vision - 1}).map((_, i) => -vision + 1 + i);
    const distanceClass = (x: number, y: number) => {
        const d = Math.abs(x) + Math.abs(y);
        if (d > vision) return "far";
        if (d > vision * 0.8) return "medium";
        return "close";
    }
    return (
        <section className={"board"}>

            {!full ? indices.map(dy => <div key={dy} className={"row"}>
                    {indices.map(dx => <Cell key={`${dx + x}-${dy + y}`} cell={board[dy + y]?.[dx + x]}
                                             className={distanceClass(dx, dy)}/>)}
                </div>)
                : board.map((row, y) => (
                    <div key={y} className={"row"}>
                        {row.map((cell, x) => (
                            <Cell cell={cell} key={x}/>
                        ))}
                    </div>
                ))}
        </section>
    )
}