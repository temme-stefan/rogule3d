import {InputActions, type TGame, type TInputActions, type TState} from "../logic/GameGenerator.ts";
import {Players} from "../components/Players.tsx";
import {Inventory} from "../components/Inventory.tsx";
import {InputButtons} from "../components/InputButtons.tsx";
import {useState} from "react";
import {Scene3D} from "../components3D/Scene3D.tsx";
import "./GameVisualisation3D.css"
import {Board} from "../components/Board.tsx";

export function GameVisualisation3D({game, handleInput, state}: {
    game: TGame,
    state: TState,
    handleInput: (action: TInputActions) => void
}) {
    const dirs = [InputActions.moveUp, InputActions.moveRight, InputActions.moveDown, InputActions.moveLeft];
    const [facing, setFacing] = useState<typeof dirs[number]>(InputActions.moveUp);


    const handleInputWithFacing = (input: { action: TInputActions, shift: boolean }) => {
        let relativeAction = input.action;
        switch (input.action) {
            case InputActions.moveUp:
                relativeAction = facing;
                break;
            case InputActions.moveDown:
                relativeAction = dirs[(dirs.indexOf(facing) + 2) % 4];
                break;
            case InputActions.moveRight:
                relativeAction = dirs[(dirs.indexOf(facing) + 1) % 4];
                break;
            case InputActions.moveLeft:
                relativeAction = dirs[(dirs.indexOf(facing) + 3) % 4];
                break;
        }
        if (relativeAction != InputActions.idle && input.shift) {
            setFacing(relativeAction);
        }
        if (!input.shift) {
            handleInput(relativeAction);
        }
    }


    return (
        <div className={"game3D"}>
            <Scene3D game={game} events={state.transitions} step={state.step}
                     facing={facing}/>
            <Players player={game.player!}/>
            <Board board={game.map.board} player={game.player!} full={false} events={[]} step={state.step} Preview3D={true} facing={facing}/>
            <Inventory player={game.player!}/>
            <InputButtons onInput={handleInputWithFacing} turnLeft={InputActions.moveLeft} turnRight={InputActions.moveRight}/>
        </div>
    );
}