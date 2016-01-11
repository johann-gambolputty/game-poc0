
var DIRECTIONS = [
    { walkSpriteFlip: 1, defaultWalkSpriteSuffix: "-s-walk.png" },      //  SOUTH
    { walkSpriteFlip: 1, defaultWalkSpriteSuffix: "-swse-walk.png" },   //  SOUTH-EAST
    { walkSpriteFlip: 1, defaultWalkSpriteSuffix: "-ew-walk.png" },     //  EAST
    { walkSpriteFlip: 1, defaultWalkSpriteSuffix: "-nwne-walk.png" },   //  NORTH-EAST
    { walkSpriteFlip: 1, defaultWalkSpriteSuffix: "-n-walk.png" },      //  NORTH
    { walkSpriteFlip: -1, defaultWalkSpriteSuffix: "-nwne-walk.png" },  //  NORTH-WEST
    { walkSpriteFlip: -1, defaultWalkSpriteSuffix: "-ew-walk.png" },    //  WEST
    { walkSpriteFlip: -1, defaultWalkSpriteSuffix: "-swse-walk.png" }   //  SOUTH-WEST
];

function nvl(v0, v1) {
    return v0 ? v0 : v1;
}

function coalesce(src0, src1, get) {
    if (!src0) {
        return get(src1);
    }
    var src0Value = get(src0);
    return src0Value === undefined ? get(src1) : src0Value;
}

//  default image, 4 32x32 frames, 8 fps
//      sprite("test);
//  default image, 3 31x31 frames, 8 fps
//      sprite("test", { width: 31, height:31, frameCount: 4 }); 
//  sprite sheet, 1 31x31 frame at (100,100), 1 16x16 frame at (132, 100), fps: 10
//      sprite("test", { url: "abc.png", width: 31, height: 31, fps: 10, frames: [{u: 100, v:100}, { u: 132, v: 100, w: 16, h: 16}] });

function sprite(url, options) {
    var defaultOptions = { width: 32, height: 32, fps: 8, frameCount: 4, flip: 1 };
    var roptions = {
        width       : coalesce(options, defaultOptions, function (o) { return o.width;}),
        height      : coalesce(options, defaultOptions, function (o) { return o.height;}),
        frameCount  : coalesce(options, defaultOptions, function (o) { return o.frameCount; }),
        fps         : coalesce(options, defaultOptions, function (o) { return o.fps; }),
        flip        : coalesce(options, defaultOptions, function (o) { return o.flip; })
    };
    if (options && options.frames) {
        roptions.frames = options.frames;
    } else {
        roptions.frames = [];
        for (var i = 0; i< roptions.frameCount; ++i) {
            roptions.frames.push({u: i * roptions.width, v: 0, w: roptions.width, h: roptions.height });
        }
    }
    for (var i = 0; i < roptions.frames.length; ++i) {
        roptions.frames[i].u = nvl(roptions.frames[i].u, i * roptions.width);
        roptions.frames[i].v = nvl(roptions.frames[i].v, 0);
        roptions.frames[i].w = nvl(roptions.frames[i].w, roptions.width);
        roptions.frames[i].h = nvl(roptions.frames[i].h, roptions.height);
    }
    var image = new Image();
    image.src = url;

    this.fps = function () {
        return roptions.fps;
    }

    this.frames = function () {
        return roptions.frames.length;
    }

    this.render = function (context, frame, x, y) {
        if (!image.complete || image.naturalWidth === undefined || image.naturalWidth == 0) {
            return;
        }
        //  TODO: Precompute flipped sprites
        var f = roptions.frames[frame];
        //context.drawImage(image, f.u, f.v, f.w, f.h, x-Math.floor(f.w / 2), y-Math.floor(f.h / 2), f.w, f.h);
        context.save();
        context.translate(x, y);
        context.scale(roptions.flip, 1);
        context.drawImage(image, f.u, f.v, f.w, f.h, -Math.floor(f.w / 2), -Math.floor(f.h / 2), f.w, f.h);
        context.restore();
    };
}

var ANIM_ACTION_WAIT = { name: "Wait" };
var ANIM_ACTION_WALK = { name: "Walk" };

var ALL_ANIM_ACTIONS = [
    ANIM_ACTION_WALK,
    ANIM_ACTION_WAIT
];

function entityAnimationGlue(ent) {
    var lastX = ent.x();
    var lastZ = ent.z();
    return function () {
        var noMovement = lastX == ent.x() && lastZ == ent.z();
        lastX = ent.x();
        lastZ = ent.z();
        if (noMovement) {
            return {
                action: ANIM_ACTION_WAIT,
                x: ent.x(),
                y: ent.z(),
                facing: ent.facing()
            }
        }
        return {
            action: ANIM_ACTION_WALK,
            x: ent.x(),
            y: ent.z(),
            facing: ent.facing()
        };
    };
}

function buildSpriteAnimator() {
    return new function() {
        var stateToSprite = [];
        this.glue = function (action, spr, facing) {
            if (facing === undefined) {
                for (var i = 0; i < DIRECTIONS.length; ++i) {
                    this.glue(action, spr, i);
                }
            }
            else {
                //  For a given tuple (action, facing) choose a sprite
                stateToSprite.push(function (state) {
                    return state.action === action && state.facing === facing ? spr : null;
                });
            }
            return this;
        };
        this.glueWalk = function (spriteName, options) {
            //  copy (naive deep copy) options so we can set the flip variable
            var dirOptions = {};
            if (options) {
                for (var attr in options) {
                    dirOptions[attr] = options[attr];
                }
            }
            for (var i = 0; i < DIRECTIONS.length; ++i) {
                var dirInfo = DIRECTIONS[i];
                dirOptions.flip = dirInfo.walkSpriteFlip;
                this.glue(ANIM_ACTION_WALK, new sprite(spriteName + dirInfo.defaultWalkSpriteSuffix, dirOptions), i);
            }
            return this;
        };
        this.buildRenderer = function (ent) {
            return new spriteEntityActionRenderer(entityAnimationGlue(ent), stateToSprite);
        };
    };
}

function spriteEntityActionRenderer(entAnimState, actionToSprite) {
    var lastAnimState = null;
    var lastRenderTimeMs = new Date().getTime();
    var frameCounter = 0;
    function findSprite(state) {
        for (var i = 0; i < actionToSprite.length; ++i) {
            var spr = actionToSprite[i](state);
            if (spr) {
                return spr;
            }
        }
        return null;
    }
    this.render = function (context) {
        var renderTimeMs = new Date().getTime();    //  TODO: BETTER TIMER
        var animState = entAnimState();
        var spr = findSprite(animState);
        if (!spr) {
            return;
        }

        if (this.lastAnimState && animState.action === this.lastAnimState.action) {
            if ((renderTimeMs - this.lastRenderTimeMs) > (1000 / spr.fps())) {
                this.frameCounter++;
                this.lastRenderTimeMs = renderTimeMs;
            }
        }
        else {
            this.frameCounter = 0;
            this.lastRenderTimeMs = renderTimeMs;
        }
        spr.render(context, this.frameCounter % spr.frames(), animState.x, animState.y);
        this.lastAnimState = animState;
    };
}
