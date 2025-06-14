import type {TPlayer} from "../logic/Character.ts";
import './Inventory.css'
import {combatItems} from "../logic/TItem.ts";

export function Inventory({player, hideCombatGear = false, empties = 0}: {
    player: TPlayer,
    hideCombatGear?: boolean,
    empties?: number
}) {
    const items = [...player.inventory].filter(i => !hideCombatGear || !combatItems.has(i.type))
        .sort((a, b) => (a.type as number) - (b.type as number));
    return <section className={"inventory"}>
        {items.map(((item, i) => <article key={i} className={"cell"}>{item.unicode}</article>))}
        {Array.from({length: empties}).map((_, i) => <article key={items.length + i}
                                                              className={"cell empty"}></article>)}
    </section>;
}