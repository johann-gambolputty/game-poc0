﻿class Rect {
    constructor(public minx: number, public miny: number, public width: number, public height: number) { }
}

class Vector2d {
    constructor(public x: number, public y: number) { }
}


class Vector3d {
    static origin = new Vector3d(0, 0, 0);
    static xaxis = new Vector3d(1, 0, 0);
    static yaxis = new Vector3d(0, 1, 0);
    static zaxis = new Vector3d(0, 0, 1);

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
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }
    length(): number {
        var sl = this.squaredLength();
        return sl < 0.000000001 ? 0.0 : Math.sqrt(sl);
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
    mul(s: number): Vector3d {
        return new Vector3d(this.x * s, this.y * s, this.z * s);
    }
}
