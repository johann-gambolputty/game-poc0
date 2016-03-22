function vecToFacing(x, y) {
    var facing = x > 0 ? (1 - (Math.acos(y) / Math.PI)) * 4 : 4 + ((Math.acos(y) / Math.PI) * 4);
    return Math.round(facing);
}
function dirBitsToFacing(cd) {
    switch (cd) {
        case 1: return NORTH; // N
        case 2: return SOUTH; // S
        case 4: return EAST; // E
        case 5: return NORTH_EAST; // NE
        case 6: return SOUTH_EAST; // SE
        case 8: return WEST; // W
        case 9: return NORTH_WEST; // NW
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
var HeightEntityContoller = (function () {
    function HeightEntityContoller(inner, posToHeight) {
        this.inner = inner;
        this.posToHeight = posToHeight;
    }
    HeightEntityContoller.prototype.createNextState = function () {
        var nextState = this.inner.createNextState();
        nextState.position.y = this.posToHeight(nextState.position.x, nextState.position.z);
        return nextState;
    };
    return HeightEntityContoller;
})();
var NullEntityController = (function () {
    function NullEntityController(e) {
        this.e = e;
    }
    NullEntityController.prototype.createNextState = function () {
        return this.e.state;
    };
    return NullEntityController;
})();
var FollowerEntityController = (function () {
    function FollowerEntityController(e, em, speed) {
        this.e = e;
        this.em = em;
        this.speed = speed;
    }
    FollowerEntityController.prototype.createNextState = function () {
        var _this = this;
        var ft = this.e.traits.ensureTrait(EntityTraits.FollowerTraitType, function () { return new EntityTraits.FollowerTrait(Maybe.empty()); });
        ft.magnet = this.em.first(function (e) { return e.traits.hasTrait(EntityTraits.CameraFocusTraitType); });
        return ft.magnet.mapOr(function (e) { return _this.moveTowards(e); }, this.e.state);
    };
    FollowerEntityController.prototype.moveTowards = function (magnet) {
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
    };
    return FollowerEntityController;
})();
var PlayerEntityController = (function () {
    function PlayerEntityController(e, moveSpeed) {
        this.e = e;
        this.moveSpeed = moveSpeed;
    }
    PlayerEntityController.prototype.createNextState = function () {
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
    };
    return PlayerEntityController;
})();
//# sourceMappingURL=entityControllers.js.map