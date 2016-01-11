
function clamp(v, min, max) {
    return v < min ? min : (v > max ? max : v);
}

function lerp(x, y, t) {
    return x * (1 - t) + y * t;
}

function bilinearFilter(x, y, v00, v10, v01, v11) {
    var v00_10 = lerp(v00, v10, x);
    var v01_11 = lerp(v01, v11, x);
    return lerp(v00_10, v01_11, y);
}

function terrainGeometry() {
    var _this = this;
    function groundHeight(ix, iy) {
        return _this.data.geometry.vertices[ix + iy * _this.data.widthSamples].z;
    }
    this.data = null;
    this.getY = function (x, z) {
        if (!_this.data) {
            return 0.0;
        }
        var data = _this.data;
        //geometry, width, height, widthSamples, heightSamples
        var ox = (x + data.width / 2) * (data.widthSamples / data.width);
        var oy = (z + data.height / 2) * (data.heightSamples / data.height);
        var fx = Math.floor(ox);
        var fy = Math.floor(oy);
        var ix = clamp(fx, 0, data.widthSamples);
        var iy = clamp(fy, 0, data.heightSamples);

        //  Cheesy bilinear smoothing - we're rendering non-depth tested sprites so Y doesn't need to be super accurate...
        var y = bilinearFilter(ox - fx, oy - fy, groundHeight(ix, iy), groundHeight(ix + 1, iy), groundHeight(ix, iy + 1), groundHeight(ix + 1, iy + 1));
        return y;
    }
}

function drawImage(context, img, x, y, flipX, flipY, rotation) {
    context.strokeStyle = "red";
    context.rect(x, y, img.naturalWidth, img.naturalHeight)
    context.stroke();
    context.save();
    context.translate(x+img.naturalWidth / 2, y+img.naturalHeight / 2);
    context.rotate(rotation);
    context.translate(-img.naturalWidth / 2, -img.naturalHeight / 2);
    context.drawImage(img, 0, 0);
    context.restore();
}

function nextPowerOf2(v) {
    v--;
    v |= v >> 1;
    v |= v >> 2;
    v |= v >> 4;
    v |= v >> 8;
    v |= v >> 16;
    return v + 1;
}

//  Deferred image loader using JQuery promises
function loadImageDeferred(src) {
    var deferred = $.Deferred();
    var img = new Image();
    img.onload = function () {
        deferred.resolve(img);
    };
    img.onerror = function () {
        deferred.reject(img);
    };
    img.onabort = function () {
        deferred.reject(img);
    };
    img.src = src;
    return deferred.promise();
}

function canvasImage(canvas, img, w, h) {
    canvas.width = w !== undefined ? w : img.naturalWidth;
    canvas.height = h !== undefined ? h : img.naturalHeight;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return ctx;
}

function terrainSimpleMapInterpreter(groundMapData, atlasUvData) {

    var colourToType = [
        { colour: 0xffffff, layer: 0, tileset: 0 },
        { colour: 0x000000, layer: 1, tileset: 0 }
    ];

    this.width = groundMapData.naturalWidth;
    this.height = groundMapData.naturalHeight;

    //  Capture the ground map in a canvas so we can access it
    var canvas = document.createElement("canvas");
    var ctx = canvasImage(canvas, groundMapData);
    var gd = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var stride = groundMapData.width * 4;
    function clampx(x) { return clamp(x, 0, groundMapData.width); };
    function clampy(y) { return clamp(y, 0, groundMapData.height); };

    function getTerrainTypeAt(x, y) {
        var idx = clampx(x) + clampy(y) * stride;
        var colour = (data[idx] << 16) | (data[idx + 1] << 8) | data[idx + 2];
        for (var i = 0; i < colourToType.length; ++i) {
            if (colourToType[i].colour == colour) {
                return colourToType[i];
            }
        }
        throw "no type matching colour R: " + data[idx + 0] + " G: " + data[idx + 1] + " B: " + data[idx + 2] + " found at index " + idx;
    }

    function isTerrainTypeVisibleInSimpleFormat(x, y, type) {
        return getTerrainTypeAt(x, y) == type;
    }

    function determineTerrainLayerCornerTransitionMask(x, y, layer) {
        var c = getTerrainTypeAt(x, y);
        if (c.layer >= layer) {
            return 0;
        }

        var t = isTerrainTypeVisibleInSimpleFormat(x + 0, y + 1, layer);
        var l = isTerrainTypeVisibleInSimpleFormat(x + 1, y + 0, layer);
        var r = isTerrainTypeVisibleInSimpleFormat(x - 1, y + 0, layer);
        var b = isTerrainTypeVisibleInSimpleFormat(x + 0, y - 1, layer);

        var tl = isTerrainTypeVisibleInSimpleFormat(x + 1, y + 1, layer) && !(t || l);
        var tr = isTerrainTypeVisibleInSimpleFormat(x - 1, y + 1, layer) && !(t || r);
        var bl = isTerrainTypeVisibleInSimpleFormat(x + 1, y - 1, layer) && !(b || l);
        var br = isTerrainTypeVisibleInSimpleFormat(x - 1, y - 1, layer) && !(b || r);

        return ((tr ? 1 : 0) | (tl ? 2 : 0) | (bl ? 4 : 0) | (br ? 8 : 0));
    }

    function determineTerrainTypeEdgeOpacityMaskIndexInSimpleFormat(data, x, y, w, h, layer) {
        if (isTerrainTypeVisibleInSimpleFormat(data, x, y, w, h, layer)) {
            return 0;
        }
        var t = isTerrainTypeVisibleInSimpleFormat(data, x + 0, y + 1, w, h, layer);
        var l = isTerrainTypeVisibleInSimpleFormat(data, x - 1, y + 0, w, h, layer);
        var r = isTerrainTypeVisibleInSimpleFormat(data, x + 1, y + 0, w, h, layer);
        var b = isTerrainTypeVisibleInSimpleFormat(data, x + 0, y - 1, w, h, layer);
        return ((l ? 1 : 0) | (t ? 2 : 0) | (r ? 4 : 0) | (b ? 8 : 0));
    }

    this.createLayerReader = function (layer) {

        var layerData = atlasUvData.layers[layer];

        return new function () {
            this.getCornerTileOffsetForLayer = function (x, y) {

            };
            this.getEdgeTileOffsetForLayer = function (x, y) {

            }
        };
    }
}

// Loads a terrain ground map from an image. From the image, the loader generates a texture for shader input, where
//  R = Layer 0 atlas offset ((U, V) = ((Offset * TileSize % Atlas Width) / TileSize, floor(Offset * TileSize / Atlas Height) / 32)
//  G = Layer 1 atlas offset ((U, V) = ((Offset * TileSize % Atlas Width) / TileSize, floor(Offset * TileSize / Atlas Height) / 32)
//  B = Layer 2 atlas offset ((U, V) = ((Offset * TileSize % Atlas Width) / TileSize, floor(Offset * TileSize / Atlas Height) / 32)
//  A = Layer 3 atlas offset ((U, V) = ((Offset * TileSize % Atlas Width) / TileSize, floor(Offset * TileSize / Atlas Height) / 32)
function terrainMapLoader(groundMap, atlasUv, atlas) {
    
    //  The ground map texture stores the tile index for each of the four terrain layers.
    //  The index is converted by the terrain shader into a (u,v) 
    function createGroundMapUvLookupTexture(mapDataInterpreter, layer0Type, layer1Type) {

        var layer0Reader = mapDataInterpreter.createLayerReader(layer0Type);
        var layer1Reader = mapDataInterpreter.createLayerReader(layer1Type);

        //  Can't create a texture direct from processing a canvas with the ground map drawn to it as CANVAS PREMULTIPLIES THE FUCKING ALPHA
        var data = new Uint8Array(groundMapData.naturalWidth * groundMapData.naturalHeight * 4);
        var idx = 0;
        for (var y = 0; y < groundMapData.naturalHeight; ++y) {
            for (var x = 0; x < groundMapData.naturalWidth; ++x, idx += 4) {
                data[idx + 0] = layer0Reader.getEdgeTileOffsetForLayer(x, y);
                data[idx + 1] = layer0Reader.getCornerTileOffsetForLayer(x, y);
                data[idx + 2] = layer1Reader.getEdgeTileOffsetForLayer(x, y);
                data[idx + 3] = layer1Reader.getCornerTileOffsetForLayer(x, y);
            }
        }
        var texture = new THREE.DataTexture(data, groundMapData.naturalWidth, groundMapData.naturalHeight, THREE.RGBAFormat);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        return texture;
    }

    
    function createGroundMapUvLookupTextures(mapDataInterpreter) {
        return [createGroundMapUvLookupTexture(mapDataInterpreter, 0, 1)];
    }

    function atlasTexture(atlasTextureUrl) {
        var texture = THREE.ImageUtils.loadTexture(atlasTextureUrl);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        return texture;
    }

    //  Returns a promise to reload
    this.reload = function () {
        return $.when(
            loadImageDeferred(groundMapUrl),
            $.getJSON(atlasUvUrl)
        ).done(function (groundMapData, atlasUvData) {
            var groundMapInterpreter = new terrainSimpleMapInterpreter(atlasUvData);
            return {
                groundMapCornerUvLookupTexture: createGroundMapUvLookupTexture(groundMapData, groundMapInterpreter),
                groundMapEdgeUvLookupTexture: createGroundMapUvLookupTexture(groundMapData, groundMapInterpreter),
                atlasTexture: atlasTexture(atlasUrl)
            };
        });
    }

    this.reload();
}

function terrainLoader(scene, groundMapUrl, groundHeightUrl, opacityMaskUrl, terrainTypeUrls, testCanvas) {
    var terrainTypeTextures = [];
    for (var i = 0; i < terrainTypeUrls.length; ++i) {
        var texture = THREE.ImageUtils.loadTexture(terrainTypeUrls[i]);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        terrainTypeTextures.push(texture);
    }
    var cornerAndEdgeOpacityTexture = THREE.ImageUtils.loadTexture(opacityMaskUrl);
    cornerAndEdgeOpacityTexture.magFilter = THREE.NearestFilter;
    cornerAndEdgeOpacityTexture.minFilter = THREE.NearestFilter;
    cornerAndEdgeOpacityTexture.wrapS = THREE.RepeatWrapping;
    cornerAndEdgeOpacityTexture.wrapT = THREE.RepeatWrapping;
    cornerAndEdgeOpacityTexture.generateMipmaps = false;
    cornerAndEdgeOpacityTexture.needsUpdate = true;
    cornerAndEdgeOpacityTexture.flipY = false;  //  ????? https://github.com/threeDart/three.dart/issues/124 see below also

    var terrain = new terrainGeometry();
    //  Ground map
    //      This stores (tile type, tile visibility) per layer
    //  R = layer 0 tile type, vis
    //  G = Layer 1 tile type, vis
    //  B = Layer 2 tile type, vis
    //  A = Layer 3 tile type, vis
    //  Temporarily, this is generated as a single RGBA bitmap with colours representing layers.
    //  That's because we only have a 
    var groundMapData = new Image();
    var groundHeightData = new Image();

    var colourToType = [];
    colourToType.push({ colour: 0xffffff, type: 0 });
    colourToType.push({ colour: 0x000000, type: 1 });
    function getTypeFromColour(data, idx) {
        var colour = (data[idx] << 16) | (data[idx + 1] << 8) | data[idx + 2];
        for (var i = 0; i < colourToType.length; ++i) {
            if (colourToType[i].colour == colour) {
                return colourToType[i];
            }
        }
        throw "no type matching colour R: " + data[idx + 0] + " G: " + data[idx + 1] + " B: " + data[idx + 2] + " found at index " + idx;
    }

 
    function getCanvas(dstCanvas, width, height) {
        if (dstCanvas) {
            return dstCanvas;
        }
        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }

    function applyHeightMap(data) {
        var canvas = document.createElement("canvas");
        var ctx = canvasImage(canvas, groundHeightData, data.widthSamples, data.heightSamples);
        var gd = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < data.geometry.vertices.length; i++) {
            data.geometry.vertices[i].z = gd.data[i * 4] / 5;
        }
        data.geometry.computeFaceNormals();
        data.geometry.computeVertexNormals();
    }

    //  The ground map texture stores the tile type for each of the four terrain layers
    //  For the time being, this is simply 0 - as more terrain types are added this function will need to be modified
    function createGroundMapTextureFromSimpleFormat() {
        //  Can't create a texture direct from processing a canvas with the ground map drawn to it as CANVAS PREMULTIPLIES THE FUCKING ALPHA
        var data = new Uint8Array(groundMapData.naturalWidth * groundMapData.naturalHeight * 4);
        var maxIdx = groundMapData.naturalWidth * groundMapData.naturalHeight * 4;
        var canvas = document.createElement("canvas");
        var ctx = canvasImage(canvas, groundMapData);
        var gd = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (var idx = 0; idx < maxIdx; idx += 4) {
            var terrainType = getTypeFromColour(gd.data, idx);
            data[idx + 0] = terrainType.type == 0 ? 255 : 0;
            data[idx + 1] = terrainType.type == 1 ? 255 : 0;
            data[idx + 2] = terrainType.type == 2 ? 255 : 0;
            data[idx + 3] = terrainType.type == 3 ? 255 : 0;
        }
        var texture = new THREE.DataTexture(data, groundMapData.naturalWidth, groundMapData.naturalHeight, THREE.RGBAFormat);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        return texture;
    }


    function getTerrainTypeFromSimpleFormat(data, x, y, w, h) {
        var rx = x < 0 ? 0 : (x >= w ? w - 1 : x);
        var ry = y < 0 ? 0 : (y >= h ? h - 1 : y);
        return getTypeFromColour(data, (rx + ry * w) * 4).type;
    }

    function isTerrainTypeVisibleInSimpleFormat(data, x, y, w, h, type) {
        return getTerrainTypeFromSimpleFormat(data, x, y, w, h) == type;
    }

    function determineTerrainTypeCornerOpacityMaskIndexInSimpleFormat(data, x, y, w, h, type) {
        var c = getTerrainTypeFromSimpleFormat(data, x, y, w, h, type);
        if (c >= type) {
            return 0;
        }

        var t = isTerrainTypeVisibleInSimpleFormat(data, x + 0, y + 1, w, h, type);
        var l = isTerrainTypeVisibleInSimpleFormat(data, x + 1, y + 0, w, h, type);
        var r = isTerrainTypeVisibleInSimpleFormat(data, x - 1, y + 0, w, h, type);
        var b = isTerrainTypeVisibleInSimpleFormat(data, x + 0, y - 1, w, h, type);

        var tl = isTerrainTypeVisibleInSimpleFormat(data, x + 1, y + 1, w, h, type) && !(t || l);
        var tr = isTerrainTypeVisibleInSimpleFormat(data, x - 1, y + 1, w, h, type) && !(t || r);
        var bl = isTerrainTypeVisibleInSimpleFormat(data, x + 1, y - 1, w, h, type) && !(b || l);
        var br = isTerrainTypeVisibleInSimpleFormat(data, x - 1, y - 1, w, h, type) && !(b || r);

        return ((tr ? 1 : 0) | (tl ? 2 : 0) | (bl ? 4 : 0) | (br ? 8 : 0));
    }

    function determineTerrainTypeEdgeOpacityMaskIndexInSimpleFormat(data, x, y, w, h, type) {
        if (isTerrainTypeVisibleInSimpleFormat(data, x, y, w, h, type)) {
            return 0;
        }
        var t = isTerrainTypeVisibleInSimpleFormat(data, x + 0, y + 1, w, h, type);
        var l = isTerrainTypeVisibleInSimpleFormat(data, x - 1, y + 0, w, h, type);
        var r = isTerrainTypeVisibleInSimpleFormat(data, x + 1, y + 0, w, h, type);
        var b = isTerrainTypeVisibleInSimpleFormat(data, x + 0, y - 1, w, h, type);
        return ((l ? 1 : 0) | (t ? 2 : 0) | (r ? 4 : 0) | (b ? 8 : 0));
    }

    //  The group map corner texture stores the layer types at each of the 4 corners of a texel on the ground map
    function createGroundMapAdjacencyTextureFromSimpleFormat(determineOpacityMaskFunc) {
        var canvas = document.createElement("canvas");
        var ctx = canvasImage(canvas, groundMapData);
        var gd = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var gdc = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var idx = 0;
        var w = canvas.width, h = canvas.height;
        for (var y = 0; y < h; ++y) {
            for (var x = 0; x < w; ++x, idx += 4) {
                gdc.data[idx + 0] = determineOpacityMaskFunc(gd.data, x, y, w, h, 0);
                gdc.data[idx + 1] = determineOpacityMaskFunc(gd.data, x, y, w, h, 1);
                gdc.data[idx + 2] = determineOpacityMaskFunc(gd.data, x, y, w, h, 2);
                gdc.data[idx + 3] = 255; //determineOpacityMaskFunc(gd.data, x, y, w, h, 3); // HACK BECAUSE OF STUPID CANVAS ALPHA PREMULTIPLICATION REMOVEME AND PROCESS AS BYTE ARRAY
            }
        }

        ctx.putImageData(gdc, 0, 0);
        var texture = new THREE.Texture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        return texture;
    }

    function initializeFromData() {
        var data = {
            width: groundMapData.naturalWidth * 4,
            height: groundMapData.naturalHeight * 4
        };
        data.widthSamples = data.width / 2;
        data.heightSamples = data.height / 2;
        data.geometry = new THREE.PlaneGeometry(data.width, data.height, data.widthSamples - 1, data.heightSamples - 1);
        applyHeightMap(data);

        terrain.data = data;

        var groundMapTexture = createGroundMapTextureFromSimpleFormat();
        var groundMapCornerTexture = createGroundMapAdjacencyTextureFromSimpleFormat(determineTerrainTypeCornerOpacityMaskIndexInSimpleFormat);
        var groundMapEdgeTexture = createGroundMapAdjacencyTextureFromSimpleFormat(determineTerrainTypeEdgeOpacityMaskIndexInSimpleFormat);
        var groundMapWidth = groundMapData.width;
        var groundMapHeight = groundMapData.height;

        var uniforms = {
            terrainTypeTextures: { type: "tv", value: terrainTypeTextures },
            groundMapTexture: { type: "t", value: groundMapTexture},
            groundMapCornerTexture: { type: "t", value: groundMapCornerTexture },
            groundMapEdgeTexture: { type: "t", value: groundMapEdgeTexture },
            cornerAndEdgeOpacityTexture: { type: "t", value: cornerAndEdgeOpacityTexture }
        };
        var vshader = [
            "varying vec3 vecNormal;",
            "varying vec2 vUv;",
            THREE.ShaderChunk["shadowmap_pars_vertex"],
            "void main() {",
                "vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
                "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
                "vecNormal = normalize(normalMatrix * normal);",
                THREE.ShaderChunk["shadowmap_vertex"],
                "vUv = uv;",
                "gl_Position = projectionMatrix * mvPosition;",
            "}"
        ].join("\n");
        //  The plane seen from above
        //  1|
        //   |
        //  V|
        //   |______
        //   0  U   1
        //  Flipping issue: https://github.com/mrdoob/three.js/issues/277
        //  Hmmm...
        var fshader = [
            "varying vec3 vecNormal;",
            "uniform sampler2D terrainTypeTextures[" + terrainTypeTextures.length + "];",
            "uniform sampler2D groundMapTexture;",
            "uniform sampler2D groundMapCornerTexture;",
            "uniform sampler2D groundMapEdgeTexture;",
            "uniform sampler2D cornerAndEdgeOpacityTexture;",
            "uniform vec3 directionalLightDirection;",
            "varying vec2 vUv;",
            "const float opU = " + 1.0 / 2048.0 + ";",
            "const float cornerOpacityV = " + 1.0 / 256.0 + ";",
            "const float edgeOpacityV = " + 72.0 / 256.0 + ";",
            "const float opacityMul = " + 255.0 * 72.0 / 2048.0 + ";",
            THREE.ShaderChunk[ 'common'],
            THREE.ShaderChunk["shadowmap_pars_fragment"],
            "void main() {",
                "vec3 outgoingLight = vec3(1.0);",
                "vec2 mapUv = vUv;",
                "vec4 corner = texture2D(groundMapCornerTexture, mapUv);",
                "vec4 edge = texture2D(groundMapEdgeTexture, mapUv);",
                "vec4 mid = texture2D(groundMapTexture, mapUv);", //
                "vec2 uv = (vUv * 64.0) + vec2(0.5/64.0, 0.5/64.0);",   //  Required to offset the texel lookups correctly
                "vec2 uvoff = ((uv - floor(uv))) / vec2(32.0, 4.0);",
                "float t1corner = texture2D(cornerAndEdgeOpacityTexture, vec2(corner.g * opacityMul, cornerOpacityV) + uvoff).r;",
                "float t1edge = texture2D(cornerAndEdgeOpacityTexture, vec2(edge.g * opacityMul, edgeOpacityV) + uvoff).r;",
                "float t1Alpha = (mid.g + max(t1corner, t1edge));", // This would be multiplied by (1.0 - t2Alpha)
                "float t0Alpha = (1.0 - t1Alpha);",
                //"vec2 uvoff2 = (uv - floor(uv));",
                "vec4 t0 = texture2D(terrainTypeTextures[0], uv) * t0Alpha;",
                "vec4 t1 = texture2D(terrainTypeTextures[1], uv) * t1Alpha;",
                THREE.ShaderChunk["shadowmap_fragment"],
                //"gl_FragColor = (t0 + t1) * (0.25 + max(0.0, dot(vecNormal, directionalLightDirection) * 0.75));",
                //"gl_FragColor = (t0 + t1) * vec4(outgoingLight, 1.0); //(0.25 + max(0.0, dot(vecNormal, directionalLightDirection) * 0.75));",
                "gl_FragColor = (t0 + t1) * (0.25 + max(0.0, dot(vecNormal, directionalLightDirection) * 0.75));",
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
        var u = THREE.UniformsLib['lights'];
        groundMaterial.needsUpdate = true;
        var ground = new THREE.Mesh(data.geometry, groundMaterial);
        ground.rotation.x = -0.5 * Math.PI;
        ground.position.set(0, 0, 0);
        ground.uvsNeedUpdate = true;
        //ground.castShadow = true;
        ground.receiveShadow = true;
        scene.add(ground);
    }
    function loadImages(urls, callback, imgArray) {
        var remaining = urls.length;
        var images = !imgArray ? [] : imgArray;
        function handleLoad(url) {
            console.log("Loaded image from URL " + url);
            if (--remaining == 0) {
                callback(images);
            }
        }
        function getImage(i) {
            if (imgArray) {
                return imgArray[i];
            }
            var image = new Image();
            images[i] = image;
            return image;
        };
        function loadImage(url) {
            var image = getImage(i);
            image.addEventListener("load", function () { handleLoad(url); });
            image.src = url;
            if (image.complete) {
                --remaining;
            }
        }
        for (var i = 0; i < urls.length; ++i) {
            loadImage(urls[i]);
        }
        if (remaining == 0) {
            callback();
        }
    }
    loadImages([groundMapUrl, groundHeightUrl], initializeFromData, [groundMapData, groundHeightData]);

    return terrain;
}