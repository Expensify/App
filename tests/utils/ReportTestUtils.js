"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMockedReportActionsMap = exports.getMockedSortedReportActions = exports.getFakeReportAction = void 0;
var CONST_1 = require("@src/CONST");
var reportActions_1 = require("./collections/reportActions");
var actionNames = [CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT, CONST_1.default.REPORT.ACTIONS.TYPE.IOU, CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW, CONST_1.default.REPORT.ACTIONS.TYPE.CLOSED];
var getFakeReportAction = function (index, overrides) {
    if (overrides === void 0) { overrides = {}; }
    return (__assign({ actionName: CONST_1.default.REPORT.ACTIONS.TYPE.SUBMITTED, actorAccountID: index, automatic: false, avatar: '', created: '2023-09-12 16:27:35.124', isAttachmentOnly: true, isFirstItem: false, lastModified: '2021-07-14T15:00:00Z', message: [
            {
                html: 'hey',
                isDeletedParentAction: false,
                isEdited: false,
                text: 'test',
                type: 'TEXT',
                whisperedTo: [],
            },
        ], originalMessage: {
            html: 'hey',
            lastModified: '2021-07-14T15:00:00Z',
            // IOUReportID: index,
            linkedReportID: index.toString(),
            whisperedTo: [],
            reason: '',
            violationName: '',
        }, pendingAction: null, person: [
            {
                type: 'TEXT',
                style: 'strong',
                text: 'email@test.com',
            },
        ], reportActionID: index.toString(), sequenceNumber: 0, shouldShow: true }, overrides));
};
exports.getFakeReportAction = getFakeReportAction;
var getMockedSortedReportActions = function (length) {
    if (length === void 0) { length = 100; }
    return Array.from({ length: length }, function (element, index) {
        var actionName = index === 0 ? 'CREATED' : 'ADDCOMMENT';
        return getFakeReportAction(index + 1, { actionName: actionName });
    }).reverse();
};
exports.getMockedSortedReportActions = getMockedSortedReportActions;
var getMockedReportActionsMap = function (length) {
    if (length === void 0) { length = 100; }
    var mockReports = Array.from({ length: length }, function (element, index) {
        var _a;
        var _b;
        var reportID = index + 1;
        var actionName = index === 0 ? 'CREATED' : ((_b = actionNames.at(index % actionNames.length)) !== null && _b !== void 0 ? _b : 'CREATED');
        var reportAction = __assign(__assign({}, (0, reportActions_1.default)(reportID)), { actionName: actionName, originalMessage: {
                linkedReportID: reportID.toString(),
            } });
        return _a = {}, _a[reportID] = reportAction, _a;
    });
    return Object.assign.apply(Object, __spreadArray([{}], mockReports, false));
};
exports.getMockedReportActionsMap = getMockedReportActionsMap;
