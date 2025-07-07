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
exports.getDescriptionForPolicyDomainCard = exports.sortWorkspacesBySelected = exports.isPolicyOwner = exports.isPolicyEmployee = exports.isPolicyAuditor = exports.isPolicyUser = exports.isPolicyAdmin = exports.isUserPolicyAdmin = void 0;
exports.canEditTaxRate = canEditTaxRate;
exports.escapeTagName = escapeTagName;
exports.getActivePolicies = getActivePolicies;
exports.getPerDiemCustomUnits = getPerDiemCustomUnits;
exports.getAdminEmployees = getAdminEmployees;
exports.getCleanedTagName = getCleanedTagName;
exports.getConnectedIntegration = getConnectedIntegration;
exports.getValidConnectedIntegration = getValidConnectedIntegration;
exports.getCountOfEnabledTagsOfList = getCountOfEnabledTagsOfList;
exports.getIneligibleInvitees = getIneligibleInvitees;
exports.getMemberAccountIDsForWorkspace = getMemberAccountIDsForWorkspace;
exports.getNumericValue = getNumericValue;
exports.isMultiLevelTags = isMultiLevelTags;
exports.getPersonalPolicy = getPersonalPolicy;
exports.getPolicy = getPolicy;
exports.getPolicyBrickRoadIndicatorStatus = getPolicyBrickRoadIndicatorStatus;
exports.getPolicyEmployeeListByIdWithoutCurrentUser = getPolicyEmployeeListByIdWithoutCurrentUser;
exports.getSortedTagKeys = getSortedTagKeys;
exports.getTagList = getTagList;
exports.getTagListName = getTagListName;
exports.getTagLists = getTagLists;
exports.getTaxByID = getTaxByID;
exports.getUnitRateValue = getUnitRateValue;
exports.getRateDisplayValue = getRateDisplayValue;
exports.goBackFromInvalidPolicy = goBackFromInvalidPolicy;
exports.hasAccountingConnections = hasAccountingConnections;
exports.shouldShowSyncError = shouldShowSyncError;
exports.shouldShowCustomUnitsError = shouldShowCustomUnitsError;
exports.shouldShowEmployeeListError = shouldShowEmployeeListError;
exports.hasIntegrationAutoSync = hasIntegrationAutoSync;
exports.hasPolicyCategoriesError = hasPolicyCategoriesError;
exports.shouldShowPolicyError = shouldShowPolicyError;
exports.shouldShowPolicyErrorFields = shouldShowPolicyErrorFields;
exports.shouldShowTaxRateError = shouldShowTaxRateError;
exports.isControlOnAdvancedApprovalMode = isControlOnAdvancedApprovalMode;
exports.isExpensifyTeam = isExpensifyTeam;
exports.isDeletedPolicyEmployee = isDeletedPolicyEmployee;
exports.isInstantSubmitEnabled = isInstantSubmitEnabled;
exports.getCorrectedAutoReportingFrequency = getCorrectedAutoReportingFrequency;
exports.isPaidGroupPolicy = isPaidGroupPolicy;
exports.isPendingDeletePolicy = isPendingDeletePolicy;
exports.isPolicyFeatureEnabled = isPolicyFeatureEnabled;
exports.isPolicyMember = isPolicyMember;
exports.arePaymentsEnabled = arePaymentsEnabled;
exports.isSubmitAndClose = isSubmitAndClose;
exports.isTaxTrackingEnabled = isTaxTrackingEnabled;
exports.shouldShowPolicy = shouldShowPolicy;
exports.getActiveAdminWorkspaces = getActiveAdminWorkspaces;
exports.hasActiveAdminWorkspaces = hasActiveAdminWorkspaces;
exports.getOwnedPaidPolicies = getOwnedPaidPolicies;
exports.canSendInvoiceFromWorkspace = canSendInvoiceFromWorkspace;
exports.canSubmitPerDiemExpenseFromWorkspace = canSubmitPerDiemExpenseFromWorkspace;
exports.canSendInvoice = canSendInvoice;
exports.hasDependentTags = hasDependentTags;
exports.hasVBBA = hasVBBA;
exports.getXeroTenants = getXeroTenants;
exports.findCurrentXeroOrganization = findCurrentXeroOrganization;
exports.getCurrentXeroOrganizationName = getCurrentXeroOrganizationName;
exports.getXeroBankAccounts = getXeroBankAccounts;
exports.findSelectedVendorWithDefaultSelect = findSelectedVendorWithDefaultSelect;
exports.findSelectedBankAccountWithDefaultSelect = findSelectedBankAccountWithDefaultSelect;
exports.findSelectedInvoiceItemWithDefaultSelect = findSelectedInvoiceItemWithDefaultSelect;
exports.findSelectedTaxAccountWithDefaultSelect = findSelectedTaxAccountWithDefaultSelect;
exports.findSelectedSageVendorWithDefaultSelect = findSelectedSageVendorWithDefaultSelect;
exports.hasPolicyWithXeroConnection = hasPolicyWithXeroConnection;
exports.getNetSuiteVendorOptions = getNetSuiteVendorOptions;
exports.canUseTaxNetSuite = canUseTaxNetSuite;
exports.canUseProvincialTaxNetSuite = canUseProvincialTaxNetSuite;
exports.getFilteredReimbursableAccountOptions = getFilteredReimbursableAccountOptions;
exports.getNetSuiteReimbursableAccountOptions = getNetSuiteReimbursableAccountOptions;
exports.getFilteredCollectionAccountOptions = getFilteredCollectionAccountOptions;
exports.getNetSuiteCollectionAccountOptions = getNetSuiteCollectionAccountOptions;
exports.getFilteredApprovalAccountOptions = getFilteredApprovalAccountOptions;
exports.getNetSuiteApprovalAccountOptions = getNetSuiteApprovalAccountOptions;
exports.getNetSuitePayableAccountOptions = getNetSuitePayableAccountOptions;
exports.getNetSuiteReceivableAccountOptions = getNetSuiteReceivableAccountOptions;
exports.getNetSuiteInvoiceItemOptions = getNetSuiteInvoiceItemOptions;
exports.getNetSuiteTaxAccountOptions = getNetSuiteTaxAccountOptions;
exports.getSageIntacctVendors = getSageIntacctVendors;
exports.getSageIntacctNonReimbursableActiveDefaultVendor = getSageIntacctNonReimbursableActiveDefaultVendor;
exports.getSageIntacctCreditCards = getSageIntacctCreditCards;
exports.getSageIntacctBankAccounts = getSageIntacctBankAccounts;
exports.getDistanceRateCustomUnit = getDistanceRateCustomUnit;
exports.getPerDiemCustomUnit = getPerDiemCustomUnit;
exports.getDistanceRateCustomUnitRate = getDistanceRateCustomUnitRate;
exports.getPerDiemRateCustomUnitRate = getPerDiemRateCustomUnitRate;
exports.removePendingFieldsFromCustomUnit = removePendingFieldsFromCustomUnit;
exports.goBackWhenEnableFeature = goBackWhenEnableFeature;
exports.navigateToExpensifyCardPage = navigateToExpensifyCardPage;
exports.getIntegrationLastSuccessfulDate = getIntegrationLastSuccessfulDate;
exports.getCurrentConnectionName = getCurrentConnectionName;
exports.getCustomersOrJobsLabelNetSuite = getCustomersOrJobsLabelNetSuite;
exports.getDefaultApprover = getDefaultApprover;
exports.getApprovalWorkflow = getApprovalWorkflow;
exports.getReimburserAccountID = getReimburserAccountID;
exports.isControlPolicy = isControlPolicy;
exports.isCollectPolicy = isCollectPolicy;
exports.isNetSuiteCustomSegmentRecord = isNetSuiteCustomSegmentRecord;
exports.getNameFromNetSuiteCustomField = getNameFromNetSuiteCustomField;
exports.isNetSuiteCustomFieldPropertyEditable = isNetSuiteCustomFieldPropertyEditable;
exports.getCurrentSageIntacctEntityName = getCurrentSageIntacctEntityName;
exports.hasNoPolicyOtherThanPersonalType = hasNoPolicyOtherThanPersonalType;
exports.getCurrentTaxID = getCurrentTaxID;
exports.areSettingsInErrorFields = areSettingsInErrorFields;
exports.settingsPendingAction = settingsPendingAction;
exports.getGroupPaidPoliciesWithExpenseChatEnabled = getGroupPaidPoliciesWithExpenseChatEnabled;
exports.getForwardsToAccount = getForwardsToAccount;
exports.getSubmitToAccountID = getSubmitToAccountID;
exports.getWorkspaceAccountID = getWorkspaceAccountID;
exports.getAllTaxRates = getAllTaxRatesNamesAndKeys;
exports.getTagNamesFromTagsLists = getTagNamesFromTagsLists;
exports.getTagApproverRule = getTagApproverRule;
exports.getDomainNameForPolicy = getDomainNameForPolicy;
exports.hasUnsupportedIntegration = hasUnsupportedIntegration;
exports.getWorkflowApprovalsUnavailable = getWorkflowApprovalsUnavailable;
exports.getNetSuiteImportCustomFieldLabel = getNetSuiteImportCustomFieldLabel;
exports.getAllPoliciesLength = getAllPoliciesLength;
exports.getActivePolicy = getActivePolicy;
exports.getUserFriendlyWorkspaceType = getUserFriendlyWorkspaceType;
exports.isPolicyAccessible = isPolicyAccessible;
exports.shouldDisplayPolicyNotFoundPage = shouldDisplayPolicyNotFoundPage;
exports.hasOtherControlWorkspaces = hasOtherControlWorkspaces;
exports.getManagerAccountEmail = getManagerAccountEmail;
exports.getRuleApprovers = getRuleApprovers;
exports.canModifyPlan = canModifyPlan;
exports.getAdminsPrivateEmailDomains = getAdminsPrivateEmailDomains;
exports.getPolicyNameByID = getPolicyNameByID;
exports.getMostFrequentEmailDomain = getMostFrequentEmailDomain;
exports.getManagerAccountID = getManagerAccountID;
exports.isPreferredExporter = isPreferredExporter;
exports.areAllGroupPoliciesExpenseChatDisabled = areAllGroupPoliciesExpenseChatDisabled;
exports.getCountOfRequiredTagLists = getCountOfRequiredTagLists;
exports.getActiveEmployeeWorkspaces = getActiveEmployeeWorkspaces;
exports.isUserInvitedToWorkspace = isUserInvitedToWorkspace;
exports.getPolicyRole = getPolicyRole;
exports.hasIndependentTags = hasIndependentTags;
var expensify_common_1 = require("expensify-common");
var react_native_onyx_1 = require("react-native-onyx");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var NetSuiteCustomFieldForm_1 = require("@src/types/form/NetSuiteCustomFieldForm");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var connections_1 = require("./actions/connections");
var QuickbooksOnline_1 = require("./actions/connections/QuickbooksOnline");
var Report_1 = require("./actions/Report");
var CategoryUtils_1 = require("./CategoryUtils");
var Localize_1 = require("./Localize");
var Navigation_1 = require("./Navigation/Navigation");
var NetworkStore_1 = require("./Network/NetworkStore");
var PersonalDetailsUtils_1 = require("./PersonalDetailsUtils");
var TransactionUtils_1 = require("./TransactionUtils");
var ValidationUtils_1 = require("./ValidationUtils");
var allPolicies;
var activePolicyId;
var isLoadingReportData = true;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: function (value) { return (allPolicies = value); },
});
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID,
    callback: function (value) { return (activePolicyId = value); },
});
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.IS_LOADING_REPORT_DATA,
    initWithStoredValues: false,
    callback: function (value) { return (isLoadingReportData = value !== null && value !== void 0 ? value : false); },
});
/**
 * Filter out the active policies, which will exclude policies with pending deletion
 * and policies the current user doesn't belong to.
 * These are policies that we can use to create reports with in NewDot.
 */
function getActivePolicies(policies, currentUserLogin) {
    return Object.values(policies !== null && policies !== void 0 ? policies : {}).filter(function (policy) {
        return !!policy && policy.pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE && !!policy.name && !!policy.id && !!getPolicyRole(policy, currentUserLogin);
    });
}
/**
 * Filter out the active policies, which will exclude policies with pending deletion
 * and policies the current user doesn't belong to.
 * These will be policies that has expense chat enabled.
 * These are policies that we can use to create reports with in NewDot.
 */
function getActivePoliciesWithExpenseChat(policies, currentUserLogin) {
    return Object.values(policies !== null && policies !== void 0 ? policies : {}).filter(function (policy) {
        return !!policy &&
            policy.pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
            !!policy.name &&
            !!policy.id &&
            !!getPolicyRole(policy, currentUserLogin) &&
            policy.isPolicyExpenseChatEnabled;
    });
}
function getPerDiemCustomUnits(policies, email) {
    return getActivePoliciesWithExpenseChat(policies, email)
        .map(function (mappedPolicy) { return ({ policyID: mappedPolicy.id, customUnit: getPerDiemCustomUnit(mappedPolicy) }); })
        // We filter out custom units that are undefine but ts cant' figure it out.
        .filter(function (_a) {
        var customUnit = _a.customUnit;
        return !(0, EmptyObject_1.isEmptyObject)(customUnit) && !!customUnit.enabled;
    });
}
/**
 * Checks if the current user is an admin of the policy.
 */
var isPolicyAdmin = function (policy, currentUserLogin) { return getPolicyRole(policy, currentUserLogin) === CONST_1.default.POLICY.ROLE.ADMIN; };
exports.isPolicyAdmin = isPolicyAdmin;
/**
 * Checks if we have any errors stored within the policy?.employeeList. Determines whether we should show a red brick road error or not.
 */
function shouldShowEmployeeListError(policy) {
    var _a;
    return isPolicyAdmin(policy) && Object.values((_a = policy === null || policy === void 0 ? void 0 : policy.employeeList) !== null && _a !== void 0 ? _a : {}).some(function (employee) { var _a; return Object.keys((_a = employee === null || employee === void 0 ? void 0 : employee.errors) !== null && _a !== void 0 ? _a : {}).length > 0; });
}
/**
 *  Check if the policy has any tax rate errors.
 */
function shouldShowTaxRateError(policy) {
    var _a, _b;
    return (isPolicyAdmin(policy) &&
        Object.values((_b = (_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes) !== null && _b !== void 0 ? _b : {}).some(function (taxRate) { var _a, _b; return Object.keys((_a = taxRate === null || taxRate === void 0 ? void 0 : taxRate.errors) !== null && _a !== void 0 ? _a : {}).length > 0 || Object.values((_b = taxRate === null || taxRate === void 0 ? void 0 : taxRate.errorFields) !== null && _b !== void 0 ? _b : {}).some(Boolean); }));
}
/**
 * Check if the policy has any errors within the categories.
 */
function hasPolicyCategoriesError(policyCategories) {
    return Object.keys(policyCategories !== null && policyCategories !== void 0 ? policyCategories : {}).some(function (categoryName) { var _a, _b; return Object.keys((_b = (_a = policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[categoryName]) === null || _a === void 0 ? void 0 : _a.errors) !== null && _b !== void 0 ? _b : {}).length > 0; });
}
/**
 * Checks if the policy had a sync error.
 */
function shouldShowSyncError(policy, isSyncInProgress) {
    var _a;
    return isPolicyAdmin(policy) && Object.keys((_a = policy === null || policy === void 0 ? void 0 : policy.connections) !== null && _a !== void 0 ? _a : {}).some(function (connection) { return !!(0, connections_1.hasSynchronizationErrorMessage)(policy, connection, isSyncInProgress); });
}
/**
 * Check if the policy has any error fields.
 */
function shouldShowPolicyErrorFields(policy) {
    var _a;
    return isPolicyAdmin(policy) && Object.values((_a = policy === null || policy === void 0 ? void 0 : policy.errorFields) !== null && _a !== void 0 ? _a : {}).some(function (fieldErrors) { return Object.keys(fieldErrors !== null && fieldErrors !== void 0 ? fieldErrors : {}).length > 0; });
}
/**
 * Check if the policy has any errors, and if it doesn't, then check if it has any error fields.
 */
function shouldShowPolicyError(policy) {
    var _a;
    return Object.keys((_a = policy === null || policy === void 0 ? void 0 : policy.errors) !== null && _a !== void 0 ? _a : {}).length > 0 ? isPolicyAdmin(policy) : shouldShowPolicyErrorFields(policy);
}
/**
 * Checks if we have any errors stored within the policy custom units.
 */
function shouldShowCustomUnitsError(policy) {
    var _a, _b;
    return isPolicyAdmin(policy) && Object.keys((_b = (_a = policy === null || policy === void 0 ? void 0 : policy.customUnits) === null || _a === void 0 ? void 0 : _a.errors) !== null && _b !== void 0 ? _b : {}).length > 0;
}
function getNumericValue(value, toLocaleDigit) {
    var numValue = parseFloat(value.toString().replace(toLocaleDigit('.'), '.'));
    if (Number.isNaN(numValue)) {
        return NaN;
    }
    // Rounding to 4 decimal places
    return parseFloat(numValue.toFixed(CONST_1.default.MAX_TAX_RATE_DECIMAL_PLACES));
}
/**
 * Retrieves the distance custom unit object for the given policy
 */
function getDistanceRateCustomUnit(policy) {
    var _a;
    return Object.values((_a = policy === null || policy === void 0 ? void 0 : policy.customUnits) !== null && _a !== void 0 ? _a : {}).find(function (unit) { return unit.name === CONST_1.default.CUSTOM_UNITS.NAME_DISTANCE; });
}
/**
 * Retrieves the per diem custom unit object for the given policy
 */
function getPerDiemCustomUnit(policy) {
    var _a;
    return Object.values((_a = policy === null || policy === void 0 ? void 0 : policy.customUnits) !== null && _a !== void 0 ? _a : {}).find(function (unit) { return unit.name === CONST_1.default.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL; });
}
/**
 * Retrieves custom unit rate object from the given customUnitRateID
 */
function getDistanceRateCustomUnitRate(policy, customUnitRateID) {
    var distanceUnit = getDistanceRateCustomUnit(policy);
    return distanceUnit === null || distanceUnit === void 0 ? void 0 : distanceUnit.rates[customUnitRateID];
}
/**
 * Retrieves custom unit rate object from the given customUnitRateID
 */
function getPerDiemRateCustomUnitRate(policy, customUnitRateID) {
    var perDiemUnit = getPerDiemCustomUnit(policy);
    return perDiemUnit === null || perDiemUnit === void 0 ? void 0 : perDiemUnit.rates[customUnitRateID];
}
function getRateDisplayValue(value, toLocaleDigit, withDecimals) {
    var _a;
    var numValue = getNumericValue(value, toLocaleDigit);
    if (Number.isNaN(numValue)) {
        return '';
    }
    if (withDecimals) {
        var decimalPart = (_a = numValue.toString().split('.').at(1)) !== null && _a !== void 0 ? _a : '';
        // Set the fraction digits to be between 2 and 4 (OD Behavior)
        var fractionDigits = Math.min(Math.max(decimalPart.length, CONST_1.default.MIN_TAX_RATE_DECIMAL_PLACES), CONST_1.default.MAX_TAX_RATE_DECIMAL_PLACES);
        return Number(numValue).toFixed(fractionDigits).toString().replace('.', toLocaleDigit('.'));
    }
    return numValue.toString().replace('.', toLocaleDigit('.')).substring(0, value.toString().length);
}
function getUnitRateValue(toLocaleDigit, customUnitRate, withDecimals) {
    var _a;
    return getRateDisplayValue(((_a = customUnitRate === null || customUnitRate === void 0 ? void 0 : customUnitRate.rate) !== null && _a !== void 0 ? _a : 0) / CONST_1.default.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET, toLocaleDigit, withDecimals);
}
/**
 * Get the brick road indicator status for a policy. The policy has an error status if there is a policy member error, a custom unit error or a field error.
 */
function getPolicyBrickRoadIndicatorStatus(policy, isConnectionInProgress) {
    if (shouldShowEmployeeListError(policy) ||
        shouldShowCustomUnitsError(policy) ||
        shouldShowPolicyErrorFields(policy) ||
        shouldShowSyncError(policy, isConnectionInProgress) ||
        (0, QuickbooksOnline_1.shouldShowQBOReimbursableExportDestinationAccountError)(policy)) {
        return CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    }
    return undefined;
}
function getPolicyRole(policy, currentUserLogin) {
    var _a, _b;
    if (policy === null || policy === void 0 ? void 0 : policy.role) {
        return policy.role;
    }
    if (!currentUserLogin) {
        return;
    }
    return (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.employeeList) === null || _a === void 0 ? void 0 : _a[currentUserLogin]) === null || _b === void 0 ? void 0 : _b.role;
}
function getPolicyNameByID(policyID) {
    var _a, _b;
    return (_b = (_a = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)]) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : '';
}
/**
 * Check if the policy can be displayed
 * If shouldShowPendingDeletePolicy is true, show the policy pending deletion.
 * If shouldShowPendingDeletePolicy is false, show the policy pending deletion only if there is an error.
 * Note: Using a local ONYXKEYS.NETWORK subscription will cause a delay in
 * updating the screen. Passing the offline status from the component.
 */
function shouldShowPolicy(policy, shouldShowPendingDeletePolicy, currentUserLogin) {
    var _a;
    return (!!(policy === null || policy === void 0 ? void 0 : policy.isJoinRequestPending) ||
        (!!policy &&
            (policy === null || policy === void 0 ? void 0 : policy.type) !== CONST_1.default.POLICY.TYPE.PERSONAL &&
            (shouldShowPendingDeletePolicy || (policy === null || policy === void 0 ? void 0 : policy.pendingAction) !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE || Object.keys((_a = policy.errors) !== null && _a !== void 0 ? _a : {}).length > 0) &&
            !!getPolicyRole(policy, currentUserLogin)));
}
function isPolicyMember(currentUserLogin, policyID) {
    var _a, _b;
    return !!currentUserLogin && !!policyID && !!((_b = (_a = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)]) === null || _a === void 0 ? void 0 : _a.employeeList) === null || _b === void 0 ? void 0 : _b[currentUserLogin]);
}
function isExpensifyTeam(email) {
    var emailDomain = expensify_common_1.Str.extractEmailDomain(email !== null && email !== void 0 ? email : '');
    return emailDomain === CONST_1.default.EXPENSIFY_PARTNER_NAME || emailDomain === CONST_1.default.EMAIL.GUIDES_DOMAIN;
}
/**
 * Checks if the user with login is an admin of the policy.
 */
var isUserPolicyAdmin = function (policy, login) { var _a; return !!(policy && policy.employeeList && login && ((_a = policy.employeeList[login]) === null || _a === void 0 ? void 0 : _a.role) === CONST_1.default.POLICY.ROLE.ADMIN); };
exports.isUserPolicyAdmin = isUserPolicyAdmin;
/**
 * Checks if the current user is of the role "user" on the policy.
 */
var isPolicyUser = function (policy, currentUserLogin) { return getPolicyRole(policy, currentUserLogin) === CONST_1.default.POLICY.ROLE.USER; };
exports.isPolicyUser = isPolicyUser;
/**
 * Checks if the current user is an auditor of the policy
 */
var isPolicyAuditor = function (policy, currentUserLogin) { var _a, _b, _c; return ((_a = policy === null || policy === void 0 ? void 0 : policy.role) !== null && _a !== void 0 ? _a : (currentUserLogin && ((_c = (_b = policy === null || policy === void 0 ? void 0 : policy.employeeList) === null || _b === void 0 ? void 0 : _b[currentUserLogin]) === null || _c === void 0 ? void 0 : _c.role))) === CONST_1.default.POLICY.ROLE.AUDITOR; };
exports.isPolicyAuditor = isPolicyAuditor;
var isPolicyEmployee = function (policyID, policy) {
    return !!policyID && policyID === (policy === null || policy === void 0 ? void 0 : policy.id);
};
exports.isPolicyEmployee = isPolicyEmployee;
/**
 * Checks if the current user is an owner (creator) of the policy.
 */
var isPolicyOwner = function (policy, currentUserAccountID) { return !!currentUserAccountID && (policy === null || policy === void 0 ? void 0 : policy.ownerAccountID) === currentUserAccountID; };
exports.isPolicyOwner = isPolicyOwner;
/**
 * Create an object mapping member emails to their accountIDs. Filter for members without errors if includeMemberWithErrors is false, and get the login email from the personalDetail object using the accountID.
 *
 * If includeMemberWithErrors is false, We only return members without errors. Otherwise, the members with errors would immediately be removed before the user has a chance to read the error.
 */
function getMemberAccountIDsForWorkspace(employeeList, includeMemberWithErrors, includeMemberWithPendingDelete) {
    if (includeMemberWithErrors === void 0) { includeMemberWithErrors = false; }
    if (includeMemberWithPendingDelete === void 0) { includeMemberWithPendingDelete = true; }
    var members = employeeList !== null && employeeList !== void 0 ? employeeList : {};
    var memberEmailsToAccountIDs = {};
    Object.keys(members).forEach(function (email) {
        var _a, _b;
        if (!includeMemberWithErrors) {
            var member = members === null || members === void 0 ? void 0 : members[email];
            if (((_b = Object.keys((_a = member === null || member === void 0 ? void 0 : member.errors) !== null && _a !== void 0 ? _a : {})) === null || _b === void 0 ? void 0 : _b.length) > 0) {
                return;
            }
        }
        if (!includeMemberWithPendingDelete) {
            var member = members === null || members === void 0 ? void 0 : members[email];
            if (member.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                return;
            }
        }
        var personalDetail = (0, PersonalDetailsUtils_1.getPersonalDetailByEmail)(email);
        if (!(personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login)) {
            return;
        }
        memberEmailsToAccountIDs[email] = Number(personalDetail.accountID);
    });
    return memberEmailsToAccountIDs;
}
/**
 * Get login list that we should not show in the workspace invite options
 */
function getIneligibleInvitees(employeeList) {
    var policyEmployeeList = employeeList !== null && employeeList !== void 0 ? employeeList : {};
    var memberEmailsToExclude = __spreadArray([], CONST_1.default.EXPENSIFY_EMAILS, true);
    Object.keys(policyEmployeeList).forEach(function (email) {
        var _a;
        var policyEmployee = policyEmployeeList === null || policyEmployeeList === void 0 ? void 0 : policyEmployeeList[email];
        // Policy members that are pending delete or have errors are not valid and we should show them in the invite options (don't exclude them).
        if ((policyEmployee === null || policyEmployee === void 0 ? void 0 : policyEmployee.pendingAction) === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE || Object.keys((_a = policyEmployee === null || policyEmployee === void 0 ? void 0 : policyEmployee.errors) !== null && _a !== void 0 ? _a : {}).length > 0) {
            return;
        }
        if (!email) {
            return;
        }
        memberEmailsToExclude.push(email);
    });
    return memberEmailsToExclude;
}
function getSortedTagKeys(policyTagList) {
    if ((0, EmptyObject_1.isEmptyObject)(policyTagList)) {
        return [];
    }
    return Object.keys(policyTagList).sort(function (key1, key2) { return policyTagList[key1].orderWeight - policyTagList[key2].orderWeight; });
}
/**
 * Gets a tag name of policy tags based on a tag's orderWeight.
 */
function getTagListName(policyTagList, orderWeight) {
    var _a, _b;
    if ((0, EmptyObject_1.isEmptyObject)(policyTagList)) {
        return '';
    }
    return (_b = (_a = Object.values(policyTagList).find(function (tag) { return tag.orderWeight === orderWeight; })) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : '';
}
/**
 * Gets all tag lists of a policy
 */
function getTagLists(policyTagList) {
    if ((0, EmptyObject_1.isEmptyObject)(policyTagList)) {
        return [];
    }
    return Object.values(policyTagList)
        .filter(function (policyTagListValue) { return policyTagListValue !== null; })
        .sort(function (tagA, tagB) { return tagA.orderWeight - tagB.orderWeight; });
}
/**
 * Gets a tag list of a policy by a tag index
 */
function getTagList(policyTagList, tagIndex) {
    var _a;
    var tagLists = getTagLists(policyTagList);
    return ((_a = tagLists.at(tagIndex)) !== null && _a !== void 0 ? _a : {
        name: '',
        required: false,
        tags: {},
        orderWeight: 0,
    });
}
function getTagNamesFromTagsLists(policyTagLists) {
    var _a;
    var uniqueTagNames = new Set();
    for (var _i = 0, _b = Object.values(policyTagLists !== null && policyTagLists !== void 0 ? policyTagLists : {}); _i < _b.length; _i++) {
        var policyTagList = _b[_i];
        for (var _c = 0, _d = Object.values((_a = policyTagList.tags) !== null && _a !== void 0 ? _a : {}); _c < _d.length; _c++) {
            var tag = _d[_c];
            uniqueTagNames.add(tag.name);
        }
    }
    return Array.from(uniqueTagNames);
}
/**
 * Cleans up escaping of colons (used to create multi-level tags, e.g. "Parent: Child") in the tag name we receive from the backend
 */
function getCleanedTagName(tag) {
    return tag === null || tag === void 0 ? void 0 : tag.replace(/\\:/g, CONST_1.default.COLON);
}
/**
 * Escape colon from tag name
 */
function escapeTagName(tag) {
    return tag === null || tag === void 0 ? void 0 : tag.replaceAll(CONST_1.default.COLON, '\\:');
}
/**
 * Gets a count of enabled tags of a policy
 */
function getCountOfEnabledTagsOfList(policyTags) {
    if (!policyTags) {
        return 0;
    }
    return Object.values(policyTags).filter(function (policyTag) { return policyTag.enabled; }).length;
}
/**
 * Gets count of required tag lists of a policy
 */
function getCountOfRequiredTagLists(policyTagLists) {
    if (!policyTagLists) {
        return 0;
    }
    return Object.values(policyTagLists).filter(function (tagList) { return tagList.required; }).length;
}
/**
 * Whether the policy has multi-level tags
 */
function isMultiLevelTags(policyTagList) {
    return Object.keys(policyTagList !== null && policyTagList !== void 0 ? policyTagList : {}).length > 1;
}
function isPendingDeletePolicy(policy) {
    return (policy === null || policy === void 0 ? void 0 : policy.pendingAction) === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
}
function isPaidGroupPolicy(policy) {
    return (policy === null || policy === void 0 ? void 0 : policy.type) === CONST_1.default.POLICY.TYPE.TEAM || (policy === null || policy === void 0 ? void 0 : policy.type) === CONST_1.default.POLICY.TYPE.CORPORATE;
}
function getOwnedPaidPolicies(policies, currentUserAccountID) {
    return Object.values(policies !== null && policies !== void 0 ? policies : {}).filter(function (policy) { return isPolicyOwner(policy, currentUserAccountID !== null && currentUserAccountID !== void 0 ? currentUserAccountID : CONST_1.default.DEFAULT_NUMBER_ID) && isPaidGroupPolicy(policy); });
}
function isControlPolicy(policy) {
    return (policy === null || policy === void 0 ? void 0 : policy.type) === CONST_1.default.POLICY.TYPE.CORPORATE;
}
function isCollectPolicy(policy) {
    return (policy === null || policy === void 0 ? void 0 : policy.type) === CONST_1.default.POLICY.TYPE.TEAM;
}
function isTaxTrackingEnabled(isPolicyExpenseChat, policy, isDistanceRequest, isPerDiemRequest) {
    var _a, _b, _c, _d, _e;
    if (isPerDiemRequest === void 0) { isPerDiemRequest = false; }
    if (isPerDiemRequest) {
        return false;
    }
    var distanceUnit = getDistanceRateCustomUnit(policy);
    var customUnitID = (_a = distanceUnit === null || distanceUnit === void 0 ? void 0 : distanceUnit.customUnitID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID;
    var isPolicyTaxTrackingEnabled = isPolicyExpenseChat && ((_b = policy === null || policy === void 0 ? void 0 : policy.tax) === null || _b === void 0 ? void 0 : _b.trackingEnabled);
    var isTaxEnabledForDistance = isPolicyTaxTrackingEnabled && !!customUnitID && ((_e = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.customUnits) === null || _c === void 0 ? void 0 : _c[customUnitID]) === null || _d === void 0 ? void 0 : _d.attributes) === null || _e === void 0 ? void 0 : _e.taxEnabled);
    return !!(isDistanceRequest ? isTaxEnabledForDistance : isPolicyTaxTrackingEnabled);
}
/**
 * Checks if policy's scheduled submit / auto reporting frequency is "instant".
 * Note: Free policies have "instant" submit always enabled.
 */
function isInstantSubmitEnabled(policy) {
    return (policy === null || policy === void 0 ? void 0 : policy.autoReporting) === true && (policy === null || policy === void 0 ? void 0 : policy.autoReportingFrequency) === CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT;
}
/**
 * This gets a "corrected" value for autoReportingFrequency. The purpose of this function is to encapsulate some logic around the "immediate" frequency.
 *
 * - "immediate" is actually not immediate. For that you want "instant".
 * - (immediate && harvesting.enabled) === daily
 * - (immediate && !harvesting.enabled) === manual
 *
 * Note that "daily" and "manual" only exist as options for the API, not in the database or Onyx.
 */
function getCorrectedAutoReportingFrequency(policy) {
    var _a;
    if ((policy === null || policy === void 0 ? void 0 : policy.autoReportingFrequency) !== CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE) {
        return policy === null || policy === void 0 ? void 0 : policy.autoReportingFrequency;
    }
    if ((_a = policy === null || policy === void 0 ? void 0 : policy.harvesting) === null || _a === void 0 ? void 0 : _a.enabled) {
        // This is actually not really "immediate". It's "daily". Surprise!
        return CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE;
    }
    // "manual" is really just "immediate" (aka "daily") with harvesting disabled
    return CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL;
}
/**
 * Checks if policy's approval mode is "optional", a.k.a. "Submit & Close"
 */
function isSubmitAndClose(policy) {
    return (policy === null || policy === void 0 ? void 0 : policy.approvalMode) === CONST_1.default.POLICY.APPROVAL_MODE.OPTIONAL;
}
function arePaymentsEnabled(policy) {
    return (policy === null || policy === void 0 ? void 0 : policy.reimbursementChoice) !== CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;
}
function isControlOnAdvancedApprovalMode(policy) {
    return (policy === null || policy === void 0 ? void 0 : policy.type) === CONST_1.default.POLICY.TYPE.CORPORATE && getApprovalWorkflow(policy) === CONST_1.default.POLICY.APPROVAL_MODE.ADVANCED;
}
/**
 * Whether the policy has active accounting integration connections
 */
function hasAccountingConnections(policy) {
    return !(0, EmptyObject_1.isEmptyObject)(policy === null || policy === void 0 ? void 0 : policy.connections);
}
function getPolicyEmployeeListByIdWithoutCurrentUser(policies, currentPolicyID, currentUserAccountID) {
    var _a;
    var policy = (_a = policies === null || policies === void 0 ? void 0 : policies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(currentPolicyID)]) !== null && _a !== void 0 ? _a : null;
    var policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(policy === null || policy === void 0 ? void 0 : policy.employeeList);
    return Object.values(policyMemberEmailsToAccountIDs)
        .map(function (policyMemberAccountID) { return Number(policyMemberAccountID); })
        .filter(function (policyMemberAccountID) { return policyMemberAccountID !== currentUserAccountID; });
}
function goBackFromInvalidPolicy() {
    Navigation_1.default.goBack(ROUTES_1.default.WORKSPACES_LIST.route);
}
/** Get a tax with given ID from policy */
function getTaxByID(policy, taxID) {
    var _a, _b;
    return (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes) === null || _b === void 0 ? void 0 : _b[taxID];
}
/** Get a tax rate object built like Record<TaxRateName, RelatedTaxRateKeys>.
 * We want to allow user to choose over TaxRateName and there might be a situation when one TaxRateName has two possible keys in different policies */
function getAllTaxRatesNamesAndKeys() {
    var _a;
    var allTaxRates = {};
    (_a = Object.values(allPolicies !== null && allPolicies !== void 0 ? allPolicies : {})) === null || _a === void 0 ? void 0 : _a.forEach(function (policy) {
        var _a, _b;
        if (!((_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes)) {
            return;
        }
        Object.entries((_b = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _b === void 0 ? void 0 : _b.taxes).forEach(function (_a) {
            var taxRateKey = _a[0], taxRate = _a[1];
            if (!allTaxRates[taxRate.name]) {
                allTaxRates[taxRate.name] = [taxRateKey];
                return;
            }
            allTaxRates[taxRate.name].push(taxRateKey);
        });
    });
    return allTaxRates;
}
/**
 * Whether the tax rate can be deleted and disabled
 */
function canEditTaxRate(policy, taxID) {
    var _a, _b;
    return ((_a = policy.taxRates) === null || _a === void 0 ? void 0 : _a.defaultExternalID) !== taxID && ((_b = policy.taxRates) === null || _b === void 0 ? void 0 : _b.foreignTaxDefault) !== taxID;
}
function isPolicyFeatureEnabled(policy, featureName) {
    var _a;
    if (featureName === CONST_1.default.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED) {
        return !!((_a = policy === null || policy === void 0 ? void 0 : policy.tax) === null || _a === void 0 ? void 0 : _a.trackingEnabled);
    }
    if (featureName === CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED) {
        return (policy === null || policy === void 0 ? void 0 : policy[featureName]) ? !!(policy === null || policy === void 0 ? void 0 : policy[featureName]) : !(0, EmptyObject_1.isEmptyObject)(policy === null || policy === void 0 ? void 0 : policy.connections);
    }
    return !!(policy === null || policy === void 0 ? void 0 : policy[featureName]);
}
function getApprovalWorkflow(policy) {
    var _a;
    if ((policy === null || policy === void 0 ? void 0 : policy.type) === CONST_1.default.POLICY.TYPE.PERSONAL) {
        return CONST_1.default.POLICY.APPROVAL_MODE.OPTIONAL;
    }
    return (_a = policy === null || policy === void 0 ? void 0 : policy.approvalMode) !== null && _a !== void 0 ? _a : CONST_1.default.POLICY.APPROVAL_MODE.ADVANCED;
}
function getDefaultApprover(policy) {
    var _a, _b;
    return (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.approver) !== null && _a !== void 0 ? _a : policy === null || policy === void 0 ? void 0 : policy.owner) !== null && _b !== void 0 ? _b : '';
}
function getRuleApprovers(policy, expenseReport) {
    var _a, _b, _c, _d;
    var categoryApprovers = [];
    var tagApprovers = [];
    var allReportTransactions = (0, TransactionUtils_1.getAllSortedTransactions)(expenseReport === null || expenseReport === void 0 ? void 0 : expenseReport.reportID);
    // Before submitting to their `submitsTo` (in a policy on Advanced Approvals), submit to category/tag approvers.
    // Category approvers are prioritized, then tag approvers.
    for (var i = 0; i < allReportTransactions.length; i++) {
        var transaction = allReportTransactions.at(i);
        var tag = (0, TransactionUtils_1.getTag)(transaction);
        var category = (0, TransactionUtils_1.getCategory)(transaction);
        var categoryApprover = (_c = (0, CategoryUtils_1.getCategoryApproverRule)((_b = (_a = policy === null || policy === void 0 ? void 0 : policy.rules) === null || _a === void 0 ? void 0 : _a.approvalRules) !== null && _b !== void 0 ? _b : [], category)) === null || _c === void 0 ? void 0 : _c.approver;
        var tagApprover = (_d = getTagApproverRule(policy, tag)) === null || _d === void 0 ? void 0 : _d.approver;
        if (categoryApprover) {
            categoryApprovers.push(categoryApprover);
        }
        if (tagApprover) {
            tagApprovers.push(tagApprover);
        }
    }
    return __spreadArray(__spreadArray([], categoryApprovers, true), tagApprovers, true);
}
function getManagerAccountID(policy, expenseReport) {
    var _a, _b, _c, _d, _e, _f;
    var employeeAccountID = (_a = expenseReport === null || expenseReport === void 0 ? void 0 : expenseReport.ownerAccountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID;
    var employeeLogin = (_b = (0, PersonalDetailsUtils_1.getLoginsByAccountIDs)([employeeAccountID]).at(0)) !== null && _b !== void 0 ? _b : '';
    var defaultApprover = getDefaultApprover(policy);
    // For policy using the optional or basic workflow, the manager is the policy default approver.
    if ([CONST_1.default.POLICY.APPROVAL_MODE.OPTIONAL, CONST_1.default.POLICY.APPROVAL_MODE.BASIC].includes(getApprovalWorkflow(policy))) {
        return (_c = (0, PersonalDetailsUtils_1.getAccountIDsByLogins)([defaultApprover]).at(0)) !== null && _c !== void 0 ? _c : -1;
    }
    var employee = (_d = policy === null || policy === void 0 ? void 0 : policy.employeeList) === null || _d === void 0 ? void 0 : _d[employeeLogin];
    if (!employee && !defaultApprover) {
        return -1;
    }
    return (_f = (0, PersonalDetailsUtils_1.getAccountIDsByLogins)([(_e = employee === null || employee === void 0 ? void 0 : employee.submitsTo) !== null && _e !== void 0 ? _e : defaultApprover]).at(0)) !== null && _f !== void 0 ? _f : -1;
}
/**
 * Returns the accountID to whom the given expenseReport submits reports to in the given Policy.
 */
function getSubmitToAccountID(policy, expenseReport) {
    var _a, _b, _c, _d;
    var ruleApprovers = getRuleApprovers(policy, expenseReport);
    var employeeAccountID = (_a = expenseReport === null || expenseReport === void 0 ? void 0 : expenseReport.ownerAccountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID;
    var employeeLogin = (_b = (0, PersonalDetailsUtils_1.getLoginsByAccountIDs)([employeeAccountID]).at(0)) !== null && _b !== void 0 ? _b : '';
    if (ruleApprovers.length > 0 && ruleApprovers.at(0) === employeeLogin && (policy === null || policy === void 0 ? void 0 : policy.preventSelfApproval)) {
        ruleApprovers.shift();
    }
    if (ruleApprovers.length > 0 && !isSubmitAndClose(policy)) {
        return (_d = (0, PersonalDetailsUtils_1.getAccountIDsByLogins)([(_c = ruleApprovers.at(0)) !== null && _c !== void 0 ? _c : '']).at(0)) !== null && _d !== void 0 ? _d : -1;
    }
    return getManagerAccountID(policy, expenseReport);
}
function getManagerAccountEmail(policy, expenseReport) {
    var _a;
    var managerAccountID = getManagerAccountID(policy, expenseReport);
    return (_a = (0, PersonalDetailsUtils_1.getLoginsByAccountIDs)([managerAccountID]).at(0)) !== null && _a !== void 0 ? _a : '';
}
/**
 * Returns the email of the account to forward the report to depending on the approver's approval limit.
 * Used for advanced approval mode only.
 */
function getForwardsToAccount(policy, employeeEmail, reportTotal) {
    var _a, _b;
    if (!isControlOnAdvancedApprovalMode(policy)) {
        return '';
    }
    var employee = (_a = policy === null || policy === void 0 ? void 0 : policy.employeeList) === null || _a === void 0 ? void 0 : _a[employeeEmail];
    if (!employee) {
        return '';
    }
    var positiveReportTotal = Math.abs(reportTotal);
    if (employee.approvalLimit && employee.overLimitForwardsTo && positiveReportTotal > employee.approvalLimit) {
        return employee.overLimitForwardsTo;
    }
    return (_b = employee.forwardsTo) !== null && _b !== void 0 ? _b : '';
}
/**
 * Returns the accountID of the policy reimburser, if not available returns -1.
 */
function getReimburserAccountID(policy) {
    var _a, _b, _c;
    var reimburserEmail = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.achAccount) === null || _a === void 0 ? void 0 : _a.reimburser) !== null && _b !== void 0 ? _b : '';
    return reimburserEmail ? ((_c = (0, PersonalDetailsUtils_1.getAccountIDsByLogins)([reimburserEmail]).at(0)) !== null && _c !== void 0 ? _c : -1) : -1;
}
function getPersonalPolicy() {
    return Object.values(allPolicies !== null && allPolicies !== void 0 ? allPolicies : {}).find(function (policy) { return (policy === null || policy === void 0 ? void 0 : policy.type) === CONST_1.default.POLICY.TYPE.PERSONAL; });
}
function getAdminEmployees(policy) {
    if (!policy || !policy.employeeList) {
        return [];
    }
    return Object.keys(policy.employeeList)
        .map(function (email) { var _a; return (__assign(__assign({}, (_a = policy.employeeList) === null || _a === void 0 ? void 0 : _a[email]), { email: email })); })
        .filter(function (employee) { return employee.pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE && employee.role === CONST_1.default.POLICY.ROLE.ADMIN; });
}
/**
 * Returns the policy of the report
 * @deprecated Get the data straight from Onyx - This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
 */
function getPolicy(policyID, policies) {
    if (policies === void 0) { policies = allPolicies; }
    if (!policies || !policyID) {
        return undefined;
    }
    return policies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)];
}
/** Return active policies where current user is an admin */
function getActiveAdminWorkspaces(policies, currentUserLogin) {
    var activePolicies = getActivePolicies(policies, currentUserLogin);
    return activePolicies.filter(function (policy) { return shouldShowPolicy(policy, (0, NetworkStore_1.isOffline)(), currentUserLogin) && isPolicyAdmin(policy, currentUserLogin); });
}
/** Return active policies where current user is an employee (of the role "user") */
function getActiveEmployeeWorkspaces(policies, currentUserLogin) {
    var activePolicies = getActivePolicies(policies, currentUserLogin);
    return activePolicies.filter(function (policy) { return shouldShowPolicy(policy, (0, NetworkStore_1.isOffline)(), currentUserLogin) && isPolicyUser(policy, currentUserLogin); });
}
/**
 * Checks whether the current user has a policy with admin access
 */
function hasActiveAdminWorkspaces(currentUserLogin) {
    return getActiveAdminWorkspaces(allPolicies, currentUserLogin).length > 0;
}
/**
 *
 * Checks whether the current user has a policy with Xero accounting software integration
 */
function hasPolicyWithXeroConnection(currentUserLogin) {
    var _a;
    return (_a = getActiveAdminWorkspaces(allPolicies, currentUserLogin)) === null || _a === void 0 ? void 0 : _a.some(function (policy) { var _a; return !!((_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a[CONST_1.default.POLICY.CONNECTIONS.NAME.XERO]); });
}
/** Whether the user can send invoice from the workspace */
function canSendInvoiceFromWorkspace(policyID) {
    var _a;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    return (_a = policy === null || policy === void 0 ? void 0 : policy.areInvoicesEnabled) !== null && _a !== void 0 ? _a : false;
}
/** Whether the user can submit per diem expense from the workspace */
function canSubmitPerDiemExpenseFromWorkspace(policy) {
    var perDiemCustomUnit = getPerDiemCustomUnit(policy);
    return !!(policy === null || policy === void 0 ? void 0 : policy.isPolicyExpenseChatEnabled) && !(0, EmptyObject_1.isEmptyObject)(perDiemCustomUnit) && !!(perDiemCustomUnit === null || perDiemCustomUnit === void 0 ? void 0 : perDiemCustomUnit.enabled);
}
/** Whether the user can send invoice */
function canSendInvoice(policies, currentUserLogin) {
    return getActiveAdminWorkspaces(policies, currentUserLogin).some(function (policy) { return canSendInvoiceFromWorkspace(policy.id); });
}
function hasDependentTags(policy, policyTagList) {
    if (!(policy === null || policy === void 0 ? void 0 : policy.hasMultipleTagLists)) {
        return false;
    }
    return Object.values(policyTagList !== null && policyTagList !== void 0 ? policyTagList : {}).some(function (tagList) { return Object.values(tagList.tags).some(function (tag) { var _a; return !!((_a = tag.rules) === null || _a === void 0 ? void 0 : _a.parentTagsFilter) || !!tag.parentTagsFilter; }); });
}
function hasIndependentTags(policy, policyTagList) {
    if (!(policy === null || policy === void 0 ? void 0 : policy.hasMultipleTagLists)) {
        return false;
    }
    return Object.values(policyTagList !== null && policyTagList !== void 0 ? policyTagList : {}).every(function (tagList) { return Object.values(tagList.tags).every(function (tag) { var _a; return !((_a = tag.rules) === null || _a === void 0 ? void 0 : _a.parentTagsFilter) && !tag.parentTagsFilter; }); });
}
/** Get the Xero organizations connected to the policy */
function getXeroTenants(policy) {
    var _a;
    // Due to the way optional chain is being handled in this useMemo we are forced to use this approach to properly handle undefined values
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (!policy || !policy.connections || !policy.connections.xero || !policy.connections.xero.data) {
        return [];
    }
    return (_a = policy.connections.xero.data.tenants) !== null && _a !== void 0 ? _a : [];
}
function findCurrentXeroOrganization(tenants, organizationID) {
    return tenants === null || tenants === void 0 ? void 0 : tenants.find(function (tenant) { return tenant.id === organizationID; });
}
function getCurrentXeroOrganizationName(policy) {
    var _a, _b, _c, _d;
    return (_d = findCurrentXeroOrganization(getXeroTenants(policy), (_c = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.xero) === null || _b === void 0 ? void 0 : _b.config) === null || _c === void 0 ? void 0 : _c.tenantID)) === null || _d === void 0 ? void 0 : _d.name;
}
function getXeroBankAccounts(policy, selectedBankAccountId) {
    var _a, _b, _c, _d;
    var bankAccounts = (_d = (_c = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.xero) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.bankAccounts) !== null && _d !== void 0 ? _d : [];
    return (bankAccounts !== null && bankAccounts !== void 0 ? bankAccounts : []).map(function (_a) {
        var id = _a.id, name = _a.name;
        return ({
            value: id,
            text: name,
            keyForList: id,
            isSelected: selectedBankAccountId === id,
        });
    });
}
function areSettingsInErrorFields(settings, errorFields) {
    if (settings === undefined || errorFields === undefined) {
        return false;
    }
    var keys = Object.keys(errorFields);
    return settings.some(function (setting) { return keys.includes(setting); });
}
function settingsPendingAction(settings, pendingFields) {
    if (settings === undefined || pendingFields === undefined) {
        return null;
    }
    var key = Object.keys(pendingFields).find(function (setting) { return settings.includes(setting); });
    if (!key) {
        return;
    }
    return pendingFields[key];
}
function findSelectedVendorWithDefaultSelect(vendors, selectedVendorId) {
    var _a;
    var selectedVendor = (vendors !== null && vendors !== void 0 ? vendors : []).find(function (_a) {
        var id = _a.id;
        return id === selectedVendorId;
    });
    return (_a = selectedVendor !== null && selectedVendor !== void 0 ? selectedVendor : vendors === null || vendors === void 0 ? void 0 : vendors[0]) !== null && _a !== void 0 ? _a : undefined;
}
function findSelectedSageVendorWithDefaultSelect(vendors, selectedVendorID) {
    var _a;
    var selectedVendor = (vendors !== null && vendors !== void 0 ? vendors : []).find(function (_a) {
        var id = _a.id;
        return id === selectedVendorID;
    });
    return (_a = selectedVendor !== null && selectedVendor !== void 0 ? selectedVendor : vendors === null || vendors === void 0 ? void 0 : vendors[0]) !== null && _a !== void 0 ? _a : undefined;
}
function findSelectedBankAccountWithDefaultSelect(accounts, selectedBankAccountId) {
    var _a;
    var selectedBankAccount = (accounts !== null && accounts !== void 0 ? accounts : []).find(function (_a) {
        var id = _a.id;
        return id === selectedBankAccountId;
    });
    return (_a = selectedBankAccount !== null && selectedBankAccount !== void 0 ? selectedBankAccount : accounts === null || accounts === void 0 ? void 0 : accounts[0]) !== null && _a !== void 0 ? _a : undefined;
}
function findSelectedInvoiceItemWithDefaultSelect(invoiceItems, selectedItemId) {
    var _a;
    var selectedInvoiceItem = (invoiceItems !== null && invoiceItems !== void 0 ? invoiceItems : []).find(function (_a) {
        var id = _a.id;
        return id === selectedItemId;
    });
    return (_a = selectedInvoiceItem !== null && selectedInvoiceItem !== void 0 ? selectedInvoiceItem : invoiceItems === null || invoiceItems === void 0 ? void 0 : invoiceItems[0]) !== null && _a !== void 0 ? _a : undefined;
}
function findSelectedTaxAccountWithDefaultSelect(taxAccounts, selectedAccountId) {
    var _a;
    var selectedTaxAccount = (taxAccounts !== null && taxAccounts !== void 0 ? taxAccounts : []).find(function (_a) {
        var externalID = _a.externalID;
        return externalID === selectedAccountId;
    });
    return (_a = selectedTaxAccount !== null && selectedTaxAccount !== void 0 ? selectedTaxAccount : taxAccounts === null || taxAccounts === void 0 ? void 0 : taxAccounts[0]) !== null && _a !== void 0 ? _a : undefined;
}
function getNetSuiteVendorOptions(policy, selectedVendorId) {
    var _a, _b;
    var vendors = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.netsuite) === null || _b === void 0 ? void 0 : _b.options.data.vendors;
    var selectedVendor = findSelectedVendorWithDefaultSelect(vendors, selectedVendorId);
    return (vendors !== null && vendors !== void 0 ? vendors : []).map(function (_a) {
        var id = _a.id, name = _a.name;
        return ({
            value: id,
            text: name,
            keyForList: id,
            isSelected: (selectedVendor === null || selectedVendor === void 0 ? void 0 : selectedVendor.id) === id,
        });
    });
}
function getNetSuitePayableAccountOptions(policy, selectedBankAccountId) {
    var _a, _b;
    var payableAccounts = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.netsuite) === null || _b === void 0 ? void 0 : _b.options.data.payableList;
    var selectedPayableAccount = findSelectedBankAccountWithDefaultSelect(payableAccounts, selectedBankAccountId);
    return (payableAccounts !== null && payableAccounts !== void 0 ? payableAccounts : []).map(function (_a) {
        var id = _a.id, name = _a.name;
        return ({
            value: id,
            text: name,
            keyForList: id,
            isSelected: (selectedPayableAccount === null || selectedPayableAccount === void 0 ? void 0 : selectedPayableAccount.id) === id,
        });
    });
}
function getNetSuiteReceivableAccountOptions(policy, selectedBankAccountId) {
    var _a, _b;
    var receivableAccounts = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.netsuite) === null || _b === void 0 ? void 0 : _b.options.data.receivableList;
    var selectedReceivableAccount = findSelectedBankAccountWithDefaultSelect(receivableAccounts, selectedBankAccountId);
    return (receivableAccounts !== null && receivableAccounts !== void 0 ? receivableAccounts : []).map(function (_a) {
        var id = _a.id, name = _a.name;
        return ({
            value: id,
            text: name,
            keyForList: id,
            isSelected: (selectedReceivableAccount === null || selectedReceivableAccount === void 0 ? void 0 : selectedReceivableAccount.id) === id,
        });
    });
}
function getNetSuiteInvoiceItemOptions(policy, selectedItemId) {
    var _a, _b;
    var invoiceItems = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.netsuite) === null || _b === void 0 ? void 0 : _b.options.data.items;
    var selectedInvoiceItem = findSelectedInvoiceItemWithDefaultSelect(invoiceItems, selectedItemId);
    return (invoiceItems !== null && invoiceItems !== void 0 ? invoiceItems : []).map(function (_a) {
        var id = _a.id, name = _a.name;
        return ({
            value: id,
            text: name,
            keyForList: id,
            isSelected: (selectedInvoiceItem === null || selectedInvoiceItem === void 0 ? void 0 : selectedInvoiceItem.id) === id,
        });
    });
}
function getNetSuiteTaxAccountOptions(policy, subsidiaryCountry, selectedAccountId) {
    var _a, _b;
    var taxAccounts = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.netsuite) === null || _b === void 0 ? void 0 : _b.options.data.taxAccountsList;
    var accountOptions = (taxAccounts !== null && taxAccounts !== void 0 ? taxAccounts : []).filter(function (_a) {
        var country = _a.country;
        return country === subsidiaryCountry;
    });
    var selectedTaxAccount = findSelectedTaxAccountWithDefaultSelect(accountOptions, selectedAccountId);
    return accountOptions.map(function (_a) {
        var externalID = _a.externalID, name = _a.name;
        return ({
            value: externalID,
            text: name,
            keyForList: externalID,
            isSelected: (selectedTaxAccount === null || selectedTaxAccount === void 0 ? void 0 : selectedTaxAccount.externalID) === externalID,
        });
    });
}
function canUseTaxNetSuite(canUseNetSuiteUSATax, subsidiaryCountry) {
    return !!canUseNetSuiteUSATax || CONST_1.default.NETSUITE_TAX_COUNTRIES.includes(subsidiaryCountry !== null && subsidiaryCountry !== void 0 ? subsidiaryCountry : '');
}
function canUseProvincialTaxNetSuite(subsidiaryCountry) {
    return subsidiaryCountry === '_canada';
}
function getFilteredReimbursableAccountOptions(payableAccounts) {
    return (payableAccounts !== null && payableAccounts !== void 0 ? payableAccounts : []).filter(function (_a) {
        var type = _a.type;
        return type === CONST_1.default.NETSUITE_ACCOUNT_TYPE.BANK || type === CONST_1.default.NETSUITE_ACCOUNT_TYPE.CREDIT_CARD;
    });
}
function getNetSuiteReimbursableAccountOptions(policy, selectedBankAccountId) {
    var _a, _b;
    var payableAccounts = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.netsuite) === null || _b === void 0 ? void 0 : _b.options.data.payableList;
    var accountOptions = getFilteredReimbursableAccountOptions(payableAccounts);
    var selectedPayableAccount = findSelectedBankAccountWithDefaultSelect(accountOptions, selectedBankAccountId);
    return accountOptions.map(function (_a) {
        var id = _a.id, name = _a.name;
        return ({
            value: id,
            text: name,
            keyForList: id,
            isSelected: (selectedPayableAccount === null || selectedPayableAccount === void 0 ? void 0 : selectedPayableAccount.id) === id,
        });
    });
}
function getFilteredCollectionAccountOptions(payableAccounts) {
    return (payableAccounts !== null && payableAccounts !== void 0 ? payableAccounts : []).filter(function (_a) {
        var type = _a.type;
        return type === CONST_1.default.NETSUITE_ACCOUNT_TYPE.BANK;
    });
}
function getNetSuiteCollectionAccountOptions(policy, selectedBankAccountId) {
    var _a, _b;
    var payableAccounts = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.netsuite) === null || _b === void 0 ? void 0 : _b.options.data.payableList;
    var accountOptions = getFilteredCollectionAccountOptions(payableAccounts);
    var selectedPayableAccount = findSelectedBankAccountWithDefaultSelect(accountOptions, selectedBankAccountId);
    return accountOptions.map(function (_a) {
        var id = _a.id, name = _a.name;
        return ({
            value: id,
            text: name,
            keyForList: id,
            isSelected: (selectedPayableAccount === null || selectedPayableAccount === void 0 ? void 0 : selectedPayableAccount.id) === id,
        });
    });
}
function getFilteredApprovalAccountOptions(payableAccounts) {
    return (payableAccounts !== null && payableAccounts !== void 0 ? payableAccounts : []).filter(function (_a) {
        var type = _a.type;
        return type === CONST_1.default.NETSUITE_ACCOUNT_TYPE.ACCOUNTS_PAYABLE;
    });
}
function getNetSuiteApprovalAccountOptions(policy, selectedBankAccountId) {
    var _a, _b;
    var payableAccounts = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.netsuite) === null || _b === void 0 ? void 0 : _b.options.data.payableList;
    var defaultApprovalAccount = {
        id: CONST_1.default.NETSUITE_APPROVAL_ACCOUNT_DEFAULT,
        name: (0, Localize_1.translateLocal)('workspace.netsuite.advancedConfig.defaultApprovalAccount'),
        type: CONST_1.default.NETSUITE_ACCOUNT_TYPE.ACCOUNTS_PAYABLE,
    };
    var accountOptions = getFilteredApprovalAccountOptions([defaultApprovalAccount].concat(payableAccounts !== null && payableAccounts !== void 0 ? payableAccounts : []));
    var selectedPayableAccount = findSelectedBankAccountWithDefaultSelect(accountOptions, selectedBankAccountId);
    return accountOptions.map(function (_a) {
        var id = _a.id, name = _a.name;
        return ({
            value: id,
            text: name,
            keyForList: id,
            isSelected: (selectedPayableAccount === null || selectedPayableAccount === void 0 ? void 0 : selectedPayableAccount.id) === id,
        });
    });
}
function getCustomersOrJobsLabelNetSuite(policy, translate) {
    var _a, _b, _c, _d, _e, _f, _g;
    var importMapping = (_e = (_d = (_c = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.netsuite) === null || _b === void 0 ? void 0 : _b.options) === null || _c === void 0 ? void 0 : _c.config) === null || _d === void 0 ? void 0 : _d.syncOptions) === null || _e === void 0 ? void 0 : _e.mapping;
    if (!(importMapping === null || importMapping === void 0 ? void 0 : importMapping.customers) && !(importMapping === null || importMapping === void 0 ? void 0 : importMapping.jobs)) {
        return undefined;
    }
    var importFields = [];
    var importCustomer = (_f = importMapping === null || importMapping === void 0 ? void 0 : importMapping.customers) !== null && _f !== void 0 ? _f : CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT;
    var importJobs = (_g = importMapping === null || importMapping === void 0 ? void 0 : importMapping.jobs) !== null && _g !== void 0 ? _g : CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT;
    if (importCustomer === CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT && importJobs === CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT) {
        return undefined;
    }
    var importedValue = (importMapping === null || importMapping === void 0 ? void 0 : importMapping.customers) !== CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT ? importCustomer : importJobs;
    if (importCustomer !== CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT) {
        importFields.push(translate('workspace.netsuite.import.customersOrJobs.customers'));
    }
    if (importJobs !== CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT) {
        importFields.push(translate('workspace.netsuite.import.customersOrJobs.jobs'));
    }
    var importedValueLabel = translate("workspace.netsuite.import.customersOrJobs.label", {
        importFields: importFields,
        importType: translate("workspace.accounting.importTypes.".concat(importedValue)).toLowerCase(),
    });
    return importedValueLabel.charAt(0).toUpperCase() + importedValueLabel.slice(1);
}
function getNetSuiteImportCustomFieldLabel(policy, importField, translate) {
    var _a, _b, _c, _d, _e;
    var fieldData = (_e = (_d = (_c = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.netsuite) === null || _b === void 0 ? void 0 : _b.options) === null || _c === void 0 ? void 0 : _c.config.syncOptions) === null || _d === void 0 ? void 0 : _d[importField]) !== null && _e !== void 0 ? _e : [];
    if (fieldData.length === 0) {
        return undefined;
    }
    var mappingSet = new Set(fieldData.map(function (item) { return item.mapping; }));
    var importedTypes = Array.from(mappingSet)
        .sort(function (a, b) { return b.localeCompare(a); })
        .map(function (mapping) { return translate("workspace.netsuite.import.importTypes.".concat(mapping !== '' ? mapping : 'TAG', ".label")).toLowerCase(); });
    return translate("workspace.netsuite.import.importCustomFields.label", { importedTypes: importedTypes });
}
function isNetSuiteCustomSegmentRecord(customField) {
    return 'segmentName' in customField;
}
function getNameFromNetSuiteCustomField(customField) {
    return 'segmentName' in customField ? customField.segmentName : customField.listName;
}
function isNetSuiteCustomFieldPropertyEditable(customField, fieldName) {
    var fieldsAllowedToEdit = isNetSuiteCustomSegmentRecord(customField) ? [NetSuiteCustomFieldForm_1.default.SEGMENT_NAME, NetSuiteCustomFieldForm_1.default.INTERNAL_ID, NetSuiteCustomFieldForm_1.default.SCRIPT_ID, NetSuiteCustomFieldForm_1.default.MAPPING] : [NetSuiteCustomFieldForm_1.default.MAPPING];
    var fieldKey = fieldName;
    return fieldsAllowedToEdit.includes(fieldKey);
}
function getIntegrationLastSuccessfulDate(getLocalDateFromDatetime, connection, connectionSyncProgress) {
    var _a;
    var syncSuccessfulDate;
    if (!connection) {
        return undefined;
    }
    if (connection === null || connection === void 0 ? void 0 : connection.lastSyncDate) {
        syncSuccessfulDate = connection === null || connection === void 0 ? void 0 : connection.lastSyncDate;
    }
    else {
        syncSuccessfulDate = (_a = connection === null || connection === void 0 ? void 0 : connection.lastSync) === null || _a === void 0 ? void 0 : _a.successfulDate;
    }
    var connectionSyncTimeStamp = getLocalDateFromDatetime(connectionSyncProgress === null || connectionSyncProgress === void 0 ? void 0 : connectionSyncProgress.timestamp).toISOString();
    if (connectionSyncProgress &&
        connectionSyncProgress.stageInProgress === CONST_1.default.POLICY.CONNECTIONS.SYNC_STAGE_NAME.JOB_DONE &&
        syncSuccessfulDate &&
        connectionSyncTimeStamp > getLocalDateFromDatetime(syncSuccessfulDate).toISOString()) {
        syncSuccessfulDate = connectionSyncTimeStamp;
    }
    return syncSuccessfulDate;
}
function getCurrentSageIntacctEntityName(policy, defaultNameIfNoEntity) {
    var _a, _b, _c, _d, _e, _f, _g;
    var currentEntityID = (_c = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.intacct) === null || _b === void 0 ? void 0 : _b.config) === null || _c === void 0 ? void 0 : _c.entity;
    if (!currentEntityID) {
        return defaultNameIfNoEntity;
    }
    var entities = (_f = (_e = (_d = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _d === void 0 ? void 0 : _d.intacct) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.entities;
    return (_g = entities === null || entities === void 0 ? void 0 : entities.find(function (entity) { return entity.id === currentEntityID; })) === null || _g === void 0 ? void 0 : _g.name;
}
function getSageIntacctBankAccounts(policy, selectedBankAccountId) {
    var _a, _b, _c, _d;
    var bankAccounts = (_d = (_c = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.intacct) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.bankAccounts) !== null && _d !== void 0 ? _d : [];
    return (bankAccounts !== null && bankAccounts !== void 0 ? bankAccounts : []).map(function (_a) {
        var id = _a.id, name = _a.name;
        return ({
            value: id,
            text: name,
            keyForList: id,
            isSelected: selectedBankAccountId === id,
        });
    });
}
function getSageIntacctVendors(policy, selectedVendorId) {
    var _a, _b, _c, _d;
    var vendors = (_d = (_c = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.intacct) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.vendors) !== null && _d !== void 0 ? _d : [];
    return vendors.map(function (_a) {
        var id = _a.id, value = _a.value;
        return ({
            value: id,
            text: value,
            keyForList: id,
            isSelected: selectedVendorId === id,
        });
    });
}
function getSageIntacctNonReimbursableActiveDefaultVendor(policy) {
    var _a, _b, _c;
    var _d = (_c = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.intacct) === null || _b === void 0 ? void 0 : _b.config.export) !== null && _c !== void 0 ? _c : {}, creditCardDefaultVendor = _d.nonReimbursableCreditCardChargeDefaultVendor, expenseReportDefaultVendor = _d.nonReimbursableVendor, nonReimbursable = _d.nonReimbursable;
    return nonReimbursable === CONST_1.default.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE ? creditCardDefaultVendor : expenseReportDefaultVendor;
}
function getSageIntacctCreditCards(policy, selectedAccount) {
    var _a, _b, _c, _d;
    var creditCards = (_d = (_c = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.intacct) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.creditCards) !== null && _d !== void 0 ? _d : [];
    return creditCards.map(function (_a) {
        var name = _a.name;
        return ({
            value: name,
            text: name,
            keyForList: name,
            isSelected: name === selectedAccount,
        });
    });
}
/**
 * Sort the workspaces by their name, while keeping the selected one at the beginning.
 * @param workspace1 Details of the first workspace to be compared.
 * @param workspace2 Details of the second workspace to be compared.
 * @param selectedWorkspaceID ID of the selected workspace which needs to be at the beginning.
 */
var sortWorkspacesBySelected = function (workspace1, workspace2, selectedWorkspaceID) {
    var _a, _b, _c, _d;
    if (workspace1.policyID === selectedWorkspaceID) {
        return -1;
    }
    if (workspace2.policyID === selectedWorkspaceID) {
        return 1;
    }
    return (_d = (_a = workspace1.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().localeCompare((_c = (_b = workspace2.name) === null || _b === void 0 ? void 0 : _b.toLowerCase()) !== null && _c !== void 0 ? _c : '')) !== null && _d !== void 0 ? _d : 0;
};
exports.sortWorkspacesBySelected = sortWorkspacesBySelected;
/**
 * Takes removes pendingFields and errorFields from a customUnit
 */
function removePendingFieldsFromCustomUnit(customUnit) {
    var cleanedCustomUnit = __assign({}, customUnit);
    delete cleanedCustomUnit.pendingFields;
    delete cleanedCustomUnit.errorFields;
    return cleanedCustomUnit;
}
function goBackWhenEnableFeature(policyID) {
    setTimeout(function () {
        Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_INITIAL.getRoute(policyID));
    }, CONST_1.default.WORKSPACE_ENABLE_FEATURE_REDIRECT_DELAY);
}
function navigateToExpensifyCardPage(policyID) {
    Navigation_1.default.setNavigationActionToMicrotaskQueue(function () {
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID));
    });
}
function getConnectedIntegration(policy, accountingIntegrations) {
    return (accountingIntegrations !== null && accountingIntegrations !== void 0 ? accountingIntegrations : Object.values(CONST_1.default.POLICY.CONNECTIONS.NAME)).find(function (integration) { var _a; return !!((_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a[integration]); });
}
function getValidConnectedIntegration(policy, accountingIntegrations) {
    return (accountingIntegrations !== null && accountingIntegrations !== void 0 ? accountingIntegrations : Object.values(CONST_1.default.POLICY.CONNECTIONS.NAME)).find(function (integration) { var _a; return !!((_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a[integration]) && !(0, connections_1.isAuthenticationError)(policy, integration); });
}
function hasIntegrationAutoSync(policy, connectedIntegration) {
    var _a, _b, _c, _d, _e;
    return (_e = (connectedIntegration && ((_d = (_c = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a[connectedIntegration]) === null || _b === void 0 ? void 0 : _b.config) === null || _c === void 0 ? void 0 : _c.autoSync) === null || _d === void 0 ? void 0 : _d.enabled))) !== null && _e !== void 0 ? _e : false;
}
function hasUnsupportedIntegration(policy, accountingIntegrations) {
    return !(accountingIntegrations !== null && accountingIntegrations !== void 0 ? accountingIntegrations : Object.values(CONST_1.default.POLICY.CONNECTIONS.NAME)).some(function (integration) { var _a; return !!((_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a[integration]); });
}
function getCurrentConnectionName(policy) {
    var accountingIntegrations = Object.values(CONST_1.default.POLICY.CONNECTIONS.NAME);
    var connectionKey = accountingIntegrations.find(function (integration) { var _a; return !!((_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a[integration]); });
    return connectionKey ? CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionKey] : undefined;
}
/**
 * Check if the policy member is deleted from the workspace
 */
function isDeletedPolicyEmployee(policyEmployee, isOffline) {
    return !isOffline && policyEmployee.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE && (0, EmptyObject_1.isEmptyObject)(policyEmployee.errors);
}
function hasNoPolicyOtherThanPersonalType() {
    return (Object.values(allPolicies !== null && allPolicies !== void 0 ? allPolicies : {}).filter(function (policy) { return policy && policy.type !== CONST_1.default.POLICY.TYPE.PERSONAL && policy.pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE; })
        .length === 0);
}
function getCurrentTaxID(policy, taxID) {
    var _a, _b;
    return Object.keys((_b = (_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes) !== null && _b !== void 0 ? _b : {}).find(function (taxIDKey) { var _a, _b; return ((_b = (_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes) === null || _b === void 0 ? void 0 : _b[taxIDKey].previousTaxCode) === taxID || taxIDKey === taxID; });
}
function getWorkspaceAccountID(policyID) {
    var _a;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    if (!policy) {
        return 0;
    }
    return (_a = policy.workspaceAccountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID;
}
function hasVBBA(policyID) {
    var _a;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    return !!((_a = policy === null || policy === void 0 ? void 0 : policy.achAccount) === null || _a === void 0 ? void 0 : _a.bankAccountID);
}
function getTagApproverRule(policyOrID, tagName) {
    var _a, _b;
    if (!policyOrID) {
        return;
    }
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = typeof policyOrID === 'string' ? getPolicy(policyOrID) : policyOrID;
    var approvalRules = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.rules) === null || _a === void 0 ? void 0 : _a.approvalRules) !== null && _b !== void 0 ? _b : [];
    var approverRule = approvalRules.find(function (rule) {
        return rule.applyWhen.find(function (_a) {
            var condition = _a.condition, field = _a.field, value = _a.value;
            return condition === CONST_1.default.POLICY.RULE_CONDITIONS.MATCHES && field === CONST_1.default.POLICY.FIELDS.TAG && value === tagName;
        });
    });
    return approverRule;
}
function getDomainNameForPolicy(policyID) {
    if (!policyID) {
        return '';
    }
    return "".concat(CONST_1.default.EXPENSIFY_POLICY_DOMAIN).concat(policyID.toLowerCase()).concat(CONST_1.default.EXPENSIFY_POLICY_DOMAIN_EXTENSION);
}
function getWorkflowApprovalsUnavailable(policy) {
    var _a;
    return (policy === null || policy === void 0 ? void 0 : policy.approvalMode) === CONST_1.default.POLICY.APPROVAL_MODE.OPTIONAL || !!((_a = policy === null || policy === void 0 ? void 0 : policy.errorFields) === null || _a === void 0 ? void 0 : _a.approvalMode);
}
function getAllPoliciesLength() {
    return Object.keys(allPolicies !== null && allPolicies !== void 0 ? allPolicies : {}).length;
}
function getActivePolicy() {
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    return getPolicy(activePolicyId);
}
function getUserFriendlyWorkspaceType(workspaceType) {
    switch (workspaceType) {
        case CONST_1.default.POLICY.TYPE.CORPORATE:
            return (0, Localize_1.translateLocal)('workspace.type.control');
        case CONST_1.default.POLICY.TYPE.TEAM:
            return (0, Localize_1.translateLocal)('workspace.type.collect');
        default:
            return (0, Localize_1.translateLocal)('workspace.type.free');
    }
}
function isPolicyAccessible(policy) {
    return (!(0, EmptyObject_1.isEmptyObject)(policy) && (Object.keys(policy).length !== 1 || (0, EmptyObject_1.isEmptyObject)(policy.errors)) && !!(policy === null || policy === void 0 ? void 0 : policy.id) && (policy === null || policy === void 0 ? void 0 : policy.pendingAction) !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
}
function areAllGroupPoliciesExpenseChatDisabled(policies) {
    if (policies === void 0) { policies = allPolicies; }
    var groupPolicies = Object.values(policies !== null && policies !== void 0 ? policies : {}).filter(function (policy) { return isPaidGroupPolicy(policy); });
    if (groupPolicies.length === 0) {
        return false;
    }
    return !groupPolicies.some(function (policy) { return !!(policy === null || policy === void 0 ? void 0 : policy.isPolicyExpenseChatEnabled); });
}
function getGroupPaidPoliciesWithExpenseChatEnabled(policies) {
    if (policies === void 0) { policies = allPolicies; }
    if ((0, EmptyObject_1.isEmptyObject)(policies)) {
        return CONST_1.default.EMPTY_ARRAY;
    }
    return Object.values(policies).filter(function (policy) { return isPaidGroupPolicy(policy) && (policy === null || policy === void 0 ? void 0 : policy.isPolicyExpenseChatEnabled); });
}
// eslint-disable-next-line rulesdir/no-negated-variables
function shouldDisplayPolicyNotFoundPage(policyID) {
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    if (!policy) {
        return false;
    }
    return !isPolicyAccessible(policy) && !isLoadingReportData;
}
function hasOtherControlWorkspaces(currentPolicyID) {
    var otherControlWorkspaces = Object.values(allPolicies !== null && allPolicies !== void 0 ? allPolicies : {}).filter(function (policy) { return (policy === null || policy === void 0 ? void 0 : policy.id) !== currentPolicyID && isPolicyAdmin(policy) && isControlPolicy(policy); });
    return otherControlWorkspaces.length > 0;
}
// If no policyID is provided, it indicates the workspace upgrade/downgrade URL
// is being accessed from the Subscriptions page without a specific policyID.
// In this case, check if the user is an admin on more than one policy.
// If the user is an admin for multiple policies, we can render the page as it contains a condition
// to navigate them to the Workspaces page when no policyID is provided, instead of showing the Upgrade/Downgrade button.
// If the user is not an admin for multiple policies, they are not allowed to perform this action, and the NotFoundPage is displayed.
function canModifyPlan(policyID) {
    var currentUserAccountID = (0, Report_1.getCurrentUserAccountID)();
    var ownerPolicies = getOwnedPaidPolicies(allPolicies, currentUserAccountID);
    if (!policyID) {
        return ownerPolicies.length > 1;
    }
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    return !!policy && isPolicyAdmin(policy);
}
function getAdminsPrivateEmailDomains(policy) {
    var _a;
    if (!policy) {
        return [];
    }
    var adminDomains = Object.entries((_a = policy.employeeList) !== null && _a !== void 0 ? _a : {}).reduce(function (domains, _a) {
        var email = _a[0], employee = _a[1];
        if (employee.role !== CONST_1.default.POLICY.ROLE.ADMIN) {
            return domains;
        }
        domains.push(expensify_common_1.Str.extractEmailDomain(email).toLowerCase());
        return domains;
    }, []);
    var ownerDomains = policy.owner ? [expensify_common_1.Str.extractEmailDomain(policy.owner).toLowerCase()] : [];
    var privateDomains = __spreadArray([], new Set(adminDomains.concat(ownerDomains)), true).filter(function (domain) { return !(0, ValidationUtils_1.isPublicDomain)(domain); });
    // If the policy is not owned by Expensify there is no point in showing the domain for provisioning.
    if (!isExpensifyTeam(policy.owner)) {
        return privateDomains.filter(function (domain) { return domain !== CONST_1.default.EXPENSIFY_PARTNER_NAME && domain !== CONST_1.default.EMAIL.GUIDES_DOMAIN; });
    }
    return privateDomains;
}
/**
 * Determines the most frequent domain from the `acceptedDomains` list
 * that appears in the email addresses of policy members.
 *
 * @param acceptedDomains - List of domains to consider.
 * @param policy - The policy object.
 */
function getMostFrequentEmailDomain(acceptedDomains, policy) {
    var _a;
    if (!policy) {
        return undefined;
    }
    var domainOccurrences = {};
    Object.keys((_a = policy.employeeList) !== null && _a !== void 0 ? _a : {})
        .concat(policy.owner)
        .map(function (email) { return expensify_common_1.Str.extractEmailDomain(email).toLowerCase(); })
        .forEach(function (memberDomain) {
        if (!acceptedDomains.includes(memberDomain)) {
            return;
        }
        domainOccurrences[memberDomain] = (domainOccurrences[memberDomain] || 0) + 1;
    });
    var mostFrequent = { domain: '', count: 0 };
    Object.entries(domainOccurrences).forEach(function (_a) {
        var domain = _a[0], count = _a[1];
        if (count <= mostFrequent.count) {
            return;
        }
        mostFrequent = { domain: domain, count: count };
    });
    if (mostFrequent.count === 0) {
        return undefined;
    }
    return mostFrequent.domain;
}
var getDescriptionForPolicyDomainCard = function (domainName) {
    var _a, _b;
    // A domain name containing a policyID indicates that this is a workspace feed
    var policyID = (_a = domainName.match(CONST_1.default.REGEX.EXPENSIFY_POLICY_DOMAIN_NAME)) === null || _a === void 0 ? void 0 : _a[1];
    if (policyID) {
        // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
        // eslint-disable-next-line deprecation/deprecation
        var policy = getPolicy(policyID.toUpperCase());
        return (_b = policy === null || policy === void 0 ? void 0 : policy.name) !== null && _b !== void 0 ? _b : domainName;
    }
    return domainName;
};
exports.getDescriptionForPolicyDomainCard = getDescriptionForPolicyDomainCard;
function isPreferredExporter(policy) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
    var user = (0, Report_1.getCurrentUserEmail)();
    var exporters = [
        (_d = (_c = (_b = (_a = policy.connections) === null || _a === void 0 ? void 0 : _a.intacct) === null || _b === void 0 ? void 0 : _b.config) === null || _c === void 0 ? void 0 : _c.export) === null || _d === void 0 ? void 0 : _d.exporter,
        (_h = (_g = (_f = (_e = policy.connections) === null || _e === void 0 ? void 0 : _e.netsuite) === null || _f === void 0 ? void 0 : _f.options) === null || _g === void 0 ? void 0 : _g.config) === null || _h === void 0 ? void 0 : _h.exporter,
        (_m = (_l = (_k = (_j = policy.connections) === null || _j === void 0 ? void 0 : _j.quickbooksDesktop) === null || _k === void 0 ? void 0 : _k.config) === null || _l === void 0 ? void 0 : _l.export) === null || _m === void 0 ? void 0 : _m.exporter,
        (_r = (_q = (_p = (_o = policy.connections) === null || _o === void 0 ? void 0 : _o.quickbooksOnline) === null || _p === void 0 ? void 0 : _p.config) === null || _q === void 0 ? void 0 : _q.export) === null || _r === void 0 ? void 0 : _r.exporter,
        (_v = (_u = (_t = (_s = policy.connections) === null || _s === void 0 ? void 0 : _s.xero) === null || _t === void 0 ? void 0 : _t.config) === null || _u === void 0 ? void 0 : _u.export) === null || _v === void 0 ? void 0 : _v.exporter,
    ];
    return exporters.some(function (exporter) { return exporter && exporter === user; });
}
/**
 * Checks if the user is invited to any workspace.
 */
function isUserInvitedToWorkspace() {
    var currentUserAccountID = (0, Report_1.getCurrentUserAccountID)();
    return Object.values(allPolicies !== null && allPolicies !== void 0 ? allPolicies : {}).some(function (policy) { return (policy === null || policy === void 0 ? void 0 : policy.ownerAccountID) !== currentUserAccountID && (policy === null || policy === void 0 ? void 0 : policy.isPolicyExpenseChatEnabled) && (policy === null || policy === void 0 ? void 0 : policy.id) && policy.id !== CONST_1.default.POLICY.ID_FAKE; });
}
