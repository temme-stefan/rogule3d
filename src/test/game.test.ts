import {describe, test, expect} from "vitest";
import {
    createGame,
    InputActions,
    stringifyGame,
    type TGame,
    type TInputActions,
    type TState
} from '../logic/GameGenerator.js';

describe('Game', () => {
    const seed = Date.now().toString();
    const a = createGame(seed);
    const b = createGame(seed);
    const c = createGame(seed + "_");
    test('existence', () => expect(createGame).toBeTypeOf('function'))
    test('create', () => {

        return expect(stringifyGame(a)).to.equal(stringifyGame(b));
    });
    test('create unequal', () => {
        return expect(stringifyGame(a)).not.to.equal(stringifyGame(c));
    });
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


