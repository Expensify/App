import lodashFindLast from 'lodash/findLast';
import lodashGet from 'lodash/get';

// This function is in a separate file than Navigation.js to avoid cyclic dependency.

/**
 * Find the last visited report screen in the navigation state and get the linked reportActionID of it.
 *
 * @param {Object} state - The react-navigation state
 * @returns {String | undefined} - It's possible that there is no report screen
 */
function getTopmostReportActionID(state) {
    if (!state) {
        return;
    }
    const topmostCentralPane = lodashFindLast(state.routes, (route) => route.name === 'CentralPaneNavigator');

    if (!topmostCentralPane) {
        return;
    }

    const directReportActionIDParam = lodashGet(topmostCentralPane, 'params.params.reportActionID');

    if (!topmostCentralPane.state && !directReportActionIDParam) {
        return;
    }

    if (directReportActionIDParam) {
        return directReportActionIDParam;
    }

    const topmostReport = lodashFindLast(topmostCentralPane.state.routes, (route) => route.name === 'Report');
    if (!topmostReport) {
        return;
    }

    const topmostReportActionID = lodashGet(topmostReport, 'params.reportActionID');

    return topmostReportActionID;
}

export default getTopmostReportActionID;
