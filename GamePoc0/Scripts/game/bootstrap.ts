
interface IGame {
    update();
    render(renderer: any);
}

module Bootstrap {

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
        gc.traits().addTrait(GameTraits.SceneQueryTraitType, new SceneQuery(function (x, z) { return terrainGeometryData ? terrainGeometryData.getY(x, z) : 0.0; }));
        var allEntities = new EntityManager(scene, gc);
        gc.traits().addTrait(GameTraits.EntityManagerTraitType, allEntities);
        allEntities.addEntity(EntityTypes.playerEntityType);
        allEntities.addEntity(EntityTypes.sheepEntityType).moveTo(10, 0, 0);

        for (var i = 0; i < 100; ++i) {
            allEntities.addEntity(EntityTypes.treeEntityType).moveTo((Math.random() - 0.5) * 200, 0, (Math.random() - 0.5) * 200);
        }

        var editPos = new THREE.AxisHelper(4 );
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