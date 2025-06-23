import { type TGame, type TInputActions, type TState} from "../logic/GameGenerator.ts";
import {Canvas, useThree} from "@react-three/fiber";
import './Board3D.css'
import {useEffect} from "react";
import {Stats} from "@react-three/drei";
import {Player3D} from "./Player3D.tsx";
import {Board3D} from "./Board3D.tsx";
import {Monster3D} from "./Monster3D.tsx";
import {Item3D} from "./Item3D.tsx";



export function Scene3D({game, events, step, facing}: {
    game: TGame,
    events: TState["transitions"],
    step: TState["step"]
    facing: TInputActions
}) {

    return (
        <div className={"board3D"}>
            <Canvas>
                <SceneContent3D game={game} events={events} facing={facing} step={step}/>
            </Canvas>
        </div>
    );
}


function SceneContent3D({game, events, facing, step}: {
    game: TGame,
    events: TState["transitions"],
    facing: TInputActions,
    step: TState["step"]
}) {
    const {gl} = useThree();

// Initialposition aus Game-State berechnen
    useEffect(() => {
        gl.setClearColor(0x000000, 1);
    }, [gl]);


    return (
        <>
            <ambientLight intensity={0.3}/>
            <Board3D board={game.map.board}/>
            <gridHelper args={[game.options.map.size.x, game.options.map.size.y, "#905000", "#905000"]}
                        position={[game.options.map.size.x / 2 - 0.5, 0, game.options.map.size.y / 2 - 0.5]}/>
            {game.player?.cell && <Player3D player={game.player} facing={facing}/>}
            {game.monsters.map((m, i) => (
                <Monster3D key={`monster-${i}`} monster={m}/>
            ))}
            {game.decorations.map((d, i) => (
                <Item3D key={`decoration-${i}`} item={d}/>
            ))}
            {game.treasures.map((t, i) => (
                <Item3D key={`treasure-${i}`} item={t}/>
            ))}
            <Stats/>
        </>
    )
}