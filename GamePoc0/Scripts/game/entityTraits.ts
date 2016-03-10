
module EntityTraits {
    export class CameraFocusTrait {
        constructor(public focus: boolean) { }
    }
    export var CameraFocusTraitType = new TraitType<CameraFocusTrait>("cameraFocusTrait");

    export class FollowerTrait {
        constructor(public magnet: IMaybe<IEntity>) { }
    }

    export var FollowerTraitType = new TraitType<FollowerTrait>("followerTrait");
}
