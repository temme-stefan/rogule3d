import {type TGame, type TInputActions, type TState} from "../logic/GameGenerator.ts";
import './GameVisualisation2D.css'
import {Board} from "../components/Board.tsx";
import {InputButtons} from "../components/InputButtons.tsx";
import {Players} from "../components/Players.tsx";
import {Inventory} from "../components/Inventory.tsx";
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