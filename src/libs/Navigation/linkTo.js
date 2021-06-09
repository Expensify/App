import {
    getStateFromPath,
    getActionFromState,
} from '@react-navigation/core';
import linkingConfig from './linkingConfig';

export default function linkTo(navigation, path) {
    const normalizedPath = !path.startsWith('/') ? `/${path}` : path;
    if (navigation === undefined) {
        throw new Error("Couldn't find a navigation object. Is your component inside a screen in a navigator?");
    }

    const state = linkingConfig.getStateFromPath
        ? linkingConfig.getStateFromPath(normalizedPath, linkingConfig.config)
        : getStateFromPath(normalizedPath, linkingConfig.config);

    if (!state) {
        throw new Error('Failed to parse the path to a navigation state.');
    }

    let root = navigation;
    let current;

    // Traverse up to get the root navigation
    // eslint-disable-next-line no-cond-assign
    while ((current = root.getParent())) {
        root = current;
    }

    const action = getActionFromState(state, linkingConfig.config);

    if (action !== undefined) {
        root.dispatch(action);
    } else {
        root.reset(state);
    }
}
