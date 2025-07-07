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
exports.adjustRemainingSplitShares = adjustRemainingSplitShares;
exports.approveMoneyRequest = approveMoneyRequest;
exports.canApproveIOU = canApproveIOU;
exports.canUnapproveIOU = canUnapproveIOU;
exports.cancelPayment = cancelPayment;
exports.canIOUBePaid = canIOUBePaid;
exports.canCancelPayment = canCancelPayment;
exports.cleanUpMoneyRequest = cleanUpMoneyRequest;
exports.clearMoneyRequest = clearMoneyRequest;
exports.completeSplitBill = completeSplitBill;
exports.createDistanceRequest = createDistanceRequest;
exports.createDraftTransaction = createDraftTransaction;
exports.deleteMoneyRequest = deleteMoneyRequest;
exports.deleteTrackExpense = deleteTrackExpense;
exports.detachReceipt = detachReceipt;
exports.dismissHoldUseExplanation = dismissHoldUseExplanation;
exports.getIOURequestPolicyID = getIOURequestPolicyID;
exports.initMoneyRequest = initMoneyRequest;
exports.checkIfScanFileCanBeRead = checkIfScanFileCanBeRead;
exports.dismissModalAndOpenReportInInboxTab = dismissModalAndOpenReportInInboxTab;
exports.navigateToStartStepIfScanFileCannotBeRead = navigateToStartStepIfScanFileCannotBeRead;
exports.completePaymentOnboarding = completePaymentOnboarding;
exports.payInvoice = payInvoice;
exports.payMoneyRequest = payMoneyRequest;
exports.putOnHold = putOnHold;
exports.putTransactionsOnHold = putTransactionsOnHold;
exports.replaceReceipt = replaceReceipt;
exports.requestMoney = requestMoney;
exports.resetSplitShares = resetSplitShares;
exports.resetDraftTransactionsCustomUnit = resetDraftTransactionsCustomUnit;
exports.savePreferredPaymentMethod = savePreferredPaymentMethod;
exports.sendInvoice = sendInvoice;
exports.sendMoneyElsewhere = sendMoneyElsewhere;
exports.sendMoneyWithWallet = sendMoneyWithWallet;
exports.setCustomUnitRateID = setCustomUnitRateID;
exports.setCustomUnitID = setCustomUnitID;
exports.removeSubrate = removeSubrate;
exports.addSubrate = addSubrate;
exports.updateSubrate = updateSubrate;
exports.clearSubrates = clearSubrates;
exports.setDraftSplitTransaction = setDraftSplitTransaction;
exports.setIndividualShare = setIndividualShare;
exports.setMoneyRequestAmount = setMoneyRequestAmount;
exports.setMoneyRequestAttendees = setMoneyRequestAttendees;
exports.setMoneyRequestAccountant = setMoneyRequestAccountant;
exports.setMoneyRequestBillable = setMoneyRequestBillable;
exports.setMoneyRequestCategory = setMoneyRequestCategory;
exports.setMoneyRequestCreated = setMoneyRequestCreated;
exports.setMoneyRequestDateAttribute = setMoneyRequestDateAttribute;
exports.setMoneyRequestCurrency = setMoneyRequestCurrency;
exports.setMoneyRequestDescription = setMoneyRequestDescription;
exports.setMoneyRequestDistanceRate = setMoneyRequestDistanceRate;
exports.setMoneyRequestMerchant = setMoneyRequestMerchant;
exports.setMoneyRequestParticipants = setMoneyRequestParticipants;
exports.setMoneyRequestParticipantsFromReport = setMoneyRequestParticipantsFromReport;
exports.getMoneyRequestParticipantsFromReport = getMoneyRequestParticipantsFromReport;
exports.setMoneyRequestPendingFields = setMoneyRequestPendingFields;
exports.setMoneyRequestReceipt = setMoneyRequestReceipt;
exports.setMoneyRequestTag = setMoneyRequestTag;
exports.setMoneyRequestTaxAmount = setMoneyRequestTaxAmount;
exports.setMoneyRequestTaxRate = setMoneyRequestTaxRate;
exports.setSplitPayer = setSplitPayer;
exports.setSplitShares = setSplitShares;
exports.splitBill = splitBill;
exports.splitBillAndOpenReport = splitBillAndOpenReport;
exports.startMoneyRequest = startMoneyRequest;
exports.startSplitBill = startSplitBill;
exports.submitReport = submitReport;
exports.trackExpense = trackExpense;
exports.unapproveExpenseReport = unapproveExpenseReport;
exports.unholdRequest = unholdRequest;
exports.updateMoneyRequestAttendees = updateMoneyRequestAttendees;
exports.updateMoneyRequestAmountAndCurrency = updateMoneyRequestAmountAndCurrency;
exports.updateMoneyRequestBillable = updateMoneyRequestBillable;
exports.updateMoneyRequestCategory = updateMoneyRequestCategory;
exports.updateMoneyRequestDate = updateMoneyRequestDate;
exports.updateMoneyRequestDescription = updateMoneyRequestDescription;
exports.updateMoneyRequestDistance = updateMoneyRequestDistance;
exports.updateMoneyRequestDistanceRate = updateMoneyRequestDistanceRate;
exports.updateMoneyRequestMerchant = updateMoneyRequestMerchant;
exports.updateMoneyRequestTag = updateMoneyRequestTag;
exports.updateMoneyRequestTaxAmount = updateMoneyRequestTaxAmount;
exports.updateMoneyRequestTaxRate = updateMoneyRequestTaxRate;
exports.mergeDuplicates = mergeDuplicates;
exports.updateLastLocationPermissionPrompt = updateLastLocationPermissionPrompt;
exports.resolveDuplicates = resolveDuplicates;
exports.getIOUReportActionToApproveOrPay = getIOUReportActionToApproveOrPay;
exports.getNavigationUrlOnMoneyRequestDelete = getNavigationUrlOnMoneyRequestDelete;
exports.getNavigationUrlAfterTrackExpenseDelete = getNavigationUrlAfterTrackExpenseDelete;
exports.canSubmitReport = canSubmitReport;
exports.submitPerDiemExpense = submitPerDiemExpense;
exports.calculateDiffAmount = calculateDiffAmount;
exports.computePerDiemExpenseAmount = computePerDiemExpenseAmount;
exports.initSplitExpense = initSplitExpense;
exports.addSplitExpenseField = addSplitExpenseField;
exports.updateSplitExpenseAmountField = updateSplitExpenseAmountField;
exports.saveSplitTransactions = saveSplitTransactions;
exports.initDraftSplitExpenseDataForEdit = initDraftSplitExpenseDataForEdit;
exports.removeSplitExpenseField = removeSplitExpenseField;
exports.updateSplitExpenseField = updateSplitExpenseField;
exports.reopenReport = reopenReport;
exports.retractReport = retractReport;
var date_fns_1 = require("date-fns");
var expensify_common_1 = require("expensify-common");
var react_native_1 = require("react-native");
var react_native_onyx_1 = require("react-native-onyx");
var receipt_generic_png_1 = require("@assets/images/receipt-generic.png");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var DateUtils_1 = require("@libs/DateUtils");
var DistanceRequestUtils_1 = require("@libs/DistanceRequestUtils");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var FileUtils_1 = require("@libs/fileDownload/FileUtils");
var GoogleTagManager_1 = require("@libs/GoogleTagManager");
var IOUUtils_1 = require("@libs/IOUUtils");
var isFileUploadable_1 = require("@libs/isFileUploadable");
var LocalePhoneNumber_1 = require("@libs/LocalePhoneNumber");
var Localize = require("@libs/Localize");
var Log_1 = require("@libs/Log");
var isReportOpenInRHP_1 = require("@libs/Navigation/helpers/isReportOpenInRHP");
var isSearchTopmostFullScreenRoute_1 = require("@libs/Navigation/helpers/isSearchTopmostFullScreenRoute");
var Navigation_1 = require("@libs/Navigation/Navigation");
var NextStepUtils_1 = require("@libs/NextStepUtils");
var NumberUtils = require("@libs/NumberUtils");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var Parser_1 = require("@libs/Parser");
var PerDiemRequestUtils_1 = require("@libs/PerDiemRequestUtils");
var Performance_1 = require("@libs/Performance");
var Permissions_1 = require("@libs/Permissions");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var PhoneNumber_1 = require("@libs/PhoneNumber");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var SearchQueryUtils_1 = require("@libs/SearchQueryUtils");
var SessionUtils_1 = require("@libs/SessionUtils");
var Sound_1 = require("@libs/Sound");
var SubscriptionUtils_1 = require("@libs/SubscriptionUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var ViolationsUtils_1 = require("@libs/Violations/ViolationsUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var CachedPDFPaths_1 = require("./CachedPDFPaths");
var Category_1 = require("./Policy/Category");
var Member_1 = require("./Policy/Member");
var PerDiem_1 = require("./Policy/PerDiem");
var Policy_1 = require("./Policy/Policy");
var Tag_1 = require("./Policy/Tag");
var Report_1 = require("./Report");
var ReportActions_1 = require("./ReportActions");
var Transaction_1 = require("./Transaction");
var TransactionEdit_1 = require("./TransactionEdit");
var OnboardingFlow_1 = require("./Welcome/OnboardingFlow");
var allPersonalDetails = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
    callback: function (value) {
        allPersonalDetails = value !== null && value !== void 0 ? value : {};
    },
});
var allBetas;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.BETAS,
    callback: function (value) { return (allBetas = value); },
});
var allTransactions = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.TRANSACTION,
    waitForCollectionCallback: true,
    callback: function (value) {
        if (!value) {
            allTransactions = {};
            return;
        }
        allTransactions = value;
    },
});
var allTransactionDrafts = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT,
    waitForCollectionCallback: true,
    callback: function (value) {
        allTransactionDrafts = value !== null && value !== void 0 ? value : {};
    },
});
var allTransactionViolations = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS,
    waitForCollectionCallback: true,
    callback: function (value) {
        if (!value) {
            allTransactionViolations = {};
            return;
        }
        allTransactionViolations = value;
    },
});
var allDraftSplitTransactions = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.SPLIT_TRANSACTION_DRAFT,
    waitForCollectionCallback: true,
    callback: function (value) {
        allDraftSplitTransactions = value !== null && value !== void 0 ? value : {};
    },
});
var allNextSteps = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.NEXT_STEP,
    waitForCollectionCallback: true,
    callback: function (value) {
        allNextSteps = value !== null && value !== void 0 ? value : {};
    },
});
var allPolicyCategories = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES,
    waitForCollectionCallback: true,
    callback: function (val) { return (allPolicyCategories = val); },
});
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
            var policyReports = (0, ReportUtils_1.getAllPolicyReports)(policyID);
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
var allReports;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: function (value) {
        allReports = value;
    },
});
var allReportNameValuePairs;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS,
    waitForCollectionCallback: true,
    callback: function (value) {
        allReportNameValuePairs = value;
    },
});
var userAccountID = -1;
var currentUserEmail = '';
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.SESSION,
    callback: function (value) {
        var _a, _b;
        currentUserEmail = (_a = value === null || value === void 0 ? void 0 : value.email) !== null && _a !== void 0 ? _a : '';
        userAccountID = (_b = value === null || value === void 0 ? void 0 : value.accountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
    },
});
var currentUserPersonalDetails;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
    callback: function (value) {
        var _a;
        currentUserPersonalDetails = (_a = value === null || value === void 0 ? void 0 : value[userAccountID]) !== null && _a !== void 0 ? _a : undefined;
    },
});
var currentDate = '';
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.CURRENT_DATE,
    callback: function (value) {
        currentDate = value;
    },
});
var quickAction = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_QUICK_ACTION_GLOBAL_CREATE,
    callback: function (value) {
        quickAction = value;
    },
});
var allReportActions;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: function (actions) {
        if (!actions) {
            return;
        }
        allReportActions = actions;
    },
});
var activePolicyID;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID,
    callback: function (value) { return (activePolicyID = value); },
});
var introSelected;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_INTRO_SELECTED,
    callback: function (value) { return (introSelected = value); },
});
var personalDetailsList;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
    callback: function (value) { return (personalDetailsList = value); },
});
/**
 * @private
 * After finishing the action in RHP from the Inbox tab, besides dismissing the modal, we should open the report.
 * If the action is done from the report RHP, then we just want to dismiss the money request flow screens.
 * It is a helper function used only in this file.
 */
function dismissModalAndOpenReportInInboxTab(reportID) {
    var _a, _b;
    var rootState = Navigation_1.navigationRef.getRootState();
    if ((0, isReportOpenInRHP_1.default)(rootState)) {
        var rhpKey = (_b = (_a = rootState.routes.at(-1)) === null || _a === void 0 ? void 0 : _a.state) === null || _b === void 0 ? void 0 : _b.key;
        if (rhpKey) {
            Navigation_1.default.pop(rhpKey);
            return;
        }
    }
    if ((0, isSearchTopmostFullScreenRoute_1.default)() || !reportID) {
        Navigation_1.default.dismissModal();
        return;
    }
    Navigation_1.default.dismissModalWithReport({ reportID: reportID });
}
/**
 * Find the report preview action from given chat report and iou report
 */
function getReportPreviewAction(chatReportID, iouReportID) {
    var _a, _b;
    var reportActions = (_a = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(chatReportID)]) !== null && _a !== void 0 ? _a : {};
    // Find the report preview action from the chat report
    return ((_b = Object.values(reportActions).find(function (reportAction) { var _a; return reportAction && (0, ReportActionsUtils_1.isReportPreviewAction)(reportAction) && ((_a = (0, ReportActionsUtils_1.getOriginalMessage)(reportAction)) === null || _a === void 0 ? void 0 : _a.linkedReportID) === iouReportID; })) !== null && _b !== void 0 ? _b : null);
}
/**
 * Initialize expense info
 * @param reportID to attach the transaction to
 * @param policy
 * @param isFromGlobalCreate
 * @param iouRequestType one of manual/scan/distance
 */
function initMoneyRequest(_a) {
    var _b, _c, _d;
    var reportID = _a.reportID, policy = _a.policy, isFromGlobalCreate = _a.isFromGlobalCreate, currentIouRequestType = _a.currentIouRequestType, newIouRequestType = _a.newIouRequestType;
    // Generate a brand new transactionID
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var personalPolicy = (0, PolicyUtils_1.getPolicy)((_b = (0, PolicyUtils_1.getPersonalPolicy)()) === null || _b === void 0 ? void 0 : _b.id);
    var newTransactionID = CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID;
    var currency = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _c !== void 0 ? _c : personalPolicy === null || personalPolicy === void 0 ? void 0 : personalPolicy.outputCurrency) !== null && _d !== void 0 ? _d : CONST_1.default.CURRENCY.USD;
    // Disabling this line since currentDate can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var created = currentDate || (0, date_fns_1.format)(new Date(), 'yyyy-MM-dd');
    // We remove draft transactions created during multi scanning if there are some
    (0, TransactionEdit_1.removeDraftTransactions)(true);
    // in case we have to re-init money request, but the IOU request type is the same with the old draft transaction,
    // we should keep most of the existing data by using the ONYX MERGE operation
    if (currentIouRequestType === newIouRequestType) {
        // so, we just need to update the reportID, isFromGlobalCreate, created, currency
        react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(newTransactionID), {
            reportID: reportID,
            isFromGlobalCreate: isFromGlobalCreate,
            created: created,
            currency: currency,
            transactionID: newTransactionID,
        });
        return;
    }
    var comment = {
        attendees: (0, IOUUtils_1.formatCurrentUserToAttendee)(currentUserPersonalDetails, reportID),
    };
    var requestCategory = null;
    // Add initial empty waypoints when starting a distance expense
    if (newIouRequestType === CONST_1.default.IOU.REQUEST_TYPE.DISTANCE) {
        comment.waypoints = {
            waypoint0: { keyForList: 'start_waypoint' },
            waypoint1: { keyForList: 'stop_waypoint' },
        };
        if (!isFromGlobalCreate) {
            var customUnitRateID = DistanceRequestUtils_1.default.getCustomUnitRateID(reportID);
            comment.customUnit = { customUnitRateID: customUnitRateID };
        }
    }
    if (newIouRequestType === CONST_1.default.IOU.REQUEST_TYPE.PER_DIEM) {
        comment.customUnit = {
            attributes: {
                dates: {
                    start: DateUtils_1.default.getStartOfToday(),
                    end: DateUtils_1.default.getStartOfToday(),
                },
            },
        };
        if (!isFromGlobalCreate) {
            var _e = (0, PerDiemRequestUtils_1.getCustomUnitID)(reportID), customUnitID = _e.customUnitID, category = _e.category;
            comment.customUnit = __assign(__assign({}, comment.customUnit), { customUnitID: customUnitID });
            requestCategory = category !== null && category !== void 0 ? category : null;
        }
    }
    var newTransaction = {
        amount: 0,
        comment: comment,
        created: created,
        currency: currency,
        category: requestCategory,
        iouRequestType: newIouRequestType,
        reportID: reportID,
        transactionID: newTransactionID,
        isFromGlobalCreate: isFromGlobalCreate,
        merchant: CONST_1.default.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
        splitPayerAccountIDs: currentUserPersonalDetails ? [currentUserPersonalDetails.accountID] : undefined,
    };
    // Store the transaction in Onyx and mark it as not saved so it can be cleaned up later
    // Use set() here so that there is no way that data will be leaked between objects when it gets reset
    react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(newTransactionID), newTransaction);
    return newTransaction;
}
function createDraftTransaction(transaction) {
    if (!transaction) {
        return;
    }
    var newTransaction = __assign({}, transaction);
    react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transaction.transactionID), newTransaction);
}
function clearMoneyRequest(transactionID, skipConfirmation) {
    if (skipConfirmation === void 0) { skipConfirmation = false; }
    (0, TransactionEdit_1.removeDraftTransactions)();
    react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.SKIP_CONFIRMATION).concat(transactionID), skipConfirmation);
}
function startMoneyRequest(iouType, reportID, requestType, skipConfirmation, backToReport) {
    if (skipConfirmation === void 0) { skipConfirmation = false; }
    Performance_1.default.markStart(CONST_1.default.TIMING.OPEN_CREATE_EXPENSE);
    clearMoneyRequest(CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID, skipConfirmation);
    switch (requestType) {
        case CONST_1.default.IOU.REQUEST_TYPE.MANUAL:
            Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_CREATE_TAB_MANUAL.getRoute(CONST_1.default.IOU.ACTION.CREATE, iouType, CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID, reportID, backToReport));
            return;
        case CONST_1.default.IOU.REQUEST_TYPE.SCAN:
            Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_CREATE_TAB_SCAN.getRoute(CONST_1.default.IOU.ACTION.CREATE, iouType, CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID, reportID, backToReport));
            return;
        case CONST_1.default.IOU.REQUEST_TYPE.DISTANCE:
            Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_CREATE_TAB_DISTANCE.getRoute(CONST_1.default.IOU.ACTION.CREATE, iouType, CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID, reportID, backToReport));
            return;
        default:
            Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_CREATE.getRoute(CONST_1.default.IOU.ACTION.CREATE, iouType, CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID, reportID, backToReport));
    }
}
function setMoneyRequestAmount(transactionID, amount, currency, shouldShowOriginalAmount) {
    if (shouldShowOriginalAmount === void 0) { shouldShowOriginalAmount = false; }
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transactionID), { amount: amount, currency: currency, shouldShowOriginalAmount: shouldShowOriginalAmount });
}
function setMoneyRequestCreated(transactionID, created, isDraft) {
    react_native_onyx_1.default.merge("".concat(isDraft ? ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), { created: created });
}
function setMoneyRequestDateAttribute(transactionID, start, end) {
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transactionID), { comment: { customUnit: { attributes: { dates: { start: start, end: end } } } } });
}
function setMoneyRequestCurrency(transactionID, currency, isEditing) {
    var _a;
    if (isEditing === void 0) { isEditing = false; }
    var fieldToUpdate = isEditing ? 'modifiedCurrency' : 'currency';
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transactionID), (_a = {}, _a[fieldToUpdate] = currency, _a));
}
function setMoneyRequestDescription(transactionID, comment, isDraft) {
    react_native_onyx_1.default.merge("".concat(isDraft ? ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), { comment: { comment: comment.trim() } });
}
function setMoneyRequestMerchant(transactionID, merchant, isDraft) {
    react_native_onyx_1.default.merge("".concat(isDraft ? ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), { merchant: merchant });
}
function setMoneyRequestAttendees(transactionID, attendees, isDraft) {
    react_native_onyx_1.default.merge("".concat(isDraft ? ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), { comment: { attendees: attendees } });
}
function setMoneyRequestAccountant(transactionID, accountant, isDraft) {
    react_native_onyx_1.default.merge("".concat(isDraft ? ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), { accountant: accountant });
}
function setMoneyRequestPendingFields(transactionID, pendingFields) {
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transactionID), { pendingFields: pendingFields });
}
function setMoneyRequestCategory(transactionID, category, policyID) {
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transactionID), { category: category });
    if (!policyID) {
        setMoneyRequestTaxRate(transactionID, '');
        setMoneyRequestTaxAmount(transactionID, null);
        return;
    }
    var transaction = allTransactionDrafts["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transactionID)];
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var _a = (0, TransactionUtils_1.getCategoryTaxCodeAndAmount)(category, transaction, (0, PolicyUtils_1.getPolicy)(policyID)), categoryTaxCode = _a.categoryTaxCode, categoryTaxAmount = _a.categoryTaxAmount;
    if (categoryTaxCode && categoryTaxAmount !== undefined) {
        setMoneyRequestTaxRate(transactionID, categoryTaxCode);
        setMoneyRequestTaxAmount(transactionID, categoryTaxAmount);
    }
}
function setMoneyRequestTag(transactionID, tag) {
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transactionID), { tag: tag });
}
function setMoneyRequestBillable(transactionID, billable) {
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transactionID), { billable: billable });
}
function setMoneyRequestParticipants(transactionID, participants, isTestTransaction) {
    var _a;
    if (participants === void 0) { participants = []; }
    if (isTestTransaction === void 0) { isTestTransaction = false; }
    // We should change the reportID and isFromGlobalCreate of the test transaction since this flow can start inside an existing report
    return react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transactionID), {
        participants: participants,
        isFromGlobalCreate: isTestTransaction ? true : undefined,
        reportID: isTestTransaction ? (_a = participants === null || participants === void 0 ? void 0 : participants.at(0)) === null || _a === void 0 ? void 0 : _a.reportID : undefined,
    });
}
function setSplitPayer(transactionID, payerAccountID) {
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transactionID), { splitPayerAccountIDs: [payerAccountID] });
}
function setMoneyRequestReceipt(transactionID, source, filename, isDraft, type, isTestReceipt, isTestDriveReceipt) {
    if (isTestReceipt === void 0) { isTestReceipt = false; }
    if (isTestDriveReceipt === void 0) { isTestDriveReceipt = false; }
    react_native_onyx_1.default.merge("".concat(isDraft ? ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), {
        // isTestReceipt = false and isTestDriveReceipt = false are being converted to null because we don't really need to store it in Onyx in those cases
        receipt: { source: source, type: type !== null && type !== void 0 ? type : '', isTestReceipt: isTestReceipt ? true : null, isTestDriveReceipt: isTestDriveReceipt ? true : null },
        filename: filename,
    });
}
/**
 * Set custom unit rateID for the transaction draft
 */
function setCustomUnitRateID(transactionID, customUnitRateID) {
    var isFakeP2PRate = customUnitRateID === CONST_1.default.CUSTOM_UNITS.FAKE_P2P_ID;
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transactionID), {
        comment: {
            customUnit: __assign({ customUnitRateID: customUnitRateID }, (!isFakeP2PRate && { defaultP2PRate: null })),
        },
    });
}
/**
 * Revert custom unit of the draft transaction to the original transaction's value
 */
function resetDraftTransactionsCustomUnit(transactionID) {
    var _a, _b;
    if (!transactionID) {
        return;
    }
    var originalTransaction = allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID)];
    if (!originalTransaction) {
        return;
    }
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transactionID), {
        comment: {
            customUnit: (_b = (_a = originalTransaction.comment) === null || _a === void 0 ? void 0 : _a.customUnit) !== null && _b !== void 0 ? _b : {},
        },
    });
}
/**
 * Set custom unit ID for the transaction draft
 */
function setCustomUnitID(transactionID, customUnitID) {
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transactionID), { comment: { customUnit: { customUnitID: customUnitID } } });
}
function removeSubrate(transaction, currentIndex) {
    var _a, _b, _c, _d;
    // Index comes from the route params and is a string
    var index = Number(currentIndex);
    if (index === -1) {
        return;
    }
    var existingSubrates = (_c = (_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.customUnit) === null || _b === void 0 ? void 0 : _b.subRates) !== null && _c !== void 0 ? _c : [];
    var newSubrates = __spreadArray([], existingSubrates, true);
    newSubrates.splice(index, 1);
    // Onyx.merge won't remove the null nested object values, this is a workaround
    // to remove nested keys while also preserving other object keys
    // Doing a deep clone of the transaction to avoid mutating the original object and running into a cache issue when using Onyx.set
    var newTransaction = __assign(__assign({}, transaction), { comment: __assign(__assign({}, transaction === null || transaction === void 0 ? void 0 : transaction.comment), { customUnit: __assign(__assign({}, (_d = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _d === void 0 ? void 0 : _d.customUnit), { subRates: newSubrates, quantity: null }) }) });
    react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID), newTransaction);
}
function updateSubrate(transaction, currentIndex, quantity, id, name, rate) {
    var _a, _b, _c, _d;
    // Index comes from the route params and is a string
    var index = Number(currentIndex);
    if (index === -1) {
        return;
    }
    var existingSubrates = (_c = (_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.customUnit) === null || _b === void 0 ? void 0 : _b.subRates) !== null && _c !== void 0 ? _c : [];
    if (index >= existingSubrates.length) {
        return;
    }
    var newSubrates = __spreadArray([], existingSubrates, true);
    newSubrates.splice(index, 1, { quantity: quantity, id: id, name: name, rate: rate });
    // Onyx.merge won't remove the null nested object values, this is a workaround
    // to remove nested keys while also preserving other object keys
    // Doing a deep clone of the transaction to avoid mutating the original object and running into a cache issue when using Onyx.set
    var newTransaction = __assign(__assign({}, transaction), { comment: __assign(__assign({}, transaction === null || transaction === void 0 ? void 0 : transaction.comment), { customUnit: __assign(__assign({}, (_d = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _d === void 0 ? void 0 : _d.customUnit), { subRates: newSubrates, quantity: null }) }) });
    react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID), newTransaction);
}
function clearSubrates(transactionID) {
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transactionID), { comment: { customUnit: { subRates: [] } } });
}
function addSubrate(transaction, currentIndex, quantity, id, name, rate) {
    var _a, _b, _c, _d;
    // Index comes from the route params and is a string
    var index = Number(currentIndex);
    if (index === -1) {
        return;
    }
    var existingSubrates = (_c = (_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.customUnit) === null || _b === void 0 ? void 0 : _b.subRates) !== null && _c !== void 0 ? _c : [];
    if (index !== existingSubrates.length) {
        return;
    }
    var newSubrates = __spreadArray([], existingSubrates, true);
    newSubrates.push({ quantity: quantity, id: id, name: name, rate: rate });
    // Onyx.merge won't remove the null nested object values, this is a workaround
    // to remove nested keys while also preserving other object keys
    // Doing a deep clone of the transaction to avoid mutating the original object and running into a cache issue when using Onyx.set
    var newTransaction = __assign(__assign({}, transaction), { comment: __assign(__assign({}, transaction === null || transaction === void 0 ? void 0 : transaction.comment), { customUnit: __assign(__assign({}, (_d = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _d === void 0 ? void 0 : _d.customUnit), { subRates: newSubrates, quantity: null }) }) });
    react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID), newTransaction);
}
/**
 * Set the distance rate of a transaction.
 * Used when creating a new transaction or moving an existing one from Self DM
 */
function setMoneyRequestDistanceRate(transactionID, customUnitRateID, policy, isDraft) {
    var _a;
    var _b, _c, _d, _e;
    if (policy) {
        react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_LAST_SELECTED_DISTANCE_RATES, (_a = {}, _a[policy.id] = customUnitRateID, _a));
    }
    var distanceRate = DistanceRequestUtils_1.default.getRateByCustomUnitRateID({ policy: policy, customUnitRateID: customUnitRateID });
    var transaction = isDraft ? allTransactionDrafts["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transactionID)] : allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID)];
    var newDistance;
    if ((distanceRate === null || distanceRate === void 0 ? void 0 : distanceRate.unit) && (distanceRate === null || distanceRate === void 0 ? void 0 : distanceRate.unit) !== ((_c = (_b = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _b === void 0 ? void 0 : _b.customUnit) === null || _c === void 0 ? void 0 : _c.distanceUnit)) {
        newDistance = DistanceRequestUtils_1.default.convertDistanceUnit((0, TransactionUtils_1.getDistanceInMeters)(transaction, (_e = (_d = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _d === void 0 ? void 0 : _d.customUnit) === null || _e === void 0 ? void 0 : _e.distanceUnit), distanceRate.unit);
    }
    react_native_onyx_1.default.merge("".concat(isDraft ? ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), {
        comment: {
            customUnit: __assign(__assign(__assign({ customUnitRateID: customUnitRateID }, (!!policy && { defaultP2PRate: null })), (distanceRate && { distanceUnit: distanceRate.unit })), (newDistance && { quantity: newDistance })),
        },
    });
}
/** Helper function to get the receipt error for expenses, or the generic error if there's no receipt */
function getReceiptError(receipt, filename, isScanRequest, errorKey, action, retryParams) {
    var _a, _b;
    if (isScanRequest === void 0) { isScanRequest = true; }
    var formattedRetryParams = typeof retryParams === 'string' ? retryParams : JSON.stringify(retryParams);
    return (0, EmptyObject_1.isEmptyObject)(receipt) || !isScanRequest
        ? (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.genericCreateFailureMessage', errorKey)
        : (0, ErrorUtils_1.getMicroSecondOnyxErrorObject)({
            error: CONST_1.default.IOU.RECEIPT_ERROR,
            source: (_b = (_a = receipt.source) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '',
            filename: filename !== null && filename !== void 0 ? filename : '',
            action: action !== null && action !== void 0 ? action : '',
            retryParams: formattedRetryParams,
        }, errorKey);
}
/** Helper function to get optimistic fields violations onyx data */
function getFieldViolationsOnyxData(iouReport) {
    var _a;
    var missingFields = {};
    var excludedFields = Object.values(CONST_1.default.REPORT_VIOLATIONS_EXCLUDED_FIELDS);
    Object.values((_a = iouReport.fieldList) !== null && _a !== void 0 ? _a : {}).forEach(function (field) {
        if (excludedFields.includes(field.fieldID) || !!field.value || !!field.defaultValue) {
            return;
        }
        // in case of missing field violation the empty object is indicator.
        missingFields[field.fieldID] = {};
    });
    return {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.SET,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_VIOLATIONS).concat(iouReport.reportID),
                value: {
                    fieldRequired: missingFields,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.SET,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_VIOLATIONS).concat(iouReport.reportID),
                value: null,
            },
        ],
    };
}
function buildOnyxDataForTestDriveIOU(testDriveIOUParams) {
    var _a, _b;
    var _c, _d, _e, _f, _g, _h;
    var optimisticData = [];
    var successData = [];
    var failureData = [];
    var optimisticIOUReportAction = (0, ReportUtils_1.buildOptimisticIOUReportAction)({
        type: CONST_1.default.IOU.REPORT_ACTION_TYPE.PAY,
        amount: testDriveIOUParams.transaction.amount,
        currency: testDriveIOUParams.transaction.currency,
        comment: (_d = (_c = testDriveIOUParams.transaction.comment) === null || _c === void 0 ? void 0 : _c.comment) !== null && _d !== void 0 ? _d : '',
        participants: (_e = testDriveIOUParams.transaction.participants) !== null && _e !== void 0 ? _e : [],
        paymentType: CONST_1.default.IOU.PAYMENT_TYPE.ELSEWHERE,
        iouReportID: testDriveIOUParams.iouOptimisticParams.report.reportID,
        transactionID: testDriveIOUParams.transaction.transactionID,
    });
    var text = Localize.translateLocal('testDrive.employeeInviteMessage', { name: (_g = (_f = personalDetailsList === null || personalDetailsList === void 0 ? void 0 : personalDetailsList[userAccountID]) === null || _f === void 0 ? void 0 : _f.firstName) !== null && _g !== void 0 ? _g : '' });
    var textComment = (0, ReportUtils_1.buildOptimisticAddCommentReportAction)(text, undefined, userAccountID, undefined, undefined, undefined, testDriveIOUParams.testDriveCommentReportActionID);
    textComment.reportAction.created = DateUtils_1.default.subtractMillisecondsFromDateTime(testDriveIOUParams.iouOptimisticParams.createdAction.created, 1);
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat((_h = testDriveIOUParams.chatOptimisticParams.report) === null || _h === void 0 ? void 0 : _h.reportID),
        value: (_a = {},
            _a[textComment.reportAction.reportActionID] = textComment.reportAction,
            _a),
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(testDriveIOUParams.iouOptimisticParams.report.reportID),
        value: __assign({ lastActionType: CONST_1.default.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED, statusNum: CONST_1.default.REPORT.STATUS_NUM.REIMBURSED }, { hasOutstandingChildRequest: false, lastActorAccountID: currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.accountID }),
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(testDriveIOUParams.iouOptimisticParams.report.reportID),
        value: (_b = {},
            _b[testDriveIOUParams.iouOptimisticParams.action.reportActionID] = optimisticIOUReportAction,
            _b),
    });
    return {
        optimisticData: optimisticData,
        successData: successData,
        failureData: failureData,
    };
}
/** Builds the Onyx data for an expense */
function buildOnyxDataForMoneyRequest(moneyRequestParams) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    var _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23;
    var isNewChatReport = moneyRequestParams.isNewChatReport, shouldCreateNewMoneyRequestReport = moneyRequestParams.shouldCreateNewMoneyRequestReport, _24 = moneyRequestParams.isOneOnOneSplit, isOneOnOneSplit = _24 === void 0 ? false : _24, existingTransactionThreadReportID = moneyRequestParams.existingTransactionThreadReportID, _25 = moneyRequestParams.policyParams, policyParams = _25 === void 0 ? {} : _25, optimisticParams = moneyRequestParams.optimisticParams, retryParams = moneyRequestParams.retryParams, participant = moneyRequestParams.participant;
    var policy = policyParams.policy, policyCategories = policyParams.policyCategories, policyTagList = policyParams.policyTagList;
    var chat = optimisticParams.chat, iou = optimisticParams.iou, _26 = optimisticParams.transactionParams, transaction = _26.transaction, transactionThreadReport = _26.transactionThreadReport, transactionThreadCreatedReportAction = _26.transactionThreadCreatedReportAction, policyRecentlyUsed = optimisticParams.policyRecentlyUsed, personalDetailListAction = optimisticParams.personalDetailListAction, nextStep = optimisticParams.nextStep, testDriveCommentReportActionID = optimisticParams.testDriveCommentReportActionID;
    var isScanRequest = (0, TransactionUtils_1.isScanRequest)(transaction);
    var isPerDiemRequest = (0, TransactionUtils_1.isPerDiemRequest)(transaction);
    var isASAPSubmitBetaEnabled = Permissions_1.default.isBetaEnabled(CONST_1.default.BETAS.ASAP_SUBMIT, allBetas);
    var outstandingChildRequest = (0, ReportUtils_1.getOutstandingChildRequest)(iou.report);
    var clearedPendingFields = Object.fromEntries(Object.keys((_s = transaction.pendingFields) !== null && _s !== void 0 ? _s : {}).map(function (key) { return [key, null]; }));
    var isMoneyRequestToManagerMcTest = (0, ReportUtils_1.isTestTransactionReport)(iou.report);
    var optimisticData = [];
    var successData = [];
    var failureData = [];
    var newQuickAction;
    if (isScanRequest) {
        newQuickAction = CONST_1.default.QUICK_ACTIONS.REQUEST_SCAN;
    }
    else if (isPerDiemRequest) {
        newQuickAction = CONST_1.default.QUICK_ACTIONS.PER_DIEM;
    }
    else {
        newQuickAction = CONST_1.default.QUICK_ACTIONS.REQUEST_MANUAL;
    }
    if ((0, TransactionUtils_1.isDistanceRequest)(transaction)) {
        newQuickAction = CONST_1.default.QUICK_ACTIONS.REQUEST_DISTANCE;
    }
    var existingTransactionThreadReport = (_t = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(existingTransactionThreadReportID)]) !== null && _t !== void 0 ? _t : null;
    if (chat.report) {
        optimisticData.push({
            // Use SET for new reports because it doesn't exist yet, is faster and we need the data to be available when we navigate to the chat page
            onyxMethod: isNewChatReport ? react_native_onyx_1.default.METHOD.SET : react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chat.report.reportID),
            value: __assign(__assign(__assign(__assign(__assign(__assign({}, chat.report), { lastReadTime: DateUtils_1.default.getDBTime() }), (shouldCreateNewMoneyRequestReport ? { lastVisibleActionCreated: chat.reportPreviewAction.created } : {})), (isASAPSubmitBetaEnabled && isScanRequest ? {} : { iouReportID: iou.report.reportID })), outstandingChildRequest), (isNewChatReport ? { pendingFields: { createChat: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD } } : {})),
        });
    }
    optimisticData.push({
        onyxMethod: shouldCreateNewMoneyRequestReport ? react_native_onyx_1.default.METHOD.SET : react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iou.report.reportID),
        value: __assign(__assign({}, iou.report), { lastVisibleActionCreated: iou.action.created, pendingFields: __assign({}, (shouldCreateNewMoneyRequestReport ? { createChat: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD } : { preview: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE })) }),
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.SET,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID),
        value: transaction,
    }, isNewChatReport
        ? {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat((_u = chat.report) === null || _u === void 0 ? void 0 : _u.reportID),
            value: (_a = {},
                _a[chat.createdAction.reportActionID] = chat.createdAction,
                _a[chat.reportPreviewAction.reportActionID] = chat.reportPreviewAction,
                _a),
        }
        : {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat((_v = chat.report) === null || _v === void 0 ? void 0 : _v.reportID),
            value: (_b = {},
                _b[chat.reportPreviewAction.reportActionID] = chat.reportPreviewAction,
                _b),
        }, shouldCreateNewMoneyRequestReport
        ? {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(iou.report.reportID),
            value: (_c = {},
                _c[iou.createdAction.reportActionID] = iou.createdAction,
                _c[iou.action.reportActionID] = iou.action,
                _c),
        }
        : {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(iou.report.reportID),
            value: (_d = {},
                _d[iou.action.reportActionID] = iou.action,
                _d),
        }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.reportID),
        value: __assign(__assign({}, transactionThreadReport), { pendingFields: { createChat: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD } }),
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.reportID),
        value: {
            isOptimisticReport: true,
        },
    });
    if (isNewChatReport) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat((_w = chat.report) === null || _w === void 0 ? void 0 : _w.reportID),
            value: {
                isOptimisticReport: true,
            },
        });
    }
    if (shouldCreateNewMoneyRequestReport) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat((_x = iou.report) === null || _x === void 0 ? void 0 : _x.reportID),
            value: {
                isOptimisticReport: true,
            },
        });
    }
    if (!(0, EmptyObject_1.isEmptyObject)(transactionThreadCreatedReportAction)) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.reportID),
            value: (_e = {},
                _e[transactionThreadCreatedReportAction.reportActionID] = transactionThreadCreatedReportAction,
                _e),
        });
    }
    if ((_y = policyRecentlyUsed.categories) === null || _y === void 0 ? void 0 : _y.length) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES).concat(iou.report.policyID),
            value: policyRecentlyUsed.categories,
        });
    }
    if ((_z = policyRecentlyUsed.currencies) === null || _z === void 0 ? void 0 : _z.length) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: ONYXKEYS_1.default.RECENTLY_USED_CURRENCIES,
            value: policyRecentlyUsed.currencies,
        });
    }
    if (!(0, EmptyObject_1.isEmptyObject)(policyRecentlyUsed.tags)) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_RECENTLY_USED_TAGS).concat(iou.report.policyID),
            value: policyRecentlyUsed.tags,
        });
    }
    if ((_0 = policyRecentlyUsed.destinations) === null || _0 === void 0 ? void 0 : _0.length) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_RECENTLY_USED_DESTINATIONS).concat(iou.report.policyID),
            value: policyRecentlyUsed.destinations,
        });
    }
    if ((_1 = transaction.receipt) === null || _1 === void 0 ? void 0 : _1.isTestDriveReceipt) {
        var _27 = buildOnyxDataForTestDriveIOU({
            transaction: transaction,
            iouOptimisticParams: iou,
            chatOptimisticParams: chat,
            testDriveCommentReportActionID: testDriveCommentReportActionID,
        }), _28 = _27.optimisticData, testDriveOptimisticData = _28 === void 0 ? [] : _28, _29 = _27.successData, testDriveSuccessData = _29 === void 0 ? [] : _29, _30 = _27.failureData, testDriveFailureData = _30 === void 0 ? [] : _30;
        optimisticData.push.apply(optimisticData, testDriveOptimisticData);
        successData.push.apply(successData, testDriveSuccessData);
        failureData.push.apply(failureData, testDriveFailureData);
    }
    if (isMoneyRequestToManagerMcTest) {
        var date = new Date();
        var isTestReceipt = (_3 = (_2 = transaction.receipt) === null || _2 === void 0 ? void 0 : _2.isTestReceipt) !== null && _3 !== void 0 ? _3 : false;
        var managerMcTestParticipant = (_4 = (0, OptionsListUtils_1.getManagerMcTestParticipant)()) !== null && _4 !== void 0 ? _4 : {};
        var optimisticIOUReportAction = (0, ReportUtils_1.buildOptimisticIOUReportAction)({
            type: isScanRequest && !isTestReceipt ? CONST_1.default.IOU.REPORT_ACTION_TYPE.CREATE : CONST_1.default.IOU.REPORT_ACTION_TYPE.PAY,
            amount: (_6 = (_5 = iou.report) === null || _5 === void 0 ? void 0 : _5.total) !== null && _6 !== void 0 ? _6 : 0,
            currency: (_8 = (_7 = iou.report) === null || _7 === void 0 ? void 0 : _7.currency) !== null && _8 !== void 0 ? _8 : '',
            comment: '',
            participants: [managerMcTestParticipant],
            paymentType: isScanRequest && !isTestReceipt ? undefined : CONST_1.default.IOU.PAYMENT_TYPE.ELSEWHERE,
            iouReportID: iou.report.reportID,
            transactionID: transaction.transactionID,
        });
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.NVP_DISMISSED_PRODUCT_TRAINING),
            value: (_f = {}, _f[CONST_1.default.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP] = DateUtils_1.default.getDBTime(date.valueOf()), _f),
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iou.report.reportID),
            value: __assign(__assign(__assign({}, iou.report), (!isScanRequest || isTestReceipt ? { lastActionType: CONST_1.default.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED, statusNum: CONST_1.default.REPORT.STATUS_NUM.REIMBURSED } : undefined)), { hasOutstandingChildRequest: false, lastActorAccountID: currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.accountID }),
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(iou.report.reportID),
            value: (_g = {},
                _g[iou.action.reportActionID] = __assign({}, optimisticIOUReportAction),
                _g),
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID),
            value: __assign({}, transaction),
        });
    }
    var redundantParticipants = {};
    if (!(0, EmptyObject_1.isEmptyObject)(personalDetailListAction)) {
        var successPersonalDetailListAction_1 = {};
        // BE will send different participants. We clear the optimistic ones to avoid duplicated entries
        Object.keys(personalDetailListAction).forEach(function (accountIDKey) {
            var accountID = Number(accountIDKey);
            successPersonalDetailListAction_1[accountID] = null;
            redundantParticipants[accountID] = null;
        });
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
            value: personalDetailListAction,
        });
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
            value: successPersonalDetailListAction_1,
        });
    }
    if (!(0, EmptyObject_1.isEmptyObject)(nextStep)) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.NEXT_STEP).concat(iou.report.reportID),
            value: nextStep,
        });
    }
    if (isNewChatReport) {
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat((_9 = chat.report) === null || _9 === void 0 ? void 0 : _9.reportID),
            value: {
                participants: redundantParticipants,
                pendingFields: null,
                errorFields: null,
            },
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat((_10 = chat.report) === null || _10 === void 0 ? void 0 : _10.reportID),
            value: {
                isOptimisticReport: false,
            },
        });
    }
    successData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iou.report.reportID),
        value: {
            participants: redundantParticipants,
            pendingFields: null,
            errorFields: null,
        },
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(iou.report.reportID),
        value: {
            isOptimisticReport: false,
        },
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.reportID),
        value: {
            participants: redundantParticipants,
            pendingFields: null,
            errorFields: null,
        },
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.reportID),
        value: {
            isOptimisticReport: false,
        },
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID),
        value: {
            pendingAction: null,
            pendingFields: clearedPendingFields,
            // The routes contains the distance in meters. Clearing the routes ensures we use the distance
            // in the correct unit stored under the transaction customUnit once the request is created.
            // The route is also not saved in the backend, so we can't rely on it.
            routes: null,
        },
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat((_11 = chat.report) === null || _11 === void 0 ? void 0 : _11.reportID),
        value: __assign(__assign({}, (isNewChatReport
            ? (_h = {},
                _h[chat.createdAction.reportActionID] = {
                    pendingAction: null,
                    errors: null,
                },
                _h) : {})), (_j = {}, _j[chat.reportPreviewAction.reportActionID] = {
            pendingAction: null,
        }, _j)),
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(iou.report.reportID),
        value: __assign(__assign({}, (shouldCreateNewMoneyRequestReport
            ? (_k = {},
                _k[iou.createdAction.reportActionID] = {
                    pendingAction: null,
                    errors: null,
                },
                _k) : {})), (_l = {}, _l[iou.action.reportActionID] = {
            pendingAction: null,
            errors: null,
        }, _l)),
    });
    if (!(0, EmptyObject_1.isEmptyObject)(transactionThreadCreatedReportAction)) {
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.reportID),
            value: (_m = {},
                _m[transactionThreadCreatedReportAction.reportActionID] = {
                    pendingAction: null,
                    errors: null,
                },
                _m),
        });
    }
    var errorKey = DateUtils_1.default.getMicroseconds();
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat((_12 = chat.report) === null || _12 === void 0 ? void 0 : _12.reportID),
        value: __assign({ iouReportID: (_13 = chat.report) === null || _13 === void 0 ? void 0 : _13.iouReportID, lastReadTime: (_14 = chat.report) === null || _14 === void 0 ? void 0 : _14.lastReadTime, lastVisibleActionCreated: (_15 = chat.report) === null || _15 === void 0 ? void 0 : _15.lastVisibleActionCreated, pendingFields: null, hasOutstandingChildRequest: (_16 = chat.report) === null || _16 === void 0 ? void 0 : _16.hasOutstandingChildRequest }, (isNewChatReport
            ? {
                errorFields: {
                    createChat: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('report.genericCreateReportFailureMessage'),
                },
            }
            : {})),
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iou.report.reportID),
        value: {
            pendingFields: null,
            errorFields: __assign({}, (shouldCreateNewMoneyRequestReport ? { createChat: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('report.genericCreateReportFailureMessage') } : {})),
        },
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.reportID),
        value: {
            pendingFields: null,
            errorFields: existingTransactionThreadReport
                ? null
                : {
                    createChat: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('report.genericCreateReportFailureMessage'),
                },
        },
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID),
        value: {
            errors: getReceiptError(transaction.receipt, 
            // Disabling this line since transaction.filename can be an empty string
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            transaction.filename || ((_17 = transaction.receipt) === null || _17 === void 0 ? void 0 : _17.filename), isScanRequest, errorKey, CONST_1.default.IOU.ACTION_PARAMS.MONEY_REQUEST, retryParams),
            pendingFields: clearedPendingFields,
        },
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(iou.report.reportID),
        value: __assign({}, (shouldCreateNewMoneyRequestReport
            ? (_o = {},
                _o[iou.createdAction.reportActionID] = {
                    errors: getReceiptError(transaction.receipt, 
                    // Disabling this line since transaction.filename can be an empty string
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    transaction.filename || ((_18 = transaction.receipt) === null || _18 === void 0 ? void 0 : _18.filename), isScanRequest, errorKey, CONST_1.default.IOU.ACTION_PARAMS.MONEY_REQUEST, retryParams),
                },
                _o[iou.action.reportActionID] = {
                    errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.genericCreateFailureMessage'),
                },
                _o) : (_p = {},
            _p[iou.action.reportActionID] = {
                errors: getReceiptError(transaction.receipt, 
                // Disabling this line since transaction.filename can be an empty string
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                transaction.filename || ((_19 = transaction.receipt) === null || _19 === void 0 ? void 0 : _19.filename), isScanRequest, errorKey, CONST_1.default.IOU.ACTION_PARAMS.MONEY_REQUEST, retryParams),
            },
            _p))),
    });
    if (!isOneOnOneSplit) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: ONYXKEYS_1.default.NVP_QUICK_ACTION_GLOBAL_CREATE,
            value: {
                action: newQuickAction,
                chatReportID: (_20 = chat.report) === null || _20 === void 0 ? void 0 : _20.reportID,
                isFirstQuickAction: (0, EmptyObject_1.isEmptyObject)(quickAction),
            },
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: ONYXKEYS_1.default.NVP_QUICK_ACTION_GLOBAL_CREATE,
            value: quickAction !== null && quickAction !== void 0 ? quickAction : null,
        });
    }
    if (!(0, EmptyObject_1.isEmptyObject)(transactionThreadCreatedReportAction)) {
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.reportID),
            value: (_q = {},
                _q[transactionThreadCreatedReportAction.reportActionID] = {
                    errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.genericCreateFailureMessage'),
                },
                _q),
        });
    }
    var reportActions = (0, expensify_common_1.fastMerge)((_21 = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(iou.report.reportID)]) !== null && _21 !== void 0 ? _21 : {}, (_r = {}, _r[iou.action.reportActionID] = iou.action, _r), true);
    var isFromOneTransactionReport = !!(0, ReportActionsUtils_1.getOneTransactionThreadReportID)(iou.report, (_22 = chat.report) !== null && _22 !== void 0 ? _22 : undefined, reportActions, undefined, undefined);
    var searchUpdate = getSearchOnyxUpdate({
        transaction: transaction,
        participant: participant,
        iouReport: iou.report,
        policy: policy,
        transactionThreadReportID: transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.reportID,
        isFromOneTransactionReport: isFromOneTransactionReport,
    });
    if (searchUpdate) {
        if (searchUpdate.optimisticData) {
            optimisticData.push.apply(optimisticData, searchUpdate.optimisticData);
        }
        if (searchUpdate.successData) {
            successData.push.apply(successData, searchUpdate.successData);
        }
    }
    // We don't need to compute violations unless we're on a paid policy
    if (!policy || !(0, PolicyUtils_1.isPaidGroupPolicy)(policy)) {
        return [optimisticData, successData, failureData];
    }
    var violationsOnyxData = ViolationsUtils_1.default.getViolationsOnyxData(transaction, [], policy, policyTagList !== null && policyTagList !== void 0 ? policyTagList : {}, policyCategories !== null && policyCategories !== void 0 ? policyCategories : {}, (0, PolicyUtils_1.hasDependentTags)(policy, policyTagList !== null && policyTagList !== void 0 ? policyTagList : {}), false);
    if (violationsOnyxData) {
        var shouldFixViolations = Array.isArray(violationsOnyxData.value) && violationsOnyxData.value.length > 0;
        optimisticData.push(violationsOnyxData, {
            key: "".concat(ONYXKEYS_1.default.COLLECTION.NEXT_STEP).concat(iou.report.reportID),
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            value: (0, NextStepUtils_1.buildNextStep)(iou.report, (_23 = iou.report.statusNum) !== null && _23 !== void 0 ? _23 : CONST_1.default.REPORT.STATE_NUM.OPEN, shouldFixViolations),
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transaction.transactionID),
            value: [],
        });
    }
    return [optimisticData, successData, failureData];
}
/** Builds the Onyx data for an invoice */
function buildOnyxDataForInvoice(invoiceParams) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    var _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20;
    var chat = invoiceParams.chat, iou = invoiceParams.iou, transactionParams = invoiceParams.transactionParams, policyParams = invoiceParams.policyParams, optimisticDataParams = invoiceParams.optimisticData, companyName = invoiceParams.companyName, companyWebsite = invoiceParams.companyWebsite, participant = invoiceParams.participant;
    var transaction = transactionParams.transaction;
    var clearedPendingFields = Object.fromEntries(Object.keys((_l = transactionParams.transaction.pendingFields) !== null && _l !== void 0 ? _l : {}).map(function (key) { return [key, null]; }));
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat((_m = iou.report) === null || _m === void 0 ? void 0 : _m.reportID),
            value: __assign(__assign({}, iou.report), { lastMessageText: (0, ReportActionsUtils_1.getReportActionText)(iou.action), lastMessageHtml: (0, ReportActionsUtils_1.getReportActionHtml)(iou.action), pendingFields: {
                    createChat: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                } }),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat((_o = iou.report) === null || _o === void 0 ? void 0 : _o.reportID),
            value: {
                isOptimisticReport: true,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionParams.transaction.transactionID),
            value: transactionParams.transaction,
        },
        chat.isNewReport
            ? {
                onyxMethod: react_native_onyx_1.default.METHOD.SET,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat((_p = chat.report) === null || _p === void 0 ? void 0 : _p.reportID),
                value: (_a = {},
                    _a[chat.createdAction.reportActionID] = chat.createdAction,
                    _a[chat.reportPreviewAction.reportActionID] = chat.reportPreviewAction,
                    _a),
            }
            : {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat((_q = chat.report) === null || _q === void 0 ? void 0 : _q.reportID),
                value: (_b = {},
                    _b[chat.reportPreviewAction.reportActionID] = chat.reportPreviewAction,
                    _b),
            },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat((_r = iou.report) === null || _r === void 0 ? void 0 : _r.reportID),
            value: (_c = {},
                _c[iou.createdAction.reportActionID] = iou.createdAction,
                _c[iou.action.reportActionID] = iou.action,
                _c),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionParams.threadReport.reportID),
            value: transactionParams.threadReport,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat((_s = transactionParams.threadReport) === null || _s === void 0 ? void 0 : _s.reportID),
            value: {
                isOptimisticReport: true,
            },
        },
    ];
    if ((_t = transactionParams.threadCreatedReportAction) === null || _t === void 0 ? void 0 : _t.reportActionID) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionParams.threadReport.reportID),
            value: (_d = {},
                _d[transactionParams.threadCreatedReportAction.reportActionID] = transactionParams.threadCreatedReportAction,
                _d),
        });
    }
    var successData = [];
    if (chat.report) {
        optimisticData.push({
            // Use SET for new reports because it doesn't exist yet, is faster and we need the data to be available when we navigate to the chat page
            onyxMethod: chat.isNewReport ? react_native_onyx_1.default.METHOD.SET : react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chat.report.reportID),
            value: __assign(__assign(__assign({}, chat.report), { lastReadTime: DateUtils_1.default.getDBTime(), iouReportID: (_u = iou.report) === null || _u === void 0 ? void 0 : _u.reportID }), (chat.isNewReport ? { pendingFields: { createChat: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD } } : {})),
        });
        if (chat.isNewReport) {
            optimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat((_v = chat.report) === null || _v === void 0 ? void 0 : _v.reportID),
                value: {
                    isOptimisticReport: true,
                },
            });
        }
    }
    if (optimisticDataParams.policyRecentlyUsedCategories.length) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES).concat((_w = iou.report) === null || _w === void 0 ? void 0 : _w.policyID),
            value: optimisticDataParams.policyRecentlyUsedCategories,
        });
    }
    if ((_x = optimisticDataParams.recentlyUsedCurrencies) === null || _x === void 0 ? void 0 : _x.length) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: ONYXKEYS_1.default.RECENTLY_USED_CURRENCIES,
            value: optimisticDataParams.recentlyUsedCurrencies,
        });
    }
    if (!(0, EmptyObject_1.isEmptyObject)(optimisticDataParams.policyRecentlyUsedTags)) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_RECENTLY_USED_TAGS).concat((_y = iou.report) === null || _y === void 0 ? void 0 : _y.policyID),
            value: optimisticDataParams.policyRecentlyUsedTags,
        });
    }
    var redundantParticipants = {};
    if (!(0, EmptyObject_1.isEmptyObject)(optimisticDataParams.personalDetailListAction)) {
        var successPersonalDetailListAction_2 = {};
        // BE will send different participants. We clear the optimistic ones to avoid duplicated entries
        Object.keys(optimisticDataParams.personalDetailListAction).forEach(function (accountIDKey) {
            var accountID = Number(accountIDKey);
            successPersonalDetailListAction_2[accountID] = null;
            redundantParticipants[accountID] = null;
        });
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
            value: optimisticDataParams.personalDetailListAction,
        });
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
            value: successPersonalDetailListAction_2,
        });
    }
    successData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat((_z = iou.report) === null || _z === void 0 ? void 0 : _z.reportID),
        value: {
            participants: redundantParticipants,
            pendingFields: null,
            errorFields: null,
        },
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat((_0 = iou.report) === null || _0 === void 0 ? void 0 : _0.reportID),
        value: {
            isOptimisticReport: false,
        },
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionParams.threadReport.reportID),
        value: {
            participants: redundantParticipants,
            pendingFields: null,
            errorFields: null,
        },
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(transactionParams.threadReport.reportID),
        value: {
            isOptimisticReport: false,
        },
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionParams.transaction.transactionID),
        value: {
            pendingAction: null,
            pendingFields: clearedPendingFields,
        },
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat((_1 = chat.report) === null || _1 === void 0 ? void 0 : _1.reportID),
        value: __assign(__assign({}, (chat.isNewReport
            ? (_e = {},
                _e[chat.createdAction.reportActionID] = {
                    pendingAction: null,
                    errors: null,
                },
                _e) : {})), (_f = {}, _f[chat.reportPreviewAction.reportActionID] = {
            pendingAction: null,
        }, _f)),
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat((_2 = iou.report) === null || _2 === void 0 ? void 0 : _2.reportID),
        value: (_g = {},
            _g[iou.createdAction.reportActionID] = {
                pendingAction: null,
                errors: null,
            },
            _g[iou.action.reportActionID] = {
                pendingAction: null,
                errors: null,
            },
            _g),
    });
    if ((_3 = transactionParams.threadCreatedReportAction) === null || _3 === void 0 ? void 0 : _3.reportActionID) {
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionParams.threadReport.reportID),
            value: (_h = {},
                _h[transactionParams.threadCreatedReportAction.reportActionID] = {
                    pendingAction: null,
                    errors: null,
                },
                _h),
        });
    }
    if (chat.isNewReport) {
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat((_4 = chat.report) === null || _4 === void 0 ? void 0 : _4.reportID),
            value: {
                participants: redundantParticipants,
                pendingFields: null,
                errorFields: null,
            },
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat((_5 = chat.report) === null || _5 === void 0 ? void 0 : _5.reportID),
            value: {
                isOptimisticReport: false,
            },
        });
    }
    var errorKey = DateUtils_1.default.getMicroseconds();
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat((_6 = chat.report) === null || _6 === void 0 ? void 0 : _6.reportID),
            value: __assign({ iouReportID: (_7 = chat.report) === null || _7 === void 0 ? void 0 : _7.iouReportID, lastReadTime: (_8 = chat.report) === null || _8 === void 0 ? void 0 : _8.lastReadTime, pendingFields: null, hasOutstandingChildRequest: (_9 = chat.report) === null || _9 === void 0 ? void 0 : _9.hasOutstandingChildRequest }, (chat.isNewReport
                ? {
                    errorFields: {
                        createChat: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('report.genericCreateReportFailureMessage'),
                    },
                }
                : {})),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat((_10 = iou.report) === null || _10 === void 0 ? void 0 : _10.reportID),
            value: {
                pendingFields: null,
                errorFields: {
                    createChat: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('report.genericCreateReportFailureMessage'),
                },
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionParams.threadReport.reportID),
            value: {
                errorFields: {
                    createChat: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('report.genericCreateReportFailureMessage'),
                },
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionParams.transaction.transactionID),
            value: {
                errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.genericCreateInvoiceFailureMessage'),
                pendingFields: clearedPendingFields,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat((_11 = iou.report) === null || _11 === void 0 ? void 0 : _11.reportID),
            value: (_j = {},
                _j[iou.createdAction.reportActionID] = {
                    // Disabling this line since transactionParams.transaction.filename can be an empty string
                    errors: getReceiptError(transactionParams.transaction.receipt, 
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    ((_12 = transactionParams.transaction) === null || _12 === void 0 ? void 0 : _12.filename) || ((_13 = transactionParams.transaction.receipt) === null || _13 === void 0 ? void 0 : _13.filename), false, errorKey),
                },
                _j[iou.action.reportActionID] = {
                    errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.genericCreateInvoiceFailureMessage'),
                },
                _j),
        },
    ];
    if ((_14 = transactionParams.threadCreatedReportAction) === null || _14 === void 0 ? void 0 : _14.reportActionID) {
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionParams.threadReport.reportID),
            value: (_k = {},
                _k[transactionParams.threadCreatedReportAction.reportActionID] = {
                    errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.genericCreateInvoiceFailureMessage', errorKey),
                },
                _k),
        });
    }
    if (companyName && companyWebsite) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat((_15 = policyParams.policy) === null || _15 === void 0 ? void 0 : _15.id),
            value: {
                invoice: {
                    companyName: companyName,
                    companyWebsite: companyWebsite,
                    pendingFields: {
                        companyName: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        companyWebsite: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        });
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat((_16 = policyParams.policy) === null || _16 === void 0 ? void 0 : _16.id),
            value: {
                invoice: {
                    pendingFields: {
                        companyName: null,
                        companyWebsite: null,
                    },
                },
            },
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat((_17 = policyParams.policy) === null || _17 === void 0 ? void 0 : _17.id),
            value: {
                invoice: {
                    companyName: null,
                    companyWebsite: null,
                    pendingFields: {
                        companyName: null,
                        companyWebsite: null,
                    },
                },
            },
        });
    }
    var searchUpdate = getSearchOnyxUpdate({
        transaction: transaction,
        participant: participant,
        isInvoice: true,
        transactionThreadReportID: transactionParams.threadReport.reportID,
    });
    if (searchUpdate) {
        if (searchUpdate.optimisticData) {
            optimisticData.push.apply(optimisticData, searchUpdate.optimisticData);
        }
        if (searchUpdate.successData) {
            successData.push.apply(successData, searchUpdate.successData);
        }
    }
    // We don't need to compute violations unless we're on a paid policy
    if (!policyParams.policy || !(0, PolicyUtils_1.isPaidGroupPolicy)(policyParams.policy)) {
        return [optimisticData, successData, failureData];
    }
    var violationsOnyxData = ViolationsUtils_1.default.getViolationsOnyxData(transactionParams.transaction, [], policyParams.policy, (_18 = policyParams.policyTagList) !== null && _18 !== void 0 ? _18 : {}, (_19 = policyParams.policyCategories) !== null && _19 !== void 0 ? _19 : {}, (0, PolicyUtils_1.hasDependentTags)(policyParams.policy, (_20 = policyParams.policyTagList) !== null && _20 !== void 0 ? _20 : {}), true);
    if (violationsOnyxData) {
        optimisticData.push(violationsOnyxData);
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionParams.transaction.transactionID),
            value: [],
        });
    }
    return [optimisticData, successData, failureData];
}
/** Builds the Onyx data for track expense */
function buildOnyxDataForTrackExpense(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
    var _v, _w, _x, _y, _z, _0;
    var chat = _a.chat, iou = _a.iou, transactionParams = _a.transactionParams, _1 = _a.policyParams, policyParams = _1 === void 0 ? {} : _1, shouldCreateNewMoneyRequestReport = _a.shouldCreateNewMoneyRequestReport, existingTransactionThreadReportID = _a.existingTransactionThreadReportID, actionableTrackExpenseWhisper = _a.actionableTrackExpenseWhisper, retryParams = _a.retryParams, participant = _a.participant;
    var chatReport = chat.report, reportPreviewAction = chat.previewAction;
    var iouReport = iou.report, iouCreatedAction = iou.createdAction, iouAction = iou.action;
    var transaction = transactionParams.transaction, transactionThreadReport = transactionParams.threadReport, transactionThreadCreatedReportAction = transactionParams.threadCreatedReportAction;
    var policy = policyParams.policy, policyTagList = policyParams.tagList, policyCategories = policyParams.categories;
    var isScanRequest = (0, TransactionUtils_1.isScanRequest)(transaction);
    var isASAPSubmitBetaEnabled = Permissions_1.default.isBetaEnabled(CONST_1.default.BETAS.ASAP_SUBMIT, allBetas);
    var isDistanceRequest = (0, TransactionUtils_1.isDistanceRequest)(transaction);
    var clearedPendingFields = Object.fromEntries(Object.keys((_v = transaction.pendingFields) !== null && _v !== void 0 ? _v : {}).map(function (key) { return [key, null]; }));
    var optimisticData = [];
    var successData = [];
    var failureData = [];
    var isSelfDMReport = (0, ReportUtils_1.isSelfDM)(chatReport);
    var newQuickAction = isSelfDMReport ? CONST_1.default.QUICK_ACTIONS.TRACK_MANUAL : CONST_1.default.QUICK_ACTIONS.REQUEST_MANUAL;
    if (isScanRequest) {
        newQuickAction = isSelfDMReport ? CONST_1.default.QUICK_ACTIONS.TRACK_SCAN : CONST_1.default.QUICK_ACTIONS.REQUEST_SCAN;
    }
    else if (isDistanceRequest) {
        newQuickAction = isSelfDMReport ? CONST_1.default.QUICK_ACTIONS.TRACK_DISTANCE : CONST_1.default.QUICK_ACTIONS.REQUEST_DISTANCE;
    }
    var existingTransactionThreadReport = (_w = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(existingTransactionThreadReportID)]) !== null && _w !== void 0 ? _w : null;
    if (chatReport) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport.reportID),
            value: __assign(__assign({}, chatReport), { lastMessageText: (0, ReportActionsUtils_1.getReportActionText)(iouAction), lastMessageHtml: (0, ReportActionsUtils_1.getReportActionHtml)(iouAction), lastReadTime: DateUtils_1.default.getDBTime(), 
                // do not update iouReportID if auto submit beta is enabled and it is a scan request
                iouReportID: isASAPSubmitBetaEnabled && isScanRequest ? null : iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID, lastVisibleActionCreated: shouldCreateNewMoneyRequestReport ? reportPreviewAction === null || reportPreviewAction === void 0 ? void 0 : reportPreviewAction.created : chatReport.lastVisibleActionCreated }),
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: ONYXKEYS_1.default.NVP_QUICK_ACTION_GLOBAL_CREATE,
            value: {
                action: newQuickAction,
                chatReportID: chatReport.reportID,
                isFirstQuickAction: (0, EmptyObject_1.isEmptyObject)(quickAction),
            },
        });
        if (actionableTrackExpenseWhisper && !iouReport) {
            optimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID),
                value: (_b = {},
                    _b[actionableTrackExpenseWhisper.reportActionID] = actionableTrackExpenseWhisper,
                    _b),
            });
            optimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport.reportID),
                value: {
                    lastVisibleActionCreated: actionableTrackExpenseWhisper.created,
                    lastMessageText: CONST_1.default.ACTIONABLE_TRACK_EXPENSE_WHISPER_MESSAGE,
                },
            });
            successData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID),
                value: (_c = {},
                    _c[actionableTrackExpenseWhisper.reportActionID] = { pendingAction: null, errors: null },
                    _c),
            });
            failureData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID),
                value: (_d = {}, _d[actionableTrackExpenseWhisper.reportActionID] = null, _d),
            });
        }
    }
    if (iouReport) {
        optimisticData.push({
            onyxMethod: shouldCreateNewMoneyRequestReport ? react_native_onyx_1.default.METHOD.SET : react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iouReport.reportID),
            value: __assign(__assign({}, iouReport), { lastMessageText: (0, ReportActionsUtils_1.getReportActionText)(iouAction), lastMessageHtml: (0, ReportActionsUtils_1.getReportActionHtml)(iouAction), pendingFields: __assign({}, (shouldCreateNewMoneyRequestReport ? { createChat: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD } : { preview: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE })) }),
        }, shouldCreateNewMoneyRequestReport
            ? {
                onyxMethod: react_native_onyx_1.default.METHOD.SET,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(iouReport.reportID),
                value: (_e = {},
                    _e[iouCreatedAction.reportActionID] = iouCreatedAction,
                    _e[iouAction.reportActionID] = iouAction,
                    _e),
            }
            : {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(iouReport.reportID),
                value: (_f = {},
                    _f[iouAction.reportActionID] = iouAction,
                    _f),
            }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID),
            value: __assign({}, (reportPreviewAction && (_g = {}, _g[reportPreviewAction.reportActionID] = reportPreviewAction, _g))),
        });
        if (shouldCreateNewMoneyRequestReport) {
            optimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(iouReport.reportID),
                value: {
                    isOptimisticReport: true,
                },
            });
        }
    }
    else {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID),
            value: (_h = {},
                _h[iouAction.reportActionID] = iouAction,
                _h),
        });
    }
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.SET,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID),
        value: transaction,
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.reportID),
        value: __assign(__assign({}, transactionThreadReport), { pendingFields: { createChat: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD } }),
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.reportID),
        value: {
            isOptimisticReport: true,
        },
    });
    if (!(0, EmptyObject_1.isEmptyObject)(transactionThreadCreatedReportAction)) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.reportID),
            value: (_j = {},
                _j[transactionThreadCreatedReportAction.reportActionID] = transactionThreadCreatedReportAction,
                _j),
        });
    }
    if (iouReport) {
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID),
            value: {
                pendingFields: null,
                errorFields: null,
            },
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID),
            value: __assign(__assign({}, (shouldCreateNewMoneyRequestReport
                ? (_k = {},
                    _k[iouCreatedAction.reportActionID] = {
                        pendingAction: null,
                        errors: null,
                    },
                    _k) : {})), (_l = {}, _l[iouAction.reportActionID] = {
                pendingAction: null,
                errors: null,
            }, _l)),
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID),
            value: __assign({}, (reportPreviewAction && (_m = {}, _m[reportPreviewAction.reportActionID] = { pendingAction: null }, _m))),
        });
        if (shouldCreateNewMoneyRequestReport) {
            successData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(iouReport.reportID),
                value: {
                    isOptimisticReport: false,
                },
            });
        }
    }
    else {
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID),
            value: __assign((_o = {}, _o[iouAction.reportActionID] = {
                pendingAction: null,
                errors: null,
            }, _o), (reportPreviewAction && (_p = {}, _p[reportPreviewAction.reportActionID] = { pendingAction: null }, _p))),
        });
    }
    successData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.reportID),
        value: {
            pendingFields: null,
            errorFields: null,
        },
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.reportID),
        value: {
            isOptimisticReport: false,
        },
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID),
        value: {
            pendingAction: null,
            pendingFields: clearedPendingFields,
            routes: null,
        },
    });
    if (!(0, EmptyObject_1.isEmptyObject)(transactionThreadCreatedReportAction)) {
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.reportID),
            value: (_q = {},
                _q[transactionThreadCreatedReportAction.reportActionID] = {
                    pendingAction: null,
                    errors: null,
                },
                _q),
        });
    }
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.SET,
        key: ONYXKEYS_1.default.NVP_QUICK_ACTION_GLOBAL_CREATE,
        value: quickAction !== null && quickAction !== void 0 ? quickAction : null,
    });
    if (iouReport) {
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iouReport.reportID),
            value: {
                pendingFields: null,
                errorFields: __assign({}, (shouldCreateNewMoneyRequestReport ? { createChat: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('report.genericCreateReportFailureMessage') } : {})),
            },
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(iouReport.reportID),
            value: __assign({}, (shouldCreateNewMoneyRequestReport
                ? (_r = {},
                    _r[iouCreatedAction.reportActionID] = {
                        errors: getReceiptError(transaction.receipt, 
                        // Disabling this line since transaction.filename can be an empty string
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        transaction.filename || ((_x = transaction.receipt) === null || _x === void 0 ? void 0 : _x.filename), isScanRequest, undefined, CONST_1.default.IOU.ACTION_PARAMS.TRACK_EXPENSE, retryParams),
                    },
                    _r[iouAction.reportActionID] = {
                        errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.genericCreateFailureMessage'),
                    },
                    _r) : (_s = {},
                _s[iouAction.reportActionID] = {
                    errors: getReceiptError(transaction.receipt, 
                    // Disabling this line since transaction.filename can be an empty string
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    transaction.filename || ((_y = transaction.receipt) === null || _y === void 0 ? void 0 : _y.filename), isScanRequest, undefined, CONST_1.default.IOU.ACTION_PARAMS.TRACK_EXPENSE, retryParams),
                },
                _s))),
        });
    }
    else {
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID),
            value: (_t = {},
                _t[iouAction.reportActionID] = {
                    errors: getReceiptError(transaction.receipt, 
                    // Disabling this line since transaction.filename can be an empty string
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    transaction.filename || ((_z = transaction.receipt) === null || _z === void 0 ? void 0 : _z.filename), isScanRequest, undefined, CONST_1.default.IOU.ACTION_PARAMS.TRACK_EXPENSE, retryParams),
                },
                _t),
        });
    }
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID),
        value: {
            lastReadTime: chatReport === null || chatReport === void 0 ? void 0 : chatReport.lastReadTime,
            lastMessageText: chatReport === null || chatReport === void 0 ? void 0 : chatReport.lastMessageText,
            lastMessageHtml: chatReport === null || chatReport === void 0 ? void 0 : chatReport.lastMessageHtml,
        },
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.reportID),
        value: {
            pendingFields: null,
            errorFields: existingTransactionThreadReport
                ? null
                : {
                    createChat: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('report.genericCreateReportFailureMessage'),
                },
        },
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID),
        value: {
            errors: getReceiptError(transaction.receipt, 
            // Disabling this line since transaction.filename can be an empty string
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            transaction.filename || ((_0 = transaction.receipt) === null || _0 === void 0 ? void 0 : _0.filename), isScanRequest, undefined, CONST_1.default.IOU.ACTION_PARAMS.TRACK_EXPENSE, retryParams),
            pendingFields: clearedPendingFields,
        },
    });
    if (transactionThreadCreatedReportAction === null || transactionThreadCreatedReportAction === void 0 ? void 0 : transactionThreadCreatedReportAction.reportActionID) {
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.reportID),
            value: (_u = {},
                _u[transactionThreadCreatedReportAction === null || transactionThreadCreatedReportAction === void 0 ? void 0 : transactionThreadCreatedReportAction.reportActionID] = {
                    errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.genericCreateFailureMessage'),
                },
                _u),
        });
    }
    var searchUpdate = getSearchOnyxUpdate({
        transaction: transaction,
        participant: participant,
        transactionThreadReportID: transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.reportID,
    });
    if (searchUpdate) {
        if (searchUpdate.optimisticData) {
            optimisticData.push.apply(optimisticData, searchUpdate.optimisticData);
        }
        if (searchUpdate.successData) {
            successData.push.apply(successData, searchUpdate.successData);
        }
    }
    // We don't need to compute violations unless we're on a paid policy
    if (!policy || !(0, PolicyUtils_1.isPaidGroupPolicy)(policy)) {
        return [optimisticData, successData, failureData];
    }
    var violationsOnyxData = ViolationsUtils_1.default.getViolationsOnyxData(transaction, [], policy, policyTagList !== null && policyTagList !== void 0 ? policyTagList : {}, policyCategories !== null && policyCategories !== void 0 ? policyCategories : {}, (0, PolicyUtils_1.hasDependentTags)(policy, policyTagList !== null && policyTagList !== void 0 ? policyTagList : {}), false);
    if (violationsOnyxData) {
        optimisticData.push(violationsOnyxData);
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transaction.transactionID),
            value: [],
        });
    }
    // Show field violations only for control policies
    if ((0, PolicyUtils_1.isControlPolicy)(policy) && iouReport) {
        var _2 = getFieldViolationsOnyxData(iouReport), fieldViolationsOptimisticData = _2.optimisticData, fieldViolationsFailureData = _2.failureData;
        optimisticData.push.apply(optimisticData, fieldViolationsOptimisticData);
        failureData.push.apply(failureData, fieldViolationsFailureData);
    }
    return [optimisticData, successData, failureData];
}
function getDeleteTrackExpenseInformation(chatReportID, transactionID, reportAction, shouldDeleteTransactionFromOnyx, isMovingTransactionFromTrackExpense, actionableWhisperReportActionID, resolution, shouldRemoveIOUTransaction) {
    var _a, _b, _c, _d, _e, _f;
    var _g, _h, _j, _k, _l;
    if (shouldDeleteTransactionFromOnyx === void 0) { shouldDeleteTransactionFromOnyx = true; }
    if (isMovingTransactionFromTrackExpense === void 0) { isMovingTransactionFromTrackExpense = false; }
    if (actionableWhisperReportActionID === void 0) { actionableWhisperReportActionID = ''; }
    if (resolution === void 0) { resolution = ''; }
    if (shouldRemoveIOUTransaction === void 0) { shouldRemoveIOUTransaction = true; }
    // STEP 1: Get all collections we're updating
    var chatReport = (_g = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReportID)]) !== null && _g !== void 0 ? _g : null;
    var transaction = allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID)];
    var transactionViolations = allTransactionViolations["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID)];
    var transactionThreadID = reportAction.childReportID;
    var transactionThread = null;
    if (transactionThreadID) {
        transactionThread = (_h = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadID)]) !== null && _h !== void 0 ? _h : null;
    }
    // STEP 2: Decide if we need to:
    // 1. Delete the transactionThread - delete if there are no visible comments in the thread and we're not moving the transaction
    // 2. Update the moneyRequestPreview to show [Deleted expense] - update if the transactionThread exists AND it isn't being deleted and we're not moving the transaction
    var shouldDeleteTransactionThread = !isMovingTransactionFromTrackExpense && (transactionThreadID ? ((_j = reportAction === null || reportAction === void 0 ? void 0 : reportAction.childVisibleActionCount) !== null && _j !== void 0 ? _j : 0) === 0 : false);
    var shouldShowDeletedRequestMessage = !isMovingTransactionFromTrackExpense && !!transactionThreadID && !shouldDeleteTransactionThread;
    // STEP 3: Update the IOU reportAction.
    var updatedReportAction = __assign((_a = {}, _a[reportAction.reportActionID] = {
        pendingAction: shouldShowDeletedRequestMessage ? CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        previousMessage: reportAction.message,
        message: [
            {
                type: 'COMMENT',
                html: '',
                text: '',
                isEdited: true,
                isDeletedParentAction: shouldShowDeletedRequestMessage,
            },
        ],
        originalMessage: {
            IOUTransactionID: shouldRemoveIOUTransaction ? null : transactionID,
        },
        errors: undefined,
    }, _a), (actionableWhisperReportActionID && (_b = {}, _b[actionableWhisperReportActionID] = { originalMessage: { resolution: resolution } }, _b)));
    var canUserPerformWriteAction = true;
    if (chatReport) {
        canUserPerformWriteAction = !!(0, ReportUtils_1.canUserPerformWriteAction)(chatReport);
    }
    var lastVisibleAction = (0, ReportActionsUtils_1.getLastVisibleAction)(chatReportID, canUserPerformWriteAction, updatedReportAction);
    var _m = (0, ReportActionsUtils_1.getLastVisibleMessage)(chatReportID, canUserPerformWriteAction, updatedReportAction), _o = _m.lastMessageText, lastMessageText = _o === void 0 ? '' : _o, _p = _m.lastMessageHtml, lastMessageHtml = _p === void 0 ? '' : _p;
    // STEP 4: Build Onyx data
    var optimisticData = [];
    if (shouldDeleteTransactionFromOnyx && shouldRemoveIOUTransaction) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
            value: null,
        });
    }
    if (!shouldRemoveIOUTransaction) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
            value: {
                pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            },
        });
    }
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.SET,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID),
        value: null,
    });
    if (shouldDeleteTransactionThread) {
        optimisticData.push(
        // Use merge instead of set to avoid deleting the report too quickly, which could cause a brief "not found" page to appear.
        // The remaining parts of the report object will be removed after the API call is successful.
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadID),
            value: {
                reportID: null,
                stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST_1.default.REPORT.STATUS_NUM.CLOSED,
                participants: (_c = {},
                    _c[userAccountID] = {
                        notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                    },
                    _c),
            },
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionThreadID),
            value: null,
        });
    }
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID),
        value: updatedReportAction,
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID),
        value: {
            lastMessageText: lastMessageText,
            lastVisibleActionCreated: lastVisibleAction === null || lastVisibleAction === void 0 ? void 0 : lastVisibleAction.created,
            lastMessageHtml: !lastMessageHtml ? lastMessageText : lastMessageHtml,
        },
    });
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID),
            value: (_d = {},
                _d[reportAction.reportActionID] = {
                    pendingAction: null,
                    errors: null,
                },
                _d),
        },
    ];
    // Ensure that any remaining data is removed upon successful completion, even if the server sends a report removal response.
    // This is done to prevent the removal update from lingering in the applyHTTPSOnyxUpdates function.
    if (shouldDeleteTransactionThread && transactionThread) {
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadID),
            value: null,
        });
    }
    var failureData = [];
    if (shouldDeleteTransactionFromOnyx && shouldRemoveIOUTransaction) {
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
            value: transaction !== null && transaction !== void 0 ? transaction : null,
        });
    }
    if (!shouldRemoveIOUTransaction) {
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
            value: {
                pendingAction: null,
            },
        });
    }
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.SET,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID),
        value: transactionViolations !== null && transactionViolations !== void 0 ? transactionViolations : null,
    });
    if (shouldDeleteTransactionThread) {
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadID),
            value: transactionThread,
        });
    }
    if (actionableWhisperReportActionID) {
        var actionableWhisperReportAction = (0, ReportActionsUtils_1.getReportAction)(chatReportID, actionableWhisperReportActionID);
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID),
            value: (_e = {},
                _e[actionableWhisperReportActionID] = {
                    originalMessage: {
                        resolution: (0, ReportActionsUtils_1.isActionableTrackExpense)(actionableWhisperReportAction) ? ((_l = (_k = (0, ReportActionsUtils_1.getOriginalMessage)(actionableWhisperReportAction)) === null || _k === void 0 ? void 0 : _k.resolution) !== null && _l !== void 0 ? _l : null) : null,
                    },
                },
                _e),
        });
    }
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID),
        value: (_f = {},
            _f[reportAction.reportActionID] = __assign(__assign({}, reportAction), { pendingAction: null, errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.genericDeleteFailureMessage') }),
            _f),
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID),
        value: chatReport,
    });
    var parameters = {
        transactionID: transactionID,
        reportActionID: reportAction.reportActionID,
    };
    return { parameters: parameters, optimisticData: optimisticData, successData: successData, failureData: failureData, shouldDeleteTransactionThread: shouldDeleteTransactionThread, chatReport: chatReport };
}
/**
 * Get the invoice receiver type based on the receiver participant.
 * @param receiverParticipant The participant who will receive the invoice or the invoice receiver object directly.
 * @returns The invoice receiver type.
 */
function getReceiverType(receiverParticipant) {
    if (!receiverParticipant) {
        Log_1.default.warn('getReceiverType called with no receiverParticipant');
        return CONST_1.default.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL;
    }
    if ('type' in receiverParticipant && receiverParticipant.type) {
        return receiverParticipant.type;
    }
    if ('policyID' in receiverParticipant && receiverParticipant.policyID) {
        return CONST_1.default.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS;
    }
    return CONST_1.default.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL;
}
/** Gathers all the data needed to create an invoice. */
function getSendInvoiceInformation(transaction, currentUserAccountID, invoiceChatReport, receipt, policy, policyTagList, policyCategories, companyName, companyWebsite) {
    var _a;
    var _b, _c, _d, _e, _f, _g, _h, _j;
    var _k = transaction !== null && transaction !== void 0 ? transaction : {}, _l = _k.amount, amount = _l === void 0 ? 0 : _l, _m = _k.currency, currency = _m === void 0 ? '' : _m, _o = _k.created, created = _o === void 0 ? '' : _o, _p = _k.merchant, merchant = _p === void 0 ? '' : _p, _q = _k.category, category = _q === void 0 ? '' : _q, _r = _k.tag, tag = _r === void 0 ? '' : _r, _s = _k.taxCode, taxCode = _s === void 0 ? '' : _s, _t = _k.taxAmount, taxAmount = _t === void 0 ? 0 : _t, billable = _k.billable, comment = _k.comment, participants = _k.participants;
    var trimmedComment = ((_b = comment === null || comment === void 0 ? void 0 : comment.comment) !== null && _b !== void 0 ? _b : '').trim();
    var senderWorkspaceID = (_c = participants === null || participants === void 0 ? void 0 : participants.find(function (participant) { return participant === null || participant === void 0 ? void 0 : participant.isSender; })) === null || _c === void 0 ? void 0 : _c.policyID;
    var receiverParticipant = (_d = participants === null || participants === void 0 ? void 0 : participants.find(function (participant) { return participant === null || participant === void 0 ? void 0 : participant.accountID; })) !== null && _d !== void 0 ? _d : invoiceChatReport === null || invoiceChatReport === void 0 ? void 0 : invoiceChatReport.invoiceReceiver;
    var receiverAccountID = receiverParticipant && 'accountID' in receiverParticipant && receiverParticipant.accountID ? receiverParticipant.accountID : CONST_1.default.DEFAULT_NUMBER_ID;
    var receiver = (0, ReportUtils_1.getPersonalDetailsForAccountID)(receiverAccountID);
    var optimisticPersonalDetailListAction = {};
    var receiverType = getReceiverType(receiverParticipant);
    // STEP 1: Get existing chat report OR build a new optimistic one
    var isNewChatReport = false;
    var chatReport = !(0, EmptyObject_1.isEmptyObject)(invoiceChatReport) && (invoiceChatReport === null || invoiceChatReport === void 0 ? void 0 : invoiceChatReport.reportID) ? invoiceChatReport : null;
    if (!chatReport) {
        chatReport = (_e = (0, ReportUtils_1.getInvoiceChatByParticipants)(receiverAccountID, receiverType, senderWorkspaceID)) !== null && _e !== void 0 ? _e : null;
    }
    if (!chatReport) {
        isNewChatReport = true;
        chatReport = (0, ReportUtils_1.buildOptimisticChatReport)({
            participantList: [receiverAccountID, currentUserAccountID],
            chatType: CONST_1.default.REPORT.CHAT_TYPE.INVOICE,
            policyID: senderWorkspaceID,
        });
    }
    // STEP 2: Create a new optimistic invoice report.
    var optimisticInvoiceReport = (0, ReportUtils_1.buildOptimisticInvoiceReport)(chatReport.reportID, senderWorkspaceID, receiverAccountID, (_g = (_f = receiver.displayName) !== null && _f !== void 0 ? _f : receiverParticipant === null || receiverParticipant === void 0 ? void 0 : receiverParticipant.login) !== null && _g !== void 0 ? _g : '', amount, currency);
    // STEP 3: Build optimistic receipt and transaction
    var receiptObject = {};
    var filename;
    if (receipt === null || receipt === void 0 ? void 0 : receipt.source) {
        receiptObject.source = receipt.source;
        receiptObject.state = (_h = receipt.state) !== null && _h !== void 0 ? _h : CONST_1.default.IOU.RECEIPT_STATE.SCAN_READY;
        filename = receipt.name;
    }
    var optimisticTransaction = (0, TransactionUtils_1.buildOptimisticTransaction)({
        transactionParams: {
            amount: amount * -1,
            currency: currency,
            reportID: optimisticInvoiceReport.reportID,
            comment: trimmedComment,
            created: created,
            merchant: merchant,
            receipt: receiptObject,
            category: category,
            tag: tag,
            taxCode: taxCode,
            taxAmount: taxAmount,
            billable: billable,
            filename: filename,
        },
    });
    var optimisticPolicyRecentlyUsedCategories = (0, Category_1.buildOptimisticPolicyRecentlyUsedCategories)(optimisticInvoiceReport.policyID, category);
    var optimisticPolicyRecentlyUsedTags = (0, Tag_1.buildOptimisticPolicyRecentlyUsedTags)(optimisticInvoiceReport.policyID, tag);
    var optimisticRecentlyUsedCurrencies = (0, Policy_1.buildOptimisticRecentlyUsedCurrencies)(currency);
    // STEP 4: Add optimistic personal details for participant
    var shouldCreateOptimisticPersonalDetails = isNewChatReport && !allPersonalDetails[receiverAccountID];
    if (shouldCreateOptimisticPersonalDetails) {
        var receiverLogin = receiverParticipant && 'login' in receiverParticipant && receiverParticipant.login ? receiverParticipant.login : '';
        receiver = {
            accountID: receiverAccountID,
            displayName: (0, LocalePhoneNumber_1.formatPhoneNumber)(receiverLogin),
            login: receiverLogin,
            isOptimisticPersonalDetail: true,
        };
        optimisticPersonalDetailListAction = (_a = {}, _a[receiverAccountID] = receiver, _a);
    }
    // STEP 5: Build optimistic reportActions.
    var reportPreviewAction = (0, ReportUtils_1.buildOptimisticReportPreview)(chatReport, optimisticInvoiceReport, trimmedComment, optimisticTransaction);
    optimisticInvoiceReport.parentReportActionID = reportPreviewAction.reportActionID;
    chatReport.lastVisibleActionCreated = reportPreviewAction.created;
    var _u = (0, ReportUtils_1.buildOptimisticMoneyRequestEntities)({
        iouReport: optimisticInvoiceReport,
        type: CONST_1.default.IOU.REPORT_ACTION_TYPE.CREATE,
        amount: amount,
        currency: currency,
        comment: trimmedComment,
        payeeEmail: (_j = receiver.login) !== null && _j !== void 0 ? _j : '',
        participants: [receiver],
        transactionID: optimisticTransaction.transactionID,
    }), optimisticCreatedActionForChat = _u[0], optimisticCreatedActionForIOUReport = _u[1], iouAction = _u[2], optimisticTransactionThread = _u[3], optimisticCreatedActionForTransactionThread = _u[4];
    // STEP 6: Build Onyx Data
    var _v = buildOnyxDataForInvoice({
        chat: { report: chatReport, createdAction: optimisticCreatedActionForChat, reportPreviewAction: reportPreviewAction, isNewReport: isNewChatReport },
        iou: { createdAction: optimisticCreatedActionForIOUReport, action: iouAction, report: optimisticInvoiceReport },
        transactionParams: {
            transaction: optimisticTransaction,
            threadReport: optimisticTransactionThread,
            threadCreatedReportAction: optimisticCreatedActionForTransactionThread,
        },
        policyParams: { policy: policy, policyTagList: policyTagList, policyCategories: policyCategories },
        optimisticData: {
            personalDetailListAction: optimisticPersonalDetailListAction,
            recentlyUsedCurrencies: optimisticRecentlyUsedCurrencies,
            policyRecentlyUsedCategories: optimisticPolicyRecentlyUsedCategories,
            policyRecentlyUsedTags: optimisticPolicyRecentlyUsedTags,
        },
        participant: receiver,
        companyName: companyName,
        companyWebsite: companyWebsite,
    }), optimisticData = _v[0], successData = _v[1], failureData = _v[2];
    return {
        createdIOUReportActionID: optimisticCreatedActionForIOUReport.reportActionID,
        createdReportActionIDForThread: optimisticCreatedActionForTransactionThread === null || optimisticCreatedActionForTransactionThread === void 0 ? void 0 : optimisticCreatedActionForTransactionThread.reportActionID,
        reportActionID: iouAction.reportActionID,
        senderWorkspaceID: senderWorkspaceID,
        receiver: receiver,
        invoiceRoom: chatReport,
        createdChatReportActionID: optimisticCreatedActionForChat.reportActionID,
        invoiceReportID: optimisticInvoiceReport.reportID,
        reportPreviewReportActionID: reportPreviewAction.reportActionID,
        transactionID: optimisticTransaction.transactionID,
        transactionThreadReportID: optimisticTransactionThread.reportID,
        onyxData: {
            optimisticData: optimisticData,
            successData: successData,
            failureData: failureData,
        },
    };
}
/**
 * Gathers all the data needed to submit an expense. It attempts to find existing reports, iouReports, and receipts. If it doesn't find them, then
 * it creates optimistic versions of them and uses those instead
 */
function getMoneyRequestInformation(moneyRequestInformation) {
    var _a;
    var _b, _c, _d, _e, _f, _g;
    var parentChatReport = moneyRequestInformation.parentChatReport, transactionParams = moneyRequestInformation.transactionParams, participantParams = moneyRequestInformation.participantParams, _h = moneyRequestInformation.policyParams, policyParams = _h === void 0 ? {} : _h, existingTransaction = moneyRequestInformation.existingTransaction, existingTransactionID = moneyRequestInformation.existingTransactionID, _j = moneyRequestInformation.moneyRequestReportID, moneyRequestReportID = _j === void 0 ? '' : _j, retryParams = moneyRequestInformation.retryParams, isSplitExpense = moneyRequestInformation.isSplitExpense, testDriveCommentReportActionID = moneyRequestInformation.testDriveCommentReportActionID, optimisticChatReportID = moneyRequestInformation.optimisticChatReportID, optimisticCreatedReportActionID = moneyRequestInformation.optimisticCreatedReportActionID, optimisticIOUReportID = moneyRequestInformation.optimisticIOUReportID, optimisticReportPreviewActionID = moneyRequestInformation.optimisticReportPreviewActionID;
    var _k = participantParams.payeeAccountID, payeeAccountID = _k === void 0 ? userAccountID : _k, _l = participantParams.payeeEmail, payeeEmail = _l === void 0 ? currentUserEmail : _l, participant = participantParams.participant;
    var policy = policyParams.policy, policyCategories = policyParams.policyCategories, policyTagList = policyParams.policyTagList;
    var attendees = transactionParams.attendees, amount = transactionParams.amount, _m = transactionParams.comment, comment = _m === void 0 ? '' : _m, currency = transactionParams.currency, _o = transactionParams.source, source = _o === void 0 ? '' : _o, created = transactionParams.created, merchant = transactionParams.merchant, receipt = transactionParams.receipt, category = transactionParams.category, tag = transactionParams.tag, taxCode = transactionParams.taxCode, taxAmount = transactionParams.taxAmount, billable = transactionParams.billable, linkedTrackedExpenseReportAction = transactionParams.linkedTrackedExpenseReportAction;
    var payerEmail = (0, PhoneNumber_1.addSMSDomainIfPhoneNumber)((_b = participant.login) !== null && _b !== void 0 ? _b : '');
    var payerAccountID = Number(participant.accountID);
    var isPolicyExpenseChat = participant.isPolicyExpenseChat;
    // STEP 1: Get existing chat report OR build a new optimistic one
    var isNewChatReport = false;
    var chatReport = !(0, EmptyObject_1.isEmptyObject)(parentChatReport) && (parentChatReport === null || parentChatReport === void 0 ? void 0 : parentChatReport.reportID) ? parentChatReport : null;
    // If this is a policyExpenseChat, the chatReport must exist and we can get it from Onyx.
    // report is null if the flow is initiated from the global create menu. However, participant always stores the reportID if it exists, which is the case for policyExpenseChats
    if (!chatReport && isPolicyExpenseChat) {
        chatReport = (_c = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(participant.reportID)]) !== null && _c !== void 0 ? _c : null;
    }
    if (!chatReport) {
        chatReport = (_d = (0, ReportUtils_1.getChatByParticipants)([payerAccountID, payeeAccountID])) !== null && _d !== void 0 ? _d : null;
    }
    // If we still don't have a report, it likely doesn't exist and we need to build an optimistic one
    if (!chatReport) {
        isNewChatReport = true;
        chatReport = (0, ReportUtils_1.buildOptimisticChatReport)({
            participantList: [payerAccountID, payeeAccountID],
            optimisticReportID: optimisticChatReportID,
        });
    }
    // STEP 2: Get the Expense/IOU report. If the moneyRequestReportID has been provided, we want to add the transaction to this specific report.
    // If no such reportID has been provided, let's use the chatReport.iouReportID property. In case that is not present, build a new optimistic Expense/IOU report.
    var iouReport = null;
    if (moneyRequestReportID) {
        iouReport = (_e = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(moneyRequestReportID)]) !== null && _e !== void 0 ? _e : null;
    }
    else {
        iouReport = (_f = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport.iouReportID)]) !== null && _f !== void 0 ? _f : null;
    }
    var isScanRequest = (0, TransactionUtils_1.isScanRequest)({ amount: amount, receipt: receipt });
    var shouldCreateNewMoneyRequestReport = (0, ReportUtils_1.shouldCreateNewMoneyRequestReport)(iouReport, chatReport, isScanRequest);
    if (!iouReport || shouldCreateNewMoneyRequestReport) {
        iouReport = isPolicyExpenseChat
            ? (0, ReportUtils_1.buildOptimisticExpenseReport)(chatReport.reportID, chatReport.policyID, payeeAccountID, amount, currency, undefined, undefined, optimisticIOUReportID)
            : (0, ReportUtils_1.buildOptimisticIOUReport)(payeeAccountID, payerAccountID, amount, chatReport.reportID, currency, undefined, undefined, optimisticIOUReportID);
    }
    else if (isPolicyExpenseChat) {
        // Splitting doesn’t affect the amount, so no adjustment is needed
        // The amount remains constant after the split
        if (!isSplitExpense) {
            iouReport = __assign({}, iouReport);
            // Because of the Expense reports are stored as negative values, we subtract the total from the amount
            if ((iouReport === null || iouReport === void 0 ? void 0 : iouReport.currency) === currency) {
                if (!Number.isNaN(iouReport.total) && iouReport.total !== undefined) {
                    iouReport.total -= amount;
                }
                if (typeof iouReport.unheldTotal === 'number') {
                    iouReport.unheldTotal -= amount;
                }
            }
        }
    }
    else {
        iouReport = (0, IOUUtils_1.updateIOUOwnerAndTotal)(iouReport, payeeAccountID, amount, currency);
    }
    // STEP 3: Build an optimistic transaction with the receipt
    var isDistanceRequest = existingTransaction && existingTransaction.iouRequestType === CONST_1.default.IOU.REQUEST_TYPE.DISTANCE;
    var optimisticTransaction = (0, TransactionUtils_1.buildOptimisticTransaction)({
        existingTransactionID: existingTransactionID,
        existingTransaction: existingTransaction,
        originalTransactionID: transactionParams.originalTransactionID,
        policy: policy,
        transactionParams: {
            amount: (0, ReportUtils_1.isExpenseReport)(iouReport) ? -amount : amount,
            currency: currency,
            reportID: iouReport.reportID,
            comment: comment,
            attendees: attendees,
            created: created,
            merchant: merchant,
            receipt: receipt,
            category: category,
            tag: tag,
            taxCode: taxCode,
            source: source,
            taxAmount: (0, ReportUtils_1.isExpenseReport)(iouReport) ? -(taxAmount !== null && taxAmount !== void 0 ? taxAmount : 0) : taxAmount,
            billable: billable,
            pendingFields: isDistanceRequest ? { waypoints: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD } : undefined,
        },
    });
    var optimisticPolicyRecentlyUsedCategories = (0, Category_1.buildOptimisticPolicyRecentlyUsedCategories)(iouReport.policyID, category);
    var optimisticPolicyRecentlyUsedTags = (0, Tag_1.buildOptimisticPolicyRecentlyUsedTags)(iouReport.policyID, tag);
    var optimisticPolicyRecentlyUsedCurrencies = (0, Policy_1.buildOptimisticRecentlyUsedCurrencies)(currency);
    // If there is an existing transaction (which is the case for distance requests), then the data from the existing transaction
    // needs to be manually merged into the optimistic transaction. This is because buildOnyxDataForMoneyRequest() uses `Onyx.set()` for the transaction
    // data. This is a big can of worms to change it to `Onyx.merge()` as explored in https://expensify.slack.com/archives/C05DWUDHVK7/p1692139468252109.
    // I want to clean this up at some point, but it's possible this will live in the code for a while so I've created https://github.com/Expensify/App/issues/25417
    // to remind me to do this.
    if (isDistanceRequest) {
        optimisticTransaction = (0, expensify_common_1.fastMerge)(existingTransaction, optimisticTransaction, false);
    }
    // STEP 4: Build optimistic reportActions. We need:
    // 1. CREATED action for the chatReport
    // 2. CREATED action for the iouReport
    // 3. IOU action for the iouReport
    // 4. The transaction thread, which requires the iouAction, and CREATED action for the transaction thread
    // 5. REPORT_PREVIEW action for the chatReport
    // Note: The CREATED action for the IOU report must be optimistically generated before the IOU action so there's no chance that it appears after the IOU action in the chat
    var _p = (0, ReportUtils_1.buildOptimisticMoneyRequestEntities)({
        iouReport: iouReport,
        type: CONST_1.default.IOU.REPORT_ACTION_TYPE.CREATE,
        amount: amount,
        currency: currency,
        comment: comment,
        payeeEmail: payeeEmail,
        participants: [participant],
        transactionID: optimisticTransaction.transactionID,
        paymentType: (0, ReportUtils_1.isSelectedManagerMcTest)(participant.login) || ((_g = transactionParams.receipt) === null || _g === void 0 ? void 0 : _g.isTestDriveReceipt) ? CONST_1.default.IOU.PAYMENT_TYPE.ELSEWHERE : undefined,
        existingTransactionThreadReportID: linkedTrackedExpenseReportAction === null || linkedTrackedExpenseReportAction === void 0 ? void 0 : linkedTrackedExpenseReportAction.childReportID,
        optimisticCreatedReportActionID: optimisticCreatedReportActionID,
        linkedTrackedExpenseReportAction: linkedTrackedExpenseReportAction,
    }), optimisticCreatedActionForChat = _p[0], optimisticCreatedActionForIOUReport = _p[1], iouAction = _p[2], optimisticTransactionThread = _p[3], optimisticCreatedActionForTransactionThread = _p[4];
    var reportPreviewAction = shouldCreateNewMoneyRequestReport ? null : getReportPreviewAction(chatReport.reportID, iouReport.reportID);
    if (reportPreviewAction) {
        reportPreviewAction = (0, ReportUtils_1.updateReportPreview)(iouReport, reportPreviewAction, false, comment, optimisticTransaction);
    }
    else {
        reportPreviewAction = (0, ReportUtils_1.buildOptimisticReportPreview)(chatReport, iouReport, comment, optimisticTransaction, undefined, optimisticReportPreviewActionID);
        chatReport.lastVisibleActionCreated = reportPreviewAction.created;
        // Generated ReportPreview action is a parent report action of the iou report.
        // We are setting the iou report's parentReportActionID to display subtitle correctly in IOU page when offline.
        iouReport.parentReportActionID = reportPreviewAction.reportActionID;
    }
    var shouldCreateOptimisticPersonalDetails = isNewChatReport && !allPersonalDetails[payerAccountID];
    // Add optimistic personal details for participant
    var optimisticPersonalDetailListAction = shouldCreateOptimisticPersonalDetails
        ? (_a = {},
            _a[payerAccountID] = {
                accountID: payerAccountID,
                // Disabling this line since participant.displayName can be an empty string
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                displayName: (0, LocalePhoneNumber_1.formatPhoneNumber)(participant.displayName || payerEmail),
                login: participant.login,
                isOptimisticPersonalDetail: true,
            },
            _a) : {};
    var predictedNextStatus = (policy === null || policy === void 0 ? void 0 : policy.reimbursementChoice) === CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO ? CONST_1.default.REPORT.STATUS_NUM.CLOSED : CONST_1.default.REPORT.STATUS_NUM.OPEN;
    var optimisticNextStep = (0, NextStepUtils_1.buildNextStep)(iouReport, predictedNextStatus);
    // STEP 5: Build Onyx Data
    var _q = buildOnyxDataForMoneyRequest({
        participant: participant,
        isNewChatReport: isNewChatReport,
        shouldCreateNewMoneyRequestReport: shouldCreateNewMoneyRequestReport,
        policyParams: {
            policy: policy,
            policyCategories: policyCategories,
            policyTagList: policyTagList,
        },
        optimisticParams: {
            chat: {
                report: chatReport,
                createdAction: optimisticCreatedActionForChat,
                reportPreviewAction: reportPreviewAction,
            },
            iou: {
                report: iouReport,
                createdAction: optimisticCreatedActionForIOUReport,
                action: iouAction,
            },
            transactionParams: {
                transaction: optimisticTransaction,
                transactionThreadReport: optimisticTransactionThread,
                transactionThreadCreatedReportAction: optimisticCreatedActionForTransactionThread,
            },
            policyRecentlyUsed: {
                categories: optimisticPolicyRecentlyUsedCategories,
                tags: optimisticPolicyRecentlyUsedTags,
                currencies: optimisticPolicyRecentlyUsedCurrencies,
            },
            personalDetailListAction: optimisticPersonalDetailListAction,
            nextStep: optimisticNextStep,
            testDriveCommentReportActionID: testDriveCommentReportActionID,
        },
        retryParams: retryParams,
    }), optimisticData = _q[0], successData = _q[1], failureData = _q[2];
    return {
        payerAccountID: payerAccountID,
        payerEmail: payerEmail,
        iouReport: iouReport,
        chatReport: chatReport,
        transaction: optimisticTransaction,
        iouAction: iouAction,
        createdChatReportActionID: isNewChatReport ? optimisticCreatedActionForChat.reportActionID : undefined,
        createdIOUReportActionID: shouldCreateNewMoneyRequestReport ? optimisticCreatedActionForIOUReport.reportActionID : undefined,
        reportPreviewAction: reportPreviewAction,
        transactionThreadReportID: optimisticTransactionThread === null || optimisticTransactionThread === void 0 ? void 0 : optimisticTransactionThread.reportID,
        createdReportActionIDForThread: optimisticCreatedActionForTransactionThread === null || optimisticCreatedActionForTransactionThread === void 0 ? void 0 : optimisticCreatedActionForTransactionThread.reportActionID,
        onyxData: {
            optimisticData: optimisticData,
            successData: successData,
            failureData: failureData,
        },
    };
}
function computePerDiemExpenseAmount(customUnit) {
    var _a;
    var subRates = (_a = customUnit.subRates) !== null && _a !== void 0 ? _a : [];
    return subRates.reduce(function (total, subRate) { return total + subRate.quantity * subRate.rate; }, 0);
}
function computePerDiemExpenseMerchant(customUnit, policy) {
    var _a, _b, _c, _d;
    if (!customUnit.customUnitRateID) {
        return '';
    }
    var policyCustomUnit = (0, PolicyUtils_1.getPerDiemCustomUnit)(policy);
    var rate = (_a = policyCustomUnit === null || policyCustomUnit === void 0 ? void 0 : policyCustomUnit.rates) === null || _a === void 0 ? void 0 : _a[customUnit.customUnitRateID];
    var locationName = (_b = rate === null || rate === void 0 ? void 0 : rate.name) !== null && _b !== void 0 ? _b : '';
    var startDate = (_c = customUnit.attributes) === null || _c === void 0 ? void 0 : _c.dates.start;
    var endDate = (_d = customUnit.attributes) === null || _d === void 0 ? void 0 : _d.dates.end;
    if (!startDate || !endDate) {
        return locationName;
    }
    var formattedTime = DateUtils_1.default.getFormattedDateRangeForPerDiem(new Date(startDate), new Date(endDate));
    return "".concat(locationName, ", ").concat(formattedTime);
}
function computeDefaultPerDiemExpenseComment(customUnit, currency) {
    var _a;
    var subRates = (_a = customUnit.subRates) !== null && _a !== void 0 ? _a : [];
    var subRateComments = subRates.map(function (subRate) {
        var _a, _b, _c;
        var rate = (_a = subRate.rate) !== null && _a !== void 0 ? _a : 0;
        var rateComment = (_b = subRate.name) !== null && _b !== void 0 ? _b : '';
        var quantity = (_c = subRate.quantity) !== null && _c !== void 0 ? _c : 0;
        return "".concat(quantity, "x ").concat(rateComment, " @ ").concat((0, CurrencyUtils_1.convertAmountToDisplayString)(rate, currency));
    });
    return subRateComments.join(', ');
}
/**
 * Gathers all the data needed to submit a per diem expense. It attempts to find existing reports, iouReports, and receipts. If it doesn't find them, then
 * it creates optimistic versions of them and uses those instead
 */
function getPerDiemExpenseInformation(perDiemExpenseInformation) {
    var _a;
    var _b, _c, _d, _e, _f;
    var parentChatReport = perDiemExpenseInformation.parentChatReport, transactionParams = perDiemExpenseInformation.transactionParams, participantParams = perDiemExpenseInformation.participantParams, _g = perDiemExpenseInformation.policyParams, policyParams = _g === void 0 ? {} : _g, _h = perDiemExpenseInformation.moneyRequestReportID, moneyRequestReportID = _h === void 0 ? '' : _h;
    var _j = participantParams.payeeAccountID, payeeAccountID = _j === void 0 ? userAccountID : _j, _k = participantParams.payeeEmail, payeeEmail = _k === void 0 ? currentUserEmail : _k, participant = participantParams.participant;
    var policy = policyParams.policy, policyCategories = policyParams.policyCategories, policyTagList = policyParams.policyTagList;
    var _l = transactionParams.comment, comment = _l === void 0 ? '' : _l, currency = transactionParams.currency, created = transactionParams.created, category = transactionParams.category, tag = transactionParams.tag, customUnit = transactionParams.customUnit, billable = transactionParams.billable, attendees = transactionParams.attendees;
    var amount = computePerDiemExpenseAmount(customUnit);
    var merchant = computePerDiemExpenseMerchant(customUnit, policy);
    var defaultComment = computeDefaultPerDiemExpenseComment(customUnit, currency);
    var finalComment = comment || defaultComment;
    var payerEmail = (0, PhoneNumber_1.addSMSDomainIfPhoneNumber)((_b = participant.login) !== null && _b !== void 0 ? _b : '');
    var payerAccountID = Number(participant.accountID);
    var isPolicyExpenseChat = participant.isPolicyExpenseChat;
    // STEP 1: Get existing chat report OR build a new optimistic one
    var isNewChatReport = false;
    var chatReport = !(0, EmptyObject_1.isEmptyObject)(parentChatReport) && (parentChatReport === null || parentChatReport === void 0 ? void 0 : parentChatReport.reportID) ? parentChatReport : null;
    // If this is a policyExpenseChat, the chatReport must exist and we can get it from Onyx.
    // report is null if the flow is initiated from the global create menu. However, participant always stores the reportID if it exists, which is the case for policyExpenseChats
    if (!chatReport && isPolicyExpenseChat) {
        chatReport = (_c = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(participant.reportID)]) !== null && _c !== void 0 ? _c : null;
    }
    if (!chatReport) {
        chatReport = (_d = (0, ReportUtils_1.getChatByParticipants)([payerAccountID, payeeAccountID])) !== null && _d !== void 0 ? _d : null;
    }
    // If we still don't have a report, it likely doesn't exist and we need to build an optimistic one
    if (!chatReport) {
        isNewChatReport = true;
        chatReport = (0, ReportUtils_1.buildOptimisticChatReport)({
            participantList: [payerAccountID, payeeAccountID],
        });
    }
    // STEP 2: Get the Expense/IOU report. If the moneyRequestReportID has been provided, we want to add the transaction to this specific report.
    // If no such reportID has been provided, let's use the chatReport.iouReportID property. In case that is not present, build a new optimistic Expense/IOU report.
    var iouReport = null;
    if (moneyRequestReportID) {
        iouReport = (_e = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(moneyRequestReportID)]) !== null && _e !== void 0 ? _e : null;
    }
    else {
        iouReport = (_f = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport.iouReportID)]) !== null && _f !== void 0 ? _f : null;
    }
    var shouldCreateNewMoneyRequestReport = (0, ReportUtils_1.shouldCreateNewMoneyRequestReport)(iouReport, chatReport, false);
    if (!iouReport || shouldCreateNewMoneyRequestReport) {
        iouReport = isPolicyExpenseChat
            ? (0, ReportUtils_1.buildOptimisticExpenseReport)(chatReport.reportID, chatReport.policyID, payeeAccountID, amount, currency)
            : (0, ReportUtils_1.buildOptimisticIOUReport)(payeeAccountID, payerAccountID, amount, chatReport.reportID, currency);
    }
    else if (isPolicyExpenseChat) {
        iouReport = __assign({}, iouReport);
        // Because of the Expense reports are stored as negative values, we subtract the total from the amount
        if ((iouReport === null || iouReport === void 0 ? void 0 : iouReport.currency) === currency) {
            if (!Number.isNaN(iouReport.total) && iouReport.total !== undefined) {
                iouReport.total -= amount;
            }
            if (typeof iouReport.unheldTotal === 'number') {
                iouReport.unheldTotal -= amount;
            }
        }
    }
    else {
        iouReport = (0, IOUUtils_1.updateIOUOwnerAndTotal)(iouReport, payeeAccountID, amount, currency);
    }
    // STEP 3: Build an optimistic transaction
    var optimisticTransaction = (0, TransactionUtils_1.buildOptimisticTransaction)({
        policy: policy,
        transactionParams: {
            amount: (0, ReportUtils_1.isExpenseReport)(iouReport) ? -amount : amount,
            currency: currency,
            reportID: iouReport.reportID,
            comment: finalComment,
            created: created,
            category: category,
            merchant: merchant,
            tag: tag,
            customUnit: customUnit,
            billable: billable,
            pendingFields: { subRates: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD },
            attendees: attendees,
        },
    });
    // This is to differentiate between a normal expense and a per diem expense
    optimisticTransaction.iouRequestType = CONST_1.default.IOU.REQUEST_TYPE.PER_DIEM;
    optimisticTransaction.hasEReceipt = true;
    var optimisticPolicyRecentlyUsedCategories = (0, Category_1.buildOptimisticPolicyRecentlyUsedCategories)(iouReport.policyID, category);
    var optimisticPolicyRecentlyUsedTags = (0, Tag_1.buildOptimisticPolicyRecentlyUsedTags)(iouReport.policyID, tag);
    var optimisticPolicyRecentlyUsedCurrencies = (0, Policy_1.buildOptimisticRecentlyUsedCurrencies)(currency);
    var optimisticPolicyRecentlyUsedDestinations = (0, PerDiem_1.buildOptimisticPolicyRecentlyUsedDestinations)(iouReport.policyID, customUnit.customUnitRateID);
    // STEP 4: Build optimistic reportActions. We need:
    // 1. CREATED action for the chatReport
    // 2. CREATED action for the iouReport
    // 3. IOU action for the iouReport
    // 4. The transaction thread, which requires the iouAction, and CREATED action for the transaction thread
    // 5. REPORT_PREVIEW action for the chatReport
    // Note: The CREATED action for the IOU report must be optimistically generated before the IOU action so there's no chance that it appears after the IOU action in the chat
    var _m = (0, ReportUtils_1.buildOptimisticMoneyRequestEntities)({
        iouReport: iouReport,
        type: CONST_1.default.IOU.REPORT_ACTION_TYPE.CREATE,
        amount: amount,
        currency: currency,
        comment: comment,
        payeeEmail: payeeEmail,
        participants: [participant],
        transactionID: optimisticTransaction.transactionID,
    }), optimisticCreatedActionForChat = _m[0], optimisticCreatedActionForIOUReport = _m[1], iouAction = _m[2], optimisticTransactionThread = _m[3], optimisticCreatedActionForTransactionThread = _m[4];
    var reportPreviewAction = shouldCreateNewMoneyRequestReport ? null : getReportPreviewAction(chatReport.reportID, iouReport.reportID);
    if (reportPreviewAction) {
        reportPreviewAction = (0, ReportUtils_1.updateReportPreview)(iouReport, reportPreviewAction, false, comment, optimisticTransaction);
    }
    else {
        reportPreviewAction = (0, ReportUtils_1.buildOptimisticReportPreview)(chatReport, iouReport, comment, optimisticTransaction);
        chatReport.lastVisibleActionCreated = reportPreviewAction.created;
        // Generated ReportPreview action is a parent report action of the iou report.
        // We are setting the iou report's parentReportActionID to display subtitle correctly in IOU page when offline.
        iouReport.parentReportActionID = reportPreviewAction.reportActionID;
    }
    var shouldCreateOptimisticPersonalDetails = isNewChatReport && !allPersonalDetails[payerAccountID];
    // Add optimistic personal details for participant
    var optimisticPersonalDetailListAction = shouldCreateOptimisticPersonalDetails
        ? (_a = {},
            _a[payerAccountID] = {
                accountID: payerAccountID,
                // Disabling this line since participant.displayName can be an empty string
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                displayName: (0, LocalePhoneNumber_1.formatPhoneNumber)(participant.displayName || payerEmail),
                login: participant.login,
                isOptimisticPersonalDetail: true,
            },
            _a) : {};
    var predictedNextStatus = (policy === null || policy === void 0 ? void 0 : policy.reimbursementChoice) === CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO ? CONST_1.default.REPORT.STATUS_NUM.CLOSED : CONST_1.default.REPORT.STATUS_NUM.OPEN;
    var optimisticNextStep = (0, NextStepUtils_1.buildNextStep)(iouReport, predictedNextStatus);
    // STEP 5: Build Onyx Data
    var _o = buildOnyxDataForMoneyRequest({
        isNewChatReport: isNewChatReport,
        shouldCreateNewMoneyRequestReport: shouldCreateNewMoneyRequestReport,
        policyParams: {
            policy: policy,
            policyCategories: policyCategories,
            policyTagList: policyTagList,
        },
        optimisticParams: {
            chat: {
                report: chatReport,
                createdAction: optimisticCreatedActionForChat,
                reportPreviewAction: reportPreviewAction,
            },
            iou: {
                report: iouReport,
                createdAction: optimisticCreatedActionForIOUReport,
                action: iouAction,
            },
            transactionParams: {
                transaction: optimisticTransaction,
                transactionThreadReport: optimisticTransactionThread,
                transactionThreadCreatedReportAction: optimisticCreatedActionForTransactionThread,
            },
            policyRecentlyUsed: {
                categories: optimisticPolicyRecentlyUsedCategories,
                tags: optimisticPolicyRecentlyUsedTags,
                currencies: optimisticPolicyRecentlyUsedCurrencies,
                destinations: optimisticPolicyRecentlyUsedDestinations,
            },
            personalDetailListAction: optimisticPersonalDetailListAction,
            nextStep: optimisticNextStep,
        },
    }), optimisticData = _o[0], successData = _o[1], failureData = _o[2];
    return {
        payerAccountID: payerAccountID,
        payerEmail: payerEmail,
        iouReport: iouReport,
        chatReport: chatReport,
        transaction: optimisticTransaction,
        iouAction: iouAction,
        createdChatReportActionID: isNewChatReport ? optimisticCreatedActionForChat.reportActionID : undefined,
        createdIOUReportActionID: shouldCreateNewMoneyRequestReport ? optimisticCreatedActionForIOUReport.reportActionID : undefined,
        reportPreviewAction: reportPreviewAction,
        transactionThreadReportID: optimisticTransactionThread === null || optimisticTransactionThread === void 0 ? void 0 : optimisticTransactionThread.reportID,
        createdReportActionIDForThread: optimisticCreatedActionForTransactionThread === null || optimisticCreatedActionForTransactionThread === void 0 ? void 0 : optimisticCreatedActionForTransactionThread.reportActionID,
        onyxData: {
            optimisticData: optimisticData,
            successData: successData,
            failureData: failureData,
        },
        billable: billable,
    };
}
/**
 * Gathers all the data needed to make an expense. It attempts to find existing reports, iouReports, and receipts. If it doesn't find them, then
 * it creates optimistic versions of them and uses those instead
 */
function getTrackExpenseInformation(params) {
    var _a, _b, _c, _d;
    var parentChatReport = params.parentChatReport, _e = params.moneyRequestReportID, moneyRequestReportID = _e === void 0 ? '' : _e, existingTransactionID = params.existingTransactionID, participantParams = params.participantParams, policyParams = params.policyParams, transactionParams = params.transactionParams, retryParams = params.retryParams;
    var _f = participantParams.payeeAccountID, payeeAccountID = _f === void 0 ? userAccountID : _f, _g = participantParams.payeeEmail, payeeEmail = _g === void 0 ? currentUserEmail : _g, participant = participantParams.participant;
    var policy = policyParams.policy, policyCategories = policyParams.policyCategories, policyTagList = policyParams.policyTagList;
    var comment = transactionParams.comment, amount = transactionParams.amount, currency = transactionParams.currency, created = transactionParams.created, merchant = transactionParams.merchant, receipt = transactionParams.receipt, category = transactionParams.category, tag = transactionParams.tag, taxCode = transactionParams.taxCode, taxAmount = transactionParams.taxAmount, billable = transactionParams.billable, linkedTrackedExpenseReportAction = transactionParams.linkedTrackedExpenseReportAction, attendees = transactionParams.attendees;
    var optimisticData = [];
    var successData = [];
    var failureData = [];
    var isPolicyExpenseChat = participant.isPolicyExpenseChat;
    // STEP 1: Get existing chat report
    var chatReport = !(0, EmptyObject_1.isEmptyObject)(parentChatReport) && (parentChatReport === null || parentChatReport === void 0 ? void 0 : parentChatReport.reportID) ? parentChatReport : null;
    // The chatReport always exists, and we can get it from Onyx if chatReport is null.
    if (!chatReport) {
        chatReport = (_a = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(participant.reportID)]) !== null && _a !== void 0 ? _a : null;
    }
    // If we still don't have a report, it likely doesn't exist, and we will early return here as it should not happen
    // Maybe later, we can build an optimistic selfDM chat.
    if (!chatReport) {
        return null;
    }
    // Check if the report is a draft
    var isDraftReportLocal = (0, ReportUtils_1.isDraftReport)(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID);
    var createdWorkspaceParams;
    if (isDraftReportLocal) {
        var workspaceData = (0, Policy_1.buildPolicyData)(undefined, policy === null || policy === void 0 ? void 0 : policy.makeMeAdmin, policy === null || policy === void 0 ? void 0 : policy.name, policy === null || policy === void 0 ? void 0 : policy.id, chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID, CONST_1.default.ONBOARDING_CHOICES.TRACK_WORKSPACE);
        createdWorkspaceParams = workspaceData.params;
        optimisticData.push.apply(optimisticData, workspaceData.optimisticData);
        successData.push.apply(successData, workspaceData.successData);
        failureData.push.apply(failureData, workspaceData.failureData);
    }
    // STEP 2: If not in the self-DM flow, we need to use the expense report.
    // For this, first use the chatReport.iouReportID property. Build a new optimistic expense report if needed.
    var shouldUseMoneyReport = !!isPolicyExpenseChat;
    var iouReport = null;
    var shouldCreateNewMoneyRequestReport = false;
    if (shouldUseMoneyReport) {
        if (moneyRequestReportID) {
            iouReport = (_b = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(moneyRequestReportID)]) !== null && _b !== void 0 ? _b : null;
        }
        else {
            iouReport = (_c = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport.iouReportID)]) !== null && _c !== void 0 ? _c : null;
        }
        var isScanRequest = (0, TransactionUtils_1.isScanRequest)({ amount: amount, receipt: receipt });
        shouldCreateNewMoneyRequestReport = (0, ReportUtils_1.shouldCreateNewMoneyRequestReport)(iouReport, chatReport, isScanRequest);
        if (!iouReport || shouldCreateNewMoneyRequestReport) {
            iouReport = (0, ReportUtils_1.buildOptimisticExpenseReport)(chatReport.reportID, chatReport.policyID, payeeAccountID, amount, currency, amount);
        }
        else {
            iouReport = __assign({}, iouReport);
            // Because of the Expense reports are stored as negative values, we subtract the total from the amount
            if ((iouReport === null || iouReport === void 0 ? void 0 : iouReport.currency) === currency) {
                if (!Number.isNaN(iouReport.total) && iouReport.total !== undefined && typeof iouReport.nonReimbursableTotal === 'number') {
                    iouReport.total -= amount;
                    iouReport.nonReimbursableTotal -= amount;
                }
                if (typeof iouReport.unheldTotal === 'number' && typeof iouReport.unheldNonReimbursableTotal === 'number') {
                    iouReport.unheldTotal -= amount;
                    iouReport.unheldNonReimbursableTotal -= amount;
                }
            }
        }
    }
    // If shouldUseMoneyReport is true, the iouReport was defined.
    // But we'll use the `shouldUseMoneyReport && iouReport` check further instead of `shouldUseMoneyReport` to avoid TS errors.
    // STEP 3: Build optimistic receipt and transaction
    var receiptObject = {};
    var filename;
    if (receipt === null || receipt === void 0 ? void 0 : receipt.source) {
        receiptObject.source = receipt.source;
        receiptObject.state = (_d = receipt.state) !== null && _d !== void 0 ? _d : CONST_1.default.IOU.RECEIPT_STATE.SCAN_READY;
        filename = receipt.name;
    }
    var existingTransaction = allTransactionDrafts["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(existingTransactionID !== null && existingTransactionID !== void 0 ? existingTransactionID : CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID)];
    if (!filename) {
        filename = existingTransaction === null || existingTransaction === void 0 ? void 0 : existingTransaction.filename;
    }
    var isDistanceRequest = existingTransaction && (0, TransactionUtils_1.isDistanceRequest)(existingTransaction);
    var optimisticTransaction = (0, TransactionUtils_1.buildOptimisticTransaction)({
        existingTransactionID: existingTransactionID,
        existingTransaction: existingTransaction,
        policy: policy,
        transactionParams: {
            amount: -amount,
            currency: currency,
            reportID: shouldUseMoneyReport && iouReport ? iouReport.reportID : CONST_1.default.REPORT.UNREPORTED_REPORT_ID,
            comment: comment,
            created: created,
            merchant: merchant,
            receipt: receiptObject,
            category: category,
            tag: tag,
            taxCode: taxCode,
            taxAmount: taxAmount,
            billable: billable,
            pendingFields: isDistanceRequest ? { waypoints: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD } : undefined,
            reimbursable: false,
            filename: filename,
            attendees: attendees,
        },
    });
    // If there is an existing transaction (which is the case for distance requests), then the data from the existing transaction
    // needs to be manually merged into the optimistic transaction. This is because buildOnyxDataForMoneyRequest() uses `Onyx.set()` for the transaction
    // data. This is a big can of worms to change it to `Onyx.merge()` as explored in https://expensify.slack.com/archives/C05DWUDHVK7/p1692139468252109.
    // I want to clean this up at some point, but it's possible this will live in the code for a while so I've created https://github.com/Expensify/App/issues/25417
    // to remind me to do this.
    if (isDistanceRequest) {
        optimisticTransaction = (0, expensify_common_1.fastMerge)(existingTransaction, optimisticTransaction, false);
    }
    // STEP 4: Build optimistic reportActions. We need:
    // 1. CREATED action for the iouReport (if tracking in the Expense chat)
    // 2. IOU action for the iouReport (if tracking in the Expense chat), otherwise – for chatReport
    // 3. The transaction thread, which requires the iouAction, and CREATED action for the transaction thread
    // 4. REPORT_PREVIEW action for the chatReport (if tracking in the Expense chat)
    var _h = (0, ReportUtils_1.buildOptimisticMoneyRequestEntities)({
        iouReport: shouldUseMoneyReport && iouReport ? iouReport : chatReport,
        type: CONST_1.default.IOU.REPORT_ACTION_TYPE.TRACK,
        amount: amount,
        currency: currency,
        comment: comment,
        payeeEmail: payeeEmail,
        participants: [participant],
        transactionID: optimisticTransaction.transactionID,
        isPersonalTrackingExpense: !shouldUseMoneyReport,
        existingTransactionThreadReportID: linkedTrackedExpenseReportAction === null || linkedTrackedExpenseReportAction === void 0 ? void 0 : linkedTrackedExpenseReportAction.childReportID,
        linkedTrackedExpenseReportAction: linkedTrackedExpenseReportAction,
    }), optimisticCreatedActionForIOUReport = _h[1], iouAction = _h[2], optimisticTransactionThread = _h[3], optimisticCreatedActionForTransactionThread = _h[4];
    var reportPreviewAction = null;
    if (shouldUseMoneyReport && iouReport) {
        reportPreviewAction = shouldCreateNewMoneyRequestReport ? null : getReportPreviewAction(chatReport.reportID, iouReport.reportID);
        if (reportPreviewAction) {
            reportPreviewAction = (0, ReportUtils_1.updateReportPreview)(iouReport, reportPreviewAction, false, comment, optimisticTransaction);
        }
        else {
            reportPreviewAction = (0, ReportUtils_1.buildOptimisticReportPreview)(chatReport, iouReport, comment, optimisticTransaction);
            // Generated ReportPreview action is a parent report action of the iou report.
            // We are setting the iou report's parentReportActionID to display subtitle correctly in IOU page when offline.
            iouReport.parentReportActionID = reportPreviewAction.reportActionID;
        }
    }
    var actionableTrackExpenseWhisper = null;
    if (!isPolicyExpenseChat) {
        actionableTrackExpenseWhisper = (0, ReportUtils_1.buildOptimisticActionableTrackExpenseWhisper)(iouAction, optimisticTransaction.transactionID);
    }
    // STEP 5: Build Onyx Data
    var trackExpenseOnyxData = buildOnyxDataForTrackExpense({
        participant: participant,
        chat: { report: chatReport, previewAction: reportPreviewAction },
        iou: { report: iouReport, action: iouAction, createdAction: optimisticCreatedActionForIOUReport },
        transactionParams: {
            transaction: optimisticTransaction,
            threadCreatedReportAction: optimisticCreatedActionForTransactionThread,
            threadReport: optimisticTransactionThread !== null && optimisticTransactionThread !== void 0 ? optimisticTransactionThread : {},
        },
        policyParams: { policy: policy, tagList: policyTagList, categories: policyCategories },
        shouldCreateNewMoneyRequestReport: shouldCreateNewMoneyRequestReport,
        actionableTrackExpenseWhisper: actionableTrackExpenseWhisper,
        retryParams: retryParams,
    });
    return {
        createdWorkspaceParams: createdWorkspaceParams,
        chatReport: chatReport,
        iouReport: iouReport !== null && iouReport !== void 0 ? iouReport : undefined,
        transaction: optimisticTransaction,
        iouAction: iouAction,
        createdIOUReportActionID: shouldCreateNewMoneyRequestReport ? optimisticCreatedActionForIOUReport.reportActionID : undefined,
        reportPreviewAction: reportPreviewAction !== null && reportPreviewAction !== void 0 ? reportPreviewAction : undefined,
        transactionThreadReportID: optimisticTransactionThread.reportID,
        createdReportActionIDForThread: optimisticCreatedActionForTransactionThread === null || optimisticCreatedActionForTransactionThread === void 0 ? void 0 : optimisticCreatedActionForTransactionThread.reportActionID,
        actionableWhisperReportActionIDParam: actionableTrackExpenseWhisper === null || actionableTrackExpenseWhisper === void 0 ? void 0 : actionableTrackExpenseWhisper.reportActionID,
        onyxData: {
            optimisticData: optimisticData.concat(trackExpenseOnyxData[0]),
            successData: successData.concat(trackExpenseOnyxData[1]),
            failureData: failureData.concat(trackExpenseOnyxData[2]),
        },
    };
}
/**
 * Compute the diff amount when we update the transaction
 */
function calculateDiffAmount(iouReport, updatedTransaction, transaction) {
    if (!iouReport) {
        return 0;
    }
    var isExpenseReportLocal = (0, ReportUtils_1.isExpenseReport)(iouReport);
    var updatedCurrency = (0, TransactionUtils_1.getCurrency)(updatedTransaction);
    var currentCurrency = (0, TransactionUtils_1.getCurrency)(transaction);
    var currentAmount = (0, TransactionUtils_1.getAmount)(transaction, isExpenseReportLocal);
    var updatedAmount = (0, TransactionUtils_1.getAmount)(updatedTransaction, isExpenseReportLocal);
    if (updatedCurrency === currentCurrency && currentAmount === updatedAmount) {
        return 0;
    }
    if (updatedCurrency === iouReport.currency && currentCurrency === iouReport.currency) {
        // Calculate the diff between the updated amount and the current amount if the currency of the updated and current transactions have the same currency as the report
        return updatedAmount - currentAmount;
    }
    return null;
}
/**
 * @param transactionID
 * @param transactionThreadReportID
 * @param transactionChanges
 * @param [transactionChanges.created] Present when updated the date field
 * @param policy  May be undefined, an empty object, or an object matching the Policy type (src/types/onyx/Policy.ts)
 * @param policyTagList
 * @param policyCategories
 */
function getUpdateMoneyRequestParams(transactionID, transactionThreadReportID, transactionChanges, policy, policyTagList, policyCategories, violations, hash, allowNegative) {
    var _a, _b, _c, _d, _e, _f, _g;
    var _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    var optimisticData = [];
    var successData = [];
    var failureData = [];
    // Step 1: Set any "pending fields" (ones updated while the user was offline) to have error messages in the failureData
    var pendingFields = Object.fromEntries(Object.keys(transactionChanges).map(function (key) { return [key, CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE]; }));
    var clearedPendingFields = Object.fromEntries(Object.keys(transactionChanges).map(function (key) { return [key, null]; }));
    var errorFields = Object.fromEntries(Object.keys(pendingFields).map(function (key) {
        var _a;
        return [key, (_a = {}, _a[DateUtils_1.default.getMicroseconds()] = Localize.translateLocal('iou.error.genericEditFailureMessage'), _a)];
    }));
    // Step 2: Get all the collections being updated
    var transactionThread = (_h = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadReportID)]) !== null && _h !== void 0 ? _h : null;
    var transaction = allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID)];
    var isTransactionOnHold = (0, TransactionUtils_1.isOnHold)(transaction);
    var iouReport = (_j = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThread === null || transactionThread === void 0 ? void 0 : transactionThread.parentReportID)]) !== null && _j !== void 0 ? _j : null;
    var isFromExpenseReport = (0, ReportUtils_1.isExpenseReport)(iouReport);
    var updatedTransaction = transaction
        ? (0, TransactionUtils_1.getUpdatedTransaction)({
            transaction: transaction,
            transactionChanges: transactionChanges,
            isFromExpenseReport: isFromExpenseReport,
            policy: policy,
        })
        : undefined;
    var transactionDetails = (0, ReportUtils_1.getTransactionDetails)(updatedTransaction, undefined, undefined, allowNegative);
    if (transactionDetails === null || transactionDetails === void 0 ? void 0 : transactionDetails.waypoints) {
        // This needs to be a JSON string since we're sending this to the MapBox API
        transactionDetails.waypoints = JSON.stringify(transactionDetails.waypoints);
    }
    var dataToIncludeInParams = Object.fromEntries(Object.entries(transactionDetails !== null && transactionDetails !== void 0 ? transactionDetails : {}).filter(function (_a) {
        var key = _a[0];
        return Object.keys(transactionChanges).includes(key);
    }));
    var params = __assign(__assign({}, dataToIncludeInParams), { reportID: iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID, transactionID: transactionID });
    var hasPendingWaypoints = 'waypoints' in transactionChanges;
    var hasModifiedDistanceRate = 'customUnitRateID' in transactionChanges;
    var hasModifiedCreated = 'created' in transactionChanges;
    var hasModifiedAmount = 'amount' in transactionChanges;
    if (transaction && updatedTransaction && (hasPendingWaypoints || hasModifiedDistanceRate)) {
        // Delete the draft transaction when editing waypoints when the server responds successfully and there are no errors
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transactionID),
            value: null,
        });
        // Revert the transaction's amount to the original value on failure.
        // The IOU Report will be fully reverted in the failureData further below.
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
            value: {
                amount: transaction.amount,
                modifiedAmount: transaction.modifiedAmount,
                modifiedMerchant: transaction.modifiedMerchant,
                modifiedCurrency: transaction.modifiedCurrency,
            },
        });
    }
    // Step 3: Build the modified expense report actions
    // We don't create a modified report action if:
    // - we're updating the waypoints
    // - we're updating the distance rate while the waypoints are still pending
    // In these cases, there isn't a valid optimistic mileage data we can use,
    // and the report action is created on the server with the distance-related response from the MapBox API
    var updatedReportAction = (0, ReportUtils_1.buildOptimisticModifiedExpenseReportAction)(transactionThread, transaction, transactionChanges, isFromExpenseReport, policy, updatedTransaction, allowNegative);
    if (!hasPendingWaypoints && !(hasModifiedDistanceRate && (0, TransactionUtils_1.isFetchingWaypointsFromServer)(transaction))) {
        params.reportActionID = updatedReportAction.reportActionID;
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionThread === null || transactionThread === void 0 ? void 0 : transactionThread.reportID),
            value: (_a = {},
                _a[updatedReportAction.reportActionID] = updatedReportAction,
                _a),
        });
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThread === null || transactionThread === void 0 ? void 0 : transactionThread.reportID),
            value: {
                lastVisibleActionCreated: updatedReportAction.created,
                lastReadTime: updatedReportAction.created,
            },
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThread === null || transactionThread === void 0 ? void 0 : transactionThread.reportID),
            value: {
                lastVisibleActionCreated: transactionThread === null || transactionThread === void 0 ? void 0 : transactionThread.lastVisibleActionCreated,
                lastReadTime: transactionThread === null || transactionThread === void 0 ? void 0 : transactionThread.lastReadTime,
            },
        });
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionThread === null || transactionThread === void 0 ? void 0 : transactionThread.reportID),
            value: (_b = {},
                _b[updatedReportAction.reportActionID] = { pendingAction: null },
                _b),
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionThread === null || transactionThread === void 0 ? void 0 : transactionThread.reportID),
            value: (_c = {},
                _c[updatedReportAction.reportActionID] = __assign(__assign({}, updatedReportAction), { errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.genericEditFailureMessage') }),
                _c),
        });
    }
    // Step 4: Compute the IOU total and update the report preview message (and report header) so LHN amount owed is correct.
    var calculatedDiffAmount = calculateDiffAmount(iouReport, updatedTransaction, transaction);
    // If calculatedDiffAmount is null it means we cannot calculate the new iou report total from front-end due to currency differences.
    var isTotalIndeterminate = calculatedDiffAmount === null;
    var diff = calculatedDiffAmount !== null && calculatedDiffAmount !== void 0 ? calculatedDiffAmount : 0;
    var updatedMoneyRequestReport;
    if (!iouReport) {
        updatedMoneyRequestReport = null;
    }
    else if (((0, ReportUtils_1.isExpenseReport)(iouReport) || (0, ReportUtils_1.isInvoiceReport)(iouReport)) && !Number.isNaN(iouReport.total) && iouReport.total !== undefined) {
        // For expense report, the amount is negative, so we should subtract total from diff
        updatedMoneyRequestReport = __assign(__assign({}, iouReport), { total: iouReport.total - diff });
        if (!(transaction === null || transaction === void 0 ? void 0 : transaction.reimbursable) && typeof updatedMoneyRequestReport.nonReimbursableTotal === 'number') {
            updatedMoneyRequestReport.nonReimbursableTotal -= diff;
        }
        if (!isTransactionOnHold) {
            if (typeof updatedMoneyRequestReport.unheldTotal === 'number') {
                updatedMoneyRequestReport.unheldTotal -= diff;
            }
            if (!(transaction === null || transaction === void 0 ? void 0 : transaction.reimbursable) && typeof updatedMoneyRequestReport.unheldNonReimbursableTotal === 'number') {
                updatedMoneyRequestReport.unheldNonReimbursableTotal -= diff;
            }
        }
    }
    else {
        updatedMoneyRequestReport = (0, IOUUtils_1.updateIOUOwnerAndTotal)(iouReport, (_k = updatedReportAction.actorAccountID) !== null && _k !== void 0 ? _k : CONST_1.default.DEFAULT_NUMBER_ID, diff, (0, TransactionUtils_1.getCurrency)(transaction), false, true, isTransactionOnHold);
    }
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID),
        value: __assign(__assign({}, updatedMoneyRequestReport), (isTotalIndeterminate && { pendingFields: { total: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE } })),
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.parentReportID),
        value: (0, ReportUtils_1.getOutstandingChildRequest)(updatedMoneyRequestReport),
    });
    if ((0, ReportUtils_1.isOneTransactionThread)(transactionThread !== null && transactionThread !== void 0 ? transactionThread : undefined, iouReport !== null && iouReport !== void 0 ? iouReport : undefined, undefined)) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID),
            value: {
                lastReadTime: updatedReportAction.created,
            },
        });
    }
    successData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID),
        value: __assign({ pendingAction: null }, (isTotalIndeterminate && { pendingFields: { total: null } })),
    });
    // Optimistically modify the transaction and the transaction thread
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
        value: __assign(__assign({}, updatedTransaction), { pendingFields: pendingFields, errorFields: null }),
    });
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadReportID),
        value: {
            lastActorAccountID: updatedReportAction.actorAccountID,
        },
    });
    if ((0, TransactionUtils_1.isScanning)(transaction) && ('amount' in transactionChanges || 'currency' in transactionChanges)) {
        if (transactionThread === null || transactionThread === void 0 ? void 0 : transactionThread.parentReportActionID) {
            optimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID),
                value: (_d = {},
                    _d[transactionThread === null || transactionThread === void 0 ? void 0 : transactionThread.parentReportActionID] = {
                        originalMessage: {
                            whisperedTo: [],
                        },
                    },
                    _d),
            });
        }
        if (iouReport === null || iouReport === void 0 ? void 0 : iouReport.parentReportActionID) {
            optimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.parentReportID),
                value: (_e = {},
                    _e[iouReport.parentReportActionID] = {
                        originalMessage: {
                            whisperedTo: [],
                        },
                    },
                    _e),
            });
        }
    }
    // Update recently used categories if the category is changed
    var hasModifiedCategory = 'category' in transactionChanges;
    if (hasModifiedCategory) {
        var optimisticPolicyRecentlyUsedCategories = (0, Category_1.buildOptimisticPolicyRecentlyUsedCategories)(iouReport === null || iouReport === void 0 ? void 0 : iouReport.policyID, transactionChanges.category);
        if (optimisticPolicyRecentlyUsedCategories.length) {
            optimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.SET,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.policyID),
                value: optimisticPolicyRecentlyUsedCategories,
            });
        }
    }
    // Update recently used currencies if the currency is changed
    if ('currency' in transactionChanges) {
        var optimisticRecentlyUsedCurrencies = (0, Policy_1.buildOptimisticRecentlyUsedCurrencies)(transactionChanges.currency);
        if (optimisticRecentlyUsedCurrencies.length) {
            optimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.SET,
                key: ONYXKEYS_1.default.RECENTLY_USED_CURRENCIES,
                value: optimisticRecentlyUsedCurrencies,
            });
        }
    }
    // Update recently used categories if the tag is changed
    var hasModifiedTag = 'tag' in transactionChanges;
    if (hasModifiedTag) {
        var optimisticPolicyRecentlyUsedTags = (0, Tag_1.buildOptimisticPolicyRecentlyUsedTags)(iouReport === null || iouReport === void 0 ? void 0 : iouReport.policyID, transactionChanges.tag);
        if (!(0, EmptyObject_1.isEmptyObject)(optimisticPolicyRecentlyUsedTags)) {
            optimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_RECENTLY_USED_TAGS).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.policyID),
                value: optimisticPolicyRecentlyUsedTags,
            });
        }
    }
    var overLimitViolation = violations === null || violations === void 0 ? void 0 : violations.find(function (violation) { return violation.name === 'overLimit'; });
    // Update violation limit, if we modify attendees. The given limit value is for a single attendee, if we have multiple attendees we should multiply limit by attendee count
    if ('attendees' in transactionChanges && !!overLimitViolation) {
        var limitForSingleAttendee = ViolationsUtils_1.default.getViolationAmountLimit(overLimitViolation);
        if (limitForSingleAttendee * ((_m = (_l = transactionChanges === null || transactionChanges === void 0 ? void 0 : transactionChanges.attendees) === null || _l === void 0 ? void 0 : _l.length) !== null && _m !== void 0 ? _m : 1) > Math.abs((0, TransactionUtils_1.getAmount)(transaction))) {
            optimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID),
                value: (_o = violations === null || violations === void 0 ? void 0 : violations.filter(function (violation) { return violation.name !== 'overLimit'; })) !== null && _o !== void 0 ? _o : [],
            });
        }
    }
    if (Array.isArray(params === null || params === void 0 ? void 0 : params.attendees)) {
        params.attendees = JSON.stringify(params === null || params === void 0 ? void 0 : params.attendees);
    }
    // Clear out the error fields and loading states on success
    successData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
        value: {
            pendingFields: clearedPendingFields,
            isLoading: false,
            errorFields: null,
            routes: null,
        },
    });
    // Clear out loading states, pending fields, and add the error fields
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
        value: __assign(__assign({}, transaction), { pendingFields: clearedPendingFields, isLoading: false, errorFields: errorFields }),
    });
    if (iouReport) {
        // Reset the iouReport to its original state
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iouReport.reportID),
            value: __assign(__assign({}, iouReport), (isTotalIndeterminate && { pendingFields: { total: null } })),
        });
    }
    var hasModifiedComment = 'comment' in transactionChanges;
    if (policy &&
        (0, PolicyUtils_1.isPaidGroupPolicy)(policy) &&
        updatedTransaction &&
        (hasModifiedTag || hasModifiedCategory || hasModifiedComment || hasModifiedDistanceRate || hasModifiedAmount || hasModifiedCreated)) {
        var currentTransactionViolations = (_p = allTransactionViolations["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID)]) !== null && _p !== void 0 ? _p : [];
        var violationsOnyxData = ViolationsUtils_1.default.getViolationsOnyxData(updatedTransaction, currentTransactionViolations, policy, policyTagList !== null && policyTagList !== void 0 ? policyTagList : {}, policyCategories !== null && policyCategories !== void 0 ? policyCategories : {}, (0, PolicyUtils_1.hasDependentTags)(policy, policyTagList !== null && policyTagList !== void 0 ? policyTagList : {}), (0, ReportUtils_1.isInvoiceReport)(iouReport));
        optimisticData.push(violationsOnyxData);
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID),
            value: currentTransactionViolations,
        });
        if (hash) {
            optimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.SNAPSHOT).concat(hash),
                value: {
                    data: (_f = {},
                        _f["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID)] = violationsOnyxData.value,
                        _f),
                },
            });
            failureData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.SNAPSHOT).concat(hash),
                value: {
                    data: (_g = {},
                        _g["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID)] = currentTransactionViolations,
                        _g),
                },
            });
        }
        if (violationsOnyxData && ((_q = iouReport === null || iouReport === void 0 ? void 0 : iouReport.statusNum) !== null && _q !== void 0 ? _q : CONST_1.default.REPORT.STATUS_NUM.OPEN) === CONST_1.default.REPORT.STATUS_NUM.OPEN) {
            var currentNextStep = (_r = allNextSteps["".concat(ONYXKEYS_1.default.COLLECTION.NEXT_STEP).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID)]) !== null && _r !== void 0 ? _r : {};
            var shouldFixViolations = Array.isArray(violationsOnyxData.value) && violationsOnyxData.value.length > 0;
            optimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.NEXT_STEP).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID),
                value: (0, NextStepUtils_1.buildNextStep)(iouReport !== null && iouReport !== void 0 ? iouReport : undefined, (_s = iouReport === null || iouReport === void 0 ? void 0 : iouReport.statusNum) !== null && _s !== void 0 ? _s : CONST_1.default.REPORT.STATUS_NUM.OPEN, shouldFixViolations),
            });
            failureData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.NEXT_STEP).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID),
                value: currentNextStep,
            });
        }
    }
    // Reset the transaction thread to its original state
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadReportID),
        value: transactionThread,
    });
    return {
        params: params,
        onyxData: { optimisticData: optimisticData, successData: successData, failureData: failureData },
    };
}
/**
 * @param transactionID
 * @param transactionThreadReportID
 * @param transactionChanges
 * @param [transactionChanges.created] Present when updated the date field
 * @param policy  May be undefined, an empty object, or an object matching the Policy type (src/types/onyx/Policy.ts)
 */
function getUpdateTrackExpenseParams(transactionID, transactionThreadReportID, transactionChanges, policy) {
    var _a, _b, _c, _d;
    var _e, _f;
    var optimisticData = [];
    var successData = [];
    var failureData = [];
    // Step 1: Set any "pending fields" (ones updated while the user was offline) to have error messages in the failureData
    var pendingFields = Object.fromEntries(Object.keys(transactionChanges).map(function (key) { return [key, CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE]; }));
    var clearedPendingFields = Object.fromEntries(Object.keys(transactionChanges).map(function (key) { return [key, null]; }));
    var errorFields = Object.fromEntries(Object.keys(pendingFields).map(function (key) {
        var _a;
        return [key, (_a = {}, _a[DateUtils_1.default.getMicroseconds()] = Localize.translateLocal('iou.error.genericEditFailureMessage'), _a)];
    }));
    // Step 2: Get all the collections being updated
    var transactionThread = (_e = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadReportID)]) !== null && _e !== void 0 ? _e : null;
    var transaction = allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID)];
    var chatReport = (_f = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThread === null || transactionThread === void 0 ? void 0 : transactionThread.parentReportID)]) !== null && _f !== void 0 ? _f : null;
    var updatedTransaction = transaction
        ? (0, TransactionUtils_1.getUpdatedTransaction)({
            transaction: transaction,
            transactionChanges: transactionChanges,
            isFromExpenseReport: false,
            policy: policy,
        })
        : null;
    var transactionDetails = (0, ReportUtils_1.getTransactionDetails)(updatedTransaction);
    if (transactionDetails === null || transactionDetails === void 0 ? void 0 : transactionDetails.waypoints) {
        // This needs to be a JSON string since we're sending this to the MapBox API
        transactionDetails.waypoints = JSON.stringify(transactionDetails.waypoints);
    }
    var dataToIncludeInParams = Object.fromEntries(Object.entries(transactionDetails !== null && transactionDetails !== void 0 ? transactionDetails : {}).filter(function (_a) {
        var key = _a[0];
        return Object.keys(transactionChanges).includes(key);
    }));
    var params = __assign(__assign({}, dataToIncludeInParams), { reportID: chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID, transactionID: transactionID });
    var hasPendingWaypoints = 'waypoints' in transactionChanges;
    var hasModifiedDistanceRate = 'customUnitRateID' in transactionChanges;
    if (transaction && updatedTransaction && (hasPendingWaypoints || hasModifiedDistanceRate)) {
        // Delete the draft transaction when editing waypoints when the server responds successfully and there are no errors
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transactionID),
            value: null,
        });
        // Revert the transaction's amount to the original value on failure.
        // The IOU Report will be fully reverted in the failureData further below.
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
            value: {
                amount: transaction.amount,
                modifiedAmount: transaction.modifiedAmount,
                modifiedMerchant: transaction.modifiedMerchant,
            },
        });
    }
    // Step 3: Build the modified expense report actions
    // We don't create a modified report action if:
    // - we're updating the waypoints
    // - we're updating the distance rate while the waypoints are still pending
    // In these cases, there isn't a valid optimistic mileage data we can use,
    // and the report action is created on the server with the distance-related response from the MapBox API
    var updatedReportAction = (0, ReportUtils_1.buildOptimisticModifiedExpenseReportAction)(transactionThread, transaction, transactionChanges, false, policy, updatedTransaction);
    if (!hasPendingWaypoints && !(hasModifiedDistanceRate && (0, TransactionUtils_1.isFetchingWaypointsFromServer)(transaction))) {
        params.reportActionID = updatedReportAction.reportActionID;
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionThread === null || transactionThread === void 0 ? void 0 : transactionThread.reportID),
            value: (_a = {},
                _a[updatedReportAction.reportActionID] = updatedReportAction,
                _a),
        });
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionThread === null || transactionThread === void 0 ? void 0 : transactionThread.reportID),
            value: (_b = {},
                _b[updatedReportAction.reportActionID] = { pendingAction: null },
                _b),
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionThread === null || transactionThread === void 0 ? void 0 : transactionThread.reportID),
            value: (_c = {},
                _c[updatedReportAction.reportActionID] = __assign(__assign({}, updatedReportAction), { errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.genericEditFailureMessage') }),
                _c),
        });
    }
    // Step 4: Update the report preview message (and report header) so LHN amount tracked is correct.
    // Optimistically modify the transaction and the transaction thread
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
        value: __assign(__assign({}, updatedTransaction), { pendingFields: pendingFields, errorFields: null }),
    });
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadReportID),
        value: {
            lastActorAccountID: updatedReportAction.actorAccountID,
        },
    });
    if ((0, TransactionUtils_1.isScanning)(transaction) && (transactionThread === null || transactionThread === void 0 ? void 0 : transactionThread.parentReportActionID) && ('amount' in transactionChanges || 'currency' in transactionChanges)) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID),
            value: (_d = {}, _d[transactionThread.parentReportActionID] = { originalMessage: { whisperedTo: [] } }, _d),
        });
    }
    // Clear out the error fields and loading states on success
    successData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
        value: {
            pendingFields: clearedPendingFields,
            isLoading: false,
            errorFields: null,
            routes: null,
        },
    });
    // Clear out loading states, pending fields, and add the error fields
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
        value: __assign(__assign({}, transaction), { pendingFields: clearedPendingFields, isLoading: false, errorFields: errorFields }),
    });
    // Reset the transaction thread to its original state
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadReportID),
        value: transactionThread,
    });
    return {
        params: params,
        onyxData: { optimisticData: optimisticData, successData: successData, failureData: failureData },
    };
}
/** Updates the created date of an expense */
function updateMoneyRequestDate(transactionID, transactionThreadReportID, value, policy, policyTags, policyCategories) {
    var _a, _b;
    var transactionChanges = {
        created: value,
    };
    var transactionThreadReport = (_a = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadReportID)]) !== null && _a !== void 0 ? _a : null;
    var parentReport = (_b = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.parentReportID)]) !== null && _b !== void 0 ? _b : null;
    var data;
    if ((0, ReportUtils_1.isTrackExpenseReport)(transactionThreadReport) && (0, ReportUtils_1.isSelfDM)(parentReport)) {
        data = getUpdateTrackExpenseParams(transactionID, transactionThreadReportID, transactionChanges, policy);
    }
    else {
        data = getUpdateMoneyRequestParams(transactionID, transactionThreadReportID, transactionChanges, policy, policyTags, policyCategories);
    }
    var params = data.params, onyxData = data.onyxData;
    API.write(types_1.WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DATE, params, onyxData);
}
/** Updates the billable field of an expense */
function updateMoneyRequestBillable(transactionID, transactionThreadReportID, value, policy, policyTagList, policyCategories) {
    if (!transactionID || !transactionThreadReportID) {
        return;
    }
    var transactionChanges = {
        billable: value,
    };
    var _a = getUpdateMoneyRequestParams(transactionID, transactionThreadReportID, transactionChanges, policy, policyTagList, policyCategories), params = _a.params, onyxData = _a.onyxData;
    API.write(types_1.WRITE_COMMANDS.UPDATE_MONEY_REQUEST_BILLABLE, params, onyxData);
}
/** Updates the merchant field of an expense */
function updateMoneyRequestMerchant(transactionID, transactionThreadReportID, value, policy, policyTagList, policyCategories) {
    var _a, _b;
    var transactionChanges = {
        merchant: value,
    };
    var transactionThreadReport = (_a = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadReportID)]) !== null && _a !== void 0 ? _a : null;
    var parentReport = (_b = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.parentReportID)]) !== null && _b !== void 0 ? _b : null;
    var data;
    if ((0, ReportUtils_1.isTrackExpenseReport)(transactionThreadReport) && (0, ReportUtils_1.isSelfDM)(parentReport)) {
        data = getUpdateTrackExpenseParams(transactionID, transactionThreadReportID, transactionChanges, policy);
    }
    else {
        data = getUpdateMoneyRequestParams(transactionID, transactionThreadReportID, transactionChanges, policy, policyTagList, policyCategories);
    }
    var params = data.params, onyxData = data.onyxData;
    API.write(types_1.WRITE_COMMANDS.UPDATE_MONEY_REQUEST_MERCHANT, params, onyxData);
}
/** Updates the attendees list of an expense */
function updateMoneyRequestAttendees(transactionID, transactionThreadReportID, attendees, policy, policyTagList, policyCategories, violations) {
    var transactionChanges = {
        attendees: attendees,
    };
    var data = getUpdateMoneyRequestParams(transactionID, transactionThreadReportID, transactionChanges, policy, policyTagList, policyCategories, violations);
    var params = data.params, onyxData = data.onyxData;
    API.write(types_1.WRITE_COMMANDS.UPDATE_MONEY_REQUEST_ATTENDEES, params, onyxData);
}
/** Updates the tag of an expense */
function updateMoneyRequestTag(transactionID, transactionThreadReportID, tag, policy, policyTagList, policyCategories, hash) {
    var transactionChanges = {
        tag: tag,
    };
    var _a = getUpdateMoneyRequestParams(transactionID, transactionThreadReportID, transactionChanges, policy, policyTagList, policyCategories, undefined, hash), params = _a.params, onyxData = _a.onyxData;
    API.write(types_1.WRITE_COMMANDS.UPDATE_MONEY_REQUEST_TAG, params, onyxData);
}
/** Updates the created tax amount of an expense */
function updateMoneyRequestTaxAmount(transactionID, optimisticReportActionID, taxAmount, policy, policyTagList, policyCategories) {
    var transactionChanges = {
        taxAmount: taxAmount,
    };
    var _a = getUpdateMoneyRequestParams(transactionID, optimisticReportActionID, transactionChanges, policy, policyTagList, policyCategories), params = _a.params, onyxData = _a.onyxData;
    API.write('UpdateMoneyRequestTaxAmount', params, onyxData);
}
/** Updates the created tax rate of an expense */
function updateMoneyRequestTaxRate(_a) {
    var transactionID = _a.transactionID, optimisticReportActionID = _a.optimisticReportActionID, taxCode = _a.taxCode, taxAmount = _a.taxAmount, policy = _a.policy, policyTagList = _a.policyTagList, policyCategories = _a.policyCategories;
    var transactionChanges = {
        taxCode: taxCode,
        taxAmount: taxAmount,
    };
    var _b = getUpdateMoneyRequestParams(transactionID, optimisticReportActionID, transactionChanges, policy, policyTagList, policyCategories), params = _b.params, onyxData = _b.onyxData;
    API.write('UpdateMoneyRequestTaxRate', params, onyxData);
}
/** Updates the waypoints of a distance expense */
function updateMoneyRequestDistance(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    var transactionID = _a.transactionID, transactionThreadReportID = _a.transactionThreadReportID, waypoints = _a.waypoints, _o = _a.routes, routes = _o === void 0 ? undefined : _o, _p = _a.policy, policy = _p === void 0 ? {} : _p, _q = _a.policyTagList, policyTagList = _q === void 0 ? {} : _q, _r = _a.policyCategories, policyCategories = _r === void 0 ? {} : _r, transactionBackup = _a.transactionBackup;
    var transactionChanges = {
        waypoints: (0, Transaction_1.sanitizeRecentWaypoints)(waypoints),
        routes: routes,
    };
    var transactionThreadReport = (_b = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadReportID)]) !== null && _b !== void 0 ? _b : null;
    var parentReport = (_c = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.parentReportID)]) !== null && _c !== void 0 ? _c : null;
    var data;
    if ((0, ReportUtils_1.isTrackExpenseReport)(transactionThreadReport) && (0, ReportUtils_1.isSelfDM)(parentReport)) {
        data = getUpdateTrackExpenseParams(transactionID, transactionThreadReportID, transactionChanges, policy);
    }
    else {
        data = getUpdateMoneyRequestParams(transactionID, transactionThreadReportID, transactionChanges, policy, policyTagList, policyCategories);
    }
    var params = data.params, onyxData = data.onyxData;
    var recentServerValidatedWaypoints = (0, Transaction_1.getRecentWaypoints)().filter(function (item) { return !item.pendingAction; });
    (_d = onyxData === null || onyxData === void 0 ? void 0 : onyxData.failureData) === null || _d === void 0 ? void 0 : _d.push({
        onyxMethod: react_native_onyx_1.default.METHOD.SET,
        key: "".concat(ONYXKEYS_1.default.NVP_RECENT_WAYPOINTS),
        value: recentServerValidatedWaypoints,
    });
    if (transactionBackup) {
        var transaction = allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID)];
        // We need to include all keys of the optimisticData's waypoints in the failureData for onyx merge to properly reset
        // waypoint keys that do not exist in the failureData's waypoints. For instance, if the optimisticData waypoints had
        // three keys and the failureData waypoint had only 2 keys then the third key that doesn't exist in the failureData
        // waypoints should be explicitly reset otherwise onyx merge will leave it intact.
        var allWaypointKeys = __spreadArray([], new Set(__spreadArray(__spreadArray([], Object.keys((_f = (_e = transactionBackup.comment) === null || _e === void 0 ? void 0 : _e.waypoints) !== null && _f !== void 0 ? _f : {}), true), Object.keys((_h = (_g = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _g === void 0 ? void 0 : _g.waypoints) !== null && _h !== void 0 ? _h : {}), true)), true);
        var onyxWaypoints = allWaypointKeys.reduce(function (acc, key) {
            var _a, _b, _c, _d;
            acc[key] = ((_b = (_a = transactionBackup.comment) === null || _a === void 0 ? void 0 : _a.waypoints) === null || _b === void 0 ? void 0 : _b[key]) ? __assign({}, (_d = (_c = transactionBackup.comment) === null || _c === void 0 ? void 0 : _c.waypoints) === null || _d === void 0 ? void 0 : _d[key]) : null;
            return acc;
        }, {});
        var allModifiedWaypointsKeys = __spreadArray([], new Set(__spreadArray(__spreadArray([], Object.keys(waypoints !== null && waypoints !== void 0 ? waypoints : {}), true), Object.keys((_j = transaction === null || transaction === void 0 ? void 0 : transaction.modifiedWaypoints) !== null && _j !== void 0 ? _j : {}), true)), true);
        var onyxModifiedWaypoints = allModifiedWaypointsKeys.reduce(function (acc, key) {
            var _a, _b;
            acc[key] = ((_a = transactionBackup.modifiedWaypoints) === null || _a === void 0 ? void 0 : _a[key]) ? __assign({}, (_b = transactionBackup.modifiedWaypoints) === null || _b === void 0 ? void 0 : _b[key]) : null;
            return acc;
        }, {});
        (_k = onyxData === null || onyxData === void 0 ? void 0 : onyxData.failureData) === null || _k === void 0 ? void 0 : _k.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
            value: {
                comment: {
                    waypoints: onyxWaypoints,
                    customUnit: {
                        quantity: (_m = (_l = transactionBackup === null || transactionBackup === void 0 ? void 0 : transactionBackup.comment) === null || _l === void 0 ? void 0 : _l.customUnit) === null || _m === void 0 ? void 0 : _m.quantity,
                    },
                },
                modifiedWaypoints: onyxModifiedWaypoints,
                routes: null,
            },
        });
    }
    API.write(types_1.WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DISTANCE, params, onyxData);
}
/** Updates the category of an expense */
function updateMoneyRequestCategory(transactionID, transactionThreadReportID, category, policy, policyTagList, policyCategories, hash) {
    var transactionChanges = {
        category: category,
    };
    var _a = getUpdateMoneyRequestParams(transactionID, transactionThreadReportID, transactionChanges, policy, policyTagList, policyCategories, undefined, hash), params = _a.params, onyxData = _a.onyxData;
    API.write(types_1.WRITE_COMMANDS.UPDATE_MONEY_REQUEST_CATEGORY, params, onyxData);
}
/** Updates the description of an expense */
function updateMoneyRequestDescription(transactionID, transactionThreadReportID, comment, policy, policyTagList, policyCategories) {
    var _a, _b;
    var parsedComment = (0, ReportUtils_1.getParsedComment)(comment);
    var transactionChanges = {
        comment: parsedComment,
    };
    var transactionThreadReport = (_a = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadReportID)]) !== null && _a !== void 0 ? _a : null;
    var parentReport = (_b = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.parentReportID)]) !== null && _b !== void 0 ? _b : null;
    var data;
    if ((0, ReportUtils_1.isTrackExpenseReport)(transactionThreadReport) && (0, ReportUtils_1.isSelfDM)(parentReport)) {
        data = getUpdateTrackExpenseParams(transactionID, transactionThreadReportID, transactionChanges, policy);
    }
    else {
        data = getUpdateMoneyRequestParams(transactionID, transactionThreadReportID, transactionChanges, policy, policyTagList, policyCategories);
    }
    var params = data.params, onyxData = data.onyxData;
    params.description = parsedComment;
    API.write(types_1.WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DESCRIPTION, params, onyxData);
}
/** Updates the distance rate of an expense */
function updateMoneyRequestDistanceRate(transactionID, transactionThreadReportID, rateID, policy, policyTagList, policyCategories, updatedTaxAmount, updatedTaxCode) {
    var _a, _b, _c, _d, _e;
    var transactionChanges = __assign(__assign({ customUnitRateID: rateID }, (typeof updatedTaxAmount === 'number' ? { taxAmount: updatedTaxAmount } : {})), (updatedTaxCode ? { taxCode: updatedTaxCode } : {}));
    var transactionThreadReport = (_a = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadReportID)]) !== null && _a !== void 0 ? _a : null;
    var parentReport = (_b = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.parentReportID)]) !== null && _b !== void 0 ? _b : null;
    var transaction = allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID)];
    if (transaction) {
        var existingDistanceUnit = (_d = (_c = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _c === void 0 ? void 0 : _c.customUnit) === null || _d === void 0 ? void 0 : _d.distanceUnit;
        var newDistanceUnit = (_e = DistanceRequestUtils_1.default.getRateByCustomUnitRateID({ customUnitRateID: rateID, policy: policy })) === null || _e === void 0 ? void 0 : _e.unit;
        // If the distanceUnit is set and the rate is changed to one that has a different unit, mark the merchant as modified to make the distance field pending
        if (existingDistanceUnit && newDistanceUnit && newDistanceUnit !== existingDistanceUnit) {
            transactionChanges.merchant = (0, TransactionUtils_1.getMerchant)(transaction);
        }
    }
    var data;
    if ((0, ReportUtils_1.isTrackExpenseReport)(transactionThreadReport) && (0, ReportUtils_1.isSelfDM)(parentReport)) {
        data = getUpdateTrackExpenseParams(transactionID, transactionThreadReportID, transactionChanges, policy);
    }
    else {
        data = getUpdateMoneyRequestParams(transactionID, transactionThreadReportID, transactionChanges, policy, policyTagList, policyCategories);
    }
    var params = data.params, onyxData = data.onyxData;
    // `taxAmount` & `taxCode` only needs to be updated in the optimistic data, so we need to remove them from the params
    var taxAmount = params.taxAmount, taxCode = params.taxCode, paramsWithoutTaxUpdated = __rest(params, ["taxAmount", "taxCode"]);
    API.write(types_1.WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DISTANCE_RATE, paramsWithoutTaxUpdated, onyxData);
}
var getConvertTrackedExpenseInformation = function (transactionID, actionableWhisperReportActionID, moneyRequestReportID, linkedTrackedExpenseReportAction, linkedTrackedExpenseReportID, transactionThreadReportID, resolution) {
    var _a, _b, _c;
    var optimisticData = [];
    var successData = [];
    var failureData = [];
    // Delete the transaction from the track expense report
    var _d = getDeleteTrackExpenseInformation(linkedTrackedExpenseReportID, transactionID, linkedTrackedExpenseReportAction, false, true, actionableWhisperReportActionID, resolution), deleteOptimisticData = _d.optimisticData, deleteSuccessData = _d.successData, deleteFailureData = _d.failureData;
    optimisticData === null || optimisticData === void 0 ? void 0 : optimisticData.push.apply(optimisticData, deleteOptimisticData);
    successData === null || successData === void 0 ? void 0 : successData.push.apply(successData, deleteSuccessData);
    failureData === null || failureData === void 0 ? void 0 : failureData.push.apply(failureData, deleteFailureData);
    // Build modified expense report action with the transaction changes
    var modifiedExpenseReportAction = (0, ReportUtils_1.buildOptimisticMovedTransactionAction)(transactionThreadReportID, moneyRequestReportID !== null && moneyRequestReportID !== void 0 ? moneyRequestReportID : CONST_1.default.REPORT.UNREPORTED_REPORT_ID);
    optimisticData === null || optimisticData === void 0 ? void 0 : optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionThreadReportID),
        value: (_a = {},
            _a[modifiedExpenseReportAction.reportActionID] = modifiedExpenseReportAction,
            _a),
    });
    successData === null || successData === void 0 ? void 0 : successData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionThreadReportID),
        value: (_b = {},
            _b[modifiedExpenseReportAction.reportActionID] = { pendingAction: null },
            _b),
    });
    failureData === null || failureData === void 0 ? void 0 : failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionThreadReportID),
        value: (_c = {},
            _c[modifiedExpenseReportAction.reportActionID] = __assign(__assign({}, modifiedExpenseReportAction), { errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.genericEditFailureMessage') }),
            _c),
    });
    return { optimisticData: optimisticData, successData: successData, failureData: failureData, modifiedExpenseReportActionID: modifiedExpenseReportAction.reportActionID };
};
function addTrackedExpenseToPolicy(parameters, onyxData) {
    API.write(types_1.WRITE_COMMANDS.ADD_TRACKED_EXPENSE_TO_POLICY, parameters, onyxData);
}
function convertTrackedExpenseToRequest(convertTrackedExpenseParams) {
    var payerParams = convertTrackedExpenseParams.payerParams, transactionParams = convertTrackedExpenseParams.transactionParams, chatParams = convertTrackedExpenseParams.chatParams, iouParams = convertTrackedExpenseParams.iouParams, onyxData = convertTrackedExpenseParams.onyxData, workspaceParams = convertTrackedExpenseParams.workspaceParams;
    var payerAccountID = payerParams.accountID, payerEmail = payerParams.email;
    var transactionID = transactionParams.transactionID, actionableWhisperReportActionID = transactionParams.actionableWhisperReportActionID, linkedTrackedExpenseReportAction = transactionParams.linkedTrackedExpenseReportAction, linkedTrackedExpenseReportID = transactionParams.linkedTrackedExpenseReportID, amount = transactionParams.amount, currency = transactionParams.currency, comment = transactionParams.comment, merchant = transactionParams.merchant, created = transactionParams.created, attendees = transactionParams.attendees, transactionThreadReportID = transactionParams.transactionThreadReportID;
    var _a = onyxData.optimisticData, convertTransactionOptimisticData = _a === void 0 ? [] : _a, _b = onyxData.successData, convertTransactionSuccessData = _b === void 0 ? [] : _b, _c = onyxData.failureData, convertTransactionFailureData = _c === void 0 ? [] : _c;
    var _d = getConvertTrackedExpenseInformation(transactionID, actionableWhisperReportActionID, iouParams.reportID, linkedTrackedExpenseReportAction, linkedTrackedExpenseReportID, transactionThreadReportID, CONST_1.default.IOU.ACTION.SUBMIT), optimisticData = _d.optimisticData, successData = _d.successData, failureData = _d.failureData, modifiedExpenseReportActionID = _d.modifiedExpenseReportActionID;
    optimisticData === null || optimisticData === void 0 ? void 0 : optimisticData.push.apply(optimisticData, convertTransactionOptimisticData);
    successData === null || successData === void 0 ? void 0 : successData.push.apply(successData, convertTransactionSuccessData);
    failureData === null || failureData === void 0 ? void 0 : failureData.push.apply(failureData, convertTransactionFailureData);
    if (workspaceParams) {
        var params = __assign({ amount: amount, currency: currency, comment: comment, created: created, merchant: merchant, reimbursable: true, transactionID: transactionID, actionableWhisperReportActionID: actionableWhisperReportActionID, moneyRequestReportID: iouParams.reportID, moneyRequestCreatedReportActionID: iouParams.createdReportActionID, moneyRequestPreviewReportActionID: iouParams.reportActionID, modifiedExpenseReportActionID: modifiedExpenseReportActionID, reportPreviewReportActionID: chatParams.reportPreviewReportActionID }, workspaceParams);
        addTrackedExpenseToPolicy(params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
        return;
    }
    var parameters = {
        attendees: attendees,
        amount: amount,
        currency: currency,
        comment: comment,
        created: created,
        merchant: merchant,
        payerAccountID: payerAccountID,
        payerEmail: payerEmail,
        chatReportID: chatParams.reportID,
        transactionID: transactionID,
        actionableWhisperReportActionID: actionableWhisperReportActionID,
        createdChatReportActionID: chatParams.createdReportActionID,
        moneyRequestReportID: iouParams.reportID,
        moneyRequestCreatedReportActionID: iouParams.createdReportActionID,
        moneyRequestPreviewReportActionID: iouParams.reportActionID,
        transactionThreadReportID: transactionThreadReportID,
        modifiedExpenseReportActionID: modifiedExpenseReportActionID,
        reportPreviewReportActionID: chatParams.reportPreviewReportActionID,
    };
    API.write(types_1.WRITE_COMMANDS.CONVERT_TRACKED_EXPENSE_TO_REQUEST, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function categorizeTrackedExpense(trackedExpenseParams) {
    var _a;
    var onyxData = trackedExpenseParams.onyxData, reportInformation = trackedExpenseParams.reportInformation, transactionParams = trackedExpenseParams.transactionParams, policyParams = trackedExpenseParams.policyParams, createdWorkspaceParams = trackedExpenseParams.createdWorkspaceParams;
    var _b = onyxData !== null && onyxData !== void 0 ? onyxData : {}, optimisticData = _b.optimisticData, successData = _b.successData, failureData = _b.failureData;
    var transactionID = transactionParams.transactionID;
    var isDraftPolicy = policyParams.isDraftPolicy;
    var actionableWhisperReportActionID = reportInformation.actionableWhisperReportActionID, moneyRequestReportID = reportInformation.moneyRequestReportID, linkedTrackedExpenseReportAction = reportInformation.linkedTrackedExpenseReportAction, linkedTrackedExpenseReportID = reportInformation.linkedTrackedExpenseReportID, transactionThreadReportID = reportInformation.transactionThreadReportID;
    var _c = getConvertTrackedExpenseInformation(transactionID, actionableWhisperReportActionID, moneyRequestReportID, linkedTrackedExpenseReportAction, linkedTrackedExpenseReportID, transactionThreadReportID, CONST_1.default.IOU.ACTION.CATEGORIZE), moveTransactionOptimisticData = _c.optimisticData, moveTransactionSuccessData = _c.successData, moveTransactionFailureData = _c.failureData, modifiedExpenseReportActionID = _c.modifiedExpenseReportActionID;
    optimisticData === null || optimisticData === void 0 ? void 0 : optimisticData.push.apply(optimisticData, moveTransactionOptimisticData);
    successData === null || successData === void 0 ? void 0 : successData.push.apply(successData, moveTransactionSuccessData);
    failureData === null || failureData === void 0 ? void 0 : failureData.push.apply(failureData, moveTransactionFailureData);
    var parameters = __assign(__assign(__assign(__assign({}, __assign(__assign({}, reportInformation), { linkedTrackedExpenseReportAction: undefined })), policyParams), transactionParams), { modifiedExpenseReportActionID: modifiedExpenseReportActionID, policyExpenseChatReportID: createdWorkspaceParams === null || createdWorkspaceParams === void 0 ? void 0 : createdWorkspaceParams.expenseChatReportID, policyExpenseCreatedReportActionID: createdWorkspaceParams === null || createdWorkspaceParams === void 0 ? void 0 : createdWorkspaceParams.expenseCreatedReportActionID, adminsChatReportID: createdWorkspaceParams === null || createdWorkspaceParams === void 0 ? void 0 : createdWorkspaceParams.adminsChatReportID, adminsCreatedReportActionID: createdWorkspaceParams === null || createdWorkspaceParams === void 0 ? void 0 : createdWorkspaceParams.adminsCreatedReportActionID, engagementChoice: createdWorkspaceParams === null || createdWorkspaceParams === void 0 ? void 0 : createdWorkspaceParams.engagementChoice, guidedSetupData: createdWorkspaceParams === null || createdWorkspaceParams === void 0 ? void 0 : createdWorkspaceParams.guidedSetupData, description: transactionParams.comment, customUnitID: createdWorkspaceParams === null || createdWorkspaceParams === void 0 ? void 0 : createdWorkspaceParams.customUnitID, customUnitRateID: (_a = createdWorkspaceParams === null || createdWorkspaceParams === void 0 ? void 0 : createdWorkspaceParams.customUnitRateID) !== null && _a !== void 0 ? _a : transactionParams.customUnitRateID, attendees: transactionParams.attendees ? JSON.stringify(transactionParams.attendees) : undefined });
    API.write(types_1.WRITE_COMMANDS.CATEGORIZE_TRACKED_EXPENSE, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
    // If a draft policy was used, then the CategorizeTrackedExpense command will create a real one
    // so let's track that conversion here
    if (isDraftPolicy) {
        GoogleTagManager_1.default.publishEvent(CONST_1.default.ANALYTICS.EVENT.WORKSPACE_CREATED, userAccountID);
    }
}
function shareTrackedExpense(trackedExpenseParams) {
    var _a, _b;
    var _c, _d, _e, _f, _g;
    var onyxData = trackedExpenseParams.onyxData, reportInformation = trackedExpenseParams.reportInformation, transactionParams = trackedExpenseParams.transactionParams, policyParams = trackedExpenseParams.policyParams, createdWorkspaceParams = trackedExpenseParams.createdWorkspaceParams, accountantParams = trackedExpenseParams.accountantParams;
    var policyID = policyParams === null || policyParams === void 0 ? void 0 : policyParams.policyID;
    var chatReportID = reportInformation === null || reportInformation === void 0 ? void 0 : reportInformation.chatReportID;
    var accountantEmail = (0, PhoneNumber_1.addSMSDomainIfPhoneNumber)((_c = accountantParams === null || accountantParams === void 0 ? void 0 : accountantParams.accountant) === null || _c === void 0 ? void 0 : _c.login);
    var accountantAccountID = (_d = accountantParams === null || accountantParams === void 0 ? void 0 : accountantParams.accountant) === null || _d === void 0 ? void 0 : _d.accountID;
    if (!policyID || !chatReportID || !accountantEmail || !accountantAccountID) {
        return;
    }
    var _h = onyxData !== null && onyxData !== void 0 ? onyxData : {}, _j = _h.optimisticData, shareTrackedExpenseOptimisticData = _j === void 0 ? [] : _j, _k = _h.successData, shareTrackedExpenseSuccessData = _k === void 0 ? [] : _k, _l = _h.failureData, shareTrackedExpenseFailureData = _l === void 0 ? [] : _l;
    var transactionID = transactionParams.transactionID;
    var actionableWhisperReportActionID = reportInformation.actionableWhisperReportActionID, moneyRequestPreviewReportActionID = reportInformation.moneyRequestPreviewReportActionID, moneyRequestCreatedReportActionID = reportInformation.moneyRequestCreatedReportActionID, reportPreviewReportActionID = reportInformation.reportPreviewReportActionID, moneyRequestReportID = reportInformation.moneyRequestReportID, linkedTrackedExpenseReportAction = reportInformation.linkedTrackedExpenseReportAction, linkedTrackedExpenseReportID = reportInformation.linkedTrackedExpenseReportID, transactionThreadReportID = reportInformation.transactionThreadReportID;
    var _m = getConvertTrackedExpenseInformation(transactionID, actionableWhisperReportActionID, moneyRequestReportID, linkedTrackedExpenseReportAction, linkedTrackedExpenseReportID, transactionThreadReportID, CONST_1.default.IOU.ACTION.SHARE), optimisticData = _m.optimisticData, successData = _m.successData, failureData = _m.failureData, modifiedExpenseReportActionID = _m.modifiedExpenseReportActionID;
    optimisticData === null || optimisticData === void 0 ? void 0 : optimisticData.push.apply(optimisticData, shareTrackedExpenseOptimisticData);
    successData === null || successData === void 0 ? void 0 : successData.push.apply(successData, shareTrackedExpenseSuccessData);
    failureData === null || failureData === void 0 ? void 0 : failureData.push.apply(failureData, shareTrackedExpenseFailureData);
    var policyEmployeeList = (_e = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyParams === null || policyParams === void 0 ? void 0 : policyParams.policyID)]) === null || _e === void 0 ? void 0 : _e.employeeList;
    if (!(policyEmployeeList === null || policyEmployeeList === void 0 ? void 0 : policyEmployeeList[accountantEmail])) {
        var policyMemberAccountIDs = Object.values((0, PolicyUtils_1.getMemberAccountIDsForWorkspace)(policyEmployeeList, false, false));
        var _o = (0, Member_1.buildAddMembersToWorkspaceOnyxData)((_a = {}, _a[accountantEmail] = accountantAccountID, _a), policyID, policyMemberAccountIDs, CONST_1.default.POLICY.ROLE.ADMIN), addAccountantToWorkspaceOptimisticData = _o.optimisticData, addAccountantToWorkspaceSuccessData = _o.successData, addAccountantToWorkspaceFailureData = _o.failureData;
        optimisticData === null || optimisticData === void 0 ? void 0 : optimisticData.push.apply(optimisticData, addAccountantToWorkspaceOptimisticData);
        successData === null || successData === void 0 ? void 0 : successData.push.apply(successData, addAccountantToWorkspaceSuccessData);
        failureData === null || failureData === void 0 ? void 0 : failureData.push.apply(failureData, addAccountantToWorkspaceFailureData);
    }
    else if ((policyEmployeeList === null || policyEmployeeList === void 0 ? void 0 : policyEmployeeList[accountantEmail].role) !== CONST_1.default.POLICY.ROLE.ADMIN) {
        var _p = (0, Member_1.buildUpdateWorkspaceMembersRoleOnyxData)(policyID, [accountantAccountID], CONST_1.default.POLICY.ROLE.ADMIN), addAccountantToWorkspaceOptimisticData = _p.optimisticData, addAccountantToWorkspaceSuccessData = _p.successData, addAccountantToWorkspaceFailureData = _p.failureData;
        optimisticData === null || optimisticData === void 0 ? void 0 : optimisticData.push.apply(optimisticData, addAccountantToWorkspaceOptimisticData);
        successData === null || successData === void 0 ? void 0 : successData.push.apply(successData, addAccountantToWorkspaceSuccessData);
        failureData === null || failureData === void 0 ? void 0 : failureData.push.apply(failureData, addAccountantToWorkspaceFailureData);
    }
    var chatReportParticipants = (_f = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReportID)]) === null || _f === void 0 ? void 0 : _f.participants;
    if (!(chatReportParticipants === null || chatReportParticipants === void 0 ? void 0 : chatReportParticipants[accountantAccountID])) {
        var _q = (0, Report_1.buildInviteToRoomOnyxData)(chatReportID, (_b = {}, _b[accountantEmail] = accountantAccountID, _b)), inviteAccountantToRoomOptimisticData = _q.optimisticData, inviteAccountantToRoomSuccessData = _q.successData, inviteAccountantToRoomFailureData = _q.failureData;
        optimisticData === null || optimisticData === void 0 ? void 0 : optimisticData.push.apply(optimisticData, inviteAccountantToRoomOptimisticData);
        successData === null || successData === void 0 ? void 0 : successData.push.apply(successData, inviteAccountantToRoomSuccessData);
        failureData === null || failureData === void 0 ? void 0 : failureData.push.apply(failureData, inviteAccountantToRoomFailureData);
    }
    var parameters = __assign(__assign({}, transactionParams), { policyID: policyID, moneyRequestPreviewReportActionID: moneyRequestPreviewReportActionID, moneyRequestReportID: moneyRequestReportID, moneyRequestCreatedReportActionID: moneyRequestCreatedReportActionID, actionableWhisperReportActionID: actionableWhisperReportActionID, modifiedExpenseReportActionID: modifiedExpenseReportActionID, reportPreviewReportActionID: reportPreviewReportActionID, policyExpenseChatReportID: createdWorkspaceParams === null || createdWorkspaceParams === void 0 ? void 0 : createdWorkspaceParams.expenseChatReportID, policyExpenseCreatedReportActionID: createdWorkspaceParams === null || createdWorkspaceParams === void 0 ? void 0 : createdWorkspaceParams.expenseCreatedReportActionID, adminsChatReportID: createdWorkspaceParams === null || createdWorkspaceParams === void 0 ? void 0 : createdWorkspaceParams.adminsChatReportID, adminsCreatedReportActionID: createdWorkspaceParams === null || createdWorkspaceParams === void 0 ? void 0 : createdWorkspaceParams.adminsCreatedReportActionID, engagementChoice: createdWorkspaceParams === null || createdWorkspaceParams === void 0 ? void 0 : createdWorkspaceParams.engagementChoice, guidedSetupData: createdWorkspaceParams === null || createdWorkspaceParams === void 0 ? void 0 : createdWorkspaceParams.guidedSetupData, policyName: createdWorkspaceParams === null || createdWorkspaceParams === void 0 ? void 0 : createdWorkspaceParams.policyName, description: transactionParams.comment, customUnitID: createdWorkspaceParams === null || createdWorkspaceParams === void 0 ? void 0 : createdWorkspaceParams.customUnitID, customUnitRateID: (_g = createdWorkspaceParams === null || createdWorkspaceParams === void 0 ? void 0 : createdWorkspaceParams.customUnitRateID) !== null && _g !== void 0 ? _g : transactionParams.customUnitRateID, attendees: transactionParams.attendees ? JSON.stringify(transactionParams.attendees) : undefined, accountantEmail: accountantEmail });
    API.write(types_1.WRITE_COMMANDS.SHARE_TRACKED_EXPENSE, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
/**
 * Submit expense to another user
 */
function requestMoney(requestMoneyInformation) {
    var _a, _b, _c, _d;
    var report = requestMoneyInformation.report, participantParams = requestMoneyInformation.participantParams, _e = requestMoneyInformation.policyParams, policyParams = _e === void 0 ? {} : _e, transactionParams = requestMoneyInformation.transactionParams, gpsPoints = requestMoneyInformation.gpsPoints, action = requestMoneyInformation.action, reimbursible = requestMoneyInformation.reimbursible, _f = requestMoneyInformation.shouldHandleNavigation, shouldHandleNavigation = _f === void 0 ? true : _f, backToReport = requestMoneyInformation.backToReport, _g = requestMoneyInformation.shouldPlaySound, shouldPlaySound = _g === void 0 ? true : _g, optimisticChatReportID = requestMoneyInformation.optimisticChatReportID, optimisticCreatedReportActionID = requestMoneyInformation.optimisticCreatedReportActionID, optimisticIOUReportID = requestMoneyInformation.optimisticIOUReportID, optimisticReportPreviewActionID = requestMoneyInformation.optimisticReportPreviewActionID;
    var payeeAccountID = participantParams.payeeAccountID;
    var parsedComment = (0, ReportUtils_1.getParsedComment)((_a = transactionParams.comment) !== null && _a !== void 0 ? _a : '');
    transactionParams.comment = parsedComment;
    var amount = transactionParams.amount, currency = transactionParams.currency, merchant = transactionParams.merchant, _h = transactionParams.comment, comment = _h === void 0 ? '' : _h, receipt = transactionParams.receipt, category = transactionParams.category, tag = transactionParams.tag, _j = transactionParams.taxCode, taxCode = _j === void 0 ? '' : _j, _k = transactionParams.taxAmount, taxAmount = _k === void 0 ? 0 : _k, billable = transactionParams.billable, created = transactionParams.created, attendees = transactionParams.attendees, actionableWhisperReportActionID = transactionParams.actionableWhisperReportActionID, linkedTrackedExpenseReportAction = transactionParams.linkedTrackedExpenseReportAction, linkedTrackedExpenseReportID = transactionParams.linkedTrackedExpenseReportID, waypoints = transactionParams.waypoints, customUnitRateID = transactionParams.customUnitRateID, isTestDrive = transactionParams.isTestDrive;
    var testDriveCommentReportActionID = isTestDrive ? NumberUtils.rand64() : undefined;
    var sanitizedWaypoints = waypoints ? JSON.stringify((0, Transaction_1.sanitizeRecentWaypoints)(waypoints)) : undefined;
    // If the report is iou or expense report, we should get the linked chat report to be passed to the getMoneyRequestInformation function
    var isMoneyRequestReport = (0, ReportUtils_1.isMoneyRequestReport)(report);
    var currentChatReport = isMoneyRequestReport ? (0, ReportUtils_1.getReportOrDraftReport)(report === null || report === void 0 ? void 0 : report.chatReportID) : report;
    var moneyRequestReportID = isMoneyRequestReport ? report === null || report === void 0 ? void 0 : report.reportID : '';
    var isMovingTransactionFromTrackExpense = (0, IOUUtils_1.isMovingTransactionFromTrackExpense)(action);
    var existingTransactionID = isMovingTransactionFromTrackExpense && linkedTrackedExpenseReportAction && (0, ReportActionsUtils_1.isMoneyRequestAction)(linkedTrackedExpenseReportAction)
        ? (_b = (0, ReportActionsUtils_1.getOriginalMessage)(linkedTrackedExpenseReportAction)) === null || _b === void 0 ? void 0 : _b.IOUTransactionID
        : undefined;
    var existingTransaction = action === CONST_1.default.IOU.ACTION.SUBMIT
        ? allTransactionDrafts["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(existingTransactionID)]
        : allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(existingTransactionID)];
    var retryParams = __assign(__assign({}, requestMoneyInformation), { participantParams: __assign(__assign({}, requestMoneyInformation.participantParams), { participant: (function (_a) {
                var icons = _a.icons, rest = __rest(_a, ["icons"]);
                return rest;
            })(requestMoneyInformation.participantParams.participant) }), transactionParams: __assign(__assign({}, requestMoneyInformation.transactionParams), { receipt: undefined }) });
    var _l = getMoneyRequestInformation({
        parentChatReport: isMovingTransactionFromTrackExpense ? undefined : currentChatReport,
        participantParams: participantParams,
        policyParams: policyParams,
        transactionParams: transactionParams,
        moneyRequestReportID: moneyRequestReportID,
        existingTransactionID: existingTransactionID,
        existingTransaction: (0, TransactionUtils_1.isDistanceRequest)(existingTransaction) ? existingTransaction : undefined,
        retryParams: retryParams,
        testDriveCommentReportActionID: testDriveCommentReportActionID,
        optimisticChatReportID: optimisticChatReportID,
        optimisticCreatedReportActionID: optimisticCreatedReportActionID,
        optimisticIOUReportID: optimisticIOUReportID,
        optimisticReportPreviewActionID: optimisticReportPreviewActionID,
    }), payerAccountID = _l.payerAccountID, payerEmail = _l.payerEmail, iouReport = _l.iouReport, chatReport = _l.chatReport, transaction = _l.transaction, iouAction = _l.iouAction, createdChatReportActionID = _l.createdChatReportActionID, createdIOUReportActionID = _l.createdIOUReportActionID, reportPreviewAction = _l.reportPreviewAction, transactionThreadReportID = _l.transactionThreadReportID, createdReportActionIDForThread = _l.createdReportActionIDForThread, onyxData = _l.onyxData;
    var activeReportID = isMoneyRequestReport ? report === null || report === void 0 ? void 0 : report.reportID : chatReport.reportID;
    if (shouldPlaySound) {
        (0, Sound_1.default)(Sound_1.SOUNDS.DONE);
    }
    switch (action) {
        case CONST_1.default.IOU.ACTION.SUBMIT: {
            if (!linkedTrackedExpenseReportAction || !linkedTrackedExpenseReportID) {
                return;
            }
            var workspaceParams = (0, ReportUtils_1.isPolicyExpenseChat)(chatReport) && chatReport.policyID
                ? {
                    receipt: (0, isFileUploadable_1.default)(receipt) ? receipt : undefined,
                    category: category,
                    tag: tag,
                    taxCode: taxCode,
                    taxAmount: taxAmount,
                    billable: billable,
                    policyID: chatReport.policyID,
                    waypoints: sanitizedWaypoints,
                    customUnitID: (_c = (0, PolicyUtils_1.getDistanceRateCustomUnit)(policyParams === null || policyParams === void 0 ? void 0 : policyParams.policy)) === null || _c === void 0 ? void 0 : _c.customUnitID,
                    customUnitRateID: customUnitRateID,
                }
                : undefined;
            convertTrackedExpenseToRequest({
                payerParams: {
                    accountID: payerAccountID,
                    email: payerEmail,
                },
                transactionParams: {
                    amount: amount,
                    currency: currency,
                    comment: comment,
                    merchant: merchant,
                    created: created,
                    attendees: attendees,
                    transactionID: transaction.transactionID,
                    actionableWhisperReportActionID: actionableWhisperReportActionID,
                    linkedTrackedExpenseReportAction: linkedTrackedExpenseReportAction,
                    linkedTrackedExpenseReportID: linkedTrackedExpenseReportID,
                    transactionThreadReportID: transactionThreadReportID,
                },
                chatParams: {
                    reportID: chatReport.reportID,
                    createdReportActionID: createdChatReportActionID,
                    reportPreviewReportActionID: reportPreviewAction.reportActionID,
                },
                iouParams: {
                    reportID: iouReport.reportID,
                    createdReportActionID: createdIOUReportActionID,
                    reportActionID: iouAction.reportActionID,
                },
                onyxData: onyxData,
                workspaceParams: workspaceParams,
            });
            break;
        }
        default: {
            // This is only required when inviting admins to test drive the app
            var guidedSetupData = isTestDrive
                ? (_d = (0, ReportUtils_1.prepareOnboardingOnyxData)({ choice: CONST_1.default.ONBOARDING_CHOICES.TEST_DRIVE_RECEIVER }, CONST_1.default.ONBOARDING_CHOICES.TEST_DRIVE_RECEIVER, (0, OnboardingFlow_1.getOnboardingMessages)().onboardingMessages[CONST_1.default.ONBOARDING_CHOICES.TEST_DRIVE_RECEIVER])) === null || _d === void 0 ? void 0 : _d.guidedSetupData
                : undefined;
            var parameters = {
                debtorEmail: payerEmail,
                debtorAccountID: payerAccountID,
                amount: amount,
                currency: currency,
                comment: comment,
                created: created,
                merchant: merchant,
                iouReportID: iouReport.reportID,
                chatReportID: chatReport.reportID,
                transactionID: transaction.transactionID,
                reportActionID: iouAction.reportActionID,
                createdChatReportActionID: createdChatReportActionID,
                createdIOUReportActionID: createdIOUReportActionID,
                reportPreviewReportActionID: reportPreviewAction.reportActionID,
                receipt: (0, isFileUploadable_1.default)(receipt) ? receipt : undefined,
                receiptState: receipt === null || receipt === void 0 ? void 0 : receipt.state,
                category: category,
                tag: tag,
                taxCode: taxCode,
                taxAmount: taxAmount,
                billable: billable,
                // This needs to be a string of JSON because of limitations with the fetch() API and nested objects
                receiptGpsPoints: gpsPoints ? JSON.stringify(gpsPoints) : undefined,
                transactionThreadReportID: transactionThreadReportID,
                createdReportActionIDForThread: createdReportActionIDForThread,
                reimbursible: reimbursible,
                description: parsedComment,
                attendees: attendees ? JSON.stringify(attendees) : undefined,
                isTestDrive: isTestDrive,
                guidedSetupData: guidedSetupData ? JSON.stringify(guidedSetupData) : undefined,
                testDriveCommentReportActionID: testDriveCommentReportActionID,
            };
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            API.write(types_1.WRITE_COMMANDS.REQUEST_MONEY, parameters, onyxData);
        }
    }
    if (shouldHandleNavigation) {
        react_native_1.InteractionManager.runAfterInteractions(function () { return (0, TransactionEdit_1.removeDraftTransactions)(); });
        if (!requestMoneyInformation.isRetry) {
            dismissModalAndOpenReportInInboxTab(backToReport !== null && backToReport !== void 0 ? backToReport : activeReportID);
        }
        var trackReport = Navigation_1.default.getReportRouteByID(linkedTrackedExpenseReportAction === null || linkedTrackedExpenseReportAction === void 0 ? void 0 : linkedTrackedExpenseReportAction.childReportID);
        if (trackReport === null || trackReport === void 0 ? void 0 : trackReport.key) {
            Navigation_1.default.removeScreenByKey(trackReport.key);
        }
    }
    if (activeReportID && !isMoneyRequestReport) {
        (0, Report_1.notifyNewAction)(activeReportID, payeeAccountID);
    }
}
/**
 * Submit per diem expense to another user
 */
function submitPerDiemExpense(submitPerDiemExpenseInformation) {
    var _a;
    var report = submitPerDiemExpenseInformation.report, participantParams = submitPerDiemExpenseInformation.participantParams, _b = submitPerDiemExpenseInformation.policyParams, policyParams = _b === void 0 ? {} : _b, transactionParams = submitPerDiemExpenseInformation.transactionParams;
    var payeeAccountID = participantParams.payeeAccountID;
    var currency = transactionParams.currency, _c = transactionParams.comment, comment = _c === void 0 ? '' : _c, category = transactionParams.category, tag = transactionParams.tag, created = transactionParams.created, customUnit = transactionParams.customUnit, attendees = transactionParams.attendees;
    if ((0, EmptyObject_1.isEmptyObject)(policyParams.policy) ||
        (0, EmptyObject_1.isEmptyObject)(customUnit) ||
        !customUnit.customUnitID ||
        !customUnit.customUnitRateID ||
        ((_a = customUnit.subRates) !== null && _a !== void 0 ? _a : []).length === 0 ||
        (0, EmptyObject_1.isEmptyObject)(customUnit.attributes)) {
        return;
    }
    // If the report is iou or expense report, we should get the linked chat report to be passed to the getMoneyRequestInformation function
    var isMoneyRequestReport = (0, ReportUtils_1.isMoneyRequestReport)(report);
    var currentChatReport = isMoneyRequestReport ? (0, ReportUtils_1.getReportOrDraftReport)(report === null || report === void 0 ? void 0 : report.chatReportID) : report;
    var moneyRequestReportID = isMoneyRequestReport ? report === null || report === void 0 ? void 0 : report.reportID : '';
    var _d = getPerDiemExpenseInformation({
        parentChatReport: currentChatReport,
        participantParams: participantParams,
        policyParams: policyParams,
        transactionParams: transactionParams,
        moneyRequestReportID: moneyRequestReportID,
    }), iouReport = _d.iouReport, chatReport = _d.chatReport, transaction = _d.transaction, iouAction = _d.iouAction, createdChatReportActionID = _d.createdChatReportActionID, createdIOUReportActionID = _d.createdIOUReportActionID, reportPreviewAction = _d.reportPreviewAction, transactionThreadReportID = _d.transactionThreadReportID, createdReportActionIDForThread = _d.createdReportActionIDForThread, onyxData = _d.onyxData, billable = _d.billable;
    var activeReportID = isMoneyRequestReport ? report === null || report === void 0 ? void 0 : report.reportID : chatReport.reportID;
    var customUnitRate = (0, PolicyUtils_1.getPerDiemRateCustomUnitRate)(policyParams.policy, customUnit.customUnitRateID);
    var customUnitRateParam = {
        id: customUnitRate === null || customUnitRate === void 0 ? void 0 : customUnitRate.customUnitRateID,
        name: customUnitRate === null || customUnitRate === void 0 ? void 0 : customUnitRate.name,
    };
    var parameters = {
        policyID: policyParams.policy.id,
        customUnitID: customUnit.customUnitID,
        customUnitRateID: customUnit.customUnitRateID,
        customUnitRate: JSON.stringify(customUnitRateParam),
        subRates: JSON.stringify(customUnit.subRates),
        startDateTime: customUnit.attributes.dates.start,
        endDateTime: customUnit.attributes.dates.end,
        currency: currency,
        description: comment,
        created: created,
        iouReportID: iouReport.reportID,
        chatReportID: chatReport.reportID,
        transactionID: transaction.transactionID,
        reportActionID: iouAction.reportActionID,
        createdChatReportActionID: createdChatReportActionID,
        createdIOUReportActionID: createdIOUReportActionID,
        reportPreviewReportActionID: reportPreviewAction.reportActionID,
        category: category,
        tag: tag,
        transactionThreadReportID: transactionThreadReportID,
        createdReportActionIDForThread: createdReportActionIDForThread,
        billable: billable,
        attendees: attendees ? JSON.stringify(attendees) : undefined,
    };
    (0, Sound_1.default)(Sound_1.SOUNDS.DONE);
    API.write(types_1.WRITE_COMMANDS.CREATE_PER_DIEM_REQUEST, parameters, onyxData);
    react_native_1.InteractionManager.runAfterInteractions(function () { return (0, TransactionEdit_1.removeDraftTransaction)(CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID); });
    dismissModalAndOpenReportInInboxTab(activeReportID);
    if (activeReportID) {
        (0, Report_1.notifyNewAction)(activeReportID, payeeAccountID);
    }
}
function sendInvoice(currentUserAccountID, transaction, invoiceChatReport, receiptFile, policy, policyTagList, policyCategories, companyName, companyWebsite) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    var parsedComment = (0, ReportUtils_1.getParsedComment)((_c = (_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.comment) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : '');
    if (transaction === null || transaction === void 0 ? void 0 : transaction.comment) {
        // eslint-disable-next-line no-param-reassign
        transaction.comment.comment = parsedComment;
    }
    var _j = getSendInvoiceInformation(transaction, currentUserAccountID, invoiceChatReport, receiptFile, policy, policyTagList, policyCategories, companyName, companyWebsite), senderWorkspaceID = _j.senderWorkspaceID, receiver = _j.receiver, invoiceRoom = _j.invoiceRoom, createdChatReportActionID = _j.createdChatReportActionID, invoiceReportID = _j.invoiceReportID, reportPreviewReportActionID = _j.reportPreviewReportActionID, transactionID = _j.transactionID, transactionThreadReportID = _j.transactionThreadReportID, createdIOUReportActionID = _j.createdIOUReportActionID, createdReportActionIDForThread = _j.createdReportActionIDForThread, reportActionID = _j.reportActionID, onyxData = _j.onyxData;
    var parameters = __assign({ createdIOUReportActionID: createdIOUReportActionID, createdReportActionIDForThread: createdReportActionIDForThread, reportActionID: reportActionID, senderWorkspaceID: senderWorkspaceID, accountID: currentUserAccountID, amount: (_d = transaction === null || transaction === void 0 ? void 0 : transaction.amount) !== null && _d !== void 0 ? _d : 0, currency: (_e = transaction === null || transaction === void 0 ? void 0 : transaction.currency) !== null && _e !== void 0 ? _e : '', comment: parsedComment, merchant: (_f = transaction === null || transaction === void 0 ? void 0 : transaction.merchant) !== null && _f !== void 0 ? _f : '', category: transaction === null || transaction === void 0 ? void 0 : transaction.category, date: (_g = transaction === null || transaction === void 0 ? void 0 : transaction.created) !== null && _g !== void 0 ? _g : '', invoiceRoomReportID: invoiceRoom.reportID, createdChatReportActionID: createdChatReportActionID, invoiceReportID: invoiceReportID, reportPreviewReportActionID: reportPreviewReportActionID, transactionID: transactionID, transactionThreadReportID: transactionThreadReportID, companyName: companyName, companyWebsite: companyWebsite, description: parsedComment }, ((invoiceChatReport === null || invoiceChatReport === void 0 ? void 0 : invoiceChatReport.reportID) ? { receiverInvoiceRoomID: invoiceChatReport.reportID } : { receiverEmail: (_h = receiver.login) !== null && _h !== void 0 ? _h : '' }));
    (0, Sound_1.default)(Sound_1.SOUNDS.DONE);
    API.write(types_1.WRITE_COMMANDS.SEND_INVOICE, parameters, onyxData);
    react_native_1.InteractionManager.runAfterInteractions(function () { return (0, TransactionEdit_1.removeDraftTransaction)(CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID); });
    if ((0, isSearchTopmostFullScreenRoute_1.default)()) {
        Navigation_1.default.dismissModal();
    }
    else {
        Navigation_1.default.dismissModalWithReport({ reportID: invoiceRoom.reportID });
    }
    (0, Report_1.notifyNewAction)(invoiceRoom.reportID, currentUserAccountID);
}
/**
 * Track an expense
 */
function trackExpense(params) {
    var _a, _b, _c, _d;
    var report = params.report, action = params.action, isDraftPolicy = params.isDraftPolicy, participantParams = params.participantParams, _e = params.policyParams, policyData = _e === void 0 ? {} : _e, transactionData = params.transactionParams, accountantParams = params.accountantParams, _f = params.shouldHandleNavigation, shouldHandleNavigation = _f === void 0 ? true : _f, _g = params.shouldPlaySound, shouldPlaySound = _g === void 0 ? true : _g;
    var participant = participantParams.participant, payeeAccountID = participantParams.payeeAccountID, payeeEmail = participantParams.payeeEmail;
    var policy = policyData.policy, policyCategories = policyData.policyCategories, policyTagList = policyData.policyTagList;
    var parsedComment = (0, ReportUtils_1.getParsedComment)((_a = transactionData.comment) !== null && _a !== void 0 ? _a : '');
    transactionData.comment = parsedComment;
    var amount = transactionData.amount, currency = transactionData.currency, _h = transactionData.created, created = _h === void 0 ? '' : _h, _j = transactionData.merchant, merchant = _j === void 0 ? '' : _j, _k = transactionData.comment, comment = _k === void 0 ? '' : _k, receipt = transactionData.receipt, category = transactionData.category, tag = transactionData.tag, _l = transactionData.taxCode, taxCode = _l === void 0 ? '' : _l, _m = transactionData.taxAmount, taxAmount = _m === void 0 ? 0 : _m, billable = transactionData.billable, gpsPoints = transactionData.gpsPoints, validWaypoints = transactionData.validWaypoints, actionableWhisperReportActionID = transactionData.actionableWhisperReportActionID, linkedTrackedExpenseReportAction = transactionData.linkedTrackedExpenseReportAction, linkedTrackedExpenseReportID = transactionData.linkedTrackedExpenseReportID, customUnitRateID = transactionData.customUnitRateID, attendees = transactionData.attendees;
    var isMoneyRequestReport = (0, ReportUtils_1.isMoneyRequestReport)(report);
    var currentChatReport = isMoneyRequestReport ? (0, ReportUtils_1.getReportOrDraftReport)(report.chatReportID) : report;
    var moneyRequestReportID = isMoneyRequestReport ? report.reportID : '';
    var isMovingTransactionFromTrackExpense = (0, IOUUtils_1.isMovingTransactionFromTrackExpense)(action);
    // Pass an open receipt so the distance expense will show a map with the route optimistically
    var trackedReceipt = validWaypoints ? { source: receipt_generic_png_1.default, state: CONST_1.default.IOU.RECEIPT_STATE.OPEN } : receipt;
    var sanitizedWaypoints = validWaypoints ? JSON.stringify((0, Transaction_1.sanitizeRecentWaypoints)(validWaypoints)) : undefined;
    var retryParams = {
        report: report,
        isDraftPolicy: isDraftPolicy,
        action: action,
        participantParams: {
            participant: participant,
            payeeAccountID: payeeAccountID,
            payeeEmail: payeeEmail,
        },
        transactionParams: {
            amount: amount,
            currency: currency,
            created: created,
            merchant: merchant,
            comment: comment,
            receipt: undefined,
            category: category,
            tag: tag,
            taxCode: taxCode,
            taxAmount: taxAmount,
            billable: billable,
            validWaypoints: validWaypoints,
            gpsPoints: gpsPoints,
            actionableWhisperReportActionID: actionableWhisperReportActionID,
            linkedTrackedExpenseReportAction: linkedTrackedExpenseReportAction,
            linkedTrackedExpenseReportID: linkedTrackedExpenseReportID,
            customUnitRateID: customUnitRateID,
        },
    };
    var _o = (_c = getTrackExpenseInformation({
        parentChatReport: currentChatReport,
        moneyRequestReportID: moneyRequestReportID,
        existingTransactionID: isMovingTransactionFromTrackExpense && linkedTrackedExpenseReportAction && (0, ReportActionsUtils_1.isMoneyRequestAction)(linkedTrackedExpenseReportAction)
            ? (_b = (0, ReportActionsUtils_1.getOriginalMessage)(linkedTrackedExpenseReportAction)) === null || _b === void 0 ? void 0 : _b.IOUTransactionID
            : undefined,
        participantParams: {
            participant: participant,
            payeeAccountID: payeeAccountID,
            payeeEmail: payeeEmail,
        },
        transactionParams: {
            comment: comment,
            amount: amount,
            currency: currency,
            created: created,
            merchant: merchant,
            receipt: trackedReceipt,
            category: category,
            tag: tag,
            taxCode: taxCode,
            taxAmount: taxAmount,
            billable: billable,
            linkedTrackedExpenseReportAction: linkedTrackedExpenseReportAction,
            attendees: attendees,
        },
        policyParams: {
            policy: policy,
            policyCategories: policyCategories,
            policyTagList: policyTagList,
        },
        retryParams: retryParams,
    })) !== null && _c !== void 0 ? _c : {}, createdWorkspaceParams = _o.createdWorkspaceParams, iouReport = _o.iouReport, chatReport = _o.chatReport, transaction = _o.transaction, iouAction = _o.iouAction, createdChatReportActionID = _o.createdChatReportActionID, createdIOUReportActionID = _o.createdIOUReportActionID, reportPreviewAction = _o.reportPreviewAction, transactionThreadReportID = _o.transactionThreadReportID, createdReportActionIDForThread = _o.createdReportActionIDForThread, actionableWhisperReportActionIDParam = _o.actionableWhisperReportActionIDParam, onyxData = _o.onyxData;
    var activeReportID = isMoneyRequestReport ? report.reportID : chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID;
    var recentServerValidatedWaypoints = (0, Transaction_1.getRecentWaypoints)().filter(function (item) { return !item.pendingAction; });
    (_d = onyxData === null || onyxData === void 0 ? void 0 : onyxData.failureData) === null || _d === void 0 ? void 0 : _d.push({
        onyxMethod: react_native_onyx_1.default.METHOD.SET,
        key: "".concat(ONYXKEYS_1.default.NVP_RECENT_WAYPOINTS),
        value: recentServerValidatedWaypoints,
    });
    var mileageRate = (0, TransactionUtils_1.isCustomUnitRateIDForP2P)(transaction) ? undefined : customUnitRateID;
    if (shouldPlaySound) {
        (0, Sound_1.default)(Sound_1.SOUNDS.DONE);
    }
    switch (action) {
        case CONST_1.default.IOU.ACTION.CATEGORIZE: {
            if (!linkedTrackedExpenseReportAction || !linkedTrackedExpenseReportID) {
                return;
            }
            var transactionParams = {
                transactionID: transaction === null || transaction === void 0 ? void 0 : transaction.transactionID,
                amount: amount,
                currency: currency,
                comment: comment,
                merchant: merchant,
                created: created,
                taxCode: taxCode,
                taxAmount: taxAmount,
                category: category,
                tag: tag,
                billable: billable,
                receipt: (0, isFileUploadable_1.default)(trackedReceipt) ? trackedReceipt : undefined,
                waypoints: sanitizedWaypoints,
                customUnitRateID: mileageRate,
                attendees: attendees,
            };
            var policyParams = {
                policyID: chatReport === null || chatReport === void 0 ? void 0 : chatReport.policyID,
                isDraftPolicy: isDraftPolicy,
            };
            var reportInformation = {
                moneyRequestPreviewReportActionID: iouAction === null || iouAction === void 0 ? void 0 : iouAction.reportActionID,
                moneyRequestReportID: iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID,
                moneyRequestCreatedReportActionID: createdIOUReportActionID,
                actionableWhisperReportActionID: actionableWhisperReportActionID,
                linkedTrackedExpenseReportAction: linkedTrackedExpenseReportAction,
                linkedTrackedExpenseReportID: linkedTrackedExpenseReportID,
                transactionThreadReportID: transactionThreadReportID,
                reportPreviewReportActionID: reportPreviewAction === null || reportPreviewAction === void 0 ? void 0 : reportPreviewAction.reportActionID,
                chatReportID: chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID,
            };
            var trackedExpenseParams = {
                onyxData: onyxData,
                reportInformation: reportInformation,
                transactionParams: transactionParams,
                policyParams: policyParams,
                createdWorkspaceParams: createdWorkspaceParams,
            };
            categorizeTrackedExpense(trackedExpenseParams);
            break;
        }
        case CONST_1.default.IOU.ACTION.SHARE: {
            if (!linkedTrackedExpenseReportAction || !linkedTrackedExpenseReportID) {
                return;
            }
            var transactionParams = {
                transactionID: transaction === null || transaction === void 0 ? void 0 : transaction.transactionID,
                amount: amount,
                currency: currency,
                comment: comment,
                merchant: merchant,
                created: created,
                taxCode: taxCode !== null && taxCode !== void 0 ? taxCode : '',
                taxAmount: taxAmount !== null && taxAmount !== void 0 ? taxAmount : 0,
                category: category,
                tag: tag,
                billable: billable,
                receipt: (0, isFileUploadable_1.default)(trackedReceipt) ? trackedReceipt : undefined,
                waypoints: sanitizedWaypoints,
                customUnitRateID: mileageRate,
                attendees: attendees,
            };
            var policyParams = {
                policyID: chatReport === null || chatReport === void 0 ? void 0 : chatReport.policyID,
            };
            var reportInformation = {
                moneyRequestPreviewReportActionID: iouAction === null || iouAction === void 0 ? void 0 : iouAction.reportActionID,
                moneyRequestReportID: iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID,
                moneyRequestCreatedReportActionID: createdIOUReportActionID,
                actionableWhisperReportActionID: actionableWhisperReportActionID,
                linkedTrackedExpenseReportAction: linkedTrackedExpenseReportAction,
                linkedTrackedExpenseReportID: linkedTrackedExpenseReportID,
                transactionThreadReportID: transactionThreadReportID,
                reportPreviewReportActionID: reportPreviewAction === null || reportPreviewAction === void 0 ? void 0 : reportPreviewAction.reportActionID,
                chatReportID: chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID,
            };
            var trackedExpenseParams = {
                onyxData: onyxData,
                reportInformation: reportInformation,
                transactionParams: transactionParams,
                policyParams: policyParams,
                createdWorkspaceParams: createdWorkspaceParams,
                accountantParams: accountantParams,
            };
            shareTrackedExpense(trackedExpenseParams);
            break;
        }
        default: {
            var parameters = {
                amount: amount,
                currency: currency,
                comment: comment,
                created: created,
                merchant: merchant,
                iouReportID: iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID,
                chatReportID: chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID,
                transactionID: transaction === null || transaction === void 0 ? void 0 : transaction.transactionID,
                reportActionID: iouAction === null || iouAction === void 0 ? void 0 : iouAction.reportActionID,
                createdChatReportActionID: createdChatReportActionID,
                createdIOUReportActionID: createdIOUReportActionID,
                reportPreviewReportActionID: reportPreviewAction === null || reportPreviewAction === void 0 ? void 0 : reportPreviewAction.reportActionID,
                receipt: (0, isFileUploadable_1.default)(trackedReceipt) ? trackedReceipt : undefined,
                receiptState: trackedReceipt === null || trackedReceipt === void 0 ? void 0 : trackedReceipt.state,
                category: category,
                tag: tag,
                taxCode: taxCode,
                taxAmount: taxAmount,
                billable: billable,
                // This needs to be a string of JSON because of limitations with the fetch() API and nested objects
                receiptGpsPoints: gpsPoints ? JSON.stringify(gpsPoints) : undefined,
                transactionThreadReportID: transactionThreadReportID,
                createdReportActionIDForThread: createdReportActionIDForThread,
                waypoints: sanitizedWaypoints,
                customUnitRateID: customUnitRateID,
                description: parsedComment,
            };
            if (actionableWhisperReportActionIDParam) {
                parameters.actionableWhisperReportActionID = actionableWhisperReportActionIDParam;
            }
            API.write(types_1.WRITE_COMMANDS.TRACK_EXPENSE, parameters, onyxData);
        }
    }
    if (shouldHandleNavigation) {
        react_native_1.InteractionManager.runAfterInteractions(function () { return (0, TransactionEdit_1.removeDraftTransactions)(); });
        if (!params.isRetry) {
            dismissModalAndOpenReportInInboxTab(activeReportID);
        }
    }
    (0, Report_1.notifyNewAction)(activeReportID, payeeAccountID);
}
function getOrCreateOptimisticSplitChatReport(existingSplitChatReportID, participants, participantAccountIDs, currentUserAccountID) {
    var _a;
    // The existing chat report could be passed as reportID or exist on the sole "participant" (in this case a report option)
    var existingChatReportID = existingSplitChatReportID !== null && existingSplitChatReportID !== void 0 ? existingSplitChatReportID : (_a = participants.at(0)) === null || _a === void 0 ? void 0 : _a.reportID;
    // Check if the report is available locally if we do have one
    var existingSplitChatOnyxData = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(existingChatReportID)];
    var existingSplitChatReport = existingChatReportID && existingSplitChatOnyxData ? __assign({}, existingSplitChatOnyxData) : undefined;
    var allParticipantsAccountIDs = __spreadArray(__spreadArray([], participantAccountIDs, true), [currentUserAccountID], false);
    if (!existingSplitChatReport) {
        existingSplitChatReport = (0, ReportUtils_1.getChatByParticipants)(allParticipantsAccountIDs, undefined, participantAccountIDs.length > 1);
    }
    // We found an existing chat report we are done...
    if (existingSplitChatReport) {
        // Yes, these are the same, but give the caller a way to identify if we created a new report or not
        return { existingSplitChatReport: existingSplitChatReport, splitChatReport: existingSplitChatReport };
    }
    // Create a Group Chat if we have multiple participants
    if (participants.length > 1) {
        var splitChatReport_1 = (0, ReportUtils_1.buildOptimisticChatReport)({
            participantList: allParticipantsAccountIDs,
            reportName: '',
            chatType: CONST_1.default.REPORT.CHAT_TYPE.GROUP,
            notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
        });
        return { existingSplitChatReport: null, splitChatReport: splitChatReport_1 };
    }
    // Otherwise, create a new 1:1 chat report
    var splitChatReport = (0, ReportUtils_1.buildOptimisticChatReport)({
        participantList: participantAccountIDs,
    });
    return { existingSplitChatReport: null, splitChatReport: splitChatReport };
}
/**
 * Build the Onyx data and IOU split necessary for splitting a bill with 3+ users.
 * 1. Build the optimistic Onyx data for the group chat, i.e. chatReport and iouReportAction creating the former if it doesn't yet exist.
 * 2. Loop over the group chat participant list, building optimistic or updating existing chatReports, iouReports and iouReportActions between the user and each participant.
 * We build both Onyx data and the IOU split that is sent as a request param and is used by Auth to create the chatReports, iouReports and iouReportActions in the database.
 * The IOU split has the following shape:
 *  [
 *      {email: 'currentUser', amount: 100},
 *      {email: 'user2', amount: 100, iouReportID: '100', chatReportID: '110', transactionID: '120', reportActionID: '130'},
 *      {email: 'user3', amount: 100, iouReportID: '200', chatReportID: '210', transactionID: '220', reportActionID: '230'}
 *  ]
 * @param amount - always in the smallest unit of the currency
 * @param existingSplitChatReportID - the report ID where the split expense happens, could be a group chat or a expense chat
 */
function createSplitsAndOnyxData(_a) {
    var _b, _c, _d, _e, _f, _g;
    var _h, _j;
    var participants = _a.participants, currentUserLogin = _a.currentUserLogin, currentUserAccountID = _a.currentUserAccountID, existingSplitChatReportID = _a.existingSplitChatReportID, _k = _a.transactionParams, amount = _k.amount, comment = _k.comment, currency = _k.currency, merchant = _k.merchant, created = _k.created, category = _k.category, tag = _k.tag, _l = _k.splitShares, splitShares = _l === void 0 ? {} : _l, _m = _k.billable, billable = _m === void 0 ? false : _m, _o = _k.iouRequestType, iouRequestType = _o === void 0 ? CONST_1.default.IOU.REQUEST_TYPE.MANUAL : _o, _p = _k.taxCode, taxCode = _p === void 0 ? '' : _p, _q = _k.taxAmount, taxAmount = _q === void 0 ? 0 : _q, attendees = _k.attendees;
    var currentUserEmailForIOUSplit = (0, PhoneNumber_1.addSMSDomainIfPhoneNumber)(currentUserLogin);
    var participantAccountIDs = participants.map(function (participant) { return Number(participant.accountID); });
    var _r = getOrCreateOptimisticSplitChatReport(existingSplitChatReportID, participants, participantAccountIDs, currentUserAccountID), splitChatReport = _r.splitChatReport, existingSplitChatReport = _r.existingSplitChatReport;
    var isOwnPolicyExpenseChat = !!splitChatReport.isOwnPolicyExpenseChat;
    // Pass an open receipt so the distance expense will show a map with the route optimistically
    var receipt = iouRequestType === CONST_1.default.IOU.REQUEST_TYPE.DISTANCE ? { source: receipt_generic_png_1.default, state: CONST_1.default.IOU.RECEIPT_STATE.OPEN } : undefined;
    var existingTransaction = allTransactionDrafts["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID)];
    var isDistanceRequest = existingTransaction && existingTransaction.iouRequestType === CONST_1.default.IOU.REQUEST_TYPE.DISTANCE;
    var splitTransaction = (0, TransactionUtils_1.buildOptimisticTransaction)({
        existingTransaction: existingTransaction,
        transactionParams: {
            amount: amount,
            currency: currency,
            reportID: CONST_1.default.REPORT.SPLIT_REPORT_ID,
            comment: comment,
            created: created,
            merchant: merchant || Localize.translateLocal('iou.expense'),
            receipt: receipt,
            category: category,
            tag: tag,
            taxCode: taxCode,
            taxAmount: taxAmount,
            billable: billable,
            pendingFields: isDistanceRequest ? { waypoints: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD } : undefined,
            attendees: attendees,
        },
    });
    // Important data is set on the draft distance transaction, such as the iouRequestType marking it as a distance request, so merge it into the optimistic split transaction
    if (isDistanceRequest) {
        splitTransaction = (0, expensify_common_1.fastMerge)(existingTransaction, splitTransaction, false);
    }
    // Note: The created action must be optimistically generated before the IOU action so there's no chance that the created action appears after the IOU action in the chat
    var splitCreatedReportAction = (0, ReportUtils_1.buildOptimisticCreatedReportAction)(currentUserEmailForIOUSplit);
    var splitIOUReportAction = (0, ReportUtils_1.buildOptimisticIOUReportAction)({
        type: CONST_1.default.IOU.REPORT_ACTION_TYPE.SPLIT,
        amount: amount,
        currency: currency,
        comment: comment,
        participants: participants,
        transactionID: splitTransaction.transactionID,
        isOwnPolicyExpenseChat: isOwnPolicyExpenseChat,
    });
    splitChatReport.lastReadTime = DateUtils_1.default.getDBTime();
    splitChatReport.lastMessageText = (0, ReportActionsUtils_1.getReportActionText)(splitIOUReportAction);
    splitChatReport.lastMessageHtml = (0, ReportActionsUtils_1.getReportActionHtml)(splitIOUReportAction);
    splitChatReport.lastActorAccountID = currentUserAccountID;
    splitChatReport.lastVisibleActionCreated = splitIOUReportAction.created;
    if (splitChatReport.participants && (0, ReportUtils_1.getReportNotificationPreference)(splitChatReport) === CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN) {
        splitChatReport.participants[currentUserAccountID] = { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS };
    }
    // If we have an existing splitChatReport (group chat or workspace) use it's pending fields, otherwise indicate that we are adding a chat
    if (!existingSplitChatReport) {
        splitChatReport.pendingFields = {
            createChat: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        };
    }
    var optimisticData = [
        {
            // Use set for new reports because it doesn't exist yet, is faster,
            // and we need the data to be available when we navigate to the chat page
            onyxMethod: existingSplitChatReport ? react_native_onyx_1.default.METHOD.MERGE : react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(splitChatReport.reportID),
            value: splitChatReport,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: ONYXKEYS_1.default.NVP_QUICK_ACTION_GLOBAL_CREATE,
            value: {
                action: iouRequestType === CONST_1.default.IOU.REQUEST_TYPE.DISTANCE ? CONST_1.default.QUICK_ACTIONS.SPLIT_DISTANCE : CONST_1.default.QUICK_ACTIONS.SPLIT_MANUAL,
                chatReportID: splitChatReport.reportID,
                isFirstQuickAction: (0, EmptyObject_1.isEmptyObject)(quickAction),
            },
        },
        existingSplitChatReport
            ? {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(splitChatReport.reportID),
                value: (_b = {},
                    _b[splitIOUReportAction.reportActionID] = splitIOUReportAction,
                    _b),
            }
            : {
                onyxMethod: react_native_onyx_1.default.METHOD.SET,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(splitChatReport.reportID),
                value: (_c = {},
                    _c[splitCreatedReportAction.reportActionID] = splitCreatedReportAction,
                    _c[splitIOUReportAction.reportActionID] = splitIOUReportAction,
                    _c),
            },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(splitTransaction.transactionID),
            value: splitTransaction,
        },
    ];
    if (!existingSplitChatReport) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(splitChatReport.reportID),
            value: {
                isOptimisticReport: true,
            },
        });
    }
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(splitChatReport.reportID),
            value: __assign(__assign({}, (existingSplitChatReport ? {} : (_d = {}, _d[splitCreatedReportAction.reportActionID] = { pendingAction: null }, _d))), (_e = {}, _e[splitIOUReportAction.reportActionID] = { pendingAction: null }, _e)),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(splitTransaction.transactionID),
            value: { pendingAction: null, pendingFields: null },
        },
    ];
    if (!existingSplitChatReport) {
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(splitChatReport.reportID),
            value: {
                isOptimisticReport: false,
            },
        });
    }
    var redundantParticipants = {};
    if (!existingSplitChatReport) {
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(splitChatReport.reportID),
            value: { pendingFields: { createChat: null }, participants: redundantParticipants },
        });
    }
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(splitTransaction.transactionID),
            value: {
                errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.genericCreateFailureMessage'),
                pendingAction: null,
                pendingFields: null,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: ONYXKEYS_1.default.NVP_QUICK_ACTION_GLOBAL_CREATE,
            value: quickAction !== null && quickAction !== void 0 ? quickAction : null,
        },
    ];
    if (existingSplitChatReport) {
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(splitChatReport.reportID),
            value: (_f = {},
                _f[splitIOUReportAction.reportActionID] = {
                    errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.genericCreateFailureMessage'),
                },
                _f),
        });
    }
    else {
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(splitChatReport.reportID),
            value: {
                errorFields: {
                    createChat: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('report.genericCreateReportFailureMessage'),
                },
            },
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(splitChatReport.reportID),
            value: (_g = {},
                _g[splitIOUReportAction.reportActionID] = {
                    errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.genericCreateFailureMessage'),
                },
                _g),
        });
    }
    // Loop through participants creating individual chats, iouReports and reportActionIDs as needed
    var currentUserAmount = (_j = (_h = splitShares === null || splitShares === void 0 ? void 0 : splitShares[currentUserAccountID]) === null || _h === void 0 ? void 0 : _h.amount) !== null && _j !== void 0 ? _j : (0, IOUUtils_1.calculateAmount)(participants.length, amount, currency, true);
    var currentUserTaxAmount = (0, IOUUtils_1.calculateAmount)(participants.length, taxAmount, currency, true);
    var splits = [{ email: currentUserEmailForIOUSplit, accountID: currentUserAccountID, amount: currentUserAmount, taxAmount: currentUserTaxAmount }];
    var hasMultipleParticipants = participants.length > 1;
    participants.forEach(function (participant) {
        var _a;
        var _b, _c, _d, _e;
        // In a case when a participant is a workspace, even when a current user is not an owner of the workspace
        var isPolicyExpenseChat = (0, ReportUtils_1.isPolicyExpenseChat)(participant);
        var splitAmount = (_d = (_c = splitShares === null || splitShares === void 0 ? void 0 : splitShares[(_b = participant.accountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID]) === null || _c === void 0 ? void 0 : _c.amount) !== null && _d !== void 0 ? _d : (0, IOUUtils_1.calculateAmount)(participants.length, amount, currency, false);
        var splitTaxAmount = (0, IOUUtils_1.calculateAmount)(participants.length, taxAmount, currency, false);
        // To exclude someone from a split, the amount can be 0. The scenario for this is when creating a split from a group chat, we have remove the option to deselect users to exclude them.
        // We can input '0' next to someone we want to exclude.
        if (splitAmount === 0) {
            return;
        }
        // In case the participant is a workspace, email & accountID should remain undefined and won't be used in the rest of this code
        // participant.login is undefined when the request is initiated from a group DM with an unknown user, so we need to add a default
        var email = isOwnPolicyExpenseChat || isPolicyExpenseChat ? '' : (0, PhoneNumber_1.addSMSDomainIfPhoneNumber)((_e = participant.login) !== null && _e !== void 0 ? _e : '').toLowerCase();
        var accountID = isOwnPolicyExpenseChat || isPolicyExpenseChat ? 0 : Number(participant.accountID);
        if (email === currentUserEmailForIOUSplit) {
            return;
        }
        // STEP 1: Get existing chat report OR build a new optimistic one
        // If we only have one participant and the request was initiated from the global create menu, i.e. !existingGroupChatReportID, the oneOnOneChatReport is the groupChatReport
        var oneOnOneChatReport;
        var isNewOneOnOneChatReport = false;
        var shouldCreateOptimisticPersonalDetails = false;
        var personalDetailExists = accountID in allPersonalDetails;
        // If this is a split between two people only and the function
        // wasn't provided with an existing group chat report id
        // or, if the split is being made from the expense chat, then the oneOnOneChatReport is the same as the splitChatReport
        // in this case existingSplitChatReport will belong to the policy expense chat and we won't be
        // entering code that creates optimistic personal details
        if ((!hasMultipleParticipants && !existingSplitChatReportID) || isOwnPolicyExpenseChat || (0, ReportUtils_1.isOneOnOneChat)(splitChatReport)) {
            oneOnOneChatReport = splitChatReport;
            shouldCreateOptimisticPersonalDetails = !existingSplitChatReport && !personalDetailExists;
        }
        else {
            var existingChatReport = (0, ReportUtils_1.getChatByParticipants)([accountID, currentUserAccountID]);
            isNewOneOnOneChatReport = !existingChatReport;
            shouldCreateOptimisticPersonalDetails = isNewOneOnOneChatReport && !personalDetailExists;
            oneOnOneChatReport =
                existingChatReport !== null && existingChatReport !== void 0 ? existingChatReport : (0, ReportUtils_1.buildOptimisticChatReport)({
                    participantList: [accountID, currentUserAccountID],
                });
        }
        // STEP 2: Get existing IOU/Expense report and update its total OR build a new optimistic one
        var oneOnOneIOUReport = oneOnOneChatReport.iouReportID ? allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(oneOnOneChatReport.iouReportID)] : null;
        var isScanRequest = (0, TransactionUtils_1.isScanRequest)(splitTransaction);
        var shouldCreateNewOneOnOneIOUReport = (0, ReportUtils_1.shouldCreateNewMoneyRequestReport)(oneOnOneIOUReport, oneOnOneChatReport, isScanRequest);
        if (!oneOnOneIOUReport || shouldCreateNewOneOnOneIOUReport) {
            oneOnOneIOUReport = isOwnPolicyExpenseChat
                ? (0, ReportUtils_1.buildOptimisticExpenseReport)(oneOnOneChatReport.reportID, oneOnOneChatReport.policyID, currentUserAccountID, splitAmount, currency)
                : (0, ReportUtils_1.buildOptimisticIOUReport)(currentUserAccountID, accountID, splitAmount, oneOnOneChatReport.reportID, currency);
        }
        else if (isOwnPolicyExpenseChat) {
            // Because of the Expense reports are stored as negative values, we subtract the total from the amount
            if ((oneOnOneIOUReport === null || oneOnOneIOUReport === void 0 ? void 0 : oneOnOneIOUReport.currency) === currency) {
                if (typeof oneOnOneIOUReport.total === 'number') {
                    oneOnOneIOUReport.total -= splitAmount;
                }
                if (typeof oneOnOneIOUReport.unheldTotal === 'number') {
                    oneOnOneIOUReport.unheldTotal -= splitAmount;
                }
            }
        }
        else {
            oneOnOneIOUReport = (0, IOUUtils_1.updateIOUOwnerAndTotal)(oneOnOneIOUReport, currentUserAccountID, splitAmount, currency);
        }
        // STEP 3: Build optimistic transaction
        var oneOnOneTransaction = (0, TransactionUtils_1.buildOptimisticTransaction)({
            originalTransactionID: splitTransaction.transactionID,
            transactionParams: {
                amount: (0, ReportUtils_1.isExpenseReport)(oneOnOneIOUReport) ? -splitAmount : splitAmount,
                currency: currency,
                reportID: oneOnOneIOUReport.reportID,
                comment: comment,
                created: created,
                merchant: merchant || Localize.translateLocal('iou.expense'),
                category: category,
                tag: tag,
                taxCode: taxCode,
                taxAmount: (0, ReportUtils_1.isExpenseReport)(oneOnOneIOUReport) ? -splitTaxAmount : splitTaxAmount,
                billable: billable,
                source: CONST_1.default.IOU.TYPE.SPLIT,
            },
        });
        if (isDistanceRequest) {
            oneOnOneTransaction = (0, expensify_common_1.fastMerge)(existingTransaction, oneOnOneTransaction, false);
        }
        // STEP 4: Build optimistic reportActions. We need:
        // 1. CREATED action for the chatReport
        // 2. CREATED action for the iouReport
        // 3. IOU action for the iouReport
        // 4. Transaction Thread and the CREATED action for it
        // 5. REPORT_PREVIEW action for the chatReport
        var _f = (0, ReportUtils_1.buildOptimisticMoneyRequestEntities)({
            iouReport: oneOnOneIOUReport,
            type: CONST_1.default.IOU.REPORT_ACTION_TYPE.CREATE,
            amount: splitAmount,
            currency: currency,
            comment: comment,
            payeeEmail: currentUserEmailForIOUSplit,
            participants: [participant],
            transactionID: oneOnOneTransaction.transactionID,
        }), oneOnOneCreatedActionForChat = _f[0], oneOnOneCreatedActionForIOU = _f[1], oneOnOneIOUAction = _f[2], optimisticTransactionThread = _f[3], optimisticCreatedActionForTransactionThread = _f[4];
        // Add optimistic personal details for new participants
        var oneOnOnePersonalDetailListAction = shouldCreateOptimisticPersonalDetails
            ? (_a = {},
                _a[accountID] = {
                    accountID: accountID,
                    // Disabling this line since participant.displayName can be an empty string
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    displayName: (0, LocalePhoneNumber_1.formatPhoneNumber)(participant.displayName || email),
                    login: participant.login,
                    isOptimisticPersonalDetail: true,
                },
                _a) : {};
        if (shouldCreateOptimisticPersonalDetails) {
            // BE will send different participants. We clear the optimistic ones to avoid duplicated entries
            redundantParticipants[accountID] = null;
        }
        var oneOnOneReportPreviewAction = getReportPreviewAction(oneOnOneChatReport.reportID, oneOnOneIOUReport.reportID);
        if (oneOnOneReportPreviewAction) {
            oneOnOneReportPreviewAction = (0, ReportUtils_1.updateReportPreview)(oneOnOneIOUReport, oneOnOneReportPreviewAction);
        }
        else {
            oneOnOneReportPreviewAction = (0, ReportUtils_1.buildOptimisticReportPreview)(oneOnOneChatReport, oneOnOneIOUReport);
        }
        // Add category to optimistic policy recently used categories when a participant is a workspace
        var optimisticPolicyRecentlyUsedCategories = isPolicyExpenseChat ? (0, Category_1.buildOptimisticPolicyRecentlyUsedCategories)(participant.policyID, category) : [];
        var optimisticRecentlyUsedCurrencies = (0, Policy_1.buildOptimisticRecentlyUsedCurrencies)(currency);
        // Add tag to optimistic policy recently used tags when a participant is a workspace
        var optimisticPolicyRecentlyUsedTags = isPolicyExpenseChat ? (0, Tag_1.buildOptimisticPolicyRecentlyUsedTags)(participant.policyID, tag) : {};
        // STEP 5: Build Onyx Data
        var _g = buildOnyxDataForMoneyRequest({
            isNewChatReport: isNewOneOnOneChatReport,
            shouldCreateNewMoneyRequestReport: shouldCreateNewOneOnOneIOUReport,
            isOneOnOneSplit: true,
            optimisticParams: {
                chat: {
                    report: oneOnOneChatReport,
                    createdAction: oneOnOneCreatedActionForChat,
                    reportPreviewAction: oneOnOneReportPreviewAction,
                },
                iou: {
                    report: oneOnOneIOUReport,
                    createdAction: oneOnOneCreatedActionForIOU,
                    action: oneOnOneIOUAction,
                },
                transactionParams: {
                    transaction: oneOnOneTransaction,
                    transactionThreadReport: optimisticTransactionThread,
                    transactionThreadCreatedReportAction: optimisticCreatedActionForTransactionThread,
                },
                policyRecentlyUsed: {
                    categories: optimisticPolicyRecentlyUsedCategories,
                    tags: optimisticPolicyRecentlyUsedTags,
                    currencies: optimisticRecentlyUsedCurrencies,
                },
                personalDetailListAction: oneOnOnePersonalDetailListAction,
            },
        }), oneOnOneOptimisticData = _g[0], oneOnOneSuccessData = _g[1], oneOnOneFailureData = _g[2];
        var individualSplit = {
            email: email,
            accountID: accountID,
            isOptimisticAccount: (0, ReportUtils_1.isOptimisticPersonalDetail)(accountID),
            amount: splitAmount,
            iouReportID: oneOnOneIOUReport.reportID,
            chatReportID: oneOnOneChatReport.reportID,
            transactionID: oneOnOneTransaction.transactionID,
            reportActionID: oneOnOneIOUAction.reportActionID,
            createdChatReportActionID: oneOnOneCreatedActionForChat.reportActionID,
            createdIOUReportActionID: oneOnOneCreatedActionForIOU.reportActionID,
            reportPreviewReportActionID: oneOnOneReportPreviewAction.reportActionID,
            transactionThreadReportID: optimisticTransactionThread.reportID,
            createdReportActionIDForThread: optimisticCreatedActionForTransactionThread === null || optimisticCreatedActionForTransactionThread === void 0 ? void 0 : optimisticCreatedActionForTransactionThread.reportActionID,
            taxAmount: splitTaxAmount,
        };
        splits.push(individualSplit);
        optimisticData.push.apply(optimisticData, oneOnOneOptimisticData);
        successData.push.apply(successData, oneOnOneSuccessData);
        failureData.push.apply(failureData, oneOnOneFailureData);
    });
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(splitTransaction.transactionID),
        value: {
            comment: {
                splits: splits.map(function (split) { return ({ accountID: split.accountID, amount: split.amount }); }),
            },
        },
    });
    var splitData = {
        chatReportID: splitChatReport.reportID,
        transactionID: splitTransaction.transactionID,
        reportActionID: splitIOUReportAction.reportActionID,
        policyID: splitChatReport.policyID,
        chatType: splitChatReport.chatType,
    };
    if (!existingSplitChatReport) {
        splitData.createdReportActionID = splitCreatedReportAction.reportActionID;
    }
    return {
        splitData: splitData,
        splits: splits,
        onyxData: { optimisticData: optimisticData, successData: successData, failureData: failureData },
    };
}
/**
 * @param amount - always in smallest currency unit
 * @param existingSplitChatReportID - Either a group DM or a expense chat
 */
function splitBill(_a) {
    var participants = _a.participants, currentUserLogin = _a.currentUserLogin, currentUserAccountID = _a.currentUserAccountID, amount = _a.amount, comment = _a.comment, currency = _a.currency, merchant = _a.merchant, created = _a.created, _b = _a.category, category = _b === void 0 ? '' : _b, _c = _a.tag, tag = _c === void 0 ? '' : _c, _d = _a.billable, billable = _d === void 0 ? false : _d, _e = _a.iouRequestType, iouRequestType = _e === void 0 ? CONST_1.default.IOU.REQUEST_TYPE.MANUAL : _e, existingSplitChatReportID = _a.existingSplitChatReportID, _f = _a.splitShares, splitShares = _f === void 0 ? {} : _f, _g = _a.splitPayerAccountIDs, splitPayerAccountIDs = _g === void 0 ? [] : _g, _h = _a.taxCode, taxCode = _h === void 0 ? '' : _h, _j = _a.taxAmount, taxAmount = _j === void 0 ? 0 : _j;
    var parsedComment = (0, ReportUtils_1.getParsedComment)(comment);
    var _k = createSplitsAndOnyxData({
        participants: participants,
        currentUserLogin: currentUserLogin,
        currentUserAccountID: currentUserAccountID,
        existingSplitChatReportID: existingSplitChatReportID,
        transactionParams: {
            amount: amount,
            comment: parsedComment,
            currency: currency,
            merchant: merchant,
            created: created,
            category: category,
            tag: tag,
            splitShares: splitShares,
            billable: billable,
            iouRequestType: iouRequestType,
            taxCode: taxCode,
            taxAmount: taxAmount,
        },
    }), splitData = _k.splitData, splits = _k.splits, onyxData = _k.onyxData;
    var parameters = {
        reportID: splitData.chatReportID,
        amount: amount,
        splits: JSON.stringify(splits),
        currency: currency,
        comment: parsedComment,
        category: category,
        merchant: merchant,
        created: created,
        tag: tag,
        billable: billable,
        transactionID: splitData.transactionID,
        reportActionID: splitData.reportActionID,
        createdReportActionID: splitData.createdReportActionID,
        policyID: splitData.policyID,
        chatType: splitData.chatType,
        splitPayerAccountIDs: splitPayerAccountIDs,
        taxCode: taxCode,
        taxAmount: taxAmount,
        description: parsedComment,
    };
    (0, Sound_1.default)(Sound_1.SOUNDS.DONE);
    API.write(types_1.WRITE_COMMANDS.SPLIT_BILL, parameters, onyxData);
    react_native_1.InteractionManager.runAfterInteractions(function () { return (0, TransactionEdit_1.removeDraftTransaction)(CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID); });
    dismissModalAndOpenReportInInboxTab(existingSplitChatReportID);
    (0, Report_1.notifyNewAction)(splitData.chatReportID, currentUserAccountID);
}
/**
 * @param amount - always in the smallest currency unit
 */
function splitBillAndOpenReport(_a) {
    var participants = _a.participants, currentUserLogin = _a.currentUserLogin, currentUserAccountID = _a.currentUserAccountID, amount = _a.amount, comment = _a.comment, currency = _a.currency, merchant = _a.merchant, created = _a.created, _b = _a.category, category = _b === void 0 ? '' : _b, _c = _a.tag, tag = _c === void 0 ? '' : _c, _d = _a.billable, billable = _d === void 0 ? false : _d, _e = _a.iouRequestType, iouRequestType = _e === void 0 ? CONST_1.default.IOU.REQUEST_TYPE.MANUAL : _e, _f = _a.splitShares, splitShares = _f === void 0 ? {} : _f, _g = _a.splitPayerAccountIDs, splitPayerAccountIDs = _g === void 0 ? [] : _g, _h = _a.taxCode, taxCode = _h === void 0 ? '' : _h, _j = _a.taxAmount, taxAmount = _j === void 0 ? 0 : _j, existingSplitChatReportID = _a.existingSplitChatReportID;
    var parsedComment = (0, ReportUtils_1.getParsedComment)(comment);
    var _k = createSplitsAndOnyxData({
        participants: participants,
        currentUserLogin: currentUserLogin,
        currentUserAccountID: currentUserAccountID,
        existingSplitChatReportID: existingSplitChatReportID,
        transactionParams: {
            amount: amount,
            comment: parsedComment,
            currency: currency,
            merchant: merchant,
            created: created,
            category: category,
            tag: tag,
            splitShares: splitShares,
            billable: billable,
            iouRequestType: iouRequestType,
            taxCode: taxCode,
            taxAmount: taxAmount,
        },
    }), splitData = _k.splitData, splits = _k.splits, onyxData = _k.onyxData;
    var parameters = {
        reportID: splitData.chatReportID,
        amount: amount,
        splits: JSON.stringify(splits),
        currency: currency,
        merchant: merchant,
        created: created,
        comment: parsedComment,
        category: category,
        tag: tag,
        billable: billable,
        transactionID: splitData.transactionID,
        reportActionID: splitData.reportActionID,
        createdReportActionID: splitData.createdReportActionID,
        policyID: splitData.policyID,
        chatType: splitData.chatType,
        splitPayerAccountIDs: splitPayerAccountIDs,
        taxCode: taxCode,
        taxAmount: taxAmount,
        description: parsedComment,
    };
    (0, Sound_1.default)(Sound_1.SOUNDS.DONE);
    API.write(types_1.WRITE_COMMANDS.SPLIT_BILL_AND_OPEN_REPORT, parameters, onyxData);
    react_native_1.InteractionManager.runAfterInteractions(function () { return (0, TransactionEdit_1.removeDraftTransaction)(CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID); });
    dismissModalAndOpenReportInInboxTab(splitData.chatReportID);
    (0, Report_1.notifyNewAction)(splitData.chatReportID, currentUserAccountID);
}
/** Used exclusively for starting a split expense request that contains a receipt, the split request will be completed once the receipt is scanned
 *  or user enters details manually.
 *
 * @param existingSplitChatReportID - Either a group DM or a expense chat
 */
function startSplitBill(_a) {
    var _b, _c, _d, _e, _f, _g;
    var participants = _a.participants, currentUserLogin = _a.currentUserLogin, currentUserAccountID = _a.currentUserAccountID, comment = _a.comment, receipt = _a.receipt, existingSplitChatReportID = _a.existingSplitChatReportID, _h = _a.billable, billable = _h === void 0 ? false : _h, _j = _a.category, category = _j === void 0 ? '' : _j, _k = _a.tag, tag = _k === void 0 ? '' : _k, currency = _a.currency, _l = _a.taxCode, taxCode = _l === void 0 ? '' : _l, _m = _a.taxAmount, taxAmount = _m === void 0 ? 0 : _m, _o = _a.shouldPlaySound, shouldPlaySound = _o === void 0 ? true : _o;
    var currentUserEmailForIOUSplit = (0, PhoneNumber_1.addSMSDomainIfPhoneNumber)(currentUserLogin);
    var participantAccountIDs = participants.map(function (participant) { return Number(participant.accountID); });
    var _p = getOrCreateOptimisticSplitChatReport(existingSplitChatReportID, participants, participantAccountIDs, currentUserAccountID), splitChatReport = _p.splitChatReport, existingSplitChatReport = _p.existingSplitChatReport;
    var isOwnPolicyExpenseChat = !!splitChatReport.isOwnPolicyExpenseChat;
    var parsedComment = (0, ReportUtils_1.getParsedComment)(comment);
    var filename = receipt.name, source = receipt.source, _q = receipt.state, state = _q === void 0 ? CONST_1.default.IOU.RECEIPT_STATE.SCAN_READY : _q;
    var receiptObject = { state: state, source: source };
    // ReportID is -2 (aka "deleted") on the group transaction
    var splitTransaction = (0, TransactionUtils_1.buildOptimisticTransaction)({
        transactionParams: {
            amount: 0,
            currency: currency,
            reportID: CONST_1.default.REPORT.SPLIT_REPORT_ID,
            comment: parsedComment,
            merchant: CONST_1.default.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
            receipt: receiptObject,
            category: category,
            tag: tag,
            taxCode: taxCode,
            taxAmount: taxAmount,
            billable: billable,
            filename: filename,
        },
    });
    // Note: The created action must be optimistically generated before the IOU action so there's no chance that the created action appears after the IOU action in the chat
    var splitChatCreatedReportAction = (0, ReportUtils_1.buildOptimisticCreatedReportAction)(currentUserEmailForIOUSplit);
    var splitIOUReportAction = (0, ReportUtils_1.buildOptimisticIOUReportAction)({
        type: CONST_1.default.IOU.REPORT_ACTION_TYPE.SPLIT,
        amount: 0,
        currency: CONST_1.default.CURRENCY.USD,
        comment: parsedComment,
        participants: participants,
        transactionID: splitTransaction.transactionID,
        isOwnPolicyExpenseChat: isOwnPolicyExpenseChat,
    });
    splitChatReport.lastReadTime = DateUtils_1.default.getDBTime();
    splitChatReport.lastMessageText = (0, ReportActionsUtils_1.getReportActionText)(splitIOUReportAction);
    splitChatReport.lastMessageHtml = (0, ReportActionsUtils_1.getReportActionHtml)(splitIOUReportAction);
    // If we have an existing splitChatReport (group chat or workspace) use it's pending fields, otherwise indicate that we are adding a chat
    if (!existingSplitChatReport) {
        splitChatReport.pendingFields = {
            createChat: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        };
    }
    var optimisticData = [
        {
            // Use set for new reports because it doesn't exist yet, is faster,
            // and we need the data to be available when we navigate to the chat page
            onyxMethod: existingSplitChatReport ? react_native_onyx_1.default.METHOD.MERGE : react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(splitChatReport.reportID),
            value: splitChatReport,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: ONYXKEYS_1.default.NVP_QUICK_ACTION_GLOBAL_CREATE,
            value: {
                action: CONST_1.default.QUICK_ACTIONS.SPLIT_SCAN,
                chatReportID: splitChatReport.reportID,
                isFirstQuickAction: (0, EmptyObject_1.isEmptyObject)(quickAction),
            },
        },
        existingSplitChatReport
            ? {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(splitChatReport.reportID),
                value: (_b = {},
                    _b[splitIOUReportAction.reportActionID] = splitIOUReportAction,
                    _b),
            }
            : {
                onyxMethod: react_native_onyx_1.default.METHOD.SET,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(splitChatReport.reportID),
                value: (_c = {},
                    _c[splitChatCreatedReportAction.reportActionID] = splitChatCreatedReportAction,
                    _c[splitIOUReportAction.reportActionID] = splitIOUReportAction,
                    _c),
            },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(splitTransaction.transactionID),
            value: splitTransaction,
        },
    ];
    if (!existingSplitChatReport) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(splitChatReport.reportID),
            value: {
                isOptimisticReport: true,
            },
        });
    }
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(splitChatReport.reportID),
            value: __assign(__assign({}, (existingSplitChatReport ? {} : (_d = {}, _d[splitChatCreatedReportAction.reportActionID] = { pendingAction: null }, _d))), (_e = {}, _e[splitIOUReportAction.reportActionID] = { pendingAction: null }, _e)),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(splitTransaction.transactionID),
            value: { pendingAction: null },
        },
    ];
    if (!existingSplitChatReport) {
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(splitChatReport.reportID),
            value: {
                isOptimisticReport: false,
            },
        });
    }
    var redundantParticipants = {};
    if (!existingSplitChatReport) {
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(splitChatReport.reportID),
            value: { pendingFields: { createChat: null }, participants: redundantParticipants },
        });
    }
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(splitTransaction.transactionID),
            value: {
                errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.genericCreateFailureMessage'),
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: ONYXKEYS_1.default.NVP_QUICK_ACTION_GLOBAL_CREATE,
            value: quickAction !== null && quickAction !== void 0 ? quickAction : null,
        },
    ];
    var retryParams = {
        participants: participants.map(function (_a) {
            var icons = _a.icons, rest = __rest(_a, ["icons"]);
            return rest;
        }),
        currentUserLogin: currentUserLogin,
        currentUserAccountID: currentUserAccountID,
        comment: comment,
        receipt: receiptObject,
        existingSplitChatReportID: existingSplitChatReportID,
        billable: billable,
        category: category,
        tag: tag,
        currency: currency,
        taxCode: taxCode,
        taxAmount: taxAmount,
    };
    if (existingSplitChatReport) {
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(splitChatReport.reportID),
            value: (_f = {},
                _f[splitIOUReportAction.reportActionID] = {
                    errors: getReceiptError(receipt, filename, undefined, undefined, CONST_1.default.IOU.ACTION_PARAMS.START_SPLIT_BILL, retryParams),
                },
                _f),
        });
    }
    else {
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(splitChatReport.reportID),
            value: {
                errorFields: {
                    createChat: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('report.genericCreateReportFailureMessage'),
                },
            },
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(splitChatReport.reportID),
            value: (_g = {},
                _g[splitChatCreatedReportAction.reportActionID] = {
                    errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('report.genericCreateReportFailureMessage'),
                },
                _g[splitIOUReportAction.reportActionID] = {
                    errors: getReceiptError(receipt, filename, undefined, undefined, CONST_1.default.IOU.ACTION_PARAMS.START_SPLIT_BILL, retryParams),
                },
                _g),
        });
    }
    var splits = [{ email: currentUserEmailForIOUSplit, accountID: currentUserAccountID }];
    participants.forEach(function (participant) {
        var _a;
        var _b;
        // Disabling this line since participant.login can be an empty string
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        var email = participant.isOwnPolicyExpenseChat ? '' : (0, PhoneNumber_1.addSMSDomainIfPhoneNumber)(participant.login || participant.text || '').toLowerCase();
        var accountID = participant.isOwnPolicyExpenseChat ? 0 : Number(participant.accountID);
        if (email === currentUserEmailForIOUSplit) {
            return;
        }
        // When splitting with a expense chat, we only need to supply the policyID and the workspace reportID as it's needed so we can update the report preview
        if (participant.isOwnPolicyExpenseChat) {
            splits.push({
                policyID: participant.policyID,
                chatReportID: splitChatReport.reportID,
            });
            return;
        }
        var participantPersonalDetails = allPersonalDetails[(_b = participant === null || participant === void 0 ? void 0 : participant.accountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID];
        if (!participantPersonalDetails) {
            optimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
                value: (_a = {},
                    _a[accountID] = {
                        accountID: accountID,
                        // Disabling this line since participant.displayName can be an empty string
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        displayName: (0, LocalePhoneNumber_1.formatPhoneNumber)(participant.displayName || email),
                        // Disabling this line since participant.login can be an empty string
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        login: participant.login || participant.text,
                        isOptimisticPersonalDetail: true,
                    },
                    _a),
            });
            // BE will send different participants. We clear the optimistic ones to avoid duplicated entries
            redundantParticipants[accountID] = null;
        }
        splits.push({
            email: email,
            accountID: accountID,
        });
    });
    participants.forEach(function (participant) {
        var isPolicyExpenseChat = (0, ReportUtils_1.isPolicyExpenseChat)(participant);
        if (!isPolicyExpenseChat) {
            return;
        }
        var optimisticPolicyRecentlyUsedCategories = (0, Category_1.buildOptimisticPolicyRecentlyUsedCategories)(participant.policyID, category);
        var optimisticPolicyRecentlyUsedTags = (0, Tag_1.buildOptimisticPolicyRecentlyUsedTags)(participant.policyID, tag);
        var optimisticRecentlyUsedCurrencies = (0, Policy_1.buildOptimisticRecentlyUsedCurrencies)(currency);
        if (optimisticPolicyRecentlyUsedCategories.length > 0) {
            optimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.SET,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES).concat(participant.policyID),
                value: optimisticPolicyRecentlyUsedCategories,
            });
        }
        if (optimisticRecentlyUsedCurrencies.length > 0) {
            optimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.SET,
                key: ONYXKEYS_1.default.RECENTLY_USED_CURRENCIES,
                value: optimisticRecentlyUsedCurrencies,
            });
        }
        if (!(0, EmptyObject_1.isEmptyObject)(optimisticPolicyRecentlyUsedTags)) {
            optimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_RECENTLY_USED_TAGS).concat(participant.policyID),
                value: optimisticPolicyRecentlyUsedTags,
            });
        }
    });
    // Save the new splits array into the transaction's comment in case the user calls CompleteSplitBill while offline
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(splitTransaction.transactionID),
        value: {
            comment: {
                splits: splits,
            },
        },
    });
    var parameters = __assign(__assign({ chatReportID: splitChatReport.reportID, reportActionID: splitIOUReportAction.reportActionID, transactionID: splitTransaction.transactionID, splits: JSON.stringify(splits), receipt: receipt, comment: parsedComment, category: category, tag: tag, currency: currency, isFromGroupDM: !existingSplitChatReport, billable: billable }, (existingSplitChatReport ? {} : { createdReportActionID: splitChatCreatedReportAction.reportActionID })), { chatType: splitChatReport === null || splitChatReport === void 0 ? void 0 : splitChatReport.chatType, taxCode: taxCode, taxAmount: taxAmount, description: parsedComment });
    if (shouldPlaySound) {
        (0, Sound_1.default)(Sound_1.SOUNDS.DONE);
    }
    API.write(types_1.WRITE_COMMANDS.START_SPLIT_BILL, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
    Navigation_1.default.dismissModalWithReport({ reportID: splitChatReport.reportID });
    (0, Report_1.notifyNewAction)(splitChatReport.reportID, currentUserAccountID);
}
/** Used for editing a split expense while it's still scanning or when SmartScan fails, it completes a split expense started by startSplitBill above.
 *
 * @param chatReportID - The group chat or workspace reportID
 * @param reportAction - The split action that lives in the chatReport above
 * @param updatedTransaction - The updated **draft** split transaction
 * @param sessionAccountID - accountID of the current user
 * @param sessionEmail - email of the current user
 */
function completeSplitBill(chatReportID, reportAction, updatedTransaction, sessionAccountID, sessionEmail) {
    var _a, _b;
    var _c, _d, _e, _f, _g, _h;
    var parsedComment = (0, ReportUtils_1.getParsedComment)((_d = (_c = updatedTransaction === null || updatedTransaction === void 0 ? void 0 : updatedTransaction.comment) === null || _c === void 0 ? void 0 : _c.comment) !== null && _d !== void 0 ? _d : '');
    if (updatedTransaction === null || updatedTransaction === void 0 ? void 0 : updatedTransaction.comment) {
        // eslint-disable-next-line no-param-reassign
        updatedTransaction.comment.comment = parsedComment;
    }
    var currentUserEmailForIOUSplit = (0, PhoneNumber_1.addSMSDomainIfPhoneNumber)(sessionEmail);
    var transactionID = updatedTransaction === null || updatedTransaction === void 0 ? void 0 : updatedTransaction.transactionID;
    var unmodifiedTransaction = allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID)];
    // Save optimistic updated transaction and action
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
            value: __assign(__assign({}, updatedTransaction), { receipt: {
                    state: CONST_1.default.IOU.RECEIPT_STATE.OPEN,
                } }),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(chatReportID),
            value: (_a = {},
                _a[reportAction.reportActionID] = {
                    lastModified: DateUtils_1.default.getDBTime(),
                    originalMessage: {
                        whisperedTo: [],
                    },
                },
                _a),
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
            value: { pendingAction: null },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.SPLIT_TRANSACTION_DRAFT).concat(transactionID),
            value: { pendingAction: null },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
            value: __assign(__assign({}, unmodifiedTransaction), { errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.genericCreateFailureMessage') }),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(chatReportID),
            value: (_b = {},
                _b[reportAction.reportActionID] = __assign(__assign({}, reportAction), { errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.genericCreateFailureMessage') }),
                _b),
        },
    ];
    var splitParticipants = (_f = (_e = updatedTransaction === null || updatedTransaction === void 0 ? void 0 : updatedTransaction.comment) === null || _e === void 0 ? void 0 : _e.splits) !== null && _f !== void 0 ? _f : [];
    var amount = updatedTransaction === null || updatedTransaction === void 0 ? void 0 : updatedTransaction.modifiedAmount;
    var currency = updatedTransaction === null || updatedTransaction === void 0 ? void 0 : updatedTransaction.modifiedCurrency;
    // Exclude the current user when calculating the split amount, `calculateAmount` takes it into account
    var splitAmount = (0, IOUUtils_1.calculateAmount)(splitParticipants.length - 1, amount !== null && amount !== void 0 ? amount : 0, currency !== null && currency !== void 0 ? currency : '', false);
    var splitTaxAmount = (0, IOUUtils_1.calculateAmount)(splitParticipants.length - 1, (_g = updatedTransaction === null || updatedTransaction === void 0 ? void 0 : updatedTransaction.taxAmount) !== null && _g !== void 0 ? _g : 0, currency !== null && currency !== void 0 ? currency : '', false);
    var splits = [{ email: currentUserEmailForIOUSplit }];
    splitParticipants.forEach(function (participant) {
        var _a, _b;
        // Skip creating the transaction for the current user
        if (participant.email === currentUserEmailForIOUSplit) {
            return;
        }
        var isPolicyExpenseChat = !!participant.policyID;
        if (!isPolicyExpenseChat) {
            // In case this is still the optimistic accountID saved in the splits array, return early as we cannot know
            // if there is an existing chat between the split creator and this participant
            // Instead, we will rely on Auth generating the report IDs and the user won't see any optimistic chats or reports created
            var participantPersonalDetails = allPersonalDetails[(_a = participant === null || participant === void 0 ? void 0 : participant.accountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID];
            if (!participantPersonalDetails || participantPersonalDetails.isOptimisticPersonalDetail) {
                splits.push({
                    email: participant.email,
                });
                return;
            }
        }
        var oneOnOneChatReport;
        var isNewOneOnOneChatReport = false;
        if (isPolicyExpenseChat) {
            // The expense chat reportID is saved in the splits array when starting a split expense with a workspace
            oneOnOneChatReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(participant.chatReportID)];
        }
        else {
            var existingChatReport = (0, ReportUtils_1.getChatByParticipants)(participant.accountID ? [participant.accountID, sessionAccountID] : []);
            isNewOneOnOneChatReport = !existingChatReport;
            oneOnOneChatReport =
                existingChatReport !== null && existingChatReport !== void 0 ? existingChatReport : (0, ReportUtils_1.buildOptimisticChatReport)({
                    participantList: participant.accountID ? [participant.accountID, sessionAccountID] : [],
                });
        }
        var oneOnOneIOUReport = (oneOnOneChatReport === null || oneOnOneChatReport === void 0 ? void 0 : oneOnOneChatReport.iouReportID) ? allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(oneOnOneChatReport.iouReportID)] : null;
        var shouldCreateNewOneOnOneIOUReport = (0, ReportUtils_1.shouldCreateNewMoneyRequestReport)(oneOnOneIOUReport, oneOnOneChatReport, false);
        if (!oneOnOneIOUReport || shouldCreateNewOneOnOneIOUReport) {
            oneOnOneIOUReport = isPolicyExpenseChat
                ? (0, ReportUtils_1.buildOptimisticExpenseReport)(oneOnOneChatReport === null || oneOnOneChatReport === void 0 ? void 0 : oneOnOneChatReport.reportID, participant.policyID, sessionAccountID, splitAmount, currency !== null && currency !== void 0 ? currency : '')
                : (0, ReportUtils_1.buildOptimisticIOUReport)(sessionAccountID, (_b = participant.accountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID, splitAmount, oneOnOneChatReport === null || oneOnOneChatReport === void 0 ? void 0 : oneOnOneChatReport.reportID, currency !== null && currency !== void 0 ? currency : '');
        }
        else if (isPolicyExpenseChat) {
            if (typeof (oneOnOneIOUReport === null || oneOnOneIOUReport === void 0 ? void 0 : oneOnOneIOUReport.total) === 'number') {
                // Because of the Expense reports are stored as negative values, we subtract the total from the amount
                oneOnOneIOUReport.total -= splitAmount;
            }
        }
        else {
            oneOnOneIOUReport = (0, IOUUtils_1.updateIOUOwnerAndTotal)(oneOnOneIOUReport, sessionAccountID, splitAmount, currency !== null && currency !== void 0 ? currency : '');
        }
        var oneOnOneTransaction = (0, TransactionUtils_1.buildOptimisticTransaction)({
            originalTransactionID: transactionID,
            transactionParams: {
                amount: isPolicyExpenseChat ? -splitAmount : splitAmount,
                currency: currency !== null && currency !== void 0 ? currency : '',
                reportID: oneOnOneIOUReport === null || oneOnOneIOUReport === void 0 ? void 0 : oneOnOneIOUReport.reportID,
                comment: parsedComment,
                created: updatedTransaction === null || updatedTransaction === void 0 ? void 0 : updatedTransaction.modifiedCreated,
                merchant: updatedTransaction === null || updatedTransaction === void 0 ? void 0 : updatedTransaction.modifiedMerchant,
                receipt: __assign(__assign({}, updatedTransaction === null || updatedTransaction === void 0 ? void 0 : updatedTransaction.receipt), { state: CONST_1.default.IOU.RECEIPT_STATE.OPEN }),
                category: updatedTransaction === null || updatedTransaction === void 0 ? void 0 : updatedTransaction.category,
                tag: updatedTransaction === null || updatedTransaction === void 0 ? void 0 : updatedTransaction.tag,
                taxCode: updatedTransaction === null || updatedTransaction === void 0 ? void 0 : updatedTransaction.taxCode,
                taxAmount: isPolicyExpenseChat ? -splitTaxAmount : splitAmount,
                billable: updatedTransaction === null || updatedTransaction === void 0 ? void 0 : updatedTransaction.billable,
                source: CONST_1.default.IOU.TYPE.SPLIT,
                filename: updatedTransaction === null || updatedTransaction === void 0 ? void 0 : updatedTransaction.filename,
            },
        });
        var _c = (0, ReportUtils_1.buildOptimisticMoneyRequestEntities)({
            iouReport: oneOnOneIOUReport,
            type: CONST_1.default.IOU.REPORT_ACTION_TYPE.CREATE,
            amount: splitAmount,
            currency: currency !== null && currency !== void 0 ? currency : '',
            comment: parsedComment,
            payeeEmail: currentUserEmailForIOUSplit,
            participants: [participant],
            transactionID: oneOnOneTransaction.transactionID,
        }), oneOnOneCreatedActionForChat = _c[0], oneOnOneCreatedActionForIOU = _c[1], oneOnOneIOUAction = _c[2], optimisticTransactionThread = _c[3], optimisticCreatedActionForTransactionThread = _c[4];
        var oneOnOneReportPreviewAction = getReportPreviewAction(oneOnOneChatReport === null || oneOnOneChatReport === void 0 ? void 0 : oneOnOneChatReport.reportID, oneOnOneIOUReport === null || oneOnOneIOUReport === void 0 ? void 0 : oneOnOneIOUReport.reportID);
        if (oneOnOneReportPreviewAction) {
            oneOnOneReportPreviewAction = (0, ReportUtils_1.updateReportPreview)(oneOnOneIOUReport, oneOnOneReportPreviewAction);
        }
        else {
            oneOnOneReportPreviewAction = (0, ReportUtils_1.buildOptimisticReportPreview)(oneOnOneChatReport, oneOnOneIOUReport, '', oneOnOneTransaction);
        }
        var _d = buildOnyxDataForMoneyRequest({
            isNewChatReport: isNewOneOnOneChatReport,
            isOneOnOneSplit: true,
            shouldCreateNewMoneyRequestReport: shouldCreateNewOneOnOneIOUReport,
            optimisticParams: {
                chat: {
                    report: oneOnOneChatReport,
                    createdAction: oneOnOneCreatedActionForChat,
                    reportPreviewAction: oneOnOneReportPreviewAction,
                },
                iou: {
                    report: oneOnOneIOUReport,
                    createdAction: oneOnOneCreatedActionForIOU,
                    action: oneOnOneIOUAction,
                },
                transactionParams: {
                    transaction: oneOnOneTransaction,
                    transactionThreadReport: optimisticTransactionThread,
                    transactionThreadCreatedReportAction: optimisticCreatedActionForTransactionThread,
                },
                policyRecentlyUsed: {},
            },
        }), oneOnOneOptimisticData = _d[0], oneOnOneSuccessData = _d[1], oneOnOneFailureData = _d[2];
        splits.push({
            email: participant.email,
            accountID: participant.accountID,
            policyID: participant.policyID,
            iouReportID: oneOnOneIOUReport === null || oneOnOneIOUReport === void 0 ? void 0 : oneOnOneIOUReport.reportID,
            chatReportID: oneOnOneChatReport === null || oneOnOneChatReport === void 0 ? void 0 : oneOnOneChatReport.reportID,
            transactionID: oneOnOneTransaction.transactionID,
            reportActionID: oneOnOneIOUAction.reportActionID,
            createdChatReportActionID: oneOnOneCreatedActionForChat.reportActionID,
            createdIOUReportActionID: oneOnOneCreatedActionForIOU.reportActionID,
            reportPreviewReportActionID: oneOnOneReportPreviewAction.reportActionID,
            transactionThreadReportID: optimisticTransactionThread.reportID,
            createdReportActionIDForThread: optimisticCreatedActionForTransactionThread === null || optimisticCreatedActionForTransactionThread === void 0 ? void 0 : optimisticCreatedActionForTransactionThread.reportActionID,
        });
        optimisticData.push.apply(optimisticData, oneOnOneOptimisticData);
        successData.push.apply(successData, oneOnOneSuccessData);
        failureData.push.apply(failureData, oneOnOneFailureData);
    });
    var _j = (_h = (0, ReportUtils_1.getTransactionDetails)(updatedTransaction)) !== null && _h !== void 0 ? _h : {}, transactionAmount = _j.amount, transactionCurrency = _j.currency, transactionCreated = _j.created, transactionMerchant = _j.merchant, transactionComment = _j.comment, transactionCategory = _j.category, transactionTag = _j.tag, transactionTaxCode = _j.taxCode, transactionTaxAmount = _j.taxAmount, transactionBillable = _j.billable;
    var parameters = {
        transactionID: transactionID,
        amount: transactionAmount,
        currency: transactionCurrency,
        created: transactionCreated,
        merchant: transactionMerchant,
        comment: transactionComment,
        category: transactionCategory,
        tag: transactionTag,
        splits: JSON.stringify(splits),
        taxCode: transactionTaxCode,
        taxAmount: transactionTaxAmount,
        billable: transactionBillable,
        description: parsedComment,
    };
    (0, Sound_1.default)(Sound_1.SOUNDS.DONE);
    API.write(types_1.WRITE_COMMANDS.COMPLETE_SPLIT_BILL, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
    react_native_1.InteractionManager.runAfterInteractions(function () { return (0, TransactionEdit_1.removeDraftTransaction)(CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID); });
    dismissModalAndOpenReportInInboxTab(chatReportID);
    (0, Report_1.notifyNewAction)(chatReportID, sessionAccountID);
}
function setDraftSplitTransaction(transactionID, transactionChanges, policy) {
    if (transactionChanges === void 0) { transactionChanges = {}; }
    if (!transactionID) {
        return undefined;
    }
    var draftSplitTransaction = allDraftSplitTransactions["".concat(ONYXKEYS_1.default.COLLECTION.SPLIT_TRANSACTION_DRAFT).concat(transactionID)];
    if (!draftSplitTransaction) {
        draftSplitTransaction = allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID)];
    }
    var updatedTransaction = draftSplitTransaction
        ? (0, TransactionUtils_1.getUpdatedTransaction)({
            transaction: draftSplitTransaction,
            transactionChanges: transactionChanges,
            isFromExpenseReport: false,
            shouldUpdateReceiptState: false,
            policy: policy,
        })
        : null;
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.SPLIT_TRANSACTION_DRAFT).concat(transactionID), updatedTransaction);
}
/** Requests money based on a distance (e.g. mileage from a map) */
function createDistanceRequest(distanceRequestInformation) {
    var _a, _b;
    var report = distanceRequestInformation.report, participants = distanceRequestInformation.participants, _c = distanceRequestInformation.currentUserLogin, currentUserLogin = _c === void 0 ? '' : _c, _d = distanceRequestInformation.currentUserAccountID, currentUserAccountID = _d === void 0 ? -1 : _d, _e = distanceRequestInformation.iouType, iouType = _e === void 0 ? CONST_1.default.IOU.TYPE.SUBMIT : _e, existingTransaction = distanceRequestInformation.existingTransaction, transactionParams = distanceRequestInformation.transactionParams, _f = distanceRequestInformation.policyParams, policyParams = _f === void 0 ? {} : _f, backToReport = distanceRequestInformation.backToReport;
    var policy = policyParams.policy, policyCategories = policyParams.policyCategories, policyTagList = policyParams.policyTagList;
    var parsedComment = (0, ReportUtils_1.getParsedComment)(transactionParams.comment);
    transactionParams.comment = parsedComment;
    var amount = transactionParams.amount, comment = transactionParams.comment, currency = transactionParams.currency, created = transactionParams.created, category = transactionParams.category, tag = transactionParams.tag, taxAmount = transactionParams.taxAmount, taxCode = transactionParams.taxCode, merchant = transactionParams.merchant, billable = transactionParams.billable, validWaypoints = transactionParams.validWaypoints, _g = transactionParams.customUnitRateID, customUnitRateID = _g === void 0 ? '' : _g, _h = transactionParams.splitShares, splitShares = _h === void 0 ? {} : _h, attendees = transactionParams.attendees;
    // If the report is an iou or expense report, we should get the linked chat report to be passed to the getMoneyRequestInformation function
    var isMoneyRequestReport = (0, ReportUtils_1.isMoneyRequestReport)(report);
    var currentChatReport = isMoneyRequestReport ? (0, ReportUtils_1.getReportOrDraftReport)(report === null || report === void 0 ? void 0 : report.chatReportID) : report;
    var moneyRequestReportID = isMoneyRequestReport ? report === null || report === void 0 ? void 0 : report.reportID : '';
    var optimisticReceipt = {
        source: receipt_generic_png_1.default,
        state: CONST_1.default.IOU.RECEIPT_STATE.OPEN,
    };
    var parameters;
    var onyxData;
    var sanitizedWaypoints = (0, Transaction_1.sanitizeRecentWaypoints)(validWaypoints);
    if (iouType === CONST_1.default.IOU.TYPE.SPLIT) {
        var _j = createSplitsAndOnyxData({
            participants: participants,
            currentUserLogin: currentUserLogin !== null && currentUserLogin !== void 0 ? currentUserLogin : '',
            currentUserAccountID: currentUserAccountID,
            existingSplitChatReportID: report === null || report === void 0 ? void 0 : report.reportID,
            transactionParams: {
                amount: amount,
                comment: comment,
                currency: currency,
                merchant: merchant,
                created: created,
                category: category !== null && category !== void 0 ? category : '',
                tag: tag !== null && tag !== void 0 ? tag : '',
                splitShares: splitShares,
                billable: billable,
                iouRequestType: CONST_1.default.IOU.REQUEST_TYPE.DISTANCE,
                taxCode: taxCode,
                taxAmount: taxAmount,
                attendees: attendees,
            },
        }), splitData = _j.splitData, splits = _j.splits, splitOnyxData = _j.onyxData;
        onyxData = splitOnyxData;
        // Splits don't use the IOU report param. The split transaction isn't linked to a report shown in the UI, it's linked to a special default reportID of -2.
        // Therefore, any params related to the IOU report are irrelevant and omitted below.
        parameters = {
            transactionID: splitData.transactionID,
            chatReportID: splitData.chatReportID,
            createdChatReportActionID: splitData.createdReportActionID,
            reportActionID: splitData.reportActionID,
            waypoints: JSON.stringify(sanitizedWaypoints),
            customUnitRateID: customUnitRateID,
            comment: comment,
            created: created,
            category: category,
            tag: tag,
            taxCode: taxCode,
            taxAmount: taxAmount,
            billable: billable,
            splits: JSON.stringify(splits),
            chatType: splitData.chatType,
            description: parsedComment,
            attendees: attendees ? JSON.stringify(attendees) : undefined,
        };
    }
    else {
        var participant = (_a = participants.at(0)) !== null && _a !== void 0 ? _a : {};
        var _k = getMoneyRequestInformation({
            parentChatReport: currentChatReport,
            existingTransaction: existingTransaction,
            moneyRequestReportID: moneyRequestReportID,
            participantParams: {
                participant: participant,
                payeeAccountID: userAccountID,
                payeeEmail: currentUserEmail,
            },
            policyParams: {
                policy: policy,
                policyCategories: policyCategories,
                policyTagList: policyTagList,
            },
            transactionParams: {
                amount: amount,
                currency: currency,
                comment: comment,
                created: created,
                merchant: merchant,
                receipt: optimisticReceipt,
                category: category,
                tag: tag,
                taxCode: taxCode,
                taxAmount: taxAmount,
                billable: billable,
                attendees: attendees,
            },
        }), iouReport = _k.iouReport, chatReport = _k.chatReport, transaction = _k.transaction, iouAction = _k.iouAction, createdChatReportActionID = _k.createdChatReportActionID, createdIOUReportActionID = _k.createdIOUReportActionID, reportPreviewAction = _k.reportPreviewAction, transactionThreadReportID = _k.transactionThreadReportID, createdReportActionIDForThread = _k.createdReportActionIDForThread, payerEmail = _k.payerEmail, moneyRequestOnyxData = _k.onyxData;
        onyxData = moneyRequestOnyxData;
        parameters = {
            comment: comment,
            iouReportID: iouReport.reportID,
            chatReportID: chatReport.reportID,
            transactionID: transaction.transactionID,
            reportActionID: iouAction.reportActionID,
            createdChatReportActionID: createdChatReportActionID,
            createdIOUReportActionID: createdIOUReportActionID,
            reportPreviewReportActionID: reportPreviewAction.reportActionID,
            waypoints: JSON.stringify(sanitizedWaypoints),
            created: created,
            category: category,
            tag: tag,
            taxCode: taxCode,
            taxAmount: taxAmount,
            billable: billable,
            transactionThreadReportID: transactionThreadReportID,
            createdReportActionIDForThread: createdReportActionIDForThread,
            payerEmail: payerEmail,
            customUnitRateID: customUnitRateID,
            description: parsedComment,
            attendees: attendees ? JSON.stringify(attendees) : undefined,
        };
    }
    var recentServerValidatedWaypoints = (0, Transaction_1.getRecentWaypoints)().filter(function (item) { return !item.pendingAction; });
    (_b = onyxData === null || onyxData === void 0 ? void 0 : onyxData.failureData) === null || _b === void 0 ? void 0 : _b.push({
        onyxMethod: react_native_onyx_1.default.METHOD.SET,
        key: "".concat(ONYXKEYS_1.default.NVP_RECENT_WAYPOINTS),
        value: recentServerValidatedWaypoints,
    });
    (0, Sound_1.default)(Sound_1.SOUNDS.DONE);
    API.write(types_1.WRITE_COMMANDS.CREATE_DISTANCE_REQUEST, parameters, onyxData);
    react_native_1.InteractionManager.runAfterInteractions(function () { return (0, TransactionEdit_1.removeDraftTransaction)(CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID); });
    var activeReportID = isMoneyRequestReport && (report === null || report === void 0 ? void 0 : report.reportID) ? report.reportID : parameters.chatReportID;
    dismissModalAndOpenReportInInboxTab(backToReport !== null && backToReport !== void 0 ? backToReport : activeReportID);
    if (!isMoneyRequestReport) {
        (0, Report_1.notifyNewAction)(activeReportID, userAccountID);
    }
}
/** Updates the amount and currency fields of an expense */
function updateMoneyRequestAmountAndCurrency(_a) {
    var _b, _c;
    var transactionID = _a.transactionID, transactionThreadReportID = _a.transactionThreadReportID, currency = _a.currency, amount = _a.amount, taxAmount = _a.taxAmount, policy = _a.policy, policyTagList = _a.policyTagList, policyCategories = _a.policyCategories, taxCode = _a.taxCode, _d = _a.allowNegative, allowNegative = _d === void 0 ? false : _d;
    var transactionChanges = {
        amount: amount,
        currency: currency,
        taxCode: taxCode,
        taxAmount: taxAmount,
    };
    var transactionThreadReport = (_b = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadReportID)]) !== null && _b !== void 0 ? _b : null;
    var parentReport = (_c = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.parentReportID)]) !== null && _c !== void 0 ? _c : null;
    var data;
    if ((0, ReportUtils_1.isTrackExpenseReport)(transactionThreadReport) && (0, ReportUtils_1.isSelfDM)(parentReport)) {
        data = getUpdateTrackExpenseParams(transactionID, transactionThreadReportID, transactionChanges, policy);
    }
    else {
        data = getUpdateMoneyRequestParams(transactionID, transactionThreadReportID, transactionChanges, policy, policyTagList !== null && policyTagList !== void 0 ? policyTagList : null, policyCategories !== null && policyCategories !== void 0 ? policyCategories : null, undefined, undefined, allowNegative);
    }
    var params = data.params, onyxData = data.onyxData;
    API.write(types_1.WRITE_COMMANDS.UPDATE_MONEY_REQUEST_AMOUNT_AND_CURRENCY, params, onyxData);
}
/**
 *
 * @param transactionID  - The transactionID of IOU
 * @param reportAction - The reportAction of the transaction in the IOU report
 * @return the url to navigate back once the money request is deleted
 */
function prepareToCleanUpMoneyRequest(transactionID, reportAction, shouldRemoveIOUTransactionID) {
    var _a;
    var _b, _c, _d, _e, _f, _g;
    if (shouldRemoveIOUTransactionID === void 0) { shouldRemoveIOUTransactionID = true; }
    // STEP 1: Get all collections we're updating
    var iouReportID = (0, ReportActionsUtils_1.isMoneyRequestAction)(reportAction) ? (_b = (0, ReportActionsUtils_1.getOriginalMessage)(reportAction)) === null || _b === void 0 ? void 0 : _b.IOUReportID : undefined;
    var iouReport = (_c = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iouReportID)]) !== null && _c !== void 0 ? _c : null;
    var chatReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.chatReportID)];
    var reportPreviewAction = getReportPreviewAction(iouReport === null || iouReport === void 0 ? void 0 : iouReport.chatReportID, iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID);
    var transaction = allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID)];
    var isTransactionOnHold = (0, TransactionUtils_1.isOnHold)(transaction);
    var transactionViolations = allTransactionViolations["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID)];
    var transactionThreadID = reportAction.childReportID;
    var transactionThread = null;
    if (transactionThreadID) {
        transactionThread = (_d = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadID)]) !== null && _d !== void 0 ? _d : null;
    }
    // STEP 2: Decide if we need to:
    // 1. Delete the transactionThread - delete if there are no visible comments in the thread
    // 2. Update the moneyRequestPreview to show [Deleted expense] - update if the transactionThread exists AND it isn't being deleted
    // The current state is that we want to get rid of the [Deleted expense] breadcrumb,
    // so we never want to display it if transactionThreadID is present.
    var shouldDeleteTransactionThread = !!transactionThreadID;
    // STEP 3: Update the IOU reportAction and decide if the iouReport should be deleted. We delete the iouReport if there are no visible comments left in the report.
    var updatedReportAction = (_a = {},
        _a[reportAction.reportActionID] = {
            pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            previousMessage: reportAction.message,
            message: [
                {
                    type: 'COMMENT',
                    html: '',
                    text: '',
                    isEdited: true,
                    isDeletedParentAction: shouldDeleteTransactionThread,
                },
            ],
            originalMessage: {
                IOUTransactionID: shouldRemoveIOUTransactionID ? null : transactionID,
            },
            errors: null,
        },
        _a);
    var canUserPerformWriteAction = true;
    if (chatReport) {
        canUserPerformWriteAction = !!(0, ReportUtils_1.canUserPerformWriteAction)(chatReport);
    }
    // If we are deleting the last transaction on a report, then delete the report too
    var shouldDeleteIOUReport = (0, ReportUtils_1.getReportTransactions)(iouReportID).length === 1;
    // STEP 4: Update the iouReport and reportPreview with new totals and messages if it wasn't deleted
    var updatedIOUReport;
    var currency = (0, TransactionUtils_1.getCurrency)(transaction);
    var updatedReportPreviewAction = __assign({}, reportPreviewAction);
    updatedReportPreviewAction.pendingAction = shouldDeleteIOUReport ? CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE : CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;
    if (iouReport && (0, ReportUtils_1.isExpenseReport)(iouReport)) {
        updatedIOUReport = __assign({}, iouReport);
        if (typeof updatedIOUReport.total === 'number' && currency === (iouReport === null || iouReport === void 0 ? void 0 : iouReport.currency)) {
            // Because of the Expense reports are stored as negative values, we add the total from the amount
            var amountDiff = (0, TransactionUtils_1.getAmount)(transaction, true);
            updatedIOUReport.total += amountDiff;
            if (!(transaction === null || transaction === void 0 ? void 0 : transaction.reimbursable) && typeof updatedIOUReport.nonReimbursableTotal === 'number') {
                updatedIOUReport.nonReimbursableTotal += amountDiff;
            }
            if (!isTransactionOnHold) {
                if (typeof updatedIOUReport.unheldTotal === 'number') {
                    updatedIOUReport.unheldTotal += amountDiff;
                }
                if (!(transaction === null || transaction === void 0 ? void 0 : transaction.reimbursable) && typeof updatedIOUReport.unheldNonReimbursableTotal === 'number') {
                    updatedIOUReport.unheldNonReimbursableTotal += amountDiff;
                }
            }
        }
    }
    else {
        updatedIOUReport = (0, IOUUtils_1.updateIOUOwnerAndTotal)(iouReport, (_e = reportAction.actorAccountID) !== null && _e !== void 0 ? _e : CONST_1.default.DEFAULT_NUMBER_ID, (0, TransactionUtils_1.getAmount)(transaction, false), currency, true, false, isTransactionOnHold);
    }
    if (updatedIOUReport) {
        var lastVisibleAction = (0, ReportActionsUtils_1.getLastVisibleAction)(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID, canUserPerformWriteAction, updatedReportAction);
        var iouReportLastMessageText = (0, ReportActionsUtils_1.getLastVisibleMessage)(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID, canUserPerformWriteAction, updatedReportAction).lastMessageText;
        updatedIOUReport.lastMessageText = iouReportLastMessageText;
        updatedIOUReport.lastVisibleActionCreated = lastVisibleAction === null || lastVisibleAction === void 0 ? void 0 : lastVisibleAction.created;
    }
    var hasNonReimbursableTransactions = (0, ReportUtils_1.hasNonReimbursableTransactions)(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID);
    var messageText = Localize.translateLocal(hasNonReimbursableTransactions ? 'iou.payerSpentAmount' : 'iou.payerOwesAmount', {
        payer: (_g = (0, ReportUtils_1.getPersonalDetailsForAccountID)((_f = updatedIOUReport === null || updatedIOUReport === void 0 ? void 0 : updatedIOUReport.managerID) !== null && _f !== void 0 ? _f : CONST_1.default.DEFAULT_NUMBER_ID).login) !== null && _g !== void 0 ? _g : '',
        amount: (0, CurrencyUtils_1.convertToDisplayString)(updatedIOUReport === null || updatedIOUReport === void 0 ? void 0 : updatedIOUReport.total, updatedIOUReport === null || updatedIOUReport === void 0 ? void 0 : updatedIOUReport.currency),
    });
    if ((0, ReportActionsUtils_1.getReportActionMessage)(updatedReportPreviewAction)) {
        if (Array.isArray(updatedReportPreviewAction === null || updatedReportPreviewAction === void 0 ? void 0 : updatedReportPreviewAction.message)) {
            var message = updatedReportPreviewAction.message.at(0);
            if (message) {
                message.text = messageText;
                message.html = messageText;
                message.deleted = shouldDeleteIOUReport ? DateUtils_1.default.getDBTime() : '';
            }
        }
        else if (!Array.isArray(updatedReportPreviewAction.message) && updatedReportPreviewAction.message) {
            updatedReportPreviewAction.message.text = messageText;
            updatedReportPreviewAction.message.deleted = shouldDeleteIOUReport ? DateUtils_1.default.getDBTime() : '';
        }
    }
    if (updatedReportPreviewAction && (reportPreviewAction === null || reportPreviewAction === void 0 ? void 0 : reportPreviewAction.childMoneyRequestCount) && (reportPreviewAction === null || reportPreviewAction === void 0 ? void 0 : reportPreviewAction.childMoneyRequestCount) > 0) {
        updatedReportPreviewAction.childMoneyRequestCount = reportPreviewAction.childMoneyRequestCount - 1;
    }
    return {
        shouldDeleteTransactionThread: shouldDeleteTransactionThread,
        shouldDeleteIOUReport: shouldDeleteIOUReport,
        updatedReportAction: updatedReportAction,
        updatedIOUReport: updatedIOUReport,
        updatedReportPreviewAction: updatedReportPreviewAction,
        transactionThreadID: transactionThreadID,
        transactionThread: transactionThread,
        chatReport: chatReport,
        transaction: transaction,
        transactionViolations: transactionViolations,
        reportPreviewAction: reportPreviewAction,
        iouReport: iouReport,
    };
}
/**
 * Calculate the URL to navigate to after a money request deletion
 * @param transactionID - The ID of the money request being deleted
 * @param reportAction - The report action associated with the money request
 * @param isSingleTransactionView - whether we are in the transaction thread report
 * @returns The URL to navigate to
 */
function getNavigationUrlOnMoneyRequestDelete(transactionID, reportAction, isSingleTransactionView) {
    if (isSingleTransactionView === void 0) { isSingleTransactionView = false; }
    if (!transactionID) {
        return undefined;
    }
    var _a = prepareToCleanUpMoneyRequest(transactionID, reportAction), shouldDeleteTransactionThread = _a.shouldDeleteTransactionThread, shouldDeleteIOUReport = _a.shouldDeleteIOUReport, iouReport = _a.iouReport;
    // Determine which report to navigate back to
    if (iouReport && isSingleTransactionView && shouldDeleteTransactionThread && !shouldDeleteIOUReport) {
        return ROUTES_1.default.REPORT_WITH_ID.getRoute(iouReport.reportID);
    }
    if ((iouReport === null || iouReport === void 0 ? void 0 : iouReport.chatReportID) && shouldDeleteIOUReport) {
        return ROUTES_1.default.REPORT_WITH_ID.getRoute(iouReport.chatReportID);
    }
    return undefined;
}
/**
 * Calculate the URL to navigate to after a track expense deletion
 * @param chatReportID - The ID of the chat report containing the track expense
 * @param transactionID - The ID of the track expense being deleted
 * @param reportAction - The report action associated with the track expense
 * @param isSingleTransactionView - Whether we're in single transaction view
 * @returns The URL to navigate to
 */
function getNavigationUrlAfterTrackExpenseDelete(chatReportID, transactionID, reportAction, isSingleTransactionView) {
    var _a, _b;
    if (isSingleTransactionView === void 0) { isSingleTransactionView = false; }
    if (!chatReportID || !transactionID) {
        return undefined;
    }
    var chatReport = (_a = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReportID)]) !== null && _a !== void 0 ? _a : null;
    // If not a self DM, handle it as a regular money request
    if (!(0, ReportUtils_1.isSelfDM)(chatReport)) {
        return getNavigationUrlOnMoneyRequestDelete(transactionID, reportAction, isSingleTransactionView);
    }
    var transactionThreadID = reportAction.childReportID;
    var shouldDeleteTransactionThread = transactionThreadID ? ((_b = reportAction === null || reportAction === void 0 ? void 0 : reportAction.childVisibleActionCount) !== null && _b !== void 0 ? _b : 0) === 0 : false;
    // Only navigate if in single transaction view and the thread will be deleted
    if (isSingleTransactionView && shouldDeleteTransactionThread && (chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID)) {
        // Pop the deleted report screen before navigating. This prevents navigating to the Concierge chat due to the missing report.
        return ROUTES_1.default.REPORT_WITH_ID.getRoute(chatReport.reportID);
    }
    return undefined;
}
/**
 *
 * @param transactionID  - The transactionID of IOU
 * @param reportAction - The reportAction of the transaction in the IOU report
 * @param isSingleTransactionView - whether we are in the transaction thread report
 * @return the url to navigate back once the money request is deleted
 */
function cleanUpMoneyRequest(transactionID, reportAction, reportID, isSingleTransactionView) {
    var _a, _b, _c, _d;
    var _e, _f;
    if (isSingleTransactionView === void 0) { isSingleTransactionView = false; }
    var _g = prepareToCleanUpMoneyRequest(transactionID, reportAction, false), shouldDeleteTransactionThread = _g.shouldDeleteTransactionThread, shouldDeleteIOUReport = _g.shouldDeleteIOUReport, updatedReportAction = _g.updatedReportAction, updatedIOUReport = _g.updatedIOUReport, updatedReportPreviewAction = _g.updatedReportPreviewAction, transactionThreadID = _g.transactionThreadID, chatReport = _g.chatReport, iouReport = _g.iouReport, reportPreviewAction = _g.reportPreviewAction;
    var urlToNavigateBack = getNavigationUrlOnMoneyRequestDelete(transactionID, reportAction, isSingleTransactionView);
    // build Onyx data
    // Onyx operations to delete the transaction, update the IOU report action and chat report action
    var reportActionsOnyxUpdates = [];
    var onyxUpdates = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
            value: null,
        },
    ];
    reportActionsOnyxUpdates.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID),
        value: (_a = {},
            _a[reportAction.reportActionID] = shouldDeleteIOUReport
                ? null
                : {
                    pendingAction: null,
                },
            _a),
    });
    if (reportPreviewAction === null || reportPreviewAction === void 0 ? void 0 : reportPreviewAction.reportActionID) {
        reportActionsOnyxUpdates.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID),
            value: (_b = {},
                _b[reportPreviewAction.reportActionID] = __assign(__assign({}, updatedReportPreviewAction), { pendingAction: null, errors: null }),
                _b),
        });
    }
    // added the operation to delete associated transaction violations
    onyxUpdates.push({
        onyxMethod: react_native_onyx_1.default.METHOD.SET,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID),
        value: null,
    });
    // added the operation to delete transaction thread
    if (shouldDeleteTransactionThread) {
        onyxUpdates.push({
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadID),
            value: null,
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionThreadID),
            value: null,
        });
    }
    // added operations to update IOU report and chat report
    reportActionsOnyxUpdates.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID),
        value: updatedReportAction,
    });
    onyxUpdates.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID),
        value: updatedIOUReport,
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID),
        value: (0, ReportUtils_1.getOutstandingChildRequest)(updatedIOUReport),
    });
    if (!shouldDeleteIOUReport && updatedReportPreviewAction.childMoneyRequestCount === 0) {
        onyxUpdates.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID),
            value: {
                hasOutstandingChildRequest: false,
            },
        });
    }
    if (shouldDeleteIOUReport) {
        var canUserPerformWriteAction = true;
        if (chatReport) {
            canUserPerformWriteAction = !!(0, ReportUtils_1.canUserPerformWriteAction)(chatReport);
        }
        var lastMessageText = (_e = (0, ReportActionsUtils_1.getLastVisibleMessage)(iouReport === null || iouReport === void 0 ? void 0 : iouReport.chatReportID, canUserPerformWriteAction, (reportPreviewAction === null || reportPreviewAction === void 0 ? void 0 : reportPreviewAction.reportActionID) ? (_c = {}, _c[reportPreviewAction.reportActionID] = null, _c) : {})) === null || _e === void 0 ? void 0 : _e.lastMessageText;
        var lastVisibleActionCreated = (_f = (0, ReportActionsUtils_1.getLastVisibleAction)(iouReport === null || iouReport === void 0 ? void 0 : iouReport.chatReportID, canUserPerformWriteAction, (reportPreviewAction === null || reportPreviewAction === void 0 ? void 0 : reportPreviewAction.reportActionID) ? (_d = {}, _d[reportPreviewAction.reportActionID] = null, _d) : {})) === null || _f === void 0 ? void 0 : _f.created;
        onyxUpdates.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID),
            value: {
                hasOutstandingChildRequest: false,
                iouReportID: null,
                lastMessageText: lastMessageText,
                lastVisibleActionCreated: lastVisibleActionCreated,
            },
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID),
            value: null,
        });
    }
    (0, ReportActions_1.clearAllRelatedReportActionErrors)(reportID, reportAction);
    // First, update the reportActions to ensure related actions are not displayed.
    react_native_onyx_1.default.update(reportActionsOnyxUpdates).then(function () {
        Navigation_1.default.goBack(urlToNavigateBack);
        react_native_1.InteractionManager.runAfterInteractions(function () {
            // After navigation, update the remaining data.
            react_native_onyx_1.default.update(onyxUpdates);
        });
    });
}
/**
 *
 * @param transactionID  - The transactionID of IOU
 * @param reportAction - The reportAction of the transaction in the IOU report
 * @param isSingleTransactionView - whether we are in the transaction thread report
 * @return the url to navigate back once the money request is deleted
 */
function deleteMoneyRequest(transactionID, reportAction, isSingleTransactionView) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    var _l, _m;
    if (isSingleTransactionView === void 0) { isSingleTransactionView = false; }
    if (!transactionID) {
        return;
    }
    // STEP 1: Calculate and prepare the data
    var _o = prepareToCleanUpMoneyRequest(transactionID, reportAction, false), shouldDeleteTransactionThread = _o.shouldDeleteTransactionThread, shouldDeleteIOUReport = _o.shouldDeleteIOUReport, updatedReportAction = _o.updatedReportAction, updatedIOUReport = _o.updatedIOUReport, updatedReportPreviewAction = _o.updatedReportPreviewAction, transactionThreadID = _o.transactionThreadID, transactionThread = _o.transactionThread, chatReport = _o.chatReport, transaction = _o.transaction, transactionViolations = _o.transactionViolations, iouReport = _o.iouReport, reportPreviewAction = _o.reportPreviewAction;
    var urlToNavigateBack = getNavigationUrlOnMoneyRequestDelete(transactionID, reportAction, isSingleTransactionView);
    // STEP 2: Build Onyx data
    // The logic mostly resembles the cleanUpMoneyRequest function
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
            value: __assign(__assign({}, transaction), { pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE }),
        },
    ];
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.SET,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID),
        value: null,
    });
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
            value: __assign(__assign({}, transaction), { pendingAction: null }),
        },
    ];
    if (transactionViolations) {
        var duplicates = transactionViolations
            .filter(function (violation) { return (violation === null || violation === void 0 ? void 0 : violation.name) === CONST_1.default.VIOLATIONS.DUPLICATED_TRANSACTION; })
            .flatMap(function (violation) { var _a, _b; return (_b = (_a = violation === null || violation === void 0 ? void 0 : violation.data) === null || _a === void 0 ? void 0 : _a.duplicates) !== null && _b !== void 0 ? _b : []; })
            .map(function (id) { return allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(id)]; });
        (0, TransactionUtils_1.removeSettledAndApprovedTransactions)(duplicates).forEach(function (duplicate) {
            var _a;
            var duplicateID = duplicate === null || duplicate === void 0 ? void 0 : duplicate.transactionID;
            var duplicateTransactionsViolations = allTransactionViolations["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(duplicateID)];
            if (!duplicateTransactionsViolations) {
                return;
            }
            var duplicateViolation = duplicateTransactionsViolations.find(function (violation) { return violation.name === CONST_1.default.VIOLATIONS.DUPLICATED_TRANSACTION; });
            if (!((_a = duplicateViolation === null || duplicateViolation === void 0 ? void 0 : duplicateViolation.data) === null || _a === void 0 ? void 0 : _a.duplicates)) {
                return;
            }
            var duplicateTransactionIDs = duplicateViolation.data.duplicates.filter(function (duplicateTransactionID) { return duplicateTransactionID !== transactionID; });
            var optimisticViolations = duplicateTransactionsViolations.filter(function (violation) { return violation.name !== CONST_1.default.VIOLATIONS.DUPLICATED_TRANSACTION; });
            if (duplicateTransactionIDs.length > 0) {
                optimisticViolations.push(__assign(__assign({}, duplicateViolation), { data: __assign(__assign({}, duplicateViolation.data), { duplicates: duplicateTransactionIDs }) }));
            }
            optimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.SET,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(duplicateID),
                value: optimisticViolations.length > 0 ? optimisticViolations : null,
            });
            failureData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.SET,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(duplicateID),
                value: duplicateTransactionsViolations,
            });
        });
    }
    if (shouldDeleteTransactionThread) {
        optimisticData.push(
        // Use merge instead of set to avoid deleting the report too quickly, which could cause a brief "not found" page to appear.
        // The remaining parts of the report object will be removed after the API call is successful.
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadID),
            value: {
                reportID: null,
                stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST_1.default.REPORT.STATUS_NUM.CLOSED,
                participants: (_a = {},
                    _a[userAccountID] = {
                        notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                    },
                    _a),
            },
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionThreadID),
            value: null,
        });
    }
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID),
        value: updatedReportAction,
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID),
        value: updatedIOUReport,
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID),
        value: (0, ReportUtils_1.getOutstandingChildRequest)(updatedIOUReport),
    });
    if (reportPreviewAction === null || reportPreviewAction === void 0 ? void 0 : reportPreviewAction.reportActionID) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID),
            value: (_b = {}, _b[reportPreviewAction.reportActionID] = updatedReportPreviewAction, _b),
        });
    }
    if (!shouldDeleteIOUReport && (updatedReportPreviewAction === null || updatedReportPreviewAction === void 0 ? void 0 : updatedReportPreviewAction.childMoneyRequestCount) === 0) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID),
            value: {
                hasOutstandingChildRequest: false,
            },
        });
    }
    if (shouldDeleteIOUReport) {
        var canUserPerformWriteAction = true;
        if (chatReport) {
            canUserPerformWriteAction = !!(0, ReportUtils_1.canUserPerformWriteAction)(chatReport);
        }
        var lastMessageText = (_l = (0, ReportActionsUtils_1.getLastVisibleMessage)(iouReport === null || iouReport === void 0 ? void 0 : iouReport.chatReportID, canUserPerformWriteAction, (reportPreviewAction === null || reportPreviewAction === void 0 ? void 0 : reportPreviewAction.reportActionID) ? (_c = {}, _c[reportPreviewAction.reportActionID] = null, _c) : {})) === null || _l === void 0 ? void 0 : _l.lastMessageText;
        var lastVisibleActionCreated = (_m = (0, ReportActionsUtils_1.getLastVisibleAction)(iouReport === null || iouReport === void 0 ? void 0 : iouReport.chatReportID, canUserPerformWriteAction, (reportPreviewAction === null || reportPreviewAction === void 0 ? void 0 : reportPreviewAction.reportActionID) ? (_d = {}, _d[reportPreviewAction.reportActionID] = null, _d) : {})) === null || _m === void 0 ? void 0 : _m.created;
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID),
            value: {
                hasOutstandingChildRequest: false,
                iouReportID: null,
                lastMessageText: lastMessageText,
                lastVisibleActionCreated: lastVisibleActionCreated,
            },
        });
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID),
            value: {
                pendingFields: {
                    preview: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
            },
        });
    }
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID),
            value: (_e = {},
                _e[reportAction.reportActionID] = shouldDeleteIOUReport
                    ? null
                    : {
                        pendingAction: null,
                    },
                _e),
        },
    ];
    if (reportPreviewAction === null || reportPreviewAction === void 0 ? void 0 : reportPreviewAction.reportActionID) {
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID),
            value: (_f = {},
                _f[reportPreviewAction.reportActionID] = {
                    pendingAction: null,
                    errors: null,
                },
                _f),
        });
    }
    // Ensure that any remaining data is removed upon successful completion, even if the server sends a report removal response.
    // This is done to prevent the removal update from lingering in the applyHTTPSOnyxUpdates function.
    if (shouldDeleteTransactionThread && transactionThread) {
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadID),
            value: null,
        });
    }
    if (shouldDeleteIOUReport) {
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID),
            value: null,
        });
    }
    successData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.SET,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
        value: null,
    });
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.SET,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID),
        value: transactionViolations !== null && transactionViolations !== void 0 ? transactionViolations : null,
    });
    if (shouldDeleteTransactionThread) {
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadID),
            value: transactionThread,
        });
    }
    var errorKey = DateUtils_1.default.getMicroseconds();
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID),
        value: (_g = {},
            _g[reportAction.reportActionID] = __assign(__assign({}, reportAction), { pendingAction: null, errors: (_h = {},
                    _h[errorKey] = Localize.translateLocal('iou.error.genericDeleteFailureMessage'),
                    _h) }),
            _g),
    }, shouldDeleteIOUReport
        ? {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID),
            value: iouReport,
        }
        : {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID),
            value: iouReport,
        });
    if (reportPreviewAction === null || reportPreviewAction === void 0 ? void 0 : reportPreviewAction.reportActionID) {
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID),
            value: (_j = {},
                _j[reportPreviewAction.reportActionID] = __assign(__assign({}, reportPreviewAction), { pendingAction: null, errors: (_k = {},
                        _k[errorKey] = Localize.translateLocal('iou.error.genericDeleteFailureMessage'),
                        _k) }),
                _j),
        });
    }
    if (chatReport && shouldDeleteIOUReport) {
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport.reportID),
            value: chatReport,
        });
    }
    if (!shouldDeleteIOUReport && (updatedReportPreviewAction === null || updatedReportPreviewAction === void 0 ? void 0 : updatedReportPreviewAction.childMoneyRequestCount) === 0) {
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID),
            value: {
                hasOutstandingChildRequest: true,
            },
        });
    }
    var parameters = {
        transactionID: transactionID,
        reportActionID: reportAction.reportActionID,
    };
    // STEP 3: Make the API request
    API.write(types_1.WRITE_COMMANDS.DELETE_MONEY_REQUEST, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
    (0, CachedPDFPaths_1.clearByKey)(transactionID);
    return urlToNavigateBack;
}
function deleteTrackExpense(chatReportID, transactionID, reportAction, isSingleTransactionView) {
    var _a;
    if (isSingleTransactionView === void 0) { isSingleTransactionView = false; }
    if (!chatReportID || !transactionID) {
        return;
    }
    var urlToNavigateBack = getNavigationUrlAfterTrackExpenseDelete(chatReportID, transactionID, reportAction, isSingleTransactionView);
    // STEP 1: Get all collections we're updating
    var chatReport = (_a = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReportID)]) !== null && _a !== void 0 ? _a : null;
    if (!(0, ReportUtils_1.isSelfDM)(chatReport)) {
        deleteMoneyRequest(transactionID, reportAction, isSingleTransactionView);
        return urlToNavigateBack;
    }
    var whisperAction = (0, ReportActionsUtils_1.getTrackExpenseActionableWhisper)(transactionID, chatReportID);
    var actionableWhisperReportActionID = whisperAction === null || whisperAction === void 0 ? void 0 : whisperAction.reportActionID;
    var _b = getDeleteTrackExpenseInformation(chatReportID, transactionID, reportAction, undefined, undefined, actionableWhisperReportActionID, CONST_1.default.REPORT.ACTIONABLE_TRACK_EXPENSE_WHISPER_RESOLUTION.NOTHING, false), parameters = _b.parameters, optimisticData = _b.optimisticData, successData = _b.successData, failureData = _b.failureData;
    // STEP 6: Make the API request
    API.write(types_1.WRITE_COMMANDS.DELETE_MONEY_REQUEST, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
    (0, CachedPDFPaths_1.clearByKey)(transactionID);
    // STEP 7: Navigate the user depending on which page they are on and which resources were deleted
    return urlToNavigateBack;
}
/**
 * @param managerID - Account ID of the person sending the money
 * @param recipient - The user receiving the money
 */
function getSendMoneyParams(report, amount, currency, comment, paymentMethodType, managerID, recipient) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    var _l;
    var recipientEmail = (0, PhoneNumber_1.addSMSDomainIfPhoneNumber)((_l = recipient.login) !== null && _l !== void 0 ? _l : '');
    var recipientAccountID = Number(recipient.accountID);
    var newIOUReportDetails = JSON.stringify({
        amount: amount,
        currency: currency,
        requestorEmail: recipientEmail,
        requestorAccountID: recipientAccountID,
        comment: comment,
        idempotencyKey: expensify_common_1.Str.guid(),
    });
    var chatReport = !(0, EmptyObject_1.isEmptyObject)(report) && (report === null || report === void 0 ? void 0 : report.reportID) ? report : (0, ReportUtils_1.getChatByParticipants)([recipientAccountID, managerID]);
    var isNewChat = false;
    if (!chatReport) {
        chatReport = (0, ReportUtils_1.buildOptimisticChatReport)({
            participantList: [recipientAccountID, managerID],
        });
        isNewChat = true;
    }
    var optimisticIOUReport = (0, ReportUtils_1.buildOptimisticIOUReport)(recipientAccountID, managerID, amount, chatReport.reportID, currency, true);
    var optimisticTransaction = (0, TransactionUtils_1.buildOptimisticTransaction)({
        transactionParams: {
            amount: amount,
            currency: currency,
            reportID: optimisticIOUReport.reportID,
            comment: comment,
        },
    });
    var optimisticTransactionData = {
        onyxMethod: react_native_onyx_1.default.METHOD.SET,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(optimisticTransaction.transactionID),
        value: optimisticTransaction,
    };
    var _m = (0, ReportUtils_1.buildOptimisticMoneyRequestEntities)({
        iouReport: optimisticIOUReport,
        type: CONST_1.default.IOU.REPORT_ACTION_TYPE.PAY,
        amount: amount,
        currency: currency,
        comment: comment,
        payeeEmail: recipientEmail,
        participants: [recipient],
        transactionID: optimisticTransaction.transactionID,
        paymentType: paymentMethodType,
        isSendMoneyFlow: true,
    }), optimisticCreatedActionForChat = _m[0], optimisticCreatedActionForIOUReport = _m[1], optimisticIOUReportAction = _m[2], optimisticTransactionThread = _m[3], optimisticCreatedActionForTransactionThread = _m[4];
    var reportPreviewAction = (0, ReportUtils_1.buildOptimisticReportPreview)(chatReport, optimisticIOUReport);
    // Change the method to set for new reports because it doesn't exist yet, is faster,
    // and we need the data to be available when we navigate to the chat page
    var optimisticChatReportData = isNewChat
        ? {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport.reportID),
            value: __assign(__assign({}, chatReport), { 
                // Set and clear pending fields on the chat report
                pendingFields: { createChat: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD }, lastReadTime: DateUtils_1.default.getDBTime(), lastVisibleActionCreated: reportPreviewAction.created }),
        }
        : {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport.reportID),
            value: __assign(__assign({}, chatReport), { lastReadTime: DateUtils_1.default.getDBTime(), lastVisibleActionCreated: reportPreviewAction.created }),
        };
    var optimisticQuickActionData = {
        onyxMethod: react_native_onyx_1.default.METHOD.SET,
        key: ONYXKEYS_1.default.NVP_QUICK_ACTION_GLOBAL_CREATE,
        value: {
            action: CONST_1.default.QUICK_ACTIONS.SEND_MONEY,
            chatReportID: chatReport.reportID,
            isFirstQuickAction: (0, EmptyObject_1.isEmptyObject)(quickAction),
        },
    };
    var optimisticIOUReportData = {
        onyxMethod: react_native_onyx_1.default.METHOD.SET,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(optimisticIOUReport.reportID),
        value: __assign(__assign({}, optimisticIOUReport), { lastMessageText: (0, ReportActionsUtils_1.getReportActionText)(optimisticIOUReportAction), lastMessageHtml: (0, ReportActionsUtils_1.getReportActionHtml)(optimisticIOUReportAction) }),
    };
    var optimisticTransactionThreadData = {
        onyxMethod: react_native_onyx_1.default.METHOD.SET,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(optimisticTransactionThread.reportID),
        value: optimisticTransactionThread,
    };
    var optimisticIOUReportActionsData = {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(optimisticIOUReport.reportID),
        value: (_a = {},
            _a[optimisticCreatedActionForIOUReport.reportActionID] = optimisticCreatedActionForIOUReport,
            _a[optimisticIOUReportAction.reportActionID] = __assign(__assign({}, optimisticIOUReportAction), { pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD }),
            _a),
    };
    var optimisticChatReportActionsData = {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(chatReport.reportID),
        value: (_b = {},
            _b[reportPreviewAction.reportActionID] = reportPreviewAction,
            _b),
    };
    var optimisticTransactionThreadReportActionsData = optimisticCreatedActionForTransactionThread
        ? {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(optimisticTransactionThread.reportID),
            value: (_c = {}, _c[optimisticCreatedActionForTransactionThread === null || optimisticCreatedActionForTransactionThread === void 0 ? void 0 : optimisticCreatedActionForTransactionThread.reportActionID] = optimisticCreatedActionForTransactionThread, _c),
        }
        : undefined;
    var optimisticMetaData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(chatReport.reportID),
            value: {
                isOptimisticReport: true,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(optimisticTransactionThread.reportID),
            value: {
                isOptimisticReport: true,
            },
        },
    ];
    var successData = [];
    // Add optimistic personal details for recipient
    var optimisticPersonalDetailListData = null;
    var optimisticPersonalDetailListAction = isNewChat
        ? (_d = {},
            _d[recipientAccountID] = {
                accountID: recipientAccountID,
                // Disabling this line since participant.displayName can be an empty string
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                displayName: recipient.displayName || recipient.login,
                login: recipient.login,
            },
            _d) : {};
    var redundantParticipants = {};
    if (!(0, EmptyObject_1.isEmptyObject)(optimisticPersonalDetailListAction)) {
        var successPersonalDetailListAction_3 = {};
        // BE will send different participants. We clear the optimistic ones to avoid duplicated entries
        Object.keys(optimisticPersonalDetailListAction).forEach(function (accountIDKey) {
            var accountID = Number(accountIDKey);
            successPersonalDetailListAction_3[accountID] = null;
            redundantParticipants[accountID] = null;
        });
        optimisticPersonalDetailListData = {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
            value: optimisticPersonalDetailListAction,
        };
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
            value: successPersonalDetailListAction_3,
        });
    }
    successData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(optimisticIOUReport.reportID),
        value: {
            participants: redundantParticipants,
        },
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(optimisticTransactionThread.reportID),
        value: {
            participants: redundantParticipants,
        },
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(optimisticTransactionThread.reportID),
        value: {
            isOptimisticReport: false,
        },
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(optimisticIOUReport.reportID),
        value: (_e = {},
            _e[optimisticIOUReportAction.reportActionID] = {
                pendingAction: null,
            },
            _e),
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(optimisticTransaction.transactionID),
        value: { pendingAction: null },
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(chatReport.reportID),
        value: {
            isOptimisticReport: false,
        },
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(chatReport.reportID),
        value: (_f = {},
            _f[reportPreviewAction.reportActionID] = {
                pendingAction: null,
                childLastActorAccountID: reportPreviewAction.childLastActorAccountID,
            },
            _f),
    });
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(optimisticTransaction.transactionID),
            value: {
                errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.other'),
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(optimisticTransactionThread.reportID),
            value: {
                errorFields: {
                    createChat: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('report.genericCreateReportFailureMessage'),
                },
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: ONYXKEYS_1.default.NVP_QUICK_ACTION_GLOBAL_CREATE,
            value: quickAction !== null && quickAction !== void 0 ? quickAction : null,
        },
    ];
    if (optimisticCreatedActionForTransactionThread === null || optimisticCreatedActionForTransactionThread === void 0 ? void 0 : optimisticCreatedActionForTransactionThread.reportActionID) {
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(optimisticTransactionThread.reportID),
            value: (_g = {}, _g[optimisticCreatedActionForTransactionThread === null || optimisticCreatedActionForTransactionThread === void 0 ? void 0 : optimisticCreatedActionForTransactionThread.reportActionID] = { pendingAction: null }, _g),
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(optimisticTransactionThread.reportID),
            value: (_h = {}, _h[optimisticCreatedActionForTransactionThread === null || optimisticCreatedActionForTransactionThread === void 0 ? void 0 : optimisticCreatedActionForTransactionThread.reportActionID] = { errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.genericCreateFailureMessage') }, _h),
        });
    }
    // Now, let's add the data we need just when we are creating a new chat report
    if (isNewChat) {
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport.reportID),
            value: { pendingFields: null, participants: redundantParticipants },
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport.reportID),
            value: {
                errorFields: {
                    createChat: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('report.genericCreateReportFailureMessage'),
                },
            },
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(optimisticIOUReport.reportID),
            value: (_j = {},
                _j[optimisticIOUReportAction.reportActionID] = {
                    errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.genericCreateFailureMessage'),
                },
                _j),
        });
        var optimisticChatReportActionsValue = optimisticChatReportActionsData.value;
        if (optimisticChatReportActionsValue) {
            // Add an optimistic created action to the optimistic chat reportActions data
            optimisticChatReportActionsValue[optimisticCreatedActionForChat.reportActionID] = optimisticCreatedActionForChat;
        }
    }
    else {
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(optimisticIOUReport.reportID),
            value: (_k = {},
                _k[optimisticIOUReportAction.reportActionID] = {
                    errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.other'),
                },
                _k),
        });
    }
    var optimisticData = __spreadArray([
        optimisticChatReportData,
        optimisticQuickActionData,
        optimisticIOUReportData,
        optimisticChatReportActionsData,
        optimisticIOUReportActionsData,
        optimisticTransactionData,
        optimisticTransactionThreadData
    ], optimisticMetaData, true);
    if (optimisticTransactionThreadReportActionsData) {
        optimisticData.push(optimisticTransactionThreadReportActionsData);
    }
    if (!(0, EmptyObject_1.isEmptyObject)(optimisticPersonalDetailListData)) {
        optimisticData.push(optimisticPersonalDetailListData);
    }
    return {
        params: {
            iouReportID: optimisticIOUReport.reportID,
            chatReportID: chatReport.reportID,
            reportActionID: optimisticIOUReportAction.reportActionID,
            paymentMethodType: paymentMethodType,
            transactionID: optimisticTransaction.transactionID,
            newIOUReportDetails: newIOUReportDetails,
            createdReportActionID: isNewChat ? optimisticCreatedActionForChat.reportActionID : undefined,
            reportPreviewReportActionID: reportPreviewAction.reportActionID,
            createdIOUReportActionID: optimisticCreatedActionForIOUReport.reportActionID,
            transactionThreadReportID: optimisticTransactionThread.reportID,
            createdReportActionIDForThread: optimisticCreatedActionForTransactionThread === null || optimisticCreatedActionForTransactionThread === void 0 ? void 0 : optimisticCreatedActionForTransactionThread.reportActionID,
        },
        optimisticData: optimisticData,
        successData: successData,
        failureData: failureData,
    };
}
function getHoldReportActionsAndTransactions(reportID) {
    var iouReportActions = (0, ReportActionsUtils_1.getAllReportActions)(reportID);
    var holdReportActions = [];
    var holdTransactions = [];
    Object.values(iouReportActions).forEach(function (action) {
        var _a, _b;
        var transactionID = (0, ReportActionsUtils_1.isMoneyRequestAction)(action) ? (_a = (0, ReportActionsUtils_1.getOriginalMessage)(action)) === null || _a === void 0 ? void 0 : _a.IOUTransactionID : undefined;
        var transaction = allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID)];
        if ((_b = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _b === void 0 ? void 0 : _b.hold) {
            holdReportActions.push(action);
            holdTransactions.push(transaction);
        }
    });
    return { holdReportActions: holdReportActions, holdTransactions: holdTransactions };
}
function getReportFromHoldRequestsOnyxData(chatReport, iouReport, recipient) {
    var _a, _b, _c;
    var _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    var _p = getHoldReportActionsAndTransactions(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID), holdReportActions = _p.holdReportActions, holdTransactions = _p.holdTransactions;
    var firstHoldTransaction = holdTransactions.at(0);
    var newParentReportActionID = NumberUtils.rand64();
    var coefficient = (0, ReportUtils_1.isExpenseReport)(iouReport) ? -1 : 1;
    var isPolicyExpenseChat = (0, ReportUtils_1.isPolicyExpenseChat)(chatReport);
    var holdAmount = (((_d = iouReport === null || iouReport === void 0 ? void 0 : iouReport.total) !== null && _d !== void 0 ? _d : 0) - ((_e = iouReport === null || iouReport === void 0 ? void 0 : iouReport.unheldTotal) !== null && _e !== void 0 ? _e : 0)) * coefficient;
    var holdNonReimbursableAmount = (((_f = iouReport === null || iouReport === void 0 ? void 0 : iouReport.nonReimbursableTotal) !== null && _f !== void 0 ? _f : 0) - ((_g = iouReport === null || iouReport === void 0 ? void 0 : iouReport.unheldNonReimbursableTotal) !== null && _g !== void 0 ? _g : 0)) * coefficient;
    var optimisticExpenseReport = isPolicyExpenseChat
        ? (0, ReportUtils_1.buildOptimisticExpenseReport)(chatReport.reportID, (_h = chatReport.policyID) !== null && _h !== void 0 ? _h : iouReport === null || iouReport === void 0 ? void 0 : iouReport.policyID, (_j = recipient.accountID) !== null && _j !== void 0 ? _j : 1, holdAmount, (_k = iouReport === null || iouReport === void 0 ? void 0 : iouReport.currency) !== null && _k !== void 0 ? _k : '', holdNonReimbursableAmount, newParentReportActionID)
        : (0, ReportUtils_1.buildOptimisticIOUReport)((_l = iouReport === null || iouReport === void 0 ? void 0 : iouReport.ownerAccountID) !== null && _l !== void 0 ? _l : CONST_1.default.DEFAULT_NUMBER_ID, (_m = iouReport === null || iouReport === void 0 ? void 0 : iouReport.managerID) !== null && _m !== void 0 ? _m : CONST_1.default.DEFAULT_NUMBER_ID, holdAmount, chatReport.reportID, (_o = iouReport === null || iouReport === void 0 ? void 0 : iouReport.currency) !== null && _o !== void 0 ? _o : '', false, newParentReportActionID);
    var optimisticExpenseReportPreview = (0, ReportUtils_1.buildOptimisticReportPreview)(chatReport, optimisticExpenseReport, '', firstHoldTransaction, optimisticExpenseReport.reportID, newParentReportActionID);
    var updateHeldReports = {};
    var addHoldReportActions = {};
    var addHoldReportActionsSuccess = {};
    var deleteHoldReportActions = {};
    var optimisticHoldReportExpenseActionIDs = [];
    holdReportActions.forEach(function (holdReportAction) {
        var originalMessage = (0, ReportActionsUtils_1.getOriginalMessage)(holdReportAction);
        deleteHoldReportActions[holdReportAction.reportActionID] = {
            message: [
                {
                    deleted: DateUtils_1.default.getDBTime(),
                    type: CONST_1.default.REPORT.MESSAGE.TYPE.TEXT,
                    text: '',
                },
            ],
        };
        var reportActionID = NumberUtils.rand64();
        addHoldReportActions[reportActionID] = __assign(__assign({}, holdReportAction), { reportActionID: reportActionID, originalMessage: __assign(__assign({}, originalMessage), { IOUReportID: optimisticExpenseReport.reportID }), pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD });
        addHoldReportActionsSuccess[reportActionID] = {
            pendingAction: null,
        };
        var heldReport = (0, ReportUtils_1.getReportOrDraftReport)(holdReportAction.childReportID);
        if (heldReport) {
            optimisticHoldReportExpenseActionIDs.push({ optimisticReportActionID: reportActionID, oldReportActionID: holdReportAction.reportActionID });
            updateHeldReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(heldReport.reportID)] = {
                parentReportActionID: reportActionID,
                parentReportID: optimisticExpenseReport.reportID,
                chatReportID: optimisticExpenseReport.reportID,
            };
        }
    });
    var updateHeldTransactions = {};
    holdTransactions.forEach(function (transaction) {
        updateHeldTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID)] = {
            reportID: optimisticExpenseReport.reportID,
        };
    });
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport.reportID),
            value: {
                iouReportID: optimisticExpenseReport.reportID,
                lastVisibleActionCreated: optimisticExpenseReportPreview.created,
            },
        },
        // add new optimistic expense report
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(optimisticExpenseReport.reportID),
            value: __assign(__assign({}, optimisticExpenseReport), { unheldTotal: 0, unheldNonReimbursableTotal: 0 }),
        },
        // add preview report action to main chat
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(chatReport.reportID),
            value: (_a = {},
                _a[optimisticExpenseReportPreview.reportActionID] = optimisticExpenseReportPreview,
                _a),
        },
        // remove hold report actions from old iou report
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID),
            value: deleteHoldReportActions,
        },
        // add hold report actions to new iou report
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(optimisticExpenseReport.reportID),
            value: addHoldReportActions,
        },
        // update held reports with new parentReportActionID
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE_COLLECTION,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT),
            value: updateHeldReports,
        },
        // update transactions with new iouReportID
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE_COLLECTION,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION),
            value: updateHeldTransactions,
        },
    ];
    var bringReportActionsBack = {};
    holdReportActions.forEach(function (reportAction) {
        bringReportActionsBack[reportAction.reportActionID] = reportAction;
    });
    var bringHeldTransactionsBack = {};
    holdTransactions.forEach(function (transaction) {
        bringHeldTransactionsBack["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID)] = transaction;
    });
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(chatReport.reportID),
            value: (_b = {},
                _b[optimisticExpenseReportPreview.reportActionID] = {
                    pendingAction: null,
                },
                _b),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(optimisticExpenseReport.reportID),
            value: addHoldReportActionsSuccess,
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport.reportID),
            value: {
                iouReportID: chatReport.iouReportID,
                lastVisibleActionCreated: chatReport.lastVisibleActionCreated,
            },
        },
        // remove added optimistic expense report
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(optimisticExpenseReport.reportID),
            value: null,
        },
        // remove preview report action from the main chat
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(chatReport.reportID),
            value: (_c = {},
                _c[optimisticExpenseReportPreview.reportActionID] = null,
                _c),
        },
        // add hold report actions back to old iou report
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID),
            value: bringReportActionsBack,
        },
        // remove hold report actions from the new iou report
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(optimisticExpenseReport.reportID),
            value: null,
        },
        // add hold transactions back to old iou report
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE_COLLECTION,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION),
            value: bringHeldTransactionsBack,
        },
    ];
    return {
        optimisticData: optimisticData,
        optimisticHoldActionID: optimisticExpenseReportPreview.reportActionID,
        failureData: failureData,
        successData: successData,
        optimisticHoldReportID: optimisticExpenseReport.reportID,
        optimisticHoldReportExpenseActionIDs: optimisticHoldReportExpenseActionIDs,
    };
}
function hasOutstandingChildRequest(chatReport, excludedIOUReport, policyId) {
    var _a;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = (0, PolicyUtils_1.getPolicy)(policyId);
    if (!((_a = policy === null || policy === void 0 ? void 0 : policy.achAccount) === null || _a === void 0 ? void 0 : _a.bankAccountID)) {
        return false;
    }
    var reportActions = (0, ReportActionsUtils_1.getAllReportActions)(chatReport.reportID);
    return !!Object.values(reportActions).find(function (action) {
        var iouReportID = (0, ReportActionsUtils_1.getIOUReportIDFromReportActionPreview)(action);
        if (iouReportID === (excludedIOUReport === null || excludedIOUReport === void 0 ? void 0 : excludedIOUReport.reportID)) {
            return false;
        }
        var iouReport = (0, ReportUtils_1.getReportOrDraftReport)(iouReportID);
        var transactions = (0, ReportUtils_1.getReportTransactions)(iouReportID);
        return canIOUBePaid(iouReport, chatReport, policy, transactions) || canIOUBePaid(iouReport, chatReport, policy, transactions, true);
    });
}
function getPayMoneyRequestParams(initialChatReport, iouReport, recipient, paymentMethodType, full, payAsBusiness) {
    var _a, _b, _c, _d, _e, _f;
    var _g, _h, _j, _k, _l, _m;
    var isInvoiceReport = (0, ReportUtils_1.isInvoiceReport)(iouReport);
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var activePolicy = (0, PolicyUtils_1.getPolicy)(activePolicyID);
    var payerPolicyID = activePolicyID;
    var chatReport = initialChatReport;
    var policyParams = {};
    var optimisticData = [];
    var successData = [];
    var failureData = [];
    var shouldCreatePolicy = !activePolicy || !(0, PolicyUtils_1.isPolicyAdmin)(activePolicy) || !(0, PolicyUtils_1.isPaidGroupPolicy)(activePolicy);
    if ((0, ReportUtils_1.isIndividualInvoiceRoom)(chatReport) && payAsBusiness && shouldCreatePolicy) {
        payerPolicyID = (0, Policy_1.generatePolicyID)();
        var _o = (0, Policy_1.buildPolicyData)(currentUserEmail, true, undefined, payerPolicyID), policyOptimisticData = _o.optimisticData, policyFailureData = _o.failureData, policySuccessData = _o.successData, params = _o.params;
        var adminsChatReportID = params.adminsChatReportID, adminsCreatedReportActionID = params.adminsCreatedReportActionID, expenseChatReportID = params.expenseChatReportID, expenseCreatedReportActionID = params.expenseCreatedReportActionID, customUnitRateID = params.customUnitRateID, customUnitID = params.customUnitID, ownerEmail = params.ownerEmail, policyName = params.policyName;
        policyParams = {
            policyID: payerPolicyID,
            adminsChatReportID: adminsChatReportID,
            adminsCreatedReportActionID: adminsCreatedReportActionID,
            expenseChatReportID: expenseChatReportID,
            expenseCreatedReportActionID: expenseCreatedReportActionID,
            customUnitRateID: customUnitRateID,
            customUnitID: customUnitID,
            ownerEmail: ownerEmail,
            policyName: policyName,
        };
        optimisticData.push.apply(optimisticData, __spreadArray(__spreadArray([], policyOptimisticData, false), [{ onyxMethod: react_native_onyx_1.default.METHOD.MERGE, key: ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID, value: payerPolicyID }], false));
        successData.push.apply(successData, policySuccessData);
        failureData.push.apply(failureData, __spreadArray(__spreadArray([], policyFailureData, false), [{ onyxMethod: react_native_onyx_1.default.METHOD.MERGE, key: ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID, value: activePolicyID !== null && activePolicyID !== void 0 ? activePolicyID : null }], false));
    }
    if ((0, ReportUtils_1.isIndividualInvoiceRoom)(chatReport) && payAsBusiness && activePolicyID) {
        var existingB2BInvoiceRoom = (0, ReportUtils_1.getInvoiceChatByParticipants)(activePolicyID, CONST_1.default.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS, chatReport.policyID);
        if (existingB2BInvoiceRoom) {
            chatReport = existingB2BInvoiceRoom;
        }
    }
    var total = ((_g = iouReport === null || iouReport === void 0 ? void 0 : iouReport.total) !== null && _g !== void 0 ? _g : 0) - ((_h = iouReport === null || iouReport === void 0 ? void 0 : iouReport.nonReimbursableTotal) !== null && _h !== void 0 ? _h : 0);
    if ((0, ReportUtils_1.hasHeldExpenses)(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID) && !full && !!(iouReport === null || iouReport === void 0 ? void 0 : iouReport.unheldTotal)) {
        total = iouReport.unheldTotal - ((_j = iouReport === null || iouReport === void 0 ? void 0 : iouReport.unheldNonReimbursableTotal) !== null && _j !== void 0 ? _j : 0);
    }
    var optimisticIOUReportAction = (0, ReportUtils_1.buildOptimisticIOUReportAction)({
        type: CONST_1.default.IOU.REPORT_ACTION_TYPE.PAY,
        amount: (0, ReportUtils_1.isExpenseReport)(iouReport) ? -total : total,
        currency: (_k = iouReport === null || iouReport === void 0 ? void 0 : iouReport.currency) !== null && _k !== void 0 ? _k : '',
        comment: '',
        participants: [recipient],
        transactionID: '',
        paymentType: paymentMethodType,
        iouReportID: iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID,
        isSettlingUp: true,
    });
    // In some instances, the report preview action might not be available to the payer (only whispered to the requestor)
    // hence we need to make the updates to the action safely.
    var optimisticReportPreviewAction = null;
    var reportPreviewAction = getReportPreviewAction(chatReport.reportID, iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID);
    if (reportPreviewAction) {
        optimisticReportPreviewAction = (0, ReportUtils_1.updateReportPreview)(iouReport, reportPreviewAction, true);
    }
    var currentNextStep = null;
    var optimisticNextStep = null;
    if (!isInvoiceReport) {
        currentNextStep = (_l = allNextSteps["".concat(ONYXKEYS_1.default.COLLECTION.NEXT_STEP).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID)]) !== null && _l !== void 0 ? _l : null;
        optimisticNextStep = (0, NextStepUtils_1.buildNextStep)(iouReport, CONST_1.default.REPORT.STATUS_NUM.REIMBURSED);
    }
    var optimisticChatReport = __assign(__assign({}, chatReport), { lastReadTime: DateUtils_1.default.getDBTime(), hasOutstandingChildRequest: hasOutstandingChildRequest(chatReport, iouReport, iouReport === null || iouReport === void 0 ? void 0 : iouReport.policyID), iouReportID: null, lastMessageText: (0, ReportActionsUtils_1.getReportActionText)(optimisticIOUReportAction), lastMessageHtml: (0, ReportActionsUtils_1.getReportActionHtml)(optimisticIOUReportAction) });
    if ((0, ReportUtils_1.isIndividualInvoiceRoom)(chatReport) && payAsBusiness && payerPolicyID) {
        optimisticChatReport.invoiceReceiver = {
            type: CONST_1.default.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS,
            policyID: payerPolicyID,
        };
    }
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport.reportID),
        value: optimisticChatReport,
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID),
        value: (_a = {},
            _a[optimisticIOUReportAction.reportActionID] = __assign(__assign({}, optimisticIOUReportAction), { pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD }),
            _a),
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID),
        value: {
            lastMessageText: (0, ReportActionsUtils_1.getReportActionText)(optimisticIOUReportAction),
            lastMessageHtml: (0, ReportActionsUtils_1.getReportActionHtml)(optimisticIOUReportAction),
            lastVisibleActionCreated: optimisticIOUReportAction.created,
            hasOutstandingChildRequest: false,
            statusNum: CONST_1.default.REPORT.STATUS_NUM.REIMBURSED,
            pendingFields: {
                preview: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                reimbursed: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                partial: full ? null : CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            },
            errors: null,
        },
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.NEXT_STEP).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID),
        value: optimisticNextStep,
    });
    if (iouReport === null || iouReport === void 0 ? void 0 : iouReport.policyID) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.NVP_LAST_PAYMENT_METHOD,
            value: (_b = {},
                _b[iouReport.policyID] = paymentMethodType,
                _b),
        });
    }
    successData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID),
        value: {
            pendingFields: {
                preview: null,
                reimbursed: null,
                partial: null,
            },
            errors: null,
        },
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID),
        value: (_c = {},
            _c[optimisticIOUReportAction.reportActionID] = {
                pendingAction: null,
            },
            _c),
    });
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID),
        value: (_d = {},
            _d[optimisticIOUReportAction.reportActionID] = {
                errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.other'),
            },
            _d),
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID),
        value: __assign({}, iouReport),
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport.reportID),
        value: chatReport,
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.NEXT_STEP).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID),
        value: currentNextStep,
    });
    // In case the report preview action is loaded locally, let's update it.
    if (optimisticReportPreviewAction) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(chatReport.reportID),
            value: (_e = {},
                _e[optimisticReportPreviewAction.reportActionID] = optimisticReportPreviewAction,
                _e),
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(chatReport.reportID),
            value: (_f = {},
                _f[optimisticReportPreviewAction.reportActionID] = {
                    created: optimisticReportPreviewAction.created,
                },
                _f),
        });
    }
    // Optimistically unhold all transactions if we pay all requests
    if (full) {
        var reportTransactions = (0, ReportUtils_1.getReportTransactions)(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID);
        for (var _i = 0, reportTransactions_1 = reportTransactions; _i < reportTransactions_1.length; _i++) {
            var transaction = reportTransactions_1[_i];
            optimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID),
                value: {
                    comment: {
                        hold: null,
                    },
                },
            });
            failureData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID),
                value: {
                    comment: {
                        hold: (_m = transaction.comment) === null || _m === void 0 ? void 0 : _m.hold,
                    },
                },
            });
        }
        var optimisticTransactionViolations = reportTransactions.map(function (_a) {
            var transactionID = _a.transactionID;
            return {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID),
                value: null,
            };
        });
        optimisticData.push.apply(optimisticData, optimisticTransactionViolations);
        var failureTransactionViolations = reportTransactions.map(function (_a) {
            var _b;
            var transactionID = _a.transactionID;
            var violations = (_b = allTransactionViolations["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID)]) !== null && _b !== void 0 ? _b : [];
            return {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID),
                value: violations,
            };
        });
        failureData.push.apply(failureData, failureTransactionViolations);
    }
    var optimisticHoldReportID;
    var optimisticHoldActionID;
    var optimisticHoldReportExpenseActionIDs;
    if (!full) {
        var holdReportOnyxData = getReportFromHoldRequestsOnyxData(chatReport, iouReport, recipient);
        optimisticData.push.apply(optimisticData, holdReportOnyxData.optimisticData);
        successData.push.apply(successData, holdReportOnyxData.successData);
        failureData.push.apply(failureData, holdReportOnyxData.failureData);
        optimisticHoldReportID = holdReportOnyxData.optimisticHoldReportID;
        optimisticHoldActionID = holdReportOnyxData.optimisticHoldActionID;
        optimisticHoldReportExpenseActionIDs = JSON.stringify(holdReportOnyxData.optimisticHoldReportExpenseActionIDs);
    }
    return {
        params: __assign({ iouReportID: iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID, chatReportID: chatReport.reportID, reportActionID: optimisticIOUReportAction.reportActionID, paymentMethodType: paymentMethodType, full: full, amount: Math.abs(total), optimisticHoldReportID: optimisticHoldReportID, optimisticHoldActionID: optimisticHoldActionID, optimisticHoldReportExpenseActionIDs: optimisticHoldReportExpenseActionIDs }, policyParams),
        optimisticData: optimisticData,
        successData: successData,
        failureData: failureData,
    };
}
/**
 * @param managerID - Account ID of the person sending the money
 * @param recipient - The user receiving the money
 */
function sendMoneyElsewhere(report, amount, currency, comment, managerID, recipient) {
    var _a = getSendMoneyParams(report, amount, currency, comment, CONST_1.default.IOU.PAYMENT_TYPE.ELSEWHERE, managerID, recipient), params = _a.params, optimisticData = _a.optimisticData, successData = _a.successData, failureData = _a.failureData;
    (0, Sound_1.default)(Sound_1.SOUNDS.DONE);
    API.write(types_1.WRITE_COMMANDS.SEND_MONEY_ELSEWHERE, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
    dismissModalAndOpenReportInInboxTab(params.chatReportID);
    (0, Report_1.notifyNewAction)(params.chatReportID, managerID);
}
/**
 * @param managerID - Account ID of the person sending the money
 * @param recipient - The user receiving the money
 */
function sendMoneyWithWallet(report, amount, currency, comment, managerID, recipient) {
    var _a = getSendMoneyParams(report, amount, currency, comment, CONST_1.default.IOU.PAYMENT_TYPE.EXPENSIFY, managerID, recipient), params = _a.params, optimisticData = _a.optimisticData, successData = _a.successData, failureData = _a.failureData;
    (0, Sound_1.default)(Sound_1.SOUNDS.DONE);
    API.write(types_1.WRITE_COMMANDS.SEND_MONEY_WITH_WALLET, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
    dismissModalAndOpenReportInInboxTab(params.chatReportID);
    (0, Report_1.notifyNewAction)(params.chatReportID, managerID);
}
function canApproveIOU(iouReport, policy, iouTransactions) {
    var _a;
    // Only expense reports can be approved
    if (!(0, ReportUtils_1.isExpenseReport)(iouReport) || !(policy && (0, PolicyUtils_1.isPaidGroupPolicy)(policy))) {
        return false;
    }
    var isOnSubmitAndClosePolicy = (0, PolicyUtils_1.isSubmitAndClose)(policy);
    if (isOnSubmitAndClosePolicy) {
        return false;
    }
    var managerID = (_a = iouReport === null || iouReport === void 0 ? void 0 : iouReport.managerID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID;
    var isCurrentUserManager = managerID === userAccountID;
    var isOpenExpenseReport = (0, ReportUtils_1.isOpenExpenseReport)(iouReport);
    var isApproved = (0, ReportUtils_1.isReportApproved)({ report: iouReport });
    var iouSettled = (0, ReportUtils_1.isSettled)(iouReport);
    var reportNameValuePairs = allReportNameValuePairs === null || allReportNameValuePairs === void 0 ? void 0 : allReportNameValuePairs["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID)];
    var isArchivedExpenseReport = (0, ReportUtils_1.isArchivedReport)(reportNameValuePairs);
    var reportTransactions = iouTransactions !== null && iouTransactions !== void 0 ? iouTransactions : (0, ReportUtils_1.getReportTransactions)(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID);
    var hasOnlyPendingCardOrScanningTransactions = reportTransactions.length > 0 && reportTransactions.every(TransactionUtils_1.isPendingCardOrScanningTransaction);
    if (hasOnlyPendingCardOrScanningTransactions) {
        return false;
    }
    var isPayAtEndExpenseReport = (0, ReportUtils_1.isPayAtEndExpenseReport)(iouReport !== null && iouReport !== void 0 ? iouReport : undefined, reportTransactions);
    var isClosedReport = (0, ReportUtils_1.isClosedReport)(iouReport);
    return (reportTransactions.length > 0 && isCurrentUserManager && !isOpenExpenseReport && !isApproved && !iouSettled && !isArchivedExpenseReport && !isPayAtEndExpenseReport && !isClosedReport);
}
function canUnapproveIOU(iouReport, policy) {
    return ((0, ReportUtils_1.isExpenseReport)(iouReport) &&
        ((0, ReportUtils_1.isReportManager)(iouReport) || (0, PolicyUtils_1.isPolicyAdmin)(policy)) &&
        (0, ReportUtils_1.isReportApproved)({ report: iouReport }) &&
        !(0, PolicyUtils_1.isSubmitAndClose)(policy) &&
        !(iouReport === null || iouReport === void 0 ? void 0 : iouReport.isWaitingOnBankAccount));
}
function canIOUBePaid(iouReport, chatReport, policy, transactions, onlyShowPayElsewhere, chatReportRNVP, invoiceReceiverPolicy, shouldCheckApprovedState) {
    var _a, _b, _c, _d;
    if (onlyShowPayElsewhere === void 0) { onlyShowPayElsewhere = false; }
    if (shouldCheckApprovedState === void 0) { shouldCheckApprovedState = true; }
    var reportNameValuePairs = chatReportRNVP !== null && chatReportRNVP !== void 0 ? chatReportRNVP : allReportNameValuePairs === null || allReportNameValuePairs === void 0 ? void 0 : allReportNameValuePairs["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID)];
    var isChatReportArchived = (0, ReportUtils_1.isArchivedReport)(reportNameValuePairs);
    var iouSettled = (0, ReportUtils_1.isSettled)(iouReport);
    if ((0, EmptyObject_1.isEmptyObject)(iouReport)) {
        return false;
    }
    if ((policy === null || policy === void 0 ? void 0 : policy.reimbursementChoice) === CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO) {
        if (!onlyShowPayElsewhere) {
            return false;
        }
        if ((iouReport === null || iouReport === void 0 ? void 0 : iouReport.statusNum) !== CONST_1.default.REPORT.STATUS_NUM.SUBMITTED) {
            return false;
        }
    }
    if ((0, ReportUtils_1.isInvoiceReport)(iouReport)) {
        if (isChatReportArchived || iouSettled || (0, ReportUtils_1.isOpenInvoiceReport)(iouReport)) {
            return false;
        }
        if (((_a = chatReport === null || chatReport === void 0 ? void 0 : chatReport.invoiceReceiver) === null || _a === void 0 ? void 0 : _a.type) === CONST_1.default.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL) {
            return ((_b = chatReport === null || chatReport === void 0 ? void 0 : chatReport.invoiceReceiver) === null || _b === void 0 ? void 0 : _b.accountID) === userAccountID;
        }
        // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
        // eslint-disable-next-line deprecation/deprecation
        return ((_d = (invoiceReceiverPolicy !== null && invoiceReceiverPolicy !== void 0 ? invoiceReceiverPolicy : (0, PolicyUtils_1.getPolicy)((_c = chatReport === null || chatReport === void 0 ? void 0 : chatReport.invoiceReceiver) === null || _c === void 0 ? void 0 : _c.policyID))) === null || _d === void 0 ? void 0 : _d.role) === CONST_1.default.POLICY.ROLE.ADMIN;
    }
    var isPayer = (0, ReportUtils_1.isPayer)({
        email: currentUserEmail,
        accountID: userAccountID,
    }, iouReport, onlyShowPayElsewhere, policy);
    var isOpenExpenseReport = (0, ReportUtils_1.isOpenExpenseReport)(iouReport);
    var reimbursableSpend = (0, ReportUtils_1.getMoneyRequestSpendBreakdown)(iouReport).reimbursableSpend;
    var isAutoReimbursable = (policy === null || policy === void 0 ? void 0 : policy.reimbursementChoice) === CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES ? false : (0, ReportUtils_1.canBeAutoReimbursed)(iouReport, policy);
    var shouldBeApproved = canApproveIOU(iouReport, policy, transactions);
    var isPayAtEndExpenseReport = (0, ReportUtils_1.isPayAtEndExpenseReport)(iouReport !== null && iouReport !== void 0 ? iouReport : undefined, transactions);
    return (isPayer &&
        !isOpenExpenseReport &&
        !iouSettled &&
        !(iouReport === null || iouReport === void 0 ? void 0 : iouReport.isWaitingOnBankAccount) &&
        reimbursableSpend > 0 &&
        !isChatReportArchived &&
        !isAutoReimbursable &&
        (!shouldBeApproved || !shouldCheckApprovedState) &&
        !isPayAtEndExpenseReport);
}
function canCancelPayment(iouReport, session) {
    return (0, ReportUtils_1.isPayer)(session, iouReport) && ((0, ReportUtils_1.isSettled)(iouReport) || (iouReport === null || iouReport === void 0 ? void 0 : iouReport.isWaitingOnBankAccount)) && (0, ReportUtils_1.isExpenseReport)(iouReport);
}
function canSubmitReport(report, policy, transactions, allViolations, isReportArchived) {
    if (isReportArchived === void 0) { isReportArchived = false; }
    var currentUserAccountID = (0, Report_1.getCurrentUserAccountID)();
    var isOpenExpenseReport = (0, ReportUtils_1.isOpenExpenseReport)(report);
    var isAdmin = (policy === null || policy === void 0 ? void 0 : policy.role) === CONST_1.default.POLICY.ROLE.ADMIN;
    var hasAllPendingRTERViolations = (0, TransactionUtils_1.allHavePendingRTERViolation)(transactions, allViolations);
    var isManualSubmitEnabled = (0, PolicyUtils_1.getCorrectedAutoReportingFrequency)(policy) === CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL;
    var hasTransactionWithoutRTERViolation = (0, TransactionUtils_1.hasAnyTransactionWithoutRTERViolation)(transactions, allViolations);
    var hasOnlyPendingCardOrScanFailTransactions = transactions.length > 0 && transactions.every(function (t) { return (0, TransactionUtils_1.isPendingCardOrScanningTransaction)(t); });
    return (transactions.length > 0 &&
        isOpenExpenseReport &&
        isManualSubmitEnabled &&
        !isReportArchived &&
        !hasOnlyPendingCardOrScanFailTransactions &&
        !hasAllPendingRTERViolations &&
        hasTransactionWithoutRTERViolation &&
        ((report === null || report === void 0 ? void 0 : report.ownerAccountID) === currentUserAccountID || isAdmin || (report === null || report === void 0 ? void 0 : report.managerID) === currentUserAccountID));
}
function getIOUReportActionToApproveOrPay(chatReport, excludedIOUReportID) {
    var _a;
    var chatReportActions = (_a = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID)]) !== null && _a !== void 0 ? _a : {};
    return Object.values(chatReportActions).find(function (action) {
        var _a;
        if (!action) {
            return false;
        }
        var iouReport = (0, ReportUtils_1.getReportOrDraftReport)(action.childReportID);
        // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
        // eslint-disable-next-line deprecation/deprecation
        var policy = (0, PolicyUtils_1.getPolicy)(iouReport === null || iouReport === void 0 ? void 0 : iouReport.policyID);
        var shouldShowSettlementButton = canIOUBePaid(iouReport, chatReport, policy) || canApproveIOU(iouReport, policy);
        return (((_a = action.childReportID) === null || _a === void 0 ? void 0 : _a.toString()) !== excludedIOUReportID &&
            action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW &&
            shouldShowSettlementButton &&
            !(0, ReportActionsUtils_1.isDeletedAction)(action));
    });
}
function hasIOUToApproveOrPay(chatReport, excludedIOUReportID) {
    return !!getIOUReportActionToApproveOrPay(chatReport, excludedIOUReportID);
}
function isLastApprover(approvalChain) {
    if (approvalChain.length === 0) {
        return true;
    }
    return approvalChain.at(-1) === currentUserEmail;
}
function approveMoneyRequest(expenseReport, full) {
    var _a, _b, _c;
    var _d, _e, _f;
    if (!expenseReport) {
        return;
    }
    if (expenseReport.policyID && (0, SubscriptionUtils_1.shouldRestrictUserBillableActions)(expenseReport.policyID)) {
        Navigation_1.default.navigate(ROUTES_1.default.RESTRICTED_ACTION.getRoute(expenseReport.policyID));
        return;
    }
    var currentNextStep = (_d = allNextSteps["".concat(ONYXKEYS_1.default.COLLECTION.NEXT_STEP).concat(expenseReport.reportID)]) !== null && _d !== void 0 ? _d : null;
    var total = (_e = expenseReport.total) !== null && _e !== void 0 ? _e : 0;
    var hasHeldExpenses = (0, ReportUtils_1.hasHeldExpenses)(expenseReport.reportID);
    var hasDuplicates = (0, TransactionUtils_1.hasDuplicateTransactions)(expenseReport.reportID);
    if (hasHeldExpenses && !full && !!expenseReport.unheldTotal) {
        total = expenseReport.unheldTotal;
    }
    var optimisticApprovedReportAction = (0, ReportUtils_1.buildOptimisticApprovedReportAction)(total, (_f = expenseReport.currency) !== null && _f !== void 0 ? _f : '', expenseReport.reportID);
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var approvalChain = (0, ReportUtils_1.getApprovalChain)((0, PolicyUtils_1.getPolicy)(expenseReport.policyID), expenseReport);
    var predictedNextStatus = isLastApprover(approvalChain) ? CONST_1.default.REPORT.STATUS_NUM.APPROVED : CONST_1.default.REPORT.STATUS_NUM.SUBMITTED;
    var predictedNextState = isLastApprover(approvalChain) ? CONST_1.default.REPORT.STATE_NUM.APPROVED : CONST_1.default.REPORT.STATE_NUM.SUBMITTED;
    var managerID = isLastApprover(approvalChain) ? expenseReport.managerID : (0, ReportUtils_1.getNextApproverAccountID)(expenseReport);
    var optimisticNextStep = (0, NextStepUtils_1.buildNextStep)(expenseReport, predictedNextStatus);
    var chatReport = (0, ReportUtils_1.getReportOrDraftReport)(expenseReport.chatReportID);
    var optimisticReportActionsData = {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReport.reportID),
        value: (_a = {},
            _a[optimisticApprovedReportAction.reportActionID] = __assign(__assign({}, optimisticApprovedReportAction), { pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD }),
            _a),
    };
    var optimisticIOUReportData = {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(expenseReport.reportID),
        value: __assign(__assign({}, expenseReport), { lastMessageText: (0, ReportActionsUtils_1.getReportActionText)(optimisticApprovedReportAction), lastMessageHtml: (0, ReportActionsUtils_1.getReportActionHtml)(optimisticApprovedReportAction), stateNum: predictedNextState, statusNum: predictedNextStatus, managerID: managerID, pendingFields: {
                partial: full ? null : CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            } }),
    };
    var optimisticChatReportData = {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(expenseReport.chatReportID),
        value: {
            hasOutstandingChildRequest: hasIOUToApproveOrPay(chatReport, expenseReport.reportID),
        },
    };
    var optimisticNextStepData = {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.NEXT_STEP).concat(expenseReport.reportID),
        value: optimisticNextStep,
    };
    var optimisticData = [optimisticIOUReportData, optimisticReportActionsData, optimisticNextStepData, optimisticChatReportData];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReport.reportID),
            value: (_b = {},
                _b[optimisticApprovedReportAction.reportActionID] = {
                    pendingAction: null,
                },
                _b),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(expenseReport.reportID),
            value: {
                pendingFields: {
                    partial: null,
                },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReport.reportID),
            value: (_c = {},
                _c[optimisticApprovedReportAction.reportActionID] = {
                    errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.other'),
                },
                _c),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(expenseReport.chatReportID),
            value: {
                hasOutstandingChildRequest: chatReport === null || chatReport === void 0 ? void 0 : chatReport.hasOutstandingChildRequest,
                pendingFields: {
                    partial: null,
                },
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.NEXT_STEP).concat(expenseReport.reportID),
            value: currentNextStep,
        },
    ];
    // Clear hold reason of all transactions if we approve all requests
    if (full && hasHeldExpenses) {
        var heldTransactions = (0, ReportUtils_1.getAllHeldTransactions)(expenseReport.reportID);
        heldTransactions.forEach(function (heldTransaction) {
            var _a;
            optimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(heldTransaction.transactionID),
                value: {
                    comment: {
                        hold: '',
                    },
                },
            });
            failureData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(heldTransaction.transactionID),
                value: {
                    comment: {
                        hold: (_a = heldTransaction.comment) === null || _a === void 0 ? void 0 : _a.hold,
                    },
                },
            });
        });
    }
    var optimisticHoldReportID;
    var optimisticHoldActionID;
    var optimisticHoldReportExpenseActionIDs;
    if (!full && !!chatReport && !!expenseReport) {
        var holdReportOnyxData = getReportFromHoldRequestsOnyxData(chatReport, expenseReport, { accountID: expenseReport.ownerAccountID });
        optimisticData.push.apply(optimisticData, holdReportOnyxData.optimisticData);
        successData.push.apply(successData, holdReportOnyxData.successData);
        failureData.push.apply(failureData, holdReportOnyxData.failureData);
        optimisticHoldReportID = holdReportOnyxData.optimisticHoldReportID;
        optimisticHoldActionID = holdReportOnyxData.optimisticHoldActionID;
        optimisticHoldReportExpenseActionIDs = JSON.stringify(holdReportOnyxData.optimisticHoldReportExpenseActionIDs);
    }
    // Remove duplicates violations if we approve the report
    if (hasDuplicates) {
        var transactions = (0, ReportUtils_1.getReportTransactions)(expenseReport.reportID).filter(function (transaction) { return (0, TransactionUtils_1.isDuplicate)(transaction, true); });
        if (!full) {
            transactions.filter(function (transaction) { return !(0, TransactionUtils_1.isOnHold)(transaction); });
        }
        transactions.forEach(function (transaction) {
            var _a;
            var transactionViolations = (_a = allTransactionViolations === null || allTransactionViolations === void 0 ? void 0 : allTransactionViolations["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transaction.transactionID)]) !== null && _a !== void 0 ? _a : [];
            var newTransactionViolations = transactionViolations.filter(function (violation) { return violation.name !== CONST_1.default.VIOLATIONS.DUPLICATED_TRANSACTION; });
            optimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transaction.transactionID),
                value: newTransactionViolations,
            });
            failureData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transaction.transactionID),
                value: transactionViolations,
            });
        });
    }
    var parameters = {
        reportID: expenseReport.reportID,
        approvedReportActionID: optimisticApprovedReportAction.reportActionID,
        full: full,
        optimisticHoldReportID: optimisticHoldReportID,
        optimisticHoldActionID: optimisticHoldActionID,
        optimisticHoldReportExpenseActionIDs: optimisticHoldReportExpenseActionIDs,
    };
    (0, Sound_1.default)(Sound_1.SOUNDS.SUCCESS);
    API.write(types_1.WRITE_COMMANDS.APPROVE_MONEY_REQUEST, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function reopenReport(expenseReport) {
    var _a, _b, _c, _d, _e;
    var _f;
    if (!expenseReport) {
        return;
    }
    var currentNextStep = (_f = allNextSteps["".concat(ONYXKEYS_1.default.COLLECTION.NEXT_STEP).concat(expenseReport.reportID)]) !== null && _f !== void 0 ? _f : null;
    var optimisticReopenedReportAction = (0, ReportUtils_1.buildOptimisticReopenedReportAction)();
    var predictedNextState = CONST_1.default.REPORT.STATE_NUM.OPEN;
    var predictedNextStatus = CONST_1.default.REPORT.STATUS_NUM.OPEN;
    var optimisticNextStep = (0, NextStepUtils_1.buildNextStep)(expenseReport, predictedNextStatus, undefined, undefined, true);
    var optimisticReportActionsData = {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReport.reportID),
        value: (_a = {},
            _a[optimisticReopenedReportAction.reportActionID] = __assign(__assign({}, optimisticReopenedReportAction), { pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD }),
            _a),
    };
    var optimisticIOUReportData = {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(expenseReport.reportID),
        value: __assign(__assign({}, expenseReport), { lastMessageText: (0, ReportActionsUtils_1.getReportActionText)(optimisticReopenedReportAction), lastMessageHtml: (0, ReportActionsUtils_1.getReportActionHtml)(optimisticReopenedReportAction), stateNum: predictedNextState, statusNum: predictedNextStatus, pendingFields: {
                partial: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            } }),
    };
    var optimisticNextStepData = {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.NEXT_STEP).concat(expenseReport.reportID),
        value: optimisticNextStep,
    };
    var optimisticData = [optimisticIOUReportData, optimisticReportActionsData, optimisticNextStepData];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReport.reportID),
            value: (_b = {},
                _b[optimisticReopenedReportAction.reportActionID] = {
                    pendingAction: null,
                },
                _b),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(expenseReport.reportID),
            value: {
                pendingFields: {
                    partial: null,
                },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReport.reportID),
            value: (_c = {},
                _c[optimisticReopenedReportAction.reportActionID] = {
                    errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.other'),
                },
                _c),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.NEXT_STEP).concat(expenseReport.reportID),
            value: currentNextStep,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(expenseReport.reportID),
            value: {
                stateNum: expenseReport.stateNum,
                statusNum: expenseReport.statusNum,
            },
        },
    ];
    if (expenseReport.parentReportID && expenseReport.parentReportActionID) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReport.parentReportID),
            value: (_d = {},
                _d[expenseReport.parentReportActionID] = {
                    childStateNum: predictedNextState,
                    childStatusNum: predictedNextStatus,
                },
                _d),
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReport.parentReportID),
            value: (_e = {},
                _e[expenseReport.parentReportActionID] = {
                    childStateNum: expenseReport.stateNum,
                    childStatusNum: expenseReport.statusNum,
                },
                _e),
        });
    }
    var parameters = {
        reportID: expenseReport.reportID,
        reportActionID: optimisticReopenedReportAction.reportActionID,
    };
    API.write(types_1.WRITE_COMMANDS.REOPEN_REPORT, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function retractReport(expenseReport) {
    var _a, _b, _c, _d, _e;
    var _f;
    if (!expenseReport) {
        return;
    }
    var currentNextStep = (_f = allNextSteps["".concat(ONYXKEYS_1.default.COLLECTION.NEXT_STEP).concat(expenseReport.reportID)]) !== null && _f !== void 0 ? _f : null;
    var optimisticRetractReportAction = (0, ReportUtils_1.buildOptimisticRetractedReportAction)();
    var predictedNextState = CONST_1.default.REPORT.STATE_NUM.OPEN;
    var predictedNextStatus = CONST_1.default.REPORT.STATUS_NUM.OPEN;
    var optimisticNextStep = (0, NextStepUtils_1.buildNextStep)(expenseReport, predictedNextStatus);
    var optimisticReportActionsData = {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReport.reportID),
        value: (_a = {},
            _a[optimisticRetractReportAction.reportActionID] = __assign(__assign({}, optimisticRetractReportAction), { pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD }),
            _a),
    };
    var optimisticIOUReportData = {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(expenseReport.reportID),
        value: __assign(__assign({}, expenseReport), { lastMessageText: (0, ReportActionsUtils_1.getReportActionText)(optimisticRetractReportAction), lastMessageHtml: (0, ReportActionsUtils_1.getReportActionHtml)(optimisticRetractReportAction), stateNum: predictedNextState, statusNum: predictedNextStatus, pendingFields: {
                partial: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            } }),
    };
    var optimisticNextStepData = {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.NEXT_STEP).concat(expenseReport.reportID),
        value: optimisticNextStep,
    };
    var optimisticData = [optimisticIOUReportData, optimisticReportActionsData, optimisticNextStepData];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReport.reportID),
            value: (_b = {},
                _b[optimisticRetractReportAction.reportActionID] = {
                    pendingAction: null,
                },
                _b),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(expenseReport.reportID),
            value: {
                pendingFields: {
                    partial: null,
                },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReport.reportID),
            value: (_c = {},
                _c[optimisticRetractReportAction.reportActionID] = {
                    errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.other'),
                },
                _c),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(expenseReport.reportID),
            value: {
                stateNum: expenseReport.stateNum,
                statusNum: expenseReport.stateNum,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.NEXT_STEP).concat(expenseReport.reportID),
            value: currentNextStep,
        },
    ];
    if (expenseReport.parentReportID && expenseReport.parentReportActionID) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReport.parentReportID),
            value: (_d = {},
                _d[expenseReport.parentReportActionID] = {
                    childStateNum: predictedNextState,
                    childStatusNum: predictedNextStatus,
                },
                _d),
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReport.parentReportID),
            value: (_e = {},
                _e[expenseReport.parentReportActionID] = {
                    childStateNum: expenseReport.stateNum,
                    childStatusNum: expenseReport.statusNum,
                },
                _e),
        });
    }
    var parameters = {
        reportID: expenseReport.reportID,
        reportActionID: optimisticRetractReportAction.reportActionID,
    };
    API.write(types_1.WRITE_COMMANDS.RETRACT_REPORT, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function unapproveExpenseReport(expenseReport) {
    var _a, _b, _c, _d, _e;
    var _f, _g, _h;
    if ((0, EmptyObject_1.isEmptyObject)(expenseReport)) {
        return;
    }
    var currentNextStep = (_f = allNextSteps["".concat(ONYXKEYS_1.default.COLLECTION.NEXT_STEP).concat(expenseReport.reportID)]) !== null && _f !== void 0 ? _f : null;
    var optimisticUnapprovedReportAction = (0, ReportUtils_1.buildOptimisticUnapprovedReportAction)((_g = expenseReport.total) !== null && _g !== void 0 ? _g : 0, (_h = expenseReport.currency) !== null && _h !== void 0 ? _h : '', expenseReport.reportID);
    var optimisticNextStep = (0, NextStepUtils_1.buildNextStep)(expenseReport, CONST_1.default.REPORT.STATUS_NUM.SUBMITTED, false, true);
    var optimisticReportActionData = {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReport.reportID),
        value: (_a = {},
            _a[optimisticUnapprovedReportAction.reportActionID] = __assign(__assign({}, optimisticUnapprovedReportAction), { pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD }),
            _a),
    };
    var optimisticIOUReportData = {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(expenseReport.reportID),
        value: __assign(__assign({}, expenseReport), { lastMessageText: (0, ReportActionsUtils_1.getReportActionText)(optimisticUnapprovedReportAction), lastMessageHtml: (0, ReportActionsUtils_1.getReportActionHtml)(optimisticUnapprovedReportAction), stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED, pendingFields: {
                partial: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            }, isCancelledIOU: false }),
    };
    var optimisticNextStepData = {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.NEXT_STEP).concat(expenseReport.reportID),
        value: optimisticNextStep,
    };
    var optimisticData = [optimisticIOUReportData, optimisticReportActionData, optimisticNextStepData];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReport.reportID),
            value: (_b = {},
                _b[optimisticUnapprovedReportAction.reportActionID] = {
                    pendingAction: null,
                },
                _b),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(expenseReport.reportID),
            value: {
                pendingFields: {
                    partial: null,
                },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReport.reportID),
            value: (_c = {},
                _c[optimisticUnapprovedReportAction.reportActionID] = {
                    errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.other'),
                },
                _c),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.NEXT_STEP).concat(expenseReport.reportID),
            value: currentNextStep,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(expenseReport.reportID),
            value: {
                pendingFields: {
                    partial: null,
                },
                isCancelledIOU: true,
            },
        },
    ];
    if (expenseReport.parentReportID && expenseReport.parentReportActionID) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReport.parentReportID),
            value: (_d = {},
                _d[expenseReport.parentReportActionID] = {
                    childStateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED,
                    childStatusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED,
                },
                _d),
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReport.parentReportID),
            value: (_e = {},
                _e[expenseReport.parentReportActionID] = {
                    childStateNum: expenseReport.stateNum,
                    childStatusNum: expenseReport.statusNum,
                },
                _e),
        });
    }
    var parameters = {
        reportID: expenseReport.reportID,
        reportActionID: optimisticUnapprovedReportAction.reportActionID,
    };
    API.write(types_1.WRITE_COMMANDS.UNAPPROVE_EXPENSE_REPORT, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function submitReport(expenseReport) {
    var _a, _b, _c;
    var _d, _e, _f, _g;
    if (!expenseReport) {
        return;
    }
    if (expenseReport.policyID && (0, SubscriptionUtils_1.shouldRestrictUserBillableActions)(expenseReport.policyID)) {
        Navigation_1.default.navigate(ROUTES_1.default.RESTRICTED_ACTION.getRoute(expenseReport.policyID));
        return;
    }
    var currentNextStep = (_d = allNextSteps["".concat(ONYXKEYS_1.default.COLLECTION.NEXT_STEP).concat(expenseReport.reportID)]) !== null && _d !== void 0 ? _d : null;
    var parentReport = (0, ReportUtils_1.getReportOrDraftReport)(expenseReport.parentReportID);
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = (0, PolicyUtils_1.getPolicy)(expenseReport.policyID);
    var isCurrentUserManager = (currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.accountID) === expenseReport.managerID;
    var isSubmitAndClosePolicy = (0, PolicyUtils_1.isSubmitAndClose)(policy);
    var adminAccountID = (policy === null || policy === void 0 ? void 0 : policy.role) === CONST_1.default.POLICY.ROLE.ADMIN ? currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.accountID : undefined;
    var optimisticSubmittedReportAction = (0, ReportUtils_1.buildOptimisticSubmittedReportAction)((_e = expenseReport === null || expenseReport === void 0 ? void 0 : expenseReport.total) !== null && _e !== void 0 ? _e : 0, (_f = expenseReport.currency) !== null && _f !== void 0 ? _f : '', expenseReport.reportID, adminAccountID);
    var optimisticNextStep = (0, NextStepUtils_1.buildNextStep)(expenseReport, isSubmitAndClosePolicy ? CONST_1.default.REPORT.STATUS_NUM.CLOSED : CONST_1.default.REPORT.STATUS_NUM.SUBMITTED);
    var approvalChain = (0, ReportUtils_1.getApprovalChain)(policy, expenseReport);
    var managerID = (0, PersonalDetailsUtils_1.getAccountIDsByLogins)(approvalChain).at(0);
    var optimisticData = !isSubmitAndClosePolicy
        ? [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReport.reportID),
                value: (_a = {},
                    _a[optimisticSubmittedReportAction.reportActionID] = __assign(__assign({}, optimisticSubmittedReportAction), { pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD }),
                    _a),
            },
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(expenseReport.reportID),
                value: __assign(__assign({}, expenseReport), { managerID: managerID, lastMessageText: (0, ReportActionsUtils_1.getReportActionText)(optimisticSubmittedReportAction), lastMessageHtml: (0, ReportActionsUtils_1.getReportActionHtml)(optimisticSubmittedReportAction), stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED }),
            },
        ]
        : [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(expenseReport.reportID),
                value: __assign(__assign({}, expenseReport), { stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED, statusNum: CONST_1.default.REPORT.STATUS_NUM.CLOSED }),
            },
        ];
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.NEXT_STEP).concat(expenseReport.reportID),
        value: optimisticNextStep,
    });
    if (parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportID) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(parentReport.reportID),
            value: __assign(__assign({}, parentReport), { 
                // In case its a manager who force submitted the report, they are the next user who needs to take an action
                hasOutstandingChildRequest: isCurrentUserManager, iouReportID: null }),
        });
    }
    var successData = [];
    if (!isSubmitAndClosePolicy) {
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReport.reportID),
            value: (_b = {},
                _b[optimisticSubmittedReportAction.reportActionID] = {
                    pendingAction: null,
                },
                _b),
        });
    }
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(expenseReport.reportID),
            value: {
                statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
                stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.NEXT_STEP).concat(expenseReport.reportID),
            value: currentNextStep,
        },
    ];
    if (!isSubmitAndClosePolicy) {
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReport.reportID),
            value: (_c = {},
                _c[optimisticSubmittedReportAction.reportActionID] = {
                    errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.other'),
                },
                _c),
        });
    }
    if (parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportID) {
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(parentReport.reportID),
            value: {
                hasOutstandingChildRequest: parentReport.hasOutstandingChildRequest,
                iouReportID: expenseReport.reportID,
            },
        });
    }
    var parameters = {
        reportID: expenseReport.reportID,
        managerAccountID: (_g = (0, PolicyUtils_1.getSubmitToAccountID)(policy, expenseReport)) !== null && _g !== void 0 ? _g : expenseReport.managerID,
        reportActionID: optimisticSubmittedReportAction.reportActionID,
    };
    API.write(types_1.WRITE_COMMANDS.SUBMIT_REPORT, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function cancelPayment(expenseReport, chatReport) {
    var _a, _b, _c, _d, _e;
    var _f, _g, _h, _j, _k, _l, _m;
    if ((0, EmptyObject_1.isEmptyObject)(expenseReport)) {
        return;
    }
    var optimisticReportAction = (0, ReportUtils_1.buildOptimisticCancelPaymentReportAction)(expenseReport.reportID, -(((_f = expenseReport.total) !== null && _f !== void 0 ? _f : 0) - ((_g = expenseReport === null || expenseReport === void 0 ? void 0 : expenseReport.nonReimbursableTotal) !== null && _g !== void 0 ? _g : 0)), (_h = expenseReport.currency) !== null && _h !== void 0 ? _h : '');
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = (0, PolicyUtils_1.getPolicy)(chatReport.policyID);
    var approvalMode = (_j = policy === null || policy === void 0 ? void 0 : policy.approvalMode) !== null && _j !== void 0 ? _j : CONST_1.default.POLICY.APPROVAL_MODE.BASIC;
    var stateNum = approvalMode === CONST_1.default.POLICY.APPROVAL_MODE.OPTIONAL ? CONST_1.default.REPORT.STATE_NUM.SUBMITTED : CONST_1.default.REPORT.STATE_NUM.APPROVED;
    var statusNum = approvalMode === CONST_1.default.POLICY.APPROVAL_MODE.OPTIONAL ? CONST_1.default.REPORT.STATUS_NUM.SUBMITTED : CONST_1.default.REPORT.STATUS_NUM.APPROVED;
    var optimisticNextStep = (0, NextStepUtils_1.buildNextStep)(expenseReport, statusNum);
    var iouReportActions = (0, ReportActionsUtils_1.getAllReportActions)(chatReport.iouReportID);
    var expenseReportActions = (0, ReportActionsUtils_1.getAllReportActions)(expenseReport.reportID);
    var iouCreatedAction = Object.values(iouReportActions).find(function (action) { return (0, ReportActionsUtils_1.isCreatedAction)(action); });
    var expenseCreatedAction = Object.values(expenseReportActions).find(function (action) { return (0, ReportActionsUtils_1.isCreatedAction)(action); });
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReport.reportID),
            value: (_a = {},
                _a[optimisticReportAction.reportActionID] = __assign(__assign({}, optimisticReportAction), { pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD }),
                _a),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport.reportID),
            value: {
                // The report created later will become the iouReportID of the chat report
                iouReportID: ((_k = iouCreatedAction === null || iouCreatedAction === void 0 ? void 0 : iouCreatedAction.created) !== null && _k !== void 0 ? _k : '') > ((_l = expenseCreatedAction === null || expenseCreatedAction === void 0 ? void 0 : expenseCreatedAction.created) !== null && _l !== void 0 ? _l : '') ? chatReport === null || chatReport === void 0 ? void 0 : chatReport.iouReportID : expenseReport.reportID,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(expenseReport.reportID),
            value: __assign(__assign({}, expenseReport), { isWaitingOnBankAccount: false, lastVisibleActionCreated: optimisticReportAction === null || optimisticReportAction === void 0 ? void 0 : optimisticReportAction.created, lastMessageText: (0, ReportActionsUtils_1.getReportActionText)(optimisticReportAction), lastMessageHtml: (0, ReportActionsUtils_1.getReportActionHtml)(optimisticReportAction), stateNum: stateNum, statusNum: statusNum, isCancelledIOU: true }),
        },
    ];
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.NEXT_STEP).concat(expenseReport.reportID),
        value: optimisticNextStep,
    });
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReport.reportID),
            value: (_b = {},
                _b[optimisticReportAction.reportActionID] = {
                    pendingAction: null,
                },
                _b),
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReport.reportID),
            value: (_c = {},
                _c[optimisticReportAction.reportActionID] = {
                    errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.other'),
                },
                _c),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(expenseReport.reportID),
            value: {
                statusNum: CONST_1.default.REPORT.STATUS_NUM.REIMBURSED,
                isWaitingOnBankAccount: expenseReport.isWaitingOnBankAccount,
                isCancelledIOU: false,
            },
        },
    ];
    if (expenseReport.parentReportID && expenseReport.parentReportActionID) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReport.parentReportID),
            value: (_d = {},
                _d[expenseReport.parentReportActionID] = {
                    childStateNum: stateNum,
                    childStatusNum: statusNum,
                },
                _d),
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReport.parentReportID),
            value: (_e = {},
                _e[expenseReport.parentReportActionID] = {
                    childStateNum: expenseReport.stateNum,
                    childStatusNum: expenseReport.statusNum,
                },
                _e),
        });
    }
    if (chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport.reportID),
            value: {
                iouReportID: expenseReport.reportID,
            },
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport.reportID),
            value: {
                hasOutstandingChildRequest: chatReport.hasOutstandingChildRequest,
                iouReportID: chatReport.iouReportID,
            },
        });
    }
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.NEXT_STEP).concat(expenseReport.reportID),
        value: (0, NextStepUtils_1.buildNextStep)(expenseReport, CONST_1.default.REPORT.STATUS_NUM.REIMBURSED),
    });
    API.write(types_1.WRITE_COMMANDS.CANCEL_PAYMENT, {
        iouReportID: expenseReport.reportID,
        chatReportID: chatReport.reportID,
        managerAccountID: (_m = expenseReport.managerID) !== null && _m !== void 0 ? _m : CONST_1.default.DEFAULT_NUMBER_ID,
        reportActionID: optimisticReportAction.reportActionID,
    }, { optimisticData: optimisticData, successData: successData, failureData: failureData });
    (0, Report_1.notifyNewAction)(expenseReport.reportID, userAccountID);
}
/**
 * Completes onboarding for invite link flow based on the selected payment option
 *
 * @param paymentSelected based on which we choose the onboarding choice and concierge message
 */
function completePaymentOnboarding(paymentSelected, adminsChatReportID, onboardingPolicyID) {
    var _a;
    var isInviteOnboardingComplete = (_a = introSelected === null || introSelected === void 0 ? void 0 : introSelected.isInviteOnboardingComplete) !== null && _a !== void 0 ? _a : false;
    if (isInviteOnboardingComplete || !(introSelected === null || introSelected === void 0 ? void 0 : introSelected.choice) || !(introSelected === null || introSelected === void 0 ? void 0 : introSelected.inviteType)) {
        return;
    }
    var session = (0, SessionUtils_1.getSession)();
    var personalDetailsListValues = Object.values((0, OptionsListUtils_1.getPersonalDetailsForAccountIDs)((session === null || session === void 0 ? void 0 : session.accountID) ? [session.accountID] : [], personalDetailsList));
    var personalDetails = personalDetailsListValues.at(0);
    var onboardingPurpose = introSelected === null || introSelected === void 0 ? void 0 : introSelected.choice;
    if ((introSelected === null || introSelected === void 0 ? void 0 : introSelected.inviteType) === CONST_1.default.ONBOARDING_INVITE_TYPES.IOU && paymentSelected === CONST_1.default.IOU.PAYMENT_SELECTED.BBA) {
        onboardingPurpose = CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM;
    }
    if ((introSelected === null || introSelected === void 0 ? void 0 : introSelected.inviteType) === CONST_1.default.ONBOARDING_INVITE_TYPES.INVOICE && paymentSelected !== CONST_1.default.IOU.PAYMENT_SELECTED.BBA) {
        onboardingPurpose = CONST_1.default.ONBOARDING_CHOICES.CHAT_SPLIT;
    }
    var onboardingMessages = (0, OnboardingFlow_1.getOnboardingMessages)().onboardingMessages;
    (0, Report_1.completeOnboarding)({
        engagementChoice: onboardingPurpose,
        onboardingMessage: onboardingMessages[onboardingPurpose],
        firstName: personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.firstName,
        lastName: personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.lastName,
        adminsChatReportID: adminsChatReportID,
        onboardingPolicyID: onboardingPolicyID,
        paymentSelected: paymentSelected,
        wasInvited: true,
    });
}
function payMoneyRequest(paymentType, chatReport, iouReport, full) {
    var _a, _b;
    if (full === void 0) { full = true; }
    if (chatReport.policyID && (0, SubscriptionUtils_1.shouldRestrictUserBillableActions)(chatReport.policyID)) {
        Navigation_1.default.navigate(ROUTES_1.default.RESTRICTED_ACTION.getRoute(chatReport.policyID));
        return;
    }
    var paymentSelected = paymentType === CONST_1.default.IOU.PAYMENT_TYPE.VBBA ? CONST_1.default.IOU.PAYMENT_SELECTED.BBA : CONST_1.default.IOU.PAYMENT_SELECTED.PBA;
    completePaymentOnboarding(paymentSelected);
    var recipient = { accountID: (_a = iouReport === null || iouReport === void 0 ? void 0 : iouReport.ownerAccountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID };
    var _c = getPayMoneyRequestParams(chatReport, iouReport, recipient, paymentType, full), params = _c.params, optimisticData = _c.optimisticData, successData = _c.successData, failureData = _c.failureData;
    // For now, we need to call the PayMoneyRequestWithWallet API since PayMoneyRequest was not updated to work with
    // Expensify Wallets.
    var apiCommand = paymentType === CONST_1.default.IOU.PAYMENT_TYPE.EXPENSIFY ? types_1.WRITE_COMMANDS.PAY_MONEY_REQUEST_WITH_WALLET : types_1.WRITE_COMMANDS.PAY_MONEY_REQUEST;
    (0, Sound_1.default)(Sound_1.SOUNDS.SUCCESS);
    API.write(apiCommand, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
    (0, Report_1.notifyNewAction)((_b = Navigation_1.default.getTopmostReportId()) !== null && _b !== void 0 ? _b : iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID, userAccountID);
}
function payInvoice(paymentMethodType, chatReport, invoiceReport, payAsBusiness, methodID, paymentMethod) {
    var _a;
    if (payAsBusiness === void 0) { payAsBusiness = false; }
    var recipient = { accountID: (_a = invoiceReport === null || invoiceReport === void 0 ? void 0 : invoiceReport.ownerAccountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID };
    var _b = getPayMoneyRequestParams(chatReport, invoiceReport, recipient, paymentMethodType, true, payAsBusiness), optimisticData = _b.optimisticData, successData = _b.successData, failureData = _b.failureData, _c = _b.params, reportActionID = _c.reportActionID, policyID = _c.policyID, adminsChatReportID = _c.adminsChatReportID, adminsCreatedReportActionID = _c.adminsCreatedReportActionID, expenseChatReportID = _c.expenseChatReportID, expenseCreatedReportActionID = _c.expenseCreatedReportActionID, customUnitRateID = _c.customUnitRateID, customUnitID = _c.customUnitID, ownerEmail = _c.ownerEmail, policyName = _c.policyName;
    var paymentSelected = paymentMethodType === CONST_1.default.IOU.PAYMENT_TYPE.VBBA ? CONST_1.default.IOU.PAYMENT_SELECTED.BBA : CONST_1.default.IOU.PAYMENT_SELECTED.PBA;
    completePaymentOnboarding(paymentSelected);
    var params = {
        reportID: invoiceReport === null || invoiceReport === void 0 ? void 0 : invoiceReport.reportID,
        reportActionID: reportActionID,
        paymentMethodType: paymentMethodType,
        payAsBusiness: payAsBusiness,
    };
    if (paymentMethod === CONST_1.default.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT) {
        params.bankAccountID = methodID;
    }
    if (paymentMethod === CONST_1.default.PAYMENT_METHODS.DEBIT_CARD) {
        params.fundID = methodID;
    }
    if (policyID) {
        params = __assign(__assign({}, params), { policyID: policyID, adminsChatReportID: adminsChatReportID, adminsCreatedReportActionID: adminsCreatedReportActionID, expenseChatReportID: expenseChatReportID, expenseCreatedReportActionID: expenseCreatedReportActionID, customUnitRateID: customUnitRateID, customUnitID: customUnitID, ownerEmail: ownerEmail, policyName: policyName });
    }
    (0, Sound_1.default)(Sound_1.SOUNDS.SUCCESS);
    API.write(types_1.WRITE_COMMANDS.PAY_INVOICE, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function detachReceipt(transactionID) {
    var _a, _b, _c;
    var _d, _e;
    if (!transactionID) {
        return;
    }
    var transaction = allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID)];
    var expenseReport = (_d = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transaction === null || transaction === void 0 ? void 0 : transaction.reportID)]) !== null && _d !== void 0 ? _d : null;
    var policy = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(expenseReport === null || expenseReport === void 0 ? void 0 : expenseReport.policyID)];
    var newTransaction = transaction
        ? __assign(__assign({}, transaction), { filename: '', receipt: {} }) : null;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
            value: __assign(__assign({}, newTransaction), { pendingFields: {
                    receipt: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                } }),
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
            value: {
                pendingFields: {
                    receipt: null,
                },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
            value: __assign(__assign({}, (transaction !== null && transaction !== void 0 ? transaction : null)), { errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.receiptDeleteFailureError'), pendingFields: {
                    receipt: null,
                } }),
        },
    ];
    if (policy && (0, PolicyUtils_1.isPaidGroupPolicy)(policy) && newTransaction) {
        var policyCategories = allPolicyCategories === null || allPolicyCategories === void 0 ? void 0 : allPolicyCategories["".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(policy.id)];
        var policyTagList = (0, Tag_1.getPolicyTagsData)(policy.id);
        var currentTransactionViolations = (_e = allTransactionViolations["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID)]) !== null && _e !== void 0 ? _e : [];
        var violationsOnyxData = ViolationsUtils_1.default.getViolationsOnyxData(newTransaction, currentTransactionViolations, policy, policyTagList !== null && policyTagList !== void 0 ? policyTagList : {}, policyCategories !== null && policyCategories !== void 0 ? policyCategories : {}, (0, PolicyUtils_1.hasDependentTags)(policy, policyTagList !== null && policyTagList !== void 0 ? policyTagList : {}), (0, ReportUtils_1.isInvoiceReport)(expenseReport));
        optimisticData.push(violationsOnyxData);
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID),
            value: currentTransactionViolations,
        });
    }
    var updatedReportAction = (0, ReportUtils_1.buildOptimisticDetachReceipt)(expenseReport === null || expenseReport === void 0 ? void 0 : expenseReport.reportID, transactionID, transaction === null || transaction === void 0 ? void 0 : transaction.merchant);
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(updatedReportAction === null || updatedReportAction === void 0 ? void 0 : updatedReportAction.reportID),
        value: (_a = {},
            _a[updatedReportAction.reportActionID] = updatedReportAction,
            _a),
    });
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(updatedReportAction === null || updatedReportAction === void 0 ? void 0 : updatedReportAction.reportID),
        value: {
            lastVisibleActionCreated: updatedReportAction.created,
            lastReadTime: updatedReportAction.created,
        },
    });
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(updatedReportAction === null || updatedReportAction === void 0 ? void 0 : updatedReportAction.reportID),
        value: {
            lastVisibleActionCreated: expenseReport === null || expenseReport === void 0 ? void 0 : expenseReport.lastVisibleActionCreated,
            lastReadTime: expenseReport === null || expenseReport === void 0 ? void 0 : expenseReport.lastReadTime,
        },
    });
    successData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReport === null || expenseReport === void 0 ? void 0 : expenseReport.reportID),
        value: (_b = {},
            _b[updatedReportAction.reportActionID] = { pendingAction: null },
            _b),
    });
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReport === null || expenseReport === void 0 ? void 0 : expenseReport.reportID),
        value: (_c = {},
            _c[updatedReportAction.reportActionID] = __assign(__assign({}, updatedReportAction), { errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.genericEditFailureMessage') }),
            _c),
    });
    var parameters = { transactionID: transactionID, reportActionID: updatedReportAction.reportActionID };
    API.write(types_1.WRITE_COMMANDS.DETACH_RECEIPT, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function replaceReceipt(_a) {
    var _b, _c;
    var _d, _e, _f;
    var transactionID = _a.transactionID, file = _a.file, source = _a.source;
    if (!file) {
        return;
    }
    var transaction = allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID)];
    var expenseReport = (_d = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transaction === null || transaction === void 0 ? void 0 : transaction.reportID)]) !== null && _d !== void 0 ? _d : null;
    var policy = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(expenseReport === null || expenseReport === void 0 ? void 0 : expenseReport.policyID)];
    var oldReceipt = (_e = transaction === null || transaction === void 0 ? void 0 : transaction.receipt) !== null && _e !== void 0 ? _e : {};
    var receiptOptimistic = {
        source: source,
        state: CONST_1.default.IOU.RECEIPT_STATE.OPEN,
    };
    var newTransaction = transaction && __assign(__assign({}, transaction), { receipt: receiptOptimistic, filename: file.name });
    var retryParams = { transactionID: transactionID, file: undefined, source: source };
    var currentSearchQueryJSON = (0, SearchQueryUtils_1.getCurrentSearchQueryJSON)();
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
            value: {
                receipt: receiptOptimistic,
                filename: file.name,
                pendingFields: {
                    receipt: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                errors: null,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
            value: {
                pendingFields: {
                    receipt: null,
                },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
            value: {
                receipt: !(0, EmptyObject_1.isEmptyObject)(oldReceipt) ? oldReceipt : null,
                filename: transaction === null || transaction === void 0 ? void 0 : transaction.filename,
                errors: getReceiptError(receiptOptimistic, file.name, undefined, undefined, CONST_1.default.IOU.ACTION_PARAMS.REPLACE_RECEIPT, retryParams),
                pendingFields: {
                    receipt: null,
                },
            },
        },
    ];
    if (policy && (0, PolicyUtils_1.isPaidGroupPolicy)(policy) && newTransaction) {
        var policyCategories = allPolicyCategories === null || allPolicyCategories === void 0 ? void 0 : allPolicyCategories["".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(policy.id)];
        var policyTagList = (0, Tag_1.getPolicyTagsData)(policy.id);
        var currentTransactionViolations = (_f = allTransactionViolations["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID)]) !== null && _f !== void 0 ? _f : [];
        var violationsOnyxData = ViolationsUtils_1.default.getViolationsOnyxData(newTransaction, currentTransactionViolations, policy, policyTagList !== null && policyTagList !== void 0 ? policyTagList : {}, policyCategories !== null && policyCategories !== void 0 ? policyCategories : {}, (0, PolicyUtils_1.hasDependentTags)(policy, policyTagList !== null && policyTagList !== void 0 ? policyTagList : {}), (0, ReportUtils_1.isInvoiceReport)(expenseReport));
        optimisticData.push(violationsOnyxData);
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID),
            value: currentTransactionViolations,
        });
    }
    if (currentSearchQueryJSON === null || currentSearchQueryJSON === void 0 ? void 0 : currentSearchQueryJSON.hash) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.SNAPSHOT).concat(currentSearchQueryJSON.hash),
            value: {
                data: (_b = {},
                    _b["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID)] = {
                        receipt: receiptOptimistic,
                        filename: file.name,
                    },
                    _b),
            },
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.SNAPSHOT).concat(currentSearchQueryJSON.hash),
            value: {
                data: (_c = {},
                    _c["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID)] = {
                        receipt: !(0, EmptyObject_1.isEmptyObject)(oldReceipt) ? oldReceipt : null,
                        filename: transaction === null || transaction === void 0 ? void 0 : transaction.filename,
                    },
                    _c),
            },
        });
    }
    var parameters = {
        transactionID: transactionID,
        receipt: file,
    };
    API.write(types_1.WRITE_COMMANDS.REPLACE_RECEIPT, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
/**
 * Finds the participants for an IOU based on the attached report
 * @param transactionID of the transaction to set the participants of
 * @param report attached to the transaction
 */
function getMoneyRequestParticipantsFromReport(report) {
    var _a;
    // If the report is iou or expense report, we should get the chat report to set participant for request money
    var chatReport = (0, ReportUtils_1.isMoneyRequestReport)(report) ? (0, ReportUtils_1.getReportOrDraftReport)(report === null || report === void 0 ? void 0 : report.chatReportID) : report;
    var currentUserAccountID = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.accountID;
    var shouldAddAsReport = !(0, EmptyObject_1.isEmptyObject)(chatReport) && (0, ReportUtils_1.isSelfDM)(chatReport);
    var participants = [];
    if ((0, ReportUtils_1.isPolicyExpenseChat)(chatReport) || shouldAddAsReport) {
        participants = [{ accountID: 0, reportID: chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID, isPolicyExpenseChat: (0, ReportUtils_1.isPolicyExpenseChat)(chatReport), selected: true }];
    }
    else if ((0, ReportUtils_1.isInvoiceRoom)(chatReport)) {
        participants = [
            { reportID: chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID, selected: true },
            {
                policyID: chatReport === null || chatReport === void 0 ? void 0 : chatReport.policyID,
                isSender: true,
                selected: false,
            },
        ];
    }
    else {
        var chatReportOtherParticipants = Object.keys((_a = chatReport === null || chatReport === void 0 ? void 0 : chatReport.participants) !== null && _a !== void 0 ? _a : {})
            .map(Number)
            .filter(function (accountID) { return accountID !== currentUserAccountID; });
        participants = chatReportOtherParticipants.map(function (accountID) { return ({ accountID: accountID, selected: true }); });
    }
    return participants;
}
/**
 * Sets the participants for an IOU based on the attached report
 * @param transactionID of the transaction to set the participants of
 * @param report attached to the transaction
 */
function setMoneyRequestParticipantsFromReport(transactionID, report) {
    var participants = getMoneyRequestParticipantsFromReport(report);
    return react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transactionID), { participants: participants, participantsAutoAssigned: true });
}
function setMoneyRequestTaxRate(transactionID, taxCode) {
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transactionID), { taxCode: taxCode });
}
function setMoneyRequestTaxAmount(transactionID, taxAmount) {
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transactionID), { taxAmount: taxAmount });
}
function dismissHoldUseExplanation() {
    var parameters = {
        name: ONYXKEYS_1.default.NVP_DISMISSED_HOLD_USE_EXPLANATION,
        value: true,
    };
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.NVP_DISMISSED_HOLD_USE_EXPLANATION,
            value: true,
        },
    ];
    API.write(types_1.WRITE_COMMANDS.SET_NAME_VALUE_PAIR, parameters, {
        optimisticData: optimisticData,
    });
}
/**
 * Sets the `splitShares` map that holds individual shares of a split bill
 */
function setSplitShares(transaction, amount, currency, newAccountIDs) {
    var _a;
    if (!transaction) {
        return;
    }
    var oldAccountIDs = Object.keys((_a = transaction.splitShares) !== null && _a !== void 0 ? _a : {}).map(function (key) { return Number(key); });
    // Create an array containing unique IDs of the current transaction participants and the new ones
    // The current userAccountID might not be included in newAccountIDs if this is called from the participants step using Global Create
    // If this is called from an existing group chat, it'll be included. So we manually add them to account for both cases.
    var accountIDs = __spreadArray([], new Set(__spreadArray(__spreadArray([userAccountID], newAccountIDs, true), oldAccountIDs, true)), true);
    var splitShares = accountIDs.reduce(function (acc, accountID) {
        // We want to replace the contents of splitShares to contain only `newAccountIDs` entries
        // In the case of going back to the participants page and removing a participant
        // a simple merge will have the previous participant still present in the splitShares object
        // So we manually set their entry to null
        if (!newAccountIDs.includes(accountID) && accountID !== userAccountID) {
            acc[accountID] = null;
            return acc;
        }
        var isPayer = accountID === userAccountID;
        var participantsLength = newAccountIDs.includes(userAccountID) ? newAccountIDs.length - 1 : newAccountIDs.length;
        var splitAmount = (0, IOUUtils_1.calculateAmount)(participantsLength, amount, currency, isPayer);
        acc[accountID] = {
            amount: splitAmount,
            isModified: false,
        };
        return acc;
    }, {});
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transaction.transactionID), { splitShares: splitShares });
}
function resetSplitShares(transaction, newAmount, currency) {
    var _a;
    if (!transaction) {
        return;
    }
    var accountIDs = Object.keys((_a = transaction.splitShares) !== null && _a !== void 0 ? _a : {}).map(function (key) { return Number(key); });
    if (!accountIDs) {
        return;
    }
    setSplitShares(transaction, newAmount !== null && newAmount !== void 0 ? newAmount : transaction.amount, currency !== null && currency !== void 0 ? currency : transaction.currency, accountIDs);
}
/**
 * Sets an individual split share of the participant accountID supplied
 */
function setIndividualShare(transactionID, participantAccountID, participantShare) {
    var _a;
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transactionID), {
        splitShares: (_a = {},
            _a[participantAccountID] = { amount: participantShare, isModified: true },
            _a),
    });
}
/**
 * Adjusts remaining unmodified shares when another share is modified
 * E.g. if total bill is $100 and split between 3 participants, when the user changes the first share to $50, the remaining unmodified shares will become $25 each.
 */
function adjustRemainingSplitShares(transaction) {
    var _a, _b;
    var modifiedShares = Object.keys((_a = transaction.splitShares) !== null && _a !== void 0 ? _a : {}).filter(function (key) { var _a, _b; return (_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.splitShares) === null || _a === void 0 ? void 0 : _a[Number(key)]) === null || _b === void 0 ? void 0 : _b.isModified; });
    if (!modifiedShares.length) {
        return;
    }
    var sumOfManualShares = modifiedShares
        .map(function (key) { var _a, _b, _c; return (_c = (_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.splitShares) === null || _a === void 0 ? void 0 : _a[Number(key)]) === null || _b === void 0 ? void 0 : _b.amount) !== null && _c !== void 0 ? _c : 0; })
        .reduce(function (prev, current) { return prev + current; }, 0);
    var unmodifiedSharesAccountIDs = Object.keys((_b = transaction.splitShares) !== null && _b !== void 0 ? _b : {})
        .filter(function (key) { var _a, _b; return !((_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.splitShares) === null || _a === void 0 ? void 0 : _a[Number(key)]) === null || _b === void 0 ? void 0 : _b.isModified); })
        .map(function (key) { return Number(key); });
    var remainingTotal = transaction.amount - sumOfManualShares;
    if (remainingTotal < 0) {
        return;
    }
    var splitShares = unmodifiedSharesAccountIDs.reduce(function (acc, accountID, index) {
        var splitAmount = (0, IOUUtils_1.calculateAmount)(unmodifiedSharesAccountIDs.length - 1, remainingTotal, transaction.currency, index === 0);
        acc[accountID] = {
            amount: splitAmount,
        };
        return acc;
    }, {});
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transaction.transactionID), { splitShares: splitShares });
}
/**
 * Put expense on HOLD
 */
function putOnHold(transactionID, comment, reportID, searchHash) {
    var _a, _b, _c, _d;
    var _e, _f, _g;
    var currentTime = DateUtils_1.default.getDBTime();
    var createdReportAction = (0, ReportUtils_1.buildOptimisticHoldReportAction)(currentTime);
    var createdReportActionComment = (0, ReportUtils_1.buildOptimisticHoldReportActionComment)(comment, DateUtils_1.default.addMillisecondsFromDateTime(currentTime, 1));
    var newViolation = { name: CONST_1.default.VIOLATIONS.HOLD, type: CONST_1.default.VIOLATION_TYPES.VIOLATION, showInReview: true };
    var transactionViolations = (_e = allTransactionViolations["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID)]) !== null && _e !== void 0 ? _e : [];
    var updatedViolations = __spreadArray(__spreadArray([], transactionViolations, true), [newViolation], false);
    var parentReportActionOptimistic = (0, ReportUtils_1.getOptimisticDataForParentReportAction)(reportID, createdReportActionComment.created, CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD);
    var transaction = allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID)];
    var iouReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transaction === null || transaction === void 0 ? void 0 : transaction.reportID)];
    var report = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_a = {},
                _a[createdReportAction.reportActionID] = createdReportAction,
                _a[createdReportActionComment.reportActionID] = createdReportActionComment,
                _a),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
            value: {
                pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                comment: {
                    hold: createdReportAction.reportActionID,
                },
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID),
            value: updatedViolations,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                lastVisibleActionCreated: createdReportActionComment.created,
            },
        },
    ];
    if (iouReport && iouReport.currency === (transaction === null || transaction === void 0 ? void 0 : transaction.currency)) {
        var isExpenseReportLocal = (0, ReportUtils_1.isExpenseReport)(iouReport);
        var coefficient = isExpenseReportLocal ? -1 : 1;
        var transactionAmount = (0, TransactionUtils_1.getAmount)(transaction, isExpenseReportLocal) * coefficient;
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iouReport.reportID),
            value: {
                unheldTotal: ((_f = iouReport.unheldTotal) !== null && _f !== void 0 ? _f : 0) - transactionAmount,
                unheldNonReimbursableTotal: !(transaction === null || transaction === void 0 ? void 0 : transaction.reimbursable) ? ((_g = iouReport.unheldNonReimbursableTotal) !== null && _g !== void 0 ? _g : 0) - transactionAmount : iouReport.unheldNonReimbursableTotal,
            },
        });
    }
    parentReportActionOptimistic.forEach(function (parentActionData) {
        if (!parentActionData) {
            return;
        }
        optimisticData.push(parentActionData);
    });
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
            value: {
                pendingAction: null,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
            value: {
                pendingAction: null,
                comment: {
                    hold: null,
                },
                errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.genericHoldExpenseFailureMessage'),
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_b = {},
                _b[createdReportAction.reportActionID] = null,
                _b[createdReportActionComment.reportActionID] = null,
                _b),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                lastVisibleActionCreated: report === null || report === void 0 ? void 0 : report.lastVisibleActionCreated,
            },
        },
    ];
    // If we are holding from the search page, we optimistically update the snapshot data that search uses so that it is kept in sync
    if (searchHash) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.SNAPSHOT).concat(searchHash),
            value: {
                data: (_c = {},
                    _c["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID)] = {
                        canHold: false,
                        canUnhold: true,
                    },
                    _c),
            },
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.SNAPSHOT).concat(searchHash),
            value: {
                data: (_d = {},
                    _d["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID)] = {
                        canHold: true,
                        canUnhold: false,
                    },
                    _d),
            },
        });
    }
    API.write('HoldRequest', {
        transactionID: transactionID,
        comment: comment,
        reportActionID: createdReportAction.reportActionID,
        commentReportActionID: createdReportActionComment.reportActionID,
    }, { optimisticData: optimisticData, successData: successData, failureData: failureData });
    var currentReportID = (0, ReportUtils_1.getDisplayedReportID)(reportID);
    Navigation_1.default.setNavigationActionToMicrotaskQueue(function () { return (0, Report_1.notifyNewAction)(currentReportID, userAccountID); });
}
function putTransactionsOnHold(transactionsID, comment, reportID) {
    transactionsID.forEach(function (transactionID) {
        var _a;
        var childReportID = ((_a = (0, ReportActionsUtils_1.getIOUActionForReportID)(reportID, transactionID)) !== null && _a !== void 0 ? _a : {}).childReportID;
        if (!childReportID) {
            return;
        }
        putOnHold(transactionID, comment, childReportID);
    });
}
/**
 * Remove expense from HOLD
 */
function unholdRequest(transactionID, reportID) {
    var _a, _b;
    var _c, _d, _e;
    var createdReportAction = (0, ReportUtils_1.buildOptimisticUnHoldReportAction)();
    var transactionViolations = allTransactionViolations["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID)];
    var transaction = allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID)];
    var iouReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transaction === null || transaction === void 0 ? void 0 : transaction.reportID)];
    var report = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_a = {},
                _a[createdReportAction.reportActionID] = createdReportAction,
                _a),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
            value: {
                pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                comment: {
                    hold: null,
                },
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID),
            value: (_c = transactionViolations === null || transactionViolations === void 0 ? void 0 : transactionViolations.filter(function (violation) { return violation.name !== CONST_1.default.VIOLATIONS.HOLD; })) !== null && _c !== void 0 ? _c : [],
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                lastVisibleActionCreated: createdReportAction.created,
            },
        },
    ];
    if (iouReport && iouReport.currency === (transaction === null || transaction === void 0 ? void 0 : transaction.currency)) {
        var isExpenseReportLocal = (0, ReportUtils_1.isExpenseReport)(iouReport);
        var coefficient = isExpenseReportLocal ? -1 : 1;
        var transactionAmount = (0, TransactionUtils_1.getAmount)(transaction, isExpenseReportLocal) * coefficient;
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iouReport.reportID),
            value: {
                unheldTotal: ((_d = iouReport.unheldTotal) !== null && _d !== void 0 ? _d : 0) + transactionAmount,
                unheldNonReimbursableTotal: !(transaction === null || transaction === void 0 ? void 0 : transaction.reimbursable) ? ((_e = iouReport.unheldNonReimbursableTotal) !== null && _e !== void 0 ? _e : 0) + transactionAmount : iouReport.unheldNonReimbursableTotal,
            },
        });
    }
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
            value: {
                pendingAction: null,
                comment: {
                    hold: null,
                },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_b = {},
                _b[createdReportAction.reportActionID] = null,
                _b),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
            value: {
                pendingAction: null,
                errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.genericUnholdExpenseFailureMessage'),
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID),
            value: transactionViolations !== null && transactionViolations !== void 0 ? transactionViolations : null,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                lastVisibleActionCreated: report === null || report === void 0 ? void 0 : report.lastVisibleActionCreated,
            },
        },
    ];
    API.write('UnHoldRequest', {
        transactionID: transactionID,
        reportActionID: createdReportAction.reportActionID,
    }, { optimisticData: optimisticData, successData: successData, failureData: failureData });
    var currentReportID = (0, ReportUtils_1.getDisplayedReportID)(reportID);
    (0, Report_1.notifyNewAction)(currentReportID, userAccountID);
}
// eslint-disable-next-line rulesdir/no-negated-variables
function navigateToStartStepIfScanFileCannotBeRead(receiptFilename, receiptPath, onSuccess, requestType, iouType, transactionID, reportID, receiptType, onFailureCallback) {
    if (!receiptFilename || !receiptPath) {
        return;
    }
    var onFailure = function () {
        setMoneyRequestReceipt(transactionID, '', '', true);
        if (requestType === CONST_1.default.IOU.REQUEST_TYPE.MANUAL) {
            if (onFailureCallback) {
                onFailureCallback();
                return;
            }
            Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_SCAN.getRoute(CONST_1.default.IOU.ACTION.CREATE, iouType, transactionID, reportID, Navigation_1.default.getActiveRouteWithoutParams()));
            return;
        }
        (0, IOUUtils_1.navigateToStartMoneyRequestStep)(requestType, iouType, transactionID, reportID);
    };
    (0, FileUtils_1.readFileAsync)(receiptPath.toString(), receiptFilename, onSuccess, onFailure, receiptType);
}
function checkIfScanFileCanBeRead(receiptFilename, receiptPath, receiptType, onSuccess, onFailure) {
    if (!receiptFilename || !receiptPath) {
        return;
    }
    return (0, FileUtils_1.readFileAsync)(receiptPath.toString(), receiptFilename, onSuccess, onFailure, receiptType);
}
/** Save the preferred payment method for a policy */
function savePreferredPaymentMethod(policyID, paymentMethod, type) {
    var _a, _b;
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.NVP_LAST_PAYMENT_METHOD), (_a = {}, _a[policyID] = type ? (_b = {}, _b[type] = paymentMethod, _b[CONST_1.default.LAST_PAYMENT_METHOD.LAST_USED] = { name: paymentMethod }, _b) : paymentMethod, _a));
}
/** Get report policy id of IOU request */
function getIOURequestPolicyID(transaction, report) {
    var _a, _b;
    // Workspace sender will exist for invoices
    var workspaceSender = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.participants) === null || _a === void 0 ? void 0 : _a.find(function (participant) { return participant.isSender; });
    return (_b = workspaceSender === null || workspaceSender === void 0 ? void 0 : workspaceSender.policyID) !== null && _b !== void 0 ? _b : report === null || report === void 0 ? void 0 : report.policyID;
}
function getIOUActionForTransactions(transactionIDList, iouReportID) {
    var _a, _b;
    return (_b = Object.values((_a = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(iouReportID)]) !== null && _a !== void 0 ? _a : {})) === null || _b === void 0 ? void 0 : _b.filter(function (reportAction) {
        if (!(0, ReportActionsUtils_1.isMoneyRequestAction)(reportAction)) {
            return false;
        }
        var message = (0, ReportActionsUtils_1.getOriginalMessage)(reportAction);
        if (!(message === null || message === void 0 ? void 0 : message.IOUTransactionID)) {
            return false;
        }
        return transactionIDList.includes(message.IOUTransactionID);
    });
}
/** Merge several transactions into one by updating the fields of the one we want to keep and deleting the rest */
function mergeDuplicates(params) {
    var _a, _b;
    var _c, _d;
    var originalSelectedTransaction = allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(params.transactionID)];
    var optimisticTransactionData = {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(params.transactionID),
        value: __assign(__assign({}, originalSelectedTransaction), { billable: params.billable, comment: {
                comment: params.comment,
            }, category: params.category, created: params.created, currency: params.currency, modifiedMerchant: params.merchant, reimbursable: params.reimbursable, tag: params.tag }),
    };
    var failureTransactionData = {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(params.transactionID),
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        value: originalSelectedTransaction,
    };
    var optimisticTransactionDuplicatesData = params.transactionIDList.map(function (id) { return ({
        onyxMethod: react_native_onyx_1.default.METHOD.SET,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(id),
        value: null,
    }); });
    var failureTransactionDuplicatesData = params.transactionIDList.map(function (id) { return ({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(id),
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        value: allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(id)],
    }); });
    var optimisticTransactionViolations = __spreadArray(__spreadArray([], params.transactionIDList, true), [params.transactionID], false).map(function (id) {
        var _a;
        var violations = (_a = allTransactionViolations["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(id)]) !== null && _a !== void 0 ? _a : [];
        return {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(id),
            value: violations.filter(function (violation) { return violation.name !== CONST_1.default.VIOLATIONS.DUPLICATED_TRANSACTION; }),
        };
    });
    var failureTransactionViolations = __spreadArray(__spreadArray([], params.transactionIDList, true), [params.transactionID], false).map(function (id) {
        var _a;
        var violations = (_a = allTransactionViolations["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(id)]) !== null && _a !== void 0 ? _a : [];
        return {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(id),
            value: violations,
        };
    });
    var duplicateTransactionTotals = params.transactionIDList.reduce(function (total, id) {
        var duplicateTransaction = allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(id)];
        if (!duplicateTransaction) {
            return total;
        }
        return total + duplicateTransaction.amount;
    }, 0);
    var expenseReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(params.reportID)];
    var expenseReportOptimisticData = {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(params.reportID),
        value: {
            total: ((_c = expenseReport === null || expenseReport === void 0 ? void 0 : expenseReport.total) !== null && _c !== void 0 ? _c : 0) - duplicateTransactionTotals,
        },
    };
    var expenseReportFailureData = {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(params.reportID),
        value: {
            total: expenseReport === null || expenseReport === void 0 ? void 0 : expenseReport.total,
        },
    };
    var iouActionsToDelete = params.reportID ? getIOUActionForTransactions(params.transactionIDList, params.reportID) : [];
    var deletedTime = DateUtils_1.default.getDBTime();
    var expenseReportActionsOptimisticData = {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(params.reportID),
        value: iouActionsToDelete.reduce(function (val, reportAction) {
            var firstMessage = Array.isArray(reportAction.message) ? reportAction.message.at(0) : null;
            // eslint-disable-next-line no-param-reassign
            val[reportAction.reportActionID] = __assign(__assign({ originalMessage: {
                    deleted: deletedTime,
                } }, (firstMessage && {
                message: __spreadArray([
                    __assign(__assign({}, firstMessage), { deleted: deletedTime })
                ], (Array.isArray(reportAction.message) ? reportAction.message.slice(1) : []), true),
            })), (!Array.isArray(reportAction.message) && {
                message: {
                    deleted: deletedTime,
                },
            }));
            return val;
        }, {}),
    };
    var expenseReportActionsFailureData = {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(params.reportID),
        value: iouActionsToDelete.reduce(function (val, reportAction) {
            // eslint-disable-next-line no-param-reassign
            val[reportAction.reportActionID] = {
                originalMessage: {
                    deleted: null,
                },
                message: reportAction.message,
            };
            return val;
        }, {}),
    };
    var optimisticReportAction = (0, ReportUtils_1.buildOptimisticResolvedDuplicatesReportAction)();
    var transactionThreadReportID = params.reportID ? (_d = getIOUActionForTransactions([params.transactionID], params.reportID).at(0)) === null || _d === void 0 ? void 0 : _d.childReportID : undefined;
    var optimisticReportActionData = {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionThreadReportID),
        value: (_a = {},
            _a[optimisticReportAction.reportActionID] = optimisticReportAction,
            _a),
    };
    var failureReportActionData = {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionThreadReportID),
        value: (_b = {},
            _b[optimisticReportAction.reportActionID] = null,
            _b),
    };
    var optimisticData = [];
    var failureData = [];
    optimisticData.push.apply(optimisticData, __spreadArray(__spreadArray(__spreadArray([optimisticTransactionData], optimisticTransactionDuplicatesData, false), optimisticTransactionViolations, false), [expenseReportOptimisticData,
        expenseReportActionsOptimisticData,
        optimisticReportActionData], false));
    failureData.push.apply(failureData, __spreadArray(__spreadArray(__spreadArray([failureTransactionData], failureTransactionDuplicatesData, false), failureTransactionViolations, false), [expenseReportFailureData,
        expenseReportActionsFailureData,
        failureReportActionData], false));
    API.write(types_1.WRITE_COMMANDS.MERGE_DUPLICATES, __assign(__assign({}, params), { reportActionID: optimisticReportAction.reportActionID }), { optimisticData: optimisticData, failureData: failureData });
}
function updateLastLocationPermissionPrompt() {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.NVP_LAST_LOCATION_PERMISSION_PROMPT, new Date().toISOString());
}
/** Instead of merging the duplicates, it updates the transaction we want to keep and puts the others on hold without deleting them */
function resolveDuplicates(params) {
    var _a, _b;
    var _c;
    if (!params.transactionID) {
        return;
    }
    var originalSelectedTransaction = allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(params.transactionID)];
    var optimisticTransactionData = {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(params.transactionID),
        value: __assign(__assign({}, originalSelectedTransaction), { billable: params.billable, comment: {
                comment: params.comment,
            }, category: params.category, created: params.created, currency: params.currency, modifiedMerchant: params.merchant, reimbursable: params.reimbursable, tag: params.tag }),
    };
    var failureTransactionData = {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(params.transactionID),
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        value: originalSelectedTransaction,
    };
    var optimisticTransactionViolations = __spreadArray(__spreadArray([], params.transactionIDList, true), [params.transactionID], false).map(function (id) {
        var _a;
        var violations = (_a = allTransactionViolations["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(id)]) !== null && _a !== void 0 ? _a : [];
        var newViolation = { name: CONST_1.default.VIOLATIONS.HOLD, type: CONST_1.default.VIOLATION_TYPES.VIOLATION };
        var updatedViolations = id === params.transactionID ? violations : __spreadArray(__spreadArray([], violations, true), [newViolation], false);
        return {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(id),
            value: updatedViolations.filter(function (violation) { return violation.name !== CONST_1.default.VIOLATIONS.DUPLICATED_TRANSACTION; }),
        };
    });
    var failureTransactionViolations = __spreadArray(__spreadArray([], params.transactionIDList, true), [params.transactionID], false).map(function (id) {
        var _a;
        var violations = (_a = allTransactionViolations["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(id)]) !== null && _a !== void 0 ? _a : [];
        return {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(id),
            value: violations,
        };
    });
    var iouActionList = params.reportID ? getIOUActionForTransactions(params.transactionIDList, params.reportID) : [];
    var orderedTransactionIDList = iouActionList
        .map(function (action) {
        var message = (0, ReportActionsUtils_1.getOriginalMessage)(action);
        return message === null || message === void 0 ? void 0 : message.IOUTransactionID;
    })
        .filter(function (id) { return !!id; });
    var optimisticHoldActions = [];
    var failureHoldActions = [];
    var reportActionIDList = [];
    var optimisticHoldTransactionActions = [];
    var failureHoldTransactionActions = [];
    iouActionList.forEach(function (action) {
        var _a, _b;
        var _c, _d;
        var transactionThreadReportID = action === null || action === void 0 ? void 0 : action.childReportID;
        var createdReportAction = (0, ReportUtils_1.buildOptimisticHoldReportAction)();
        reportActionIDList.push(createdReportAction.reportActionID);
        var transactionID = (0, ReportActionsUtils_1.isMoneyRequestAction)(action) ? ((_d = (_c = (0, ReportActionsUtils_1.getOriginalMessage)(action)) === null || _c === void 0 ? void 0 : _c.IOUTransactionID) !== null && _d !== void 0 ? _d : CONST_1.default.DEFAULT_NUMBER_ID) : CONST_1.default.DEFAULT_NUMBER_ID;
        optimisticHoldTransactionActions.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
            value: {
                comment: {
                    hold: createdReportAction.reportActionID,
                },
            },
        });
        failureHoldTransactionActions.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
            value: {
                comment: {
                    hold: null,
                },
            },
        });
        optimisticHoldActions.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionThreadReportID),
            value: (_a = {},
                _a[createdReportAction.reportActionID] = createdReportAction,
                _a),
        });
        failureHoldActions.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionThreadReportID),
            value: (_b = {},
                _b[createdReportAction.reportActionID] = {
                    errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.genericHoldExpenseFailureMessage'),
                },
                _b),
        });
    });
    var transactionThreadReportID = params.reportID ? (_c = getIOUActionForTransactions([params.transactionID], params.reportID).at(0)) === null || _c === void 0 ? void 0 : _c.childReportID : undefined;
    var optimisticReportAction = (0, ReportUtils_1.buildOptimisticDismissedViolationReportAction)({
        reason: 'manual',
        violationName: CONST_1.default.VIOLATIONS.DUPLICATED_TRANSACTION,
    });
    var optimisticReportActionData = {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionThreadReportID),
        value: (_a = {},
            _a[optimisticReportAction.reportActionID] = optimisticReportAction,
            _a),
    };
    var failureReportActionData = {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionThreadReportID),
        value: (_b = {},
            _b[optimisticReportAction.reportActionID] = null,
            _b),
    };
    var optimisticData = [];
    var failureData = [];
    optimisticData.push.apply(optimisticData, __spreadArray(__spreadArray(__spreadArray(__spreadArray([optimisticTransactionData], optimisticTransactionViolations, false), optimisticHoldActions, false), optimisticHoldTransactionActions, false), [optimisticReportActionData], false));
    failureData.push.apply(failureData, __spreadArray(__spreadArray(__spreadArray(__spreadArray([failureTransactionData], failureTransactionViolations, false), failureHoldActions, false), failureHoldTransactionActions, false), [failureReportActionData], false));
    var reportID = params.reportID, transactionIDList = params.transactionIDList, receiptID = params.receiptID, otherParams = __rest(params, ["reportID", "transactionIDList", "receiptID"]);
    var parameters = __assign(__assign({}, otherParams), { transactionID: params.transactionID, reportActionIDList: reportActionIDList, transactionIDList: orderedTransactionIDList, dismissedViolationReportActionID: optimisticReportAction.reportActionID });
    API.write(types_1.WRITE_COMMANDS.RESOLVE_DUPLICATES, parameters, { optimisticData: optimisticData, failureData: failureData });
}
function getSearchOnyxUpdate(_a) {
    var _b, _c, _d, _e, _f, _g;
    var participant = _a.participant, transaction = _a.transaction, iouReport = _a.iouReport, policy = _a.policy, transactionThreadReportID = _a.transactionThreadReportID, isFromOneTransactionReport = _a.isFromOneTransactionReport, isInvoice = _a.isInvoice;
    var toAccountID = participant === null || participant === void 0 ? void 0 : participant.accountID;
    var fromAccountID = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.accountID;
    var currentSearchQueryJSON = (0, SearchQueryUtils_1.getCurrentSearchQueryJSON)();
    if (currentSearchQueryJSON && toAccountID != null && fromAccountID != null) {
        var validSearchTypes = (!isInvoice && currentSearchQueryJSON.type === CONST_1.default.SEARCH.DATA_TYPES.EXPENSE) || (isInvoice && currentSearchQueryJSON.type === CONST_1.default.SEARCH.DATA_TYPES.INVOICE);
        var shouldOptimisticallyUpdate = currentSearchQueryJSON.status === CONST_1.default.SEARCH.STATUS.EXPENSE.ALL && validSearchTypes && currentSearchQueryJSON.flatFilters.length === 0;
        if (shouldOptimisticallyUpdate) {
            var isOptimisticToAccountData = (0, ReportUtils_1.isOptimisticPersonalDetail)(toAccountID);
            var successData = [];
            if (isOptimisticToAccountData) {
                // The optimistic personal detail is removed on the API's success data but we can't change the managerID of the transaction in the snapshot.
                // So we need to add the optimistic personal detail back to the snapshot in success data to prevent the flickering.
                // After that, it will be cleared via Search API.
                // See https://github.com/Expensify/App/issues/61310 for more information.
                successData.push({
                    onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                    key: "".concat(ONYXKEYS_1.default.COLLECTION.SNAPSHOT).concat(currentSearchQueryJSON.hash),
                    value: {
                        data: (_b = {},
                            _b[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = (_c = {},
                                _c[toAccountID] = {
                                    accountID: toAccountID,
                                    displayName: participant === null || participant === void 0 ? void 0 : participant.displayName,
                                    login: participant === null || participant === void 0 ? void 0 : participant.login,
                                },
                                _c),
                            _b),
                    },
                });
            }
            return {
                optimisticData: [
                    {
                        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.SNAPSHOT).concat(currentSearchQueryJSON.hash),
                        value: {
                            data: __assign(__assign((_d = {}, _d[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = (_e = {},
                                _e[toAccountID] = {
                                    accountID: toAccountID,
                                    displayName: participant === null || participant === void 0 ? void 0 : participant.displayName,
                                    login: participant === null || participant === void 0 ? void 0 : participant.login,
                                },
                                _e[fromAccountID] = {
                                    accountID: fromAccountID,
                                    avatar: currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.avatar,
                                    displayName: currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.displayName,
                                    login: currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.login,
                                },
                                _e), _d["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID)] = __assign(__assign(__assign({ accountID: fromAccountID, managerID: toAccountID }, (transactionThreadReportID && { transactionThreadReportID: transactionThreadReportID })), (isFromOneTransactionReport && { isFromOneTransactionReport: isFromOneTransactionReport })), transaction), _d), (policy && (_f = {}, _f["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policy.id)] = policy, _f))), (iouReport && (_g = {}, _g["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iouReport.reportID)] = iouReport, _g))),
                        },
                    },
                ],
                successData: successData,
            };
        }
    }
}
/**
 * Create a draft transaction to set up split expense details for the split expense flow
 */
function initSplitExpense(transaction, reportID, isOpenCreatedSplit) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    if (!transaction) {
        return;
    }
    if (isOpenCreatedSplit) {
        var originalTransactionID_1 = (_a = transaction.comment) === null || _a === void 0 ? void 0 : _a.originalTransactionID;
        var originalTransaction = allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(originalTransactionID_1)];
        var relatedTransactions = Object.values(allTransactions).filter(function (currentTransaction) {
            var _a;
            var currentReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(currentTransaction === null || currentTransaction === void 0 ? void 0 : currentTransaction.reportID)];
            return ((_a = currentTransaction === null || currentTransaction === void 0 ? void 0 : currentTransaction.comment) === null || _a === void 0 ? void 0 : _a.originalTransactionID) === originalTransactionID_1 && !!currentReport && (currentReport === null || currentReport === void 0 ? void 0 : currentReport.stateNum) !== CONST_1.default.REPORT.STATUS_NUM.CLOSED;
        });
        var transactionDetails_1 = (0, ReportUtils_1.getTransactionDetails)(originalTransaction);
        var draftTransaction_1 = (0, TransactionUtils_1.buildOptimisticTransaction)({
            originalTransactionID: originalTransactionID_1,
            transactionParams: {
                splitExpenses: relatedTransactions.map(function (currentTransaction) {
                    var _a, _b, _c;
                    var currentTransactionDetails = (0, ReportUtils_1.getTransactionDetails)(currentTransaction);
                    return {
                        transactionID: (_a = currentTransaction === null || currentTransaction === void 0 ? void 0 : currentTransaction.transactionID) !== null && _a !== void 0 ? _a : String(CONST_1.default.DEFAULT_NUMBER_ID),
                        amount: (_b = currentTransactionDetails === null || currentTransactionDetails === void 0 ? void 0 : currentTransactionDetails.amount) !== null && _b !== void 0 ? _b : 0,
                        description: currentTransactionDetails === null || currentTransactionDetails === void 0 ? void 0 : currentTransactionDetails.comment,
                        category: currentTransactionDetails === null || currentTransactionDetails === void 0 ? void 0 : currentTransactionDetails.category,
                        tags: (currentTransactionDetails === null || currentTransactionDetails === void 0 ? void 0 : currentTransactionDetails.tag) ? [currentTransactionDetails === null || currentTransactionDetails === void 0 ? void 0 : currentTransactionDetails.tag] : [],
                        created: (_c = currentTransaction === null || currentTransaction === void 0 ? void 0 : currentTransaction.created) !== null && _c !== void 0 ? _c : '',
                    };
                }),
                amount: (_b = transactionDetails_1 === null || transactionDetails_1 === void 0 ? void 0 : transactionDetails_1.amount) !== null && _b !== void 0 ? _b : 0,
                currency: (_c = transactionDetails_1 === null || transactionDetails_1 === void 0 ? void 0 : transactionDetails_1.currency) !== null && _c !== void 0 ? _c : CONST_1.default.CURRENCY.USD,
                merchant: (_d = transactionDetails_1 === null || transactionDetails_1 === void 0 ? void 0 : transactionDetails_1.merchant) !== null && _d !== void 0 ? _d : '',
                participants: transaction === null || transaction === void 0 ? void 0 : transaction.participants,
                attendees: transactionDetails_1 === null || transactionDetails_1 === void 0 ? void 0 : transactionDetails_1.attendees,
                reportID: originalTransaction === null || originalTransaction === void 0 ? void 0 : originalTransaction.reportID,
            },
        });
        react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.SPLIT_TRANSACTION_DRAFT).concat(originalTransactionID_1), draftTransaction_1);
        Navigation_1.default.navigate(ROUTES_1.default.SPLIT_EXPENSE.getRoute((_e = originalTransaction === null || originalTransaction === void 0 ? void 0 : originalTransaction.reportID) !== null && _e !== void 0 ? _e : String(CONST_1.default.DEFAULT_NUMBER_ID), originalTransactionID_1, transaction.transactionID, Navigation_1.default.getActiveRouteWithoutParams()));
        return;
    }
    var transactionDetails = (0, ReportUtils_1.getTransactionDetails)(transaction);
    var transactionDetailsAmount = (_f = transactionDetails === null || transactionDetails === void 0 ? void 0 : transactionDetails.amount) !== null && _f !== void 0 ? _f : 0;
    var defaultCreated = DateUtils_1.default.formatWithUTCTimeZone(DateUtils_1.default.getDBTime(), CONST_1.default.DATE.FNS_FORMAT_STRING);
    var draftTransaction = (0, TransactionUtils_1.buildOptimisticTransaction)({
        originalTransactionID: transaction.transactionID,
        transactionParams: {
            splitExpenses: [
                {
                    transactionID: NumberUtils.rand64(),
                    amount: Math.floor(transactionDetailsAmount / 2),
                    description: transactionDetails === null || transactionDetails === void 0 ? void 0 : transactionDetails.comment,
                    category: transactionDetails === null || transactionDetails === void 0 ? void 0 : transactionDetails.category,
                    tags: (transaction === null || transaction === void 0 ? void 0 : transaction.tag) ? [transaction === null || transaction === void 0 ? void 0 : transaction.tag] : [],
                    created: (_g = transactionDetails === null || transactionDetails === void 0 ? void 0 : transactionDetails.created) !== null && _g !== void 0 ? _g : defaultCreated,
                },
                {
                    transactionID: NumberUtils.rand64(),
                    amount: Math.ceil(transactionDetailsAmount / 2),
                    description: transactionDetails === null || transactionDetails === void 0 ? void 0 : transactionDetails.comment,
                    category: transactionDetails === null || transactionDetails === void 0 ? void 0 : transactionDetails.category,
                    tags: (transaction === null || transaction === void 0 ? void 0 : transaction.tag) ? [transaction === null || transaction === void 0 ? void 0 : transaction.tag] : [],
                    created: (_h = transactionDetails === null || transactionDetails === void 0 ? void 0 : transactionDetails.created) !== null && _h !== void 0 ? _h : defaultCreated,
                },
            ],
            amount: transactionDetailsAmount,
            currency: (_j = transactionDetails === null || transactionDetails === void 0 ? void 0 : transactionDetails.currency) !== null && _j !== void 0 ? _j : CONST_1.default.CURRENCY.USD,
            merchant: (_k = transactionDetails === null || transactionDetails === void 0 ? void 0 : transactionDetails.merchant) !== null && _k !== void 0 ? _k : '',
            participants: transaction === null || transaction === void 0 ? void 0 : transaction.participants,
            attendees: transactionDetails === null || transactionDetails === void 0 ? void 0 : transactionDetails.attendees,
            reportID: reportID,
        },
    });
    react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.SPLIT_TRANSACTION_DRAFT).concat(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID), draftTransaction);
    Navigation_1.default.navigate(ROUTES_1.default.SPLIT_EXPENSE.getRoute(reportID !== null && reportID !== void 0 ? reportID : String(CONST_1.default.DEFAULT_NUMBER_ID), transaction.transactionID, undefined, Navigation_1.default.getActiveRoute()));
}
/**
 * Create a draft transaction to set up split expense details for edit split details
 */
function initDraftSplitExpenseDataForEdit(draftTransaction, splitExpenseTransactionID, reportID) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (!draftTransaction || !splitExpenseTransactionID) {
        return;
    }
    var originalTransactionID = (_a = draftTransaction === null || draftTransaction === void 0 ? void 0 : draftTransaction.comment) === null || _a === void 0 ? void 0 : _a.originalTransactionID;
    var originalTransaction = allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(originalTransactionID)];
    var splitTransactionData = (_c = (_b = draftTransaction === null || draftTransaction === void 0 ? void 0 : draftTransaction.comment) === null || _b === void 0 ? void 0 : _b.splitExpenses) === null || _c === void 0 ? void 0 : _c.find(function (item) { return item.transactionID === splitExpenseTransactionID; });
    var transactionDetails = (0, ReportUtils_1.getTransactionDetails)(originalTransaction);
    var editDraftTransaction = (0, TransactionUtils_1.buildOptimisticTransaction)({
        existingTransactionID: CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID,
        originalTransactionID: originalTransactionID,
        transactionParams: {
            amount: Number(splitTransactionData === null || splitTransactionData === void 0 ? void 0 : splitTransactionData.amount),
            currency: (_d = transactionDetails === null || transactionDetails === void 0 ? void 0 : transactionDetails.currency) !== null && _d !== void 0 ? _d : CONST_1.default.CURRENCY.USD,
            comment: splitTransactionData === null || splitTransactionData === void 0 ? void 0 : splitTransactionData.description,
            tag: (_e = splitTransactionData === null || splitTransactionData === void 0 ? void 0 : splitTransactionData.tags) === null || _e === void 0 ? void 0 : _e.at(0),
            merchant: (_f = transactionDetails === null || transactionDetails === void 0 ? void 0 : transactionDetails.merchant) !== null && _f !== void 0 ? _f : '',
            participants: draftTransaction === null || draftTransaction === void 0 ? void 0 : draftTransaction.participants,
            attendees: transactionDetails === null || transactionDetails === void 0 ? void 0 : transactionDetails.attendees,
            reportID: reportID,
            created: (_g = splitTransactionData === null || splitTransactionData === void 0 ? void 0 : splitTransactionData.created) !== null && _g !== void 0 ? _g : '',
            category: (_h = splitTransactionData === null || splitTransactionData === void 0 ? void 0 : splitTransactionData.category) !== null && _h !== void 0 ? _h : '',
        },
    });
    react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.SPLIT_TRANSACTION_DRAFT).concat(CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID), editDraftTransaction);
    Navigation_1.default.navigate(ROUTES_1.default.SPLIT_EXPENSE_EDIT.getRoute(reportID, originalTransactionID, splitTransactionData === null || splitTransactionData === void 0 ? void 0 : splitTransactionData.transactionID, Navigation_1.default.getActiveRoute()));
}
/**
 * Append a new split expense entry to the draft transaction’s splitExpenses array
 */
function addSplitExpenseField(transaction, draftTransaction) {
    var _a, _b, _c;
    if (!transaction || !draftTransaction) {
        return;
    }
    var transactionDetails = (0, ReportUtils_1.getTransactionDetails)(transaction);
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.SPLIT_TRANSACTION_DRAFT).concat(transaction.transactionID), {
        comment: {
            splitExpenses: __spreadArray(__spreadArray([], ((_b = (_a = draftTransaction.comment) === null || _a === void 0 ? void 0 : _a.splitExpenses) !== null && _b !== void 0 ? _b : []), true), [
                {
                    transactionID: NumberUtils.rand64(),
                    amount: 0,
                    description: transactionDetails === null || transactionDetails === void 0 ? void 0 : transactionDetails.comment,
                    category: transactionDetails === null || transactionDetails === void 0 ? void 0 : transactionDetails.category,
                    tags: (transaction === null || transaction === void 0 ? void 0 : transaction.tag) ? [transaction === null || transaction === void 0 ? void 0 : transaction.tag] : [],
                    created: (_c = transactionDetails === null || transactionDetails === void 0 ? void 0 : transactionDetails.created) !== null && _c !== void 0 ? _c : DateUtils_1.default.formatWithUTCTimeZone(DateUtils_1.default.getDBTime(), CONST_1.default.DATE.FNS_FORMAT_STRING),
                },
            ], false),
        },
    });
}
function removeSplitExpenseField(draftTransaction, splitExpenseTransactionID) {
    var _a, _b, _c;
    if (!draftTransaction || !splitExpenseTransactionID) {
        return;
    }
    var originalTransactionID = (_a = draftTransaction === null || draftTransaction === void 0 ? void 0 : draftTransaction.comment) === null || _a === void 0 ? void 0 : _a.originalTransactionID;
    var splitExpenses = (_c = (_b = draftTransaction.comment) === null || _b === void 0 ? void 0 : _b.splitExpenses) === null || _c === void 0 ? void 0 : _c.filter(function (item) { return item.transactionID !== splitExpenseTransactionID; });
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.SPLIT_TRANSACTION_DRAFT).concat(originalTransactionID), {
        comment: {
            splitExpenses: splitExpenses,
        },
    });
}
function updateSplitExpenseField(splitExpenseDraftTransaction, splitExpenseTransactionID) {
    var _a, _b, _c;
    if (!splitExpenseDraftTransaction || !splitExpenseTransactionID) {
        return;
    }
    var originalTransactionID = (_a = splitExpenseDraftTransaction === null || splitExpenseDraftTransaction === void 0 ? void 0 : splitExpenseDraftTransaction.comment) === null || _a === void 0 ? void 0 : _a.originalTransactionID;
    var draftTransaction = allDraftSplitTransactions["".concat(ONYXKEYS_1.default.COLLECTION.SPLIT_TRANSACTION_DRAFT).concat(originalTransactionID)];
    var splitExpenses = (_c = (_b = draftTransaction === null || draftTransaction === void 0 ? void 0 : draftTransaction.comment) === null || _b === void 0 ? void 0 : _b.splitExpenses) === null || _c === void 0 ? void 0 : _c.map(function (item) {
        var _a;
        if (item.transactionID === splitExpenseTransactionID) {
            var transactionDetails = (0, ReportUtils_1.getTransactionDetails)(splitExpenseDraftTransaction);
            return __assign(__assign({}, item), { description: transactionDetails === null || transactionDetails === void 0 ? void 0 : transactionDetails.comment, category: transactionDetails === null || transactionDetails === void 0 ? void 0 : transactionDetails.category, tags: (splitExpenseDraftTransaction === null || splitExpenseDraftTransaction === void 0 ? void 0 : splitExpenseDraftTransaction.tag) ? [splitExpenseDraftTransaction === null || splitExpenseDraftTransaction === void 0 ? void 0 : splitExpenseDraftTransaction.tag] : [], created: (_a = transactionDetails === null || transactionDetails === void 0 ? void 0 : transactionDetails.created) !== null && _a !== void 0 ? _a : DateUtils_1.default.formatWithUTCTimeZone(DateUtils_1.default.getDBTime(), CONST_1.default.DATE.FNS_FORMAT_STRING) });
        }
        return item;
    });
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.SPLIT_TRANSACTION_DRAFT).concat(originalTransactionID), {
        comment: {
            splitExpenses: splitExpenses,
        },
    });
}
function updateSplitExpenseAmountField(draftTransaction, currentItemTransactionID, amount) {
    var _a, _b, _c;
    if (!(draftTransaction === null || draftTransaction === void 0 ? void 0 : draftTransaction.transactionID) || !currentItemTransactionID) {
        return;
    }
    var updatedSplitExpenses = (_b = (_a = draftTransaction.comment) === null || _a === void 0 ? void 0 : _a.splitExpenses) === null || _b === void 0 ? void 0 : _b.map(function (splitExpense) {
        if (splitExpense.transactionID === currentItemTransactionID) {
            return __assign(__assign({}, splitExpense), { amount: amount });
        }
        return splitExpense;
    });
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.SPLIT_TRANSACTION_DRAFT).concat((_c = draftTransaction === null || draftTransaction === void 0 ? void 0 : draftTransaction.comment) === null || _c === void 0 ? void 0 : _c.originalTransactionID), {
        comment: {
            splitExpenses: updatedSplitExpenses,
        },
    });
}
function saveSplitTransactions(draftTransaction, hash) {
    var _a, _b, _c;
    var _d, _e, _f, _g, _h, _j, _k;
    var transactionReport = (0, ReportUtils_1.getReportOrDraftReport)(draftTransaction === null || draftTransaction === void 0 ? void 0 : draftTransaction.reportID);
    var parentTransactionReport = (0, ReportUtils_1.getReportOrDraftReport)(transactionReport === null || transactionReport === void 0 ? void 0 : transactionReport.parentReportID);
    var expenseReport = (transactionReport === null || transactionReport === void 0 ? void 0 : transactionReport.type) === CONST_1.default.REPORT.TYPE.EXPENSE ? transactionReport : parentTransactionReport;
    var originalTransactionID = (_e = (_d = draftTransaction === null || draftTransaction === void 0 ? void 0 : draftTransaction.comment) === null || _d === void 0 ? void 0 : _d.originalTransactionID) !== null && _e !== void 0 ? _e : CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID;
    var originalTransaction = allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(originalTransactionID)];
    var originalTransactionViolations = (_f = allTransactionViolations["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(originalTransactionID)]) !== null && _f !== void 0 ? _f : [];
    var iouActions = getIOUActionForTransactions([originalTransactionID], expenseReport === null || expenseReport === void 0 ? void 0 : expenseReport.reportID);
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = (0, PolicyUtils_1.getPolicy)(expenseReport === null || expenseReport === void 0 ? void 0 : expenseReport.policyID);
    var policyCategories = (0, Category_1.getPolicyCategoriesData)(expenseReport === null || expenseReport === void 0 ? void 0 : expenseReport.policyID);
    var policyTags = (0, Tag_1.getPolicyTagsData)(expenseReport === null || expenseReport === void 0 ? void 0 : expenseReport.policyID);
    var participants = getMoneyRequestParticipantsFromReport(expenseReport);
    var splitExpenses = (_h = (_g = draftTransaction === null || draftTransaction === void 0 ? void 0 : draftTransaction.comment) === null || _g === void 0 ? void 0 : _g.splitExpenses) !== null && _h !== void 0 ? _h : [];
    var splits = (_j = splitExpenses.map(function (split) {
        var _a, _b, _c, _d, _e;
        var currentDescription = (0, ReportUtils_1.getParsedComment)(Parser_1.default.htmlToMarkdown((_a = split.description) !== null && _a !== void 0 ? _a : ''));
        return {
            amount: split.amount,
            category: (_b = split.category) !== null && _b !== void 0 ? _b : '',
            tag: (_d = (_c = split.tags) === null || _c === void 0 ? void 0 : _c[0]) !== null && _d !== void 0 ? _d : '',
            created: split.created,
            merchant: (_e = draftTransaction === null || draftTransaction === void 0 ? void 0 : draftTransaction.merchant) !== null && _e !== void 0 ? _e : '',
            transactionID: split.transactionID,
            comment: {
                comment: currentDescription,
            },
        };
    })) !== null && _j !== void 0 ? _j : [];
    var successData = [];
    var failureData = [];
    var optimisticData = [];
    splitExpenses.forEach(function (splitExpense, index) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        var requestMoneyInformation = {
            report: expenseReport,
            participantParams: {
                participant: (_a = participants.at(0)) !== null && _a !== void 0 ? _a : {},
                payeeEmail: (_b = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.login) !== null && _b !== void 0 ? _b : '',
                payeeAccountID: (_c = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.accountID) !== null && _c !== void 0 ? _c : CONST_1.default.DEFAULT_NUMBER_ID,
            },
            policyParams: {
                policy: policy,
                policyCategories: policyCategories,
                policyTags: policyTags,
            },
            transactionParams: {
                amount: (_d = splitExpense.amount) !== null && _d !== void 0 ? _d : 0,
                currency: (_e = draftTransaction === null || draftTransaction === void 0 ? void 0 : draftTransaction.currency) !== null && _e !== void 0 ? _e : CONST_1.default.CURRENCY.USD,
                created: splitExpense.created,
                merchant: (_f = draftTransaction === null || draftTransaction === void 0 ? void 0 : draftTransaction.merchant) !== null && _f !== void 0 ? _f : '',
                comment: splitExpense.description,
                category: splitExpense.category,
                tag: (_g = splitExpense.tags) === null || _g === void 0 ? void 0 : _g[0],
                originalTransactionID: originalTransactionID,
                attendees: (_h = draftTransaction === null || draftTransaction === void 0 ? void 0 : draftTransaction.comment) === null || _h === void 0 ? void 0 : _h.attendees,
                source: CONST_1.default.IOU.TYPE.SPLIT,
            },
        };
        var report = requestMoneyInformation.report, participantParams = requestMoneyInformation.participantParams, policyParams = requestMoneyInformation.policyParams, transactionParams = requestMoneyInformation.transactionParams;
        var parsedComment = (0, ReportUtils_1.getParsedComment)(Parser_1.default.htmlToMarkdown((_j = transactionParams.comment) !== null && _j !== void 0 ? _j : ''));
        transactionParams.comment = parsedComment;
        var currentChatReport = (0, ReportUtils_1.getReportOrDraftReport)(report === null || report === void 0 ? void 0 : report.chatReportID);
        var parentChatReport = (0, ReportUtils_1.getReportOrDraftReport)(currentChatReport === null || currentChatReport === void 0 ? void 0 : currentChatReport.parentReportID);
        var existingTransactionID = splitExpense.transactionID;
        var _o = getMoneyRequestInformation({
            participantParams: participantParams,
            parentChatReport: parentChatReport,
            policyParams: policyParams,
            transactionParams: transactionParams,
            moneyRequestReportID: report === null || report === void 0 ? void 0 : report.reportID,
            existingTransaction: originalTransaction,
            existingTransactionID: existingTransactionID,
            isSplitExpense: true,
        }), transactionThreadReportID = _o.transactionThreadReportID, createdReportActionIDForThread = _o.createdReportActionIDForThread, onyxData = _o.onyxData, iouAction = _o.iouAction;
        var split = splits.at(index);
        if (split) {
            // For request params we need to have the transactionThreadReportID, createdReportActionIDForThread and splitReportActionID which we get from moneyRequestInformation
            split.transactionThreadReportID = transactionThreadReportID;
            split.createdReportActionIDForThread = createdReportActionIDForThread;
            split.splitReportActionID = iouAction.reportActionID;
        }
        optimisticData.push.apply(optimisticData, ((_k = onyxData.optimisticData) !== null && _k !== void 0 ? _k : []));
        successData.push.apply(successData, ((_l = onyxData.successData) !== null && _l !== void 0 ? _l : []));
        failureData.push.apply(failureData, ((_m = onyxData.failureData) !== null && _m !== void 0 ? _m : []));
    });
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(originalTransactionID),
        value: __assign(__assign({}, originalTransaction), { reportID: CONST_1.default.REPORT.SPLIT_REPORT_ID }),
    });
    var firstIOU = iouActions.at(0);
    if (firstIOU) {
        var _l = prepareToCleanUpMoneyRequest(originalTransactionID, firstIOU), updatedReportAction = _l.updatedReportAction, iouReport = _l.iouReport, transactionThread = _l.transactionThread;
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(firstIOU === null || firstIOU === void 0 ? void 0 : firstIOU.childReportID),
            value: null,
        });
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID),
            value: updatedReportAction,
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID),
            value: (_a = {},
                _a[firstIOU.reportActionID] = __assign(__assign({}, firstIOU), { pendingAction: null }),
                _a),
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(firstIOU === null || firstIOU === void 0 ? void 0 : firstIOU.childReportID),
            value: transactionThread,
        });
    }
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(originalTransactionID),
        value: originalTransaction,
    });
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.SNAPSHOT).concat(hash),
        value: {
            data: (_b = {},
                _b["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(originalTransactionID)] = __assign(__assign({}, originalTransactionViolations), { reportID: CONST_1.default.REPORT.SPLIT_REPORT_ID }),
                _b),
        },
    });
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.SNAPSHOT).concat(hash),
        value: {
            data: (_c = {},
                _c["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(originalTransactionID)] = originalTransactionViolations,
                _c),
        },
    });
    // Prepare splitApiParams for the Transaction_Split API call which requires a specific format for the splits
    // The format is: splits[0][amount], splits[0][category], splits[0][tag], etc.
    var splitApiParams = {};
    splits.forEach(function (split, i) {
        Object.entries(split).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            var formattedValue = value !== null && typeof value === 'object' ? JSON.stringify(value) : value;
            splitApiParams["splits[".concat(i, "][").concat(key, "]")] = formattedValue;
        });
    });
    var parameters = __assign(__assign({}, splitApiParams), { isReverseSplitOperation: false, transactionID: originalTransactionID });
    API.write(types_1.WRITE_COMMANDS.SPLIT_TRANSACTION, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
    react_native_1.InteractionManager.runAfterInteractions(function () { return (0, TransactionEdit_1.removeDraftSplitTransaction)(originalTransactionID); });
    var isSearchPageTopmostFullScreenRoute = (0, isSearchTopmostFullScreenRoute_1.default)();
    if (isSearchPageTopmostFullScreenRoute || !(transactionReport === null || transactionReport === void 0 ? void 0 : transactionReport.parentReportID)) {
        Navigation_1.default.dismissModal();
        return;
    }
    Navigation_1.default.dismissModalWithReport({ reportID: (_k = expenseReport === null || expenseReport === void 0 ? void 0 : expenseReport.reportID) !== null && _k !== void 0 ? _k : String(CONST_1.default.DEFAULT_NUMBER_ID) });
}
