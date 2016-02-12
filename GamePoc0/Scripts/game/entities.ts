
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
    create(scene:any, entity: IEntity): IEntityRenderer;
}

interface IEntityController {
    createNextState():IEntityState;
}

interface IEntityControllerFactory {
    create(entity: IEntity, sceneQuery: ISceneQuery): IEntityController;
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
    constructor(private scene: any, private sceneQuery: ISceneQuery) {
    }
    addEntity(entity: IEntity, entityType: IEntityType) {
        this.all.push({ entity: entity, type: entityType, renderer: entityType.rendererFactory.create(this.scene, entity), controller: entityType.controllerFactory.create(entity, this.sceneQuery) });
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
    constructor(cf: (e: IEntity, sq: ISceneQuery) => IEntityController, rf: (scene: any, e: IEntity) => IEntityRenderer) {
        this.controllerFactory = { create: cf };
        this.rendererFactory = { create: rf };

    }
}
