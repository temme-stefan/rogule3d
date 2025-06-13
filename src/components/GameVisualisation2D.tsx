import {type TGame, type TInputActions, type TState} from "../logic/GameGenerator.ts";
import './GameVisualisation2D.css'
import {Board} from "./Board.tsx";
import {InputButtons} from "./InputButtons.tsx";
import {Players} from "./Players.tsx";
import {Inventory} from "./Inventory.tsx";

export function GameVisualisation2D({game, handleInput}: {
    game: TGame,
    state: TState,
    handleInput: (action: TInputActions) => void
}) {
    return (
        <>
            <Players player={game.player!}/>
            <Board board={game.board}/>
            <Inventory player={game.player!}/>
            <InputButtons onInput={handleInput!}/>
        </>
    )
}