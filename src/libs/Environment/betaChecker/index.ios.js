"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
/**
 * Check to see if the build is staging (TestFlight) or production
 */
function isBetaBuild() {
    return new Promise(function (resolve) {
        react_native_1.NativeModules.EnvironmentChecker.isBeta().then(function (isBeta) {
            resolve(isBeta);
        });
    });
}
exports.default = {
    isBetaBuild: isBetaBuild,
};
