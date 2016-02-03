
interface IEntityState {
    facing: number;
    position: Vector3d;
}

interface IEntity {
    state: IEntityState;
}

interface IEntityRenderer {
    update();
}

interface IEntityRendererFactory {
    create(entity: IEntity): IEntityRenderer;
}

interface IEntityController {
    createNextState():IEntityState;
}

class HeightEntityContoller implements IEntityController {
    constructor(private inner: IEntityController, private posToHeight: (x:number, z:number)=>number) {
    }
    createNextState(): IEntityState {
        var nextState = this.inner.createNextState();
        nextState.position.y = this.posToHeight(nextState.position.x, nextState.position.z);
        return nextState;
    }
}

interface IEntityControllerFactory {
    create(entity: IEntity): IEntityController;
}

class Entity implements IEntity {
    state: IEntityState = { facing: 0, position: new Vector3d(0, 0, 0) };
}

interface IEntityType {
    rendererFactory: IEntityRendererFactory;
    controllerFactory: IEntityControllerFactory;
}

interface IEntityManager {
    addEntity(entity: IEntity, entityType: IEntityType);
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
    addEntity(entity: IEntity, entityType: IEntityType) {
        this.all.push({ entity: entity, type: entityType, renderer: entityType.rendererFactory.create(entity), controller: entityType.controllerFactory.create(entity) });
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
    constructor(cf: (e: IEntity) => IEntityController, rf: (e: IEntity) => IEntityRenderer) {
        this.controllerFactory = { create: cf };
        this.rendererFactory = { create: rf };

    }
}

new EntityManager().addEntity(null, new EntityType(e => new PlayerEntityController(e), e => null));
