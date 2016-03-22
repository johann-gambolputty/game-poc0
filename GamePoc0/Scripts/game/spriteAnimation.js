var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SpriteEntityAnimatorContextFactory = (function () {
    function SpriteEntityAnimatorContextFactory(spriteShadowUrl) {
        this.spriteShadowUrl = spriteShadowUrl;
        this.pixelScale = 0.1;
    }
    SpriteEntityAnimatorContextFactory.prototype.withDefaultOptions = function (defaultOptions) {
        this.defaultOptions = defaultOptions;
        return this;
    };
    SpriteEntityAnimatorContextFactory.prototype.withPixelScale = function (scale) {
        this.pixelScale = scale;
        return this;
    };
    SpriteEntityAnimatorContextFactory.prototype.createContext = function (scene) {
        var _this = this;
        var spriteInst = this.createShaderShadowSprite(scene);
        //var spriteInst = this.createShadowedSprite(scene, new THREE.Sprite(new THREE.SpriteMaterial({ depthTest: true })));
        return {
            animateSprite: function (spriteUrl, options) {
                return new ShaderSpriteEntityAnimator(spriteUrl, spriteInst, coalesceSpriteOptions(_this.defaultOptions, options));
                //return new SpriteEntityAnimator(spriteUrl, spriteInst, options);
            }
        };
    };
    SpriteEntityAnimatorContextFactory.prototype.createShaderShadowSprite = function (scene) {
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
            [left, bottom, 0.0],
            [left, top, 0.0],
            [right, top, 0.0],
            [right, top, 0.0],
            [right, bottom, 0.0],
            [left, bottom, 0.0] //  BL
        ];
        var vertexUvs = [
            [0.0, 0.0],
            [0.0, 1.0],
            [1.0, 1.0],
            [1.0, 1.0],
            [1.0, 0.0],
            [0.0, 0.0] //  BL
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
        shadowMesh.position.set(-3 / 32, 0, -3 / 32); //  Tweak to push centre into the correct location
        shadowMesh.rotation.x = -0.5 * Math.PI;
        obj.add(sprite);
        obj.add(shadowMesh);
        scene.add(obj);
        return {
            applyMaterial: function (material) { sprite.material = material; },
            applyPosition: function (x, y, z) { obj.position.set(x, y, z); },
            applyPositionOffset: function (x, y, z) {
                //sprite.position.set(x, 0, z);
            },
            applyScale: function (x, y, z) {
                //uniforms.spriteWidth.value = x;
                //uniforms.spriteHeight.value = y;
                //sprite.scale.set(x, y, z);
                //sprite.scale.set(2, 2, 2);
            },
            applySpriteFrame: function (frame, flip) {
                var wf = 0.0, hf = 0.0;
                ;
                if (uniforms.spriteTexture.value != null && uniforms.spriteTexture.value.image) {
                    wf = 1.0 / uniforms.spriteTexture.value.image.naturalWidth;
                    hf = 1.0 / uniforms.spriteTexture.value.image.naturalHeight;
                }
                uniforms.spriteMinU.value = (flip ? frame.u + frame.w : frame.u) * wf;
                uniforms.spriteMinV.value = frame.v * hf;
                uniforms.spriteMaxU.value = (flip ? frame.u : frame.u + frame.w) * wf;
                uniforms.spriteMaxV.value = frame.v * hf + frame.h * hf;
            },
            applySpriteTexture: function (texture) {
                uniforms.spriteTexture.value = texture;
            }
        };
    };
    SpriteEntityAnimatorContextFactory.prototype.createSprite = function (scene, sprite) {
        scene.add(sprite);
        return {
            applyMaterial: function (material) { sprite.material = material; },
            applyPosition: function (x, y, z) { sprite.position.set(x, y, z); },
            applyPositionOffset: function (x, y, z) { sprite.position.set(sprite.position.x + x, sprite.position.y + y, sprite.position.z + z); },
            applyScale: function (x, y, z) { sprite.scale.set(x, y, z); },
            applySpriteFrame: null,
            applySpriteTexture: null
        };
    };
    SpriteEntityAnimatorContextFactory.prototype.createShadowedSprite = function (scene, sprite) {
        var obj = new THREE.Object3D();
        obj.add(sprite);
        var shadowMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.5, 1, 1), new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture(this.spriteShadowUrl), depthTest: false, transparent: true }));
        shadowMesh.rotation.x = -0.5 * Math.PI;
        obj.add(shadowMesh);
        var shadow = shadowMesh;
        scene.add(obj);
        return {
            applyMaterial: function (material) { sprite.material = material; },
            applyPosition: function (x, y, z) { obj.position.set(x, y, z); },
            applyPositionOffset: function (x, y, z) { sprite.position.set(x, y, z); },
            applyScale: function (x, y, z) { sprite.scale.set(x, y, z); },
            applySpriteFrame: null,
            applySpriteTexture: null
        };
    };
    return SpriteEntityAnimatorContextFactory;
})();
var AbstractSpriteEntityAnimator = (function () {
    function AbstractSpriteEntityAnimator(options) {
        this.lastRenderTimeMs = new Date().getTime();
        this.frameCounter = 0;
        this.rOptions = coalesceSpriteOptions({ width: 32, height: 32, fps: 8, frameCount: 4, flip: false, offsetY: 0, scale: 1 }, options);
    }
    AbstractSpriteEntityAnimator.prototype.update = function (entity, animState) {
        var renderTimeMs = new Date().getTime(); //  TODO: BETTER TIMER
        this.updateSprite(this.frameCounter, animState);
        //  Post-animation - update frame counter and last animation state
        this.lastAnimState = animState;
        if ((renderTimeMs - this.lastRenderTimeMs) > (1000 / this.rOptions.frames.length)) {
            this.frameCounter = (this.frameCounter + 1) % this.rOptions.frames.length;
            this.lastRenderTimeMs = renderTimeMs;
        }
    };
    return AbstractSpriteEntityAnimator;
})();
var SpriteEntityAnimator = (function (_super) {
    __extends(SpriteEntityAnimator, _super);
    function SpriteEntityAnimator(spriteUrl, sprite, options) {
        _super.call(this, options);
        this.sprite = sprite;
        this.spriteMaterials = [];
        for (var i = 0; i < this.rOptions.frames.length; ++i) {
            var spriteMaterial = new THREE.SpriteMaterial({ map: THREE.ImageUtils.loadTexture(spriteUrl), depthTest: true, useScreenCoordinates: false, wireframe: true });
            spriteMaterial.map.offset = new THREE.Vector2(i / this.rOptions.frames.length, 0);
            spriteMaterial.map.repeat = new THREE.Vector2(1 / this.rOptions.frames.length, 1);
            this.spriteMaterials[i] = spriteMaterial;
        }
    }
    SpriteEntityAnimator.prototype.updateSprite = function (frameIndex, animState) {
        this.sprite.applyPosition(animState.state.position.x, animState.state.position.y, animState.state.position.z);
        this.sprite.applyPositionOffset(0, this.rOptions.offsetY, 0);
        this.sprite.applyScale(this.rOptions.frames.length * (this.rOptions.flip ? -1 : 1) * this.rOptions.scale, this.rOptions.frames.length * this.rOptions.scale, 1.0);
        this.sprite.applyMaterial(this.spriteMaterials[frameIndex]);
        //  TODO: Restore
        this.spriteMaterials[frameIndex].map.offset.x = frameIndex / this.rOptions.frames.length; //  required, although it seems redundant...
        this.spriteMaterials[frameIndex].map.needsUpdate = true;
    };
    return SpriteEntityAnimator;
})(AbstractSpriteEntityAnimator);
var ShaderSpriteEntityAnimator = (function (_super) {
    __extends(ShaderSpriteEntityAnimator, _super);
    function ShaderSpriteEntityAnimator(spriteUrl, sprite, options) {
        _super.call(this, options);
        this.sprite = sprite;
        this.spriteTexture = THREE.ImageUtils.loadTexture(spriteUrl);
    }
    ShaderSpriteEntityAnimator.prototype.updateSprite = function (frameIndex, animState) {
        this.sprite.applySpriteTexture(this.spriteTexture);
        this.sprite.applyPosition(animState.state.position.x, animState.state.position.y, animState.state.position.z);
        this.sprite.applyPositionOffset(0, this.rOptions.offsetY, 0);
        //this.sprite.applyScale(this.rOptions.frames.length * this.rOptions.flip * this.rOptions.scale, this.rOptions.frames.length * this.rOptions.scale, 1.0);
        this.sprite.applySpriteFrame(this.rOptions.frames[frameIndex], this.rOptions.flip);
    };
    return ShaderSpriteEntityAnimator;
})(AbstractSpriteEntityAnimator);
//# sourceMappingURL=spriteAnimation.js.map