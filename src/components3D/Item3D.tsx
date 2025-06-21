import type {TItem} from "../logic/Item.ts";

export function Item3D({item}: { item: TItem }) {
    const onGround = !!item.cell;
    return onGround && (
        <mesh position={[item.cell!.x, 0, item.cell!.y]}>
            <sphereGeometry args={[0.5, 32, 32]}/>
            <meshStandardMaterial color={"#00ff00"} wireframe={false} opacity={0.5} transparent={true}/>
        </mesh>
    );
}