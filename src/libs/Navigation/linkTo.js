import {
    getStateFromPath,
    getActionFromState,
} from '@react-navigation/core';
import _ from 'lodash';
import NAVIGATORS from '../../NAVIGATORS';
import linkingConfig from './linkingConfig';

export default function linkTo(navigation, path) {
    const normalizedPath = !path.startsWith('/') ? `/${path}` : path;
    if (navigation === undefined) {
        throw new Error("Couldn't find a navigation object. Is your component inside a screen in a navigator?");
    }

    // TODO-NR: We need to figure out how to use ensureCentralPaneOnStack in a way that doesn't cause problem with linkTo function

    // const state = linkingConfig.getStateFromPath
    //     ? linkingConfig.getStateFromPath(normalizedPath, linkingConfig.config)
    //     : getStateFromPath(normalizedPath, linkingConfig.config);
    const state = getStateFromPath(normalizedPath, linkingConfig.config);

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

    // if action type is different than NAVIGATE we can't change it to the PUSH safely
    if (action.type === 'NAVIGATE') {
        // if this action is navigating to the report screen - push
        if (action.payload.name === NAVIGATORS.CENTRAL_PANE_NAVIGATOR) {
            action.type = 'PUSH';
        } else if (action.payload.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR && _.last(root.getState().routes).name !== NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
            // if this action is navigating to the RightModalNavigator and the last route on the root navigator is not RightModalNavigator then push
            action.type = 'PUSH';
        }
    }

    if (action !== undefined) {
        root.dispatch(action);
    } else {
        root.reset(state);
    }
}
