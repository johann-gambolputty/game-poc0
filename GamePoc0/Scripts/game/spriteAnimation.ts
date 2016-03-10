
interface SpriteAnimatorContext {
    animateSprite(spriteUrl: string, options: ISpriteOptions): IEntityAnimator;
}

class SpriteEntityAnimatorContextFactory implements IEntityAnimatorContextFactory<SpriteAnimatorContext> {
    private defaultOptions: ISpriteOptions;
    private pixelScale: number = 0.1;

    constructor(private spriteShadowUrl?: string) {
    }

    withDefaultOptions(defaultOptions: ISpriteOptions): SpriteEntityAnimatorContextFactory {
        this.defaultOptions = defaultOptions;
        return this;
    }

    withPixelScale(scale: number): SpriteEntityAnimatorContextFactory {
        this.pixelScale = scale;
        return this;
    }

    createContext(scene: any): SpriteAnimatorContext {
        var spriteInst = this.createShaderShadowSprite(scene);
        //var spriteInst = this.createShadowedSprite(scene, new THREE.Sprite(new THREE.SpriteMaterial({ depthTest: true })));
        return {
            animateSprite: (spriteUrl: string, options: ISpriteOptions): IEntityAnimator => {
                return new ShaderSpriteEntityAnimator(spriteUrl, spriteInst, coalesceSpriteOptions(this.defaultOptions, options));
                //return new SpriteEntityAnimator(spriteUrl, spriteInst, options);
            }
        };
    }
    
    private createShaderShadowSprite(scene: any): ISpriteInstance {
        var uniforms = {
            spriteTexture: { type: "t", value: THREE.ImageUtils.loadTexture(this.spriteShadowUrl) },
            spriteMinU: { type: "f", value: 0 },
            spriteMinV: { type: "f", value: 0 },
            spriteMaxU: { type: "f", value: 1 },
            spriteMaxV: { type: "f", value: 1 },
            flip: { type: "f", value: 0 },
            spriteScale: { type: "f", value: this.pixelScale }
        };
        var vshader = [
            "varying vec3 vecNormal;",
            "varying vec4 visPos;",
            "varying vec2 vUv;",
            "uniform float spriteScale;",
            "void main() {",
            "vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
            "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
            "vecNormal = normalize(normalMatrix * normal);",
            "vUv = uv;",
            "float rotation = 0.0;",
            //"vec2 alignedPosition = position.xy * vec2(spriteWorldWidth, spriteWorldHeight) * spriteScale;",
            "vec2 alignedPosition = position.xy;",
            "vec2 rotatedPosition;",
            "rotatedPosition.x = cos(rotation) * alignedPosition.x - sin(rotation) * alignedPosition.y;",
            "rotatedPosition.y = sin(rotation) * alignedPosition.x + cos(rotation) * alignedPosition.y;",
            "vec4 finalPosition;",
            "finalPosition = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);",
            "finalPosition.xy += rotatedPosition;",
            "finalPosition = projectionMatrix * finalPosition;",
            "vec4 visPos = projectionMatrix * mvPosition;",
            //"vec4 visPos = projectionMatrix * (modelViewMatrix * vec4(0.0, 4.0, 0.0, 1.0));",
            "finalPosition.z = visPos.z;",
            //"finalPosition.w = visPos.w;", 
            //"finalPosition = projectionMatrix * mvPosition;",
            "gl_Position = finalPosition;",
            "}"
        ].join("\n");
        var fshader = [
            "varying vec3 vecNormal;",
            "varying vec2 vUv;",
            "uniform float spriteMinU;",
            "uniform float spriteMinV;",
            "uniform float spriteMaxU;",
            "uniform float spriteMaxV;",
            "uniform sampler2D spriteTexture;",
            "void main() {",
            "gl_FragColor = texture2D(spriteTexture, mix(vec2(spriteMinU, spriteMinV), vec2(spriteMaxU, spriteMaxV), vUv));",
            //"gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);",
            "}"
        ].join("\n");
        var spriteMaterial = new THREE.ShaderMaterial({ vertexShader: vshader, fragmentShader: fshader, lights: false, depthTest: true, transparent: true, wireframe: false, uniforms: uniforms, side: THREE.DoubleSide });
        //var spriteMaterial = new THREE.ShaderMaterial({ vertexShader: vshader, fragmentShader: fshader, uniforms: uniforms, lights: false, depthTest: true, transparent: true, wireframe: true, side: THREE.DoubleSide});
        //var spriteMaterial = new THREE.MeshBasicMaterial({ depthTest: false, transparent: true, wireframe: false, side: THREE.DoubleSide});
        var spriteGeometry = new THREE.BufferGeometry();
        var left = -(this.defaultOptions.width / 2) * this.pixelScale;
        var right = (this.defaultOptions.width / 2) * this.pixelScale;
        var top = this.defaultOptions.height * this.pixelScale;
        var bottom = 0.0;
        var vertexPositions = [
            [left,  bottom, 0.0],  //  BL
            [left,  top,    0.0],  //  TL
            [right, top,    0.0],  //  TR

            [right, top,    0.0],   //  TR
            [right, bottom, 0.0],   //  BR
            [left,  bottom, 0.0]    //  BL
        ];
        var vertexUvs = [
            [0.0, 0.0],    //  BL
            [0.0, 1.0],    //  TL
            [1.0, 1.0],    //  TR

            [1.0, 1.0 ],   //  TR
            [1.0, 0.0 ],   //  BR
            [0.0, 0.0 ]    //  BL
        ];
        var positions = new Float32Array(vertexPositions.length * 3);
        var normals = new Float32Array(vertexPositions.length * 3);
        var uvs = new Float32Array(vertexUvs.length * 2);
        for (var i = 0; i < vertexPositions.length; ++i) {
            positions[i * 3 + 0] = vertexPositions[i][0];
            positions[i * 3 + 1] = vertexPositions[i][1];
            positions[i * 3 + 2] = vertexPositions[i][2];
            uvs[i * 2 + 0] = vertexUvs[i][0];
            uvs[i * 2 + 1] = vertexUvs[i][1];
            normals[i * 3 + 0] = 1.0;
            normals[i * 3 + 1] = 0.0;
            normals[i * 3 + 2] = 0.0;
        }
        spriteGeometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        spriteGeometry.addAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        spriteGeometry.addAttribute('normal', new THREE.BufferAttribute(normals, 3));

        //var sprite = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1, 2, 2), spriteMaterial);
        var sprite = new THREE.Mesh(spriteGeometry, spriteMaterial);
        //
        //sprite.position.set(0, 2, 0);
        //sprite.scale.set(32 * 0.08, 32 * 0.08, 32 * 0.08);
        //sprite.scale.set(10, 10, 10);
        var obj = new THREE.Object3D();
        var shadowSize = this.defaultOptions.width * this.pixelScale;
        //var shadowMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(shadowSize, shadowSize, 2, 2), new THREE.MeshBasicMaterial({ depthTest: false, transparent: true, wireframe: true, color: "#FFFF00" }));
        var shadowMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(shadowSize, shadowSize, 2, 2), new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture(this.spriteShadowUrl), depthTest: false, transparent: true }));
        shadowMesh.position.set(-3 / 32, 0, -3 / 32);   //  Tweak to push centre into the correct location
        shadowMesh.rotation.x = -0.5 * Math.PI;
        obj.add(sprite);
        obj.add(shadowMesh);
        scene.add(obj);
        return {
            applyMaterial: (material: any) => { sprite.material = material; },
            applyPosition: (x: number, y: number, z: number) => { obj.position.set(x, y, z); },
            applyPositionOffset: (x: number, y: number, z: number) => {
                //sprite.position.set(x, 0, z);
            },
            applyScale: (x: number, y: number, z: number) => {
                //uniforms.spriteWidth.value = x;
                //uniforms.spriteHeight.value = y;
                //sprite.scale.set(x, y, z);
                //sprite.scale.set(2, 2, 2);
            },
            applySpriteFrame: (frame: SpriteFrame, flip: boolean) => {
                var wf = 0.0, hf = 0.0;;
                if (uniforms.spriteTexture.value != null && uniforms.spriteTexture.value.image) {
                    wf = 1.0 / uniforms.spriteTexture.value.image.naturalWidth;
                    hf = 1.0 / uniforms.spriteTexture.value.image.naturalHeight;
                }
                uniforms.spriteMinU.value = (flip ? frame.u + frame.w: frame.u) * wf;
                uniforms.spriteMinV.value = frame.v * hf;
                uniforms.spriteMaxU.value = (flip ? frame.u : frame.u + frame.w) * wf;
                uniforms.spriteMaxV.value = frame.v * hf + frame.h * hf;
            },
            applySpriteTexture: (texture: any) => {
                uniforms.spriteTexture.value = texture;
            }
        };
    }

    private createSprite(scene: any, sprite: any): ISpriteInstance {
        scene.add(sprite);
        return {
            applyMaterial: (material: any) => { sprite.material = material; },
            applyPosition: (x: number, y: number, z: number) => { sprite.position.set(x, y, z); },
            applyPositionOffset: (x: number, y: number, z: number) => { sprite.position.set(sprite.position.x + x, sprite.position.y + y, sprite.position.z + z); },
            applyScale: (x: number, y: number, z: number) => { sprite.scale.set(x, y, z); },
            applySpriteFrame: null,
            applySpriteTexture: null
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
            applyScale: (x: number, y: number, z: number) => { sprite.scale.set(x, y, z); },
            applySpriteFrame: null,
            applySpriteTexture: null
        };
    }
}


abstract class AbstractSpriteEntityAnimator implements IEntityAnimator {
    private lastAnimState: IEntityAnimationState;
    private lastRenderTimeMs = new Date().getTime();
    private frameCounter = 0;
    protected rOptions: ISpriteOptions;

    constructor(options: ISpriteOptions) {
        this.rOptions = coalesceSpriteOptions({ width: 32, height: 32, fps: 8, frameCount: 4, flip: false, offsetY: 0, scale: 1 }, options);
    }

    abstract updateSprite(frameCounter: number, animState: IEntityAnimationState);

    update(entity: IEntity, animState: IEntityAnimationState) {
        var renderTimeMs = new Date().getTime();    //  TODO: BETTER TIMER

        this.updateSprite(this.frameCounter, animState);

        //  Post-animation - update frame counter and last animation state
        this.lastAnimState = animState;
        if ((renderTimeMs - this.lastRenderTimeMs) > (1000 / this.rOptions.frames.length)) {
            this.frameCounter = (this.frameCounter + 1) % this.rOptions.frames.length;
            this.lastRenderTimeMs = renderTimeMs;
        }
    }
}

interface ISpriteInstance {
    applyMaterial(material: any);
    applyPosition(x: number, y: number, z: number);
    applyPositionOffset(x: number, y: number, z: number);
    applySpriteFrame(frame: SpriteFrame, flip: boolean);
    applyScale(x: number, y: number, z: number);
    applySpriteTexture(texture: any);
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
        this.sprite.applyScale(this.rOptions.frames.length * (this.rOptions.flip ? -1 : 1) * this.rOptions.scale, this.rOptions.frames.length * this.rOptions.scale, 1.0);
        this.sprite.applyMaterial(this.spriteMaterials[frameIndex]);
        //  TODO: Restore
        this.spriteMaterials[frameIndex].map.offset.x = frameIndex / this.rOptions.frames.length;   //  required, although it seems redundant...
        this.spriteMaterials[frameIndex].map.needsUpdate = true;
    }
}


class ShaderSpriteEntityAnimator extends AbstractSpriteEntityAnimator {
    private spriteTexture: any;
    constructor(spriteUrl: string, private sprite: ISpriteInstance, options: ISpriteOptions) {
        super(options);
        this.spriteTexture = THREE.ImageUtils.loadTexture(spriteUrl);
    }

    updateSprite(frameIndex: number, animState: IEntityAnimationState) {
        this.sprite.applySpriteTexture(this.spriteTexture);
        this.sprite.applyPosition(animState.state.position.x, animState.state.position.y, animState.state.position.z);
        this.sprite.applyPositionOffset(0, this.rOptions.offsetY, 0);
        //this.sprite.applyScale(this.rOptions.frames.length * this.rOptions.flip * this.rOptions.scale, this.rOptions.frames.length * this.rOptions.scale, 1.0);
        this.sprite.applySpriteFrame(this.rOptions.frames[frameIndex], this.rOptions.flip);
    }
}