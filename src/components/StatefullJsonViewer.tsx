import type {TGame} from "../logic/GameGenerator.ts";
import {defaultStyles, JsonView, collapseAllNested} from "react-json-view-lite";
import 'react-json-view-lite/dist/index.css';

export function StatefullJsonViewer({data}: { data: TGame }) {
    return <JsonView data={data}
                     shouldExpandNode={collapseAllNested}
                     clickToExpandNode={true}
                     style={defaultStyles}/>;
}