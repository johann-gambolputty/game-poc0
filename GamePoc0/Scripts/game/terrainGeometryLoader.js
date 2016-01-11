var TerrainGeometryAccess = (function () {
    function TerrainGeometryAccess(geometry, width, height, widthSamples, heightSamples) {
        this.geometry = geometry;
        this.heightSamples = heightSamples;
        this.widthSamples = widthSamples;
    }
    TerrainGeometryAccess.prototype.groundHeight = function (ix, iy) {
        return this.geometry.vertices[ix + iy * this.widthSamples].z;
    };
    TerrainGeometryAccess.prototype.getY = function (x, z) {
        var ox = (x + this.width / 2) * (this.widthSamples / this.width);
        var oy = (z + this.height / 2) * (this.heightSamples / this.height);
        var fx = Math.floor(ox);
        var fy = Math.floor(oy);
        var ix = clamp(fx, 0, this.widthSamples);
        var iy = clamp(fy, 0, this.heightSamples);
        //  Cheesy bilinear smoothing - we're rendering non-depth tested sprites so Y doesn't need to be super accurate...
        var y = bilinearFilter(ox - fx, oy - fy, this.groundHeight(ix, iy), this.groundHeight(ix + 1, iy), this.groundHeight(ix, iy + 1), this.groundHeight(ix + 1, iy + 1));
        return y;
    };
    return TerrainGeometryAccess;
})();
var TerrainData = (function () {
    function TerrainData(access, geometry) {
    }
    return TerrainData;
})();
var TerrainDataLoader = (function () {
    function TerrainDataLoader(heightmapUrl, width, height, widthSamples, heightSamples) {
        this.heightmapUrl = heightmapUrl;
        this.heightmapProcessor = function (heightMapImage) {
            var canvas = document.createElement("canvas");
            var ctx = canvasImage(canvas, heightMapImage, this.widthSamples, this.heightSamples);
            var gd = ctx.getImageData(0, 0, canvas.width, canvas.height);
            var geometry = new THREE.PlaneGeometry(width, height, widthSamples - 1, heightSamples - 1);
            for (var i = 0; i < geometry.vertices.length; i++) {
                geometry.vertices[i].z = gd.data[i * 4] / 5;
            }
            geometry.computeFaceNormals();
            geometry.computeVertexNormals();
            return geometry;
        };
    }
    TerrainDataLoader.prototype.load = function () {
        return loadImageDeferred(this.heightmapUrl).pipe(this.heightmapProcessor);
    };
    return TerrainDataLoader;
})();
