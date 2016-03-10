interface ISceneQuery {
    getHeight(x: number, z: number): number;
}

class SceneQuery implements ISceneQuery {
    constructor(public getHeight: (x: number, y: number) => number) {
    }
}