interface IAnimator {
    update();
}

interface AnimationAction {
    name: string;
}

var ANIM_ACTION_WAIT: AnimationAction = { name: "Wait" };
var ANIM_ACTION_WALK: AnimationAction = { name: "Walk" };

var ALL_ANIM_ACTIONS = [
    ANIM_ACTION_WALK,
    ANIM_ACTION_WAIT
];

interface IEntityAnimationState {
    action: AnimationAction;
    state: IEntityState;
}
//  
interface IEntityAnimationMatcher {
    isMatch(state: IEntityAnimationState): boolean;
}

class EntityAnimationActionMatcher implements IEntityAnimationMatcher {
    constructor(private action: AnimationAction) {
    }
    isMatch(state: IEntityAnimationState): boolean {
        return state.action == this.action;
    }
}

class EntityAnimationActionFacingMatcher implements IEntityAnimationMatcher {
    constructor(private action: AnimationAction, private facing: number) {
    }
    isMatch(state: IEntityAnimationState): boolean {
        return state.action == this.action && state.state.facing == this.facing;
    }
}

interface IEntityAnimationStateGenerator {
    getNextAnimState(): IEntityAnimationState;
}

interface IEntityAnimator {
    update(entity: IEntity, animState: IEntityAnimationState): void;
}

class EntityAnimationStateGenerator implements IEntityAnimationStateGenerator {
    private lastState: IEntityState;
    constructor(private entity: IEntity) {
        this.lastState = entity.state;
    }
    getNextAnimState(): IEntityAnimationState {
        if (!this.lastState || !this.entity.state) {
            return;
        }
        var noMovement = this.lastState.position.equals(this.entity.state.position);
        this.lastState = this.entity.state;
        if (noMovement) {
            return { action: ANIM_ACTION_WAIT, state: this.entity.state };
        }
        return { action: ANIM_ACTION_WALK, state: this.entity.state };
    }
}

interface IMatcherAndAnimator { matcher: IEntityAnimationMatcher, animator: IEntityAnimator };