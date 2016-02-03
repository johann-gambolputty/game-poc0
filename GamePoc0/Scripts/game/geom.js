var Vector3d = (function () {
    function Vector3d(x, y, z) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = 0; }
        this.x = x;
        this.y = y;
    }
    Vector3d.prototype.equals = function (v) {
        return this.x == v.x && this.y == v.y && this.z == v.z;
    };
    return Vector3d;
})();
