
interface SpriteAnimatorContext {
    animateSprite(spriteUrl: string, options: ISpriteOptions): IEntityAnimator;
}

class SpriteEntityAnimatorContextFactory implements IEntityAnimatorContextFactory<SpriteAnimatorContext> {
    constructor(private spriteShadowUrl?: string) {
    }

    createContext(scene: any): SpriteAnimatorContext {
        var sprite = new THREE.Sprite(new THREE.SpriteMaterial({ depthTest: true }));
        var spriteInst = this.spriteShadowUrl ? this.createShadowedSprite(scene, sprite) : this.createSprite(scene, sprite);
        return {
            animateSprite: (spriteUrl: string, options: ISpriteOptions): IEntityAnimator => {
                //return new SpriteEntityAnimator(spriteUrl, spriteInst, options);
                return new ShaderSpriteEntityAnimator(spriteUrl, spriteInst, options);
            }
        };
    }

    private createSprite(scene: any, sprite: any): ISpriteInstance {
        scene.add(sprite);
        return {
            applyMaterial: (material: any) => { sprite.material = material; },
            applyPosition: (x: number, y: number, z: number) => { sprite.position.set(x, y, z); },
            applyPositionOffset: (x: number, y: number, z: number) => { sprite.position.set(sprite.position.x + x, sprite.position.y + y, sprite.position.z + z); },
            applyScale: (x: number, y: number, z: number) => { sprite.scale.set(x, y, z); }
        };
    }

    private createShadowedSprite(scene: any, sprite: any): ISpriteInstance {
        var obj = new THREE.Object3D();
        obj.add(sprite);
        var shadowMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.5, 1, 1), new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture(this.spriteShadowUrl), depthTest: false, transparent: true }));
        shadowMesh.rotation.x = -0.5 * Math.PI;
        obj.add(shadowMesh);
        var shadow = shadowMesh;
        scene.add(obj);
        return {
            applyMaterial: (material: any) => { sprite.material = material; },
            applyPosition: (x: number, y: number, z: number) => { obj.position.set(x, y, z); },
            applyPositionOffset: (x: number, y: number, z: number) => { sprite.position.set(x, y, z); },
            applyScale: (x: number, y: number, z: number) => { sprite.scale.set(x, y, z); }
        };
    }
}


abstract class AbstractSpriteEntityAnimator implements IEntityAnimator {
    private lastAnimState: IEntityAnimationState;
    private lastRenderTimeMs = new Date().getTime();
    private frameCounter = 0;
    protected rOptions: ISpriteOptions;

    constructor(options: ISpriteOptions) {
        this.rOptions = coalesceSpriteOptions({ width: 32, height: 32, fps: 8, frameCount: 4, flip: 1, offsetY: 0, scale: 1 }, options);
    }

    abstract updateSprite(frameCounter: number, animState: IEntityAnimationState);

    update(entity: IEntity, animState: IEntityAnimationState) {
        var renderTimeMs = new Date().getTime();    //  TODO: BETTER TIMER

        this.updateSprite(this.frameCounter % this.rOptions.frames.length, animState);

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

interface ISpriteInstance {
    applyMaterial(material: any);
    applyPosition(x: number, y: number, z: number);
    applyPositionOffset(x: number, y: number, z: number);
    applyScale(x: number, y: number, z: number);
}

class SpriteEntityAnimator extends AbstractSpriteEntityAnimator {
    private spriteMaterials: Array<any> = [];

    constructor(spriteUrl: string, private sprite: ISpriteInstance, options: ISpriteOptions) {
        super(options);
        
        for (var i = 0; i < this.rOptions.frames.length; ++i) {
            var spriteMaterial = new THREE.SpriteMaterial({ map: THREE.ImageUtils.loadTexture(spriteUrl), depthTest: true, useScreenCoordinates: false, wireframe: true });
            spriteMaterial.map.offset = new THREE.Vector2(i / this.rOptions.frames.length, 0);
            spriteMaterial.map.repeat = new THREE.Vector2(1 / this.rOptions.frames.length, 1);
            this.spriteMaterials[i] = spriteMaterial;
        }
    }

    updateSprite(frameIndex: number, animState: IEntityAnimationState) {
        this.sprite.applyPosition(animState.state.position.x, animState.state.position.y, animState.state.position.z);
        this.sprite.applyPositionOffset(0, this.rOptions.offsetY, 0);
        this.sprite.applyScale(this.rOptions.frames.length * this.rOptions.flip * this.rOptions.scale, this.rOptions.frames.length * this.rOptions.scale, 1.0);
        this.sprite.applyMaterial(this.spriteMaterials[frameIndex]);
        //  TODO: Restore
        this.spriteMaterials[frameIndex].map.offset.x = frameIndex / this.rOptions.frames.length;   //  required, although it seems redundant...
        this.spriteMaterials[frameIndex].map.needsUpdate = true;
    }
}


class ShaderSpriteEntityAnimator extends AbstractSpriteEntityAnimator {

    constructor(spriteUrl: string, private sprite: ISpriteInstance, options: ISpriteOptions) {
        super(options);
        //var spriteMaterial = new THREE.SpriteMaterial({ map: THREE.ImageUtils.loadTexture(spriteUrl), depthTest: true, useScreenCoordinates: false, wireframe: true });

        var vshader = [
            "varying vec3 vecNormal;",
            "varying vec2 vUv;",
            "void main() {",
            "vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
            "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
            "vecNormal = normalize(normalMatrix * normal);",
            "vUv = uv;",
            "gl_Position = projectionMatrix * mvPosition;",
            "}"
        ].join("\n");
        var fshader = [
            "varying vec3 vecNormal;",
            "uniform vec3 directionalLightDirection;",
            "uniform sampler2D atlasTexture;",
            "uniform sampler2D atlasUvTexture0;",
            "varying vec2 vUv;",
            "void main() {",
            "gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);",
            "}"
        ].join("\n");
        var spriteMaterial = new THREE.ShaderMaterial({ vertexShader: vshader, fragmentShader: fshader, lights: false, map: null });
        spriteMaterial.map = null;
        sprite.applyMaterial(spriteMaterial);
    }

    updateSprite(frameIndex: number, animState: IEntityAnimationState) {
        this.sprite.applyPosition(animState.state.position.x, animState.state.position.y, animState.state.position.z);
        this.sprite.applyPositionOffset(0, this.rOptions.offsetY, 0);
        this.sprite.applyScale(this.rOptions.frames.length * this.rOptions.flip * this.rOptions.scale, this.rOptions.frames.length * this.rOptions.scale, 1.0);
    }
}