import lodashFindLast from 'lodash/findLast';
import {NavigationState} from "@react-navigation/native";

// This function is in a separate file than Navigation.js to avoid cyclic dependency.

/**
 * Find the last visited report screen in the navigation state and get the id of it.
 *
 * @param state - The react-navigation state
 * @returns It's possible that there is no report screen
 */
function getTopmostReportId(state: NavigationState): string | undefined {
    if (!state) {
        return;
    }
    const topmostCentralPane = lodashFindLast(state.routes, (route) => route.name === 'CentralPaneNavigator');

    if (!topmostCentralPane) {
        return;
    }

    const directReportIdParam = topmostCentralPane.params?.params.reportID;

    if (!topmostCentralPane.state && !directReportIdParam) {
        return;
    }

    if (directReportIdParam) {
        return directReportIdParam;
    }

    const topmostReport = lodashFindLast(topmostCentralPane.state?.routes, (route) => route.name === 'Report');
    if (!topmostReport) {
        return;
    }

    const topmostReportId = topmostReport?.params?.reportID;

    return topmostReportId;
}

export default getTopmostReportId;
