import './HpBar.css'
export function HpBar({total, current}: { total: number, current: number }) {
    return (
        <div className={"hp-bar"}>
            {
                Array(total).fill(0)
                    .map((_, i) => <span key={i}
                                         className={"hp cell " + ((i + 1 > current) ? "hp-wound" : "")}></span>)
            }
        </div>
    )

}