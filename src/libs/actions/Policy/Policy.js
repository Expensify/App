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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
exports.leaveWorkspace = leaveWorkspace;
exports.addBillingCardAndRequestPolicyOwnerChange = addBillingCardAndRequestPolicyOwnerChange;
exports.hasActiveChatEnabledPolicies = hasActiveChatEnabledPolicies;
exports.setWorkspaceErrors = setWorkspaceErrors;
exports.hideWorkspaceAlertMessage = hideWorkspaceAlertMessage;
exports.deleteWorkspace = deleteWorkspace;
exports.updateAddress = updateAddress;
exports.updateLastAccessedWorkspace = updateLastAccessedWorkspace;
exports.clearDeleteWorkspaceError = clearDeleteWorkspaceError;
exports.setWorkspaceDefaultSpendCategory = setWorkspaceDefaultSpendCategory;
exports.generateDefaultWorkspaceName = generateDefaultWorkspaceName;
exports.updateGeneralSettings = updateGeneralSettings;
exports.deleteWorkspaceAvatar = deleteWorkspaceAvatar;
exports.updateWorkspaceAvatar = updateWorkspaceAvatar;
exports.clearAvatarErrors = clearAvatarErrors;
exports.generatePolicyID = generatePolicyID;
exports.createWorkspace = createWorkspace;
exports.openPolicyTaxesPage = openPolicyTaxesPage;
exports.openWorkspaceInvitePage = openWorkspaceInvitePage;
exports.openWorkspace = openWorkspace;
exports.removeWorkspace = removeWorkspace;
exports.createWorkspaceFromIOUPayment = createWorkspaceFromIOUPayment;
exports.clearErrors = clearErrors;
exports.dismissAddedWithPrimaryLoginMessages = dismissAddedWithPrimaryLoginMessages;
exports.openDraftWorkspaceRequest = openDraftWorkspaceRequest;
exports.createDraftInitialWorkspace = createDraftInitialWorkspace;
exports.buildOptimisticRecentlyUsedCurrencies = buildOptimisticRecentlyUsedCurrencies;
exports.setWorkspaceInviteMessageDraft = setWorkspaceInviteMessageDraft;
exports.setWorkspaceApprovalMode = setWorkspaceApprovalMode;
exports.setWorkspaceAutoReportingFrequency = setWorkspaceAutoReportingFrequency;
exports.setWorkspaceAutoReportingMonthlyOffset = setWorkspaceAutoReportingMonthlyOffset;
exports.updateWorkspaceDescription = updateWorkspaceDescription;
exports.setWorkspacePayer = setWorkspacePayer;
exports.setWorkspaceReimbursement = setWorkspaceReimbursement;
exports.openPolicyWorkflowsPage = openPolicyWorkflowsPage;
exports.enableCompanyCards = enableCompanyCards;
exports.enablePolicyConnections = enablePolicyConnections;
exports.enablePolicyReportFields = enablePolicyReportFields;
exports.enablePolicyTaxes = enablePolicyTaxes;
exports.enablePolicyWorkflows = enablePolicyWorkflows;
exports.enableDistanceRequestTax = enableDistanceRequestTax;
exports.enablePolicyInvoicing = enablePolicyInvoicing;
exports.openPolicyMoreFeaturesPage = openPolicyMoreFeaturesPage;
exports.openPolicyProfilePage = openPolicyProfilePage;
exports.openPolicyInitialPage = openPolicyInitialPage;
exports.generateCustomUnitID = generateCustomUnitID;
exports.clearQBOErrorField = clearQBOErrorField;
exports.clearXeroErrorField = clearXeroErrorField;
exports.clearSageIntacctErrorField = clearSageIntacctErrorField;
exports.clearNetSuiteErrorField = clearNetSuiteErrorField;
exports.clearNetSuitePendingField = clearNetSuitePendingField;
exports.clearNetSuiteAutoSyncErrorField = clearNetSuiteAutoSyncErrorField;
exports.removeNetSuiteCustomFieldByIndex = removeNetSuiteCustomFieldByIndex;
exports.setWorkspaceCurrencyDefault = setWorkspaceCurrencyDefault;
exports.setForeignCurrencyDefault = setForeignCurrencyDefault;
exports.setPolicyCustomTaxName = setPolicyCustomTaxName;
exports.clearPolicyErrorField = clearPolicyErrorField;
exports.isCurrencySupportedForDirectReimbursement = isCurrencySupportedForDirectReimbursement;
exports.isCurrencySupportedForGlobalReimbursement = isCurrencySupportedForGlobalReimbursement;
exports.getInvoicePrimaryWorkspace = getInvoicePrimaryWorkspace;
exports.createDraftWorkspace = createDraftWorkspace;
exports.savePreferredExportMethod = savePreferredExportMethod;
exports.buildPolicyData = buildPolicyData;
exports.enableExpensifyCard = enableExpensifyCard;
exports.createPolicyExpenseChats = createPolicyExpenseChats;
exports.upgradeToCorporate = upgradeToCorporate;
exports.openPolicyExpensifyCardsPage = openPolicyExpensifyCardsPage;
exports.updateMemberCustomField = updateMemberCustomField;
exports.openPolicyEditCardLimitTypePage = openPolicyEditCardLimitTypePage;
exports.requestExpensifyCardLimitIncrease = requestExpensifyCardLimitIncrease;
exports.getAdminPolicies = getAdminPolicies;
exports.getAdminPoliciesConnectedToNetSuite = getAdminPoliciesConnectedToNetSuite;
exports.getAdminPoliciesConnectedToSageIntacct = getAdminPoliciesConnectedToSageIntacct;
exports.hasInvoicingDetails = hasInvoicingDetails;
exports.clearAllPolicies = clearAllPolicies;
exports.enablePolicyRules = enablePolicyRules;
exports.setPolicyDefaultReportTitle = setPolicyDefaultReportTitle;
exports.clearQBDErrorField = clearQBDErrorField;
exports.setPolicyPreventMemberCreatedTitle = setPolicyPreventMemberCreatedTitle;
exports.setPolicyPreventSelfApproval = setPolicyPreventSelfApproval;
exports.setPolicyAutomaticApprovalLimit = setPolicyAutomaticApprovalLimit;
exports.setPolicyAutomaticApprovalRate = setPolicyAutomaticApprovalRate;
exports.setPolicyAutoReimbursementLimit = setPolicyAutoReimbursementLimit;
exports.enablePolicyAutoReimbursementLimit = enablePolicyAutoReimbursementLimit;
exports.enableAutoApprovalOptions = enableAutoApprovalOptions;
exports.setPolicyMaxExpenseAmountNoReceipt = setPolicyMaxExpenseAmountNoReceipt;
exports.setPolicyMaxExpenseAmount = setPolicyMaxExpenseAmount;
exports.setPolicyMaxExpenseAge = setPolicyMaxExpenseAge;
exports.updateCustomRules = updateCustomRules;
exports.setPolicyProhibitedExpense = setPolicyProhibitedExpense;
exports.setPolicyBillableMode = setPolicyBillableMode;
exports.disableWorkspaceBillableExpenses = disableWorkspaceBillableExpenses;
exports.setWorkspaceEReceiptsEnabled = setWorkspaceEReceiptsEnabled;
exports.verifySetupIntentAndRequestPolicyOwnerChange = verifySetupIntentAndRequestPolicyOwnerChange;
exports.updateInvoiceCompanyName = updateInvoiceCompanyName;
exports.updateInvoiceCompanyWebsite = updateInvoiceCompanyWebsite;
exports.updateDefaultPolicy = updateDefaultPolicy;
exports.downgradeToTeam = downgradeToTeam;
exports.getAccessiblePolicies = getAccessiblePolicies;
exports.clearGetAccessiblePoliciesErrors = clearGetAccessiblePoliciesErrors;
exports.calculateBillNewDot = calculateBillNewDot;
exports.payAndDowngrade = payAndDowngrade;
exports.clearBillingReceiptDetailsErrors = clearBillingReceiptDetailsErrors;
exports.clearQuickbooksOnlineAutoSyncErrorField = clearQuickbooksOnlineAutoSyncErrorField;
exports.setIsForcedToChangeCurrency = setIsForcedToChangeCurrency;
exports.setIsComingFromGlobalReimbursementsFlow = setIsComingFromGlobalReimbursementsFlow;
exports.setPolicyAttendeeTrackingEnabled = setPolicyAttendeeTrackingEnabled;
var expensify_common_1 = require("expensify-common");
var escapeRegExp_1 = require("lodash/escapeRegExp");
var union_1 = require("lodash/union");
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var CurrencyUtils = require("@libs/CurrencyUtils");
var DateUtils_1 = require("@libs/DateUtils");
var ErrorUtils = require("@libs/ErrorUtils");
var FileUtils_1 = require("@libs/fileDownload/FileUtils");
var getIsNarrowLayout_1 = require("@libs/getIsNarrowLayout");
var GoogleTagManager_1 = require("@libs/GoogleTagManager");
var Localize_1 = require("@libs/Localize");
var Log_1 = require("@libs/Log");
var NetworkStore = require("@libs/Network/NetworkStore");
var NumberUtils = require("@libs/NumberUtils");
var PersonalDetailsUtils = require("@libs/PersonalDetailsUtils");
var PhoneNumber = require("@libs/PhoneNumber");
var PolicyUtils = require("@libs/PolicyUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils = require("@libs/ReportUtils");
var PaymentMethods = require("@userActions/PaymentMethods");
var PersistedRequests = require("@userActions/PersistedRequests");
var Task_1 = require("@userActions/Task");
var OnboardingFlow_1 = require("@userActions/Welcome/OnboardingFlow");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var Category_1 = require("./Category");
var allPolicies = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.POLICY,
    callback: function (val, key) {
        if (!key) {
            return;
        }
        if (val === null || val === undefined) {
            // If we are deleting a policy, we have to check every report linked to that policy
            // and unset the draft indicator (pencil icon) alongside removing any draft comments. Clearing these values will keep the newly archived chats from being displayed in the LHN.
            // More info: https://github.com/Expensify/App/issues/14260
            var policyID = key.replace(ONYXKEYS_1.default.COLLECTION.POLICY, '');
            var policyReports = ReportUtils.getAllPolicyReports(policyID);
            var cleanUpMergeQueries = {};
            var cleanUpSetQueries_1 = {};
            policyReports.forEach(function (policyReport) {
                if (!policyReport) {
                    return;
                }
                var reportID = policyReport.reportID;
                cleanUpSetQueries_1["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT_COMMENT).concat(reportID)] = null;
                cleanUpSetQueries_1["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_DRAFTS).concat(reportID)] = null;
            });
            react_native_onyx_1.default.mergeCollection(ONYXKEYS_1.default.COLLECTION.REPORT, cleanUpMergeQueries);
            react_native_onyx_1.default.multiSet(cleanUpSetQueries_1);
            delete allPolicies[key];
            return;
        }
        allPolicies[key] = val;
    },
});
var lastAccessedWorkspacePolicyID;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.LAST_ACCESSED_WORKSPACE_POLICY_ID,
    callback: function (value) { return (lastAccessedWorkspacePolicyID = value); },
});
var allReports;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: function (value) {
        allReports = value;
    },
});
var allReportActions;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: function (actions) {
        allReportActions = actions;
    },
});
var sessionEmail = '';
var sessionAccountID = 0;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.SESSION,
    callback: function (val) {
        var _a, _b;
        sessionEmail = (_a = val === null || val === void 0 ? void 0 : val.email) !== null && _a !== void 0 ? _a : '';
        sessionAccountID = (_b = val === null || val === void 0 ? void 0 : val.accountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
    },
});
var allPersonalDetails;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
    callback: function (val) { return (allPersonalDetails = val); },
});
var reimbursementAccount;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
    callback: function (val) { return (reimbursementAccount = val); },
});
var allRecentlyUsedCurrencies;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.RECENTLY_USED_CURRENCIES,
    callback: function (val) { return (allRecentlyUsedCurrencies = val !== null && val !== void 0 ? val : []); },
});
var activePolicyID;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID,
    callback: function (value) { return (activePolicyID = value); },
});
var allTransactionViolations = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS,
    waitForCollectionCallback: true,
    callback: function (value) { return (allTransactionViolations = value); },
});
var introSelected;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_INTRO_SELECTED,
    callback: function (value) { return (introSelected = value); },
});
/**
 * Stores in Onyx the policy ID of the last workspace that was accessed by the user
 */
function updateLastAccessedWorkspace(policyID) {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.LAST_ACCESSED_WORKSPACE_POLICY_ID, policyID !== null && policyID !== void 0 ? policyID : null);
}
/**
 * Checks if the currency is supported for direct reimbursement
 * USD currency is the only one supported in NewDot for now
 */
function isCurrencySupportedForDirectReimbursement(currency) {
    return currency === CONST_1.default.CURRENCY.USD;
}
/**
 * Checks if the currency is supported for global reimbursement
 */
function isCurrencySupportedForGlobalReimbursement(currency, canUseGlobalReimbursementsOnND) {
    return canUseGlobalReimbursementsOnND ? CONST_1.default.DIRECT_REIMBURSEMENT_CURRENCIES.includes(currency) : currency === CONST_1.default.CURRENCY.USD;
}
/**
 * Returns the policy of the report
 * @deprecated Get the data straight from Onyx - This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
 */
function getPolicy(policyID) {
    if (!allPolicies || !policyID) {
        return undefined;
    }
    return allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)];
}
/** Check if the policy has invoicing company details */
function hasInvoicingDetails(policy) {
    var _a, _b;
    return !!((_a = policy === null || policy === void 0 ? void 0 : policy.invoice) === null || _a === void 0 ? void 0 : _a.companyName) && !!((_b = policy === null || policy === void 0 ? void 0 : policy.invoice) === null || _b === void 0 ? void 0 : _b.companyWebsite);
}
/**
 * Returns a primary invoice workspace for the user
 */
function getInvoicePrimaryWorkspace(currentUserLogin) {
    if (PolicyUtils.canSendInvoiceFromWorkspace(activePolicyID)) {
        return allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(activePolicyID)];
    }
    var activeAdminWorkspaces = PolicyUtils.getActiveAdminWorkspaces(allPolicies, currentUserLogin);
    return activeAdminWorkspaces.find(function (policy) { return PolicyUtils.canSendInvoiceFromWorkspace(policy.id); });
}
/**
 * Check if the user has any active free policies (aka workspaces)
 */
function hasActiveChatEnabledPolicies(policies, includeOnlyAdminPolicies) {
    if (includeOnlyAdminPolicies === void 0) { includeOnlyAdminPolicies = false; }
    var chatEnabledPolicies = Object.values(policies !== null && policies !== void 0 ? policies : {}).filter(function (policy) { return (policy === null || policy === void 0 ? void 0 : policy.isPolicyExpenseChatEnabled) && (!includeOnlyAdminPolicies || policy.role === CONST_1.default.POLICY.ROLE.ADMIN); });
    if (chatEnabledPolicies.length === 0) {
        return false;
    }
    if (chatEnabledPolicies.some(function (policy) { return !(policy === null || policy === void 0 ? void 0 : policy.pendingAction); })) {
        return true;
    }
    if (chatEnabledPolicies.some(function (policy) { return (policy === null || policy === void 0 ? void 0 : policy.pendingAction) === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD; })) {
        return true;
    }
    if (chatEnabledPolicies.some(function (policy) { return (policy === null || policy === void 0 ? void 0 : policy.pendingAction) === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE; })) {
        return false;
    }
    // If there are no add or delete pending actions the only option left is an update
    // pendingAction, in which case we should return true.
    return true;
}
/**
 * Delete the workspace
 */
function deleteWorkspace(policyID, policyName) {
    var _a;
    if (!allPolicies) {
        return;
    }
    var filteredPolicies = Object.values(allPolicies).filter(function (policy) { return (policy === null || policy === void 0 ? void 0 : policy.id) !== policyID; });
    var optimisticData = __spreadArray([
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                avatarURL: '',
                pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                errors: null,
            },
        }
    ], (!hasActiveChatEnabledPolicies(filteredPolicies, true)
        ? [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: {
                    errors: null,
                },
            },
        ]
        : []), true);
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    // Restore the old report stateNum and statusNum
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
            value: {
                errors: (_a = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.errors) !== null && _a !== void 0 ? _a : null,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                avatarURL: policy === null || policy === void 0 ? void 0 : policy.avatarURL,
                pendingAction: null,
            },
        },
    ];
    var reportsToArchive = Object.values(allReports !== null && allReports !== void 0 ? allReports : {}).filter(function (report) { return ReportUtils.isPolicyRelatedReport(report, policyID) && (ReportUtils.isChatRoom(report) || ReportUtils.isPolicyExpenseChat(report) || ReportUtils.isTaskReport(report)); });
    var finallyData = [];
    var currentTime = DateUtils_1.default.getDBTime();
    reportsToArchive.forEach(function (report) {
        var _a, _b;
        var _c, _d, _e;
        var _f = report !== null && report !== void 0 ? report : {}, reportID = _f.reportID, ownerAccountID = _f.ownerAccountID, oldPolicyName = _f.oldPolicyName;
        var isInvoiceReceiverReport = (report === null || report === void 0 ? void 0 : report.invoiceReceiver) && 'policyID' in report.invoiceReceiver && report.invoiceReceiver.policyID === policyID;
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: __assign(__assign({}, (!isInvoiceReceiverReport && {
                oldPolicyName: (_c = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)]) === null || _c === void 0 ? void 0 : _c.name,
                policyName: '',
            })), { isPinned: false }),
        });
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(reportID),
            value: {
                private_isArchived: currentTime,
            },
        });
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_DRAFTS).concat(reportID),
            value: null,
        });
        // Add closed actions to all chat reports linked to this policy
        // Announce & admin chats have FAKE owners, but expense chats w/ users do have owners.
        var emailClosingReport = CONST_1.default.POLICY.OWNER_EMAIL_FAKE;
        if (!!ownerAccountID && ownerAccountID !== CONST_1.default.POLICY.OWNER_ACCOUNT_ID_FAKE) {
            emailClosingReport = (_e = (_d = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[ownerAccountID]) === null || _d === void 0 ? void 0 : _d.login) !== null && _e !== void 0 ? _e : '';
        }
        var optimisticClosedReportAction = ReportUtils.buildOptimisticClosedReportAction(emailClosingReport, policyName, CONST_1.default.REPORT.ARCHIVE_REASON.POLICY_DELETED);
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_a = {},
                _a[optimisticClosedReportAction.reportActionID] = optimisticClosedReportAction,
                _a),
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                oldPolicyName: oldPolicyName,
                policyName: report === null || report === void 0 ? void 0 : report.policyName,
                isPinned: report === null || report === void 0 ? void 0 : report.isPinned,
            },
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(reportID),
            value: {
                private_isArchived: null,
            },
        });
        // We are temporarily adding this workaround because 'DeleteWorkspace' doesn't
        // support receiving the optimistic reportActions' ids for the moment.
        finallyData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_b = {},
                _b[optimisticClosedReportAction.reportActionID] = null,
                _b),
        });
        if (report === null || report === void 0 ? void 0 : report.iouReportID) {
            var reportTransactions = ReportUtils.getReportTransactions(report.iouReportID);
            for (var _i = 0, reportTransactions_1 = reportTransactions; _i < reportTransactions_1.length; _i++) {
                var transaction = reportTransactions_1[_i];
                var violations = allTransactionViolations === null || allTransactionViolations === void 0 ? void 0 : allTransactionViolations["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transaction.transactionID)];
                optimisticData.push({
                    onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                    key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transaction.transactionID),
                    value: violations === null || violations === void 0 ? void 0 : violations.filter(function (violation) { return violation.type !== CONST_1.default.VIOLATION_TYPES.VIOLATION; }),
                });
                failureData.push({
                    onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                    key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID),
                    value: violations,
                });
            }
        }
    });
    var params = { policyID: policyID };
    API.write(types_1.WRITE_COMMANDS.DELETE_WORKSPACE, params, { optimisticData: optimisticData, finallyData: finallyData, failureData: failureData });
    // Reset the lastAccessedWorkspacePolicyID
    if (policyID === lastAccessedWorkspacePolicyID) {
        updateLastAccessedWorkspace(undefined);
    }
}
function setWorkspaceAutoReportingFrequency(policyID, frequency) {
    var _a, _b;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var wasPolicyOnManualReporting = PolicyUtils.getCorrectedAutoReportingFrequency(policy) === CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: __assign(__assign({ 
                // Recall that the "daily" and "manual" frequencies don't actually exist in Onyx or the DB (see PolicyUtils.getCorrectedAutoReportingFrequency)
                autoReportingFrequency: frequency === CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL ? CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE : frequency, pendingFields: { autoReportingFrequency: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE } }, (frequency === CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL && {
                harvesting: {
                    enabled: false,
                },
            })), (wasPolicyOnManualReporting &&
                frequency !== CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL && {
                harvesting: {
                    enabled: true,
                },
            })),
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                autoReportingFrequency: (_a = policy === null || policy === void 0 ? void 0 : policy.autoReportingFrequency) !== null && _a !== void 0 ? _a : null,
                harvesting: (_b = policy === null || policy === void 0 ? void 0 : policy.harvesting) !== null && _b !== void 0 ? _b : null,
                pendingFields: { autoReportingFrequency: null },
                errorFields: { autoReportingFrequency: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workflowsDelayedSubmissionPage.autoReportingFrequencyErrorMessage') },
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                pendingFields: { autoReportingFrequency: null },
            },
        },
    ];
    var params = { policyID: policyID, frequency: frequency };
    API.write(types_1.WRITE_COMMANDS.SET_WORKSPACE_AUTO_REPORTING_FREQUENCY, params, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function setWorkspaceAutoReportingMonthlyOffset(policyID, autoReportingOffset) {
    var _a;
    var value = JSON.stringify({ autoReportingOffset: autoReportingOffset });
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                autoReportingOffset: autoReportingOffset,
                pendingFields: { autoReportingOffset: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                autoReportingOffset: (_a = policy === null || policy === void 0 ? void 0 : policy.autoReportingOffset) !== null && _a !== void 0 ? _a : null,
                pendingFields: { autoReportingOffset: null },
                errorFields: { autoReportingOffset: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workflowsDelayedSubmissionPage.monthlyOffsetErrorMessage') },
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                pendingFields: { autoReportingOffset: null },
            },
        },
    ];
    var params = { policyID: policyID, value: value };
    API.write(types_1.WRITE_COMMANDS.SET_WORKSPACE_AUTO_REPORTING_MONTHLY_OFFSET, params, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function setWorkspaceApprovalMode(policyID, approver, approvalMode) {
    var _a;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var updatedEmployeeList = {};
    if (approvalMode === CONST_1.default.POLICY.APPROVAL_MODE.OPTIONAL) {
        Object.keys((_a = policy === null || policy === void 0 ? void 0 : policy.employeeList) !== null && _a !== void 0 ? _a : {}).forEach(function (employee) {
            var _a;
            updatedEmployeeList[employee] = __assign(__assign({}, (_a = policy === null || policy === void 0 ? void 0 : policy.employeeList) === null || _a === void 0 ? void 0 : _a[employee]), { submitsTo: approver, forwardsTo: '' });
        });
    }
    var value = {
        approver: approver,
        approvalMode: approvalMode,
    };
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: __assign(__assign({}, value), { pendingFields: { approvalMode: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE }, employeeList: approvalMode === CONST_1.default.POLICY.APPROVAL_MODE.OPTIONAL ? updatedEmployeeList : policy === null || policy === void 0 ? void 0 : policy.employeeList }),
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                approver: policy === null || policy === void 0 ? void 0 : policy.approver,
                approvalMode: policy === null || policy === void 0 ? void 0 : policy.approvalMode,
                pendingFields: { approvalMode: null },
                errorFields: { approvalMode: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workflowsApproverPage.genericErrorMessage') },
                employeeList: policy === null || policy === void 0 ? void 0 : policy.employeeList,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                pendingFields: { approvalMode: null },
            },
        },
    ];
    var params = {
        policyID: policyID,
        value: JSON.stringify(__assign(__assign({}, value), { 
            // This property should now be set to false for all Collect policies
            isAutoApprovalEnabled: false })),
    };
    API.write(types_1.WRITE_COMMANDS.SET_WORKSPACE_APPROVAL_MODE, params, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function setWorkspacePayer(policyID, reimburserEmail) {
    var _a, _b;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                reimburser: reimburserEmail,
                achAccount: { reimburser: reimburserEmail },
                errorFields: { reimburser: null },
                pendingFields: { reimburser: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE },
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                errorFields: { reimburser: null },
                pendingFields: { reimburser: null },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                achAccount: { reimburser: (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.achAccount) === null || _a === void 0 ? void 0 : _a.reimburser) !== null && _b !== void 0 ? _b : null },
                errorFields: { reimburser: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workflowsPayerPage.genericErrorMessage') },
                pendingFields: { reimburser: null },
            },
        },
    ];
    var params = { policyID: policyID, reimburserEmail: reimburserEmail };
    API.write(types_1.WRITE_COMMANDS.SET_WORKSPACE_PAYER, params, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function clearPolicyErrorField(policyID, fieldName) {
    var _a;
    if (!policyID) {
        return;
    }
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { errorFields: (_a = {}, _a[fieldName] = null, _a) });
}
function clearQBOErrorField(policyID, fieldName) {
    var _a;
    if (!policyID) {
        return;
    }
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { connections: { quickbooksOnline: { config: { errorFields: (_a = {}, _a[fieldName] = null, _a) } } } });
}
function clearQBDErrorField(policyID, fieldName) {
    var _a;
    if (!policyID) {
        return;
    }
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { connections: { quickbooksDesktop: { config: { errorFields: (_a = {}, _a[fieldName] = null, _a) } } } });
}
function clearXeroErrorField(policyID, fieldName) {
    var _a;
    if (!policyID) {
        return;
    }
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { connections: { xero: { config: { errorFields: (_a = {}, _a[fieldName] = null, _a) } } } });
}
function clearNetSuiteErrorField(policyID, fieldName) {
    var _a;
    if (!policyID) {
        return;
    }
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { connections: { netsuite: { options: { config: { errorFields: (_a = {}, _a[fieldName] = null, _a) } } } } });
}
function clearNetSuitePendingField(policyID, fieldName) {
    var _a;
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { connections: { netsuite: { options: { config: { pendingFields: (_a = {}, _a[fieldName] = null, _a) } } } } });
}
function removeNetSuiteCustomFieldByIndex(allRecords, policyID, importCustomField, valueIndex) {
    var _a;
    // We allow multiple custom list records with the same internalID. Hence it is safe to remove by index.
    var filteredRecords = allRecords.filter(function (_, index) { return index !== Number(valueIndex); });
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
        connections: {
            netsuite: {
                options: {
                    config: {
                        syncOptions: (_a = {},
                            _a[importCustomField] = filteredRecords,
                            _a),
                    },
                },
            },
        },
    });
}
function clearSageIntacctErrorField(policyID, fieldName) {
    var _a;
    if (!policyID) {
        return;
    }
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { connections: { intacct: { config: { errorFields: (_a = {}, _a[fieldName] = null, _a) } } } });
}
function clearNetSuiteAutoSyncErrorField(policyID) {
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { connections: { netsuite: { config: { errorFields: { autoSync: null } } } } });
}
function clearQuickbooksOnlineAutoSyncErrorField(policyID) {
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { connections: { quickbooksOnline: { config: { errorFields: { autoSync: null } } } } });
}
function setWorkspaceReimbursement(policyID, reimbursementChoice, reimburserEmail) {
    var _a, _b, _c;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                reimbursementChoice: reimbursementChoice,
                isLoadingWorkspaceReimbursement: true,
                reimburser: reimburserEmail,
                achAccount: { reimburser: reimburserEmail },
                errorFields: { reimbursementChoice: null },
                pendingFields: { reimbursementChoice: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE },
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                isLoadingWorkspaceReimbursement: false,
                errorFields: { reimbursementChoice: null },
                pendingFields: { reimbursementChoice: null },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                isLoadingWorkspaceReimbursement: false,
                reimbursementChoice: (_a = policy === null || policy === void 0 ? void 0 : policy.reimbursementChoice) !== null && _a !== void 0 ? _a : null,
                achAccount: { reimburser: (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.achAccount) === null || _b === void 0 ? void 0 : _b.reimburser) !== null && _c !== void 0 ? _c : null },
                errorFields: { reimbursementChoice: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage') },
                pendingFields: { reimbursementChoice: null },
            },
        },
    ];
    var params = { policyID: policyID, reimbursementChoice: reimbursementChoice };
    API.write(types_1.WRITE_COMMANDS.SET_WORKSPACE_REIMBURSEMENT, params, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function leaveWorkspace(policyID) {
    var _a, _b;
    var _c;
    if (!policyID) {
        return;
    }
    var policy = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)];
    var workspaceChats = ReportUtils.getAllWorkspaceReports(policyID);
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                employeeList: (_a = {},
                    _a[sessionEmail] = {
                        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    },
                    _a),
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: null,
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                pendingAction: (_c = policy === null || policy === void 0 ? void 0 : policy.pendingAction) !== null && _c !== void 0 ? _c : null,
                employeeList: (_b = {},
                    _b[sessionEmail] = {
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.people.error.genericRemove'),
                    },
                    _b),
            },
        },
    ];
    var pendingChatMembers = ReportUtils.getPendingChatMembers([sessionAccountID], [], CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    workspaceChats.forEach(function (report) {
        var _a;
        var parentReport = ReportUtils.getRootParentReport({ report: report });
        var reportToCheckOwner = (0, EmptyObject_1.isEmptyObject)(parentReport) ? report : parentReport;
        if (ReportUtils.isPolicyExpenseChat(report) && !ReportUtils.isReportOwner(reportToCheckOwner)) {
            return;
        }
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report === null || report === void 0 ? void 0 : report.reportID),
            value: {
                statusNum: CONST_1.default.REPORT.STATUS_NUM.CLOSED,
                stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED,
                oldPolicyName: (_a = policy === null || policy === void 0 ? void 0 : policy.name) !== null && _a !== void 0 ? _a : '',
            },
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(report === null || report === void 0 ? void 0 : report.reportID),
            value: {
                pendingChatMembers: pendingChatMembers,
            },
        });
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(report === null || report === void 0 ? void 0 : report.reportID),
            value: {
                pendingChatMembers: null,
            },
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(report === null || report === void 0 ? void 0 : report.reportID),
            value: {
                pendingChatMembers: null,
            },
        });
    });
    var params = {
        policyID: policyID,
        email: sessionEmail,
    };
    API.write(types_1.WRITE_COMMANDS.LEAVE_POLICY, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function updateDefaultPolicy(newPolicyID, oldPolicyID) {
    if (!newPolicyID) {
        return;
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID,
            value: newPolicyID,
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID,
            value: oldPolicyID,
        },
    ];
    var parameters = {
        name: ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID,
        value: newPolicyID,
    };
    API.write(types_1.WRITE_COMMANDS.SET_NAME_VALUE_PAIR, parameters, {
        optimisticData: optimisticData,
        failureData: failureData,
    });
}
function addBillingCardAndRequestPolicyOwnerChange(policyID, cardData) {
    if (!policyID) {
        return;
    }
    var cardNumber = cardData.cardNumber, cardYear = cardData.cardYear, cardMonth = cardData.cardMonth, cardCVV = cardData.cardCVV, addressName = cardData.addressName, addressZip = cardData.addressZip, currency = cardData.currency;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                errorFields: null,
                isLoading: true,
                isChangeOwnerSuccessful: false,
                isChangeOwnerFailed: false,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                isLoading: false,
                isChangeOwnerSuccessful: true,
                isChangeOwnerFailed: false,
                owner: sessionEmail,
                ownerAccountID: sessionAccountID,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                isLoading: false,
                isChangeOwnerSuccessful: false,
                isChangeOwnerFailed: true,
            },
        },
    ];
    if (CONST_1.default.SCA_CURRENCIES.has(currency)) {
        var params = {
            cardNumber: cardNumber,
            cardYear: cardYear,
            cardMonth: cardMonth,
            cardCVV: cardCVV,
            addressName: addressName,
            addressZip: addressZip,
            currency: currency,
            isP2PDebitCard: false,
        };
        PaymentMethods.addPaymentCardSCA(params);
    }
    else {
        var params = {
            policyID: policyID,
            cardNumber: cardNumber,
            cardYear: cardYear,
            cardMonth: cardMonth,
            cardCVV: cardCVV,
            addressName: addressName,
            addressZip: addressZip,
            currency: currency,
        };
        // eslint-disable-next-line rulesdir/no-multiple-api-calls
        API.write(types_1.WRITE_COMMANDS.ADD_BILLING_CARD_AND_REQUEST_WORKSPACE_OWNER_CHANGE, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
    }
}
/**
 * Properly updates the nvp_privateStripeCustomerID onyx data for 3DS payment
 *
 */
function verifySetupIntentAndRequestPolicyOwnerChange(policyID) {
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                errorFields: null,
                isLoading: true,
                isChangeOwnerSuccessful: false,
                isChangeOwnerFailed: false,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                isLoading: false,
                isChangeOwnerSuccessful: true,
                isChangeOwnerFailed: false,
                owner: sessionEmail,
                ownerAccountID: sessionAccountID,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                isLoading: false,
                isChangeOwnerSuccessful: false,
                isChangeOwnerFailed: true,
            },
        },
    ];
    API.write(types_1.WRITE_COMMANDS.VERIFY_SETUP_INTENT_AND_REQUEST_POLICY_OWNER_CHANGE, { accountID: sessionAccountID, policyID: policyID }, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
/**
 * Optimistically create a chat for each member of the workspace, creates both optimistic and success data for onyx.
 *
 * @returns - object with onyxSuccessData, onyxOptimisticData, and optimisticReportIDs (map login to reportID)
 */
function createPolicyExpenseChats(policyID, invitedEmailsToAccountIDs, hasOutstandingChildRequest) {
    if (hasOutstandingChildRequest === void 0) { hasOutstandingChildRequest = false; }
    var workspaceMembersChats = {
        onyxSuccessData: [],
        onyxOptimisticData: [],
        onyxFailureData: [],
        reportCreationData: {},
    };
    Object.keys(invitedEmailsToAccountIDs).forEach(function (email) {
        var _a, _b, _c;
        var _d;
        var accountID = invitedEmailsToAccountIDs[email];
        var cleanAccountID = Number(accountID);
        var login = PhoneNumber.addSMSDomainIfPhoneNumber(email);
        var oldChat = ReportUtils.getPolicyExpenseChat(cleanAccountID, policyID);
        // If the chat already exists, we don't want to create a new one - just make sure it's not archived
        if (oldChat) {
            workspaceMembersChats.reportCreationData[login] = {
                reportID: oldChat.reportID,
            };
            workspaceMembersChats.onyxOptimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(oldChat.reportID),
                value: {
                    stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
                },
            });
            workspaceMembersChats.onyxOptimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(oldChat.reportID),
                value: {
                    private_isArchived: false,
                },
            });
            var currentTime_1 = DateUtils_1.default.getDBTime();
            var reportActions = (_d = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(oldChat.reportID)]) !== null && _d !== void 0 ? _d : {};
            Object.values(reportActions).forEach(function (action) {
                if (action.actionName !== CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                    return;
                }
                workspaceMembersChats.onyxOptimisticData.push({
                    onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                    key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(action.childReportID),
                    value: {
                        private_isArchived: null,
                    },
                });
                workspaceMembersChats.onyxFailureData.push({
                    onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                    key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(action.childReportID),
                    value: {
                        private_isArchived: currentTime_1,
                    },
                });
            });
            return;
        }
        var optimisticReport = ReportUtils.buildOptimisticChatReport({
            participantList: [sessionAccountID, cleanAccountID],
            chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            policyID: policyID,
            ownerAccountID: cleanAccountID,
            notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
        });
        // Set correct notification preferences: visible for the submitter, hidden for others until there's activity
        if (optimisticReport.participants) {
            optimisticReport.participants[cleanAccountID] = __assign(__assign({}, optimisticReport.participants[cleanAccountID]), { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS });
        }
        var optimisticCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(login);
        workspaceMembersChats.reportCreationData[login] = {
            reportID: optimisticReport.reportID,
            reportActionID: optimisticCreatedAction.reportActionID,
        };
        workspaceMembersChats.onyxOptimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(optimisticReport.reportID),
            value: __assign(__assign({}, optimisticReport), { pendingFields: {
                    createChat: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                }, hasOutstandingChildRequest: hasOutstandingChildRequest }),
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(optimisticReport.reportID),
            value: {
                isOptimisticReport: true,
                pendingChatMembers: [
                    {
                        accountID: accountID.toString(),
                        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    },
                ],
            },
        });
        workspaceMembersChats.onyxOptimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(optimisticReport.reportID),
            value: (_a = {}, _a[optimisticCreatedAction.reportActionID] = optimisticCreatedAction, _a),
        });
        workspaceMembersChats.onyxSuccessData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(optimisticReport.reportID),
            value: {
                pendingFields: {
                    createChat: null,
                },
                errorFields: {
                    createChat: null,
                },
                participants: (_b = {},
                    _b[accountID] = allPersonalDetails && allPersonalDetails[accountID] ? {} : null,
                    _b),
            },
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(optimisticReport.reportID),
            value: {
                isOptimisticReport: false,
                pendingChatMembers: null,
            },
        });
        workspaceMembersChats.onyxSuccessData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(optimisticReport.reportID),
            value: (_c = {}, _c[optimisticCreatedAction.reportActionID] = { pendingAction: null }, _c),
        });
        workspaceMembersChats.onyxFailureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(optimisticReport.reportID),
            value: {
                isLoadingInitialReportActions: false,
            },
        });
        workspaceMembersChats.onyxFailureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(optimisticReport.reportID),
            value: {
                errorFields: {
                    createChat: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage'),
                },
            },
        });
    });
    return workspaceMembersChats;
}
/**
 * Updates a workspace avatar image
 */
function updateWorkspaceAvatar(policyID, file) {
    var _a;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                avatarURL: file.uri,
                originalFileName: file.name,
                errorFields: {
                    avatarURL: null,
                },
                pendingFields: {
                    avatarURL: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        },
    ];
    var finallyData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                pendingFields: {
                    avatarURL: null,
                },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                avatarURL: (_a = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)]) === null || _a === void 0 ? void 0 : _a.avatarURL,
            },
        },
    ];
    var params = {
        policyID: policyID,
        file: file,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_WORKSPACE_AVATAR, params, { optimisticData: optimisticData, finallyData: finallyData, failureData: failureData });
}
/**
 * Deletes the avatar image for the workspace
 */
function deleteWorkspaceAvatar(policyID) {
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                pendingFields: {
                    avatarURL: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                errorFields: {
                    avatarURL: null,
                },
                avatarURL: '',
                originalFileName: null,
            },
        },
    ];
    var finallyData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                pendingFields: {
                    avatarURL: null,
                },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                avatarURL: policy === null || policy === void 0 ? void 0 : policy.avatarURL,
                originalFileName: policy === null || policy === void 0 ? void 0 : policy.originalFileName,
                errorFields: {
                    avatarURL: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('avatarWithImagePicker.deleteWorkspaceError'),
                },
            },
        },
    ];
    var params = { policyID: policyID };
    API.write(types_1.WRITE_COMMANDS.DELETE_WORKSPACE_AVATAR, params, { optimisticData: optimisticData, finallyData: finallyData, failureData: failureData });
}
/**
 * Clear error and pending fields for the workspace avatar
 */
function clearAvatarErrors(policyID) {
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
        errorFields: {
            avatarURL: null,
        },
        pendingFields: {
            avatarURL: null,
        },
    });
}
/**
 * Optimistically update the general settings. Set the general settings as pending until the response succeeds.
 * If the response fails set a general error message. Clear the error message when updating.
 */
function updateGeneralSettings(policyID, name, currencyValue) {
    var _a, _b, _c;
    var _d, _e;
    if (!policyID) {
        return;
    }
    var policy = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)];
    if (!policy) {
        return;
    }
    var distanceUnit = PolicyUtils.getDistanceRateCustomUnit(policy);
    var customUnitID = distanceUnit === null || distanceUnit === void 0 ? void 0 : distanceUnit.customUnitID;
    var currency = (_d = currencyValue !== null && currencyValue !== void 0 ? currencyValue : policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _d !== void 0 ? _d : CONST_1.default.CURRENCY.USD;
    var currencyPendingAction = currency !== (policy === null || policy === void 0 ? void 0 : policy.outputCurrency) ? CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : undefined;
    var namePendingAction = name !== (policy === null || policy === void 0 ? void 0 : policy.name) ? CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : undefined;
    var currentRates = (_e = distanceUnit === null || distanceUnit === void 0 ? void 0 : distanceUnit.rates) !== null && _e !== void 0 ? _e : {};
    var optimisticRates = {};
    var finallyRates = {};
    var failureRates = {};
    if (customUnitID) {
        for (var _i = 0, _f = Object.keys(currentRates); _i < _f.length; _i++) {
            var rateID = _f[_i];
            optimisticRates[rateID] = __assign(__assign({}, currentRates[rateID]), { pendingFields: { currency: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE }, currency: currency });
            finallyRates[rateID] = __assign(__assign({}, currentRates[rateID]), { pendingFields: { currency: null }, currency: currency });
            failureRates[rateID] = __assign(__assign({}, currentRates[rateID]), { pendingFields: { currency: null }, errorFields: { currency: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage') } });
        }
    }
    var optimisticData = [
        {
            // We use SET because it's faster than merge and avoids a race condition when setting the currency and navigating the user to the Bank account page in confirmCurrencyChangeAndHideModal
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: __assign(__assign(__assign({}, policy), { pendingFields: __assign(__assign(__assign({}, policy.pendingFields), (namePendingAction !== undefined && { name: namePendingAction })), (currencyPendingAction !== undefined && { outputCurrency: currencyPendingAction })), 
                // Clear errorFields in case the user didn't dismiss the general settings error
                errorFields: {
                    name: null,
                    outputCurrency: null,
                }, name: name, outputCurrency: currency }), (customUnitID && {
                customUnits: __assign(__assign({}, policy.customUnits), (_a = {}, _a[customUnitID] = __assign(__assign({}, distanceUnit), { rates: optimisticRates }), _a)),
            })),
        },
    ];
    var finallyData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: __assign({ pendingFields: {
                    name: null,
                    outputCurrency: null,
                } }, (customUnitID && {
                customUnits: (_b = {},
                    _b[customUnitID] = __assign(__assign({}, distanceUnit), { rates: finallyRates }),
                    _b),
            })),
        },
    ];
    var errorFields = {
        name: namePendingAction && ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.editor.genericFailureMessage'),
    };
    if (!errorFields.name && currencyPendingAction) {
        errorFields.outputCurrency = ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.editor.genericFailureMessage');
    }
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: __assign({ errorFields: errorFields }, (customUnitID && {
                customUnits: (_c = {},
                    _c[customUnitID] = __assign(__assign({}, distanceUnit), { rates: failureRates }),
                    _c),
            })),
        },
    ];
    var params = {
        policyID: policyID,
        workspaceName: name,
        currency: currency,
    };
    var persistedRequests = PersistedRequests.getAll();
    var createWorkspaceRequestChangedIndex = persistedRequests.findIndex(function (request) { var _a, _b; return ((_a = request.data) === null || _a === void 0 ? void 0 : _a.policyID) === policyID && request.command === types_1.WRITE_COMMANDS.CREATE_WORKSPACE && ((_b = request.data) === null || _b === void 0 ? void 0 : _b.policyName) !== name; });
    var createWorkspaceRequest = persistedRequests.at(createWorkspaceRequestChangedIndex);
    if (createWorkspaceRequest && createWorkspaceRequestChangedIndex !== -1) {
        var workspaceRequest = __assign(__assign({}, createWorkspaceRequest), { data: __assign(__assign({}, createWorkspaceRequest.data), { policyName: name }) });
        react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
            name: name,
        });
        PersistedRequests.update(createWorkspaceRequestChangedIndex, workspaceRequest);
        return;
    }
    API.write(types_1.WRITE_COMMANDS.UPDATE_WORKSPACE_GENERAL_SETTINGS, params, {
        optimisticData: optimisticData,
        finallyData: finallyData,
        failureData: failureData,
    });
}
function updateWorkspaceDescription(policyID, description, currentDescription) {
    if (description === currentDescription) {
        return;
    }
    var parsedDescription = ReportUtils.getParsedComment(description);
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                description: parsedDescription,
                pendingFields: {
                    description: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                errorFields: {
                    description: null,
                },
            },
        },
    ];
    var finallyData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                pendingFields: {
                    description: null,
                },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                errorFields: {
                    description: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.editor.genericFailureMessage'),
                },
            },
        },
    ];
    var params = {
        policyID: policyID,
        description: parsedDescription,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_WORKSPACE_DESCRIPTION, params, {
        optimisticData: optimisticData,
        finallyData: finallyData,
        failureData: failureData,
    });
}
function setWorkspaceErrors(policyID, errors) {
    if (!(allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies[policyID])) {
        return;
    }
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { errors: null });
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { errors: errors });
}
function hideWorkspaceAlertMessage(policyID) {
    if (!(allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies[policyID])) {
        return;
    }
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { alertMessage: '' });
}
function updateAddress(policyID, newAddress) {
    // TODO: Change API endpoint parameters format to make it possible to follow naming-convention
    var parameters = {
        policyID: policyID,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'data[addressStreet]': newAddress.addressStreet,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'data[city]': newAddress.city,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'data[country]': newAddress.country,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'data[state]': newAddress.state,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'data[zipCode]': newAddress.zipCode,
    };
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                address: newAddress,
                pendingFields: {
                    address: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        },
    ];
    var finallyData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                address: newAddress,
                pendingFields: {
                    address: null,
                },
            },
        },
    ];
    API.write(types_1.WRITE_COMMANDS.UPDATE_POLICY_ADDRESS, parameters, {
        optimisticData: optimisticData,
        finallyData: finallyData,
    });
}
/**
 * Removes an error after trying to delete a workspace
 */
function clearDeleteWorkspaceError(policyID) {
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
        pendingAction: null,
        errors: null,
    });
}
/**
 * Removes the workspace after failure to create.
 */
function removeWorkspace(policyID) {
    react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), null);
}
/**
 * Generate a policy name based on an email and policy list.
 * @param [email] the email to base the workspace name on. If not passed, will use the logged-in user's email instead
 */
function generateDefaultWorkspaceName(email) {
    var _a, _b, _c, _d, _e;
    if (email === void 0) { email = ''; }
    var emailParts = email ? email.split('@') : sessionEmail.split('@');
    if (!emailParts || emailParts.length !== 2) {
        return '';
    }
    var username = (_a = emailParts.at(0)) !== null && _a !== void 0 ? _a : '';
    var domain = (_b = emailParts.at(1)) !== null && _b !== void 0 ? _b : '';
    var userDetails = PersonalDetailsUtils.getPersonalDetailByEmail(email || sessionEmail);
    var displayName = (_c = userDetails === null || userDetails === void 0 ? void 0 : userDetails.displayName) === null || _c === void 0 ? void 0 : _c.trim();
    var displayNameForWorkspace = '';
    if (!expensify_common_1.PUBLIC_DOMAINS_SET.has(domain.toLowerCase())) {
        displayNameForWorkspace = expensify_common_1.Str.UCFirst((_d = domain.split('.').at(0)) !== null && _d !== void 0 ? _d : '');
    }
    else if (displayName) {
        displayNameForWorkspace = expensify_common_1.Str.UCFirst(displayName);
    }
    else if (expensify_common_1.PUBLIC_DOMAINS_SET.has(domain.toLowerCase())) {
        displayNameForWorkspace = expensify_common_1.Str.UCFirst(username);
    }
    else {
        displayNameForWorkspace = (_e = userDetails === null || userDetails === void 0 ? void 0 : userDetails.phoneNumber) !== null && _e !== void 0 ? _e : '';
    }
    var isSMSDomain = "@".concat(domain) === CONST_1.default.SMS.DOMAIN;
    if (isSMSDomain) {
        displayNameForWorkspace = (0, Localize_1.translateLocal)('workspace.new.myGroupWorkspace', {});
    }
    if ((0, EmptyObject_1.isEmptyObject)(allPolicies)) {
        return isSMSDomain ? (0, Localize_1.translateLocal)('workspace.new.myGroupWorkspace', {}) : (0, Localize_1.translateLocal)('workspace.new.workspaceName', { userName: displayNameForWorkspace });
    }
    // find default named workspaces and increment the last number
    var escapedName = (0, escapeRegExp_1.default)(displayNameForWorkspace);
    var workspaceTranslations = Object.values(CONST_1.default.LOCALES)
        .map(function (lang) { return (0, Localize_1.translate)(lang, 'workspace.common.workspace'); })
        .join('|');
    var workspaceRegex = isSMSDomain ? new RegExp("^".concat(escapedName, "\\s*(\\d+)?$"), 'i') : new RegExp("^(?=.*".concat(escapedName, ")(?:.*(?:").concat(workspaceTranslations, ")\\s*(\\d+)?)"), 'i');
    var workspaceNumbers = Object.values(allPolicies)
        .map(function (policy) { var _a; return workspaceRegex.exec((_a = policy === null || policy === void 0 ? void 0 : policy.name) !== null && _a !== void 0 ? _a : ''); })
        .filter(Boolean) // Remove null matches
        .map(function (match) { var _a; return Number((_a = match === null || match === void 0 ? void 0 : match[1]) !== null && _a !== void 0 ? _a : '0'); });
    var lastWorkspaceNumber = workspaceNumbers.length > 0 ? Math.max.apply(Math, workspaceNumbers) : undefined;
    if (isSMSDomain) {
        return (0, Localize_1.translateLocal)('workspace.new.myGroupWorkspace', { workspaceNumber: lastWorkspaceNumber !== undefined ? lastWorkspaceNumber + 1 : undefined });
    }
    return (0, Localize_1.translateLocal)('workspace.new.workspaceName', { userName: displayNameForWorkspace, workspaceNumber: lastWorkspaceNumber !== undefined ? lastWorkspaceNumber + 1 : undefined });
}
/**
 * Returns a client generated 16 character hexadecimal value for the policyID
 */
function generatePolicyID() {
    return NumberUtils.generateHexadecimalValue(16);
}
/**
 * Returns a client generated 13 character hexadecimal value for a custom unit ID
 */
function generateCustomUnitID() {
    return NumberUtils.generateHexadecimalValue(13);
}
function buildOptimisticDistanceRateCustomUnits(reportCurrency) {
    var _a, _b;
    var _c, _d;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Disabling this line for safeness as nullish coalescing works only if the value is undefined or null
    var currency = reportCurrency || ((_d = (_c = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[sessionAccountID]) === null || _c === void 0 ? void 0 : _c.localCurrencyCode) !== null && _d !== void 0 ? _d : CONST_1.default.CURRENCY.USD);
    var customUnitID = generateCustomUnitID();
    var customUnitRateID = generateCustomUnitID();
    var customUnits = (_a = {},
        _a[customUnitID] = {
            customUnitID: customUnitID,
            name: CONST_1.default.CUSTOM_UNITS.NAME_DISTANCE,
            attributes: {
                unit: CONST_1.default.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
            },
            rates: (_b = {},
                _b[customUnitRateID] = {
                    customUnitRateID: customUnitRateID,
                    name: CONST_1.default.CUSTOM_UNITS.DEFAULT_RATE,
                    rate: CONST_1.default.CUSTOM_UNITS.MILEAGE_IRS_RATE * CONST_1.default.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET,
                    enabled: true,
                    currency: currency,
                },
                _b),
        },
        _a);
    return {
        customUnits: customUnits,
        customUnitID: customUnitID,
        customUnitRateID: customUnitRateID,
        outputCurrency: currency,
    };
}
/**
 * Optimistically creates a Policy Draft for a new workspace
 *
 * @param [policyOwnerEmail] the email of the account to make the owner of the policy
 * @param [policyName] custom policy name we will use for created workspace
 * @param [policyID] custom policy id we will use for created workspace
 * @param [makeMeAdmin] leave the calling account as an admin on the policy
 * @param [currency] Optional, selected currency for the workspace
 * @param [file], avatar file for workspace
 */
function createDraftInitialWorkspace(policyOwnerEmail, policyName, policyID, makeMeAdmin, currency, file) {
    var _a;
    var _b;
    if (policyOwnerEmail === void 0) { policyOwnerEmail = ''; }
    if (policyName === void 0) { policyName = ''; }
    if (policyID === void 0) { policyID = generatePolicyID(); }
    if (makeMeAdmin === void 0) { makeMeAdmin = false; }
    if (currency === void 0) { currency = ''; }
    var workspaceName = policyName || generateDefaultWorkspaceName(policyOwnerEmail);
    var _c = buildOptimisticDistanceRateCustomUnits(currency), customUnits = _c.customUnits, outputCurrency = _c.outputCurrency;
    var shouldEnableWorkflowsByDefault = !(introSelected === null || introSelected === void 0 ? void 0 : introSelected.choice) || introSelected.choice === CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM || introSelected.choice === CONST_1.default.ONBOARDING_CHOICES.LOOKING_AROUND;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_DRAFTS).concat(policyID),
            value: {
                id: policyID,
                type: CONST_1.default.POLICY.TYPE.TEAM,
                name: workspaceName,
                role: CONST_1.default.POLICY.ROLE.ADMIN,
                owner: sessionEmail,
                ownerAccountID: sessionAccountID,
                isPolicyExpenseChatEnabled: true,
                areCategoriesEnabled: true,
                approver: sessionEmail,
                areCompanyCardsEnabled: true,
                areExpensifyCardsEnabled: false,
                outputCurrency: outputCurrency,
                pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                customUnits: customUnits,
                makeMeAdmin: makeMeAdmin,
                autoReporting: true,
                autoReportingFrequency: shouldEnableWorkflowsByDefault ? CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE : CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
                avatarURL: (_b = file === null || file === void 0 ? void 0 : file.uri) !== null && _b !== void 0 ? _b : null,
                harvesting: {
                    enabled: !shouldEnableWorkflowsByDefault,
                },
                originalFileName: file === null || file === void 0 ? void 0 : file.name,
                employeeList: (_a = {},
                    _a[sessionEmail] = {
                        submitsTo: sessionEmail,
                        email: sessionEmail,
                        role: CONST_1.default.POLICY.ROLE.ADMIN,
                        errors: {},
                    },
                    _a),
                approvalMode: CONST_1.default.POLICY.APPROVAL_MODE.OPTIONAL,
                pendingFields: {
                    autoReporting: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    approvalMode: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    reimbursementChoice: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                areWorkflowsEnabled: shouldEnableWorkflowsByDefault,
                defaultBillable: false,
                disabledFields: { defaultBillable: true },
                requiresCategory: true,
            },
        },
    ];
    react_native_onyx_1.default.update(optimisticData);
}
/**
 * Generates onyx data for creating a new workspace
 *
 * @param [policyOwnerEmail] the email of the account to make the owner of the policy
 * @param [makeMeAdmin] leave the calling account as an admin on the policy
 * @param [policyName] custom policy name we will use for created workspace
 * @param [policyID] custom policy id we will use for created workspace
 * @param [expenseReportId] Optional, Purpose of using application selected by user in guided setup flow
 * @param [engagementChoice] Purpose of using application selected by user in guided setup flow
 * @param [currency] Optional, selected currency for the workspace
 * @param [file] Optional, avatar file for workspace
 * @param [shouldAddOnboardingTasks] whether to add onboarding tasks to the workspace
 */
function buildPolicyData(policyOwnerEmail, makeMeAdmin, policyName, policyID, expenseReportId, engagementChoice, currency, file, shouldAddOnboardingTasks, companySize) {
    var _a, _b, _c, _d, _e;
    var _f;
    if (policyOwnerEmail === void 0) { policyOwnerEmail = ''; }
    if (makeMeAdmin === void 0) { makeMeAdmin = false; }
    if (policyName === void 0) { policyName = ''; }
    if (policyID === void 0) { policyID = generatePolicyID(); }
    if (currency === void 0) { currency = ''; }
    if (shouldAddOnboardingTasks === void 0) { shouldAddOnboardingTasks = true; }
    var workspaceName = policyName || generateDefaultWorkspaceName(policyOwnerEmail);
    var _g = buildOptimisticDistanceRateCustomUnits(currency), customUnits = _g.customUnits, customUnitID = _g.customUnitID, customUnitRateID = _g.customUnitRateID, outputCurrency = _g.outputCurrency;
    var _h = ReportUtils.buildOptimisticWorkspaceChats(policyID, workspaceName, expenseReportId), adminsChatReportID = _h.adminsChatReportID, adminsChatData = _h.adminsChatData, adminsReportActionData = _h.adminsReportActionData, adminsCreatedReportActionID = _h.adminsCreatedReportActionID, expenseChatReportID = _h.expenseChatReportID, expenseChatData = _h.expenseChatData, expenseReportActionData = _h.expenseReportActionData, expenseCreatedReportActionID = _h.expenseCreatedReportActionID, pendingChatMembers = _h.pendingChatMembers;
    var optimisticCategoriesData = (0, Category_1.buildOptimisticPolicyCategories)(policyID, Object.values(CONST_1.default.POLICY.DEFAULT_CATEGORIES));
    var optimisticMccGroupData = (0, Category_1.buildOptimisticMccGroup)();
    var shouldEnableWorkflowsByDefault = !engagementChoice ||
        engagementChoice === CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM ||
        engagementChoice === CONST_1.default.ONBOARDING_CHOICES.LOOKING_AROUND ||
        engagementChoice === CONST_1.default.ONBOARDING_CHOICES.PERSONAL_SPEND ||
        engagementChoice === CONST_1.default.ONBOARDING_CHOICES.TRACK_WORKSPACE;
    var shouldSetCreatedWorkspaceAsActivePolicy = !!activePolicyID && ((_f = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(activePolicyID)]) === null || _f === void 0 ? void 0 : _f.type) === CONST_1.default.POLICY.TYPE.PERSONAL;
    // WARNING: The data below should be kept in sync with the API so we create the policy with the correct configuration.
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: __assign(__assign({ id: policyID, type: CONST_1.default.POLICY.TYPE.TEAM, name: workspaceName, role: CONST_1.default.POLICY.ROLE.ADMIN, owner: sessionEmail, ownerAccountID: sessionAccountID, isPolicyExpenseChatEnabled: true, outputCurrency: outputCurrency, pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD, autoReporting: true, approver: sessionEmail, autoReportingFrequency: shouldEnableWorkflowsByDefault ? CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE : CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT, approvalMode: shouldEnableWorkflowsByDefault && engagementChoice !== CONST_1.default.ONBOARDING_CHOICES.TRACK_WORKSPACE ? CONST_1.default.POLICY.APPROVAL_MODE.BASIC : CONST_1.default.POLICY.APPROVAL_MODE.OPTIONAL, harvesting: {
                    enabled: !shouldEnableWorkflowsByDefault,
                }, customUnits: customUnits, areCategoriesEnabled: true, areCompanyCardsEnabled: true, areTagsEnabled: false, areDistanceRatesEnabled: false, areWorkflowsEnabled: shouldEnableWorkflowsByDefault, areReportFieldsEnabled: false, areConnectionsEnabled: false, areExpensifyCardsEnabled: false, employeeList: (_a = {},
                    _a[sessionEmail] = {
                        submitsTo: sessionEmail,
                        email: sessionEmail,
                        role: CONST_1.default.POLICY.ROLE.ADMIN,
                        errors: {},
                    },
                    _a), chatReportIDAdmins: makeMeAdmin ? Number(adminsChatReportID) : undefined, pendingFields: {
                    autoReporting: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    approvalMode: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    reimbursementChoice: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    name: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    outputCurrency: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    address: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    description: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    type: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    areReportFieldsEnabled: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                }, defaultBillable: false, disabledFields: { defaultBillable: true }, avatarURL: file === null || file === void 0 ? void 0 : file.uri, originalFileName: file === null || file === void 0 ? void 0 : file.name }, optimisticMccGroupData.optimisticData), { requiresCategory: true, fieldList: (_b = {},
                    _b[CONST_1.default.POLICY.FIELDS.FIELD_LIST_TITLE] = {
                        defaultValue: CONST_1.default.POLICY.DEFAULT_REPORT_NAME_PATTERN,
                        pendingFields: { defaultValue: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD, deletable: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD },
                        type: CONST_1.default.POLICY.DEFAULT_FIELD_LIST_TYPE,
                        target: CONST_1.default.POLICY.DEFAULT_FIELD_LIST_TARGET,
                        name: CONST_1.default.POLICY.DEFAULT_FIELD_LIST_NAME,
                        fieldID: CONST_1.default.POLICY.FIELDS.FIELD_LIST_TITLE,
                        deletable: true,
                    },
                    _b) }),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(adminsChatReportID),
            value: __assign({ pendingFields: {
                    addWorkspaceRoom: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                } }, adminsChatData),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(adminsChatReportID),
            value: {
                pendingChatMembers: pendingChatMembers,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(adminsChatReportID),
            value: adminsReportActionData,
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
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_DRAFTS).concat(policyID),
            value: null,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT).concat(expenseChatReportID),
            value: null,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT).concat(adminsChatReportID),
            value: null,
        },
    ];
    if (shouldSetCreatedWorkspaceAsActivePolicy) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID,
            value: policyID,
        });
    }
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: __assign(__assign({ pendingAction: null, pendingFields: {
                    autoReporting: null,
                    approvalMode: null,
                    reimbursementChoice: null,
                    name: null,
                    outputCurrency: null,
                    address: null,
                    description: null,
                    type: null,
                    areReportFieldsEnabled: null,
                } }, optimisticMccGroupData.successData), { fieldList: (_c = {},
                    _c[CONST_1.default.POLICY.FIELDS.FIELD_LIST_TITLE] = {
                        pendingFields: {
                            defaultValue: null,
                            deletable: null,
                        },
                    },
                    _c) }),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(adminsChatReportID),
            value: {
                pendingFields: {
                    addWorkspaceRoom: null,
                },
                pendingAction: null,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(adminsChatReportID),
            value: {
                isOptimisticReport: false,
                pendingChatMembers: [],
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(adminsChatReportID),
            value: (_d = {},
                _d[adminsCreatedReportActionID] = {
                    pendingAction: null,
                },
                _d),
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
            value: (_e = {},
                _e[expenseCreatedReportActionID] = {
                    pendingAction: null,
                },
                _e),
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: __assign({ employeeList: null }, optimisticMccGroupData.failureData),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(adminsChatReportID),
            value: null,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(adminsChatReportID),
            value: null,
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
    if (shouldSetCreatedWorkspaceAsActivePolicy) {
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID,
            value: activePolicyID,
        });
    }
    if (optimisticCategoriesData.optimisticData) {
        optimisticData.push.apply(optimisticData, optimisticCategoriesData.optimisticData);
    }
    if (optimisticCategoriesData.failureData) {
        failureData.push.apply(failureData, optimisticCategoriesData.failureData);
    }
    if (optimisticCategoriesData.successData) {
        successData.push.apply(successData, optimisticCategoriesData.successData);
    }
    // We need to clone the file to prevent non-indexable errors.
    var clonedFile = file ? (0, FileUtils_1.createFile)(file) : undefined;
    var params = {
        policyID: policyID,
        adminsChatReportID: adminsChatReportID,
        expenseChatReportID: expenseChatReportID,
        ownerEmail: policyOwnerEmail,
        makeMeAdmin: makeMeAdmin,
        policyName: workspaceName,
        type: CONST_1.default.POLICY.TYPE.TEAM,
        adminsCreatedReportActionID: adminsCreatedReportActionID,
        expenseCreatedReportActionID: expenseCreatedReportActionID,
        customUnitID: customUnitID,
        customUnitRateID: customUnitRateID,
        engagementChoice: engagementChoice,
        currency: outputCurrency,
        file: clonedFile,
        companySize: companySize,
    };
    if (introSelected !== undefined &&
        (introSelected.choice === CONST_1.default.ONBOARDING_CHOICES.TEST_DRIVE_RECEIVER || !(introSelected === null || introSelected === void 0 ? void 0 : introSelected.createWorkspace)) &&
        engagementChoice &&
        shouldAddOnboardingTasks) {
        var onboardingMessages = (0, OnboardingFlow_1.getOnboardingMessages)().onboardingMessages;
        var onboardingData = ReportUtils.prepareOnboardingOnyxData(introSelected, engagementChoice, onboardingMessages[engagementChoice], adminsChatReportID, policyID);
        if (!onboardingData) {
            return { successData: successData, optimisticData: optimisticData, failureData: failureData, params: params };
        }
        var guidedSetupData = onboardingData.guidedSetupData, taskOptimisticData = onboardingData.optimisticData, taskSuccessData = onboardingData.successData, taskFailureData = onboardingData.failureData;
        params.guidedSetupData = JSON.stringify(guidedSetupData);
        params.engagementChoice = engagementChoice;
        optimisticData.push.apply(optimisticData, taskOptimisticData);
        successData.push.apply(successData, taskSuccessData);
        failureData.push.apply(failureData, taskFailureData);
    }
    // For test drive receivers, we want to complete the createWorkspace task in concierge, instead of #admin room
    if ((introSelected === null || introSelected === void 0 ? void 0 : introSelected.choice) === CONST_1.default.ONBOARDING_CHOICES.TEST_DRIVE_RECEIVER && introSelected.createWorkspace) {
        var createWorkspaceTaskReport = { reportID: introSelected.createWorkspace };
        var _j = (0, Task_1.buildTaskData)(createWorkspaceTaskReport, introSelected.createWorkspace), optimisticCreateWorkspaceTaskData = _j.optimisticData, successCreateWorkspaceTaskData = _j.successData, failureCreateWorkspaceTaskData = _j.failureData;
        optimisticData.push.apply(optimisticData, optimisticCreateWorkspaceTaskData);
        successData.push.apply(successData, successCreateWorkspaceTaskData);
        failureData.push.apply(failureData, failureCreateWorkspaceTaskData);
    }
    return { successData: successData, optimisticData: optimisticData, failureData: failureData, params: params };
}
function createWorkspace(policyOwnerEmail, makeMeAdmin, policyName, policyID, engagementChoice, currency, file, shouldAddOnboardingTasks, companySize) {
    if (policyOwnerEmail === void 0) { policyOwnerEmail = ''; }
    if (makeMeAdmin === void 0) { makeMeAdmin = false; }
    if (policyName === void 0) { policyName = ''; }
    if (policyID === void 0) { policyID = generatePolicyID(); }
    if (engagementChoice === void 0) { engagementChoice = CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM; }
    if (currency === void 0) { currency = ''; }
    if (shouldAddOnboardingTasks === void 0) { shouldAddOnboardingTasks = true; }
    var _a = buildPolicyData(policyOwnerEmail, makeMeAdmin, policyName, policyID, undefined, engagementChoice, currency, file, shouldAddOnboardingTasks, companySize), optimisticData = _a.optimisticData, failureData = _a.failureData, successData = _a.successData, params = _a.params;
    API.write(types_1.WRITE_COMMANDS.CREATE_WORKSPACE, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
    // Publish a workspace created event if this is their first policy
    if (getAdminPolicies().length === 0) {
        GoogleTagManager_1.default.publishEvent(CONST_1.default.ANALYTICS.EVENT.WORKSPACE_CREATED, sessionAccountID);
    }
    return params;
}
/**
 * Creates a draft workspace for various money request flows
 *
 * @param [policyOwnerEmail] the email of the account to make the owner of the policy
 * @param [makeMeAdmin] leave the calling account as an admin on the policy
 * @param [policyName] custom policy name we will use for created workspace
 * @param [policyID] custom policy id we will use for created workspace
 */
function createDraftWorkspace(policyOwnerEmail, makeMeAdmin, policyName, policyID, currency, file) {
    var _a;
    if (policyOwnerEmail === void 0) { policyOwnerEmail = ''; }
    if (makeMeAdmin === void 0) { makeMeAdmin = false; }
    if (policyName === void 0) { policyName = ''; }
    if (policyID === void 0) { policyID = generatePolicyID(); }
    if (currency === void 0) { currency = ''; }
    var workspaceName = policyName || generateDefaultWorkspaceName(policyOwnerEmail);
    var _b = buildOptimisticDistanceRateCustomUnits(currency), customUnits = _b.customUnits, customUnitID = _b.customUnitID, customUnitRateID = _b.customUnitRateID, outputCurrency = _b.outputCurrency;
    var _c = ReportUtils.buildOptimisticWorkspaceChats(policyID, workspaceName), expenseChatData = _c.expenseChatData, adminsChatReportID = _c.adminsChatReportID, adminsCreatedReportActionID = _c.adminsCreatedReportActionID, expenseChatReportID = _c.expenseChatReportID, expenseCreatedReportActionID = _c.expenseCreatedReportActionID;
    var shouldEnableWorkflowsByDefault = !(introSelected === null || introSelected === void 0 ? void 0 : introSelected.choice) || introSelected.choice === CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM || introSelected.choice === CONST_1.default.ONBOARDING_CHOICES.LOOKING_AROUND;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_DRAFTS).concat(policyID),
            value: {
                id: policyID,
                type: CONST_1.default.POLICY.TYPE.TEAM,
                name: workspaceName,
                role: CONST_1.default.POLICY.ROLE.ADMIN,
                owner: sessionEmail,
                ownerAccountID: sessionAccountID,
                isPolicyExpenseChatEnabled: true,
                outputCurrency: outputCurrency,
                pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                autoReporting: true,
                approver: sessionEmail,
                autoReportingFrequency: shouldEnableWorkflowsByDefault ? CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE : CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
                harvesting: {
                    enabled: !shouldEnableWorkflowsByDefault,
                },
                approvalMode: shouldEnableWorkflowsByDefault ? CONST_1.default.POLICY.APPROVAL_MODE.BASIC : CONST_1.default.POLICY.APPROVAL_MODE.OPTIONAL,
                customUnits: customUnits,
                areCategoriesEnabled: true,
                areWorkflowsEnabled: shouldEnableWorkflowsByDefault,
                areCompanyCardsEnabled: true,
                areTagsEnabled: false,
                areDistanceRatesEnabled: false,
                areReportFieldsEnabled: false,
                areConnectionsEnabled: false,
                areExpensifyCardsEnabled: false,
                employeeList: (_a = {},
                    _a[sessionEmail] = {
                        submitsTo: sessionEmail,
                        email: sessionEmail,
                        role: CONST_1.default.POLICY.ROLE.ADMIN,
                        errors: {},
                    },
                    _a),
                chatReportIDAdmins: makeMeAdmin ? Number(adminsChatReportID) : undefined,
                pendingFields: {
                    autoReporting: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    approvalMode: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    reimbursementChoice: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                defaultBillable: false,
                disabledFields: { defaultBillable: true },
                requiresCategory: true,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT).concat(expenseChatReportID),
            value: expenseChatData,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES_DRAFT).concat(policyID),
            value: Object.values(CONST_1.default.POLICY.DEFAULT_CATEGORIES).reduce(function (acc, category) {
                acc[category] = {
                    name: category,
                    enabled: true,
                    errors: null,
                };
                return acc;
            }, {}),
        },
    ];
    // We need to clone the file to prevent non-indexable errors.
    var clonedFile = file ? (0, FileUtils_1.createFile)(file) : undefined;
    var params = {
        policyID: policyID,
        adminsChatReportID: adminsChatReportID,
        expenseChatReportID: expenseChatReportID,
        ownerEmail: policyOwnerEmail,
        makeMeAdmin: makeMeAdmin,
        policyName: workspaceName,
        type: CONST_1.default.POLICY.TYPE.TEAM,
        adminsCreatedReportActionID: adminsCreatedReportActionID,
        expenseCreatedReportActionID: expenseCreatedReportActionID,
        customUnitID: customUnitID,
        customUnitRateID: customUnitRateID,
        currency: outputCurrency,
        file: clonedFile,
    };
    react_native_onyx_1.default.update(optimisticData);
    return params;
}
function openPolicyWorkflowsPage(policyID) {
    if (!policyID) {
        Log_1.default.warn('openPolicyWorkflowsPage invalid params', { policyID: policyID });
        return;
    }
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    isLoading: true,
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    isLoading: false,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    isLoading: false,
                },
            },
        ],
    };
    var params = { policyID: policyID };
    API.read(types_1.READ_COMMANDS.OPEN_POLICY_WORKFLOWS_PAGE, params, onyxData);
}
/**
 * Returns the accountIDs of the members of the policy whose data is passed in the parameters
 */
function openWorkspace(policyID, clientMemberAccountIDs) {
    if (!policyID || !clientMemberAccountIDs) {
        Log_1.default.warn('openWorkspace invalid params', { policyID: policyID, clientMemberAccountIDs: clientMemberAccountIDs });
        return;
    }
    var params = {
        policyID: policyID,
        clientMemberAccountIDs: JSON.stringify(clientMemberAccountIDs),
    };
    API.read(types_1.READ_COMMANDS.OPEN_WORKSPACE, params);
}
function openPolicyTaxesPage(policyID) {
    if (!policyID) {
        Log_1.default.warn('openPolicyTaxesPage invalid params', { policyID: policyID });
        return;
    }
    var params = {
        policyID: policyID,
    };
    API.read(types_1.READ_COMMANDS.OPEN_POLICY_TAXES_PAGE, params);
}
function openPolicyExpensifyCardsPage(policyID, workspaceAccountID) {
    var authToken = NetworkStore.getAuthToken();
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS).concat(workspaceAccountID),
            value: {
                isLoading: true,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS).concat(workspaceAccountID),
            value: {
                isLoading: false,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS).concat(workspaceAccountID),
            value: {
                isLoading: false,
            },
        },
    ];
    var params = {
        policyID: policyID,
        authToken: authToken,
    };
    API.read(types_1.READ_COMMANDS.OPEN_POLICY_EXPENSIFY_CARDS_PAGE, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function openPolicyEditCardLimitTypePage(policyID, cardID) {
    var authToken = NetworkStore.getAuthToken();
    var params = {
        policyID: policyID,
        authToken: authToken,
        cardID: cardID,
    };
    API.read(types_1.READ_COMMANDS.OPEN_POLICY_EDIT_CARD_LIMIT_TYPE_PAGE, params);
}
function openWorkspaceInvitePage(policyID, clientMemberEmails) {
    if (!policyID || !clientMemberEmails) {
        Log_1.default.warn('openWorkspaceInvitePage invalid params', { policyID: policyID, clientMemberEmails: clientMemberEmails });
        return;
    }
    var params = {
        policyID: policyID,
        clientMemberEmails: JSON.stringify(clientMemberEmails),
    };
    API.read(types_1.READ_COMMANDS.OPEN_WORKSPACE_INVITE_PAGE, params);
}
function openDraftWorkspaceRequest(policyID) {
    if (policyID === '-1' || policyID === CONST_1.default.POLICY.ID_FAKE) {
        Log_1.default.warn('openDraftWorkspaceRequest invalid params', { policyID: policyID });
        return;
    }
    var params = { policyID: policyID };
    API.read(types_1.READ_COMMANDS.OPEN_DRAFT_WORKSPACE_REQUEST, params);
}
function requestExpensifyCardLimitIncrease(settlementBankAccountID) {
    if (!settlementBankAccountID) {
        return;
    }
    var authToken = NetworkStore.getAuthToken();
    var params = {
        authToken: authToken,
        settlementBankAccountID: settlementBankAccountID,
    };
    API.write(types_1.WRITE_COMMANDS.REQUEST_EXPENSIFY_CARD_LIMIT_INCREASE, params);
}
function updateMemberCustomField(policyID, login, customFieldType, value) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    var _k, _l;
    var customFieldKey = CONST_1.default.CUSTOM_FIELD_KEYS[customFieldType];
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var previousValue = (_l = (_k = policy === null || policy === void 0 ? void 0 : policy.employeeList) === null || _k === void 0 ? void 0 : _k[login]) === null || _l === void 0 ? void 0 : _l[customFieldKey];
    if (value === (previousValue !== null && previousValue !== void 0 ? previousValue : '')) {
        return;
    }
    var optimisticData = [
        {
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            value: {
                employeeList: (_a = {}, _a[login] = (_b = {}, _b[customFieldKey] = value, _b.pendingFields = (_c = {}, _c[customFieldKey] = CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE, _c), _b), _a),
            },
        },
    ];
    var successData = [
        {
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            value: {
                employeeList: (_d = {}, _d[login] = { pendingFields: (_e = {}, _e[customFieldKey] = null, _e) }, _d),
            },
        },
    ];
    var failureData = [
        {
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            value: {
                employeeList: (_f = {}, _f[login] = (_g = {}, _g[customFieldKey] = previousValue, _g.pendingFields = (_h = {}, _h[customFieldKey] = null, _h), _g), _f),
            },
        },
    ];
    var params = { policyID: policyID, employees: JSON.stringify([(_j = { email: login }, _j[customFieldType] = value, _j)]) };
    API.write(types_1.WRITE_COMMANDS.UPDATE_POLICY_MEMBERS_CUSTOM_FIELDS, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function setWorkspaceInviteMessageDraft(policyID, message) {
    react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_INVITE_MESSAGE_DRAFT).concat(policyID), message);
}
function clearErrors(policyID) {
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { errors: null });
    hideWorkspaceAlertMessage(policyID);
}
/**
 * Dismiss the informative messages about which policy members were added with primary logins when invited with their secondary login.
 */
function dismissAddedWithPrimaryLoginMessages(policyID) {
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { primaryLoginsInvited: null });
}
function buildOptimisticRecentlyUsedCurrencies(currency) {
    if (!currency) {
        return [];
    }
    return (0, union_1.default)([currency], allRecentlyUsedCurrencies).slice(0, CONST_1.default.IOU.MAX_RECENT_REPORTS_TO_SHOW);
}
/**
 * This flow is used for bottom up flow converting IOU report to an expense report. When user takes this action,
 * we create a Collect type workspace when the person taking the action becomes an owner and an admin, while we
 * add a new member to the workspace as an employee and convert the IOU report passed as a param into an expense report.
 *
 * @returns policyID of the workspace we have created
 */
// eslint-disable-next-line rulesdir/no-call-actions-from-actions
function createWorkspaceFromIOUPayment(iouReport) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    var _r, _s, _t, _u, _v;
    // This flow only works for IOU reports
    if (!ReportUtils.isIOUReportUsingReport(iouReport)) {
        return;
    }
    // Generate new variables for the policy
    var policyID = generatePolicyID();
    var workspaceName = generateDefaultWorkspaceName(sessionEmail);
    var employeeAccountID = iouReport.ownerAccountID;
    var _w = buildOptimisticDistanceRateCustomUnits(iouReport.currency), customUnits = _w.customUnits, customUnitID = _w.customUnitID, customUnitRateID = _w.customUnitRateID;
    var oldPersonalPolicyID = iouReport.policyID;
    var iouReportID = iouReport.reportID;
    var _x = ReportUtils.buildOptimisticWorkspaceChats(policyID, workspaceName), adminsChatReportID = _x.adminsChatReportID, adminsChatData = _x.adminsChatData, adminsReportActionData = _x.adminsReportActionData, adminsCreatedReportActionID = _x.adminsCreatedReportActionID, workspaceChatReportID = _x.expenseChatReportID, workspaceChatData = _x.expenseChatData, workspaceChatReportActionData = _x.expenseReportActionData, workspaceChatCreatedReportActionID = _x.expenseCreatedReportActionID, pendingChatMembers = _x.pendingChatMembers;
    if (!employeeAccountID || !oldPersonalPolicyID) {
        return;
    }
    var employeeEmail = (_s = (_r = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[employeeAccountID]) === null || _r === void 0 ? void 0 : _r.login) !== null && _s !== void 0 ? _s : '';
    // Create the expense chat for the employee whose IOU is being paid
    var employeeWorkspaceChat = createPolicyExpenseChats(policyID, (_a = {}, _a[employeeEmail] = employeeAccountID, _a), true);
    var newWorkspace = {
        id: policyID,
        // We are creating a collect policy in this case
        type: CONST_1.default.POLICY.TYPE.TEAM,
        name: workspaceName,
        role: CONST_1.default.POLICY.ROLE.ADMIN,
        owner: sessionEmail,
        ownerAccountID: sessionAccountID,
        isPolicyExpenseChatEnabled: true,
        // Setting the currency to USD as we can only add the VBBA for this policy currency right now
        outputCurrency: CONST_1.default.CURRENCY.USD,
        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        autoReporting: true,
        autoReportingFrequency: CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE,
        approvalMode: CONST_1.default.POLICY.APPROVAL_MODE.BASIC,
        approver: sessionEmail,
        harvesting: {
            enabled: false,
        },
        customUnits: customUnits,
        areCategoriesEnabled: true,
        areCompanyCardsEnabled: true,
        areTagsEnabled: false,
        areDistanceRatesEnabled: false,
        areWorkflowsEnabled: true,
        areReportFieldsEnabled: false,
        areConnectionsEnabled: false,
        areExpensifyCardsEnabled: false,
        employeeList: __assign((_b = {}, _b[sessionEmail] = {
            email: sessionEmail,
            submitsTo: sessionEmail,
            role: CONST_1.default.POLICY.ROLE.ADMIN,
            errors: {},
        }, _b), (employeeEmail
            ? (_c = {},
                _c[employeeEmail] = {
                    email: employeeEmail,
                    submitsTo: sessionEmail,
                    role: CONST_1.default.POLICY.ROLE.USER,
                    errors: {},
                },
                _c) : {})),
        pendingFields: {
            autoReporting: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            approvalMode: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            reimbursementChoice: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        },
        defaultBillable: false,
        disabledFields: { defaultBillable: true },
        requiresCategory: true,
    };
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: newWorkspace,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(adminsChatReportID),
            value: __assign({ pendingFields: {
                    addWorkspaceRoom: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                } }, adminsChatData),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(adminsChatReportID),
            value: {
                pendingChatMembers: pendingChatMembers,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(adminsChatReportID),
            value: adminsReportActionData,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(workspaceChatReportID),
            value: __assign({ pendingFields: {
                    addWorkspaceRoom: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                } }, workspaceChatData),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(workspaceChatReportID),
            value: workspaceChatReportActionData,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_DRAFTS).concat(policyID),
            value: {
                pendingFields: {
                    addWorkspaceRoom: null,
                },
                pendingAction: null,
            },
        },
    ];
    optimisticData.push.apply(optimisticData, employeeWorkspaceChat.onyxOptimisticData);
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                pendingAction: null,
                pendingFields: {
                    autoReporting: null,
                    approvalMode: null,
                    reimbursementChoice: null,
                },
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(adminsChatReportID),
            value: {
                pendingFields: {
                    addWorkspaceRoom: null,
                },
                pendingAction: null,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(adminsChatReportID),
            value: {
                isOptimisticReport: false,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(adminsChatReportID),
            value: (_d = {},
                _d[(_t = Object.keys(adminsChatData).at(0)) !== null && _t !== void 0 ? _t : ''] = {
                    pendingAction: null,
                },
                _d),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(workspaceChatReportID),
            value: {
                pendingFields: {
                    addWorkspaceRoom: null,
                },
                pendingAction: null,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(workspaceChatReportID),
            value: {
                isOptimisticReport: false,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(workspaceChatReportID),
            value: (_e = {},
                _e[(_u = Object.keys(workspaceChatData).at(0)) !== null && _u !== void 0 ? _u : ''] = {
                    pendingAction: null,
                },
                _e),
        },
    ];
    successData.push.apply(successData, employeeWorkspaceChat.onyxSuccessData);
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(adminsChatReportID),
            value: {
                pendingFields: {
                    addWorkspaceRoom: null,
                },
                pendingAction: null,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(adminsChatReportID),
            value: {
                pendingAction: null,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(workspaceChatReportID),
            value: {
                pendingFields: {
                    addWorkspaceRoom: null,
                },
                pendingAction: null,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(workspaceChatReportID),
            value: {
                pendingAction: null,
            },
        },
    ];
    // Compose the memberData object which is used to add the employee to the workspace and
    // optimistically create the expense chat for them.
    var memberData = {
        accountID: Number(employeeAccountID),
        email: employeeEmail,
        workspaceChatReportID: employeeWorkspaceChat.reportCreationData[employeeEmail].reportID,
        workspaceChatCreatedReportActionID: employeeWorkspaceChat.reportCreationData[employeeEmail].reportActionID,
    };
    var oldChatReportID = iouReport.chatReportID;
    // Next we need to convert the IOU report to Expense report.
    // We need to change:
    // - report type
    // - change the sign of the report total
    // - update its policyID and policyName
    // - update the chatReportID to point to the new expense chat
    var expenseReport = __assign(__assign({}, iouReport), { chatReportID: memberData.workspaceChatReportID, policyID: policyID, policyName: workspaceName, type: CONST_1.default.REPORT.TYPE.EXPENSE, total: -((_v = iouReport === null || iouReport === void 0 ? void 0 : iouReport.total) !== null && _v !== void 0 ? _v : 0) });
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iouReportID),
        value: expenseReport,
    });
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iouReportID),
        value: iouReport,
    });
    // The expense report transactions need to have the amount reversed to negative values
    var reportTransactions = ReportUtils.getReportTransactions(iouReportID);
    // For performance reasons, we are going to compose a merge collection data for transactions
    var transactionsOptimisticData = {};
    var transactionFailureData = {};
    reportTransactions.forEach(function (transaction) {
        transactionsOptimisticData["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID)] = __assign(__assign({}, transaction), { amount: -transaction.amount, modifiedAmount: transaction.modifiedAmount ? -transaction.modifiedAmount : 0 });
        transactionFailureData["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID)] = transaction;
    });
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE_COLLECTION,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION),
        value: transactionsOptimisticData,
    });
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE_COLLECTION,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION),
        value: transactionFailureData,
    });
    // We need to move the report preview action from the DM to the expense chat.
    var parentReport = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(iouReport.parentReportID)];
    var parentReportActionID = iouReport.parentReportActionID;
    var reportPreview = (iouReport === null || iouReport === void 0 ? void 0 : iouReport.parentReportID) && parentReportActionID ? parentReport === null || parentReport === void 0 ? void 0 : parentReport[parentReportActionID] : undefined;
    if (reportPreview === null || reportPreview === void 0 ? void 0 : reportPreview.reportActionID) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(oldChatReportID),
            value: (_f = {}, _f[reportPreview.reportActionID] = null, _f),
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(oldChatReportID),
            value: (_g = {}, _g[reportPreview.reportActionID] = reportPreview, _g),
        });
    }
    // To optimistically remove the GBR from the DM we need to update the hasOutstandingChildRequest param to false
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(oldChatReportID),
        value: {
            hasOutstandingChildRequest: false,
        },
    });
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(oldChatReportID),
        value: {
            hasOutstandingChildRequest: true,
        },
    });
    if (reportPreview === null || reportPreview === void 0 ? void 0 : reportPreview.reportActionID) {
        // Update the created timestamp of the report preview action to be after the expense chat created timestamp.
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(memberData.workspaceChatReportID),
            value: (_h = {},
                _h[reportPreview.reportActionID] = __assign(__assign({}, reportPreview), { message: [
                        {
                            type: CONST_1.default.REPORT.MESSAGE.TYPE.TEXT,
                            text: ReportUtils.getReportPreviewMessage(expenseReport, null, false, false, newWorkspace),
                        },
                    ], created: DateUtils_1.default.getDBTime() }),
                _h),
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(memberData.workspaceChatReportID),
            value: (_j = {}, _j[reportPreview.reportActionID] = null, _j),
        });
    }
    // Create the MOVED report action and add it to the DM chat which indicates to the user where the report has been moved
    var movedReportAction = ReportUtils.buildOptimisticMovedReportAction(oldPersonalPolicyID, policyID, memberData.workspaceChatReportID, iouReportID, workspaceName, true);
    var movedIouReportAction = ReportUtils.buildOptimisticMovedReportAction(oldPersonalPolicyID, policyID, memberData.workspaceChatReportID, iouReportID, workspaceName);
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(iouReport.reportID),
        value: (_k = {}, _k[movedIouReportAction.reportActionID] = movedIouReportAction, _k),
    });
    successData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(iouReport.reportID),
        value: (_l = {},
            _l[movedIouReportAction.reportActionID] = __assign(__assign({}, movedIouReportAction), { pendingAction: null }),
            _l),
    });
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(iouReport.reportID),
        value: (_m = {}, _m[movedIouReportAction.reportActionID] = null, _m),
    });
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(oldChatReportID),
        value: (_o = {}, _o[movedReportAction.reportActionID] = movedReportAction, _o),
    });
    successData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(oldChatReportID),
        value: (_p = {},
            _p[movedReportAction.reportActionID] = __assign(__assign({}, movedReportAction), { pendingAction: null }),
            _p),
    });
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(oldChatReportID),
        value: (_q = {}, _q[movedReportAction.reportActionID] = null, _q),
    });
    // We know that this new workspace has no BankAccount yet, so we can set
    // the reimbursement account to be immediately in the setup state for a new bank account:
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT),
        value: {
            isLoading: false,
            achData: {
                currentStep: CONST_1.default.BANK_ACCOUNT.STEP.BANK_ACCOUNT,
                policyID: policyID,
                subStep: '',
            },
        },
    });
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.SET,
        key: "".concat(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT),
        value: CONST_1.default.REIMBURSEMENT_ACCOUNT.DEFAULT_DATA,
    });
    var params = {
        policyID: policyID,
        adminsChatReportID: adminsChatReportID,
        expenseChatReportID: workspaceChatReportID,
        ownerEmail: '',
        makeMeAdmin: false,
        policyName: workspaceName,
        type: CONST_1.default.POLICY.TYPE.TEAM,
        adminsCreatedReportActionID: adminsCreatedReportActionID,
        expenseCreatedReportActionID: workspaceChatCreatedReportActionID,
        customUnitID: customUnitID,
        customUnitRateID: customUnitRateID,
        iouReportID: iouReportID,
        memberData: JSON.stringify(memberData),
        reportActionID: movedReportAction.reportActionID,
        expenseMovedReportActionID: movedIouReportAction.reportActionID,
    };
    API.write(types_1.WRITE_COMMANDS.CREATE_WORKSPACE_FROM_IOU_PAYMENT, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
    return { policyID: policyID, workspaceChatReportID: memberData.workspaceChatReportID, reportPreviewReportActionID: reportPreview === null || reportPreview === void 0 ? void 0 : reportPreview.reportActionID, adminsChatReportID: adminsChatReportID };
}
function enablePolicyConnections(policyID, enabled) {
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    areConnectionsEnabled: enabled,
                    pendingFields: {
                        areConnectionsEnabled: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    pendingFields: {
                        areConnectionsEnabled: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    areConnectionsEnabled: !enabled,
                    pendingFields: {
                        areConnectionsEnabled: null,
                    },
                },
            },
        ],
    };
    var parameters = { policyID: policyID, enabled: enabled };
    API.writeWithNoDuplicatesEnableFeatureConflicts(types_1.WRITE_COMMANDS.ENABLE_POLICY_CONNECTIONS, parameters, onyxData);
    if (enabled && (0, getIsNarrowLayout_1.default)()) {
        (0, PolicyUtils_1.goBackWhenEnableFeature)(policyID);
    }
}
/** Save the preferred export method for a policy */
function savePreferredExportMethod(policyID, exportMethod) {
    var _a;
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.LAST_EXPORT_METHOD), (_a = {}, _a[policyID] = exportMethod, _a));
}
function enableExpensifyCard(policyID, enabled, shouldNavigateToExpensifyCardPage) {
    if (shouldNavigateToExpensifyCardPage === void 0) { shouldNavigateToExpensifyCardPage = false; }
    var authToken = NetworkStore.getAuthToken();
    if (!authToken) {
        return;
    }
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    areExpensifyCardsEnabled: enabled,
                    pendingFields: {
                        areExpensifyCardsEnabled: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    pendingFields: {
                        areExpensifyCardsEnabled: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    areExpensifyCardsEnabled: !enabled,
                    pendingFields: {
                        areExpensifyCardsEnabled: null,
                    },
                },
            },
        ],
    };
    var parameters = { authToken: authToken, policyID: policyID, enabled: enabled };
    API.writeWithNoDuplicatesEnableFeatureConflicts(types_1.WRITE_COMMANDS.ENABLE_POLICY_EXPENSIFY_CARDS, parameters, onyxData);
    if (enabled && shouldNavigateToExpensifyCardPage) {
        (0, PolicyUtils_1.navigateToExpensifyCardPage)(policyID);
        return;
    }
    if (enabled && (0, getIsNarrowLayout_1.default)()) {
        (0, PolicyUtils_1.goBackWhenEnableFeature)(policyID);
    }
}
function enableCompanyCards(policyID, enabled, shouldGoBack) {
    if (shouldGoBack === void 0) { shouldGoBack = true; }
    var authToken = NetworkStore.getAuthToken();
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    areCompanyCardsEnabled: enabled,
                    pendingFields: {
                        areCompanyCardsEnabled: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    pendingFields: {
                        areCompanyCardsEnabled: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    areCompanyCardsEnabled: !enabled,
                    pendingFields: {
                        areCompanyCardsEnabled: null,
                    },
                },
            },
        ],
    };
    var parameters = { authToken: authToken, policyID: policyID, enabled: enabled };
    API.writeWithNoDuplicatesEnableFeatureConflicts(types_1.WRITE_COMMANDS.ENABLE_POLICY_COMPANY_CARDS, parameters, onyxData);
    if (enabled && (0, getIsNarrowLayout_1.default)() && shouldGoBack) {
        (0, PolicyUtils_1.goBackWhenEnableFeature)(policyID);
    }
}
function enablePolicyReportFields(policyID, enabled) {
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    areReportFieldsEnabled: enabled,
                    pendingFields: {
                        areReportFieldsEnabled: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    pendingFields: {
                        areReportFieldsEnabled: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    areReportFieldsEnabled: !enabled,
                    pendingFields: {
                        areReportFieldsEnabled: null,
                    },
                },
            },
        ],
    };
    var parameters = { policyID: policyID, enabled: enabled };
    API.writeWithNoDuplicatesEnableFeatureConflicts(types_1.WRITE_COMMANDS.ENABLE_POLICY_REPORT_FIELDS, parameters, onyxData);
}
function enablePolicyTaxes(policyID, enabled) {
    var _a, _b, _c;
    var defaultTaxRates = CONST_1.default.DEFAULT_TAX;
    var taxRatesData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    taxRates: __assign(__assign({}, defaultTaxRates), { taxes: __assign({}, Object.keys(defaultTaxRates.taxes).reduce(function (acc, taxKey) {
                            acc[taxKey] = __assign(__assign({}, defaultTaxRates.taxes[taxKey]), { pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD });
                            return acc;
                        }, {})) }),
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    taxRates: {
                        taxes: __assign({}, Object.keys(defaultTaxRates.taxes).reduce(function (acc, taxKey) {
                            acc[taxKey] = { pendingAction: null };
                            return acc;
                        }, {})),
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    taxRates: undefined,
                },
            },
        ],
    };
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var shouldAddDefaultTaxRatesData = (!(policy === null || policy === void 0 ? void 0 : policy.taxRates) || (0, EmptyObject_1.isEmptyObject)(policy.taxRates)) && enabled;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                tax: {
                    trackingEnabled: enabled,
                },
                pendingFields: {
                    tax: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        },
    ];
    optimisticData.push.apply(optimisticData, (shouldAddDefaultTaxRatesData ? ((_a = taxRatesData.optimisticData) !== null && _a !== void 0 ? _a : []) : []));
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                pendingFields: {
                    tax: null,
                },
            },
        },
    ];
    successData.push.apply(successData, (shouldAddDefaultTaxRatesData ? ((_b = taxRatesData.successData) !== null && _b !== void 0 ? _b : []) : []));
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                tax: {
                    trackingEnabled: !enabled,
                },
                pendingFields: {
                    tax: null,
                },
            },
        },
    ];
    failureData.push.apply(failureData, (shouldAddDefaultTaxRatesData ? ((_c = taxRatesData.failureData) !== null && _c !== void 0 ? _c : []) : []));
    var onyxData = {
        optimisticData: optimisticData,
        successData: successData,
        failureData: failureData,
    };
    var parameters = { policyID: policyID, enabled: enabled };
    if (shouldAddDefaultTaxRatesData) {
        parameters.taxFields = JSON.stringify(defaultTaxRates);
    }
    API.writeWithNoDuplicatesEnableFeatureConflicts(types_1.WRITE_COMMANDS.ENABLE_POLICY_TAXES, parameters, onyxData);
    if (enabled && (0, getIsNarrowLayout_1.default)()) {
        (0, PolicyUtils_1.goBackWhenEnableFeature)(policyID);
    }
}
function enablePolicyWorkflows(policyID, enabled) {
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: __assign(__assign({ areWorkflowsEnabled: enabled }, (!enabled
                    ? {
                        approvalMode: CONST_1.default.POLICY.APPROVAL_MODE.OPTIONAL,
                        autoReporting: false,
                        autoReportingFrequency: CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
                        harvesting: {
                            enabled: false,
                        },
                        reimbursementChoice: CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO,
                    }
                    : {})), { pendingFields: __assign({ areWorkflowsEnabled: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE }, (!enabled
                        ? {
                            approvalMode: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            autoReporting: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            autoReportingFrequency: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            harvesting: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            reimbursementChoice: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        }
                        : {})) }),
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    pendingFields: __assign({ areWorkflowsEnabled: null }, (!enabled
                        ? {
                            approvalMode: null,
                            autoReporting: null,
                            autoReportingFrequency: null,
                            harvesting: null,
                            reimbursementChoice: null,
                        }
                        : {})),
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: __assign(__assign({ areWorkflowsEnabled: !enabled }, (!enabled
                    ? {
                        approvalMode: policy === null || policy === void 0 ? void 0 : policy.approvalMode,
                        autoReporting: policy === null || policy === void 0 ? void 0 : policy.autoReporting,
                        autoReportingFrequency: policy === null || policy === void 0 ? void 0 : policy.autoReportingFrequency,
                        harvesting: policy === null || policy === void 0 ? void 0 : policy.harvesting,
                        reimbursementChoice: policy === null || policy === void 0 ? void 0 : policy.reimbursementChoice,
                    }
                    : {})), { pendingFields: __assign({ areWorkflowsEnabled: null }, (!enabled
                        ? {
                            approvalMode: null,
                            autoReporting: null,
                            autoReportingFrequency: null,
                            harvesting: null,
                            reimbursementChoice: null,
                        }
                        : {})) }),
            },
        ],
    };
    var parameters = { policyID: policyID, enabled: enabled };
    // When disabling workflows, set autoreporting back to "immediately"
    if (!enabled) {
        setWorkspaceAutoReportingFrequency(policyID, CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT);
    }
    API.writeWithNoDuplicatesEnableFeatureConflicts(types_1.WRITE_COMMANDS.ENABLE_POLICY_WORKFLOWS, parameters, onyxData);
    if (enabled && (0, getIsNarrowLayout_1.default)()) {
        (0, PolicyUtils_1.goBackWhenEnableFeature)(policyID);
    }
}
var DISABLED_MAX_EXPENSE_VALUES = {
    maxExpenseAmountNoReceipt: CONST_1.default.DISABLED_MAX_EXPENSE_VALUE,
    maxExpenseAmount: CONST_1.default.DISABLED_MAX_EXPENSE_VALUE,
    maxExpenseAge: CONST_1.default.DISABLED_MAX_EXPENSE_VALUE,
};
function enablePolicyRules(policyID, enabled, shouldGoBack) {
    if (shouldGoBack === void 0) { shouldGoBack = true; }
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: __assign(__assign({ areRulesEnabled: enabled, preventSelfApproval: false }, (!enabled ? DISABLED_MAX_EXPENSE_VALUES : {})), { pendingFields: {
                        areRulesEnabled: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    } }),
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    pendingFields: {
                        areRulesEnabled: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: __assign(__assign({ areRulesEnabled: !enabled, preventSelfApproval: policy === null || policy === void 0 ? void 0 : policy.preventSelfApproval }, (!enabled
                    ? {
                        maxExpenseAmountNoReceipt: policy === null || policy === void 0 ? void 0 : policy.maxExpenseAmountNoReceipt,
                        maxExpenseAmount: policy === null || policy === void 0 ? void 0 : policy.maxExpenseAmount,
                        maxExpenseAge: policy === null || policy === void 0 ? void 0 : policy.maxExpenseAge,
                    }
                    : {})), { pendingFields: {
                        areRulesEnabled: null,
                    } }),
            },
        ],
    };
    var parameters = { policyID: policyID, enabled: enabled };
    API.writeWithNoDuplicatesEnableFeatureConflicts(types_1.WRITE_COMMANDS.SET_POLICY_RULES_ENABLED, parameters, onyxData);
    if (enabled && (0, getIsNarrowLayout_1.default)() && shouldGoBack) {
        (0, PolicyUtils_1.goBackWhenEnableFeature)(policyID);
    }
}
function enableDistanceRequestTax(policyID, customUnitName, customUnitID, attributes) {
    var _a, _b, _c;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    customUnits: (_a = {},
                        _a[customUnitID] = {
                            attributes: attributes,
                            pendingFields: {
                                taxEnabled: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                        },
                        _a),
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    customUnits: (_b = {},
                        _b[customUnitID] = {
                            pendingFields: {
                                taxEnabled: null,
                            },
                        },
                        _b),
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    customUnits: (_c = {},
                        _c[customUnitID] = {
                            attributes: (policy === null || policy === void 0 ? void 0 : policy.customUnits) ? policy === null || policy === void 0 ? void 0 : policy.customUnits[customUnitID].attributes : null,
                            errorFields: {
                                taxEnabled: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                        _c),
                },
            },
        ],
    };
    var params = {
        policyID: policyID,
        customUnit: JSON.stringify({
            customUnitName: customUnitName,
            customUnitID: customUnitID,
            attributes: attributes,
        }),
    };
    API.write(types_1.WRITE_COMMANDS.ENABLE_DISTANCE_REQUEST_TAX, params, onyxData);
}
function enablePolicyInvoicing(policyID, enabled) {
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    areInvoicesEnabled: enabled,
                    pendingFields: {
                        areInvoicesEnabled: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    pendingFields: {
                        areInvoicesEnabled: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    areInvoicesEnabled: !enabled,
                    pendingFields: {
                        areInvoicesEnabled: null,
                    },
                },
            },
        ],
    };
    var parameters = { policyID: policyID, enabled: enabled };
    API.writeWithNoDuplicatesEnableFeatureConflicts(types_1.WRITE_COMMANDS.ENABLE_POLICY_INVOICING, parameters, onyxData);
    if (enabled && (0, getIsNarrowLayout_1.default)()) {
        (0, PolicyUtils_1.goBackWhenEnableFeature)(policyID);
    }
}
function openPolicyMoreFeaturesPage(policyID) {
    var params = { policyID: policyID };
    API.read(types_1.READ_COMMANDS.OPEN_POLICY_MORE_FEATURES_PAGE, params);
}
function openPolicyProfilePage(policyID) {
    var params = { policyID: policyID };
    API.read(types_1.READ_COMMANDS.OPEN_POLICY_PROFILE_PAGE, params);
}
function openPolicyInitialPage(policyID) {
    var params = { policyID: policyID };
    API.read(types_1.READ_COMMANDS.OPEN_POLICY_INITIAL_PAGE, params);
}
function setPolicyCustomTaxName(policyID, customTaxName) {
    var _a;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var originalCustomTaxName = (_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.name;
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    taxRates: {
                        name: customTaxName,
                        pendingFields: { name: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE },
                        errorFields: null,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    taxRates: {
                        pendingFields: { name: null },
                        errorFields: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    taxRates: {
                        name: originalCustomTaxName,
                        pendingFields: { name: null },
                        errorFields: { name: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage') },
                    },
                },
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        customTaxName: customTaxName,
    };
    API.write(types_1.WRITE_COMMANDS.SET_POLICY_CUSTOM_TAX_NAME, parameters, onyxData);
}
function setWorkspaceCurrencyDefault(policyID, taxCode) {
    var _a;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var originalDefaultExternalID = (_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.defaultExternalID;
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    taxRates: {
                        defaultExternalID: taxCode,
                        pendingFields: { defaultExternalID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE },
                        errorFields: null,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    taxRates: {
                        pendingFields: { defaultExternalID: null },
                        errorFields: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    taxRates: {
                        defaultExternalID: originalDefaultExternalID,
                        pendingFields: { defaultExternalID: null },
                        errorFields: { defaultExternalID: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage') },
                    },
                },
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        taxCode: taxCode,
    };
    API.write(types_1.WRITE_COMMANDS.SET_POLICY_TAXES_CURRENCY_DEFAULT, parameters, onyxData);
}
function setForeignCurrencyDefault(policyID, taxCode) {
    var _a;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var originalDefaultForeignCurrencyID = (_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.foreignTaxDefault;
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    taxRates: {
                        foreignTaxDefault: taxCode,
                        pendingFields: { foreignTaxDefault: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE },
                        errorFields: null,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    taxRates: {
                        pendingFields: { foreignTaxDefault: null },
                        errorFields: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    taxRates: {
                        foreignTaxDefault: originalDefaultForeignCurrencyID,
                        pendingFields: { foreignTaxDefault: null },
                        errorFields: { foreignTaxDefault: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage') },
                    },
                },
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        taxCode: taxCode,
    };
    API.write(types_1.WRITE_COMMANDS.SET_POLICY_TAXES_FOREIGN_CURRENCY_DEFAULT, parameters, onyxData);
}
function upgradeToCorporate(policyID, featureName) {
    var _a, _b, _c, _d, _e;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "policy_".concat(policyID),
            value: {
                isPendingUpgrade: true,
                type: CONST_1.default.POLICY.TYPE.CORPORATE,
                maxExpenseAge: CONST_1.default.POLICY.DEFAULT_MAX_EXPENSE_AGE,
                maxExpenseAmount: CONST_1.default.POLICY.DEFAULT_MAX_EXPENSE_AMOUNT,
                maxExpenseAmountNoReceipt: CONST_1.default.POLICY.DEFAULT_MAX_AMOUNT_NO_RECEIPT,
                glCodes: true,
                harvesting: {
                    enabled: false,
                },
                isAttendeeTrackingEnabled: false,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "policy_".concat(policyID),
            value: {
                isPendingUpgrade: false,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "policy_".concat(policyID),
            value: {
                isPendingUpgrade: false,
                type: policy === null || policy === void 0 ? void 0 : policy.type,
                maxExpenseAge: (_a = policy === null || policy === void 0 ? void 0 : policy.maxExpenseAge) !== null && _a !== void 0 ? _a : null,
                maxExpenseAmount: (_b = policy === null || policy === void 0 ? void 0 : policy.maxExpenseAmount) !== null && _b !== void 0 ? _b : null,
                maxExpenseAmountNoReceipt: (_c = policy === null || policy === void 0 ? void 0 : policy.maxExpenseAmountNoReceipt) !== null && _c !== void 0 ? _c : null,
                glCodes: (_d = policy === null || policy === void 0 ? void 0 : policy.glCodes) !== null && _d !== void 0 ? _d : null,
                harvesting: (_e = policy === null || policy === void 0 ? void 0 : policy.harvesting) !== null && _e !== void 0 ? _e : null,
                isAttendeeTrackingEnabled: null,
            },
        },
    ];
    var parameters = __assign({ policyID: policyID }, (featureName ? { featureName: featureName } : {}));
    API.write(types_1.WRITE_COMMANDS.UPGRADE_TO_CORPORATE, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function downgradeToTeam(policyID) {
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "policy_".concat(policyID),
            value: {
                isPendingDowngrade: true,
                type: CONST_1.default.POLICY.TYPE.TEAM,
                isAttendeeTrackingEnabled: null,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "policy_".concat(policyID),
            value: {
                isPendingDowngrade: false,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "policy_".concat(policyID),
            value: {
                isPendingDowngrade: false,
                type: policy === null || policy === void 0 ? void 0 : policy.type,
                isAttendeeTrackingEnabled: policy === null || policy === void 0 ? void 0 : policy.isAttendeeTrackingEnabled,
            },
        },
    ];
    var parameters = { policyID: policyID };
    API.write(types_1.WRITE_COMMANDS.DOWNGRADE_TO_TEAM, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function setWorkspaceDefaultSpendCategory(policyID, groupID, category) {
    var _a, _b, _c;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    if (!policy) {
        return;
    }
    var mccGroup = policy.mccGroup;
    var optimisticData = mccGroup
        ? [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "policy_".concat(policyID),
                value: {
                    mccGroup: __assign(__assign({}, mccGroup), (_a = {}, _a[groupID] = {
                        category: category,
                        groupID: groupID,
                        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    }, _a)),
                },
            },
        ]
        : [];
    var failureData = mccGroup
        ? [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "policy_".concat(policyID),
                value: {
                    mccGroup: __assign(__assign({}, mccGroup), (_b = {}, _b[groupID] = __assign(__assign({}, mccGroup[groupID]), { pendingAction: null }), _b)),
                },
            },
        ]
        : [];
    var successData = mccGroup
        ? [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "policy_".concat(policyID),
                value: {
                    mccGroup: (_c = {},
                        _c[groupID] = {
                            pendingAction: null,
                        },
                        _c),
                },
            },
        ]
        : [];
    API.write(types_1.WRITE_COMMANDS.SET_WORKSPACE_DEFAULT_SPEND_CATEGORY, { policyID: policyID, groupID: groupID, category: category }, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
/**
 * Call the API to set the receipt required amount for the given policy
 * @param policyID - id of the policy to set the receipt required amount
 * @param maxExpenseAmountNoReceipt - new value of the receipt required amount
 */
function setPolicyMaxExpenseAmountNoReceipt(policyID, maxExpenseAmountNoReceipt) {
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var parsedMaxExpenseAmountNoReceipt = maxExpenseAmountNoReceipt === '' ? CONST_1.default.DISABLED_MAX_EXPENSE_VALUE : CurrencyUtils.convertToBackendAmount(parseFloat(maxExpenseAmountNoReceipt));
    var originalMaxExpenseAmountNoReceipt = policy === null || policy === void 0 ? void 0 : policy.maxExpenseAmountNoReceipt;
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    maxExpenseAmountNoReceipt: parsedMaxExpenseAmountNoReceipt,
                    pendingFields: {
                        maxExpenseAmountNoReceipt: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    pendingFields: { maxExpenseAmountNoReceipt: null },
                    errorFields: null,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    maxExpenseAmountNoReceipt: originalMaxExpenseAmountNoReceipt,
                    pendingFields: { maxExpenseAmountNoReceipt: null },
                    errorFields: { maxExpenseAmountNoReceipt: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage') },
                },
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        maxExpenseAmountNoReceipt: parsedMaxExpenseAmountNoReceipt,
    };
    API.write(types_1.WRITE_COMMANDS.SET_POLICY_EXPENSE_MAX_AMOUNT_NO_RECEIPT, parameters, onyxData);
}
/**
 * Call the API to set the max expense amount for the given policy
 * @param policyID - id of the policy to set the max expense amount
 * @param maxExpenseAmount - new value of the max expense amount
 */
function setPolicyMaxExpenseAmount(policyID, maxExpenseAmount) {
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var parsedMaxExpenseAmount = maxExpenseAmount === '' ? CONST_1.default.DISABLED_MAX_EXPENSE_VALUE : CurrencyUtils.convertToBackendAmount(parseFloat(maxExpenseAmount));
    var originalMaxExpenseAmount = policy === null || policy === void 0 ? void 0 : policy.maxExpenseAmount;
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    maxExpenseAmount: parsedMaxExpenseAmount,
                    pendingFields: {
                        maxExpenseAmount: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    pendingFields: { maxExpenseAmount: null },
                    errorFields: null,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    maxExpenseAmount: originalMaxExpenseAmount,
                    pendingFields: { maxExpenseAmount: null },
                    errorFields: { maxExpenseAmount: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage') },
                },
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        maxExpenseAmount: parsedMaxExpenseAmount,
    };
    API.write(types_1.WRITE_COMMANDS.SET_POLICY_EXPENSE_MAX_AMOUNT, parameters, onyxData);
}
/**
 *
 * @param policyID
 * @param prohibitedExpense
 */
function setPolicyProhibitedExpense(policyID, prohibitedExpense) {
    var _a, _b, _c;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var originalProhibitedExpenses = policy === null || policy === void 0 ? void 0 : policy.prohibitedExpenses;
    var prohibitedExpenses = __assign(__assign({}, originalProhibitedExpenses), (_a = {}, _a[prohibitedExpense] = !(originalProhibitedExpenses === null || originalProhibitedExpenses === void 0 ? void 0 : originalProhibitedExpenses[prohibitedExpense]), _a));
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    prohibitedExpenses: __assign(__assign({}, prohibitedExpenses), { pendingFields: (_b = {},
                            _b[prohibitedExpense] = CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            _b) }),
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    prohibitedExpenses: {
                        pendingFields: (_c = {},
                            _c[prohibitedExpense] = null,
                            _c),
                    },
                    errorFields: null,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    prohibitedExpenses: originalProhibitedExpenses,
                    errorFields: { prohibitedExpenses: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage') },
                },
            },
        ],
    };
    // Remove pendingFields before sending to the API
    var pendingFields = prohibitedExpenses.pendingFields, prohibitedExpensesWithoutPendingFields = __rest(prohibitedExpenses, ["pendingFields"]);
    var parameters = {
        policyID: policyID,
        prohibitedExpenses: JSON.stringify(prohibitedExpensesWithoutPendingFields),
    };
    API.write(types_1.WRITE_COMMANDS.SET_POLICY_PROHIBITED_EXPENSES, parameters, onyxData);
}
/**
 * Call the API to set the max expense age for the given policy
 * @param policyID - id of the policy to set the max expense age
 * @param maxExpenseAge - the max expense age value given in days
 */
function setPolicyMaxExpenseAge(policyID, maxExpenseAge) {
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var parsedMaxExpenseAge = maxExpenseAge === '' ? CONST_1.default.DISABLED_MAX_EXPENSE_VALUE : parseInt(maxExpenseAge, 10);
    var originalMaxExpenseAge = policy === null || policy === void 0 ? void 0 : policy.maxExpenseAge;
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    maxExpenseAge: parsedMaxExpenseAge,
                    pendingFields: {
                        maxExpenseAge: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    pendingFields: {
                        maxExpenseAge: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    maxExpenseAge: originalMaxExpenseAge,
                    pendingFields: { maxExpenseAge: null },
                    errorFields: { maxExpenseAge: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage') },
                },
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        maxExpenseAge: parsedMaxExpenseAge,
    };
    API.write(types_1.WRITE_COMMANDS.SET_POLICY_EXPENSE_MAX_AGE, parameters, onyxData);
}
/**
 * Call the API to set the custom rules for the given policy
 * @param policyID - id of the policy to set the max expense age
 * @param customRules - the custom rules description in natural language
 */
function updateCustomRules(policyID, customRules) {
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var originalCustomRules = policy === null || policy === void 0 ? void 0 : policy.customRules;
    var parsedCustomRules = ReportUtils.getParsedComment(customRules);
    if (parsedCustomRules === originalCustomRules) {
        return;
    }
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    customRules: parsedCustomRules,
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    pendingFields: {
                    // TODO
                    // maxExpenseAge: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    customRules: originalCustomRules,
                    // TODO
                    // pendingFields: {maxExpenseAge: null},
                    // errorFields: {maxExpenseAge: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
                },
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        description: parsedCustomRules,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_CUSTOM_RULES, parameters, onyxData);
}
/**
 * Call the API to enable or disable the billable mode for the given policy
 * @param policyID - id of the policy to enable or disable the billable mode
 * @param defaultBillable - whether the billable mode is enabled in the given policy
 */
function setPolicyBillableMode(policyID, defaultBillable) {
    var _a;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var originalDefaultBillable = policy === null || policy === void 0 ? void 0 : policy.defaultBillable;
    var originalDefaultBillableDisabled = (_a = policy === null || policy === void 0 ? void 0 : policy.disabledFields) === null || _a === void 0 ? void 0 : _a.defaultBillable;
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    defaultBillable: defaultBillable,
                    disabledFields: {
                        defaultBillable: false,
                    },
                    pendingFields: {
                        defaultBillable: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        disabledFields: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    pendingFields: {
                        defaultBillable: null,
                        disabledFields: null,
                    },
                    errorFields: null,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    disabledFields: { defaultBillable: originalDefaultBillableDisabled },
                    defaultBillable: originalDefaultBillable,
                    pendingFields: { defaultBillable: null, disabledFields: null },
                    errorFields: { defaultBillable: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage') },
                },
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        defaultBillable: defaultBillable,
        disabledFields: JSON.stringify({
            defaultBillable: false,
        }),
    };
    API.write(types_1.WRITE_COMMANDS.SET_POLICY_BILLABLE_MODE, parameters, onyxData);
}
/**
 * Call the API to disable the billable mode for the given policy
 * @param policyID - id of the policy to enable or disable the billable mode
 */
function disableWorkspaceBillableExpenses(policyID) {
    var _a;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var originalDefaultBillableDisabled = (_a = policy === null || policy === void 0 ? void 0 : policy.disabledFields) === null || _a === void 0 ? void 0 : _a.defaultBillable;
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    disabledFields: {
                        defaultBillable: true,
                    },
                    pendingFields: {
                        disabledFields: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    pendingFields: {
                        disabledFields: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    pendingFields: { disabledFields: null },
                    disabledFields: { defaultBillable: originalDefaultBillableDisabled },
                },
            },
        ],
    };
    var parameters = {
        policyID: policyID,
    };
    API.write(types_1.WRITE_COMMANDS.DISABLE_POLICY_BILLABLE_MODE, parameters, onyxData);
}
function setWorkspaceEReceiptsEnabled(policyID, enabled) {
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var originalEReceipts = policy === null || policy === void 0 ? void 0 : policy.eReceipts;
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    eReceipts: enabled,
                    pendingFields: {
                        eReceipts: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    pendingFields: {
                        eReceipts: null,
                    },
                    errorFields: null,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    eReceipts: originalEReceipts,
                    pendingFields: { defaultBillable: null },
                    errorFields: { defaultBillable: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage') },
                },
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        enabled: enabled,
    };
    API.write(types_1.WRITE_COMMANDS.SET_WORKSPACE_ERECEIPTS_ENABLED, parameters, onyxData);
}
function setPolicyAttendeeTrackingEnabled(policyID, isAttendeeTrackingEnabled) {
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var originalIsAttendeeTrackingEnabled = !!(policy === null || policy === void 0 ? void 0 : policy.isAttendeeTrackingEnabled);
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    isAttendeeTrackingEnabled: isAttendeeTrackingEnabled,
                    pendingFields: {
                        isAttendeeTrackingEnabled: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    pendingFields: {
                        isAttendeeTrackingEnabled: null,
                    },
                    errorFields: null,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    isAttendeeTrackingEnabled: originalIsAttendeeTrackingEnabled,
                    pendingFields: { isAttendeeTrackingEnabled: null },
                    errorFields: { isAttendeeTrackingEnabled: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage') },
                },
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        enabled: isAttendeeTrackingEnabled,
    };
    API.write(types_1.WRITE_COMMANDS.SET_POLICY_ATTENDEE_TRACKING_ENABLED, parameters, onyxData);
}
function getAdminPolicies() {
    return Object.values(allPolicies !== null && allPolicies !== void 0 ? allPolicies : {}).filter(function (policy) { return !!policy && policy.role === CONST_1.default.POLICY.ROLE.ADMIN && policy.type !== CONST_1.default.POLICY.TYPE.PERSONAL; });
}
function getAdminPoliciesConnectedToSageIntacct() {
    return Object.values(allPolicies !== null && allPolicies !== void 0 ? allPolicies : {}).filter(function (policy) { var _a; return !!policy && policy.role === CONST_1.default.POLICY.ROLE.ADMIN && !!((_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.intacct); });
}
function getAdminPoliciesConnectedToNetSuite() {
    return Object.values(allPolicies !== null && allPolicies !== void 0 ? allPolicies : {}).filter(function (policy) { var _a; return !!policy && policy.role === CONST_1.default.POLICY.ROLE.ADMIN && !!((_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.netsuite); });
}
/**
 * Call the API to set default report title pattern for the given policy
 * @param policyID - id of the policy to apply the naming pattern to
 * @param customName - name pattern to be used for the reports
 */
function setPolicyDefaultReportTitle(policyID, customName) {
    var _a, _b, _c;
    var _d, _e, _f, _g;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    if (customName === ((_e = (_d = policy === null || policy === void 0 ? void 0 : policy.fieldList) === null || _d === void 0 ? void 0 : _d[CONST_1.default.POLICY.FIELDS.FIELD_LIST_TITLE]) === null || _e === void 0 ? void 0 : _e.defaultValue)) {
        return;
    }
    var previousReportTitleField = (_g = (_f = policy === null || policy === void 0 ? void 0 : policy.fieldList) === null || _f === void 0 ? void 0 : _f[CONST_1.default.POLICY.FIELDS.FIELD_LIST_TITLE]) !== null && _g !== void 0 ? _g : {};
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                fieldList: (_a = {},
                    _a[CONST_1.default.POLICY.FIELDS.FIELD_LIST_TITLE] = {
                        defaultValue: customName,
                        pendingFields: { defaultValue: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE },
                    },
                    _a),
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                fieldList: (_b = {},
                    _b[CONST_1.default.POLICY.FIELDS.FIELD_LIST_TITLE] = { pendingFields: { defaultValue: null } },
                    _b),
                errorFields: null,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                fieldList: (_c = {},
                    _c[CONST_1.default.POLICY.FIELDS.FIELD_LIST_TITLE] = __assign(__assign({}, previousReportTitleField), { pendingFields: { defaultValue: null } }),
                    _c),
                errorFields: {
                    fieldList: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        },
    ];
    var parameters = {
        value: customName,
        policyID: policyID,
    };
    API.write(types_1.WRITE_COMMANDS.SET_POLICY_DEFAULT_REPORT_TITLE, parameters, {
        optimisticData: optimisticData,
        successData: successData,
        failureData: failureData,
    });
}
/**
 * Call the API to enable or disable enforcing the naming pattern for member created reports on a policy
 * @param policyID - id of the policy to apply the naming pattern to
 * @param enforced - flag whether to enforce policy name
 */
function setPolicyPreventMemberCreatedTitle(policyID, enforced) {
    var _a, _b, _c;
    var _d, _e, _f;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    if (!enforced === ((_d = policy === null || policy === void 0 ? void 0 : policy.fieldList) === null || _d === void 0 ? void 0 : _d[CONST_1.default.POLICY.FIELDS.FIELD_LIST_TITLE].deletable)) {
        return;
    }
    var previousReportTitleField = (_f = (_e = policy === null || policy === void 0 ? void 0 : policy.fieldList) === null || _e === void 0 ? void 0 : _e[CONST_1.default.POLICY.FIELDS.FIELD_LIST_TITLE]) !== null && _f !== void 0 ? _f : {};
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                fieldList: (_a = {},
                    _a[CONST_1.default.POLICY.FIELDS.FIELD_LIST_TITLE] = __assign(__assign({}, previousReportTitleField), { deletable: !enforced, pendingFields: { deletable: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE } }),
                    _a),
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                fieldList: (_b = {},
                    _b[CONST_1.default.POLICY.FIELDS.FIELD_LIST_TITLE] = { pendingFields: { deletable: null } },
                    _b),
                errorFields: null,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                fieldList: (_c = {},
                    _c[CONST_1.default.POLICY.FIELDS.FIELD_LIST_TITLE] = __assign(__assign({}, previousReportTitleField), { pendingFields: { deletable: null } }),
                    _c),
                errorFields: {
                    fieldList: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        },
    ];
    var parameters = {
        enforced: enforced,
        policyID: policyID,
    };
    API.write(types_1.WRITE_COMMANDS.SET_POLICY_PREVENT_MEMBER_CREATED_TITLE, parameters, {
        optimisticData: optimisticData,
        successData: successData,
        failureData: failureData,
    });
}
/**
 * Call the API to enable or disable self approvals for the reports
 * @param policyID - id of the policy to apply the naming pattern to
 * @param preventSelfApproval - flag whether to prevent workspace members from approving their own expense reports
 */
function setPolicyPreventSelfApproval(policyID, preventSelfApproval) {
    var _a;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    if (preventSelfApproval === (policy === null || policy === void 0 ? void 0 : policy.preventSelfApproval)) {
        return;
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                preventSelfApproval: preventSelfApproval,
                pendingFields: {
                    preventSelfApproval: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                pendingFields: {
                    preventSelfApproval: null,
                },
                errorFields: null,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                preventSelfApproval: (_a = policy === null || policy === void 0 ? void 0 : policy.preventSelfApproval) !== null && _a !== void 0 ? _a : false,
                pendingFields: {
                    preventSelfApproval: null,
                },
                errorFields: {
                    preventSelfApproval: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        },
    ];
    var parameters = {
        preventSelfApproval: preventSelfApproval,
        policyID: policyID,
    };
    API.write(types_1.WRITE_COMMANDS.SET_POLICY_PREVENT_SELF_APPROVAL, parameters, {
        optimisticData: optimisticData,
        successData: successData,
        failureData: failureData,
    });
}
/**
 * Call the API to apply automatic approval limit for the given policy
 * @param policyID - id of the policy to apply the limit to
 * @param limit - max amount for auto-approval of the reports in the given policy
 */
function setPolicyAutomaticApprovalLimit(policyID, limit) {
    var _a, _b, _c, _d;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var fallbackLimit = limit === '' ? '0' : limit;
    var parsedLimit = CurrencyUtils.convertToBackendAmount(parseFloat(fallbackLimit));
    if (parsedLimit === ((_b = (_a = policy === null || policy === void 0 ? void 0 : policy.autoApproval) === null || _a === void 0 ? void 0 : _a.limit) !== null && _b !== void 0 ? _b : CONST_1.default.POLICY.AUTO_APPROVE_REPORTS_UNDER_DEFAULT_CENTS)) {
        return;
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                autoApproval: {
                    limit: parsedLimit,
                    pendingFields: { limit: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE },
                },
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                autoApproval: {
                    pendingFields: {
                        limit: null,
                    },
                },
                errorFields: null,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                autoApproval: {
                    limit: (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.autoApproval) === null || _c === void 0 ? void 0 : _c.limit) !== null && _d !== void 0 ? _d : CONST_1.default.POLICY.AUTO_APPROVE_REPORTS_UNDER_DEFAULT_CENTS,
                    pendingFields: {
                        limit: null,
                    },
                },
                errorFields: {
                    autoApproval: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        },
    ];
    var parameters = {
        limit: parsedLimit,
        policyID: policyID,
    };
    API.write(types_1.WRITE_COMMANDS.SET_POLICY_AUTOMATIC_APPROVAL_LIMIT, parameters, {
        optimisticData: optimisticData,
        successData: successData,
        failureData: failureData,
    });
}
/**
 * Call the API to set the audit rate for the given policy
 * @param policyID - id of the policy to apply the limit to
 * @param auditRate - percentage of the reports to be qualified for a random audit
 */
function setPolicyAutomaticApprovalRate(policyID, auditRate) {
    var _a, _b, _c, _d;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var fallbackAuditRate = auditRate === '' ? '0' : auditRate;
    var parsedAuditRate = parseInt(fallbackAuditRate, 10) / 100;
    // The auditRate arrives as an int to this method so we will convert it to a float before sending it to the API.
    if (parsedAuditRate === ((_b = (_a = policy === null || policy === void 0 ? void 0 : policy.autoApproval) === null || _a === void 0 ? void 0 : _a.auditRate) !== null && _b !== void 0 ? _b : CONST_1.default.POLICY.RANDOM_AUDIT_DEFAULT_PERCENTAGE)) {
        return;
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                autoApproval: {
                    auditRate: parsedAuditRate,
                    pendingFields: {
                        auditRate: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                autoApproval: {
                    pendingFields: {
                        auditRate: null,
                    },
                },
                errorFields: null,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                autoApproval: {
                    auditRate: (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.autoApproval) === null || _c === void 0 ? void 0 : _c.auditRate) !== null && _d !== void 0 ? _d : CONST_1.default.POLICY.RANDOM_AUDIT_DEFAULT_PERCENTAGE,
                    pendingFields: {
                        auditRate: null,
                    },
                },
                errorFields: {
                    autoApproval: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        },
    ];
    var parameters = {
        auditRate: parsedAuditRate,
        policyID: policyID,
    };
    API.write(types_1.WRITE_COMMANDS.SET_POLICY_AUTOMATIC_APPROVAL_RATE, parameters, {
        optimisticData: optimisticData,
        successData: successData,
        failureData: failureData,
    });
}
/**
 * Call the API to enable auto-approval for the reports in the given policy
 * @param policyID - id of the policy to apply the limit to
 * @param enabled - whether auto-approve for the reports is enabled in the given policy
 */
function enableAutoApprovalOptions(policyID, enabled) {
    var _a, _b;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    if (enabled === (policy === null || policy === void 0 ? void 0 : policy.shouldShowAutoApprovalOptions)) {
        return;
    }
    var autoApprovalValues = { auditRate: CONST_1.default.POLICY.RANDOM_AUDIT_DEFAULT_PERCENTAGE, limit: CONST_1.default.POLICY.AUTO_APPROVE_REPORTS_UNDER_DEFAULT_CENTS };
    var autoApprovalFailureValues = { autoApproval: { limit: (_a = policy === null || policy === void 0 ? void 0 : policy.autoApproval) === null || _a === void 0 ? void 0 : _a.limit, auditRate: (_b = policy === null || policy === void 0 ? void 0 : policy.autoApproval) === null || _b === void 0 ? void 0 : _b.auditRate, pendingFields: null } };
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                autoApproval: __assign(__assign({}, autoApprovalValues), { pendingFields: {
                        limit: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        auditRate: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    } }),
                shouldShowAutoApprovalOptions: enabled,
                pendingFields: {
                    shouldShowAutoApprovalOptions: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                autoApproval: { pendingFields: null },
                pendingFields: {
                    shouldShowAutoApprovalOptions: null,
                },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: __assign(__assign({}, autoApprovalFailureValues), { shouldShowAutoApprovalOptions: policy === null || policy === void 0 ? void 0 : policy.shouldShowAutoApprovalOptions, pendingFields: {
                    shouldShowAutoApprovalOptions: null,
                } }),
        },
    ];
    var parameters = {
        enabled: enabled,
        policyID: policyID,
    };
    API.write(types_1.WRITE_COMMANDS.ENABLE_POLICY_AUTO_APPROVAL_OPTIONS, parameters, {
        optimisticData: optimisticData,
        successData: successData,
        failureData: failureData,
    });
}
/**
 * Call the API to set the limit for auto-payments in the given policy
 * @param policyID - id of the policy to apply the limit to
 * @param limit - max amount for auto-payment for the reports in the given policy
 */
function setPolicyAutoReimbursementLimit(policyID, limit) {
    var _a, _b, _c, _d;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var fallbackLimit = limit === '' ? '0' : limit;
    var parsedLimit = CurrencyUtils.convertToBackendAmount(parseFloat(fallbackLimit));
    if (parsedLimit === ((_b = (_a = policy === null || policy === void 0 ? void 0 : policy.autoReimbursement) === null || _a === void 0 ? void 0 : _a.limit) !== null && _b !== void 0 ? _b : CONST_1.default.POLICY.AUTO_REIMBURSEMENT_DEFAULT_LIMIT_CENTS)) {
        return;
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                autoReimbursement: {
                    limit: parsedLimit,
                    pendingFields: {
                        limit: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                autoReimbursement: {
                    limit: parsedLimit,
                    pendingFields: {
                        limit: null,
                    },
                },
                errorFields: null,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                autoReimbursement: { limit: (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.autoReimbursement) === null || _c === void 0 ? void 0 : _c.limit) !== null && _d !== void 0 ? _d : policy === null || policy === void 0 ? void 0 : policy.autoReimbursementLimit, pendingFields: { limit: null } },
                errorFields: {
                    autoReimbursement: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        },
    ];
    var parameters = {
        limit: parsedLimit,
        policyID: policyID,
    };
    API.write(types_1.WRITE_COMMANDS.SET_POLICY_AUTO_REIMBURSEMENT_LIMIT, parameters, {
        optimisticData: optimisticData,
        successData: successData,
        failureData: failureData,
    });
}
/**
 * Call the API to enable auto-payment for the reports in the given policy
 *
 * @param policyID - id of the policy to apply the limit to
 * @param enabled - whether auto-payment for the reports is enabled in the given policy
 */
function enablePolicyAutoReimbursementLimit(policyID, enabled) {
    var _a;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    if (enabled === (policy === null || policy === void 0 ? void 0 : policy.shouldShowAutoReimbursementLimitOption)) {
        return;
    }
    var autoReimbursementFailureValues = { autoReimbursement: { limit: (_a = policy === null || policy === void 0 ? void 0 : policy.autoReimbursement) === null || _a === void 0 ? void 0 : _a.limit, pendingFields: null } };
    var autoReimbursementValues = { limit: CONST_1.default.POLICY.AUTO_REIMBURSEMENT_DEFAULT_LIMIT_CENTS };
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                autoReimbursement: __assign(__assign({}, autoReimbursementValues), { pendingFields: {
                        limit: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    } }),
                shouldShowAutoReimbursementLimitOption: enabled,
                pendingFields: {
                    shouldShowAutoReimbursementLimitOption: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                autoReimbursement: { pendingFields: null },
                pendingFields: {
                    shouldShowAutoReimbursementLimitOption: null,
                },
                errorFields: null,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: __assign(__assign({}, autoReimbursementFailureValues), { shouldShowAutoReimbursementLimitOption: policy === null || policy === void 0 ? void 0 : policy.shouldShowAutoReimbursementLimitOption, pendingFields: {
                    shouldShowAutoReimbursementLimitOption: null,
                } }),
        },
    ];
    var parameters = {
        enabled: enabled,
        policyID: policyID,
    };
    API.write(types_1.WRITE_COMMANDS.ENABLE_POLICY_AUTO_REIMBURSEMENT_LIMIT, parameters, {
        optimisticData: optimisticData,
        successData: successData,
        failureData: failureData,
    });
}
function clearAllPolicies() {
    if (!allPolicies) {
        return;
    }
    Object.keys(allPolicies).forEach(function (key) { return delete allPolicies[key]; });
}
function updateInvoiceCompanyName(policyID, companyName) {
    var _a;
    var authToken = NetworkStore.getAuthToken();
    if (!authToken) {
        return;
    }
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                invoice: {
                    companyName: companyName,
                    pendingFields: {
                        companyName: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                invoice: {
                    pendingFields: {
                        companyName: null,
                    },
                },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                invoice: {
                    companyName: (_a = policy === null || policy === void 0 ? void 0 : policy.invoice) === null || _a === void 0 ? void 0 : _a.companyName,
                    pendingFields: {
                        companyName: null,
                    },
                },
            },
        },
    ];
    var parameters = {
        authToken: authToken,
        policyID: policyID,
        companyName: companyName,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_INVOICE_COMPANY_NAME, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function updateInvoiceCompanyWebsite(policyID, companyWebsite) {
    var _a;
    var authToken = NetworkStore.getAuthToken();
    if (!authToken) {
        return;
    }
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                invoice: {
                    companyWebsite: companyWebsite,
                    pendingFields: {
                        companyWebsite: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                invoice: {
                    pendingFields: {
                        companyWebsite: null,
                    },
                },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                invoice: {
                    companyWebsite: (_a = policy === null || policy === void 0 ? void 0 : policy.invoice) === null || _a === void 0 ? void 0 : _a.companyWebsite,
                    pendingFields: {
                        companyWebsite: null,
                    },
                },
            },
        },
    ];
    var parameters = {
        authToken: authToken,
        policyID: policyID,
        companyWebsite: companyWebsite,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_INVOICE_COMPANY_WEBSITE, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
/**
 * Validates user account and returns a list of accessible policies.
 */
function getAccessiblePolicies(validateCode) {
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES,
            value: {
                loading: true,
                errors: null,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES,
            value: {
                loading: false,
                errors: null,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES,
            value: {
                loading: false,
            },
        },
    ];
    var command = validateCode ? types_1.WRITE_COMMANDS.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES : types_1.WRITE_COMMANDS.GET_ACCESSIBLE_POLICIES;
    API.write(command, validateCode ? { validateCode: validateCode } : null, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
/**
 * Clear the errors from the get accessible policies request
 */
function clearGetAccessiblePoliciesErrors() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES, { errors: null });
}
/**
 * Call the API to calculate the bill for the new dot
 */
function calculateBillNewDot() {
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.IS_LOADING_BILL_WHEN_DOWNGRADE,
            value: true,
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.IS_LOADING_BILL_WHEN_DOWNGRADE,
            value: false,
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.IS_LOADING_BILL_WHEN_DOWNGRADE,
            value: false,
        },
    ];
    API.read(types_1.READ_COMMANDS.CALCULATE_BILL_NEW_DOT, null, {
        optimisticData: optimisticData,
        successData: successData,
        failureData: failureData,
    });
}
/**
 * Call the API to pay and downgrade
 */
function payAndDowngrade() {
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.BILLING_RECEIPT_DETAILS,
            value: {
                errors: null,
                isLoading: true,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.BILLING_RECEIPT_DETAILS,
            value: {
                isLoading: false,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.BILLING_RECEIPT_DETAILS,
            value: {
                isLoading: false,
            },
        },
    ];
    API.write(types_1.WRITE_COMMANDS.PAY_AND_DOWNGRADE, null, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function clearBillingReceiptDetailsErrors() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.BILLING_RECEIPT_DETAILS, { errors: null });
}
function setIsForcedToChangeCurrency(value) {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.IS_FORCED_TO_CHANGE_CURRENCY, value);
}
function setIsComingFromGlobalReimbursementsFlow(value) {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.IS_COMING_FROM_GLOBAL_REIMBURSEMENTS_FLOW, value);
}
