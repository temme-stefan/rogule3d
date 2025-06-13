import type {TCharacter} from "../logic/Character.ts";
import './Players.css'

function Player({player}: { player: TCharacter }) {
    const wounds = player.hitpoints - player.current;
    return (
        <article className={"player"}>
            <div className={"portrait cell"}>{player.unicode}</div>
            <div className={"power cell"}>{player.level}</div>
            <div className={"hp-bar"}>
                {
                    Array(player.current).fill(0)
                        .map((_, i) => <span key={i} className={"hp cell"}></span>)
                }
                {
                    Array(wounds).fill(0)
                        .map((_, i) => <span key={player.current + i} className={"hp hp-wound cell"}></span>)
                }
            </div>
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