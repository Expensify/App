import {NavigationState} from '@react-navigation/native';
import lodashFindLast from 'lodash/findLast';

/**
 * Find the name of top most central pane route.
 *
 * @param state - The react-navigation state
 * @return - It's possible that there is no central pane in the state.
 */
function getTopMostCentralPaneRouteName(state: NavigationState): string | undefined {
    if (!state) {
        return undefined;
    }
    const topmostCentralPane = lodashFindLast(state.routes, (route) => route.name === 'CentralPaneNavigator');

    if (!topmostCentralPane) {
        return undefined;
    }

    if (topmostCentralPane.state && topmostCentralPane.state.routes) {
        // State may don't have index in some cases. But in this case there will be only one route in state.
        return topmostCentralPane.state.routes[topmostCentralPane.state.index || 0].name;
    }

    if (topmostCentralPane.params) {
        // State may don't have inner state in some cases (e.g generating actions from path). But in this case there will be params available.
        return topmostCentralPane.params.screen;
    }

    return undefined;
}

export default getTopMostCentralPaneRouteName;
