var x = new SpriteAnimationBuilder(null, function (e) { return new EntityAnimationStateGenerator(e); })
    .glue(new EntityAnimationActionFacingMatcher(ANIM_ACTION_WALK, 0), new SpriteEntityAnimator());
var SpriteAnimationBuilder = (function () {
    function SpriteAnimationBuilder(scene, animationStateGeneratorFactory) {
        this.scene = scene;
        this.animationStateGeneratorFactory = animationStateGeneratorFactory;
        this._x = new Array();
    }
    SpriteAnimationBuilder.prototype.glue = function (matcher, animator) {
        this._x.push({ matcher: matcher, animator: animator });
        return this;
    };
    SpriteAnimationBuilder.prototype.addSimpleShadow = function (shadowUrl) {
        this.spriteShadowUrl = shadowUrl;
        return this;
    };
    SpriteAnimationBuilder.prototype.build = function (ent) {
        var _this = this;
        var sprite = new THREE.Sprite(new THREE.SpriteMaterial({ depthTest: true }));
        var obj = sprite;
        if (this.spriteShadowUrl) {
            obj = new THREE.Object3D();
            obj.add(sprite);
            var shadowMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.5, 1, 1), new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture(this.spriteShadowUrl), depthTest: false, transparent: true }));
            shadowMesh.rotation.x = -0.5 * Math.PI;
            obj.add(shadowMesh);
            this.scene.add(obj);
        }
        else {
            this.scene.add(sprite);
        }
        var stateGenerator = this.animationStateGeneratorFactory(ent);
        return {
            update: function () {
                var animState = stateGenerator.getNextAnimState();
                for (var _i = 0, _a = _this._x; _i < _a.length; _i++) {
                    var m = _a[_i];
                    if (m.matcher.isMatch(animState)) {
                        m.animator.update(ent, animState); //  note: doesn't allow multiple animators to act on the entity
                        return;
                    }
                }
            }
        };
    };
    return SpriteAnimationBuilder;
})();
var SpriteEntityAnimator = (function () {
    function SpriteEntityAnimator(spriteUrl, options, spriteShadowUrl) {
        this.lastRenderTimeMs = new Date().getTime();
        this.frameCounter = 0;
    }
    SpriteEntityAnimator.prototype.update = function (entity, animState) {
        var renderTimeMs = new Date().getTime(); //  TODO: BETTER TIMER
        //  Post-animation - update frame counter and last animation state
        this.lastAnimState = animState;
        if ((renderTimeMs - this.lastRenderTimeMs) > (1000 / spriteUpdater.fps())) {
            this.frameCounter++;
            this.lastRenderTimeMs = renderTimeMs;
        }
        else {
            this.frameCounter = 0;
            this.lastRenderTimeMs = renderTimeMs;
        }
    };
    return SpriteEntityAnimator;
})();
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
        var renderTimeMs = new Date().getTime(); //  TODO: BETTER TIMER
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
