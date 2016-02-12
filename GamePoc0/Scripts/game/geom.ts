class Vector3d {
    constructor(public x: number = 0, public y: number = 0, public z: number = 0) {
    }
    equals(v: Vector3d): boolean {
        return this.x == v.x && this.y == v.y && this.z == v.z;
    }
    squaredDistTo(v: Vector3d): number {
        var dx = this.x - v.x;
        var dy = this.y - v.y;
        var dz = this.z - v.z;
        return dx * dx + dy * dy + dz * dz;
    }
    distTo(v: Vector3d): number {
        var sd = this.squaredDistTo(v);
        return sd < 0.00000001 ? 0.0 : Math.sqrt(sd);
    }
    squaredLength(): number {
        return this.x * this.y + this.y * this.y + this.z * this.z;
    }
    length(): number {
        var sl = this.squaredLength();
        return sl < 0.000000001 ? 0.0 : Math.sqrt(sl);;
    }
    dot(v: Vector3d): number {
        return this.x * v.x + this.y * v.y + this.z * v.z; 
    }
    sub(v: Vector3d): Vector3d {
        return new Vector3d(this.x - v.x, this.y - v.y, this.z - v.z);
    }
    add(v: Vector3d): Vector3d {
        return new Vector3d(this.x + v.x, this.y + v.y, this.z + v.z);
    }
}
