import type {TCharacter} from "../logic/Character.ts";
import './Players.css'
import {HpBar} from "./HpBar.tsx";

function Player({player}: { player: TCharacter }) {
    const current = player.current
    const total = player.hitpoints;
    return (
        <article className={"player"}>
            <div className={"portrait cell"}>{player.unicode}</div>
            <div className={"power cell"}>{player.level}</div>
            <HpBar current={current} total={total}/>
        </article>
    );
}

export function Players({player}: { player: TCharacter }) {
    const adjacent = player.cell?.freeNeighbours
        .filter(n => n.characters.length > 0 && n.characters.some(c => c.current > 0))
        .map(n => n.characters.filter(c => c.current > 0)[0]);

    return <section className={"players"}>
        <Player player={player}/>
        {adjacent?.map((n, i) => <Player player={n!} key={i}/>)}
    </section>;
}