import {useEffect} from "react";
import './InputButtons.css'
import {InputActions, type TInputActions} from "../logic/GameGenerator.ts";
import {ArrowLeft} from "./svg/ArrowLeft.tsx";
import {ArrowUp} from "./svg/ArrowUp.tsx";
import {ArrowDown} from "./svg/ArrowDown.tsx";
import {ArrowRight} from "./svg/ArrowRight.tsx";
import {Circle} from "./svg/Circle.tsx";
export function InputButtons({onInput}: { onInput: (action: TInputActions) => void }) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            let catched = false;
            switch (e.key) {
                case "ArrowUp":
                    onInput(InputActions.moveUp);
                    catched = true;
                    break;
                case "ArrowDown":
                    onInput(InputActions.moveDown);
                    catched = true;
                    break;
                case "ArrowLeft":
                    onInput(InputActions.moveLeft);
                    catched = true;
                    break;
                case "ArrowRight":
                    onInput(InputActions.moveRight);
                    catched = true;
                    break;
                case " ":
                    onInput(InputActions.idle);
                    catched = true;
                    break;
                default:
                    break;
            }
            if (catched) {
                e.preventDefault();
                e.stopPropagation();
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        }
    },[onInput])
    return <section className={"input-buttons"}>
        <button className={"up"} onClick={() => onInput(InputActions.moveUp)}>Up <ArrowUp/></button>
        <button className={"down"} onClick={() => onInput(InputActions.moveDown)}>Down <ArrowDown/></button>
        <button className={"left"} onClick={() => onInput(InputActions.moveLeft)}>Left <ArrowLeft/> </button>
        <button className={"right"} onClick={() => onInput(InputActions.moveRight)}>Right <ArrowRight/></button>
        <button className={"idle"} onClick={() => onInput(InputActions.idle)}>Idle <Circle/></button>


    </section>;
}