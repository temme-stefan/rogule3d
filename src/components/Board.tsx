import type {TCell} from "../logic/Map.ts";
import {Cell} from "./Cell.tsx";
import './Board.css'
export function Board({board}:{board:TCell[][]}) {
    return (
        <section className={"board"}>
            {board.map((row, y) => (
                <div key={y} className={"row"}>
                    {row.map((cell, x) => (
                        <Cell cell={cell} key={x}/>
                    ))}
                </div>
            ))}
        </section>
    )
}