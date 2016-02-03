
var x = new SpriteAnimationBuilder(null, (e) => new EntityAnimationStateGenerator(e))
    .glue(new EntityAnimationActionFacingMatcher(ANIM_ACTION_WALK, 0), new SpriteEntityAnimator());
class SpriteAnimationBuilder {
    private _x = new Array<IMatcherAndAnimator>();
    private spriteShadowUrl: string;
    constructor(private scene: any, private animationStateGeneratorFactory: (entity: IEntity) => IEntityAnimationStateGenerator) {
    }
    glue(matcher: IEntityAnimationMatcher, animator: IEntityAnimator): SpriteAnimationBuilder {
        this._x.push({ matcher: matcher, animator: animator });
        return this;
    }
    addSimpleShadow(shadowUrl): SpriteAnimationBuilder {
        this.spriteShadowUrl = shadowUrl;
        return this;
    }
    build(ent: IEntity): IAnimator {
        var sprite = new THREE.Sprite(new THREE.SpriteMaterial({ depthTest: true }));
        var obj = sprite;
        if (this.spriteShadowUrl) {
            obj = new THREE.Object3D();
            obj.add(sprite);
            var shadowMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.5, 1, 1), new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture(this.spriteShadowUrl), depthTest: false, transparent: true }));
            shadowMesh.rotation.x = -0.5 * Math.PI;
            obj.add(shadowMesh);
            this.scene.add(obj);
        } else {
            this.scene.add(sprite);
        }

        var stateGenerator = this.animationStateGeneratorFactory(ent);
        return {
            update: (): void => {
                var animState = stateGenerator.getNextAnimState();
                for (var m of this._x) {
                    if (m.matcher.isMatch(animState)) {
                        m.animator.update(ent, animState);  //  note: doesn't allow multiple animators to act on the entity
                        return;
                    }
                }
            }
        };
    }
}

class SpriteEntityAnimator implements IEntityAnimator {
    private lastAnimState: IEntityAnimationState;
    private lastRenderTimeMs = new Date().getTime();
    private frameCounter = 0;
    private rOptions: ISpriteOptions;

    constructor(spriteUrl: string, options: ISpriteOptions, spriteShadowUrl?: string) {
        var roptions = coalesceSpriteOptions({ width: 32, height: 32, fps: 8, frameCount: 4, flip: 1, offsetY: 0, scale: 1 }, options);
    }

    update(entity: IEntity, animState: IEntityAnimationState) {
        var renderTimeMs = new Date().getTime();    //  TODO: BETTER TIMER

        //  Post-animation - update frame counter and last animation state
        this.lastAnimState = animState;
        if ((renderTimeMs - this.lastRenderTimeMs) > (1000 / this.rOptions.frames.length)) {
            this.frameCounter++;
            this.lastRenderTimeMs = renderTimeMs;
        }
        else {
            this.frameCounter = 0;
            this.lastRenderTimeMs = renderTimeMs;
        }
    }
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
