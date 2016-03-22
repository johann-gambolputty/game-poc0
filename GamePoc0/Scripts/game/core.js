var GameContext = (function () {
    function GameContext() {
        this.t = new TraitContainer();
    }
    GameContext.prototype.traits = function () {
        return this.t;
    };
    return GameContext;
})();
//# sourceMappingURL=core.js.map