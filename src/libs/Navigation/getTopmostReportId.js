import _ from 'lodash';

// This function is in a separate file than Navigation.js to avoid cyclic dependency.
function getTopmostReportId(state) {
    const topmostCentralPane = _.findLast(state.routes, route => route.name === 'CentralPaneNavigator');

    if (!topmostCentralPane) {
        return;
    }

    const directReportIdParam = _.get(topmostCentralPane, 'params.params.reportID');

    if (!topmostCentralPane.state && !directReportIdParam) {
        return;
    }

    if (directReportIdParam) {
        return directReportIdParam;
    }

    const topmostReport = _.findLast(topmostCentralPane.state.routes, route => route.name === 'Report');
    if (!topmostReport) {
        return;
    }

    const topmostReportId = _.get(topmostReport, 'params.reportID');

    return topmostReportId;
}

export default getTopmostReportId;
