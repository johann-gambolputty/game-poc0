var SOUTH = 0;
var SOUTH_EAST = 1;
var EAST = 2;
var NORTH_EAST = 3;
var NORTH = 4;
var NORTH_WEST = 5;
var WEST = 6;
var SOUTH_WEST = 7;


var DIRECTIONS = [];

DIRECTIONS[SOUTH]       = { walkSpriteFlip: 1, defaultWalkSpriteSuffix: "-s-walk.png" },      //  0: SOUTH
DIRECTIONS[SOUTH_EAST]  = { walkSpriteFlip: 1, defaultWalkSpriteSuffix: "-swse-walk.png" },   //  1: SOUTH-EAST
DIRECTIONS[EAST]        = { walkSpriteFlip: 1, defaultWalkSpriteSuffix: "-ew-walk.png" },     //  2: EAST
DIRECTIONS[NORTH_EAST]  = { walkSpriteFlip: 1, defaultWalkSpriteSuffix: "-nwne-walk.png" },   //  3: NORTH-EAST
DIRECTIONS[NORTH]       = { walkSpriteFlip: 1, defaultWalkSpriteSuffix: "-n-walk.png" },      //  4: NORTH
DIRECTIONS[NORTH_WEST]  = { walkSpriteFlip: -1, defaultWalkSpriteSuffix: "-nwne-walk.png" },  //  5: NORTH-WEST
DIRECTIONS[WEST]        = { walkSpriteFlip: -1, defaultWalkSpriteSuffix: "-ew-walk.png" },    //  6: WEST
DIRECTIONS[SOUTH_WEST]  = { walkSpriteFlip: -1, defaultWalkSpriteSuffix: "-swse-walk.png" }   //  7: SOUTH-WEST

//var DIRECTIONS = [
//    { walkSpriteFlip: 1, defaultWalkSpriteSuffix: "-s-walk.png" },      //  0: SOUTH
//    { walkSpriteFlip: 1, defaultWalkSpriteSuffix: "-swse-walk.png" },   //  1: SOUTH-EAST
//    { walkSpriteFlip: 1, defaultWalkSpriteSuffix: "-ew-walk.png" },     //  2: EAST
//    { walkSpriteFlip: 1, defaultWalkSpriteSuffix: "-nwne-walk.png" },   //  3: NORTH-EAST
//    { walkSpriteFlip: 1, defaultWalkSpriteSuffix: "-n-walk.png" },      //  4: NORTH
//    { walkSpriteFlip: -1, defaultWalkSpriteSuffix: "-nwne-walk.png" },  //  5: NORTH-WEST
//    { walkSpriteFlip: -1, defaultWalkSpriteSuffix: "-ew-walk.png" },    //  6: WEST
//    { walkSpriteFlip: -1, defaultWalkSpriteSuffix: "-swse-walk.png" }   //  7: SOUTH-WEST
//];

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


function sprite3dUpdater(url, options) {
    var defaultOptions = { width: 32, height: 32, fps: 8, frameCount: 4, flip: 1, offsetY: 0, scale: 1 };
    var roptions = {
        width       : coalesce(options, defaultOptions, function (o) { return o.width;}),
        height      : coalesce(options, defaultOptions, function (o) { return o.height;}),
        frameCount  : coalesce(options, defaultOptions, function (o) { return o.frameCount; }),
        fps         : coalesce(options, defaultOptions, function (o) { return o.fps; }),
        flip        : coalesce(options, defaultOptions, function (o) { return o.flip; }),
        offsetY     : coalesce(options, defaultOptions, function (o) { return o.offsetY; }),
        scale       : coalesce(options, defaultOptions, function (o) { return o.scale; })
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
    var spriteMap = THREE.ImageUtils.loadTexture(url);
    var spriteMaterials = [];
    for (var i = 0; i < roptions.frames.length; ++i) {
        var spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap, depthTest: false, useScreenCoordinates: true });
        spriteMaterial.map.offset = new THREE.Vector2(i / roptions.frames.length, 0);
        spriteMaterial.map.repeat = new THREE.Vector2(1 / roptions.frames.length, 1);
        spriteMaterials[i] = spriteMaterial;
    }

    this.updateSprite = function (spriteObj, sprite, frame, x, y, z) {
        spriteObj.position.set(x, y, z);
        sprite.position.set(0, roptions.offsetY, 0);
        //sprite.scale.set(this.frames() * roptions.flip, this.frames(), 1);
        sprite.scale.set(this.frames() * roptions.flip * roptions.scale, this.frames() * roptions.scale, 1.0);
        //spriteObj.scale.set(this.frames(), this.frames(), 1);
        //sprite.scale.set(roptions.flip, 1, 1);
        //sprite.material.map = spriteMaterials[frame].map;
        sprite.material = spriteMaterials[frame];
        sprite.material.map.offset.x = frame / this.frames();   //  required, although it seems redundant...
    };

    this.fps = function () {
        return roptions.fps;
    };

    this.frames = function () {
        return roptions.frames.length;
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
    var lastY = ent.y();
    var lastZ = ent.z();
    return function () {
        var noMovement = lastX == ent.x() && lastY == ent.y() && lastZ == ent.z();
        lastX = ent.x();
        lastY = ent.y();
        lastZ = ent.z();
        if (noMovement) {
            return {
                action: ANIM_ACTION_WAIT,
                x: ent.x(),
                y: ent.y(),
                z: ent.z(),
                facing: ent.facing()
            }
        }
        return {
            action: ANIM_ACTION_WALK,
            x: ent.x(),
            y: ent.y(),
            z: ent.z(),
            facing: ent.facing()
        };
    };
}

function buildSprite3dAnimator(scene) {
    return new function () {
        var _this = this;
        var stateToSpriteUpdater= [];
        this.glue = function (action, spriteUpdater, facing) {
            if (facing === undefined) {
                for (var i = 0; i < DIRECTIONS.length; ++i) {
                    _this.glue(action, spriteUpdater, i);
                }
            }
            else {
                //  For a given tuple (action, facing) choose a sprite
                for (var i = 0; i < stateToSpriteUpdater.length; ++i) {
                    if (stateToSpriteUpdater[i]({ action: action, facing: facing })) {
                        stateToSpriteUpdater.splice(i, 1);
                        break;
                    }
                }
                stateToSpriteUpdater.push(function (state) {
                    return state.action === action && state.facing === facing ? spriteUpdater : null;
                });
            }
            return _this;
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
                _this.glue(ANIM_ACTION_WALK, new sprite3dUpdater(spriteName + dirInfo.defaultWalkSpriteSuffix, dirOptions), i);
            }
            return _this;
        };
        var spriteShadowUrl = null;
        this.addSpriteShadow = function (shadowUrl) {
            spriteShadowUrl = shadowUrl;
            return _this;
        };
        this.buildRenderer = function (ent) {
            var sprite = new THREE.Sprite(new THREE.SpriteMaterial({ depthTest: true }));
            var obj = sprite;
            if (spriteShadowUrl) {
                obj = new THREE.Object3D();
                obj.add(sprite);
                var shadowMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.5, 1, 1), new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture(spriteShadowUrl), depthTest: false, transparent: true }));
                shadowMesh.rotation.x = -0.5 * Math.PI;
                obj.add(shadowMesh);
                scene.add(obj);
            } else {
                scene.add(sprite);
            }
            return new sprite3dEntityActionRenderer(obj, sprite, entityAnimationGlue(ent), stateToSpriteUpdater);
        };
    };
}

function sprite3dEntityActionRenderer(spriteObj, sprite, entAnimState, actionToSpriteUpdater) {
    var lastAnimState = null;
    var lastRenderTimeMs = new Date().getTime();
    var frameCounter = 0;
    function findSpriteUpdater(state) {
        for (var i = 0; i < actionToSpriteUpdater.length; ++i) {
            var spriteUpdater = actionToSpriteUpdater[i](state);
            if (spriteUpdater) {
                return spriteUpdater;
            }
        }
        return null;
    }
    this.update = function () {
        var renderTimeMs = new Date().getTime();    //  TODO: BETTER TIMER
        var animState = entAnimState();
        var spriteUpdater = findSpriteUpdater(animState);
        if (!spriteUpdater) {
            return;
        }

        if (this.lastAnimState && animState.action === this.lastAnimState.action) {
            if ((renderTimeMs - this.lastRenderTimeMs) > (1000 / spriteUpdater.fps())) {
                this.frameCounter++;
                this.lastRenderTimeMs = renderTimeMs;
            }
        }
        else {
            this.frameCounter = 0;
            this.lastRenderTimeMs = renderTimeMs;
        }
        spriteUpdater.updateSprite(spriteObj, sprite, this.frameCounter % spriteUpdater.frames(), animState.x, animState.y, animState.z);
        this.lastAnimState = animState;
    };
    this.update();
}
