import {NavigationState} from '@react-navigation/core';
import {RootStackParamList} from '@src/types/modules/react-navigation';

// This function is in a separate file than Navigation.js to avoid cyclic dependency.

/**
 * Find the last visited report screen in the navigation state and get the id of it.
 *
 * @param state - The react-navigation state
 * @returns - It's possible that there is no report screen
 */
function getTopmostReportId(state: NavigationState<RootStackParamList>): string | undefined {
    if (!state) {
        return;
    }

    const topmostCentralPane = state.routes.filter((route) => route.name === 'CentralPaneNavigator').at(-1);
    if (!topmostCentralPane) {
        return;
    }

    const directReportIdParam = topmostCentralPane.params && 'params' in topmostCentralPane.params && topmostCentralPane?.params?.params?.reportID;
    if (!topmostCentralPane.state && !directReportIdParam) {
        return;
    }

    if (directReportIdParam) {
        return directReportIdParam;
    }

    const topmostReport = topmostCentralPane.state?.routes.filter((route) => route.name === 'Report').at(-1);
    if (!topmostReport) {
        return;
    }

    const topmostReportId = topmostReport.params && 'reportID' in topmostReport.params && topmostReport.params?.reportID;
    if (typeof topmostReportId !== 'string') {
        return;
    }

    return topmostReportId;
}

export default getTopmostReportId;
