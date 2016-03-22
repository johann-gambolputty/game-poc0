
interface IEntityState {
    facing: number;
    position: Vector3d;
    changePositionAndFacing(pos: Vector3d, facing: number): IEntityState;
}

interface IEntity {
    id: number;
    state: IEntityState;
    moveTo(x: number, y: number, z: number): IEntity;
    moveToPos(pos: Vector3d): IEntity;
    traits: TraitContainer;
}

interface IEntityRenderer {
    update();
}

interface IEntityRendererFactory {
    create(scene:any, entity: IEntity): IEntityRenderer;
}

interface IEntityController {
    createNextState():IEntityState;
}

interface IEntityControllerFactory {
    create(entity: IEntity, gc: IGameContext): IEntityController;
}

class EntityState implements IEntityState {
    constructor(public position: Vector3d, public facing: number) { }
    changePositionAndFacing(pos: Vector3d, facing: number): IEntityState {
        return new EntityState(pos, facing);
    }
}

class Entity implements IEntity {
    constructor(public id: number) { }
    traits = new TraitContainer();
    state: IEntityState = new EntityState(Vector3d.origin, 0);
    moveTo(x: number, y: number, z: number): IEntity {
        this.state.position = new Vector3d(x, y, z);
        return this;
    }
    moveToPos(pos: Vector3d): IEntity {
        return this.moveTo(pos.x, pos.y, pos.z);
    }
}

interface IEntityType {
    id: number;
    name: string;
    rendererFactory: IEntityRendererFactory;
    controllerFactory: IEntityControllerFactory;
    defaultTraits: ITraitContainerBuilder;
}

interface IEntityManager {
    first(predicate: (entity: IEntity) => boolean): IMaybe<IEntity>;
    addEntity(entityType: IEntityType, id: number): IEntity;
    update();
}


interface IEntityRecord {
    entity: IEntity;
    type: IEntityType;
    renderer: IEntityRenderer;
    controller: IEntityController;
}

class EntityManager implements IEntityManager {
    all: IEntityRecord[] = [];
    byId: { [key: number]: IEntityRecord } = { };
    constructor(private scene: any, private gc: IGameContext) {
    }
    entityById(id: number): IMaybe<IEntity> {
        var record = this.byId[id];
        return Maybe.to(record).map(r => r.entity);
    }
    first(predicate: (entity: IEntity) => boolean): IMaybe<IEntity> {
        for (var i = 0; i < this.all.length; ++i) {
            if (predicate(this.all[i].entity)) {
                return Maybe.to(this.all[i].entity);
            }
        }
        return Maybe.empty<IEntity>();
    }
    addEntity(entityType: IEntityType, id: number): IEntity {
        var entity = new Entity(id);
        entity.traits = entityType.defaultTraits.build();
        var entityRecord: IEntityRecord = { entity: entity, type: entityType, renderer: entityType.rendererFactory.create(this.scene, entity), controller: entityType.controllerFactory.create(entity, this.gc) };
        this.all.push(entityRecord);
        this.byId[entityRecord.entity.id] = entityRecord;
        return entity;
    }
    update() {
        for (var i = 0; i < this.all.length; ++i) {
            this.all[i].entity.state = this.all[i].controller.createNextState();
            this.all[i].renderer.update();
        }
    }
}

class EntityType implements IEntityType {
    controllerFactory: IEntityControllerFactory;
    rendererFactory: IEntityRendererFactory;
    constructor(public id: number, public name: string, cf: (e: IEntity, gc: IGameContext) => IEntityController, rf: (scene: any, e: IEntity) => IEntityRenderer, public defaultTraits: ITraitContainerBuilder) {
        this.controllerFactory = { create: cf };
        this.rendererFactory = { create: rf };
    }
}
