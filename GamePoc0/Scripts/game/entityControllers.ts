class PlayerEntityController implements IEntityController {
    constructor(private e: IEntity) {
    }
    createNextState(): IEntityState {
        return null;
    }
    //var defaultMoveProperties = { speed: 0.1 };

    //this.update = function (moveProperties) {
    //    var rmoveProperties = {
    //        speed: coalesce(moveProperties, defaultMoveProperties, function (o) { return o.speed; })
    //    };
    //    //  N: 1, S: 2, E: 4, W: 8
    //    var cd = 0;
    //    var x = ent.x();
    //    var y = ent.y();
    //    var z = ent.z();
    //    if (keyStates.isCharDown("W")) {
    //        z -= rmoveProperties.speed;
    //        cd = 1;
    //    }
    //    else if (keyStates.isCharDown("S")) {
    //        z += rmoveProperties.speed;
    //        cd = 2;
    //    }
    //    if (keyStates.isCharDown("D")) {
    //        x += rmoveProperties.speed;
    //        cd += 4;
    //    }
    //    else if (keyStates.isCharDown("A")) {
    //        x -= rmoveProperties.speed;
    //        cd += 8;
    //    }
    //    return { facing: dirBitsToFacing(cd), x: x, y: y, z: z };
    //}
}