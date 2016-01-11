
function dirBitsToFacing(cd) {
    switch (cd) {
        case 1: return NORTH;   // N
        case 2: return SOUTH;   // S
        case 4: return EAST;   // E
        case 5: return NORTH_EAST;   // NE
        case 6: return SOUTH_EAST;   // SE
        case 8: return WEST;   // W
        case 9: return NORTH_WEST;   // NW
        case 10: return SOUTH_WEST;  // SW
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

function playerController(ent) {
    var defaultMoveProperties = { speed: 0.1 };
    this.update = function (moveProperties) {
        var rmoveProperties = {
            speed: coalesce(moveProperties, defaultMoveProperties, function (o) { return o.speed; })
        };
        //  N: 1, S: 2, E: 4, W: 8
        var cd = 0;
        var x = ent.x();
        var y = ent.y();
        var z = ent.z();
        if (keyStates.isCharDown("W")) {
            z -= rmoveProperties.speed;
            cd = 1;
        }
        else if (keyStates.isCharDown("S")) {
            z += rmoveProperties.speed;
            cd = 2;
        }
        if (keyStates.isCharDown("D")) {
            x += rmoveProperties.speed;
            cd += 4;
        }
        else if (keyStates.isCharDown("A")) {
            x -= rmoveProperties.speed;
            cd += 8;
        }
        return { facing: dirBitsToFacing(cd), x: x, y: y, z: z };
    }
}

function playerControllerFactory() {
    this.buildController = function (ent) {
        return new playerController(ent);
    };
}

function vecToFacing(x, y) {
    var facing = x > 0 ? (1 - (Math.acos(y) / Math.PI)) * 4 : 4 + ((Math.acos(y) / Math.PI) * 4);
    return Math.round(facing);
}

function playerFollowerController(ent, entityManager) {
    var defaultMoveProperties = { speed: 0.1 };
    this.update = function (moveProperties) {
        var rmoveProperties = {
            speed: coalesce(moveProperties, defaultMoveProperties, function (o) { return o.speed; })
        };
        var player = entityManager.player;
        if (!player) {
            return;
        }
        var entityPos = new THREE.Vector3(ent.x(), ent.y(), ent.z());
        var playerVec = new THREE.Vector3(player.x(), player.y(), player.z());
        playerVec.sub(entityPos);
        var distToPlayer = playerVec.length();
        if (distToPlayer < 0.00001) {
            return;
        }
        playerVec.divideScalar(distToPlayer);
        var facing = vecToFacing(playerVec.x, playerVec.z);
        //playerVec.multiplyScalar(Math.min(rmoveProperties.speed, distToPlayer);
        playerVec.multiplyScalar(Math.min(rmoveProperties.speed, distToPlayer - 3.0));
        entityPos.add(playerVec);

        return { facing: angleToFacing(facing % 8), x: entityPos.x, y: entityPos.y, z: entityPos.z };
    }
}

function playerFollowerControllerFactory(entityManager) {
    this.buildController = function (ent) {
        return new playerFollowerController(ent, entityManager);
    };
}