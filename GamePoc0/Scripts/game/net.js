var NetCode;
(function (NetCode) {
    var IntPoint3d = (function () {
        function IntPoint3d() {
        }
        IntPoint3d.fromVector3d = function (pt, sf) {
            var ip = new IntPoint3d();
            ip.X = pt.x * sf;
            ip.Y = pt.y * sf;
            ip.Z = pt.z * sf;
            return ip;
        };
        IntPoint3d.toVector3d = function (pt, sf) {
            return new Vector3d(pt.X / sf, pt.Y / sf, pt.Z / sf);
        };
        return IntPoint3d;
    })();
    NetCode.IntPoint3d = IntPoint3d;
    var SharedWorldSyncActionAddEntity = (function () {
        function SharedWorldSyncActionAddEntity() {
        }
        return SharedWorldSyncActionAddEntity;
    })();
    NetCode.SharedWorldSyncActionAddEntity = SharedWorldSyncActionAddEntity;
    var SharedWorldSyncActionMoveEntity = (function () {
        function SharedWorldSyncActionMoveEntity() {
        }
        return SharedWorldSyncActionMoveEntity;
    })();
    NetCode.SharedWorldSyncActionMoveEntity = SharedWorldSyncActionMoveEntity;
    var SharedWorldSyncActions = (function () {
        function SharedWorldSyncActions() {
        }
        return SharedWorldSyncActions;
    })();
    NetCode.SharedWorldSyncActions = SharedWorldSyncActions;
})(NetCode || (NetCode = {}));
