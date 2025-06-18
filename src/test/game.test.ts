import {describe, test, expect} from "vitest";
import {
    createGame, defaultOptions,
    InputActions,
    stringifyGame,
    type TGame,
    type TInputActions,
    type TState
} from '../logic/GameGenerator.js';
import {organicDungeonMapDefaultOptions, roomDungeonMapDefaultOptions} from "../logic/Map.ts";

describe('Game', () => {
    const seed = Date.now().toString();
    test('existence', () => expect(createGame).toBeTypeOf('function'));
    [organicDungeonMapDefaultOptions(),roomDungeonMapDefaultOptions()].forEach(mapOptions=> {
        const options = defaultOptions();
        options.map = mapOptions;

        const a = createGame(seed,options);
        const b = createGame(seed,options);
        const c = createGame(seed + "_",options);
        test(`create (${options.map.type})`, () => {

            return expect(stringifyGame(a)).to.equal(stringifyGame(b));
        });
        test(`create unequal (${options.map.type})`, () => {
            return expect(stringifyGame(a)).not.to.equal(stringifyGame(c));
        });
    })
});

describe('Gameplay', () => {
    const seed = Date.now().toString();
    const a = createGame(seed);
    const b = createGame(seed);
    const movesAvailable = Object.values(InputActions) as TInputActions[];
    const moves = Array.from({length:100}).map(()=>movesAvailable[Math.floor(Math.random()*movesAvailable.length)]);
    const events = new Map<TGame,TState["transitions"]>([[a,[]],[b,[]]]);
    [a,b].forEach(game => {
        for (const move of moves) {
            if (game.state.state=="playing"){
                const state = game.mover(move);
                const ev = events.get(game)!;
                ev.push(...state.transitions);
            }
        }
    });
    const stringifiedEvents = new Map([...events.entries()].map(
        ([game,events])=>[game,events.map(ev=>JSON.stringify({
            type:ev.type,
            cell:ev.cell.x + "|" + ev.cell.y
        }))]
    ));
    test('equal after moves', () => expect(stringifyGame(a)).toEqual(stringifyGame(b)));
    test('equal Events', ()=>expect(stringifiedEvents.get(a)).toEqual(stringifiedEvents.get(b)));
    test('equal State', ()=>expect(a.state.state).toEqual(b.state.state))


});


