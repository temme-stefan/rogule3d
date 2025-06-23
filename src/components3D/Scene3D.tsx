import type {OrbitControls as OrbitControlsImpl} from 'three-stdlib'
import {InputActions, type TGame, type TInputActions, type TState} from "../logic/GameGenerator.ts";
import {Canvas, useThree} from "@react-three/fiber";
import './Board3D.css'
import {OrbitControls, Stats} from "@react-three/drei";
import {useEffect, useRef} from "react";
import {Player3D} from "./Player3D.tsx";
import {Cell3D} from "./Cell3D.tsx";
import {Monster3D} from "./Monster3D.tsx";
import {Item3D} from "./Item3D.tsx";

const cameraY = 1.5;
const targetY = 1.4;
const targetDistanz = 0.7
const cameraDistanz = 0.3
const fov = 80;

const playerToCamera = (player: TGame["player"], facing: TInputActions) => {
    const position: [number, number, number] = [0, cameraY, 0];
    const target: typeof position = [...position];
    target[1] = targetY;
    if (player?.cell) {
        position[0] = player.cell.x;
        position[2] = player.cell.y;
        target[0] = player.cell.x;
        target[2] = player.cell.y;
        switch (facing) {
            case InputActions.moveLeft:
                position[0] += cameraDistanz;
                target[0] -= targetDistanz;
                break;
            case InputActions.moveRight:
                position[0] -= cameraDistanz;
                target[0] += targetDistanz;
                break;
            case InputActions.moveUp:
                position[2] += cameraDistanz;
                target[2] -= targetDistanz;
                break;
            case InputActions.moveDown:
                position[2] -= cameraDistanz;
                target[2] += targetDistanz;
                break;
        }
    }
    return {position, target}!;
}


export function Scene3D({game, events, step, facing}: {
    game: TGame,
    events: TState["transitions"],
    step: TState["step"]
    facing: TInputActions
}) {

    return (
        <div className={"board3D"}>
            <Canvas
                camera={{position: playerToCamera(game.player, facing).position, fov: fov, far: game.player!.vision}}
            >
                <SceneContent3D game={game} events={events} step={step} facing={facing}/>
            </Canvas>
        </div>
    );
}


function SceneContent3D({game, events, step, facing}: {
    game: TGame,
    events: TState["transitions"],
    step: TState["step"]
    facing: TInputActions
}) {
    const debug = new URLSearchParams(location.search).has("debug") ?? false
    const {camera, gl} = useThree();
    const orbitControll = useRef<OrbitControlsImpl>(null);
    useEffect(() => {
        gl.setClearColor(0x000000, 1);
    }, [gl]);
    useEffect(() => {
        if (camera && orbitControll.current && game.player?.cell) {
            const {position: newPos, target: newTarget} = playerToCamera(game.player, facing);
            camera.position.set(newPos[0], newPos[1], newPos[2]);
            orbitControll.current.target.set(newTarget[0], newTarget[1], newTarget[2]);
        }
    }, [camera, orbitControll, facing, game.player?.cell])
    return (
        <>
            <ambientLight intensity={0.3}/>
            {game.map.board.map((row, y) => (
                row.map((cell, x) => (
                    <Cell3D key={`${x}|${y}}`} cell={cell}/>
                ))
            ))}
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

            <OrbitControls ref={orbitControll} enablePan={debug} enableZoom={debug} enableRotate={debug}/>
            <Stats/>
        </>
    )
}