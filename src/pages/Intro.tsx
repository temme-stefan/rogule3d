import './Intro.css'
export function Intro({startGame}: { startGame: () => void }) {
    return <section className={"intro"}>
        <h1>Welcome to Rogule 3D</h1>
        <article>
            Inspired by the great <a href={"https://rogule.com/"} rel={"external"}>Rogule</a> by <a
            href={"https://mccormick.cx/"} rel={"external"}>Chris McCormick</a> this is a try to rebuild it with
            a 3D Visualisation.
        </article>
        <article>
            You can follow my thoughts on this project on <a href={"https://ruhr.social/@codingdad/114670776689158070"} rel={"external"}>Mastodon</a> (German)./
        </article>
        <button type={"button"} className={"gameButton"} onClick={startGame}>Start a new game</button>
    </section>;
}