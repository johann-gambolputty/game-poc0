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
    flip?: boolean;
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
    var cOptions: ISpriteOptions = {
        width: coalesceProperty(o => o.width, options, defaultOptions),
        height: coalesceProperty(o => o.height, options, defaultOptions),
        frameCount: coalesceProperty(o => o.frameCount, options, defaultOptions),
        fps: coalesceProperty(o => o.fps, options, defaultOptions),
        flip: coalesceProperty(o => o.flip, options, defaultOptions),
        offsetX: coalesceProperty(o => o.offsetY, options, defaultOptions),
        offsetY: coalesceProperty(o => o.offsetY, options, defaultOptions),
        scale: coalesceProperty(o => o.scale, options, defaultOptions),
        scaleX: coalesceProperty(o => nvl(o.scaleX, o.scale), options, defaultOptions),
        scaleY: coalesceProperty(o => nvl(o.scaleY, o.scale), options, defaultOptions),
        frames: coalesceProperty(o => o.frames, options, defaultOptions)
    };
    if (cOptions.frames == null) {
        cOptions.frames = [];
        for (var i = 0; i < cOptions.frameCount; ++i) {
            cOptions.frames.push({ u: i * cOptions.width, v: 0, w: cOptions.width, h: cOptions.height });
        }
    }
    return cOptions;
}
