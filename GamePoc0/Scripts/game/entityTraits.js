var EntityTraits;
(function (EntityTraits) {
    var CameraFocusTrait = (function () {
        function CameraFocusTrait(focus) {
            this.focus = focus;
        }
        return CameraFocusTrait;
    })();
    EntityTraits.CameraFocusTrait = CameraFocusTrait;
    EntityTraits.CameraFocusTraitType = new TraitType("cameraFocusTrait");
    var FollowerTrait = (function () {
        function FollowerTrait(magnet) {
            this.magnet = magnet;
        }
        return FollowerTrait;
    })();
    EntityTraits.FollowerTrait = FollowerTrait;
    EntityTraits.FollowerTraitType = new TraitType("followerTrait");
})(EntityTraits || (EntityTraits = {}));
