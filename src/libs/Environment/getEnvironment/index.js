"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_config_1 = require("react-native-config");
var CONST_1 = require("@src/CONST");
function getEnvironment() {
    var _a;
    return Promise.resolve((_a = react_native_config_1.default === null || react_native_config_1.default === void 0 ? void 0 : react_native_config_1.default.ENVIRONMENT) !== null && _a !== void 0 ? _a : CONST_1.default.ENVIRONMENT.DEV);
}
exports.default = getEnvironment;
