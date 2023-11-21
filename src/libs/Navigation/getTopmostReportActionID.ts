import {NavigationState} from '@react-navigation/core';
import {RootStackParamList} from '@src/types/modules/react-navigation';

// This function is in a separate file than Navigation.js to avoid cyclic dependency.

/**
 * Find the last visited report screen in the navigation state and get the linked reportActionID of it.
 *
 * @param state - The react-navigation state
 * @returns - It's possible that there is no report screen
 */
function getTopmostReportActionID(state: NavigationState<RootStackParamList>): string | undefined {
    if (!state) {
        return;
    }

    const topmostCentralPane = state.routes.filter((route) => route.name === 'CentralPaneNavigator').at(-1);
    if (!topmostCentralPane) {
        return;
    }

    const directReportActionIDParam = topmostCentralPane.params && 'params' in topmostCentralPane.params && topmostCentralPane?.params?.params?.reportActionID;

    if (!topmostCentralPane.state && !directReportActionIDParam) {
        return;
    }

    if (directReportActionIDParam) {
        return directReportActionIDParam;
    }

    const topmostReport = topmostCentralPane.state?.routes.filter((route) => route.name === 'Report').at(-1);
    if (!topmostReport) {
        return;
    }

    const topmostReportActionID = topmostReport.params && 'reportActionID' in topmostReport.params && topmostReport.params?.reportActionID;
    if (typeof topmostReportActionID !== 'string') {
        return;
    }

    return topmostReportActionID;
}

export default getTopmostReportActionID;
