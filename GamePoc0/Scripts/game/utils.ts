
//declare var $: any;
declare var THREE: any;

module Tuple {
    export function create<T0, T1>(item0: T0, item1: T1): Tuple2<T0, T1>;
    export function create<T0, T1, T2>(item0: T0, item1: T1, item2: T2): Tuple3<T0, T1, T2>;
    
    export function create(item0, item1, item2?): any {
        if (typeof item2 === 'undefined') {
            return new Tuple2(item0, item1);
        }
        return new Tuple3(item0, item1, item2);
    }
}

class Tuple2<T0, T1> {
    constructor(public item0: T0, public item1: T1) { }
}

class Tuple3<T0, T1, T2> {
    constructor(public item0: T0, public item1: T1, public item2: T2) { }
}

module Promises {
    export function when<X, Y>(p0: JQueryPromise<X>, p1: JQueryPromise<Y>): JQueryPromise<Tuple2<X, Y>> {
        var p = $.Deferred<Tuple2<X, Y>>();
        $.when(<JQueryPromise<any>>p0, <JQueryPromise<any>>p1)
            .then((x,y) => {
                    p.resolve(Tuple.create(<X>x, <Y>y));
                },
                x => {
                    p.fail();
                },
                x => {
                    p.progress();
                }
            );
        return p.promise();
    }
}

function coalesceProperty<TIn, TOut>(get: (o: TIn) => TOut, ...objs: Array<TIn>) {
    for (var o of objs) {
        var r = get(o);
        if (r) {
            return r;
        }
    }
    return null;
}
function nvl<T>(v0: T, v1: T): T {
    return v0 ? v0 : v1;
}

function firstValid<TIn, TOut>(...funcs: Array<(TIn) => TOut>): (TIn) => TOut {
    return (o: TIn): TOut => {
        for (var f in funcs) {
            var r = f(o);
            if (r) {
                return r;
            }
        }
        return null;
    };
}


function clamp(v: number, min: number, max: number) {
    return v < min ? min : (v > max ? max : v);
}

function lerp(x: number, y: number, t: number) {
    return x * (1 - t) + y * t;
}

function bilinearFilter(x: number, y: number, v00: number, v10: number, v01: number, v11: number) {
    var v00_10 = lerp(v00, v10, x);
    var v01_11 = lerp(v01, v11, x);
    return lerp(v00_10, v01_11, y);
}

function loadImageDeferred(src: string) {
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

function canvasImage(canvas: HTMLCanvasElement, img: HTMLImageElement, w: number, h: number) {
    canvas.width = w !== undefined ? w : img.naturalWidth;
    canvas.height = h !== undefined ? h : img.naturalHeight;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return ctx;
}
