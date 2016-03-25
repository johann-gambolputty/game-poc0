var TerrainBufferGeometry;
(function (TerrainBufferGeometry) {
    function build(width, height, widthSegments, heightSegments, heightFunc) {
        var width_half = width / 2;
        var height_half = height / 2;
        var gridX = widthSegments || 1;
        var gridY = heightSegments || 1;
        var gridX1 = gridX + 1;
        var gridY1 = gridY + 1;
        var segment_width = width / gridX;
        var segment_height = height / gridY;
        var positions = new Float32Array(gridX1 * gridY1 * 3);
        var normals = new Float32Array(gridX1 * gridY1 * 3);
        var uvs = new Float32Array(gridX1 * gridY1 * 2);
        var offset = 0;
        var offset2 = 0;
        //  Grid is a series of quads with separate vertices
        for (var iy = 0; iy < gridY1; iy++) {
            var y = iy * segment_height - height_half;
            for (var ix = 0; ix < gridX1; ix++) {
                var x = ix * segment_width - width_half;
                positions[offset] = x;
                positions[offset + 1] = heightFunc(ix, iy);
                positions[offset + 2] = y;
                uvs[offset2] = ix / gridX;
                uvs[offset2 + 1] = (iy / gridY);
                offset += 3;
                offset2 += 2;
            }
        }
        var geom = new THREE.BufferGeometry();
        offset = 0;
        var indices = new ((positions.length / 3) > 65535 ? Uint32Array : Uint16Array)(gridX * gridY * 6);
        for (var iy = 0; iy < gridY; iy++) {
            for (var ix = 0; ix < gridX; ix++) {
                var a = ix + gridX1 * iy;
                var b = ix + gridX1 * (iy + 1);
                var c = (ix + 1) + gridX1 * (iy + 1);
                var d = (ix + 1) + gridX1 * iy;
                indices[offset] = a;
                indices[offset + 1] = b;
                indices[offset + 2] = d;
                indices[offset + 3] = b;
                indices[offset + 4] = c;
                indices[offset + 5] = d;
                offset += 6;
            }
        }
        for (var i = 0; i < positions.length; ++i) {
            if (positions[i] == NaN) {
                throw "Found NaN at index " + i;
            }
            if (normals[i] == NaN) {
                throw "Found NaN normal at index " + i;
            }
        }
        geom.addAttribute('index', new THREE.BufferAttribute(indices, 1));
        geom.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        geom.addAttribute('normal', new THREE.BufferAttribute(normals, 3));
        geom.addAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        geom.computeFaceNormals();
        geom.computeVertexNormals();
        geom.computeBoundingSphere();
        return geom;
    }
    TerrainBufferGeometry.build = build;
})(TerrainBufferGeometry || (TerrainBufferGeometry = {}));
