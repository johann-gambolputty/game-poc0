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
