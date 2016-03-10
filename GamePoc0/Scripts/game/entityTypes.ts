
interface IEntityTypes {
    addEntityType(entityType: IEntityType);
    entityTypeById(id: number): IMaybe<IEntityType>;
    entityTypeByName(name: string): IMaybe<IEntityType>;
}

class EntityTypes implements IEntityTypes {
    private entityTypesById: { [key: number]: IEntityType} = {};
    private entityTypesByName: { [key: string]: IEntityType } = {};
    addEntityType(entityType: IEntityType): IEntityType {
        this.entityTypesById[entityType.id] = entityType;
        this.entityTypesByName[entityType.name] = entityType;
        return entityType;
    }
    entityTypeById(id: number): IMaybe<IEntityType> {
        return Maybe.to(this.entityTypesById[id]);
    }
    entityTypeByName(name: string): IMaybe<IEntityType> {
        return Maybe.to(this.entityTypesByName[name]);
    }
}