import type {TItem} from "../logic/Item.ts";
import {UnicodeSprite3D} from "./UnicodeSprite3D.tsx";

export function Item3D({item}: { item: TItem }) {
    const onGround = !!item.cell;
    return onGround && (
        <group position={[item.cell!.x, 0.2, item.cell!.y]}>
            <UnicodeSprite3D unicode={item.unicode} fontSize={1} layFlat={false}/>
        </group>
    );
}