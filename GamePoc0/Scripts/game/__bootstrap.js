
//	http://stackoverflow.com/questions/950087/how-to-include-a-javascript-file-in-another-javascript-file
function loadImport(filename, callback) {
    Debugger.log("Importing " + filename);
    var s = document.createElement("script");
    s.src = filename;
    s.type = "text/javascript";
    s.onreadystatechange = callback;
    s.onload = callback;
    document.getElementsByTagName('head')[0].appendChild(s);
}
function loadImports(filenames, callback) {
    if (!filenames || !filenames.length) {
        callback();
        return;
    }
    var load = function (index) {
        if (index == filenames.length) {
            callback();
        }
        else {
            loadImport(filenames[index], function () { load(index + 1); });
        }
    };
    load(0);
}

function bootstrapGame() {
    loadImports(["sprite.js", "keys.js", "controllers.js"]);
}