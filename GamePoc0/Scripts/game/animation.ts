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

interface IEntityAnimatorFactory<TAnimatorContext> {
    create(context: TAnimatorContext): IEntityAnimator;
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



interface IMatcherAndAnimatorFactory<TAnimatorContext> {
    matcher: IEntityAnimationMatcher;
    animatorFactory: IEntityAnimatorFactory<TAnimatorContext>;
}

interface IEntityAnimatorContextFactory<TAnimatorContext> {
    createContext(scene: any): TAnimatorContext;
}

function createAnimationBuilder<TAnimatorContext>(animatorContextFactory: IEntityAnimatorContextFactory<TAnimatorContext>, animationStateGeneratorFactory: (entity: IEntity) => IEntityAnimationStateGenerator): AnimationBuilder<TAnimatorContext> {
    return new AnimationBuilder<TAnimatorContext>(animatorContextFactory, animationStateGeneratorFactory);
}

interface IMatcherAndAnimator {
    matcher: IEntityAnimationMatcher;
    animator: IEntityAnimator;
}

class AnimationBuilder<TAnimatorContext> {
    private _x = new Array<IMatcherAndAnimatorFactory<TAnimatorContext>>();
    constructor(private animatorContextFactory: IEntityAnimatorContextFactory<TAnimatorContext>, private animationStateGeneratorFactory: (entity: IEntity) => IEntityAnimationStateGenerator) {
    }
    glueToAction(action: AnimationAction, animatorFactory: (context: TAnimatorContext) => IEntityAnimator): AnimationBuilder<TAnimatorContext> {
        return this.glue(new EntityAnimationActionMatcher(action), animatorFactory);
    }
    glueToActionAndFacing(action: AnimationAction, facing: number, animatorFactory: (context: TAnimatorContext) => IEntityAnimator): AnimationBuilder<TAnimatorContext> {
        return this.glue(new EntityAnimationActionFacingMatcher(action, facing), animatorFactory);
    }
    glue(matcher: IEntityAnimationMatcher, animatorFactory: (context: TAnimatorContext) => IEntityAnimator): AnimationBuilder<TAnimatorContext> {
        this._x.push({ matcher: matcher, animatorFactory: { create: animatorFactory } });
        return this;
    }
    build(scene: any, ent: IEntity): IEntityRenderer {

        var context = this.animatorContextFactory.createContext(scene);
        var matchersAndAnimators = this._x.map((x: IMatcherAndAnimatorFactory<TAnimatorContext>): IMatcherAndAnimator => {
            return { matcher: x.matcher, animator: x.animatorFactory.create(context) };
        });

        var stateGenerator = this.animationStateGeneratorFactory(ent);
        return {
            update: (): void => {
                var animState = stateGenerator.getNextAnimState();
                for (var m of matchersAndAnimators) {
                    if (m.matcher.isMatch(animState)) {
                        m.animator.update(ent, animState);  //  note: doesn't allow multiple animators to act on the entity
                        return;
                    }
                }
            }
        };
    }
}
