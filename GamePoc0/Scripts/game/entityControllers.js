var HeightEntityContoller = (function () {
    function HeightEntityContoller(inner, posToHeight) {
        this.inner = inner;
        this.posToHeight = posToHeight;
    }
    HeightEntityContoller.prototype.createNextState = function () {
        var nextState = this.inner.createNextState();
        nextState.position.y = this.posToHeight(nextState.position.x, nextState.position.z);
        return nextState;
    };
    return HeightEntityContoller;
})();
var NullEntityController = (function () {
    function NullEntityController(e) {
        this.e = e;
    }
    NullEntityController.prototype.createNextState = function () {
        return this.e.state;
    };
    return NullEntityController;
})();
var PlayerEntityController = (function () {
    function PlayerEntityController(e) {
        this.e = e;
    }
    PlayerEntityController.prototype.createNextState = function () {
        return this.e.state;
    };
    return PlayerEntityController;
})();
