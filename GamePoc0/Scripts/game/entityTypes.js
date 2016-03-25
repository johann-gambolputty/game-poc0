var EntityTypes = (function () {
    function EntityTypes() {
        this.entityTypesById = {};
        this.entityTypesByName = {};
    }
    EntityTypes.prototype.addEntityType = function (entityType) {
        this.entityTypesById[entityType.id] = entityType;
        this.entityTypesByName[entityType.name] = entityType;
        return entityType;
    };
    EntityTypes.prototype.entityTypeById = function (id) {
        return Maybe.to(this.entityTypesById[id]);
    };
    EntityTypes.prototype.entityTypeByName = function (name) {
        return Maybe.to(this.entityTypesByName[name]);
    };
    return EntityTypes;
})();
