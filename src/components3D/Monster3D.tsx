import type {TCharacter} from "../logic/Character.ts";

export function Monster3D({monster}: { monster: TCharacter }) {
    const alive = monster.current > 0;
    return (
        <mesh position={[monster.cell!.x, alive?0.5:0, monster.cell!.y]}>
            <sphereGeometry args={[0.5, 32, 32]}/>
            <meshStandardMaterial color={"#ff0000"} wireframe={false} opacity={0.5} transparent={true}/>
        </mesh>
    );
}