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
var Entity = (function () {
    function Entity() {
        this.state = { facing: 0, position: new Vector3d(0, 0, 0) };
    }
    return Entity;
})();
var EntityManager = (function () {
    function EntityManager() {
        this.all = [];
    }
    EntityManager.prototype.addEntity = function (entity, entityType) {
        this.all.push({ entity: entity, type: entityType, renderer: entityType.rendererFactory.create(entity), controller: entityType.controllerFactory.create(entity) });
    };
    EntityManager.prototype.update = function () {
        for (var i = 0; i < this.all.length; ++i) {
            this.all[i].entity.state = this.all[i].controller.createNextState();
            this.all[i].renderer.update();
        }
    };
    return EntityManager;
})();
var EntityType = (function () {
    function EntityType(cf, rf) {
        this.controllerFactory = { create: cf };
        this.rendererFactory = { create: rf };
    }
    return EntityType;
})();
new EntityManager().addEntity(null, new EntityType(function (e) { return new PlayerEntityController(e); }, function (e) { return null; }));
