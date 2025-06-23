import type {TCharacter} from "../logic/Character.ts";
import {UnicodeSprite3D} from "./UnicodeSprite3D.tsx";
import {Group, Vector3} from "three";
import {useSmoothPosition} from "./hooks/useSmoothPosition.ts";
import {useRef} from "react";

export function Monster3D({monster}: { monster: TCharacter }) {
    const group = useRef<Group>(null!);
    const alive = monster.current > 0;
    const position = new Vector3(monster!.cell!.x, alive ? 0.7 : 0.01, monster!.cell!.y);
    useSmoothPosition({targetPosition: position, positionDuration: 0.3, groupRef: group});
    return (
        <group ref={group}>
            <UnicodeSprite3D unicode={alive ? monster.unicode : "☠️"} fontSize={1} layFlat={!alive}/>
        </group>

    );
}