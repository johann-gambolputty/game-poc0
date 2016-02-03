class Vector3d {
    constructor(public x: number = 0, public y: number = 0, z: number = 0) {
    }
    equals(v: Vector3d): boolean {
        return this.x == v.x && this.y == v.y && this.z == v.z;
    }
}
