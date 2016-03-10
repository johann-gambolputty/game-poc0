var NetCode;
(function (NetCode) {
    var IntPoint3d = (function () {
        function IntPoint3d() {
        }
        IntPoint3d.toVector3d = function (pt) {
            return new Vector3d(pt.X, pt.Y, pt.Z);
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
