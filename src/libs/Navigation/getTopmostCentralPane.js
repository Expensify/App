import lodashFindLast from 'lodash/findLast';

// This function is in a separate file than Navigation.js to avoid cyclic dependency.

/**
 * Find the route object from the topmost CentralPaneNavigator
 *
 * @param {Object} state - The react-navigation state
 * @returns {String | undefined}
 */
function getTopmostCentralPane(state) {
    if (!state) {
        return;
    }
    return lodashFindLast(state.routes, (route) => route.name === 'CentralPaneNavigator');
}

export default getTopmostCentralPane;
