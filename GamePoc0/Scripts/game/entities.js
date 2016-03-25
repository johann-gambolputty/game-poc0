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
    function Entity(id) {
        this.id = id;
        this.traits = new TraitContainer();
        this.state = new EntityState(Vector3d.origin, 0);
    }
    Entity.prototype.moveTo = function (x, y, z) {
        this.state.position = new Vector3d(x, y, z);
        return this;
    };
    Entity.prototype.moveToPos = function (pos) {
        return this.moveTo(pos.x, pos.y, pos.z);
    };
    return Entity;
})();
var EntityManager = (function () {
    function EntityManager(scene, gc) {
        this.scene = scene;
        this.gc = gc;
        this.all = [];
        this.byId = {};
    }
    EntityManager.prototype.entityById = function (id) {
        var record = this.byId[id];
        return Maybe.to(record).map(function (r) { return r.entity; });
    };
    EntityManager.prototype.first = function (predicate) {
        for (var i = 0; i < this.all.length; ++i) {
            if (predicate(this.all[i].entity)) {
                return Maybe.to(this.all[i].entity);
            }
        }
        return Maybe.empty();
    };
    EntityManager.prototype.addEntity = function (entityType, id) {
        var entity = new Entity(id);
        entity.traits = entityType.defaultTraits.build();
        var entityRecord = { entity: entity, type: entityType, renderer: entityType.rendererFactory.create(this.scene, entity), controller: entityType.controllerFactory.create(entity, this.gc) };
        this.all.push(entityRecord);
        this.byId[entityRecord.entity.id] = entityRecord;
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
    function EntityType(id, name, cf, rf, defaultTraits) {
        this.id = id;
        this.name = name;
        this.defaultTraits = defaultTraits;
        this.controllerFactory = { create: cf };
        this.rendererFactory = { create: rf };
    }
    return EntityType;
})();
