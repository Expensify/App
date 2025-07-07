"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrickRoadForPolicy = void 0;
exports.getChatTabBrickRoadReport = getChatTabBrickRoadReport;
exports.getWorkspacesBrickRoads = getWorkspacesBrickRoads;
exports.hasGlobalWorkspaceSettingsRBR = hasGlobalWorkspaceSettingsRBR;
exports.hasWorkspaceSettingsRBR = hasWorkspaceSettingsRBR;
exports.getChatTabBrickRoad = getChatTabBrickRoad;
exports.getUnitTranslationKey = getUnitTranslationKey;
exports.getOwnershipChecksDisplayText = getOwnershipChecksDisplayText;
var react_native_onyx_1 = require("react-native-onyx");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var connections_1 = require("./actions/connections");
var QuickbooksOnline_1 = require("./actions/connections/QuickbooksOnline");
var CurrencyUtils_1 = require("./CurrencyUtils");
var PolicyUtils_1 = require("./PolicyUtils");
var reimbursementAccount;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
    callback: function (val) {
        reimbursementAccount = val;
    },
});
var reportAttributes;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.DERIVED.REPORT_ATTRIBUTES,
    callback: function (value) {
        if (!value) {
            return;
        }
        reportAttributes = value.reports;
    },
});
/**
 * @param altReportActions Replaces (local) allReportActions used within (local) function getWorkspacesBrickRoads
 * @returns BrickRoad for the policy passed as a param and optionally actionsByReport (if passed)
 */
var getBrickRoadForPolicy = function (report) {
    var _a;
    return (_a = reportAttributes === null || reportAttributes === void 0 ? void 0 : reportAttributes[report.reportID]) === null || _a === void 0 ? void 0 : _a.brickRoadStatus;
};
exports.getBrickRoadForPolicy = getBrickRoadForPolicy;
function hasGlobalWorkspaceSettingsRBR(policies, allConnectionProgresses) {
    // When attempting to open a policy with an invalid policyID, the policy collection is updated to include policy objects with error information.
    // Only policies displayed on the policy list page should be verified. Otherwise, the user will encounter an RBR unrelated to any policies on the list.
    var cleanPolicies = Object.fromEntries(Object.entries(policies !== null && policies !== void 0 ? policies : {}).filter(function (_a) {
        var policy = _a[1];
        return policy === null || policy === void 0 ? void 0 : policy.id;
    }));
    var errorCheckingMethods = [
        function () { return Object.values(cleanPolicies).some(PolicyUtils_1.shouldShowPolicyError); },
        function () { return Object.values(cleanPolicies).some(PolicyUtils_1.shouldShowCustomUnitsError); },
        function () { return Object.values(cleanPolicies).some(PolicyUtils_1.shouldShowTaxRateError); },
        function () { return Object.values(cleanPolicies).some(PolicyUtils_1.shouldShowEmployeeListError); },
        function () { return Object.values(cleanPolicies).some(QuickbooksOnline_1.shouldShowQBOReimbursableExportDestinationAccountError); },
        function () {
            return Object.values(cleanPolicies).some(function (cleanPolicy) {
                return (0, PolicyUtils_1.shouldShowSyncError)(cleanPolicy, (0, connections_1.isConnectionInProgress)(allConnectionProgresses === null || allConnectionProgresses === void 0 ? void 0 : allConnectionProgresses["".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS).concat(cleanPolicy === null || cleanPolicy === void 0 ? void 0 : cleanPolicy.id)], cleanPolicy));
            });
        },
        function () { return Object.values(cleanPolicies).some(function (cleanPolicy) { var _a; return (0, PolicyUtils_1.isPolicyAdmin)(cleanPolicy) && Object.keys((_a = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.errors) !== null && _a !== void 0 ? _a : {}).length > 0; }); },
    ];
    return errorCheckingMethods.some(function (errorCheckingMethod) { return errorCheckingMethod(); });
}
function hasWorkspaceSettingsRBR(policy) {
    var _a;
    var policyMemberError = (0, PolicyUtils_1.shouldShowEmployeeListError)(policy);
    var taxRateError = (0, PolicyUtils_1.shouldShowTaxRateError)(policy);
    return (((0, PolicyUtils_1.isPolicyAdmin)(policy) && Object.keys((_a = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.errors) !== null && _a !== void 0 ? _a : {}).length > 0) ||
        (0, PolicyUtils_1.shouldShowPolicyError)(policy) ||
        (0, PolicyUtils_1.shouldShowCustomUnitsError)(policy) ||
        policyMemberError ||
        taxRateError);
}
function getChatTabBrickRoadReport(orderedReports) {
    if (orderedReports === void 0) { orderedReports = []; }
    if (!orderedReports.length) {
        return undefined;
    }
    var reportWithGBR;
    var reportWithRBR = orderedReports.find(function (report) {
        var brickRoad = report ? getBrickRoadForPolicy(report) : undefined;
        if (!reportWithGBR && brickRoad === CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.INFO) {
            reportWithGBR = report;
            return false;
        }
        return brickRoad === CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    });
    if (reportWithRBR) {
        return reportWithRBR;
    }
    if (reportWithGBR) {
        return reportWithGBR;
    }
    return undefined;
}
function getChatTabBrickRoad(orderedReports) {
    var report = getChatTabBrickRoadReport(orderedReports);
    return report ? getBrickRoadForPolicy(report) : undefined;
}
/**
 * @returns a map where the keys are policyIDs and the values are BrickRoads for each policy
 */
function getWorkspacesBrickRoads(reports, policies) {
    if (!reports) {
        return {};
    }
    // The key in this map is the workspace id
    var workspacesBrickRoadsMap = {};
    Object.values(policies !== null && policies !== void 0 ? policies : {}).forEach(function (policy) {
        // Only policies which user has access to on the list should be checked. Policies that don't have an ID and contain only information about the errors aren't displayed anywhere.
        if (!(policy === null || policy === void 0 ? void 0 : policy.id)) {
            return;
        }
        if (hasWorkspaceSettingsRBR(policy)) {
            workspacesBrickRoadsMap[policy.id] = CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR;
        }
    });
    Object.values(reports).forEach(function (report) {
        var _a;
        var policyID = (_a = report === null || report === void 0 ? void 0 : report.policyID) !== null && _a !== void 0 ? _a : CONST_1.default.POLICY.EMPTY;
        if (!report || workspacesBrickRoadsMap[policyID] === CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR) {
            return;
        }
        var workspaceBrickRoad = getBrickRoadForPolicy(report);
        if (!workspaceBrickRoad && !!workspacesBrickRoadsMap[policyID]) {
            return;
        }
        workspacesBrickRoadsMap[policyID] = workspaceBrickRoad;
    });
    return workspacesBrickRoadsMap;
}
/**
 * @param unit Unit
 * @returns translation key for the unit
 */
function getUnitTranslationKey(unit) {
    var _a;
    var unitTranslationKeysStrategy = (_a = {},
        _a[CONST_1.default.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS] = 'common.kilometers',
        _a[CONST_1.default.CUSTOM_UNITS.DISTANCE_UNIT_MILES] = 'common.miles',
        _a);
    return unitTranslationKeysStrategy[unit];
}
/**
 * @param error workspace change owner error
 * @param translate translation function
 * @param policy policy object
 * @param accountLogin account login/email
 * @returns ownership change checks page display text's
 */
function getOwnershipChecksDisplayText(error, translate, policy, accountLogin) {
    var _a, _b, _c;
    var title;
    var text;
    var buttonText;
    var changeOwner = (_a = policy === null || policy === void 0 ? void 0 : policy.errorFields) === null || _a === void 0 ? void 0 : _a.changeOwner;
    var subscription = changeOwner === null || changeOwner === void 0 ? void 0 : changeOwner.subscription;
    var ownerOwesAmount = changeOwner === null || changeOwner === void 0 ? void 0 : changeOwner.ownerOwesAmount;
    switch (error) {
        case CONST_1.default.POLICY.OWNERSHIP_ERRORS.AMOUNT_OWED:
            title = translate('workspace.changeOwner.amountOwedTitle');
            text = translate('workspace.changeOwner.amountOwedText');
            buttonText = translate('workspace.changeOwner.amountOwedButtonText');
            break;
        case CONST_1.default.POLICY.OWNERSHIP_ERRORS.OWNER_OWES_AMOUNT:
            title = translate('workspace.changeOwner.ownerOwesAmountTitle');
            text = translate('workspace.changeOwner.ownerOwesAmountText', {
                email: ownerOwesAmount === null || ownerOwesAmount === void 0 ? void 0 : ownerOwesAmount.ownerEmail,
                amount: (0, CurrencyUtils_1.convertToDisplayString)(ownerOwesAmount === null || ownerOwesAmount === void 0 ? void 0 : ownerOwesAmount.amount, ownerOwesAmount === null || ownerOwesAmount === void 0 ? void 0 : ownerOwesAmount.currency),
            });
            buttonText = translate('workspace.changeOwner.ownerOwesAmountButtonText');
            break;
        case CONST_1.default.POLICY.OWNERSHIP_ERRORS.SUBSCRIPTION:
            title = translate('workspace.changeOwner.subscriptionTitle');
            text = translate('workspace.changeOwner.subscriptionText', {
                usersCount: subscription === null || subscription === void 0 ? void 0 : subscription.ownerUserCount,
                finalCount: subscription === null || subscription === void 0 ? void 0 : subscription.totalUserCount,
            });
            buttonText = translate('workspace.changeOwner.subscriptionButtonText');
            break;
        case CONST_1.default.POLICY.OWNERSHIP_ERRORS.DUPLICATE_SUBSCRIPTION:
            title = translate('workspace.changeOwner.duplicateSubscriptionTitle');
            text = translate('workspace.changeOwner.duplicateSubscriptionText', {
                email: (_b = changeOwner === null || changeOwner === void 0 ? void 0 : changeOwner.duplicateSubscription) !== null && _b !== void 0 ? _b : '',
                workspaceName: (_c = policy === null || policy === void 0 ? void 0 : policy.name) !== null && _c !== void 0 ? _c : '',
            });
            buttonText = translate('workspace.changeOwner.duplicateSubscriptionButtonText');
            break;
        case CONST_1.default.POLICY.OWNERSHIP_ERRORS.HAS_FAILED_SETTLEMENTS:
            title = translate('workspace.changeOwner.hasFailedSettlementsTitle');
            text = translate('workspace.changeOwner.hasFailedSettlementsText', { email: accountLogin !== null && accountLogin !== void 0 ? accountLogin : '' });
            buttonText = translate('workspace.changeOwner.hasFailedSettlementsButtonText');
            break;
        case CONST_1.default.POLICY.OWNERSHIP_ERRORS.FAILED_TO_CLEAR_BALANCE:
            title = translate('workspace.changeOwner.failedToClearBalanceTitle');
            text = translate('workspace.changeOwner.failedToClearBalanceText');
            buttonText = translate('workspace.changeOwner.failedToClearBalanceButtonText');
            break;
        default:
            title = '';
            text = '';
            buttonText = '';
            break;
    }
    return { title: title, text: text, buttonText: buttonText };
}
