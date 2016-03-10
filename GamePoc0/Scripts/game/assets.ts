module Assets {
    export function asset(path: string): string {
        return "/Content/assets/" + path;
    }

    export function imageAsset(image: string): string {
        return asset("images/" + image);
    }

    export function atlasAsset(p: string): string {
        return asset("atlas/" + p);
    }

    //  Deferred image loader using JQuery promises
    export function loadImageDeferred(src: string): JQueryPromise<HTMLImageElement> {
        var deferred = $.Deferred<HTMLImageElement>();
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

}