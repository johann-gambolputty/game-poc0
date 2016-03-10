var SOUTH = 0;
var SOUTH_EAST = 1;
var EAST = 2;
var NORTH_EAST = 3;
var NORTH = 4;
var NORTH_WEST = 5;
var WEST = 6;
var SOUTH_WEST = 7;
var DirectionAnimProperties = (function () {
    function DirectionAnimProperties(walkSpriteFlip, defaultWalkSpriteSuffix) {
        this.walkSpriteFlip = walkSpriteFlip;
        this.defaultWalkSpriteSuffix = defaultWalkSpriteSuffix;
    }
    return DirectionAnimProperties;
})();
var DIRECTIONS = new Array();
DIRECTIONS[SOUTH] = { walkSpriteFlip: 1, defaultWalkSpriteSuffix: "-s-walk.png" },
    DIRECTIONS[SOUTH_EAST] = { walkSpriteFlip: 1, defaultWalkSpriteSuffix: "-swse-walk.png" },
    DIRECTIONS[EAST] = { walkSpriteFlip: 1, defaultWalkSpriteSuffix: "-ew-walk.png" },
    DIRECTIONS[NORTH_EAST] = { walkSpriteFlip: 1, defaultWalkSpriteSuffix: "-nwne-walk.png" },
    DIRECTIONS[NORTH] = { walkSpriteFlip: 1, defaultWalkSpriteSuffix: "-n-walk.png" },
    DIRECTIONS[NORTH_WEST] = { walkSpriteFlip: -1, defaultWalkSpriteSuffix: "-nwne-walk.png" },
    DIRECTIONS[WEST] = { walkSpriteFlip: -1, defaultWalkSpriteSuffix: "-ew-walk.png" },
    DIRECTIONS[SOUTH_WEST] = { walkSpriteFlip: -1, defaultWalkSpriteSuffix: "-swse-walk.png" }; //  7: SOUTH-WEST
function coalesceSpriteOptions(defaultOptions, options) {
    if (options == null) {
        return defaultOptions;
    }
    if (defaultOptions == null) {
        return options;
    }
    var cOptions = {
        width: coalesceProperty(function (o) { return o.width; }, options, defaultOptions),
        height: coalesceProperty(function (o) { return o.height; }, options, defaultOptions),
        frameCount: coalesceProperty(function (o) { return o.frameCount; }, options, defaultOptions),
        fps: coalesceProperty(function (o) { return o.fps; }, options, defaultOptions),
        flip: coalesceProperty(function (o) { return o.flip; }, options, defaultOptions),
        offsetX: coalesceProperty(function (o) { return o.offsetY; }, options, defaultOptions),
        offsetY: coalesceProperty(function (o) { return o.offsetY; }, options, defaultOptions),
        scale: coalesceProperty(function (o) { return o.scale; }, options, defaultOptions),
        scaleX: coalesceProperty(function (o) { return nvl(o.scaleX, o.scale); }, options, defaultOptions),
        scaleY: coalesceProperty(function (o) { return nvl(o.scaleY, o.scale); }, options, defaultOptions),
        frames: coalesceProperty(function (o) { return o.frames; }, options, defaultOptions)
    };
    if (cOptions.frames == null) {
        cOptions.frames = [];
        for (var i = 0; i < cOptions.frameCount; ++i) {
            cOptions.frames.push({ u: i * cOptions.width, v: 0, w: cOptions.width, h: cOptions.height });
        }
    }
    return cOptions;
}
//# sourceMappingURL=sprites.js.map