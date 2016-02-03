var LayerGroundTypePatchBuilder = (function () {
    function LayerGroundTypePatchBuilder(width, height, layer, data) {
        this.width = width;
        this.height = height;
        this.layer = layer;
        this.data = data;
    }
    LayerGroundTypePatchBuilder.prototype.setGroundType = function (x, y, groundType) {
        this.data[x + y * this.width] = groundType;
    };
    return LayerGroundTypePatchBuilder;
})();
var GroundTypePatchBuilder = (function () {
    function GroundTypePatchBuilder(width, height) {
        this.width = width;
        this.height = height;
    }
    GroundTypePatchBuilder.prototype.buildLayer = function (layer) {
        var layerData = new Uint8Array(this.width * this.height);
        this.data.push(layerData);
        return new LayerGroundTypePatchBuilder(this.width, this.height, layer, layerData);
    };
    GroundTypePatchBuilder.prototype.build = function () {
        throw "not implemented";
    };
    return GroundTypePatchBuilder;
})();
var GroundTypePatch = (function () {
    function GroundTypePatch(width, height, groundTypeLayers) {
        this.width = width;
        this.height = height;
        this.groundTypeLayers = groundTypeLayers;
    }
    GroundTypePatch.prototype.supportsLayer = function (layer) {
        return this.groundTypeLayers[layer] != null;
    };
    Object.defineProperty(GroundTypePatch.prototype, "numberOfLayers", {
        get: function () {
            return this.groundTypeLayers.length;
        },
        enumerable: true,
        configurable: true
    });
    GroundTypePatch.prototype.getGroundTypeAt = function (layer, x, y) {
        return this.groundTypeLayers[layer][x + y * this.width];
    };
    return GroundTypePatch;
})();
var Point2d = (function () {
    function Point2d(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point2d;
})();
var Quad2d = (function () {
    function Quad2d(min, max) {
        this.min = min;
        this.max = max;
    }
    return Quad2d;
})();
var GroundTypeUvLookup = (function () {
    function GroundTypeUvLookup(atlas) {
        this.atlas = atlas;
    }
    GroundTypeUvLookup.prototype.getUv = function (groundType) {
        return null;
    };
    return GroundTypeUvLookup;
})();
var TerrainGeometryData = (function () {
    function TerrainGeometryData(geometry, width, height, widthSamples, heightSamples, getHeight) {
        this.geometry = geometry;
        this.width = width;
        this.height = height;
        this.widthSamples = widthSamples;
        this.heightSamples = heightSamples;
        this.getHeight = getHeight;
    }
    TerrainGeometryData.prototype.groundHeight = function (ix, iy) {
        return this.getHeight(ix, iy);
    };
    TerrainGeometryData.prototype.getY = function (x, z) {
        var ox = (x + this.width / 2) * (this.widthSamples / this.width);
        var oy = (z + this.height / 2) * (this.heightSamples / this.height);
        var fx = Math.floor(ox);
        var fy = Math.floor(oy);
        var ix = clamp(fx, 0, this.widthSamples);
        var iy = clamp(fy, 0, this.heightSamples);
        //  Cheesy bilinear interpolation - we're rendering non-depth tested sprites so Y doesn't need to be super accurate...
        var y = bilinearFilter(ox - fx, oy - fy, this.groundHeight(ix, iy), this.groundHeight(ix + 1, iy), this.groundHeight(ix, iy + 1), this.groundHeight(ix + 1, iy + 1));
        return y;
    };
    return TerrainGeometryData;
})();
var TerrainGeometryDataLoader = (function () {
    function TerrainGeometryDataLoader(heightmapUrl, width, height, widthSamples, heightSamples, groundTypeUvLookup) {
        this.heightmapUrl = heightmapUrl;
        this.heightmapProcessor = function (heightMapImage) {
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
            var geometry = new THREE.TerrainGeometry(width, height, widthSamples - 1, heightSamples - 1, function (x, y) { return heightData[x + y * widthSamples]; });
            geometry.computeVertexNormals();
            return new TerrainGeometryData(geometry, width, height, widthSamples, heightSamples, function (x, y) { return heightData[x + y * widthSamples]; });
        };
    }
    TerrainGeometryDataLoader.prototype.load = function () {
        return loadImageDeferred(this.heightmapUrl).pipe(this.heightmapProcessor);
    };
    return TerrainGeometryDataLoader;
})();
var TerrainAtlasData = (function () {
    function TerrainAtlasData(atlasImage, atlasUvData) {
        this.atlasImage = atlasImage;
        this.atlasUvData = atlasUvData;
    }
    return TerrainAtlasData;
})();
var AtlasUvTileInfo = (function () {
    function AtlasUvTileInfo() {
    }
    return AtlasUvTileInfo;
})();
var AtlasUvTileSet = (function () {
    function AtlasUvTileSet() {
    }
    return AtlasUvTileSet;
})();
var AtlasUvData = (function () {
    function AtlasUvData() {
    }
    return AtlasUvData;
})();
var TerrainAtlasDataLoader = (function () {
    function TerrainAtlasDataLoader(atlasUrl, atlasUvUrl) {
        this.loader = function () {
            return $.when(loadImageDeferred(atlasUrl), $.getJSON(atlasUvUrl)).pipe(function (atlasImage, atlasUvData) {
                return new TerrainAtlasData(atlasImage, atlasUvData[0]);
            });
        };
    }
    TerrainAtlasDataLoader.prototype.load = function () {
        return this.loader();
    };
    return TerrainAtlasDataLoader;
})();
var TerrainLayerMapData = (function () {
    function TerrainLayerMapData(atlasData, atlasUvTextures, atlasUvTextureWidth, atlasUvTextureHeight) {
        this.atlasData = atlasData;
        this.atlasUvTextures = atlasUvTextures;
        this.atlasUvTextureWidth = atlasUvTextureWidth;
        this.atlasUvTextureHeight = atlasUvTextureHeight;
    }
    return TerrainLayerMapData;
})();
var ColourToTerrainType = (function () {
    function ColourToTerrainType(colour, layer, type) {
        this.colour = colour;
        this.layer = layer;
        this.type = type;
    }
    return ColourToTerrainType;
})();
var SimpleTerrainLayerMapLoader = (function () {
    function SimpleTerrainLayerMapLoader(layerMapUrl, atlasLoader) {
        this.colourToType = new Array();
        this.colourToType.push({ colour: 0xffffff, type: 0, layer: 0 }); //    TS structural type magic
        this.colourToType.push({ colour: 0xff0000, type: 1, layer: 0 });
        this.colourToType.push({ colour: 0x000000, type: 2, layer: 1 });
        var _this = this;
        this.loader = function () {
            return $.when(loadImageDeferred(layerMapUrl), atlasLoader.load())
                .pipe(function (layerMap, atlasData) {
                var emptyTileUv = 0;
                var tileSize = atlasData.atlasUvData.tileSize;
                var tileSize2 = tileSize * tileSize;
                var tileInfoToUvOffset = function (info) {
                    //  UV for a tile is expressed as a multiple of the basic tile width/height (32)
                    //  To cram into a 1 byte colour component, we divide through by the tile dimensions to get a tile offset
                    return (info.u / tileSize) + (info.v * atlasData.atlasImage.naturalWidth) / tileSize2;
                };
                var mainTileUv = function (type) {
                    return tileInfoToUvOffset(atlasData.atlasUvData.tileSets[type].baseTileInfo);
                };
                var cornerTileUv = function (type, mask) {
                    if (mask == -1) {
                        return mainTileUv(type);
                    }
                    if (mask == 0) {
                        return emptyTileUv;
                    }
                    return tileInfoToUvOffset(atlasData.atlasUvData.tileSets[type].cornerTransitionTileInfos[mask - 1]);
                };
                var setCornerTileUv = function (atlasUvData, atlasUvOffset, type, mask) {
                    if (atlasUvData[atlasUvOffset] == emptyTileUv) {
                        atlasUvData[atlasUvOffset] = cornerTileUv(type, mask);
                    }
                };
                var edgeTileUv = function (type, mask) {
                    if (mask == 0) {
                        return emptyTileUv;
                    }
                    return tileInfoToUvOffset(atlasData.atlasUvData.tileSets[type].edgeTransitionTileInfos[mask - 1]);
                };
                var setEdgeTileUv = function (atlasUvData, atlasUvOffset, type, mask) {
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
                for (var layer = 0; layer < maxLayers; layer += 2) {
                    var currentLayer = layer;
                    var typesOnLayer0 = _this.colourToType.filter(function (ct) { return ct.layer == currentLayer; });
                    var typesOnLayer1 = _this.colourToType.filter(function (ct) { return ct.layer == currentLayer + 1; });
                    var atlasUvData = new Uint8Array(layerMap.naturalWidth * layerMap.naturalHeight * 4);
                    var maxIdx = layerMap.naturalWidth * layerMap.naturalHeight * 4;
                    var layerMapCanvas = document.createElement("canvas");
                    var layerMapContext = canvasImage(layerMapCanvas, layerMap, layerMap.naturalWidth, layerMap.naturalHeight);
                    var layerMapImageData = layerMapContext.getImageData(0, 0, layerMapCanvas.width, layerMapCanvas.height);
                    var w = layerMapCanvas.width;
                    var h = layerMapCanvas.height;
                    var d = layerMapImageData.data;
                    var idx = 0;
                    for (var y = 0; y < h; ++y) {
                        for (var x = 0; x < w; ++x, idx += 4) {
                            for (var typeIndex = 0; typeIndex < typesOnLayer0.length; ++typeIndex) {
                                var type = typesOnLayer0[typeIndex].type;
                                //DEBUG ONLY
                                if (_this.getGroundTypeFromColourXy(d, x, y, w, h).type != type) {
                                    continue;
                                }
                                setCornerTileUv(atlasUvData, idx + 0, type, _this.determineTerrainTypeCornerMask(d, x, y, w, h, type, layer + 0));
                                setEdgeTileUv(atlasUvData, idx + 1, type, _this.determineTerrainTypeEdgeMask(d, x, y, w, h, type, layer + 0));
                            }
                            for (var typeIndex = 0; typeIndex < typesOnLayer1.length; ++typeIndex) {
                                var type = typesOnLayer1[typeIndex].type;
                                setCornerTileUv(atlasUvData, idx + 2, type, _this.determineTerrainTypeCornerMask(d, x, y, w, h, type, layer + 1));
                                setEdgeTileUv(atlasUvData, idx + 3, type, _this.determineTerrainTypeEdgeMask(d, x, y, w, h, type, layer + 1));
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
                return new TerrainLayerMapData(atlasData, atlasUvTextures, layerMap.naturalWidth, layerMap.naturalHeight);
            });
        };
    }
    SimpleTerrainLayerMapLoader.prototype.getTypeFromColour = function (data, idx) {
        var colour = (data[idx] << 16) | (data[idx + 1] << 8) | data[idx + 2];
        for (var i = 0; i < this.colourToType.length; ++i) {
            if (this.colourToType[i].colour == colour) {
                return this.colourToType[i];
            }
        }
        throw "no type matching colour R: " + data[idx + 0] + " G: " + data[idx + 1] + " B: " + data[idx + 2] + " found at index " + idx;
    };
    SimpleTerrainLayerMapLoader.prototype.getGroundTypeFromColourXy = function (data, x, y, w, h) {
        var rx = x < 0 ? 0 : (x >= w ? w - 1 : x);
        var ry = y < 0 ? 0 : (y >= h ? h - 1 : y);
        return this.getTypeFromColour(data, (rx + ry * w) * 4);
    };
    //  Layer 0 [Types]
    //
    SimpleTerrainLayerMapLoader.prototype.isTypeVisible = function (data, x, y, w, h, type) {
        return this.getGroundTypeFromColourXy(data, x, y, w, h).type == type;
    };
    SimpleTerrainLayerMapLoader.prototype.determineTerrainTypeCornerMask = function (data, x, y, w, h, type, layer) {
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
    };
    SimpleTerrainLayerMapLoader.prototype.determineTerrainTypeEdgeMask = function (data, x, y, w, h, type, layer) {
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
    };
    SimpleTerrainLayerMapLoader.prototype.load = function () {
        return this.loader();
    };
    return SimpleTerrainLayerMapLoader;
})();
var TerrainSceneBuilder = (function () {
    function TerrainSceneBuilder(scene) {
        this.builder = function (td, tl, ta) {
            //  Build the atlas texture
            var atlasTexture = new THREE.Texture(tl.atlasData.atlasImage);
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
            var uniforms = {
                atlasTexture: { type: "t", value: atlasTexture }
            };
            var atlasUvTextureNames = new Array();
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
                "const float tileResolution = 64.0;",
                "const float tileResolutionUvOffset = 0.5 / tileResolution;",
                THREE.ShaderChunk['common'],
                THREE.ShaderChunk["shadowmap_pars_fragment"],
                "void main() {", "vec2 mapUv = vUv;",
                "vec2 uv = (vUv * tileResolution) + vec2(tileResolutionUvOffset, tileResolutionUvOffset);",
                "vec2 uvoff = ((uv - floor(uv)) * vec2(atlasTileUx, atlasTileVx));",
                "float ralpha = 1.0;",
                "vec4 groundColour = vec4(0, 0, 0, 0);",
                (function () {
                    return atlasUvTextureNames
                        .reverse()
                        .map(function (texName, idx0) {
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
            console.log(fshader);
            var lightUniforms = THREE.UniformsLib['lights'];
            for (var property in lightUniforms) {
                uniforms[property] = lightUniforms[property];
            }
            var shadowUniforms = THREE.UniformsLib["shadowmap"];
            for (var property in shadowUniforms) {
                uniforms[property] = shadowUniforms[property];
            }
            var groundMaterial = new THREE.ShaderMaterial({
                uniforms: uniforms,
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
            scene.add(ground);
        };
    }
    TerrainSceneBuilder.prototype.build = function (td, tl, ta) {
        this.builder(td, tl, ta);
    };
    return TerrainSceneBuilder;
})();
