interface IGameContext {
    traits(): TraitContainer;
}

class GameContext implements IGameContext {
    private t = new TraitContainer();
    traits(): TraitContainer {
        return this.t;
    }
}
