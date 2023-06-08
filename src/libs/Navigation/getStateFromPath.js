import {getStateFromPath as RNGetStateFromPath} from '@react-navigation/native';
import linkingConfig from './linkingConfig';

/**
 * @param {String} path - The path to parse
 * @returns {Object | undefined} - It's possible that there is no navigation action for the given path
 */
function getStateFromPath(path) {
    const normalizedPath = !path.startsWith('/') ? `/${path}` : path;

    const state = linkingConfig.getStateFromPath ? linkingConfig.getStateFromPath(normalizedPath, linkingConfig.config) : RNGetStateFromPath(normalizedPath, linkingConfig.config);

    if (!state) {
        throw new Error('Failed to parse the path to a navigation state.');
    }
    return state;
}

export default getStateFromPath;
