import lodashFindLast from 'lodash/findLast';

// This function is in a separate file than Navigation.js to avoid cyclic dependency.

/**
 * Find the last visited report screen in the navigation state and get the id of it.
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
