import './App.css'
import {useState} from "react";
import {createGame, type TGame} from "./logic/GameGenerator.ts";
import {GameVisualisation2D} from "./components/GameVisualisation2D.tsx";

function App() {
    const [game,setGame] = useState<TGame|null>(null)

    const handlePlay = ()=>{
        setGame(createGame(new Date().toDateString()))
        console.log(game)
    }

    return (<>
        <header>
            <h1>Rogule 3D</h1>
        </header>
        <main >
            {!game && <button type={"button"} onClick={handlePlay}>Play</button>}
            {game && <GameVisualisation2D game={game}/>}
        </main>
        <footer></footer>
    </>)

}

export default App
