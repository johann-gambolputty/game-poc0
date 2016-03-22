var Tuple;
(function (Tuple) {
    function create(item0, item1, item2) {
        if (typeof item2 === 'undefined') {
            return new Tuple2(item0, item1);
        }
        return new Tuple3(item0, item1, item2);
    }
    Tuple.create = create;
})(Tuple || (Tuple = {}));
var Tuple2 = (function () {
    function Tuple2(item0, item1) {
        this.item0 = item0;
        this.item1 = item1;
    }
    return Tuple2;
})();
var Tuple3 = (function () {
    function Tuple3(item0, item1, item2) {
        this.item0 = item0;
        this.item1 = item1;
        this.item2 = item2;
    }
    return Tuple3;
})();
var Promises;
(function (Promises) {
    function when(p0, p1) {
        var p = $.Deferred();
        $.when(p0, p1)
            .then(function (x, y) {
            p.resolve(Tuple.create(x, y));
        }, function (x) {
            p.fail();
        }, function (x) {
            p.progress();
        });
        return p.promise();
    }
    Promises.when = when;
})(Promises || (Promises = {}));
function coalesceProperty(get) {
    var objs = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        objs[_i - 1] = arguments[_i];
    }
    for (var _a = 0; _a < objs.length; _a++) {
        var o = objs[_a];
        var r = get(o);
        if (r) {
            return r;
        }
    }
    return null;
}
function nvl(v0, v1) {
    return v0 ? v0 : v1;
}
function firstValid() {
    var funcs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        funcs[_i - 0] = arguments[_i];
    }
    return function (o) {
        for (var f in funcs) {
            var r = f(o);
            if (r) {
                return r;
            }
        }
        return null;
    };
}
function clamp(v, min, max) {
    return v < min ? min : (v > max ? max : v);
}
function lerp(x, y, t) {
    return x * (1 - t) + y * t;
}
function bilinearFilter(x, y, v00, v10, v01, v11) {
    var v00_10 = lerp(v00, v10, x);
    var v01_11 = lerp(v01, v11, x);
    return lerp(v00_10, v01_11, y);
}
function loadImageDeferred(src) {
    var deferred = $.Deferred();
    var img = new Image();
    img.onload = function () {
        deferred.resolve(img);
    };
    img.onerror = function () {
        deferred.reject(img);
    };
    img.onabort = function () {
        deferred.reject(img);
    };
    img.src = src;
    return deferred.promise();
}
function canvasImage(canvas, img, w, h) {
    canvas.width = w !== undefined ? w : img.naturalWidth;
    canvas.height = h !== undefined ? h : img.naturalHeight;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return ctx;
}
//# sourceMappingURL=utils.js.map