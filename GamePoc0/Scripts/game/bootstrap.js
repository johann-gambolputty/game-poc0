var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Bootstrap;
(function (Bootstrap) {
    var BsEntityTypes = (function (_super) {
        __extends(BsEntityTypes, _super);
        function BsEntityTypes(gc) {
            var _this = this;
            _super.call(this);
            this.gc = gc;
            var defaultShadowUrl = Assets.imageAsset("shadow.png");
            var defaultPixelScale = 0.1; //  Pixel to world size factor (e.g. 32x32 spite with scale of 0.1 is 3.2m x 3.2m, assuming world units are metres)
            var personAnimator = createAnimationBuilder(new SpriteEntityAnimatorContextFactory(defaultShadowUrl).withDefaultOptions({ offsetY: 2, width: 32, height: 32 }).withPixelScale(defaultPixelScale), function (e) { return new EntityAnimationStateGenerator(e); })
                .glueToAction(ANIM_ACTION_WAIT, function (context) { return context.animateSprite(Assets.imageAsset("test-s-walk.png"), { frameCount: 1 }); })
                .glueToActionAndFacing(ANIM_ACTION_WALK, SOUTH, function (context) { return context.animateSprite(Assets.imageAsset("test-s-walk.png"), { frameCount: 4 }); })
                .glueToActionAndFacing(ANIM_ACTION_WALK, NORTH, function (context) { return context.animateSprite(Assets.imageAsset("test-n-walk.png"), { frameCount: 4 }); })
                .glueToActionAndFacing(ANIM_ACTION_WALK, NORTH_EAST, function (context) { return context.animateSprite(Assets.imageAsset("test-nwne-walk.png"), { frameCount: 4 }); })
                .glueToActionAndFacing(ANIM_ACTION_WALK, EAST, function (context) { return context.animateSprite(Assets.imageAsset("test-ew-walk.png"), { frameCount: 4 }); })
                .glueToActionAndFacing(ANIM_ACTION_WALK, SOUTH_EAST, function (context) { return context.animateSprite(Assets.imageAsset("test-swse-walk.png"), { frameCount: 4 }); })
                .glueToActionAndFacing(ANIM_ACTION_WALK, SOUTH_WEST, function (context) { return context.animateSprite(Assets.imageAsset("test-swse-walk.png"), { frameCount: 4, flip: true }); })
                .glueToActionAndFacing(ANIM_ACTION_WALK, WEST, function (context) { return context.animateSprite(Assets.imageAsset("test-ew-walk.png"), { frameCount: 4, flip: true }); })
                .glueToActionAndFacing(ANIM_ACTION_WALK, NORTH_WEST, function (context) { return context.animateSprite(Assets.imageAsset("test-nwne-walk.png"), { frameCount: 4, flip: true }); });
            var sheepAnimator = createAnimationBuilder(new SpriteEntityAnimatorContextFactory(defaultShadowUrl).withDefaultOptions({ offsetY: 2, width: 32, height: 32 }).withPixelScale(defaultPixelScale), function (e) { return new EntityAnimationStateGenerator(e); })
                .glueToAction(ANIM_ACTION_WAIT, function (context) { return context.animateSprite(Assets.imageAsset("sheep-s-walk.png"), { frameCount: 1 }); })
                .glueToActionAndFacing(ANIM_ACTION_WALK, SOUTH, function (context) { return context.animateSprite(Assets.imageAsset("sheep-s-walk.png"), { frameCount: 2 }); })
                .glueToActionAndFacing(ANIM_ACTION_WALK, NORTH, function (context) { return context.animateSprite(Assets.imageAsset("sheep-n-walk.png"), { frameCount: 2 }); })
                .glueToActionAndFacing(ANIM_ACTION_WALK, NORTH_EAST, function (context) { return context.animateSprite(Assets.imageAsset("sheep-nenw-walk.png"), { frameCount: 2 }); })
                .glueToActionAndFacing(ANIM_ACTION_WALK, EAST, function (context) { return context.animateSprite(Assets.imageAsset("sheep-ew-walk.png"), { frameCount: 2, flip: true }); })
                .glueToActionAndFacing(ANIM_ACTION_WALK, SOUTH_EAST, function (context) { return context.animateSprite(Assets.imageAsset("sheep-sesw-walk.png"), { frameCount: 2, flip: true }); })
                .glueToActionAndFacing(ANIM_ACTION_WALK, SOUTH_WEST, function (context) { return context.animateSprite(Assets.imageAsset("sheep-sesw-walk.png"), { frameCount: 2 }); })
                .glueToActionAndFacing(ANIM_ACTION_WALK, WEST, function (context) { return context.animateSprite(Assets.imageAsset("sheep-ew-walk.png"), { frameCount: 2 }); })
                .glueToActionAndFacing(ANIM_ACTION_WALK, NORTH_WEST, function (context) { return context.animateSprite(Assets.imageAsset("sheep-nenw-walk.png"), { frameCount: 2, flip: true }); });
            var treeType0Animator = createAnimationBuilder(new SpriteEntityAnimatorContextFactory(defaultShadowUrl).withDefaultOptions({ offsetY: 2, width: 64, height: 128 }).withPixelScale(defaultPixelScale), function (e) { return new EntityAnimationStateGenerator(e); })
                .glueToAction(ANIM_ACTION_WAIT, function (context) { return context.animateSprite(Assets.imageAsset("tree0.png"), { frameCount: 1 }); });
            this.playerEntityType = this.addEntityType(new EntityType(0, "player", function (e, gc) { return _this.trackHeight(new PlayerEntityController(e, 0.1)); }, function (scene, e) { return personAnimator.build(scene, e); }, Traits.buildTrait(EntityTraits.CameraFocusTraitType, function () { return new EntityTraits.CameraFocusTrait(true); })));
            //this.followerEntityType = this.addEntityType(new EntityType(1, "follower", (e, gc) => this.trackHeight(new FollowerEntityController(e, gc.traits().safeTrait(GameTraits.EntityManagerTraitType), 0.1)), (scene: any, e: IEntity) => personAnimator.build(scene, e),
            this.followerEntityType = this.addEntityType(new EntityType(1, "follower", function (e, gc) { return _this.trackHeight(new NullEntityController(e)); }, function (scene, e) { return personAnimator.build(scene, e); }, Traits.noTraits()));
            this.sheepEntityType = this.addEntityType(new EntityType(2, "sheep", function (e, gc) { return _this.trackHeight(new NullEntityController(e)); }, function (scene, e) { return sheepAnimator.build(scene, e); }, Traits.noTraits()));
            this.treeEntityType = this.addEntityType(new EntityType(3, "tree", function (e, gc) { return _this.trackHeight(new NullEntityController(e)); }, function (scene, e) { return treeType0Animator.build(scene, e); }, Traits.noTraits()));
        }
        BsEntityTypes.prototype.trackHeight = function (controller) {
            return new HeightEntityContoller(controller, this.gc.traits().safeTrait(GameTraits.SceneQueryTraitType).getHeight);
        };
        return BsEntityTypes;
    })(EntityTypes);
    function setup(container) {
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
        var terrainGeometryData = null;
        //var tgLoader = new TerrainGeometryDataLoader(Assets.imageAsset("grounddata.png"), 256, 256, 128, 128, null);
        var tgLoader = new TerrainGeometryDataLoader(Assets.imageAsset("grounddata_shallow.png"), 256, 256, 128, 128, null);
        //var tgLoader = new TerrainGeometryDataLoader(imageAsset("grounddata-flat.png"), 256, 256, 128, 128, null);
        //var tgLoader = new TerrainGeometryDataLoader(imageAsset("low-to-high.png"), 256, 256, 128, 128);
        var taLoader = new TerrainAtlasDataLoader(Assets.atlasAsset("atlas-test.png"), Assets.atlasAsset("atlas-test-uv.json"));
        //var tlLoader = new SimpleTerrainLayerMapLoader(imageAsset("tile-map.png"), taLoader);
        //var tlLoader = new SimpleTerrainLayerMapLoader(imageAsset("tile-map-test-2.png"), taLoader);
        var tsBuilder = new TerrainSceneBuilder(scene);
        Promises.when(tgLoader.load(), taLoader.load().then(function (r) { return new SimpleTerrainLayerMapLoader(Assets.imageAsset("tile-map-test-3.png"), r).load(); })).done(function (r) {
            tsBuilder.build(r.item0, r.item1);
            terrainGeometryData = r.item0;
            new TerrainDecal(scene, Assets.atlasAsset("atlas-test.png"), new Rect(0, 0, 1, 1), new Rect(-5, -5, 10, 10), function (x, z) { return terrainGeometryData.getY(x, z); });
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
            allEntities.addEntity(entityTypes.treeEntityType, -3 - i).moveTo((Math.random() - 0.5) * 200, 0, (Math.random() - 0.5) * 200);
        }
        var editPos = new THREE.AxisHelper(4);
        scene.add(editPos);
        var raycaster = new THREE.Raycaster();
        window.addEventListener('mousedown', function (e) {
        });
        window.addEventListener('mousemove', function (e) {
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
            processUpdate: function (update) {
                if (update.AddActions) {
                    for (var i = 0; i < update.AddActions.length; ++i) {
                        var addAction = update.AddActions[i];
                        entityTypes.entityTypeById(addAction.NewEntityId).do(function (et) {
                            allEntities.addEntity(et, addAction.NewEntityId).moveToPos(NetCode.IntPoint3d.toVector3d(addAction.Pos, update.ScaleFactor));
                        });
                    }
                }
                if (update.MoveActions) {
                    for (var i = 0; i < update.MoveActions.length; ++i) {
                        var moveAction = update.MoveActions[i];
                        allEntities.entityById(moveAction.EntityId).do(function (e) { return e.moveToPos(NetCode.IntPoint3d.toVector3d(moveAction.Pos, update.ScaleFactor)); });
                    }
                }
            },
            update: function () {
                allEntities.update();
                allEntities
                    .first(function (e) { return e.traits.trait(EntityTraits.CameraFocusTraitType).mapOr(function (t) { return t.focus; }, false); })
                    .do(function (e) {
                    var pos = e.state.position;
                    camera.position.set(pos.x, pos.y + 30, pos.z + 30);
                    camera.lookAt(new THREE.Vector3(pos.x, pos.y, pos.z));
                });
            },
            render: function (renderer) {
                renderer.render(scene, camera);
            }
        };
    }
    Bootstrap.setup = setup;
})(Bootstrap || (Bootstrap = {}));
