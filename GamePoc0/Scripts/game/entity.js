
function entity(x, z, rendererFactory, controllerFactory) {
    var pos = [x, 0, z];
    var fac = [1, 0];
    var facingIndex = 0;
    this.facing = function () {
        return facingIndex;
    };
    this.x = function () {
        return pos[0];
    };
    this.y = function () {
        return pos[1];
    };
    this.z = function () {
        return pos[2];
    };
    this.sety = function (y) {
        pos[1] = y;
    };
    this.set = function (x, y, z) {
        pos[0] = x;
        pos[1] = y;
        pos[2] = z;
    }
    var renderer = rendererFactory.buildRenderer(this);
    var controller = controllerFactory.buildController(this);
    this.update = function () {
        if (!controller) {
            return;
        }
        var s = controller.update();
        pos[0] = s.x;
        pos[1] = s.y;
        pos[2] = s.z;
        facingIndex = s.facing;

        renderer.update(pos[0], pos[1], pos[2]);
    };
}


function entityManager() {
    _this = this;
    this.all = [];
    this.player = null;
    this.add = function (entity) {
        _this.all.push(entity);
        return entity;
    };
    this.setPlayer = function (entity) {
        _this.player = entity;
        return entity;
    };
    this.update = function () {
        for (var i = 0; i < _this.all.length; ++i) {
            _this.all[i].update();
        }
    };

}