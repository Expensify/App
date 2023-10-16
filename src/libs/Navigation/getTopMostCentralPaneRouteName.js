import lodashFindLast from 'lodash/findLast';
import lodashLast from 'lodash/last';

/**
 * Find the name of top most central pane route.
 *
 * @param {Object} state - The react-navigation state
 * @returns {String | undefined} - It's possible that there is no central pane in the state.
 */
function getTopMostCentralPaneRouteName(state) {
    if (!state) {
        return undefined;
    }
    const topMostCentralPane = lodashFindLast(state.routes, (route) => route.name === 'CentralPaneNavigator');

    if (!topMostCentralPane) {
        return undefined;
    }

    if (topMostCentralPane.state && topMostCentralPane.state.routes) {
        // State may don't have index in some cases. But in this case there will be only one route in state.
        return lodashLast(topMostCentralPane.state.routes).name;
    }

    if (topMostCentralPane.params) {
        // State may don't have inner state in some cases (e.g generating actions from path). But in this case there will be params available.
        return topMostCentralPane.params.screen;
    }

    return undefined;
}

export default getTopMostCentralPaneRouteName;
