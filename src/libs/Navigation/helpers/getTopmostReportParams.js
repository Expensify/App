
exports.__esModule = true;
const NAVIGATORS_1 = require('@src/NAVIGATORS');
const SCREENS_1 = require('@src/SCREENS');

function getTopmostReportParams(state) {
    let _a; let _b;
    if (!state) {
        return;
    }
    const topmostReportsSplitNavigator =
        (_a = state.routes) === null || _a === void 0
            ? void 0
            : _a
                  .filter(function (route) {
                      return route.name === NAVIGATORS_1['default'].REPORTS_SPLIT_NAVIGATOR;
                  })
                  .at(-1);
    if (!topmostReportsSplitNavigator) {
        return;
    }
    const topmostReport =
        (_b = topmostReportsSplitNavigator.state) === null || _b === void 0
            ? void 0
            : _b.routes
                  .filter(function (route) {
                      return route.name === SCREENS_1['default'].REPORT;
                  })
                  .at(-1);
    if (!topmostReport) {
        return;
    }
    return topmostReport === null || topmostReport === void 0 ? void 0 : topmostReport.params;
}
exports['default'] = getTopmostReportParams;
