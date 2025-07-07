"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var PrevNextButtons_1 = require("@components/PrevNextButtons");
var useOnyx_1 = require("@hooks/useOnyx");
var TransactionThreadNavigation_1 = require("@libs/actions/TransactionThreadNavigation");
var Navigation_1 = require("@navigation/Navigation");
var navigationRef_1 = require("@navigation/navigationRef");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
function MoneyRequestReportTransactionsNavigation(_a) {
    var currentReportID = _a.currentReportID;
    var _b = (0, useOnyx_1.default)(ONYXKEYS_1.default.TRANSACTION_THREAD_NAVIGATION_REPORT_IDS, {
        canBeMissing: true,
    })[0], reportIDsList = _b === void 0 ? CONST_1.default.EMPTY_ARRAY : _b;
    var _c = (0, react_1.useMemo)(function () {
        if (!reportIDsList || reportIDsList.length < 2) {
            return { prevReportID: undefined, nextReportID: undefined };
        }
        var currentReportIndex = reportIDsList.findIndex(function (id) { return id === currentReportID; });
        var prevID = currentReportIndex > 0 ? reportIDsList.at(currentReportIndex - 1) : undefined;
        var nextID = currentReportIndex <= reportIDsList.length - 1 ? reportIDsList.at(currentReportIndex + 1) : undefined;
        return { prevReportID: prevID, nextReportID: nextID };
    }, [currentReportID, reportIDsList]), prevReportID = _c.prevReportID, nextReportID = _c.nextReportID;
    /**
     * We clear the sibling transactionThreadIDs when unmounting this component
     * only when the mount actually goes to a different SCREEN (and not a different version of the same SCREEN)
     */
    (0, react_1.useEffect)(function () {
        return function () {
            var focusedRoute = (0, native_1.findFocusedRoute)(navigationRef_1.default.getRootState());
            if ((focusedRoute === null || focusedRoute === void 0 ? void 0 : focusedRoute.name) === SCREENS_1.default.SEARCH.REPORT_RHP) {
                return;
            }
            (0, TransactionThreadNavigation_1.clearActiveTransactionThreadIDs)();
        };
    }, []);
    if (reportIDsList.length < 2) {
        return;
    }
    return (<PrevNextButtons_1.default isPrevButtonDisabled={!prevReportID} isNextButtonDisabled={!nextReportID} onNext={function (e) {
            var backTo = Navigation_1.default.getActiveRoute();
            e === null || e === void 0 ? void 0 : e.preventDefault();
            Navigation_1.default.navigate(ROUTES_1.default.SEARCH_REPORT.getRoute({ reportID: nextReportID, backTo: backTo }), { forceReplace: true });
        }} onPrevious={function (e) {
            var backTo = Navigation_1.default.getActiveRoute();
            e === null || e === void 0 ? void 0 : e.preventDefault();
            Navigation_1.default.navigate(ROUTES_1.default.SEARCH_REPORT.getRoute({ reportID: prevReportID, backTo: backTo }), { forceReplace: true });
        }}/>);
}
MoneyRequestReportTransactionsNavigation.displayName = 'MoneyRequestReportTransactionsNavigation';
exports.default = MoneyRequestReportTransactionsNavigation;
