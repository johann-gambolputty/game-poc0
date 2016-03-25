
function vecToFacing(x: number, y: number): number {
    var facing = x > 0 ? (1 - (Math.acos(y) / Math.PI)) * 4 : 4 + ((Math.acos(y) / Math.PI) * 4);
    return Math.round(facing);
}

function dirBitsToFacing(cd: number): number {
    switch (cd) {
        case 1: return NORTH;       // N
        case 2: return SOUTH;       // S
        case 4: return EAST;        // E
        case 5: return NORTH_EAST;  // NE
        case 6: return SOUTH_EAST;  // SE
        case 8: return WEST;        // W
        case 9: return NORTH_WEST;  // NW
        case 10: return SOUTH_WEST; // SW
    }
    return SOUTH;
}

function angleToFacing(cd) {
    switch (cd) {
        case 0: return NORTH;
        case 1: return NORTH_EAST;
        case 2: return EAST;
        case 3: return SOUTH_EAST;
        case 4: return SOUTH;
        case 5: return SOUTH_WEST;
        case 6: return WEST;
        case 7: return NORTH_WEST;
    }
    return SOUTH;
}

class HeightEntityContoller implements IEntityController {
    constructor(private inner: IEntityController, private posToHeight: (x: number, z: number) => number) {
    }
    createNextState(): IEntityState {
        var nextState = this.inner.createNextState();
        nextState.position.y = this.posToHeight(nextState.position.x, nextState.position.z);
        return nextState;
    }
}

class NullEntityController implements IEntityController {
    constructor(private e: IEntity) {
    }
    createNextState(): IEntityState {
        return this.e.state;
    }
}

class FollowerEntityController implements IEntityController {
    constructor(private e: IEntity, private em: IEntityManager, private speed: number) {
    }
    createNextState(): IEntityState {
        var ft = this.e.traits.ensureTrait(EntityTraits.FollowerTraitType, () => new EntityTraits.FollowerTrait(Maybe.empty<IEntity>()));
        ft.magnet = this.em.first(e => e.traits.hasTrait(EntityTraits.CameraFocusTraitType));

        return ft.magnet.mapOr(e => this.moveTowards(e),
            this.e.state);
    }
    private moveTowards(magnet: IEntity): IEntityState {
        var playerVec = magnet.state.position.sub(this.e.state.position);
        var distToPlayer = playerVec.length();
        if (distToPlayer < 0.00001) {
            return this.e.state;
        }
        var playerNorm = playerVec.mul(1 / distToPlayer);
        var facing = vecToFacing(playerNorm.x, playerNorm.z);
        //playerVec.multiplyScalar(Math.min(rmoveProperties.speed, distToPlayer);
        var step = playerNorm.mul(Math.min(this.speed, distToPlayer - 3.0));
        return this.e.state.changePositionAndFacing(this.e.state.position.add(step), angleToFacing(facing % 8));
    }
}

class RemotePlayerEntityController implements IEntityController {
    constructor(private e: IEntity, private moveSpeed: number, private gs: IGame) {
    }
    createNextState(): IEntityState {
        //  N: 1, S: 2, E: 4, W: 8
        var cd = 0;
        var newPos = this.e.state.position;
        if (keyStates.isCharDown("W")) {
            newPos = newPos.sub(Vector3d.zaxis.mul(this.moveSpeed));
            cd = 1;
        }
        else if (keyStates.isCharDown("S")) {
            newPos = newPos.add(Vector3d.zaxis.mul(this.moveSpeed));
            cd = 2;
        }
        if (keyStates.isCharDown("D")) {
            newPos = newPos.add(Vector3d.xaxis.mul(this.moveSpeed));
            cd += 4;
        }
        else if (keyStates.isCharDown("A")) {
            newPos = newPos.sub(Vector3d.xaxis.mul(this.moveSpeed));
            cd += 8;
        }
        var actions = new NetCode.SharedWorldSyncActions();
        actions.ScaleFactor = 1000;
        var moveAction = new NetCode.SharedWorldSyncActionMoveEntity();
        moveAction.EntityId = 0;
        moveAction.Facing = 0;
        moveAction.Pos = NetCode.IntPoint3d.fromVector3d(newPos);
        actions.MoveActions = [moveAction];
        this.gs.sendUpdate(actions);
        return this.e.state.changePositionAndFacing(newPos, dirBitsToFacing(cd));
    }
}

class PlayerEntityController implements IEntityController {
    constructor(private e: IEntity, private moveSpeed: number) {
    }
    createNextState(): IEntityState {
        //  N: 1, S: 2, E: 4, W: 8
        var cd = 0;
        var newPos = this.e.state.position;
        if (keyStates.isCharDown("W")) {
            newPos = newPos.sub(Vector3d.zaxis.mul(this.moveSpeed));
            cd = 1;
        }
        else if (keyStates.isCharDown("S")) {
            newPos = newPos.add(Vector3d.zaxis.mul(this.moveSpeed));
            cd = 2;
        }
        if (keyStates.isCharDown("D")) {
            newPos = newPos.add(Vector3d.xaxis.mul(this.moveSpeed));
            cd += 4;
        }
        else if (keyStates.isCharDown("A")) {
            newPos = newPos.sub(Vector3d.xaxis.mul(this.moveSpeed));
            cd += 8;
        }
        return this.e.state.changePositionAndFacing(newPos, dirBitsToFacing(cd));
    }
}