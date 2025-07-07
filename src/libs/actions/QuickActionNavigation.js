"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.navigateToQuickAction = navigateToQuickAction;
exports.getQuickActionRequestType = getQuickActionRequestType;
var isSearchTopmostFullScreenRoute_1 = require("@libs/Navigation/helpers/isSearchTopmostFullScreenRoute");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var IOU_1 = require("./IOU");
var Report_1 = require("./Report");
var Task_1 = require("./Task");
function getQuickActionRequestType(action) {
    if (!action) {
        return;
    }
    var requestType;
    if ([CONST_1.default.QUICK_ACTIONS.REQUEST_MANUAL, CONST_1.default.QUICK_ACTIONS.SPLIT_MANUAL, CONST_1.default.QUICK_ACTIONS.TRACK_MANUAL].some(function (a) { return a === action; })) {
        requestType = CONST_1.default.IOU.REQUEST_TYPE.MANUAL;
    }
    else if ([CONST_1.default.QUICK_ACTIONS.REQUEST_SCAN, CONST_1.default.QUICK_ACTIONS.SPLIT_SCAN, CONST_1.default.QUICK_ACTIONS.TRACK_SCAN].some(function (a) { return a === action; })) {
        requestType = CONST_1.default.IOU.REQUEST_TYPE.SCAN;
    }
    else if ([CONST_1.default.QUICK_ACTIONS.REQUEST_DISTANCE, CONST_1.default.QUICK_ACTIONS.SPLIT_DISTANCE, CONST_1.default.QUICK_ACTIONS.TRACK_DISTANCE].some(function (a) { return a === action; })) {
        requestType = CONST_1.default.IOU.REQUEST_TYPE.DISTANCE;
    }
    else if (action === CONST_1.default.QUICK_ACTIONS.PER_DIEM) {
        requestType = CONST_1.default.IOU.REQUEST_TYPE.PER_DIEM;
    }
    return requestType;
}
function navigateToQuickAction(isValidReport, quickAction, currentUserPersonalDetails, policyID, selectOption) {
    var reportID = isValidReport && (quickAction === null || quickAction === void 0 ? void 0 : quickAction.chatReportID) ? quickAction === null || quickAction === void 0 ? void 0 : quickAction.chatReportID : (0, ReportUtils_1.generateReportID)();
    var requestType = getQuickActionRequestType(quickAction === null || quickAction === void 0 ? void 0 : quickAction.action);
    switch (quickAction === null || quickAction === void 0 ? void 0 : quickAction.action) {
        case CONST_1.default.QUICK_ACTIONS.REQUEST_MANUAL:
        case CONST_1.default.QUICK_ACTIONS.REQUEST_SCAN:
        case CONST_1.default.QUICK_ACTIONS.REQUEST_DISTANCE:
        case CONST_1.default.QUICK_ACTIONS.PER_DIEM:
            selectOption(function () { return (0, IOU_1.startMoneyRequest)(CONST_1.default.IOU.TYPE.SUBMIT, reportID, requestType, true); }, true);
            break;
        case CONST_1.default.QUICK_ACTIONS.SPLIT_MANUAL:
        case CONST_1.default.QUICK_ACTIONS.SPLIT_SCAN:
        case CONST_1.default.QUICK_ACTIONS.SPLIT_DISTANCE:
            selectOption(function () { return (0, IOU_1.startMoneyRequest)(CONST_1.default.IOU.TYPE.SPLIT, reportID, requestType, true); }, true);
            break;
        case CONST_1.default.QUICK_ACTIONS.SEND_MONEY:
            selectOption(function () { return (0, IOU_1.startMoneyRequest)(CONST_1.default.IOU.TYPE.PAY, reportID, undefined, true); }, false);
            break;
        case CONST_1.default.QUICK_ACTIONS.ASSIGN_TASK:
            selectOption(function () { var _a; return (0, Task_1.startOutCreateTaskQuickAction)(isValidReport ? reportID : '', (_a = quickAction.targetAccountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID); }, false);
            break;
        case CONST_1.default.QUICK_ACTIONS.TRACK_MANUAL:
        case CONST_1.default.QUICK_ACTIONS.TRACK_SCAN:
        case CONST_1.default.QUICK_ACTIONS.TRACK_DISTANCE:
            selectOption(function () { return (0, IOU_1.startMoneyRequest)(CONST_1.default.IOU.TYPE.TRACK, reportID, requestType, true); }, false);
            break;
        case CONST_1.default.QUICK_ACTIONS.CREATE_REPORT:
            selectOption(function () {
                var optimisticReportID = (0, Report_1.createNewReport)(currentUserPersonalDetails, policyID);
                Navigation_1.default.setNavigationActionToMicrotaskQueue(function () {
                    Navigation_1.default.navigate((0, isSearchTopmostFullScreenRoute_1.default)()
                        ? ROUTES_1.default.SEARCH_MONEY_REQUEST_REPORT.getRoute({ reportID: optimisticReportID, backTo: Navigation_1.default.getActiveRoute() })
                        : ROUTES_1.default.REPORT_WITH_ID.getRoute(optimisticReportID, undefined, undefined, undefined, undefined, Navigation_1.default.getActiveRoute()));
                });
            }, true);
            break;
        default:
    }
}
