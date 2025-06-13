import {type TGame, type TInputActions, type TState} from "../logic/GameGenerator.ts";
import './GameVisualisation2D.css'
import {Board} from "./Board.tsx";
import {InputButtons} from "./InputButtons.tsx";

export function GameVisualisation2D({game, handleInput, state}: {
    game: TGame,
    state: TState,
    handleInput: (action: TInputActions) => void
}) {
    console.log(state);
    return (
        <>
            <Board board={game.board}/>
            <InputButtons onInput={handleInput!}/>
        </>
    )
}