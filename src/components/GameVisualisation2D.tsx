import type {TGame} from "../logic/GameGenerator.ts";
import './GameVisualisation2D.css'

export function GameVisualisation2D({game}: { game: TGame }) {
    return (
        <section>
            <article className={"board"}>
                {game.board.map((row, y) => (
                    <div key={y}>
                        {row.map((cell, x) => (
                            <span key={x} className={cell==1?"free":"wall"}></span>
                        ))}
                    </div>
                ))}
            </article>
        </section>
    )
}