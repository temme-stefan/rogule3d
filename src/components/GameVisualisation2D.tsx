import {CellTypes, type TCell, type TGame} from "../logic/GameGenerator.ts";
import './GameVisualisation2D.css'

export function GameVisualisation2D({game}: { game: TGame }) {
    const cellTypeToClass = (c:TCell)=>{
        switch (c.type){
            case CellTypes.start:
            case CellTypes.gate:
            case CellTypes.free:
                return "free";
            case CellTypes.door:
                return "door";
            case CellTypes.wall:
                const show = (c.freeNeighbours.length>0 || c.neighbours.filter(n=>n.freeNeighbours.length>0).length>1);
                return  show ? "wall" :"";

        }
    }

    const cellTypeToContent = (c:TCell)=>{
        switch (c.type){
            case CellTypes.start:
                return "🧝"
            case CellTypes.gate:
                return "⛩"
            case CellTypes.free:
            case CellTypes.wall:
                return ""

        }
    }

    return (
        <section>
            <article className={"board"}>
                {game.board.map((row, y) => (
                    <div key={y}>
                        {row.map((cell, x) => (
                            <span key={x} className={cellTypeToClass(cell)}>{cellTypeToContent(cell)}</span>
                        ))}
                    </div>
                ))}
            </article>
        </section>
    )
}