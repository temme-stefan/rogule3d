import {InputActions, type TGame, type TInputActions, type TState} from "../logic/GameGenerator.ts";
import {Players} from "../components/Players.tsx";
import {Inventory} from "../components/Inventory.tsx";
import {InputButtons} from "../components/InputButtons.tsx";
import {useState} from "react";
import {Board3D} from "../components3D/Board3D.tsx";
import "./GameVisualisation3D.css"
export function GameVisualisation3D({game, handleInput, state}: {
    game: TGame,
    state: TState,
    handleInput: (action: TInputActions) => void
}) {
    const dirs = [InputActions.moveUp, InputActions.moveRight, InputActions.moveDown, InputActions.moveLeft];
    const [facing, setFacing] = useState<typeof dirs[number]>(InputActions.moveUp);
    const [turnLeft,setTurnLeft]=useState<typeof dirs[number]>(InputActions.moveLeft);
    const [turnRight,setTurnRight]=useState<typeof dirs[number]>(InputActions.moveRight);

    const handleInputWithFacing = (input:{action: TInputActions,shift:boolean}) => {
        if (input.action != InputActions.idle) {
            setFacing(input.action);
            const i = dirs.indexOf(input.action);
            setTurnLeft(dirs[(i+3)%4])
            setTurnRight(dirs[(i+1)%4])
        }
        if (!input.shift) {
            handleInput(input.action);
        }
    }

    return (
        <div className={"game3D"}>
            <Board3D board={game.map.board} player={game.player!} events={state.transitions} step={state.step}
                     facing={facing}/>
            <Players player={game.player!}/>
            <Inventory player={game.player!}/>
            <InputButtons onInput={handleInputWithFacing} turnLeft={turnLeft} turnRight={turnRight}/>
        </div>
    );
}