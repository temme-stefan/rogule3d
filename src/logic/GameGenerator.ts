import {SeededRandom} from "./PseudoRandomNumberGenerator.ts";

export const defaultOptions = {
    size:{
        x:30,
        y:30
    },
    density:60,
    enemies:{
        min:5,
        max:5
    },
    decorations:{
        min:3,
        max:10
    },
    treasures:{
        min:1,
        max:10
    },

}


export function createGame(seed:string,options:typeof defaultOptions=defaultOptions){
    const game = {seed,random:new SeededRandom(seed),board:[[0]],options}
    game.board = Array(options.size.y).fill(0).map(()=>Array(options.size.x).fill(0));
    for(let y=0;y<options.size.y;y++){
        for(let x=0;x<options.size.x;x++){
            if (y===0 || y===options.size.y-1 || x===0 || x===options.size.x-1){
                game.board[y][x] = 0;
                continue;
            }
            game.board[y][x] = game.random.chance(options.density/100) ? 1 : 0;
        }
    }
    console.log(game);
    return game;
}

export type TGame = ReturnType<typeof createGame>;