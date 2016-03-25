var TerrainDecal = (function () {
    function TerrainDecal(scene, decalTextureUrl, decalUvRect, groundArea, getY) {
        this.scene = scene;
        var widthSegs = 4;
        var heightSegs = 4;
        var vertWidth = widthSegs + 1;
        var vertHeight = heightSegs + 1;
        var numVerts = vertWidth * vertHeight;
        var positions = new Float32Array(numVerts * 3);
        var normals = new Float32Array(numVerts * 3);
        var uvs = new Float32Array(numVerts * 2);
        var pxStep = groundArea.width / widthSegs;
        var pzStep = groundArea.height / heightSegs;
        var uStep = 1 / widthSegs;
        var vStep = 1 / heightSegs;
        var posoff = 0;
        var normoff = 0;
        var uvoff = 0;
        var pz = groundArea.miny;
        var v = 0;
        for (var verty = 0; verty < vertHeight; ++verty, pz += pzStep, v += vStep) {
            var px = groundArea.minx;
            var u = 0;
            for (var vertx = 0; vertx < vertWidth; ++vertx, posoff += 3, normoff += 3, uvoff += 3, px += pxStep, u += uStep) {
                positions[posoff + 0] = px;
                positions[posoff + 1] = getY(px, pz) + 0.1;
                positions[posoff + 2] = pz;
                normals[normoff + 0] = 0;
                normals[normoff + 1] = 1;
                normals[normoff + 2] = 0;
                uvs[uvoff + 0] = u;
                uvs[uvoff + 1] = v;
            }
        }
        var idxoff = 0;
        var indices = new Uint16Array(widthSegs * heightSegs * 6);
        for (var iy = 0; iy < heightSegs; ++iy) {
            for (var ix = 0; ix < widthSegs; ++ix, idxoff += 6) {
                var a = ix + vertWidth * iy;
                var b = a + vertWidth;
                var c = a + vertWidth + 1;
                var d = a + 1;
                indices[idxoff] = a;
                indices[idxoff + 1] = b;
                indices[idxoff + 2] = d;
                indices[idxoff + 3] = b;
                indices[idxoff + 4] = c;
                indices[idxoff + 5] = d;
            }
        }
        var geom = new THREE.BufferGeometry();
        geom.addAttribute('index', new THREE.BufferAttribute(indices, 1));
        geom.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        geom.addAttribute('normal', new THREE.BufferAttribute(normals, 3));
        geom.addAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        var decal = new THREE.Mesh(geom, new THREE.MeshBasicMaterial({ depthTest: true, transparent: false, wireframe: true, color: "#FFFF00" }));
        scene.add(decal);
    }
    return TerrainDecal;
})();
