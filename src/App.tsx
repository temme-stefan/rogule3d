import './App.css'
import {useCallback, useEffect, useState} from "react";
import {createGame, type TGame, type TInputActions, type TState} from "./logic/GameGenerator.ts";
import {GameVisualisation2D} from "./pages/GameVisualisation2D.tsx";
import {Intro} from "./pages/Intro.tsx";
import {Endpage} from "./pages/Endpage.tsx";
import {StatefullJsonViewer} from "./components/StatefullJsonViewer.tsx";

function App() {
    const [game, setGame] = useState<TGame | null>(null)
    const [state, setState] = useState<TState | null | { state: "generating" }>(null)
    const [debug] = useState(new URLSearchParams(location.search).has("debug"))
    const handlePlay = () => {
        setState({state: "generating"});
        setGame(createGame(new URLSearchParams(location.search).get('seed') ?? new Date().toISOString()))
    }

    useEffect(() => {
        setState(game?.state ? {...game.state} : null);
    }, [game])

    const handleInput = useCallback((action: TInputActions) => {
        const newState = game!.mover(action);
        setState({...newState});
    }, [game])

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
        {debug && game && (
            <aside>
                <StatefullJsonViewer data={game}/>
            </aside>
        )}
        <footer></footer>
    </>)

}

export default App
