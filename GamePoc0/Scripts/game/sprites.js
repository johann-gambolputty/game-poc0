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
function nvl(v0, v1) {
    return v0 ? v0 : v1;
}
function firstValid() {
    var funcs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        funcs[_i - 0] = arguments[_i];
    }
    return function (o) {
        for (var f in funcs) {
            var r = f(o);
            if (r) {
                return r;
            }
        }
        return null;
    };
}
function coalesce(get) {
    var objs = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        objs[_i - 1] = arguments[_i];
    }
    for (var o in objs) {
        var r = get(o);
        if (r) {
            return r;
        }
    }
    return null;
}
function coalesceSpriteOptions(defaultOptions, options) {
    if (options == null) {
        return defaultOptions;
    }
    if (defaultOptions == null) {
        return options;
    }
    return {
        width: coalesce(function (o) { return o.width; }, options, defaultOptions),
        height: coalesce(function (o) { return o.height; }, options, defaultOptions),
        frameCount: coalesce(function (o) { return o.frameCount; }, options, defaultOptions),
        fps: coalesce(function (o) { return o.fps; }, options, defaultOptions),
        flip: coalesce(function (o) { return o.flip; }, options, defaultOptions),
        offsetX: coalesce(function (o) { return o.offsetY; }, options, defaultOptions),
        offsetY: coalesce(function (o) { return o.offsetY; }, options, defaultOptions),
        scale: coalesce(function (o) { return o.scale; }, options, defaultOptions),
        scaleX: coalesce(function (o) { return nvl(o.scaleX, o.scale); }, options, defaultOptions),
        scaleY: coalesce(function (o) { return nvl(o.scaleY, o.scale); }, options, defaultOptions)
    };
}
