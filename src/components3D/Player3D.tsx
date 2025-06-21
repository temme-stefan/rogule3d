import {InputActions, type TInputActions} from "../logic/GameGenerator.ts";
import {Group, Quaternion, Vector3} from "three";
import type {TPlayer} from "../logic/Character.ts";
import {useEffect, useRef} from "react";

const facingQuat = new Map<TInputActions, [number, number, number, number]>([
    [InputActions.moveUp, new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), 0).toArray()],
    [InputActions.moveRight, new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), -Math.PI / 2).toArray()],
    [InputActions.moveDown, new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI).toArray()],
    [InputActions.moveLeft, new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2).toArray()],
]);

export function Player3D({player, facing}: {
    player: TPlayer,
    facing: TInputActions
}) {
    const group = useRef<Group>(null!)
    useEffect(() => {
        if (group.current) {
            group.current.quaternion.fromArray(facingQuat.get(facing)!);
        }
    }, [facing])

    return (
        <group position={[player!.cell!.x, 0.5, player!.cell!.y]}
               quaternion={facingQuat.get(facing)!}
               ref={group}>
            <mesh>
                <sphereGeometry args={[0.5, 32, 32]}/>
                <meshStandardMaterial color={"#0000ff"} wireframe={false} opacity={0.5} transparent={true}/>
            </mesh>
            <axesHelper args={[1]}/>
            <pointLight position={[0, 1, 0]} intensity={player.vision + 5} distance={player!.vision * player!.vision}
                        color={"#FBE293"}/>
        </group>
    );
}