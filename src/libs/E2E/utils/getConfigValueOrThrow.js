"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getConfigValueOrThrow;
var react_native_config_1 = require("react-native-config");
/**
 * Gets a config value or throws an error if the value is not defined.
 */
function getConfigValueOrThrow(key, config) {
    if (config === void 0) { config = react_native_config_1.default; }
    var value = config[key];
    if (value == null) {
        throw new Error("Missing config value for ".concat(key));
    }
    return value;
}
