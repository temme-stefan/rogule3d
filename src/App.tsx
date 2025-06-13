import './App.css'
import {useEffect, useState} from "react";
import {createGame, type TGame, type TInputActions, type TState} from "./logic/GameGenerator.ts";
import {GameVisualisation2D} from "./components/GameVisualisation2D.tsx";

function App() {
    const [game, setGame] = useState<TGame | null>(null)
    const [state, setState] = useState<TState | null>(null)
    const handlePlay = () => {
        setGame(createGame(new Date().toISOString()))
    }

    useEffect(() => {
        setState(game?.state ? {...game.state} : null);
    }, [game])

    const handleInput = (action: TInputActions) => {
        const newState = game!.mover(action);
        setState({...newState});
    }

    return (<>
        <header>
            <h1>Rogule 3D</h1>
        </header>
        <main>
            {<button type={"button"} onClick={handlePlay}>Play</button>}
            {state?.state == "playing" && <GameVisualisation2D game={game!} state={state!} handleInput={handleInput}/>}
        </main>
        <footer></footer>
    </>)

}

export default App
