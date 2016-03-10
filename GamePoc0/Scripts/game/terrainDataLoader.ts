
interface IGroundTypePatch {
    width: number;
    height: number;
    numberOfLayers: number;
    fillLayer(layer: number, groundType: number);
    getGroundTypeAt(layer: number, x: number, y: number): number;
    //setGroundTypeAt(layer: number, x: number, y: number, groundType: number);
    apply();
}


interface IGroundTypeUvLookup {
    getUv(groundType: number): Rect;
}

class GroundTypeUvLookup implements IGroundTypeUvLookup {
    constructor(private atlas: AtlasUvData) {
    }

    getUv(groundType: number): Rect {
        throw "unimplemented";
    }
}

interface ITerrainGeometryData {
    groundHeight(ix: number, iy: number): number;
    getY(x: number, z: number): number;
}

class TerrainGeometryData implements ITerrainGeometryData {

    constructor(public geometry: any, private width: number, private height: number, private widthSamples: number, private heightSamples: number, private getHeight: (x: number, y: number) => number) {
    }
    groundHeight(ix: number, iy: number) : number {
        return this.getHeight(ix, iy);
    }
    getY(x: number, z: number) : number {
        var ox = (x + this.width / 2) * (this.widthSamples / this.width);
        var oy = (z + this.height / 2) * (this.heightSamples / this.height);
        var fx = Math.floor(ox);
        var fy = Math.floor(oy);
        var ix = clamp(fx, 0, this.widthSamples);
        var iy = clamp(fy, 0, this.heightSamples);

        //  Cheesy bilinear interpolation - we're rendering non-depth tested sprites so Y doesn't need to be super accurate...
        var y = bilinearFilter(ox - fx, oy - fy, this.groundHeight(ix, iy), this.groundHeight(ix + 1, iy), this.groundHeight(ix, iy + 1), this.groundHeight(ix + 1, iy + 1));
        return y;
    }
}

interface ITerrainGeometryDataLoader {
    load();
}

class TerrainGeometryDataLoader implements ITerrainGeometryDataLoader {

    heightmapUrl: string;
    heightmapProcessor: (heightMapImage: HTMLImageElement) => TerrainGeometryData;

    constructor(heightmapUrl: string, width: number, height: number, widthSamples: number, heightSamples: number, groundTypeUvLookup: IGroundTypeUvLookup) {
        this.heightmapUrl = heightmapUrl;
        this.heightmapProcessor = function (heightMapImage: HTMLImageElement): TerrainGeometryData {
            var canvas = document.createElement("canvas");
            var ctx = canvasImage(canvas, heightMapImage, widthSamples, heightSamples);
            var gd = ctx.getImageData(0, 0, canvas.width, canvas.height);
            var heightData = new Float32Array(widthSamples * heightSamples);
            var heightDataOffset = 0;
            var imgOffset = 0;
            for (var y = 0; y < heightSamples; ++y) {
                for (var x = 0; x < widthSamples; ++x, ++heightDataOffset, imgOffset += 4) {
                    heightData[heightDataOffset] = gd.data[imgOffset] / 5.0;
                }
            }
            //var geometry = new THREE.PlaneGeometry(width, height, widthSamples - 1, heightSamples - 1);
            //var geometry = new THREE.TerrainGeometry(width, height, widthSamples, heightSamples, (x, y) => heightData[x + y * widthSamples]);
            var geometry = TerrainBufferGeometry.build(width, height, widthSamples-1, heightSamples-1, (x, y) => heightData[x + y * widthSamples]);
            return new TerrainGeometryData(geometry, width, height, widthSamples, heightSamples, (x, y) => heightData[x + y * widthSamples]);
        };
    }

    load(): JQueryPromise<TerrainGeometryData> {
        return Assets.loadImageDeferred(this.heightmapUrl).pipe(this.heightmapProcessor);
    }
}


class TerrainAtlasData {
    constructor(public atlasImage: HTMLImageElement, public atlasUvData: AtlasUvData) { }
}

interface ITerrainAtlasDataLoader {
    load(): JQueryPromise<TerrainAtlasData>;
}

class AtlasUvTileInfo {
    public u: number;
    public v: number;
}

class AtlasUvTileSet {
    public name: string;
    public typeId: number;
    public baseTileInfo: AtlasUvTileInfo;
    public cornerTransitionTileInfos: Array<AtlasUvTileInfo>;
    public edgeTransitionTileInfos: Array<AtlasUvTileInfo>;
}

class AtlasUvData {
    public tileSize: number;
    public tileSets: Array<AtlasUvTileSet>;
}

class TerrainAtlasDataLoader implements ITerrainAtlasDataLoader {
    

    constructor(private atlasUrl: string, private atlasUvUrl: string) {
    }

    load(): JQueryPromise<TerrainAtlasData> {
        return Promises.when(
            Assets.loadImageDeferred(this.atlasUrl),
            $.getJSON(this.atlasUvUrl)
        ).pipe(function (result: Tuple2<HTMLImageElement, any>) {
            return new TerrainAtlasData(result.item0, result.item1[0]);
        });
    }
}

class TerrainLayerMapData {
    constructor(public atlasData: TerrainAtlasData, public atlasUvTextures: Array<any>, private layerMap: HTMLImageElement, public atlasUvTextureWidth: number, public atlasUvTextureHeight) { }

    createPatch(x: number, y: number, w: number, h: number): IGroundTypePatch {
        var layerMapCanvas = document.createElement("canvas");
        layerMapCanvas.width = w;
        layerMapCanvas.height = h;
        var layerMapContext = layerMapCanvas.getContext("2d");
        layerMapContext.drawImage(this.layerMap, x, y, w, h);

        var layerMapImageData = layerMapContext.getImageData(0, 0, w, h);

        return null;
    }

}

interface ITerrainLayerMapLoader {
    load(): any;
}

class ColourToTerrainType {
    constructor(public colour: number, public layer: number, public type: number) {
    }
}

class SimpleTerrainLayerMapLoader implements ITerrainLayerMapLoader {
    private colourToType = new Array<ColourToTerrainType>();

    constructor(private layerMapUrl: string, public atlasData: TerrainAtlasData) {
        this.colourToType.push({ colour: 0xffffff, type: 0, layer: 0 });//    TS structural type magic
        this.colourToType.push({ colour: 0xff0000, type: 1, layer: 0 });
        this.colourToType.push({ colour: 0x000000, type: 2, layer: 1 });
    }

    private getTypeFromColour(data: number[], idx: number) {
        var colour = (data[idx] << 16) | (data[idx + 1] << 8) | data[idx + 2];
        for (var i = 0; i < this.colourToType.length; ++i) {
            if (this.colourToType[i].colour == colour) {
                return this.colourToType[i];
            }
        }
        throw "no type matching colour R: " + data[idx + 0] + " G: " + data[idx + 1] + " B: " + data[idx + 2] + " found at index " + idx;
    }
    
    private getGroundTypeFromColourXy(data: number[], x: number, y: number, w: number, h: number) {
        var rx = x < 0 ? 0 : (x >= w ? w - 1 : x);
        var ry = y < 0 ? 0 : (y >= h ? h - 1 : y);
        return this.getTypeFromColour(data, (rx + ry * w) * 4);
    }

    //  Layer 0 [Types]
    //

    private isTypeVisible(data: number[], x: number, y: number, w: number, h: number, type: number) {
        return this.getGroundTypeFromColourXy(data, x, y, w, h).type == type;
    }

    private determineTerrainTypeCornerMask(data: number[], x: number, y: number, w: number, h: number, type: number, layer: number) {
        var c = this.getGroundTypeFromColourXy(data, x, y, w, h);
        if (c.layer >= layer && c.type == type) {
            return -1;
        }

        var t = this.isTypeVisible(data, x + 0, y + 1, w, h, type);
        var l = this.isTypeVisible(data, x + 1, y + 0, w, h, type);
        var r = this.isTypeVisible(data, x - 1, y + 0, w, h, type);
        var b = this.isTypeVisible(data, x + 0, y - 1, w, h, type);

        var tl = this.isTypeVisible(data, x + 1, y + 1, w, h, type) && !(t || l);
        var tr = this.isTypeVisible(data, x - 1, y + 1, w, h, type) && !(t || r);
        var bl = this.isTypeVisible(data, x + 1, y - 1, w, h, type) && !(b || l);
        var br = this.isTypeVisible(data, x - 1, y - 1, w, h, type) && !(b || r);

        return ((tr ? 1 : 0) | (tl ? 2 : 0) | (bl ? 4 : 0) | (br ? 8 : 0));
    }

    private determineTerrainTypeEdgeMask(data: number[], x: number, y: number, w: number, h: number, type: number, layer: number) {
        var c = this.getGroundTypeFromColourXy(data, x, y, w, h);
        if (c.layer >= layer) {
            return 0;
        }
        var t = this.isTypeVisible(data, x + 0, y + 1, w, h, type);
        var l = this.isTypeVisible(data, x - 1, y + 0, w, h, type);
        var r = this.isTypeVisible(data, x + 1, y + 0, w, h, type);
        var b = this.isTypeVisible(data, x + 0, y - 1, w, h, type);
        return ((l ? 1 : 0) | (t ? 2 : 0) | (r ? 4 : 0) | (b ? 8 : 0));
        //return 0;
    }

    load(): JQueryPromise<TerrainLayerMapData> {
        return Assets.loadImageDeferred(this.layerMapUrl)
            .then(layerMap => {
                var emptyTileUv = 0;
                var tileSize = this.atlasData.atlasUvData.tileSize;
                var tileSize2 = tileSize * tileSize;
                var __this = this;
                var tileInfoToUvOffset = function (info: AtlasUvTileInfo): number {
                    //  UV for a tile is expressed as a multiple of the basic tile width/height (32)
                    //  To cram into a 1 byte colour component, we divide through by the tile dimensions to get a tile offset
                    return (info.u / tileSize) + (info.v * __this.atlasData.atlasImage.naturalWidth) / tileSize2;
                };
                var mainTileUv = function (type: number): number {
                    return tileInfoToUvOffset(__this.atlasData.atlasUvData.tileSets[type].baseTileInfo);
                };
                var cornerTileUv = function (type: number, mask: number): number {
                    if (mask == -1) {
                        return mainTileUv(type);
                    }
                    if (mask == 0) {
                        return emptyTileUv;
                    }
                    return tileInfoToUvOffset(__this.atlasData.atlasUvData.tileSets[type].cornerTransitionTileInfos[mask - 1]);
                };
                var setCornerTileUv = function (atlasUvData: Uint8Array, atlasUvOffset: number, type: number, mask: number): void {
                    if (atlasUvData[atlasUvOffset] == emptyTileUv) {
                        atlasUvData[atlasUvOffset] = cornerTileUv(type, mask);
                    }
                };
                var edgeTileUv = function (type: number, mask: number): number {
                    if (mask == 0) {
                        return emptyTileUv;
                    }
                    return tileInfoToUvOffset(__this.atlasData.atlasUvData.tileSets[type].edgeTransitionTileInfos[mask - 1]);
                };
                var setEdgeTileUv = function (atlasUvData: Uint8Array, atlasUvOffset: number, type: number, mask: number): void {
                    if (atlasUvData[atlasUvOffset] == emptyTileUv) {
                        atlasUvData[atlasUvOffset] = edgeTileUv(type, mask);
                    }
                };

                //  Build the atlas corner lookup texture
                //  R = layer 0 edge offset (u,v) = (R % atlasWidth, R / atlasWidth)
                //  G = layer 0 corner offset (u,v) = (G % atlasWidth, G / atlasWidth)
                //  B = layer 1 corner offset (u,v) = (B % atlasWidth, B / atlasWidth)
                //  A = layer 1 edge offset (u,v) = (A % atlasWidth, A / atlasWidth)
                //  Can't create a texture direct from processing a canvas with the ground map drawn to it as CANVAS PREMULTIPLIES THE FUCKING ALPHA
                var maxLayers = 2;
                var atlasUvTextures = [];
                var layerMapCanvas = document.createElement("canvas");
                var layerMapContext = canvasImage(layerMapCanvas, layerMap, layerMap.naturalWidth, layerMap.naturalHeight);
                var layerMapImageData = layerMapContext.getImageData(0, 0, layerMapCanvas.width, layerMapCanvas.height);
                var w = layerMapCanvas.width;
                var h = layerMapCanvas.height;
                var d = layerMapImageData.data;
                for (var layer = 0; layer < maxLayers; layer += 2) {
                    var currentLayer = layer;
                    var typesOnLayer0 = this.colourToType.filter(ct => ct.layer == currentLayer);
                    var typesOnLayer1 = this.colourToType.filter(ct => ct.layer == currentLayer + 1);

                    var atlasUvData = new Uint8Array(layerMap.naturalWidth * layerMap.naturalHeight * 4);
                    var maxIdx = layerMap.naturalWidth * layerMap.naturalHeight * 4;
                    var idx = 0;
                    for (var y = 0; y < h; ++y) {
                        for (var x = 0; x < w; ++x, idx += 4) {
                            for (var typeIndex = 0; typeIndex < typesOnLayer0.length; ++typeIndex) {
                                var type = typesOnLayer0[typeIndex].type;
                                //DEBUG ONLY
                                if (this.getGroundTypeFromColourXy(d, x, y, w, h).type != type) {
                                    continue;
                                }
                                setCornerTileUv(atlasUvData, idx + 0, type, this.determineTerrainTypeCornerMask(d, x, y, w, h, type, layer + 0));
                                setEdgeTileUv(atlasUvData, idx + 1, type, this.determineTerrainTypeEdgeMask(d, x, y, w, h, type, layer + 0));
                            }
                            for (var typeIndex = 0; typeIndex < typesOnLayer1.length; ++typeIndex) {
                                var type = typesOnLayer1[typeIndex].type;
                                setCornerTileUv(atlasUvData, idx + 2, type, this.determineTerrainTypeCornerMask(d, x, y, w, h, type, layer + 1));
                                setEdgeTileUv(atlasUvData, idx + 3, type, this.determineTerrainTypeEdgeMask(d, x, y, w, h, type, layer + 1));
                            }
                        }
                    }
                    var atlasUvLayerTexture = new THREE.DataTexture(atlasUvData, layerMap.naturalWidth, layerMap.naturalHeight, THREE.RGBAFormat);
                    atlasUvLayerTexture.wrapS = THREE.RepeatWrapping;
                    atlasUvLayerTexture.wrapT = THREE.RepeatWrapping;
                    atlasUvLayerTexture.minFilter = THREE.NearestFilter;
                    atlasUvLayerTexture.magFilter = THREE.NearestFilter;
                    atlasUvLayerTexture.needsUpdate = true;

                    atlasUvTextures.push(atlasUvLayerTexture);
                }

                return new TerrainLayerMapData(this.atlasData, atlasUvTextures, layerMap, layerMap.naturalWidth, layerMap.naturalHeight);
            }
            );
    } //load
}
interface ITerrainSceneBuilder {
    build(td: TerrainGeometryData, tl: TerrainLayerMapData);
}

class TerrainSceneBuilder implements ITerrainSceneBuilder {

    private atlasImage: HTMLImageElement;

    constructor(private scene: any) {
    }

    build(td: TerrainGeometryData, tl: TerrainLayerMapData): void {

        //  Build the atlas texture
        this.atlasImage = tl.atlasData.atlasImage;
        var atlasTexture = new THREE.Texture(this.atlasImage);
        atlasTexture.wrapS = THREE.RepeatWrapping;
        atlasTexture.wrapT = THREE.RepeatWrapping;
        atlasTexture.minFilter = THREE.NearestFilter;
        atlasTexture.magFilter = THREE.NearestFilter;
        atlasTexture.flipY = false;
        atlasTexture.needsUpdate = true;

        ////  Build atlas UV lookup texture to make it easier to retrieve tile offsets
        //var atlasUvLookupTextureData = new Uint8Array(4 * 256);
        //for (var i = 0; i < ta.atlasUvData.

        //var atlasUvLookupTexture = new THREE.DataTexture(atlasUvLookupTextureData, 256, 1, THREE.RGBAFormat);
        //atlasUvLookupTexture.minFilter = THREE.NearestFilter;
        //atlasUvLookupTexture.magFilter = THREE.NearestFilter;
        //atlasUvLookupTexture.needsUpdate = true;

        //  Create the terrain shader
        var uniforms: any = {
            atlasTexture: { type: "t", value: atlasTexture }
        };
        var atlasUvTextureNames = new Array<string>();
        for (var i = 0; i < tl.atlasUvTextures.length; ++i) {
            uniforms["atlasUvTexture" + i] = { type: "t", value: tl.atlasUvTextures[i] };
            atlasUvTextureNames.push("atlasUvTexture" + i);
            atlasUvTextureNames.push("atlasUvTexture" + i);
        }
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
            "const float aw = float(" + tl.atlasData.atlasImage.naturalWidth + ");",
            "const float atlasTileWidth = float(" + (tl.atlasData.atlasImage.naturalWidth / (256.0 * 32.0)) + ");",
            "const float atlasU = " + 1.0 / tl.atlasData.atlasImage.naturalWidth + ";",
            "const float atlasV = " + 1.0 / tl.atlasData.atlasImage.naturalHeight + ";",
            "const float atlasTileU = " + 32.0 / tl.atlasData.atlasImage.naturalWidth + ";",
            "const float atlasTileV = " + 32.0 / tl.atlasData.atlasImage.naturalHeight + ";",
            "const float atlasTileUx = " + 31.0 / tl.atlasData.atlasImage.naturalWidth + ";",
            "const float atlasTileVx = " + 31.0 / tl.atlasData.atlasImage.naturalHeight + ";",
            "const float atlasUvUoff = float(" + 0.5 / tl.atlasUvTextureWidth + ");",
            "const float atlasUvVoff = float(" + 0.5 / tl.atlasUvTextureHeight + ");",
            "const float tileResolution = 128.0;",
            "const float tileResolutionUvOffset = 0.5 / tileResolution;",
            THREE.ShaderChunk['common'],
            THREE.ShaderChunk["shadowmap_pars_fragment"],
            "void main() {",
            "vec2 mapUv = vUv;",
            "vec2 uv = (vUv * tileResolution) + vec2(tileResolutionUvOffset, tileResolutionUvOffset);",
            "vec2 uvoff = ((uv - floor(uv)) * vec2(atlasTileUx, atlasTileVx));",
            "float ralpha = 1.0;",
            "vec4 groundColour = vec4(0, 0, 0, 0);",
            (function () {
                return atlasUvTextureNames
                    .reverse()
                //.filter(function (val, idx) { return idx > 0; })   //  skip???
                    .map(function (texName, idx0) { //  selectMany???
                        var idx = atlasUvTextureNames.length - (idx0 + 1);
                        var layerUvsVar = "layer" + idx + "Uvs";
                        var layerCornerUvOffsetExpr = layerUvsVar + (idx % 2 == 0 ? ".r" : ".b");
                        var layerEdgeUvOffsetExpr = layerUvsVar + (idx % 2 == 0 ? ".g" : ".a");
                        var layerCornerUvVar = "layer" + idx + "CornerUv";
                        var layerEdgeUvVar = "layer" + idx + "EdgeUv";
                        var layerColourVar = "layer" + idx + "Colour";
                        var setup = [
                            "vec4 " + layerUvsVar + " = texture2D(" + texName + ", mapUv);",
                            "vec2 " + layerCornerUvVar + " = vec2(mod(" + layerCornerUvOffsetExpr + "*32.0*255.0, aw)*atlasU, floor((" + layerCornerUvOffsetExpr + "*32.5*255.0)/aw)*atlasTileV) + uvoff;",
                            "vec2 " + layerEdgeUvVar + " = vec2(mod(" + layerEdgeUvOffsetExpr + "*32.0*255.0, aw)*atlasU, floor((" + layerEdgeUvOffsetExpr + "*32.0*255.0)/aw)*atlasTileV) + uvoff;",
                            "vec4 " + layerColourVar + " = max(texture2D(atlasTexture, " + layerCornerUvVar + "), texture2D(atlasTexture, " + layerEdgeUvVar + ")) * ralpha;",
                        ];
                        if (idx > 0) {
                            setup = setup.concat([
                                "groundColour += vec4(" + layerColourVar + ".rgb*" + layerColourVar + ".a, " + layerColourVar + ".a);",
                                "ralpha -= " + layerColourVar + ".a;"
                            ]);
                        }
                        else {
                            setup = setup.concat([
                                "groundColour += " + layerColourVar + ";"
                            ]);
                        }
                        return setup.join("\n");
                    }).join("\n");
            })(),
            "vec4 clayer = groundColour;",
            "gl_FragColor = clayer * (0.25 + max(0.0, dot(vecNormal, directionalLightDirection) * 0.75));",
            "}"
        ].join("\n");

        var lightUniforms = THREE.UniformsLib['lights'];
        for (var property in lightUniforms) {
            uniforms[property] = lightUniforms[property];
        }
        var shadowUniforms = THREE.UniformsLib["shadowmap"];
        for (var property in shadowUniforms) {
            uniforms[property] = shadowUniforms[property];
        }
        var groundMaterial = new THREE.ShaderMaterial({
            uniforms: uniforms, //THREE.UniformsUtils.merge(uniforms, THREE.UniformsLib['lights']),
            vertexShader: vshader,
            fragmentShader: fshader,
            lights: true
        });
        var ground = new THREE.Mesh(td.geometry, groundMaterial);
        //ground.rotation.x = -0.5 * Math.PI;
        //ground.position.set(0, 0, 0);
        ground.uvsNeedUpdate = true;
        //ground.castShadow = true;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }
}