
module NetCode {

    export class IntPoint3d {
        X: number;
        Y: number;
        Z: number;

        static fromVector3d(pt: Vector3d, sf: number): IntPoint3d {
            var ip = new IntPoint3d();
            ip.X = pt.x * sf;
            ip.Y = pt.y * sf;
            ip.Z = pt.z * sf;
            return ip;
        }

        static toVector3d(pt: IntPoint3d, sf: number): Vector3d {
            return new Vector3d(pt.X / sf, pt.Y / sf, pt.Z / sf);
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
        ScaleFactor: number;
        AddActions: SharedWorldSyncActionAddEntity[];
        MoveActions: SharedWorldSyncActionMoveEntity[];
    }
}