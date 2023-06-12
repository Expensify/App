import lodashFindLast from 'lodash/findLast';
import lodashGet from 'lodash/get';

// This function is in a separate file than Navigation.js to avoid cyclic dependency.

/**
 * Find the last visited report screen in the navigation state and get the id of it.
 *
 * @param {Object} state - The react-navigation state
 * @returns {String | undefined} - It's possible that there is no report screen
 */
function getTopmostReportId(state) {
    const topmostCentralPane = lodashFindLast(state.routes, (route) => route.name === 'CentralPaneNavigator');

    if (!topmostCentralPane) {
        return;
    }

    const directReportIdParam = lodashGet(topmostCentralPane, 'params.params.reportID');

    if (!topmostCentralPane.state && !directReportIdParam) {
        return;
    }

    if (directReportIdParam) {
        return directReportIdParam;
    }

    const topmostReport = lodashFindLast(topmostCentralPane.state.routes, (route) => route.name === 'Report');
    if (!topmostReport) {
        return;
    }

    const topmostReportId = lodashGet(topmostReport, 'params.reportID');

    return topmostReportId;
}

export default getTopmostReportId;
