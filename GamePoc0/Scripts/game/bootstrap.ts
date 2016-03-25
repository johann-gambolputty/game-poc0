
interface IGame {
    sendUpdate(update: NetCode.SharedWorldSyncActions);
    processUpdate(update: NetCode.SharedWorldSyncActions);
    update();
    render(renderer: any);
}

module Bootstrap {

    class BsEntityTypes extends EntityTypes {
        public playerEntityType: IEntityType;
        public followerEntityType: IEntityType;
        public sheepEntityType: IEntityType;
        public treeEntityType: IEntityType;
        
        private trackHeight(controller:IEntityController) {
            return new HeightEntityContoller(controller, this.gc.traits().safeTrait(GameTraits.SceneQueryTraitType).getHeight);
        }

        constructor(private gc: IGameContext) {
            super();
            var defaultShadowUrl = Assets.imageAsset("shadow.png");
            var defaultPixelScale = 0.1;//  Pixel to world size factor (e.g. 32x32 spite with scale of 0.1 is 3.2m x 3.2m, assuming world units are metres)
            var personAnimator = createAnimationBuilder(new SpriteEntityAnimatorContextFactory(defaultShadowUrl).withDefaultOptions({ offsetY: 2, width: 32, height: 32 }).withPixelScale(defaultPixelScale), (e) => new EntityAnimationStateGenerator(e))
                .glueToAction(ANIM_ACTION_WAIT, (context) => context.animateSprite(Assets.imageAsset("test-s-walk.png"), { frameCount: 1 }))
                .glueToActionAndFacing(ANIM_ACTION_WALK, SOUTH, (context) => context.animateSprite(Assets.imageAsset("test-s-walk.png"), { frameCount: 4 }))
                .glueToActionAndFacing(ANIM_ACTION_WALK, NORTH, (context) => context.animateSprite(Assets.imageAsset("test-n-walk.png"), { frameCount: 4 }))
                .glueToActionAndFacing(ANIM_ACTION_WALK, NORTH_EAST, (context) => context.animateSprite(Assets.imageAsset("test-nwne-walk.png"), { frameCount: 4 }))
                .glueToActionAndFacing(ANIM_ACTION_WALK, EAST, (context) => context.animateSprite(Assets.imageAsset("test-ew-walk.png"), { frameCount: 4 }))
                .glueToActionAndFacing(ANIM_ACTION_WALK, SOUTH_EAST, (context) => context.animateSprite(Assets.imageAsset("test-swse-walk.png"), { frameCount: 4 }))
                .glueToActionAndFacing(ANIM_ACTION_WALK, SOUTH_WEST, (context) => context.animateSprite(Assets.imageAsset("test-swse-walk.png"), { frameCount: 4, flip: true }))
                .glueToActionAndFacing(ANIM_ACTION_WALK, WEST, (context) => context.animateSprite(Assets.imageAsset("test-ew-walk.png"), { frameCount: 4, flip: true }))
                .glueToActionAndFacing(ANIM_ACTION_WALK, NORTH_WEST, (context) => context.animateSprite(Assets.imageAsset("test-nwne-walk.png"), { frameCount: 4, flip: true }))
                ;

            var sheepAnimator = createAnimationBuilder(new SpriteEntityAnimatorContextFactory(defaultShadowUrl).withDefaultOptions({ offsetY: 2, width: 32, height: 32 }).withPixelScale(defaultPixelScale), (e) => new EntityAnimationStateGenerator(e))
                .glueToAction(ANIM_ACTION_WAIT, (context) => context.animateSprite(Assets.imageAsset("sheep-s-walk.png"), { frameCount: 1 }))
                .glueToActionAndFacing(ANIM_ACTION_WALK, SOUTH, (context) => context.animateSprite(Assets.imageAsset("sheep-s-walk.png"), { frameCount: 2 }))
                .glueToActionAndFacing(ANIM_ACTION_WALK, NORTH, (context) => context.animateSprite(Assets.imageAsset("sheep-n-walk.png"), { frameCount: 2 }))
                .glueToActionAndFacing(ANIM_ACTION_WALK, NORTH_EAST, (context) => context.animateSprite(Assets.imageAsset("sheep-nenw-walk.png"), { frameCount: 2 }))
                .glueToActionAndFacing(ANIM_ACTION_WALK, EAST, (context) => context.animateSprite(Assets.imageAsset("sheep-ew-walk.png"), { frameCount: 2, flip: true }))
                .glueToActionAndFacing(ANIM_ACTION_WALK, SOUTH_EAST, (context) => context.animateSprite(Assets.imageAsset("sheep-sesw-walk.png"), { frameCount: 2, flip: true }))
                .glueToActionAndFacing(ANIM_ACTION_WALK, SOUTH_WEST, (context) => context.animateSprite(Assets.imageAsset("sheep-sesw-walk.png"), { frameCount: 2 }))
                .glueToActionAndFacing(ANIM_ACTION_WALK, WEST, (context) => context.animateSprite(Assets.imageAsset("sheep-ew-walk.png"), { frameCount: 2 }))
                .glueToActionAndFacing(ANIM_ACTION_WALK, NORTH_WEST, (context) => context.animateSprite(Assets.imageAsset("sheep-nenw-walk.png"), { frameCount: 2, flip: true }))
                ;
            var treeType0Animator = createAnimationBuilder(new SpriteEntityAnimatorContextFactory(defaultShadowUrl).withDefaultOptions({ offsetY: 2, width: 64, height: 128 }).withPixelScale(defaultPixelScale), (e) => new EntityAnimationStateGenerator(e))
                .glueToAction(ANIM_ACTION_WAIT, (context) => context.animateSprite(Assets.imageAsset("tree0.png"), { frameCount: 1 }));


            this.playerEntityType = this.addEntityType(new EntityType(0, "player", (e, gc) => this.trackHeight(new PlayerEntityController(e, 0.1)), (scene: any, e: IEntity) => personAnimator.build(scene, e),
                Traits.buildTrait(EntityTraits.CameraFocusTraitType, () => new EntityTraits.CameraFocusTrait(true))));
            //this.followerEntityType = this.addEntityType(new EntityType(1, "follower", (e, gc) => this.trackHeight(new FollowerEntityController(e, gc.traits().safeTrait(GameTraits.EntityManagerTraitType), 0.1)), (scene: any, e: IEntity) => personAnimator.build(scene, e),
            this.followerEntityType = this.addEntityType(new EntityType(1, "follower", (e, gc) => this.trackHeight(new NullEntityController(e)), (scene: any, e: IEntity) => personAnimator.build(scene, e),
                Traits.noTraits()));
            this.sheepEntityType = this.addEntityType(new EntityType(2, "sheep", (e, gc) => this.trackHeight(new NullEntityController(e)), (scene: any, e: IEntity) => sheepAnimator.build(scene, e),
                Traits.noTraits()));
            this.treeEntityType = this.addEntityType(new EntityType(3, "tree", (e, gc) => this.trackHeight(new NullEntityController(e)), (scene: any, e: IEntity) => treeType0Animator.build(scene, e),
                Traits.noTraits()));

        }
    }

    export function setup(container: HTMLElement): IGame {

        var displayWidth = container.offsetWidth;
        var displayHeight = container.offsetHeight;
        var scene = new THREE.Scene();

        var light = new THREE.DirectionalLight(0xffffff, 1.0);
        light.position.set(100, 0, 100);
        light.castShadow = true;
        scene.add(light);

        var ambientLight = new THREE.AmbientLight("#cccccc");
        scene.add(ambientLight);

        var camera = new THREE.PerspectiveCamera(45, displayWidth / displayHeight, 0.1, 1000);
        camera.position.set(0, 50, 10);
        camera.lookAt(scene.position);

        var terrainGeometryData:TerrainGeometryData = null;
        //var tgLoader = new TerrainGeometryDataLoader(Assets.imageAsset("grounddata.png"), 256, 256, 128, 128, null);
        var tgLoader = new TerrainGeometryDataLoader(Assets.imageAsset("grounddata_shallow.png"), 256, 256, 128, 128, null);
        //var tgLoader = new TerrainGeometryDataLoader(imageAsset("grounddata-flat.png"), 256, 256, 128, 128, null);
        //var tgLoader = new TerrainGeometryDataLoader(imageAsset("low-to-high.png"), 256, 256, 128, 128);
        var taLoader = new TerrainAtlasDataLoader(Assets.atlasAsset("atlas-test.png"), Assets.atlasAsset("atlas-test-uv.json"));
        //var tlLoader = new SimpleTerrainLayerMapLoader(imageAsset("tile-map.png"), taLoader);
        //var tlLoader = new SimpleTerrainLayerMapLoader(imageAsset("tile-map-test-2.png"), taLoader);
        var tsBuilder = new TerrainSceneBuilder(scene);
        Promises.when(
            tgLoader.load(),
            taLoader.load().then(r => new SimpleTerrainLayerMapLoader(Assets.imageAsset("tile-map-test-3.png"), r).load())
        ).done(r => {
            tsBuilder.build(r.item0, r.item1);
            terrainGeometryData = r.item0;
            new TerrainDecal(scene, Assets.atlasAsset("atlas-test.png"), new Rect(0, 0, 1, 1), new Rect(-5, -5, 10, 10), (x, z) => terrainGeometryData.getY(x, z));
            });
        var gc = new GameContext();
        gc.traits().addTrait();     
        gc.traits().addTrait(GameTraits.SceneQueryTraitType, new SceneQuery(function (x, z) { return terrainGeometryData ? terrainGeometryData.getY(x, z) : 0.0; }));
        var entityTypes = new BsEntityTypes(gc);
        var allEntities = new EntityManager(scene, gc);
        gc.traits().addTrait(GameTraits.EntityManagerTraitType, allEntities);
        //allEntities.addEntity(entityTypes.playerEntityType, -1);
        //allEntities.addEntity(entityTypes.sheepEntityType, -2).moveTo(10, 0, 0);

        for (var i = 0; i < 100; ++i) {
            allEntities.addEntity(entityTypes.treeEntityType, -3-i).moveTo((Math.random() - 0.5) * 200, 0, (Math.random() - 0.5) * 200);
        }

        var editPos = new THREE.AxisHelper(4);
        scene.add(editPos);

        var raycaster = new THREE.Raycaster();
        window.addEventListener('mousedown', e => {

        });
        window.addEventListener('mousemove', e => {
            var x = clamp(e.pageX - container.offsetLeft, 0, container.clientWidth);
            var y = clamp(e.pageY - container.offsetTop, 0, container.clientHeight);
            
            var mousePos = new THREE.Vector2(2 * (x / displayWidth) - 1, 1 - 2 * (y / displayHeight));
            raycaster.setFromCamera(mousePos, camera);
            var intersects = raycaster.intersectObjects(scene.children);
            for (var i = 0; i < intersects.length; i++) {
                //intersects[i].object.material.color.set(0xff0000);
                if (intersects[i].object && intersects[i].object.geometry == terrainGeometryData.geometry) {
                    editPos.position.set(intersects[i].point.x, intersects[i].point.y, intersects[i].point.z);
                    var offsetA = intersects[i].face.a * 3;
                    var offsetB = intersects[i].face.b * 3;
                    var offsetC = intersects[i].face.c * 3;
                    var uA = terrainGeometryData.geometry.attributes.uv.array[offsetA];
                    var vA = terrainGeometryData.geometry.attributes.uv.array[offsetA + 1];
                    var uB = terrainGeometryData.geometry.attributes.uv.array[offsetB];
                    var vB = terrainGeometryData.geometry.attributes.uv.array[offsetB + 1];
                    var uC = terrainGeometryData.geometry.attributes.uv.array[offsetB];
                    var vC = terrainGeometryData.geometry.attributes.uv.array[offsetB + 1];

                    var minU = Math.min(uA, uB, uC);
                    var minV = Math.min(vA, vB, vC);

                }
            }
        }, false);

        return {
            processUpdate: (update: NetCode.SharedWorldSyncActions) => {
                if (update.AddActions) {
                    for (var i = 0; i < update.AddActions.length; ++i) {
                        var addAction = update.AddActions[i];
                        entityTypes.entityTypeById(addAction.NewEntityId).do(et => {
                            allEntities.addEntity(et, addAction.NewEntityId).moveToPos(NetCode.IntPoint3d.toVector3d(addAction.Pos, update.ScaleFactor));
                        });
                    }
                }
                if (update.MoveActions) {
                    for (var i = 0; i < update.MoveActions.length; ++i) {
                        var moveAction = update.MoveActions[i];
                        allEntities.entityById(moveAction.EntityId).do(e => e.moveToPos(NetCode.IntPoint3d.toVector3d(moveAction.Pos, update.ScaleFactor)));
                    }
                }
            },
            update: () => {
                allEntities.update();
                allEntities
                    .first(e => e.traits.trait(EntityTraits.CameraFocusTraitType).mapOr(t => t.focus, false))
                    .do(e => {
                        var pos = e.state.position;
                        camera.position.set(pos.x, pos.y + 30, pos.z + 30);
                        camera.lookAt(new THREE.Vector3(pos.x, pos.y, pos.z));
                    });
            },

            render: renderer => {
                renderer.render(scene, camera);
            }
        };
    }
}