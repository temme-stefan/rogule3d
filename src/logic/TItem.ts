import type {TCell} from "./Map.ts";
import type {SeededRandom} from "./PseudoRandomNumberGenerator.ts";

export type TItem = {
    type: TItemTypes,
    cell?: TCell
    treasure?: TItem,
    obstacle: boolean,
    unicode:string
}

export const DecorationTypes = {
    potted_plant: 1,
    rock: 2,
    wood_block: 3
};

const decorationTypes = Object.values(DecorationTypes) as (typeof DecorationTypes)[keyof typeof DecorationTypes][];


export const treasureTypes = {

}

export type TItemTypes = typeof decorationTypes[keyof typeof decorationTypes] | typeof treasureTypes[keyof typeof treasureTypes];


export function createDecoration(random: SeededRandom) {
    return getDecoration(random.pickElement(decorationTypes));
}

function getDecoration(type:typeof decorationTypes[keyof typeof decorationTypes]):TItem {
    let unicode = "?";
    switch (type){
        case DecorationTypes.potted_plant:
            unicode="🪴"
            break;
        case DecorationTypes.rock:
            unicode="🪨"
            break;
        case DecorationTypes.wood_block:
            unicode="🪵"
            break;
    }
    return {type, obstacle: true, unicode};
}