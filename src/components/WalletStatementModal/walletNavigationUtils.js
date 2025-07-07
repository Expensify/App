"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var Report_1 = require("@userActions/Report");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
/**
 * Handles navigation for wallet statement actions
 */
function handleWalletStatementNavigation(type, url) {
    var _a;
    if (!type || (type !== CONST_1.default.WALLET.WEB_MESSAGE_TYPE.STATEMENT && type !== CONST_1.default.WALLET.WEB_MESSAGE_TYPE.CONCIERGE)) {
        return;
    }
    if (type === CONST_1.default.WALLET.WEB_MESSAGE_TYPE.CONCIERGE) {
        (0, Report_1.navigateToConciergeChat)();
        return;
    }
    if (type === CONST_1.default.WALLET.WEB_MESSAGE_TYPE.STATEMENT && url) {
        var iouRoutes = (_a = {},
            _a[CONST_1.default.WALLET.STATEMENT_ACTIONS.SUBMIT_EXPENSE] = ROUTES_1.default.MONEY_REQUEST_CREATE.getRoute(CONST_1.default.IOU.ACTION.CREATE, CONST_1.default.IOU.TYPE.SUBMIT, CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID, (0, ReportUtils_1.generateReportID)()),
            _a[CONST_1.default.WALLET.STATEMENT_ACTIONS.PAY_SOMEONE] = ROUTES_1.default.MONEY_REQUEST_CREATE.getRoute(CONST_1.default.IOU.ACTION.CREATE, CONST_1.default.IOU.TYPE.PAY, CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID, String(CONST_1.default.DEFAULT_NUMBER_ID)),
            _a[CONST_1.default.WALLET.STATEMENT_ACTIONS.SPLIT_EXPENSE] = ROUTES_1.default.MONEY_REQUEST_CREATE.getRoute(CONST_1.default.IOU.ACTION.CREATE, CONST_1.default.IOU.TYPE.SPLIT, CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID, (0, ReportUtils_1.generateReportID)()),
            _a);
        var navigateToIOURoute = Object.keys(iouRoutes).find(function (iouRoute) { return url.includes(iouRoute); });
        if (navigateToIOURoute && iouRoutes[navigateToIOURoute]) {
            Navigation_1.default.navigate(iouRoutes[navigateToIOURoute]);
        }
    }
}
exports.default = handleWalletStatementNavigation;
