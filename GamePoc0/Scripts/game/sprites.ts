var SOUTH = 0;
var SOUTH_EAST = 1;
var EAST = 2;
var NORTH_EAST = 3;
var NORTH = 4;
var NORTH_WEST = 5;
var WEST = 6;
var SOUTH_WEST = 7;

class DirectionAnimProperties {
    constructor(public walkSpriteFlip: number, public defaultWalkSpriteSuffix: string) { }
}

var DIRECTIONS = new Array<DirectionAnimProperties>();

DIRECTIONS[SOUTH] = { walkSpriteFlip: 1, defaultWalkSpriteSuffix: "-s-walk.png" },      //  0: SOUTH
DIRECTIONS[SOUTH_EAST] = { walkSpriteFlip: 1, defaultWalkSpriteSuffix: "-swse-walk.png" },   //  1: SOUTH-EAST
DIRECTIONS[EAST] = { walkSpriteFlip: 1, defaultWalkSpriteSuffix: "-ew-walk.png" },     //  2: EAST
DIRECTIONS[NORTH_EAST] = { walkSpriteFlip: 1, defaultWalkSpriteSuffix: "-nwne-walk.png" },   //  3: NORTH-EAST
DIRECTIONS[NORTH] = { walkSpriteFlip: 1, defaultWalkSpriteSuffix: "-n-walk.png" },      //  4: NORTH
DIRECTIONS[NORTH_WEST] = { walkSpriteFlip: -1, defaultWalkSpriteSuffix: "-nwne-walk.png" },  //  5: NORTH-WEST
DIRECTIONS[WEST] = { walkSpriteFlip: -1, defaultWalkSpriteSuffix: "-ew-walk.png" },    //  6: WEST
DIRECTIONS[SOUTH_WEST] = { walkSpriteFlip: -1, defaultWalkSpriteSuffix: "-swse-walk.png" }   //  7: SOUTH-WEST


function nvl<T>(v0: T, v1: T): T {
    return v0 ? v0 : v1;
}

function firstValid<TIn, TOut>(...funcs: Array<(TIn) => TOut>): (TIn)=>TOut {
    return (o: TIn): TOut => {
        for (var f in funcs) {
            var r = f(o);
            if (r) {
                return r;
            }
        }
        return null;
    };
}

function coalesce<TIn, TOut>(get: (o:TIn)=>TOut, ...objs: Array<TIn>) {
    for (var o in objs) {
        var r = get(o);
        if (r) {
            return r;
        }
    }
    return null;
}

//  default image, 4 32x32 frames, 8 fps
//      sprite("test);
//  default image, 3 31x31 frames, 8 fps
//      sprite("test", { width: 31, height:31, frameCount: 4 }); 
//  sprite sheet, 1 31x31 frame at (100,100), 1 16x16 frame at (132, 100), fps: 10
//      sprite("test", { url: "abc.png", width: 31, height: 31, fps: 10, frames: [{u: 100, v:100}, { u: 132, v: 100, w: 16, h: 16}] });

interface SpriteFrame {
    u: number;
    v: number;
    w: number;
    h: number;
}

interface ISpriteOptions {
    width?: number;
    height?: number;
    fps?: number;
    frameCount?: number;
    flip?: number;
    offsetX?: number;
    offsetY?: number;
    scale?: number;
    scaleX?: number;
    scaleY?: number;
    frames?: Array<SpriteFrame>;
}

function coalesceSpriteOptions(defaultOptions: ISpriteOptions, options: ISpriteOptions): ISpriteOptions {
    if (options == null) {
        return defaultOptions;
    }
    if (defaultOptions == null) {
        return options;
    }
    return {
        width: coalesce(o => o.width, options, defaultOptions),
        height: coalesce(o => o.height, options, defaultOptions),
        frameCount: coalesce(o => o.frameCount, options, defaultOptions),
        fps: coalesce(o => o.fps, options, defaultOptions),
        flip: coalesce(o => o.flip, options, defaultOptions),
        offsetX: coalesce(o => o.offsetY, options, defaultOptions),
        offsetY: coalesce(o => o.offsetY, options, defaultOptions),
        scale: coalesce(o => o.scale, options, defaultOptions),
        scaleX: coalesce(o => nvl(o.scaleX, o.scale), options, defaultOptions),
        scaleY: coalesce(o => nvl(o.scaleY, o.scale), options, defaultOptions)
    };
}
