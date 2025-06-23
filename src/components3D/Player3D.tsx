import {InputActions, type TInputActions} from "../logic/GameGenerator.ts";
import {Group, Object3D, Vector3} from "three";
import type {TPlayer} from "../logic/Character.ts";
import { useRef} from "react";
import {PerspectiveCamera} from "@react-three/drei";
import {useFrame} from "@react-three/fiber";
import {useSmoothRotation} from "./hooks/useSmoothRotation.ts";
import {useSmoothPosition} from "./hooks/useSmoothPosition.ts";
import {UnicodeSprite3D} from "./UnicodeSprite3D.tsx";

const playerSettings = {
    playerY: 0.5,
    cameraY: 1.7,
    targetY: 1.4,
    targetDistanz: 0.7,
    cameraDistanz: 0.3,
    rotationDuration: 0.5,
    positionDuration: 0.3,
    fov: 80
};

export function Player3D({player, facing}: {
    player: TPlayer,
    facing: TInputActions
}) {
    const group = useRef<Group>(null!)
    const targetObject = useRef<Object3D>(null!)


    const {angle} = facingToCamera(facing);
    useSmoothRotation({targetAngle: angle, rotationDuration: playerSettings.rotationDuration, groupRef: group});

    const position = new Vector3(player!.cell!.x, playerSettings.playerY, player!.cell!.y);
    useSmoothPosition({targetPosition: position, positionDuration: playerSettings.positionDuration, groupRef: group});

    useFrame(({camera}) => {
        const w = new Vector3()
        targetObject.current.getWorldPosition(w)
        camera.lookAt(w);
    })

    return (
        <group ref={group}>
            <group position={[0,0.8,0]} >
            <UnicodeSprite3D unicode={player.unicode} layFlat={false} fontSize={1} opacity={0.5}/>
            </group>
            <pointLight position={[0, 1, 0]} intensity={player.vision + 5} distance={player!.vision * player!.vision}
                        color={"#FBE293"}/>
            <PerspectiveCamera position={[0, playerSettings.cameraY - playerSettings.playerY, playerSettings.cameraDistanz]} fov={playerSettings.fov} makeDefault={true}/>
            <object3D ref={targetObject} position={[0, playerSettings.targetY - playerSettings.playerY, -playerSettings.targetDistanz]}></object3D>
        </group>
    );
}




export const facingToCamera = (facing: TInputActions) => {
    let angle = 0;
    switch (facing) {
        case InputActions.moveLeft:
            angle = Math.PI / 2
            break;
        case InputActions.moveRight:
            angle = -Math.PI / 2
            break;
        case InputActions.moveUp:

            angle = 0
            break;
        case InputActions.moveDown:
            angle = Math.PI
            break;
    }
    return {angle};
}