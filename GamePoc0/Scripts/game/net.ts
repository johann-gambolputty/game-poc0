
module NetCode {

    export class IntPoint3d {
        X: number;
        Y: number;
        Z: number;

        static toVector3d(pt: IntPoint3d): Vector3d {
            return new Vector3d(pt.X, pt.Y, pt.Z);
        }
    }

    export class SharedWorldSyncActionAddEntity {
        NewEntityId: number;
        NewEntityTypeId: number;
        Pos: IntPoint3d;
        Facing: number;
    }

    export class SharedWorldSyncActionMoveEntity {
        EntityId: number;
        Pos: IntPoint3d;
        Facing: number;
    }

    export class SharedWorldSyncActions {
        AddActions: SharedWorldSyncActionAddEntity[];
        MoveActions: SharedWorldSyncActionMoveEntity[];
    }
}