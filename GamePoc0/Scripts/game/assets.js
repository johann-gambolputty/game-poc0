var Assets;
(function (Assets) {
    function asset(path) {
        return "/Content/assets/" + path;
    }
    Assets.asset = asset;
    function imageAsset(image) {
        return asset("images/" + image);
    }
    Assets.imageAsset = imageAsset;
    function atlasAsset(p) {
        return asset("atlas/" + p);
    }
    Assets.atlasAsset = atlasAsset;
    //  Deferred image loader using JQuery promises
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
    Assets.loadImageDeferred = loadImageDeferred;
})(Assets || (Assets = {}));
