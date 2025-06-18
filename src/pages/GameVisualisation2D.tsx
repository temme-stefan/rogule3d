import {type TGame, type TInputActions, type TState} from "../logic/GameGenerator.ts";
import './GameVisualisation2D.css'
import {Board} from "../components/Board.tsx";
import {InputButtons} from "../components/InputButtons.tsx";
import {Players} from "../components/Players.tsx";
import {Inventory} from "../components/Inventory.tsx";
import {useState} from "react";

export function GameVisualisation2D({game, handleInput, state}: {
    game: TGame,
    state: TState,
    handleInput: (action: TInputActions) => void
}) {
    const [full] = useState(new URLSearchParams(location.search).has("full") ?? false)
    return (
        <>
            <Players player={game.player!}/>
            <Board board={game.map.board} player={game.player!} full={full} events={state.transitions} step={state.step}/>
            <Inventory player={game.player!}/>
            <InputButtons onInput={handleInput!}/>
        </>
    )
}