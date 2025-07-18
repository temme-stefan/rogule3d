import {serializeItem, type TItem} from "./Item.ts";
import {serializeCell, type TCell} from "./Map.ts";
import type {SeededRandom} from "./PseudoRandomNumberGenerator.ts";

export type TCharacter = {
    type: TCharacterTypes,
    exp: number,
    readonly level: number,
    vision: number
    cell?: TCell
    treasure?: TItem,
    hitpoints: number,
    current: number,
    counter?: number
    unicode: string,
}

export type TPlayer = TCharacter & {
    player: true
    inventory: TItem[]
    kills: TCharacter[];
}

export const isPlayer = (character: TCharacter): character is TPlayer => {
    return Object.keys(character).includes("inventory");
}
export const CharacterTypes = {
    elf: 1,
    rat: 2,
    bat: 3,
    boar: 4,
    ghost: 5,
    wolf: 6,
    zombie: 8,
    vampire: 9,
    trex: 10,
    dragon: 11,
    ogre: 12,
    genie: 13
} as const;
export type TCharacterTypes = typeof CharacterTypes[keyof typeof CharacterTypes]
export const monsterTypes = Object.values(CharacterTypes).filter(c => c != CharacterTypes.elf) as TCharacterTypes[];

const monsterTypesByStrength = monsterTypes.map(getMonstertypDefaults)
    .sort((a, b) => a.exp == b.exp ? (a.hitpoints! - b.hitpoints!) : (a.exp! - b.exp!))
    .map(m => m.type) as TCharacterTypes[];

export function createCharacter(player: boolean, random: SeededRandom, difficulty: number = 1) {
    if (player) {
        const p = getMonstertypDefaults(CharacterTypes.elf) as TPlayer;
        p.player = true;
        Object.defineProperty(p, "level", {get: () => 1 + Math.floor((-1 + Math.sqrt(1 + 8 * p.exp)) / 2)});
        p.counter = 0;
        p.inventory = [];
        p.kills = [];
        return p;
    }
    const targetIndex = Math.floor(monsterTypesByStrength.length * difficulty);

    const weightedMonsterSubtable: [TCharacterTypes, number][] =
        [[-2, 1], [-1, 2], [0, 6], [1, 2], [2, 1]]
            .map(([offset, weight]) => [Math.min(Math.max(0, targetIndex + offset), monsterTypesByStrength.length - 1), weight])
            .map(([index, weight]) => [monsterTypesByStrength[index], weight]);

    const m = getMonstertypDefaults(random.pickWeightedElement(weightedMonsterSubtable));
    Object.defineProperty(m, "level", {get: () => m.exp});
    return m as TCharacter;


}

function getMonstertypDefaults(type: TCharacterTypes): Partial<TCharacter> {
    switch (type) {
        case CharacterTypes.elf:
            return {type, exp: 3, hitpoints: 10, current: 10, vision: 9, unicode: "🧝"};
        case CharacterTypes.rat:
            return {type, exp: 1, hitpoints: 2, current: 2, vision: 3, unicode: "🐀"};
        case CharacterTypes.bat:
            return {type, exp: 2, hitpoints: 3, current: 3, vision: 10, unicode: "🦇"};
        case CharacterTypes.boar:
            return {type, exp: 3, hitpoints: 4, current: 4, vision: 15, unicode: "🐗"};
        case CharacterTypes.ghost:
            return {type, exp: 3, hitpoints: 3, current: 3, vision: 10, unicode: "👻"};
        case CharacterTypes.wolf:
            return {type, exp: 4, hitpoints: 5, current: 5, vision: 20, unicode: "🐺"};
        case CharacterTypes.ogre:
            return {type, exp: 4, hitpoints: 7, current: 7, vision: 10, unicode: "👹"};
        case CharacterTypes.genie:
            return {type, exp: 6, hitpoints: 10, current: 10, vision: 20, unicode: "🧞"};
        case CharacterTypes.zombie:
            return {type, exp: 5, hitpoints: 9, current: 9, vision: 5, unicode: "🧟"};
        case CharacterTypes.vampire:
            return {type, exp: 6, hitpoints: 8, current: 8, vision: 15, unicode: "🧛"};
        case CharacterTypes.dragon:
            return {type, exp: 8, hitpoints: 15, current: 15, vision: 10, unicode: "🐉"};
        case CharacterTypes.trex:
            return {type, exp: 10, hitpoints: 12, current: 12, vision: 15, unicode: "🦖"};
    }
}


type TSerializedChar = {
    type: TCharacterTypes,
    exp: number,
    vision: number,
    hitpoints: number,
    current: number,
    unicode: string,
    cell: ReturnType<typeof serializeCell>,
    player: boolean,
    inventory: ReturnType<typeof serializeItem>[],
    kills: TSerializedChar[]
}
export const serializeCharacter = (character: TCharacter) => {
    const base: TSerializedChar = {
        type: character.type,
        exp: character.exp,
        vision: character.vision,
        hitpoints: character.hitpoints,
        current: character.current,
        unicode: character.unicode,
        cell: serializeCell(character.cell!),
        player: false,
        inventory: [],
        kills: [],
    }
    if (isPlayer(character)) {
        base.player = character.player;
        base.inventory = character.inventory.map(serializeItem);
        base.kills = character.kills.map(serializeCharacter);
    }
    return base
}