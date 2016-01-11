
declare var $: any;
declare var THREE: any;

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
