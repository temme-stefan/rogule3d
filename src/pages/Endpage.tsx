import type {TGame, TState} from "../logic/GameGenerator.ts";
import {HpBar} from "../components/HpBar.tsx";
import {Inventory} from "../components/Inventory.tsx";
import './Endpage.css'
export function Endpage( {restartGame,game,state}: {restartGame:()=>void, game: TGame, state:TState}) {
    let {player,seed} = game;
    player = player!
    return (
        <section className={"endscreen "+state.state}>
            <h1>The End</h1>
            <article className={"results"}>
                <div>#Rogule3D {seed}</div>
                <div>
                    <span className={"cell"}>{player.unicode}</span>
                    <span>{player.level}xp</span>
                    <span className={"cell"}>{state.state==="win"?"⛩":"☠️"}</span>
                    <span>{state.step}</span>
                    <span className={"cell" }>👣</span>
                </div>
                <HpBar total={player.hitpoints} current={player.current}/>
                <div>
                    <span className={"cell"}>⚔️</span><span> </span> {player.kills.map((k,i)=><span key={i} className={"cell"}>{k.unicode}</span>)}
                </div>
                <Inventory player={player}/>

            </article>
            <button type={"button"} className={"gameButton"} onClick={restartGame}>Play another Game</button>
        </section>
    )
}