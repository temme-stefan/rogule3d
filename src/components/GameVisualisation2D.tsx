import {type TGame} from "../logic/GameGenerator.ts";
import './GameVisualisation2D.css'
import {Board} from "./Board.tsx";

export function GameVisualisation2D({game}: { game: TGame }) {
    return (
        <section>
            <Board board={game.board}/>
        </section>
    )
}