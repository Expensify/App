"use strict";
exports.__esModule = true;
var native_1 = require("@react-navigation/native");
var linkingConfig_1 = require("@libs/Navigation/linkingConfig");
/**
 * @param path - The path to parse
 * @returns - It's possible that there is no navigation action for the given path
 */
function getStateFromPath(path) {
    var normalizedPath = !path.startsWith('/') ? "/" + path : path;
    // This function is used in the linkTo function where we want to use default getStateFromPath function.
    var state = native_1.getStateFromPath(normalizedPath, linkingConfig_1.linkingConfig.config);
    if (!state) {
        throw new Error('Failed to parse the path to a navigation state.');
    }
    return state;
}
exports["default"] = getStateFromPath;
