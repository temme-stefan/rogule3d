import type {TCharacter} from "../logic/Character.ts";
import {UnicodeSprite3D} from "./UnicodeSprite3D.tsx";

export function Monster3D({monster}: { monster: TCharacter }) {
    const alive = monster.current > 0;
    return (
        <group position={[monster.cell!.x, alive ? 0.7 : 0.01, monster.cell!.y]}>
            <UnicodeSprite3D unicode={alive ? monster.unicode : "☠️"} fontSize={1} layFlat={!alive}/>
        </group>

    );
}