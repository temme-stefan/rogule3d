import './App.css'
import {useEffect, useState} from "react";
import {createGame, type TGame, type TInputActions, type TState} from "./logic/GameGenerator.ts";
import {GameVisualisation2D} from "./pages/GameVisualisation2D.tsx";
import {Intro} from "./pages/Intro.tsx";
import {Endpage} from "./pages/Endpage.tsx";

function App() {
    const [game, setGame] = useState<TGame | null>(null)
    const [state, setState] = useState<TState | null | { state: "generating" }>(null)
    const handlePlay = () => {
        setState({state: "generating"});
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
        <main>
            {!state && <Intro startGame={handlePlay}/>}
            {state?.state === "generating" ?
                <div>Generating Game...</div>
                :
                <>
                    {state?.state === "playing" &&
                        <GameVisualisation2D game={game!} state={state!} handleInput={handleInput}/>}
                    {state && state?.state !== "playing" &&
                        <Endpage restartGame={handlePlay} game={game!} state={state!}/>}
                </>
            }

        </main>
        <footer></footer>
    </>)

}

export default App
