var ANIM_ACTION_WAIT = { name: "Wait" };
var ANIM_ACTION_WALK = { name: "Walk" };
var ALL_ANIM_ACTIONS = [
    ANIM_ACTION_WALK,
    ANIM_ACTION_WAIT
];
var EntityAnimationActionMatcher = (function () {
    function EntityAnimationActionMatcher(action) {
        this.action = action;
    }
    EntityAnimationActionMatcher.prototype.isMatch = function (state) {
        return state.action == this.action;
    };
    return EntityAnimationActionMatcher;
})();
var EntityAnimationActionFacingMatcher = (function () {
    function EntityAnimationActionFacingMatcher(action, facing) {
        this.action = action;
        this.facing = facing;
    }
    EntityAnimationActionFacingMatcher.prototype.isMatch = function (state) {
        return state.action == this.action && state.state.facing == this.facing;
    };
    return EntityAnimationActionFacingMatcher;
})();
var EntityAnimationStateGenerator = (function () {
    function EntityAnimationStateGenerator(entity) {
        this.entity = entity;
        this.lastState = entity.state;
    }
    EntityAnimationStateGenerator.prototype.getNextAnimState = function () {
        if (!this.lastState || !this.entity.state) {
            return;
        }
        var noMovement = this.lastState.position.equals(this.entity.state.position);
        this.lastState = this.entity.state;
        if (noMovement) {
            return { action: ANIM_ACTION_WAIT, state: this.entity.state };
        }
        return { action: ANIM_ACTION_WALK, state: this.entity.state };
    };
    return EntityAnimationStateGenerator;
})();
;
