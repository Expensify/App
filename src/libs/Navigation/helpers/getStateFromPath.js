
exports.__esModule = true;
const native_1 = require('@react-navigation/native');
const linkingConfig_1 = require('@libs/Navigation/linkingConfig');
/**
 * @param path - The path to parse
 * @returns - It's possible that there is no navigation action for the given path
 */
function getStateFromPath(path) {
    const normalizedPath = !path.startsWith('/') ? `/${  path}` : path;
    // This function is used in the linkTo function where we want to use default getStateFromPath function.
    const state = native_1.getStateFromPath(normalizedPath, linkingConfig_1.linkingConfig.config);
    if (!state) {
        throw new Error('Failed to parse the path to a navigation state.');
    }
    return state;
}
exports['default'] = getStateFromPath;
