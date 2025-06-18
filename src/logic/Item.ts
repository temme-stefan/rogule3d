import {serializeCell, type TCell} from "./Map.ts";
import type {SeededRandom} from "./PseudoRandomNumberGenerator.ts";

export type TItem = {
    type: TItemTypes,
    cell?: TCell
    treasure?: TItem,
    obstacle: boolean,
    unicode: string
}

export const DecorationTypes = {
    potted_plant: 1,
    rock: 2,
    wood_block: 3
} as const;

const decorationTypes = Object.values(DecorationTypes) as (typeof DecorationTypes)[keyof typeof DecorationTypes][];


export const TreasureTypes = {
    chestnut: 1,
    mushroom: 2,
    gem_stone: 3,
    health: 4,
    shield: 5,
    dagger: 6,
    axe: 7
} as const;

const treasureTypes = Object.values(TreasureTypes) as (typeof TreasureTypes)[keyof typeof TreasureTypes][];
export const combatItems = new Set([TreasureTypes.shield, TreasureTypes.dagger, TreasureTypes.axe, TreasureTypes.health]) as Set<typeof treasureTypes[keyof typeof treasureTypes]>;
export type TItemTypes =
    typeof decorationTypes[keyof typeof decorationTypes]
    | typeof treasureTypes[keyof typeof treasureTypes];


export function createDecoration(random: SeededRandom) {
    return getDecoration(random.pickElement(decorationTypes));
}

export function createTreasure(random: SeededRandom) {
    const distribution = [
        [TreasureTypes.chestnut, 24],
        [TreasureTypes.mushroom, 12],
        [TreasureTypes.gem_stone, 3],
        [TreasureTypes.health, 12],
        [TreasureTypes.shield, 8],
        [TreasureTypes.dagger, 8],
        [TreasureTypes.axe, 6],

    ] as [TItemTypes, number][];
    return getTreasure(random.pickWeightedElement(distribution))
}

function getTreasure(type: TItemTypes): TItem {
    let unicode = "?"
    switch (type) {
        case TreasureTypes.chestnut:
            unicode = "🌰";
            break;
        case TreasureTypes.mushroom:
            unicode = "🍄";
            break;
        case TreasureTypes.gem_stone:
            unicode = "💎";
            break;
        case TreasureTypes.health:
            unicode = "🥃";
            break;
        case TreasureTypes.shield:
            unicode = "🛡️";
            break;
        case TreasureTypes.dagger:
            unicode = "🗡️";
            break;
        case TreasureTypes.axe:
            unicode = "🪓";
            break;
    }
    return {type, obstacle: false, unicode}
}

function getDecoration(type: TItemTypes): TItem {
    let unicode = "?";
    switch (type) {
        case DecorationTypes.potted_plant:
            unicode = "🪴"
            break;
        case DecorationTypes.rock:
            unicode = "🪨"
            break;
        case DecorationTypes.wood_block:
            unicode = "🪵"
            break;
    }
    return {type, obstacle: true, unicode};
}

type TSerializedItem = {
    type: TItemTypes,
    obstacle: boolean,
    unicode: string,
    cell?: ReturnType<typeof serializeCell>,
    treasure?: TSerializedItem,
}

export const serializeItem = (item: TItem): TSerializedItem => {
    return {
        type: item.type,
        obstacle: item.obstacle,
        unicode: item.unicode,
        cell: item.cell ? serializeCell(item.cell) : undefined,
        treasure: item.treasure ? serializeItem(item.treasure) : undefined,
    }
}