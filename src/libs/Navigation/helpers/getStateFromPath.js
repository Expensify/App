"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var linkingConfig_1 = require("@libs/Navigation/linkingConfig");
var getMatchingNewRoute_1 = require("./getMatchingNewRoute");
/**
 * @param path - The path to parse
 * @returns - It's possible that there is no navigation action for the given path
 */
function getStateFromPath(path) {
    var _a;
    var normalizedPath = !path.startsWith('/') ? "/".concat(path) : path;
    var normalizedPathAfterRedirection = (_a = (0, getMatchingNewRoute_1.default)(normalizedPath)) !== null && _a !== void 0 ? _a : normalizedPath;
    // This function is used in the linkTo function where we want to use default getStateFromPath function.
    var state = (0, native_1.getStateFromPath)(normalizedPathAfterRedirection, linkingConfig_1.linkingConfig.config);
    if (!state) {
        throw new Error('Failed to parse the path to a navigation state.');
    }
    return state;
}
exports.default = getStateFromPath;
