"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
var package_json_1 = require("../../package.json");
/**
 * Custom webpack plugin that writes the app version (from package.json) and the webpack hash to './version.json'
 */
var CustomVersionFilePlugin = /** @class */ (function () {
    function CustomVersionFilePlugin() {
    }
    CustomVersionFilePlugin.prototype.apply = function (compiler) {
        compiler.hooks.done.tap(this.constructor.name, function () {
            var versionPath = path_1.default.join(__dirname, '/../../dist/version.json');
            fs_1.default.promises
                .mkdir(path_1.default.dirname(versionPath), { recursive: true })
                .then(function () { return fs_1.default.promises.readFile(versionPath, 'utf8'); })
                .then(function (existingVersion) {
                var version = JSON.parse(existingVersion).version;
                if (version !== package_json_1.version) {
                    fs_1.default.promises.writeFile(versionPath, JSON.stringify({ version: package_json_1.version }), 'utf8');
                }
            })
                .catch(function (err) {
                if (err.code === 'ENOENT') {
                    // if file doesn't exist
                    fs_1.default.promises.writeFile(versionPath, JSON.stringify({ version: package_json_1.version }), 'utf8');
                }
                else {
                    throw err;
                }
            });
        });
    };
    return CustomVersionFilePlugin;
}());
exports.default = CustomVersionFilePlugin;
