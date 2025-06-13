import type {TPlayer} from "../logic/Character.ts";
import './Inventory.css'
export function Inventory({player}: { player: TPlayer }) {
    return <section className={"inventory"}>
        {player.inventory.map(((item,i)=><article key={i} className={"cell"}>{item.unicode}</article>))}
    </section>;
}