import type {TCell} from "../logic/Map.ts";
import type {TPlayer} from "../logic/Character.ts";
import type {TInputActions, TState} from "../logic/GameGenerator.ts";
import {Canvas} from "@react-three/fiber";
import './Board3D.css'

export function Board3D({board, player, full = false, events, step, facing}: {
    board: TCell[][],
    player: TPlayer,
    full?: boolean,
    events: TState["transitions"],
    step: TState["step"]
    facing: TInputActions
}) {
    return (
        <div className={"board3D"}>
            <Canvas>

            </Canvas>
        </div>
    );
}