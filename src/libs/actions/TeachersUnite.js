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
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PhoneNumber = require("@libs/PhoneNumber");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var sessionEmail = '';
var sessionAccountID = 0;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.SESSION,
    callback: function (value) {
        var _a, _b;
        sessionEmail = (_a = value === null || value === void 0 ? void 0 : value.email) !== null && _a !== void 0 ? _a : '';
        sessionAccountID = (_b = value === null || value === void 0 ? void 0 : value.accountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
    },
});
var allPersonalDetails;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
    callback: function (value) { return (allPersonalDetails = value); },
});
/**
 * @param publicRoomReportID - This is the global reportID for the public room, we'll ignore the optimistic one
 */
function referTeachersUniteVolunteer(partnerUserID, firstName, lastName, policyID, publicRoomReportID) {
    var optimisticPublicRoom = ReportUtils.buildOptimisticChatReport({
        participantList: [],
        reportName: CONST_1.default.TEACHERS_UNITE.PUBLIC_ROOM_NAME,
        chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ROOM,
        policyID: policyID,
    });
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(publicRoomReportID),
            value: __assign(__assign({}, optimisticPublicRoom), { reportID: publicRoomReportID, policyName: CONST_1.default.TEACHERS_UNITE.POLICY_NAME }),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(publicRoomReportID),
            value: {
                isOptimisticReport: false,
            },
        },
    ];
    var parameters = {
        reportID: publicRoomReportID,
        firstName: firstName,
        lastName: lastName,
        partnerUserID: partnerUserID,
    };
    API.write(types_1.WRITE_COMMANDS.REFER_TEACHERS_UNITE_VOLUNTEER, parameters, { optimisticData: optimisticData });
    Navigation_1.default.dismissModalWithReport({ reportID: publicRoomReportID });
}
/**
 * Optimistically creates a policyExpenseChat for the school principal and passes data to AddSchoolPrincipal
 */
function addSchoolPrincipal(firstName, partnerUserID, lastName, policyID) {
    var _a, _b, _c, _d;
    var _e, _f, _g, _h, _j;
    var policyName = CONST_1.default.TEACHERS_UNITE.POLICY_NAME;
    var loggedInEmail = PhoneNumber.addSMSDomainIfPhoneNumber(sessionEmail);
    var reportCreationData = {};
    var expenseChatData = ReportUtils.buildOptimisticChatReport({
        participantList: [sessionAccountID],
        reportName: '',
        chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
        policyID: policyID,
        ownerAccountID: sessionAccountID,
        isOwnPolicyExpenseChat: true,
        oldPolicyName: policyName,
    });
    var expenseChatReportID = expenseChatData.reportID;
    var expenseReportCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(sessionEmail);
    var expenseReportActionData = (_a = {},
        _a[expenseReportCreatedAction.reportActionID] = expenseReportCreatedAction,
        _a);
    reportCreationData[loggedInEmail] = {
        reportID: expenseChatReportID,
        reportActionID: expenseReportCreatedAction.reportActionID,
    };
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                id: policyID,
                isPolicyExpenseChatEnabled: true,
                type: CONST_1.default.POLICY.TYPE.CORPORATE,
                name: policyName,
                role: CONST_1.default.POLICY.ROLE.USER,
                owner: sessionEmail,
                // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
                // eslint-disable-next-line deprecation/deprecation
                outputCurrency: (_h = (_f = (_e = (0, PolicyUtils_1.getPolicy)(policyID)) === null || _e === void 0 ? void 0 : _e.outputCurrency) !== null && _f !== void 0 ? _f : (_g = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[sessionAccountID]) === null || _g === void 0 ? void 0 : _g.localCurrencyCode) !== null && _h !== void 0 ? _h : CONST_1.default.CURRENCY.USD,
                employeeList: (_b = {},
                    _b[sessionEmail] = {
                        role: CONST_1.default.POLICY.ROLE.USER,
                        errors: {},
                    },
                    _b),
                pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(expenseChatReportID),
            value: __assign({ pendingFields: {
                    addWorkspaceRoom: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                } }, expenseChatData),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseChatReportID),
            value: expenseReportActionData,
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: { pendingAction: null },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(expenseChatReportID),
            value: {
                pendingFields: {
                    addWorkspaceRoom: null,
                },
                pendingAction: null,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(expenseChatReportID),
            value: {
                isOptimisticReport: false,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseChatReportID),
            value: (_c = {},
                _c[(_j = Object.keys(expenseChatData).at(0)) !== null && _j !== void 0 ? _j : ''] = {
                    pendingAction: null,
                },
                _c),
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: (_d = {},
                _d[sessionEmail] = null,
                _d),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(expenseChatReportID),
            value: null,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseChatReportID),
            value: null,
        },
    ];
    var parameters = {
        firstName: firstName,
        lastName: lastName,
        partnerUserID: partnerUserID,
        policyID: policyID,
        reportCreationData: JSON.stringify(reportCreationData),
    };
    API.write(types_1.WRITE_COMMANDS.ADD_SCHOOL_PRINCIPAL, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
    Navigation_1.default.dismissModalWithReport({ reportID: expenseChatReportID });
}
exports.default = { referTeachersUniteVolunteer: referTeachersUniteVolunteer, addSchoolPrincipal: addSchoolPrincipal };
