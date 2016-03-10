var EntityState = (function () {
    function EntityState(position, facing) {
        this.position = position;
        this.facing = facing;
    }
    EntityState.prototype.changePositionAndFacing = function (pos, facing) {
        return new EntityState(pos, facing);
    };
    return EntityState;
})();
var Entity = (function () {
    function Entity() {
        this.traits = new TraitContainer();
        this.state = new EntityState(Vector3d.origin, 0);
    }
    Entity.prototype.moveTo = function (x, y, z) {
        this.state.position = new Vector3d(x, y, z);
        return this;
    };
    return Entity;
})();
var EntityManager = (function () {
    function EntityManager(scene, gc) {
        this.scene = scene;
        this.gc = gc;
        this.all = [];
    }
    EntityManager.prototype.first = function (predicate) {
        for (var i = 0; i < this.all.length; ++i) {
            if (predicate(this.all[i].entity)) {
                return Maybe.to(this.all[i].entity);
            }
        }
        return Maybe.empty();
    };
    EntityManager.prototype.addEntity = function (entityType) {
        var entity = new Entity();
        entity.traits = entityType.defaultTraits.build();
        this.all.push({ entity: entity, type: entityType, renderer: entityType.rendererFactory.create(this.scene, entity), controller: entityType.controllerFactory.create(entity, this.gc) });
        return entity;
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
    function EntityType(cf, rf, defaultTraits) {
        this.defaultTraits = defaultTraits;
        this.controllerFactory = { create: cf };
        this.rendererFactory = { create: rf };
    }
    return EntityType;
})();
//# sourceMappingURL=entities.js.map