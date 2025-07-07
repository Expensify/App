"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_config_1 = require("react-native-config");
var betaChecker_1 = require("@libs/Environment/betaChecker");
var CONST_1 = require("@src/CONST");
var environment = null;
/**
 * Returns a promise that resolves with the current environment string value
 */
function getEnvironment() {
    return new Promise(function (resolve) {
        var _a, _b;
        // If we've already set the environment, use the current value
        if (environment) {
            resolve(environment);
            return;
        }
        if (((_a = react_native_config_1.default === null || react_native_config_1.default === void 0 ? void 0 : react_native_config_1.default.ENVIRONMENT) !== null && _a !== void 0 ? _a : CONST_1.default.ENVIRONMENT.DEV) === CONST_1.default.ENVIRONMENT.DEV) {
            environment = CONST_1.default.ENVIRONMENT.DEV;
            resolve(environment);
            return;
        }
        if (((_b = react_native_config_1.default === null || react_native_config_1.default === void 0 ? void 0 : react_native_config_1.default.ENVIRONMENT) !== null && _b !== void 0 ? _b : CONST_1.default.ENVIRONMENT.DEV) === CONST_1.default.ENVIRONMENT.ADHOC) {
            environment = CONST_1.default.ENVIRONMENT.ADHOC;
            resolve(environment);
            return;
        }
        // If we haven't set the environment yet and we aren't on dev/adhoc, check to see if this is a beta build
        betaChecker_1.default.isBetaBuild().then(function (isBeta) {
            environment = isBeta ? CONST_1.default.ENVIRONMENT.STAGING : CONST_1.default.ENVIRONMENT.PRODUCTION;
            resolve(environment);
        });
    });
}
exports.default = getEnvironment;
