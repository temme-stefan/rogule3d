import {useCallback, useEffect, useState} from "react";
import './InputButtons.css'
import {InputActions, type TInputActions} from "../logic/GameGenerator.ts";
import {ArrowLeft} from "./svg/ArrowLeft.tsx";
import {ArrowUp} from "./svg/ArrowUp.tsx";
import {ArrowDown} from "./svg/ArrowDown.tsx";
import {ArrowRight} from "./svg/ArrowRight.tsx";
import {Circle} from "./svg/Circle.tsx";
import {RotateLeft} from "./svg/RotateLeft.tsx";
import {RotateRight} from "./svg/RotateRight.tsx";

export function InputButtons({onInput, turnLeft, turnRight}: {
    onInput: (input: { action: TInputActions, shift: boolean }) => void,
    turnLeft?: TInputActions,
    turnRight?: TInputActions,
}) {
    const [shift, setShift] = useState<boolean>(false);

    const shiftUp = useCallback((e: KeyboardEvent) => {
        if (e.key === "Shift") {
            setShift(false);
        }
    }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "Shift") {
            setShift(true);
        }
        let catched = false;
        switch (e.key) {
            case "ArrowUp":
                handleInput(InputActions.moveUp);
                catched = true;
                break;
            case "ArrowDown":
                handleInput(InputActions.moveDown);
                catched = true;
                break;
            case "ArrowLeft":
                handleInput(InputActions.moveLeft);
                catched = true;
                break;
            case "ArrowRight":
                handleInput(InputActions.moveRight);
                catched = true;
                break;
            case ".":
                handleInput(InputActions.idle);
                catched = true;
                break;
            default:
                break;
        }
        if (catched) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, [onInput])

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", shiftUp);
        return () => {
            window.removeEventListener("keyup", shiftUp);
            window.removeEventListener("keydown", handleKeyDown);
        }
    })

    const handleInput = useCallback((action: TInputActions) => {
        onInput({action, shift});
    }, [onInput]);

    return <section className={"input-buttons"}>
        <button className={"up"}
                onClick={() => onInput({action: InputActions.moveUp, shift: false})}>Up <ArrowUp/></button>
        <button className={"down"}
                onClick={() => onInput({action: InputActions.moveDown, shift: false})}>Down <ArrowDown/></button>
        <button className={"left"}
                onClick={() => onInput({action: InputActions.moveLeft, shift: false})}>Left <ArrowLeft/></button>
        <button className={"right"}
                onClick={() => onInput({action: InputActions.moveRight, shift: false})}>Right <ArrowRight/></button>
        <button className={"idle"}
                onClick={() => onInput({action: InputActions.idle, shift: false})}>Idle <Circle/></button>
        {turnLeft &&
            <button className={"turn-left"}
                    onClick={() => onInput({action: turnLeft, shift: true})}> Turn Left <RotateLeft/></button>}
        {turnRight &&
            <button className={"turn-right"}
                    onClick={() => onInput({action: turnRight, shift: true})}>Turn Right <RotateRight/></button>}


    </section>;
}