import type {TPlayer} from "../logic/Character.ts";
import './Inventory.css'
export function Inventory({player}: { player: TPlayer }) {
    const items = [...player.inventory].sort((a,b)=>(a.type as number) - (b.type as number) );
    return <section className={"inventory"}>
        {items.map(((item,i)=><article key={i} className={"cell"}>{item.unicode}</article>))}
    </section>;
}