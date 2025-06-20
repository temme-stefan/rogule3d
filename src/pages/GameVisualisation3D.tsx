import {InputActions, type TGame, type TInputActions, type TState} from "../logic/GameGenerator.ts";
import {Players} from "../components/Players.tsx";
import {Inventory} from "../components/Inventory.tsx";
import {InputButtons} from "../components/InputButtons.tsx";
import {useCallback, useEffect, useState} from "react";
import {Board3D} from "../components3D/Board3D.tsx";
import "./GameVisualisation3D.css"
export function GameVisualisation3D({game, handleInput, state}: {
    game: TGame,
    state: TState,
    handleInput: (action: TInputActions) => void
}) {
    const [facing, setFacing] = useState<TInputActions>(InputActions.moveUp);
    const [shift, setShift] = useState<boolean>(false);
    const shiftDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "Shift") {
            setShift(true);
        }
    }, [shift, setShift]);
    const shiftUp = useCallback((e: KeyboardEvent) => {
        if (e.key === "Shift") {
            setShift(false);
        }
    }, [shift, setShift]);

    useEffect(() => {
        window.addEventListener("keydown", shiftDown);
        window.addEventListener("keyup", shiftUp);
        return () => {
            window.removeEventListener("keydown", shiftDown);
            window.removeEventListener("keyup", shiftUp);
        }
    })

    const handleInputWithFacing = (action: TInputActions) => {
        if (action != InputActions.idle) {
            setFacing(action);
        }
        if (!shift) {
            handleInput(action);
        }
    }

    return (
        <div className={"game3D"}>
            <Board3D board={game.map.board} player={game.player!} events={state.transitions} step={state.step}
                     facing={facing}/>
            <Players player={game.player!}/>
            <Inventory player={game.player!}/>
            <InputButtons onInput={handleInputWithFacing}/>
        </div>
    );
}