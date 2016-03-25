var Rect = (function () {
    function Rect(minx, miny, width, height) {
        this.minx = minx;
        this.miny = miny;
        this.width = width;
        this.height = height;
    }
    return Rect;
})();
var Vector2d = (function () {
    function Vector2d(x, y) {
        this.x = x;
        this.y = y;
    }
    return Vector2d;
})();
var Vector3d = (function () {
    function Vector3d(x, y, z) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = 0; }
        this.x = x;
        this.y = y;
        this.z = z;
    }
    Vector3d.prototype.equals = function (v) {
        return this.x == v.x && this.y == v.y && this.z == v.z;
    };
    Vector3d.prototype.squaredDistTo = function (v) {
        var dx = this.x - v.x;
        var dy = this.y - v.y;
        var dz = this.z - v.z;
        return dx * dx + dy * dy + dz * dz;
    };
    Vector3d.prototype.distTo = function (v) {
        var sd = this.squaredDistTo(v);
        return sd < 0.00000001 ? 0.0 : Math.sqrt(sd);
    };
    Vector3d.prototype.squaredLength = function () {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    };
    Vector3d.prototype.length = function () {
        var sl = this.squaredLength();
        return sl < 0.000000001 ? 0.0 : Math.sqrt(sl);
    };
    Vector3d.prototype.dot = function (v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    };
    Vector3d.prototype.sub = function (v) {
        return new Vector3d(this.x - v.x, this.y - v.y, this.z - v.z);
    };
    Vector3d.prototype.add = function (v) {
        return new Vector3d(this.x + v.x, this.y + v.y, this.z + v.z);
    };
    Vector3d.prototype.mul = function (s) {
        return new Vector3d(this.x * s, this.y * s, this.z * s);
    };
    Vector3d.origin = new Vector3d(0, 0, 0);
    Vector3d.xaxis = new Vector3d(1, 0, 0);
    Vector3d.yaxis = new Vector3d(0, 1, 0);
    Vector3d.zaxis = new Vector3d(0, 0, 1);
    return Vector3d;
})();
