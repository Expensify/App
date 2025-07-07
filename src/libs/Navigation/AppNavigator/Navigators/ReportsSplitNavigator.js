"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var usePermissions_1 = require("@hooks/usePermissions");
var createSplitNavigator_1 = require("@libs/Navigation/AppNavigator/createSplitNavigator");
var FreezeWrapper_1 = require("@libs/Navigation/AppNavigator/FreezeWrapper");
var useSplitNavigatorScreenOptions_1 = require("@libs/Navigation/AppNavigator/useSplitNavigatorScreenOptions");
var currentUrl_1 = require("@libs/Navigation/currentUrl");
var shouldOpenOnAdminRoom_1 = require("@libs/Navigation/helpers/shouldOpenOnAdminRoom");
var ReportUtils = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var SCREENS_1 = require("@src/SCREENS");
var loadReportScreen = function () { return require('@pages/home/ReportScreen').default; };
var loadSidebarScreen = function () { return require('@pages/home/sidebar/BaseSidebarScreen').default; };
var Split = (0, createSplitNavigator_1.default)();
/**
 * This SplitNavigator includes the HOME screen (<BaseSidebarScreen /> component) with a list of reports as a sidebar screen and the REPORT screen displayed as a central one.
 * There can be multiple report screens in the stack with different report IDs.
 */
function ReportsSplitNavigator(_a) {
    var route = _a.route;
    var isBetaEnabled = (0, usePermissions_1.default)().isBetaEnabled;
    var splitNavigatorScreenOptions = (0, useSplitNavigatorScreenOptions_1.default)();
    var initialReportID = (0, react_1.useState)(function () {
        var _a, _b;
        var currentURL = (0, currentUrl_1.default)();
        var reportIdFromPath = currentURL && ((_a = new URL(currentURL).pathname.match(CONST_1.default.REGEX.REPORT_ID_FROM_PATH)) === null || _a === void 0 ? void 0 : _a.at(1));
        if (reportIdFromPath) {
            return reportIdFromPath;
        }
        var initialReport = ReportUtils.findLastAccessedReport(!isBetaEnabled(CONST_1.default.BETAS.DEFAULT_ROOMS), (0, shouldOpenOnAdminRoom_1.default)());
        // eslint-disable-next-line rulesdir/no-default-id-values
        return (_b = initialReport === null || initialReport === void 0 ? void 0 : initialReport.reportID) !== null && _b !== void 0 ? _b : '';
    })[0];
    return (<FreezeWrapper_1.default>
            <Split.Navigator persistentScreens={[SCREENS_1.default.HOME]} sidebarScreen={SCREENS_1.default.HOME} defaultCentralScreen={SCREENS_1.default.REPORT} parentRoute={route} screenOptions={splitNavigatorScreenOptions.centralScreen}>
                <Split.Screen name={SCREENS_1.default.HOME} getComponent={loadSidebarScreen} options={splitNavigatorScreenOptions.sidebarScreen}/>
                <Split.Screen name={SCREENS_1.default.REPORT} initialParams={{ reportID: initialReportID, openOnAdminRoom: (0, shouldOpenOnAdminRoom_1.default)() ? true : undefined }} getComponent={loadReportScreen}/>
            </Split.Navigator>
        </FreezeWrapper_1.default>);
}
ReportsSplitNavigator.displayName = 'ReportsSplitNavigator';
exports.default = ReportsSplitNavigator;
