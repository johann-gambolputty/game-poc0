var Entity = (function () {
    function Entity() {
        this.state = { facing: 0, position: new Vector3d(0, 0, 0) };
    }
    return Entity;
})();
var EntityManager = (function () {
    function EntityManager(scene, sceneQuery) {
        this.scene = scene;
        this.sceneQuery = sceneQuery;
        this.all = [];
    }
    EntityManager.prototype.addEntity = function (entity, entityType) {
        this.all.push({ entity: entity, type: entityType, renderer: entityType.rendererFactory.create(this.scene, entity), controller: entityType.controllerFactory.create(entity, this.sceneQuery) });
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
