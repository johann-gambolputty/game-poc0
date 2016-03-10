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
function createAnimationBuilder(animatorContextFactory, animationStateGeneratorFactory) {
    return new AnimationBuilder(animatorContextFactory, animationStateGeneratorFactory);
}
var AnimationBuilder = (function () {
    function AnimationBuilder(animatorContextFactory, animationStateGeneratorFactory) {
        this.animatorContextFactory = animatorContextFactory;
        this.animationStateGeneratorFactory = animationStateGeneratorFactory;
        this._x = new Array();
    }
    AnimationBuilder.prototype.glueToAction = function (action, animatorFactory) {
        return this.glue(new EntityAnimationActionMatcher(action), animatorFactory);
    };
    AnimationBuilder.prototype.glueToActionAndFacing = function (action, facing, animatorFactory) {
        return this.glue(new EntityAnimationActionFacingMatcher(action, facing), animatorFactory);
    };
    AnimationBuilder.prototype.glue = function (matcher, animatorFactory) {
        this._x.push({ matcher: matcher, animatorFactory: { create: animatorFactory } });
        return this;
    };
    AnimationBuilder.prototype.build = function (scene, ent) {
        var context = this.animatorContextFactory.createContext(scene);
        var matchersAndAnimators = this._x.map(function (x) {
            return { matcher: x.matcher, animator: x.animatorFactory.create(context) };
        });
        var stateGenerator = this.animationStateGeneratorFactory(ent);
        return {
            update: function () {
                var animState = stateGenerator.getNextAnimState();
                for (var _i = 0; _i < matchersAndAnimators.length; _i++) {
                    var m = matchersAndAnimators[_i];
                    if (m.matcher.isMatch(animState)) {
                        m.animator.update(ent, animState); //  note: doesn't allow multiple animators to act on the entity
                        return;
                    }
                }
            }
        };
    };
    return AnimationBuilder;
})();
