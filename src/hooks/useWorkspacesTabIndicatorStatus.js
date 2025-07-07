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
var react_1 = require("react");
var connections_1 = require("@libs/actions/connections");
var QuickbooksOnline_1 = require("@libs/actions/connections/QuickbooksOnline");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var SubscriptionUtils_1 = require("@libs/SubscriptionUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var useOnyx_1 = require("./useOnyx");
var useTheme_1 = require("./useTheme");
function useWorkspacesTabIndicatorStatus() {
    var _a, _b, _c;
    var _d, _e, _f;
    var theme = (0, useTheme_1.default)();
    var allConnectionSyncProgresses = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS, { canBeMissing: true })[0];
    var policies = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY, { canBeMissing: true })[0];
    // If a policy was just deleted from Onyx, then Onyx will pass a null value to the props, and
    // those should be cleaned out before doing any error checking
    var cleanPolicies = (0, react_1.useMemo)(function () { return Object.fromEntries(Object.entries(policies !== null && policies !== void 0 ? policies : {}).filter(function (_a) {
        var policy = _a[1];
        return policy === null || policy === void 0 ? void 0 : policy.id;
    })); }, [policies]);
    var policyErrors = (_a = {},
        _a[CONST_1.default.INDICATOR_STATUS.HAS_POLICY_ERRORS] = Object.values(cleanPolicies).find(PolicyUtils_1.shouldShowPolicyError),
        _a[CONST_1.default.INDICATOR_STATUS.HAS_CUSTOM_UNITS_ERROR] = Object.values(cleanPolicies).find(PolicyUtils_1.shouldShowCustomUnitsError),
        _a[CONST_1.default.INDICATOR_STATUS.HAS_EMPLOYEE_LIST_ERROR] = Object.values(cleanPolicies).find(PolicyUtils_1.shouldShowEmployeeListError),
        _a[CONST_1.default.INDICATOR_STATUS.HAS_SYNC_ERRORS] = Object.values(cleanPolicies).find(function (cleanPolicy) {
            return (0, PolicyUtils_1.shouldShowSyncError)(cleanPolicy, (0, connections_1.isConnectionInProgress)(allConnectionSyncProgresses === null || allConnectionSyncProgresses === void 0 ? void 0 : allConnectionSyncProgresses["".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS).concat(cleanPolicy === null || cleanPolicy === void 0 ? void 0 : cleanPolicy.id)], cleanPolicy));
        }),
        _a[CONST_1.default.INDICATOR_STATUS.HAS_QBO_EXPORT_ERROR] = Object.values(cleanPolicies).find(QuickbooksOnline_1.shouldShowQBOReimbursableExportDestinationAccountError),
        _a);
    // All of the error & info-checking methods are put into an array. This is so that using _.some() will return
    // early as soon as the first error / info condition is returned. This makes the checks very efficient since
    // we only care if a single error / info condition exists anywhere.
    var errorChecking = __assign(__assign({}, Object.fromEntries(Object.entries(policyErrors).map(function (_a) {
        var error = _a[0], policy = _a[1];
        return [error, !!policy];
    }))), (_b = {}, _b[CONST_1.default.INDICATOR_STATUS.HAS_SUBSCRIPTION_ERRORS] = (0, SubscriptionUtils_1.hasSubscriptionRedDotError)(), _b));
    var infoChecking = (_c = {},
        _c[CONST_1.default.INDICATOR_STATUS.HAS_SUBSCRIPTION_INFO] = (0, SubscriptionUtils_1.hasSubscriptionGreenDotInfo)(),
        _c);
    var error = ((_d = Object.entries(errorChecking).find(function (_a) {
        var value = _a[1];
        return value;
    })) !== null && _d !== void 0 ? _d : [])[0];
    var info = ((_e = Object.entries(infoChecking).find(function (_a) {
        var value = _a[1];
        return value;
    })) !== null && _e !== void 0 ? _e : [])[0];
    var status = (error !== null && error !== void 0 ? error : info);
    var policyIDWithErrors = (_f = Object.values(policyErrors).find(Boolean)) === null || _f === void 0 ? void 0 : _f.id;
    var indicatorColor = error ? theme.danger : theme.success;
    return { indicatorColor: indicatorColor, status: status, policyIDWithErrors: policyIDWithErrors };
}
exports.default = useWorkspacesTabIndicatorStatus;
