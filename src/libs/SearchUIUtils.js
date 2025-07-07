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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getListItem = getListItem;
exports.getSections = getSections;
exports.getShouldShowMerchant = getShouldShowMerchant;
exports.getSortedSections = getSortedSections;
exports.isTransactionGroupListItemType = isTransactionGroupListItemType;
exports.isTransactionReportGroupListItemType = isTransactionReportGroupListItemType;
exports.isTransactionMemberGroupListItemType = isTransactionMemberGroupListItemType;
exports.isTransactionCardGroupListItemType = isTransactionCardGroupListItemType;
exports.isSearchResultsEmpty = isSearchResultsEmpty;
exports.isTransactionListItemType = isTransactionListItemType;
exports.isReportActionListItemType = isReportActionListItemType;
exports.shouldShowYear = shouldShowYear;
exports.getExpenseTypeTranslationKey = getExpenseTypeTranslationKey;
exports.getOverflowMenu = getOverflowMenu;
exports.isCorrectSearchUserName = isCorrectSearchUserName;
exports.isReportActionEntry = isReportActionEntry;
exports.isTaskListItemType = isTaskListItemType;
exports.getAction = getAction;
exports.createTypeMenuSections = createTypeMenuSections;
exports.createBaseSavedSearchMenuItem = createBaseSavedSearchMenuItem;
exports.shouldShowEmptyState = shouldShowEmptyState;
exports.compareValues = compareValues;
exports.isSearchDataLoaded = isSearchDataLoaded;
exports.getStatusOptions = getStatusOptions;
exports.getTypeOptions = getTypeOptions;
exports.getGroupByOptions = getGroupByOptions;
exports.getWideAmountIndicators = getWideAmountIndicators;
exports.isTransactionAmountTooLong = isTransactionAmountTooLong;
exports.isTransactionTaxAmountTooLong = isTransactionTaxAmountTooLong;
var react_native_onyx_1 = require("react-native-onyx");
var LottieAnimations_1 = require("@components/LottieAnimations");
var ChatListItem_1 = require("@components/SelectionList/ChatListItem");
var TaskListItem_1 = require("@components/SelectionList/Search/TaskListItem");
var TransactionGroupListItem_1 = require("@components/SelectionList/Search/TransactionGroupListItem");
var TransactionListItem_1 = require("@components/SelectionList/Search/TransactionListItem");
var Expensicons = require("@src/components/Icon/Expensicons");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var IOU_1 = require("./actions/IOU");
var Report_1 = require("./actions/Report");
var CurrencyUtils_1 = require("./CurrencyUtils");
var DateUtils_1 = require("./DateUtils");
var Environment_1 = require("./Environment/Environment");
var interceptAnonymousUser_1 = require("./interceptAnonymousUser");
var LocalePhoneNumber_1 = require("./LocalePhoneNumber");
var Localize_1 = require("./Localize");
var Navigation_1 = require("./Navigation/Navigation");
var Parser_1 = require("./Parser");
var PersonalDetailsUtils_1 = require("./PersonalDetailsUtils");
var PolicyUtils_1 = require("./PolicyUtils");
var ReportActionsUtils_1 = require("./ReportActionsUtils");
var ReportPreviewActionUtils_1 = require("./ReportPreviewActionUtils");
var ReportUtils_1 = require("./ReportUtils");
var SearchQueryUtils_1 = require("./SearchQueryUtils");
var StringUtils_1 = require("./StringUtils");
var SubscriptionUtils_1 = require("./SubscriptionUtils");
var TransactionUtils_1 = require("./TransactionUtils");
var shouldShowTransactionYear_1 = require("./TransactionUtils/shouldShowTransactionYear");
var transactionColumnNamesToSortingProperty = (_a = {},
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.TO] = 'formattedTo',
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.FROM] = 'formattedFrom',
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.DATE] = 'date',
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.TAG] = 'tag',
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.MERCHANT] = 'formattedMerchant',
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT] = 'formattedTotal',
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.CATEGORY] = 'category',
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.TYPE] = 'transactionType',
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.ACTION] = 'action',
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.DESCRIPTION] = 'comment',
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.TAX_AMOUNT] = null,
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.RECEIPT] = null,
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.IN] = 'parentReportID',
    _a);
var taskColumnNamesToSortingProperty = (_b = {},
    _b[CONST_1.default.SEARCH.TABLE_COLUMNS.DATE] = 'created',
    _b[CONST_1.default.SEARCH.TABLE_COLUMNS.DESCRIPTION] = 'description',
    _b[CONST_1.default.SEARCH.TABLE_COLUMNS.TITLE] = 'reportName',
    _b[CONST_1.default.SEARCH.TABLE_COLUMNS.FROM] = 'formattedCreatedBy',
    _b[CONST_1.default.SEARCH.TABLE_COLUMNS.ASSIGNEE] = 'formattedAssignee',
    _b[CONST_1.default.SEARCH.TABLE_COLUMNS.IN] = 'parentReportID',
    _b);
var expenseStatusOptions = [
    { translation: 'common.unreported', value: CONST_1.default.SEARCH.STATUS.EXPENSE.UNREPORTED },
    { translation: 'common.drafts', value: CONST_1.default.SEARCH.STATUS.EXPENSE.DRAFTS },
    { translation: 'common.outstanding', value: CONST_1.default.SEARCH.STATUS.EXPENSE.OUTSTANDING },
    { translation: 'iou.approved', value: CONST_1.default.SEARCH.STATUS.EXPENSE.APPROVED },
    { translation: 'iou.settledExpensify', value: CONST_1.default.SEARCH.STATUS.EXPENSE.PAID },
    { translation: 'iou.done', value: CONST_1.default.SEARCH.STATUS.EXPENSE.DONE },
];
var expenseReportedStatusOptions = [
    { translation: 'common.drafts', value: CONST_1.default.SEARCH.STATUS.EXPENSE.DRAFTS },
    { translation: 'common.outstanding', value: CONST_1.default.SEARCH.STATUS.EXPENSE.OUTSTANDING },
    { translation: 'iou.approved', value: CONST_1.default.SEARCH.STATUS.EXPENSE.APPROVED },
    { translation: 'iou.settledExpensify', value: CONST_1.default.SEARCH.STATUS.EXPENSE.PAID },
    { translation: 'iou.done', value: CONST_1.default.SEARCH.STATUS.EXPENSE.DONE },
];
var chatStatusOptions = [
    { translation: 'common.unread', value: CONST_1.default.SEARCH.STATUS.CHAT.UNREAD },
    { translation: 'common.sent', value: CONST_1.default.SEARCH.STATUS.CHAT.SENT },
    { translation: 'common.attachments', value: CONST_1.default.SEARCH.STATUS.CHAT.ATTACHMENTS },
    { translation: 'common.links', value: CONST_1.default.SEARCH.STATUS.CHAT.LINKS },
    { translation: 'search.filters.pinned', value: CONST_1.default.SEARCH.STATUS.CHAT.PINNED },
];
var invoiceStatusOptions = [
    { translation: 'common.outstanding', value: CONST_1.default.SEARCH.STATUS.INVOICE.OUTSTANDING },
    { translation: 'iou.settledExpensify', value: CONST_1.default.SEARCH.STATUS.INVOICE.PAID },
];
var tripStatusOptions = [
    { translation: 'search.filters.current', value: CONST_1.default.SEARCH.STATUS.TRIP.CURRENT },
    { translation: 'search.filters.past', value: CONST_1.default.SEARCH.STATUS.TRIP.PAST },
];
var taskStatusOptions = [
    { translation: 'common.outstanding', value: CONST_1.default.SEARCH.STATUS.TASK.OUTSTANDING },
    { translation: 'search.filters.completed', value: CONST_1.default.SEARCH.STATUS.TASK.COMPLETED },
];
var currentAccountID;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.SESSION,
    callback: function (session) {
        currentAccountID = session === null || session === void 0 ? void 0 : session.accountID;
    },
});
var emptyPersonalDetails = {
    accountID: CONST_1.default.REPORT.OWNER_ACCOUNT_ID_FAKE,
    avatar: '',
    displayName: undefined,
    login: undefined,
};
/**
 * @private
 *
 * Returns a list of properties that are common to every Search ListItem
 */
function getTransactionItemCommonFormattedProperties(transactionItem, from, to, policy) {
    var isExpenseReport = transactionItem.reportType === CONST_1.default.REPORT.TYPE.EXPENSE;
    var fromName = (0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(from);
    var formattedFrom = (0, LocalePhoneNumber_1.formatPhoneNumber)(fromName);
    // Sometimes the search data personal detail for the 'to' account might not hold neither the display name nor the login
    // so for those cases we fallback to the display name of the personal detail data from onyx.
    var toName = (0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(to, '', false);
    if (!toName && (to === null || to === void 0 ? void 0 : to.accountID)) {
        toName = (0, PersonalDetailsUtils_1.getDisplayNameOrDefault)((0, ReportUtils_1.getPersonalDetailsForAccountID)(to === null || to === void 0 ? void 0 : to.accountID));
    }
    var formattedTo = (0, LocalePhoneNumber_1.formatPhoneNumber)(toName);
    var formattedTotal = (0, TransactionUtils_1.getAmount)(transactionItem, isExpenseReport);
    var date = (transactionItem === null || transactionItem === void 0 ? void 0 : transactionItem.modifiedCreated) ? transactionItem.modifiedCreated : transactionItem === null || transactionItem === void 0 ? void 0 : transactionItem.created;
    var merchant = (0, TransactionUtils_1.getMerchant)(transactionItem, policy);
    var formattedMerchant = merchant === CONST_1.default.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT ? '' : merchant;
    return {
        formattedFrom: formattedFrom,
        formattedTo: formattedTo,
        date: date,
        formattedTotal: formattedTotal,
        formattedMerchant: formattedMerchant,
    };
}
/**
 * @private
 */
function isReportEntry(key) {
    return key.startsWith(ONYXKEYS_1.default.COLLECTION.REPORT);
}
/**
 * @private
 */
function isTransactionEntry(key) {
    return key.startsWith(ONYXKEYS_1.default.COLLECTION.TRANSACTION);
}
/**
 * @private
 */
function isPolicyEntry(key) {
    return key.startsWith(ONYXKEYS_1.default.COLLECTION.POLICY);
}
function isViolationEntry(key) {
    return key.startsWith(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS);
}
/**
 * @private
 */
function isReportActionEntry(key) {
    return key.startsWith(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS);
}
/**
 * Determines whether to display the merchant field based on the transactions in the search results.
 */
function getShouldShowMerchant(data) {
    return Object.keys(data).some(function (key) {
        var _a;
        if (isTransactionEntry(key)) {
            var item = data[key];
            var merchant = item.modifiedMerchant ? item.modifiedMerchant : ((_a = item.merchant) !== null && _a !== void 0 ? _a : '');
            return merchant !== '' && merchant !== CONST_1.default.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
        }
        return false;
    });
}
/**
 * Type guard that checks if something is a TransactionGroupListItemType
 */
function isTransactionGroupListItemType(item) {
    return 'transactions' in item;
}
/**
 * Type guard that checks if something is a TransactionReportGroupListItemType
 */
function isTransactionReportGroupListItemType(item) {
    return isTransactionGroupListItemType(item) && 'groupedBy' in item && item.groupedBy === CONST_1.default.SEARCH.GROUP_BY.REPORTS;
}
/**
 * Type guard that checks if something is a TransactionMemberGroupListItemType
 */
function isTransactionMemberGroupListItemType(item) {
    return isTransactionGroupListItemType(item) && 'groupedBy' in item && item.groupedBy === CONST_1.default.SEARCH.GROUP_BY.MEMBERS;
}
/**
 * Type guard that checks if something is a TransactionCardGroupListItemType
 */
function isTransactionCardGroupListItemType(item) {
    return isTransactionGroupListItemType(item) && 'groupedBy' in item && item.groupedBy === CONST_1.default.SEARCH.GROUP_BY.CARDS;
}
/**
 * Type guard that checks if something is a TransactionListItemType
 */
function isTransactionListItemType(item) {
    var transactionListItem = item;
    return transactionListItem.transactionID !== undefined;
}
/**
 * Type guard that check if something is a TaskListItemType
 */
function isTaskListItemType(item) {
    return 'type' in item && item.type === CONST_1.default.REPORT.TYPE.TASK;
}
/**
 * Type guard that checks if something is a ReportActionListItemType
 */
function isReportActionListItemType(item) {
    var reportActionListItem = item;
    return reportActionListItem.reportActionID !== undefined;
}
function isAmountTooLong(amount, maxLength) {
    if (maxLength === void 0) { maxLength = 8; }
    return Math.abs(amount).toString().length >= maxLength;
}
function isTransactionAmountTooLong(transactionItem) {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var amount = Math.abs(transactionItem.modifiedAmount || transactionItem.amount);
    return isAmountTooLong(amount);
}
function isTransactionTaxAmountTooLong(transactionItem) {
    var reportType = transactionItem === null || transactionItem === void 0 ? void 0 : transactionItem.reportType;
    var isFromExpenseReport = reportType === CONST_1.default.REPORT.TYPE.EXPENSE;
    var taxAmount = (0, TransactionUtils_1.getTaxAmount)(transactionItem, isFromExpenseReport);
    return isAmountTooLong(taxAmount);
}
function getWideAmountIndicators(data) {
    var isAmountWide = false;
    var isTaxAmountWide = false;
    var processTransaction = function (transaction) {
        isAmountWide || (isAmountWide = isTransactionAmountTooLong(transaction));
        isTaxAmountWide || (isTaxAmountWide = isTransactionTaxAmountTooLong(transaction));
    };
    if (Array.isArray(data)) {
        data.some(function (item) {
            var _a;
            if (isTransactionGroupListItemType(item)) {
                var transactions = (_a = item.transactions) !== null && _a !== void 0 ? _a : [];
                for (var _i = 0, transactions_1 = transactions; _i < transactions_1.length; _i++) {
                    var transaction = transactions_1[_i];
                    processTransaction(transaction);
                    if (isAmountWide && isTaxAmountWide) {
                        break;
                    }
                }
            }
            else if (isTransactionListItemType(item)) {
                processTransaction(item);
            }
            return isAmountWide && isTaxAmountWide;
        });
    }
    else {
        Object.keys(data).some(function (key) {
            if (isTransactionEntry(key)) {
                var item = data[key];
                processTransaction(item);
            }
            return isAmountWide && isTaxAmountWide;
        });
    }
    return {
        shouldShowAmountInWideColumn: isAmountWide,
        shouldShowTaxAmountInWideColumn: isTaxAmountWide,
    };
}
/**
 * Checks if the date of transactions or reports indicate the need to display the year because they are from a past year.
 */
function shouldShowYear(data) {
    var currentYear = new Date().getFullYear();
    if (Array.isArray(data)) {
        return data.some(function (item) {
            if (isTaskListItemType(item)) {
                var taskYear = new Date(item.created).getFullYear();
                return taskYear !== currentYear;
            }
            if (isTransactionGroupListItemType(item)) {
                // If the item is a TransactionGroupListItemType, iterate over its transactions and check them
                return item.transactions.some(function (transaction) {
                    var transactionYear = new Date((0, TransactionUtils_1.getCreated)(transaction)).getFullYear();
                    return transactionYear !== currentYear;
                });
            }
            var createdYear = new Date((item === null || item === void 0 ? void 0 : item.modifiedCreated) ? item.modifiedCreated : (item === null || item === void 0 ? void 0 : item.created) || '').getFullYear();
            return createdYear !== currentYear;
        });
    }
    for (var key in data) {
        if (isTransactionEntry(key)) {
            var item = data[key];
            if ((0, shouldShowTransactionYear_1.default)(item)) {
                return true;
            }
        }
        else if (isReportActionEntry(key)) {
            var item = data[key];
            for (var _i = 0, _a = Object.values(item); _i < _a.length; _i++) {
                var action = _a[_i];
                var date = action.created;
                if (DateUtils_1.default.doesDateBelongToAPastYear(date)) {
                    return true;
                }
            }
        }
        else if (isReportEntry(key)) {
            var item = data[key];
            var date = item.created;
            if (date && DateUtils_1.default.doesDateBelongToAPastYear(date)) {
                return true;
            }
        }
    }
    return false;
}
/**
 * @private
 * Extracts all transaction violations from the search data.
 */
function getViolations(data) {
    return Object.fromEntries(Object.entries(data).filter(function (_a) {
        var key = _a[0];
        return isViolationEntry(key);
    }));
}
/**
 * @private
 * Generates a display name for IOU reports considering the personal details of the payer and the transaction details.
 */
function getIOUReportName(data, reportItem) {
    var _a, _b, _c, _d, _e;
    var payerPersonalDetails = reportItem.managerID ? (_a = data.personalDetailsList) === null || _a === void 0 ? void 0 : _a[reportItem.managerID] : emptyPersonalDetails;
    // For cases where the data personal detail for manager ID do not exist in search data.personalDetailsList
    // we fallback to the display name of the personal detail data from onyx.
    var payerName = (_c = (_b = payerPersonalDetails === null || payerPersonalDetails === void 0 ? void 0 : payerPersonalDetails.displayName) !== null && _b !== void 0 ? _b : payerPersonalDetails === null || payerPersonalDetails === void 0 ? void 0 : payerPersonalDetails.login) !== null && _c !== void 0 ? _c : (0, PersonalDetailsUtils_1.getDisplayNameOrDefault)((0, ReportUtils_1.getPersonalDetailsForAccountID)(reportItem.managerID));
    var formattedAmount = (0, CurrencyUtils_1.convertToDisplayString)((_d = reportItem.total) !== null && _d !== void 0 ? _d : 0, (_e = reportItem.currency) !== null && _e !== void 0 ? _e : CONST_1.default.CURRENCY.USD);
    if (reportItem.action === CONST_1.default.SEARCH.ACTION_TYPES.PAID) {
        return (0, Localize_1.translateLocal)('iou.payerPaidAmount', {
            payer: payerName,
            amount: formattedAmount,
        });
    }
    return (0, Localize_1.translateLocal)('iou.payerOwesAmount', {
        payer: payerName,
        amount: formattedAmount,
    });
}
function getTransactionViolations(allViolations, transaction) {
    var transactionViolations = allViolations === null || allViolations === void 0 ? void 0 : allViolations["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transaction.transactionID)];
    if (!transactionViolations) {
        return [];
    }
    return transactionViolations.filter(function (violation) { return !(0, TransactionUtils_1.isViolationDismissed)(transaction, violation); });
}
/**
 * @private
 * Organizes data into List Sections for display, for the TransactionListItemType of Search Results.
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getTransactionsSections(data, metadata) {
    var _a, _b, _c, _d, _e;
    var shouldShowMerchant = getShouldShowMerchant(data);
    var doesDataContainAPastYearTransaction = shouldShowYear(data);
    var _f = getWideAmountIndicators(data), shouldShowAmountInWideColumn = _f.shouldShowAmountInWideColumn, shouldShowTaxAmountInWideColumn = _f.shouldShowTaxAmountInWideColumn;
    var shouldShowCategory = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.columnsToShow) === null || _a === void 0 ? void 0 : _a.shouldShowCategoryColumn;
    var shouldShowTag = (_b = metadata === null || metadata === void 0 ? void 0 : metadata.columnsToShow) === null || _b === void 0 ? void 0 : _b.shouldShowTagColumn;
    var shouldShowTax = (_c = metadata === null || metadata === void 0 ? void 0 : metadata.columnsToShow) === null || _c === void 0 ? void 0 : _c.shouldShowTaxColumn;
    // Pre-filter transaction keys to avoid repeated checks
    var transactionKeys = Object.keys(data).filter(isTransactionEntry);
    // Get violations - optimize by using a Map for faster lookups
    var allViolations = getViolations(data);
    // Use Map for faster lookups of personal details
    var personalDetailsMap = new Map(Object.entries(data.personalDetailsList || {}));
    var transactionsSections = [];
    for (var _i = 0, transactionKeys_1 = transactionKeys; _i < transactionKeys_1.length; _i++) {
        var key = transactionKeys_1[_i];
        var transactionItem = data[key];
        var report = data["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionItem.reportID)];
        var policy = data["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(report === null || report === void 0 ? void 0 : report.policyID)];
        var shouldShowBlankTo = !report || (0, ReportUtils_1.isOpenExpenseReport)(report);
        var transactionViolations = getTransactionViolations(allViolations, transactionItem);
        // Use Map.get() for faster lookups with default values
        var from = (_d = personalDetailsMap.get(transactionItem.accountID.toString())) !== null && _d !== void 0 ? _d : emptyPersonalDetails;
        var to = transactionItem.managerID && !shouldShowBlankTo ? ((_e = personalDetailsMap.get(transactionItem.managerID.toString())) !== null && _e !== void 0 ? _e : emptyPersonalDetails) : emptyPersonalDetails;
        var _g = getTransactionItemCommonFormattedProperties(transactionItem, from, to, policy), formattedFrom = _g.formattedFrom, formattedTo = _g.formattedTo, formattedTotal = _g.formattedTotal, formattedMerchant = _g.formattedMerchant, date = _g.date;
        var transactionSection = __assign(__assign({ action: getAction(data, allViolations, key), from: from, to: to, formattedFrom: formattedFrom, formattedTo: shouldShowBlankTo ? '' : formattedTo, formattedTotal: formattedTotal, formattedMerchant: formattedMerchant, date: date, shouldShowMerchant: shouldShowMerchant, shouldShowCategory: shouldShowCategory, shouldShowTag: shouldShowTag, shouldShowTax: shouldShowTax, keyForList: transactionItem.transactionID, shouldShowYear: doesDataContainAPastYearTransaction, isAmountColumnWide: shouldShowAmountInWideColumn, isTaxAmountColumnWide: shouldShowTaxAmountInWideColumn, violations: transactionViolations, 
            // Manually copying all the properties from transactionItem
            transactionID: transactionItem.transactionID, created: transactionItem.created, modifiedCreated: transactionItem.modifiedCreated, amount: transactionItem.amount, canDelete: transactionItem.canDelete, canHold: transactionItem.canHold, canUnhold: transactionItem.canUnhold, modifiedAmount: transactionItem.modifiedAmount, currency: transactionItem.currency, modifiedCurrency: transactionItem.modifiedCurrency, merchant: transactionItem.merchant, modifiedMerchant: transactionItem.modifiedMerchant, comment: transactionItem.comment, category: transactionItem.category, transactionType: transactionItem.transactionType, reportType: transactionItem.reportType, policyID: transactionItem.policyID, parentTransactionID: transactionItem.parentTransactionID, hasEReceipt: transactionItem.hasEReceipt, accountID: transactionItem.accountID, managerID: transactionItem.managerID, reportID: transactionItem.reportID }, (transactionItem.pendingAction ? { pendingAction: transactionItem.pendingAction } : {})), { transactionThreadReportID: transactionItem.transactionThreadReportID, isFromOneTransactionReport: transactionItem.isFromOneTransactionReport, tag: transactionItem.tag, receipt: transactionItem.receipt, taxAmount: transactionItem.taxAmount, description: transactionItem.description, mccGroup: transactionItem.mccGroup, modifiedMCCGroup: transactionItem.modifiedMCCGroup, moneyRequestReportActionID: transactionItem.moneyRequestReportActionID, pendingAction: transactionItem.pendingAction, errors: transactionItem.errors, isActionLoading: transactionItem.isActionLoading, hasViolation: transactionItem.hasViolation });
        transactionsSections.push(transactionSection);
    }
    return transactionsSections;
}
/**
 * @private
 * Retrieves all transactions associated with a specific report ID from the search data.

 */
function getTransactionsForReport(data, reportID) {
    return Object.entries(data)
        .filter(function (_a) {
        var key = _a[0], value = _a[1];
        return isTransactionEntry(key) && (value === null || value === void 0 ? void 0 : value.reportID) === reportID;
    })
        .map(function (_a) {
        var value = _a[1];
        return value;
    });
}
/**
 * @private
 * Retrieves a report from the search data based on the provided key.
 */
function getReportFromKey(data, key) {
    if (isTransactionEntry(key)) {
        var transaction = data[key];
        return data["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transaction === null || transaction === void 0 ? void 0 : transaction.reportID)];
    }
    if (isReportEntry(key)) {
        return data[key];
    }
    return undefined;
}
/**
 * @private
 * Retrieves the chat report associated with a given report.
 */
function getChatReport(data, report) {
    var _a;
    return (_a = data["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report === null || report === void 0 ? void 0 : report.chatReportID)]) !== null && _a !== void 0 ? _a : {};
}
/**
 * @private
 * Retrieves the policy associated with a given report.
 */
function getPolicyFromKey(data, report) {
    var _a;
    return (_a = data["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(report === null || report === void 0 ? void 0 : report.policyID)]) !== null && _a !== void 0 ? _a : {};
}
/**
 * @private
 * Retrieves the report name-value pairs associated with a given report.
 */
function getReportNameValuePairsFromKey(data, report) {
    var _a;
    return (_a = data["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(report === null || report === void 0 ? void 0 : report.reportID)]) !== null && _a !== void 0 ? _a : undefined;
}
/**
 * @private
 * Determines the permission flags for a user reviewing a report.
 */
function getReviewerPermissionFlags(report, policy) {
    return {
        isSubmitter: report.ownerAccountID === currentAccountID,
        isAdmin: policy.role === CONST_1.default.POLICY.ROLE.ADMIN,
        isApprover: report.managerID === currentAccountID,
    };
}
/**
 * Returns the action that can be taken on a given transaction or report
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getAction(data, allViolations, key) {
    var _a, _b, _c;
    var isTransaction = isTransactionEntry(key);
    var report = getReportFromKey(data, key);
    if (!isTransaction && !isReportEntry(key)) {
        return CONST_1.default.SEARCH.ACTION_TYPES.VIEW;
    }
    // Tracked and unreported expenses don't have a report, so we return early.
    if (!report) {
        return CONST_1.default.SEARCH.ACTION_TYPES.VIEW;
    }
    if ((0, ReportUtils_1.isSettled)(report)) {
        return CONST_1.default.SEARCH.ACTION_TYPES.PAID;
    }
    var transaction = isTransaction ? data[key] : undefined;
    // We need to check both options for a falsy value since the transaction might not have an error but the report associated with it might. We return early if there are any errors for performance reasons, so we don't need to compute any other possible actions.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if ((transaction === null || transaction === void 0 ? void 0 : transaction.errors) || (report === null || report === void 0 ? void 0 : report.errors)) {
        return CONST_1.default.SEARCH.ACTION_TYPES.REVIEW;
    }
    // We don't need to run the logic if this is not a transaction or iou/expense report, so let's shortcut the logic for performance reasons
    if (!(0, ReportUtils_1.isMoneyRequestReport)(report) && !(0, ReportUtils_1.isInvoiceReport)(report)) {
        return CONST_1.default.SEARCH.ACTION_TYPES.VIEW;
    }
    var allReportTransactions;
    if (isReportEntry(key)) {
        allReportTransactions = getTransactionsForReport(data, report.reportID);
    }
    else {
        allReportTransactions = transaction ? [transaction] : [];
    }
    var policy = getPolicyFromKey(data, report);
    var _d = getReviewerPermissionFlags(report, policy), isSubmitter = _d.isSubmitter, isAdmin = _d.isAdmin, isApprover = _d.isApprover;
    // Only check for violations if we need to (when user has permission to review)
    if ((isSubmitter || isApprover || isAdmin) && (0, ReportUtils_1.hasViolations)(report.reportID, allViolations, undefined, allReportTransactions)) {
        if (isSubmitter && !isApprover && !isAdmin && !(0, ReportPreviewActionUtils_1.canReview)(report, allViolations, policy, allReportTransactions)) {
            return CONST_1.default.SEARCH.ACTION_TYPES.VIEW;
        }
        return CONST_1.default.SEARCH.ACTION_TYPES.REVIEW;
    }
    // Submit/Approve/Pay can only be taken on transactions if the transaction is the only one on the report, otherwise `View` is the only option.
    // If this condition is not met, return early for performance reasons
    if (isTransaction && !(transaction === null || transaction === void 0 ? void 0 : transaction.isFromOneTransactionReport)) {
        return CONST_1.default.SEARCH.ACTION_TYPES.VIEW;
    }
    var invoiceReceiverPolicy = (0, ReportUtils_1.isInvoiceReport)(report) && ((_a = report === null || report === void 0 ? void 0 : report.invoiceReceiver) === null || _a === void 0 ? void 0 : _a.type) === CONST_1.default.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS
        ? data["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat((_b = report === null || report === void 0 ? void 0 : report.invoiceReceiver) === null || _b === void 0 ? void 0 : _b.policyID)]
        : undefined;
    var chatReport = getChatReport(data, report);
    var chatReportRNVP = (_c = data["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(report.chatReportID)]) !== null && _c !== void 0 ? _c : undefined;
    var canBePaid = (0, IOU_1.canIOUBePaid)(report, chatReport, policy, allReportTransactions, false, chatReportRNVP, invoiceReceiverPolicy);
    if (canBePaid && !(0, ReportUtils_1.hasOnlyHeldExpenses)(report.reportID, allReportTransactions)) {
        return CONST_1.default.SEARCH.ACTION_TYPES.PAY;
    }
    if ((0, ReportUtils_1.isClosedReport)(report)) {
        return CONST_1.default.SEARCH.ACTION_TYPES.DONE;
    }
    var hasOnlyPendingCardOrScanningTransactions = allReportTransactions.length > 0 && allReportTransactions.every(TransactionUtils_1.isPendingCardOrScanningTransaction);
    var isAllowedToApproveExpenseReport = (0, ReportUtils_1.isAllowedToApproveExpenseReport)(report, undefined, policy);
    if ((0, IOU_1.canApproveIOU)(report, policy, allReportTransactions) &&
        isAllowedToApproveExpenseReport &&
        !hasOnlyPendingCardOrScanningTransactions &&
        !(0, ReportUtils_1.hasOnlyHeldExpenses)(report.reportID, allReportTransactions)) {
        return CONST_1.default.SEARCH.ACTION_TYPES.APPROVE;
    }
    var reportNVP = getReportNameValuePairsFromKey(data, report);
    var isArchived = (0, ReportUtils_1.isArchivedReport)(reportNVP);
    // We check for isAllowedToApproveExpenseReport because if the policy has preventSelfApprovals enabled, we disable the Submit action and in that case we want to show the View action instead
    if ((0, IOU_1.canSubmitReport)(report, policy, allReportTransactions, allViolations, isArchived) && isAllowedToApproveExpenseReport) {
        return CONST_1.default.SEARCH.ACTION_TYPES.SUBMIT;
    }
    if (reportNVP === null || reportNVP === void 0 ? void 0 : reportNVP.exportFailedTime) {
        return CONST_1.default.SEARCH.ACTION_TYPES.REVIEW;
    }
    return CONST_1.default.SEARCH.ACTION_TYPES.VIEW;
}
/**
 * @private
 * Organizes data into List Sections for display, for the TaskListItemType of Search Results.
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getTaskSections(data) {
    return (Object.keys(data)
        .filter(isReportEntry)
        // Ensure that the reports that were passed are tasks, and not some other
        // type of report that was sent as the parent
        .filter(function (key) { return isTaskListItemType(data[key]); })
        .map(function (key) {
        var _a, _b, _c;
        var taskItem = data[key];
        var personalDetails = data.personalDetailsList;
        var assignee = (_a = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[taskItem.managerID]) !== null && _a !== void 0 ? _a : emptyPersonalDetails;
        var createdBy = (_b = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[taskItem.accountID]) !== null && _b !== void 0 ? _b : emptyPersonalDetails;
        var formattedAssignee = (0, LocalePhoneNumber_1.formatPhoneNumber)((0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(assignee));
        var formattedCreatedBy = (0, LocalePhoneNumber_1.formatPhoneNumber)((0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(createdBy));
        var report = (_c = (0, ReportUtils_1.getReportOrDraftReport)(taskItem.reportID)) !== null && _c !== void 0 ? _c : taskItem;
        var parentReport = (0, ReportUtils_1.getReportOrDraftReport)(taskItem.parentReportID);
        var doesDataContainAPastYearTransaction = shouldShowYear(data);
        var reportName = StringUtils_1.default.lineBreaksToSpaces(Parser_1.default.htmlToText(taskItem.reportName));
        var description = StringUtils_1.default.lineBreaksToSpaces(Parser_1.default.htmlToText(taskItem.description));
        var result = __assign(__assign({}, taskItem), { reportName: reportName, description: description, assignee: assignee, formattedAssignee: formattedAssignee, createdBy: createdBy, formattedCreatedBy: formattedCreatedBy, keyForList: taskItem.reportID, shouldShowYear: doesDataContainAPastYearTransaction });
        if (parentReport && personalDetails) {
            // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
            // eslint-disable-next-line deprecation/deprecation
            var policy = (0, PolicyUtils_1.getPolicy)(parentReport.policyID);
            var parentReportName = (0, ReportUtils_1.getReportName)(parentReport, policy, undefined, undefined);
            var icons = (0, ReportUtils_1.getIcons)(parentReport, personalDetails, null, '', -1, policy);
            var parentReportIcon = icons === null || icons === void 0 ? void 0 : icons.at(0);
            result.parentReportName = parentReportName;
            result.parentReportIcon = parentReportIcon;
        }
        if (report) {
            result.report = report;
        }
        return result;
    }));
}
/**
 * @private
 * Organizes data into List Sections for display, for the ReportActionListItemType of Search Results.
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getReportActionsSections(data) {
    var _a, _b, _c, _d, _e, _f;
    var reportActionItems = [];
    var transactions = Object.keys(data)
        .filter(isTransactionEntry)
        .map(function (key) { return data[key]; });
    var reports = Object.keys(data)
        .filter(isReportEntry)
        .map(function (key) { return data[key]; });
    var policies = Object.keys(data)
        .filter(isPolicyEntry)
        .map(function (key) { return data[key]; });
    for (var key in data) {
        if (isReportActionEntry(key)) {
            var reportActions = data[key];
            for (var _i = 0, _g = Object.values(reportActions); _i < _g.length; _i++) {
                var reportAction = _g[_i];
                var from = (_a = data.personalDetailsList) === null || _a === void 0 ? void 0 : _a[reportAction.accountID];
                var report = (_b = data["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportAction.reportID)]) !== null && _b !== void 0 ? _b : {};
                var policy = (_c = data["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(report.policyID)]) !== null && _c !== void 0 ? _c : {};
                var originalMessage = (0, ReportActionsUtils_1.isMoneyRequestAction)(reportAction) ? (0, ReportActionsUtils_1.getOriginalMessage)(reportAction) : undefined;
                var isSendingMoney = (0, ReportActionsUtils_1.isMoneyRequestAction)(reportAction) && (originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.type) === CONST_1.default.IOU.REPORT_ACTION_TYPE.PAY && (originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.IOUDetails);
                var invoiceReceiverPolicy = ((_d = report === null || report === void 0 ? void 0 : report.invoiceReceiver) === null || _d === void 0 ? void 0 : _d.type) === CONST_1.default.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS ? data["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(report.invoiceReceiver.policyID)] : undefined;
                if ((0, ReportActionsUtils_1.isDeletedAction)(reportAction) ||
                    (0, ReportActionsUtils_1.isResolvedActionableWhisper)(reportAction) ||
                    reportAction.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.CLOSED ||
                    (0, ReportActionsUtils_1.isCreatedAction)(reportAction) ||
                    (0, ReportActionsUtils_1.isWhisperActionTargetedToOthers)(reportAction) ||
                    ((0, ReportActionsUtils_1.isMoneyRequestAction)(reportAction) && !!(report === null || report === void 0 ? void 0 : report.isWaitingOnBankAccount) && (originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.type) === CONST_1.default.IOU.REPORT_ACTION_TYPE.PAY && !isSendingMoney)) {
                    // eslint-disable-next-line no-continue
                    continue;
                }
                reportActionItems.push(__assign(__assign({}, reportAction), { from: from, reportName: (0, ReportUtils_1.getSearchReportName)({ report: report, policy: policy, personalDetails: data.personalDetailsList, transactions: transactions, invoiceReceiverPolicy: invoiceReceiverPolicy, reports: reports, policies: policies }), formattedFrom: (_f = (_e = from === null || from === void 0 ? void 0 : from.displayName) !== null && _e !== void 0 ? _e : from === null || from === void 0 ? void 0 : from.login) !== null && _f !== void 0 ? _f : '', date: reportAction.created, keyForList: reportAction.reportActionID }));
            }
        }
    }
    return reportActionItems;
}
/**
 * @private
 * Organizes data into List Sections grouped by report for display, for the TransactionGroupListItemType of Search Results.
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getReportSections(data, metadata) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    var shouldShowMerchant = getShouldShowMerchant(data);
    var doesDataContainAPastYearTransaction = shouldShowYear(data);
    var _q = getWideAmountIndicators(data), shouldShowAmountInWideColumn = _q.shouldShowAmountInWideColumn, shouldShowTaxAmountInWideColumn = _q.shouldShowTaxAmountInWideColumn;
    // Get violations - optimize by using a Map for faster lookups
    var allViolations = getViolations(data);
    var reportIDToTransactions = {};
    for (var key in data) {
        if (isReportEntry(key) && (data[key].type === CONST_1.default.REPORT.TYPE.IOU || data[key].type === CONST_1.default.REPORT.TYPE.EXPENSE || data[key].type === CONST_1.default.REPORT.TYPE.INVOICE)) {
            var reportItem = __assign({}, data[key]);
            var reportKey = "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportItem.reportID);
            var transactions = (_b = (_a = reportIDToTransactions[reportKey]) === null || _a === void 0 ? void 0 : _a.transactions) !== null && _b !== void 0 ? _b : [];
            var isIOUReport = reportItem.type === CONST_1.default.REPORT.TYPE.IOU;
            var reportPendingAction = (_c = reportItem === null || reportItem === void 0 ? void 0 : reportItem.pendingAction) !== null && _c !== void 0 ? _c : (_d = reportItem === null || reportItem === void 0 ? void 0 : reportItem.pendingFields) === null || _d === void 0 ? void 0 : _d.preview;
            var shouldShowBlankTo = !reportItem || (0, ReportUtils_1.isOpenExpenseReport)(reportItem);
            reportIDToTransactions[reportKey] = __assign(__assign(__assign({}, reportItem), { groupedBy: CONST_1.default.SEARCH.GROUP_BY.REPORTS, action: getAction(data, allViolations, key), keyForList: reportItem.reportID, from: (_e = data.personalDetailsList) === null || _e === void 0 ? void 0 : _e[(_f = reportItem.accountID) !== null && _f !== void 0 ? _f : CONST_1.default.DEFAULT_NUMBER_ID], to: !shouldShowBlankTo && reportItem.managerID ? (_g = data.personalDetailsList) === null || _g === void 0 ? void 0 : _g[reportItem.managerID] : emptyPersonalDetails, transactions: transactions }), (reportPendingAction ? { pendingAction: reportPendingAction } : {}));
            if (isIOUReport) {
                reportIDToTransactions[reportKey].reportName = getIOUReportName(data, reportIDToTransactions[reportKey]);
            }
        }
        else if (isTransactionEntry(key)) {
            var transactionItem = __assign({}, data[key]);
            var reportKey = "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionItem.reportID);
            var report = data["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionItem.reportID)];
            var policy = data["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(report === null || report === void 0 ? void 0 : report.policyID)];
            var shouldShowBlankTo = !report || (0, ReportUtils_1.isOpenExpenseReport)(report);
            var transactionViolations = getTransactionViolations(allViolations, transactionItem);
            var from = (_h = data.personalDetailsList) === null || _h === void 0 ? void 0 : _h[transactionItem.accountID];
            var to = transactionItem.managerID && !shouldShowBlankTo ? ((_k = (_j = data.personalDetailsList) === null || _j === void 0 ? void 0 : _j[transactionItem.managerID]) !== null && _k !== void 0 ? _k : emptyPersonalDetails) : emptyPersonalDetails;
            var _r = getTransactionItemCommonFormattedProperties(transactionItem, from, to, policy), formattedFrom = _r.formattedFrom, formattedTo = _r.formattedTo, formattedTotal = _r.formattedTotal, formattedMerchant = _r.formattedMerchant, date = _r.date;
            var transaction = __assign(__assign({}, transactionItem), { action: getAction(data, allViolations, key), from: from, to: to, formattedFrom: formattedFrom, formattedTo: shouldShowBlankTo ? '' : formattedTo, formattedTotal: formattedTotal, formattedMerchant: formattedMerchant, date: date, shouldShowMerchant: shouldShowMerchant, shouldShowCategory: (_l = metadata === null || metadata === void 0 ? void 0 : metadata.columnsToShow) === null || _l === void 0 ? void 0 : _l.shouldShowCategoryColumn, shouldShowTag: (_m = metadata === null || metadata === void 0 ? void 0 : metadata.columnsToShow) === null || _m === void 0 ? void 0 : _m.shouldShowTagColumn, shouldShowTax: (_o = metadata === null || metadata === void 0 ? void 0 : metadata.columnsToShow) === null || _o === void 0 ? void 0 : _o.shouldShowTaxColumn, keyForList: transactionItem.transactionID, shouldShowYear: doesDataContainAPastYearTransaction, violations: transactionViolations, isAmountColumnWide: shouldShowAmountInWideColumn, isTaxAmountColumnWide: shouldShowTaxAmountInWideColumn });
            if ((_p = reportIDToTransactions[reportKey]) === null || _p === void 0 ? void 0 : _p.transactions) {
                reportIDToTransactions[reportKey].transactions.push(transaction);
            }
            else if (reportIDToTransactions[reportKey]) {
                reportIDToTransactions[reportKey].transactions = [transaction];
            }
        }
    }
    return Object.values(reportIDToTransactions);
}
/**
 * @private
 * Organizes data into List Sections grouped by member for display, for the TransactionGroupListItemType of Search Results.
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getMemberSections(data, metadata) {
    return data && metadata ? [] : []; // s77rt TODO
}
/**
 * @private
 * Organizes data into List Sections grouped by card for display, for the TransactionGroupListItemType of Search Results.
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getCardSections(data, metadata) {
    return data && metadata ? [] : []; // s77rt TODO
}
/**
 * Returns the appropriate list item component based on the type and status of the search data.
 */
function getListItem(type, status, groupBy) {
    if (type === CONST_1.default.SEARCH.DATA_TYPES.CHAT) {
        return ChatListItem_1.default;
    }
    if (type === CONST_1.default.SEARCH.DATA_TYPES.TASK) {
        return TaskListItem_1.default;
    }
    if (groupBy) {
        return TransactionGroupListItem_1.default;
    }
    return TransactionListItem_1.default;
}
/**
 * Organizes data into appropriate list sections for display based on the type of search results.
 */
function getSections(type, status, data, metadata, groupBy) {
    if (type === CONST_1.default.SEARCH.DATA_TYPES.CHAT) {
        return getReportActionsSections(data);
    }
    if (type === CONST_1.default.SEARCH.DATA_TYPES.TASK) {
        return getTaskSections(data);
    }
    if (groupBy) {
        // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
        // eslint-disable-next-line default-case
        switch (groupBy) {
            case CONST_1.default.SEARCH.GROUP_BY.REPORTS:
                return getReportSections(data, metadata);
            case CONST_1.default.SEARCH.GROUP_BY.MEMBERS:
                return getMemberSections(data, metadata);
            case CONST_1.default.SEARCH.GROUP_BY.CARDS:
                return getCardSections(data, metadata);
        }
    }
    return getTransactionsSections(data, metadata);
}
/**
 * Sorts sections of data based on a specified column and sort order for displaying sorted results.
 */
function getSortedSections(type, status, data, sortBy, sortOrder, groupBy) {
    if (type === CONST_1.default.SEARCH.DATA_TYPES.CHAT) {
        return getSortedReportActionData(data);
    }
    if (type === CONST_1.default.SEARCH.DATA_TYPES.TASK) {
        return getSortedTaskData(data, sortBy, sortOrder);
    }
    if (groupBy) {
        // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
        // eslint-disable-next-line default-case
        switch (groupBy) {
            case CONST_1.default.SEARCH.GROUP_BY.REPORTS:
                return getSortedReportData(data);
            case CONST_1.default.SEARCH.GROUP_BY.MEMBERS:
                return getSortedMemberData(data);
            case CONST_1.default.SEARCH.GROUP_BY.CARDS:
                return getSortedCardData(data);
        }
    }
    return getSortedTransactionData(data, sortBy, sortOrder);
}
/**
 * Compares two values based on a specified sorting order and column.
 * Handles both string and numeric comparisons, with special handling for absolute values when sorting by total amount.
 */
function compareValues(a, b, sortOrder, sortBy) {
    var isAsc = sortOrder === CONST_1.default.SEARCH.SORT_ORDER.ASC;
    if (a === undefined || b === undefined) {
        return 0;
    }
    if (typeof a === 'string' && typeof b === 'string') {
        return isAsc ? a.localeCompare(b) : b.localeCompare(a);
    }
    if (typeof a === 'number' && typeof b === 'number') {
        var aValue = sortBy === CONST_1.default.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT ? Math.abs(a) : a;
        var bValue = sortBy === CONST_1.default.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT ? Math.abs(b) : b;
        return isAsc ? aValue - bValue : bValue - aValue;
    }
    return 0;
}
/**
 * @private
 * Sorts transaction sections based on a specified column and sort order.
 */
function getSortedTransactionData(data, sortBy, sortOrder) {
    if (!sortBy || !sortOrder) {
        return data;
    }
    var sortingProperty = transactionColumnNamesToSortingProperty[sortBy];
    if (!sortingProperty) {
        return data;
    }
    return data.sort(function (a, b) {
        var _a, _b;
        var aValue = sortingProperty === 'comment' ? (_a = a.comment) === null || _a === void 0 ? void 0 : _a.comment : a[sortingProperty];
        var bValue = sortingProperty === 'comment' ? (_b = b.comment) === null || _b === void 0 ? void 0 : _b.comment : b[sortingProperty];
        return compareValues(aValue, bValue, sortOrder, sortingProperty);
    });
}
function getSortedTaskData(data, sortBy, sortOrder) {
    if (!sortBy || !sortOrder) {
        return data;
    }
    var sortingProperty = taskColumnNamesToSortingProperty[sortBy];
    if (!sortingProperty) {
        return data;
    }
    return data.sort(function (a, b) {
        var aValue = a[sortingProperty];
        var bValue = b[sortingProperty];
        return compareValues(aValue, bValue, sortOrder, sortingProperty);
    });
}
/**
 * @private
 * Sorts report sections based on a specified column and sort order.
 */
function getSortedReportData(data) {
    for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
        var report = data_1[_i];
        report.transactions = getSortedTransactionData(report.transactions, CONST_1.default.SEARCH.TABLE_COLUMNS.DATE, CONST_1.default.SEARCH.SORT_ORDER.DESC);
    }
    return data.sort(function (a, b) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        var aNewestTransaction = ((_b = (_a = a.transactions) === null || _a === void 0 ? void 0 : _a.at(0)) === null || _b === void 0 ? void 0 : _b.modifiedCreated) ? (_d = (_c = a.transactions) === null || _c === void 0 ? void 0 : _c.at(0)) === null || _d === void 0 ? void 0 : _d.modifiedCreated : (_f = (_e = a.transactions) === null || _e === void 0 ? void 0 : _e.at(0)) === null || _f === void 0 ? void 0 : _f.created;
        var bNewestTransaction = ((_h = (_g = b.transactions) === null || _g === void 0 ? void 0 : _g.at(0)) === null || _h === void 0 ? void 0 : _h.modifiedCreated) ? (_k = (_j = b.transactions) === null || _j === void 0 ? void 0 : _j.at(0)) === null || _k === void 0 ? void 0 : _k.modifiedCreated : (_m = (_l = b.transactions) === null || _l === void 0 ? void 0 : _l.at(0)) === null || _m === void 0 ? void 0 : _m.created;
        if (!aNewestTransaction || !bNewestTransaction) {
            return 0;
        }
        return bNewestTransaction.toLowerCase().localeCompare(aNewestTransaction);
    });
}
/**
 * @private
 * Sorts report sections based on a specified column and sort order.
 */
function getSortedMemberData(data) {
    return data ? [] : []; // s77rt TODO
}
/**
 * @private
 * Sorts report sections based on a specified column and sort order.
 */
function getSortedCardData(data) {
    return data ? [] : []; // s77rt TODO
}
/**
 * @private
 * Sorts report actions sections based on a specified column and sort order.
 */
function getSortedReportActionData(data) {
    return data.sort(function (a, b) {
        var aValue = a === null || a === void 0 ? void 0 : a.created;
        var bValue = b === null || b === void 0 ? void 0 : b.created;
        if (aValue === undefined || bValue === undefined) {
            return 0;
        }
        return bValue.toLowerCase().localeCompare(aValue);
    });
}
/**
 * Checks if the search results contain any data, useful for determining if the search results are empty.
 */
function isSearchResultsEmpty(searchResults) {
    return !Object.keys(searchResults === null || searchResults === void 0 ? void 0 : searchResults.data).some(function (key) { return key.startsWith(ONYXKEYS_1.default.COLLECTION.TRANSACTION); });
}
/**
 * Returns the corresponding translation key for expense type
 */
function getExpenseTypeTranslationKey(expenseType) {
    // eslint-disable-next-line default-case
    switch (expenseType) {
        case CONST_1.default.SEARCH.TRANSACTION_TYPE.DISTANCE:
            return 'common.distance';
        case CONST_1.default.SEARCH.TRANSACTION_TYPE.CARD:
            return 'common.card';
        case CONST_1.default.SEARCH.TRANSACTION_TYPE.CASH:
            return 'iou.cash';
        case CONST_1.default.SEARCH.TRANSACTION_TYPE.PER_DIEM:
            return 'common.perDiem';
    }
}
/**
 * Constructs and configures the overflow menu for search items, handling interactions such as renaming or deleting items.
 */
function getOverflowMenu(itemName, hash, inputQuery, showDeleteModal, isMobileMenu, closeMenu) {
    return [
        {
            text: (0, Localize_1.translateLocal)('common.rename'),
            onSelected: function () {
                if (isMobileMenu && closeMenu) {
                    closeMenu();
                }
                Navigation_1.default.navigate(ROUTES_1.default.SEARCH_SAVED_SEARCH_RENAME.getRoute({ name: encodeURIComponent(itemName), jsonQuery: inputQuery }));
            },
            icon: Expensicons.Pencil,
            shouldShowRightIcon: false,
            shouldShowRightComponent: false,
            shouldCallAfterModalHide: true,
        },
        {
            text: (0, Localize_1.translateLocal)('common.delete'),
            onSelected: function () {
                if (isMobileMenu && closeMenu) {
                    closeMenu();
                }
                showDeleteModal(hash);
            },
            icon: Expensicons.Trashcan,
            shouldShowRightIcon: false,
            shouldShowRightComponent: false,
            shouldCallAfterModalHide: true,
            shouldCloseAllModals: true,
        },
    ];
}
/**
 * Checks if the passed username is a correct standard username, and not a placeholder
 */
function isCorrectSearchUserName(displayName) {
    return displayName && displayName.toUpperCase() !== CONST_1.default.REPORT.OWNER_EMAIL_FAKE;
}
function createTypeMenuSections(session, hasCardFeed, policies) {
    if (policies === void 0) { policies = {}; }
    var email = session === null || session === void 0 ? void 0 : session.email;
    // Start building the sections by requiring the following sections to always be present
    var typeMenuSections = [
        {
            translationPath: 'common.explore',
            menuItems: [
                {
                    translationPath: 'common.expenses',
                    type: CONST_1.default.SEARCH.DATA_TYPES.EXPENSE,
                    icon: Expensicons.Receipt,
                    getSearchQuery: function (policyID) {
                        var queryString = (0, SearchQueryUtils_1.buildCannedSearchQuery)({ policyID: policyID });
                        return queryString;
                    },
                },
                {
                    translationPath: 'common.reports',
                    type: CONST_1.default.SEARCH.DATA_TYPES.EXPENSE,
                    icon: Expensicons.Document,
                    getSearchQuery: function (policyID) {
                        var queryString = (0, SearchQueryUtils_1.buildCannedSearchQuery)({ groupBy: CONST_1.default.SEARCH.GROUP_BY.REPORTS, policyID: policyID });
                        return queryString;
                    },
                },
                {
                    translationPath: 'common.chats',
                    type: CONST_1.default.SEARCH.DATA_TYPES.CHAT,
                    icon: Expensicons.ChatBubbles,
                    getSearchQuery: function (policyID) {
                        var queryString = (0, SearchQueryUtils_1.buildCannedSearchQuery)({ type: CONST_1.default.SEARCH.DATA_TYPES.CHAT, status: CONST_1.default.SEARCH.STATUS.CHAT.ALL, policyID: policyID });
                        return queryString;
                    },
                },
            ],
        },
    ];
    // Begin adding conditional sections, based on the policies the user has access to
    var showSubmitSuggestion = Object.values(policies).filter(function (p) { return (0, PolicyUtils_1.isPaidGroupPolicy)(p); }).length > 0;
    var showPaySuggestion = Object.values(policies).some(function (policy) {
        if (!policy || !(0, PolicyUtils_1.isPaidGroupPolicy)(policy)) {
            return false;
        }
        var reimburser = policy.reimburser;
        var isReimburser = reimburser === email;
        var isAdmin = policy.role === CONST_1.default.POLICY.ROLE.ADMIN;
        if (policy.reimbursementChoice === CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES) {
            return reimburser ? isReimburser : isAdmin;
        }
        if (policy.reimbursementChoice === CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL) {
            return isAdmin;
        }
        return false;
    });
    var showApproveSuggestion = Object.values(policies).some(function (policy) {
        var _a;
        if (!policy || !email || !(0, PolicyUtils_1.isPaidGroupPolicy)(policy)) {
            return false;
        }
        if (policy.approvalMode === CONST_1.default.POLICY.APPROVAL_MODE.OPTIONAL) {
            return false;
        }
        var isPolicyApprover = policy.approver === email;
        var isSubmittedTo = Object.values((_a = policy.employeeList) !== null && _a !== void 0 ? _a : {}).some(function (employee) {
            return employee.submitsTo === email || employee.forwardsTo === email;
        });
        return isPolicyApprover || isSubmittedTo;
    });
    // TODO: This option will be enabled soon (removing the && false). We are waiting on changes to support this
    // feature fully, but lets keep the code here for simplicity
    // https://github.com/Expensify/Expensify/issues/505933
    var showExportSuggestion = Object.values(policies).some(function (policy) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
        if (!policy || !email) {
            return false;
        }
        var isIntacctExporter = ((_d = (_c = (_b = (_a = policy.connections) === null || _a === void 0 ? void 0 : _a.intacct) === null || _b === void 0 ? void 0 : _b.config) === null || _c === void 0 ? void 0 : _c.export) === null || _d === void 0 ? void 0 : _d.exporter) === email;
        var isNetSuiteExporter = ((_h = (_g = (_f = (_e = policy.connections) === null || _e === void 0 ? void 0 : _e.netsuite) === null || _f === void 0 ? void 0 : _f.options) === null || _g === void 0 ? void 0 : _g.config) === null || _h === void 0 ? void 0 : _h.exporter) === email;
        var isQuickbooksDesktopExporter = ((_m = (_l = (_k = (_j = policy.connections) === null || _j === void 0 ? void 0 : _j.quickbooksDesktop) === null || _k === void 0 ? void 0 : _k.config) === null || _l === void 0 ? void 0 : _l.export) === null || _m === void 0 ? void 0 : _m.exporter) === email;
        var isQuickbooksOnlineExporter = ((_r = (_q = (_p = (_o = policy.connections) === null || _o === void 0 ? void 0 : _o.quickbooksOnline) === null || _p === void 0 ? void 0 : _p.config) === null || _q === void 0 ? void 0 : _q.export) === null || _r === void 0 ? void 0 : _r.exporter) === email;
        var isXeroExporter = ((_v = (_u = (_t = (_s = policy.connections) === null || _s === void 0 ? void 0 : _s.xero) === null || _t === void 0 ? void 0 : _t.config) === null || _u === void 0 ? void 0 : _u.export) === null || _v === void 0 ? void 0 : _v.exporter) === email;
        return isIntacctExporter || isNetSuiteExporter || isQuickbooksDesktopExporter || isQuickbooksOnlineExporter || isXeroExporter;
    }) && false;
    // We suggest specific filters for users based on their access in specific policies. Show the todo section
    // only if any of these items are available
    var showTodoSection = showSubmitSuggestion || showApproveSuggestion || showPaySuggestion || showExportSuggestion;
    if (showTodoSection && session) {
        var section = {
            translationPath: 'common.todo',
            menuItems: [],
        };
        if (showSubmitSuggestion) {
            section.menuItems.push({
                translationPath: 'common.submit',
                type: CONST_1.default.SEARCH.DATA_TYPES.EXPENSE,
                icon: Expensicons.Pencil,
                emptyState: {
                    headerMedia: LottieAnimations_1.default.Fireworks,
                    title: 'search.searchResults.emptySubmitResults.title',
                    subtitle: 'search.searchResults.emptySubmitResults.subtitle',
                    buttons: [
                        {
                            success: true,
                            buttonText: 'report.newReport.createReport',
                            buttonAction: function () {
                                (0, interceptAnonymousUser_1.default)(function () {
                                    var _a;
                                    var activePolicy = (0, PolicyUtils_1.getActivePolicy)();
                                    var groupPoliciesWithChatEnabled = (0, PolicyUtils_1.getGroupPaidPoliciesWithExpenseChatEnabled)();
                                    var personalDetails = (0, ReportUtils_1.getPersonalDetailsForAccountID)(session.accountID);
                                    var workspaceIDForReportCreation;
                                    // If the user's default workspace is a paid group workspace with chat enabled, we create a report with it by default
                                    if (activePolicy && activePolicy.isPolicyExpenseChatEnabled && (0, PolicyUtils_1.isPaidGroupPolicy)(activePolicy)) {
                                        workspaceIDForReportCreation = activePolicy.id;
                                    }
                                    else if (groupPoliciesWithChatEnabled.length === 1) {
                                        workspaceIDForReportCreation = (_a = groupPoliciesWithChatEnabled.at(0)) === null || _a === void 0 ? void 0 : _a.id;
                                    }
                                    if (workspaceIDForReportCreation && !(0, SubscriptionUtils_1.shouldRestrictUserBillableActions)(workspaceIDForReportCreation) && personalDetails) {
                                        var createdReportID_1 = (0, Report_1.createNewReport)(personalDetails, workspaceIDForReportCreation);
                                        Navigation_1.default.setNavigationActionToMicrotaskQueue(function () {
                                            Navigation_1.default.navigate(ROUTES_1.default.SEARCH_MONEY_REQUEST_REPORT.getRoute({ reportID: createdReportID_1, backTo: Navigation_1.default.getActiveRoute() }));
                                        });
                                        return;
                                    }
                                    // If the user's default workspace is personal and the user has more than one group workspace, which is paid and has chat enabled, or a chosen workspace is past the grace period, we need to redirect them to the workspace selection screen
                                    Navigation_1.default.navigate(ROUTES_1.default.NEW_REPORT_WORKSPACE_SELECTION);
                                });
                            },
                        },
                    ],
                },
                getSearchQuery: function () {
                    var queryString = (0, SearchQueryUtils_1.buildQueryStringFromFilterFormValues)({
                        type: CONST_1.default.SEARCH.DATA_TYPES.EXPENSE,
                        groupBy: CONST_1.default.SEARCH.GROUP_BY.REPORTS,
                        status: CONST_1.default.SEARCH.STATUS.EXPENSE.DRAFTS,
                        from: ["".concat(session.accountID)],
                    });
                    return queryString;
                },
            });
        }
        if (showApproveSuggestion) {
            section.menuItems.push({
                translationPath: 'search.bulkActions.approve',
                type: CONST_1.default.SEARCH.DATA_TYPES.EXPENSE,
                icon: Expensicons.ThumbsUp,
                emptyState: {
                    headerMedia: LottieAnimations_1.default.Fireworks,
                    title: 'search.searchResults.emptyApproveResults.title',
                    subtitle: 'search.searchResults.emptyApproveResults.subtitle',
                },
                getSearchQuery: function () {
                    var queryString = (0, SearchQueryUtils_1.buildQueryStringFromFilterFormValues)({
                        type: CONST_1.default.SEARCH.DATA_TYPES.EXPENSE,
                        groupBy: CONST_1.default.SEARCH.GROUP_BY.REPORTS,
                        action: CONST_1.default.SEARCH.ACTION_FILTERS.APPROVE,
                        to: ["".concat(session.accountID)],
                    });
                    return queryString;
                },
            });
        }
        if (showPaySuggestion) {
            section.menuItems.push({
                translationPath: 'search.bulkActions.pay',
                type: CONST_1.default.SEARCH.DATA_TYPES.EXPENSE,
                icon: Expensicons.MoneyBag,
                emptyState: {
                    headerMedia: LottieAnimations_1.default.Fireworks,
                    title: 'search.searchResults.emptyPayResults.title',
                    subtitle: 'search.searchResults.emptyPayResults.subtitle',
                },
                getSearchQuery: function () {
                    var _a;
                    var queryString = (0, SearchQueryUtils_1.buildQueryStringFromFilterFormValues)({
                        type: CONST_1.default.SEARCH.DATA_TYPES.EXPENSE,
                        groupBy: CONST_1.default.SEARCH.GROUP_BY.REPORTS,
                        action: CONST_1.default.SEARCH.ACTION_FILTERS.PAY,
                        reimbursable: CONST_1.default.SEARCH.BOOLEAN.YES,
                        payer: (_a = session.accountID) === null || _a === void 0 ? void 0 : _a.toString(),
                    });
                    return queryString;
                },
            });
        }
        if (showExportSuggestion) {
            section.menuItems.push({
                translationPath: 'common.export',
                type: CONST_1.default.SEARCH.DATA_TYPES.EXPENSE,
                icon: Expensicons.CheckCircle,
                emptyState: {
                    headerMedia: LottieAnimations_1.default.Fireworks,
                    title: 'search.searchResults.emptyExportResults.title',
                    subtitle: 'search.searchResults.emptyExportResults.subtitle',
                },
                getSearchQuery: function () {
                    var queryString = (0, SearchQueryUtils_1.buildQueryStringFromFilterFormValues)({
                        groupBy: CONST_1.default.SEARCH.GROUP_BY.REPORTS,
                        action: CONST_1.default.SEARCH.ACTION_FILTERS.EXPORT,
                        exporter: ["".concat(session.accountID)],
                        exportedOn: CONST_1.default.SEARCH.DATE_PRESETS.NEVER,
                    });
                    return queryString;
                },
            });
        }
        typeMenuSections.push(section);
    }
    var accountingSection = {
        translationPath: 'workspace.common.accounting',
        menuItems: [],
    };
    var shouldShowStatementsSuggestion = false;
    var showShowUnapprovedCashSuggestion = false;
    var showShowUnapprovedCompanyCardsSuggestion = false;
    var shouldShowReconciliationSuggestion = false;
    Object.values(policies).some(function (policy) {
        if (!policy || !(0, PolicyUtils_1.isPaidGroupPolicy)(policy)) {
            return false;
        }
        var isAdmin = policy.role === CONST_1.default.POLICY.ROLE.ADMIN;
        var isApprovalEnabled = policy.approvalMode ? policy.approvalMode !== CONST_1.default.POLICY.APPROVAL_MODE.OPTIONAL : false;
        var isPaymentEnabled = (0, PolicyUtils_1.arePaymentsEnabled)(policy);
        shouldShowStatementsSuggestion || (shouldShowStatementsSuggestion = false); // s77rt TODO
        showShowUnapprovedCashSuggestion || (showShowUnapprovedCashSuggestion = isAdmin && isApprovalEnabled && isPaymentEnabled);
        showShowUnapprovedCompanyCardsSuggestion || (showShowUnapprovedCompanyCardsSuggestion = isAdmin && isApprovalEnabled && hasCardFeed);
        shouldShowReconciliationSuggestion || (shouldShowReconciliationSuggestion = false); // s77rt TODO
        // We don't need to check the rest of the policies if we already determined that all suggestion items should be displayed
        return shouldShowStatementsSuggestion && showShowUnapprovedCashSuggestion && showShowUnapprovedCompanyCardsSuggestion && shouldShowReconciliationSuggestion;
    });
    if (shouldShowStatementsSuggestion) {
        // s77rt TODO
    }
    if (showShowUnapprovedCashSuggestion && showShowUnapprovedCompanyCardsSuggestion) {
        accountingSection.menuItems.push({
            translationPath: 'search.unapprovedCash',
            type: CONST_1.default.SEARCH.DATA_TYPES.EXPENSE,
            icon: Expensicons.MoneyHourglass,
            emptyState: {
                headerMedia: LottieAnimations_1.default.Fireworks,
                title: 'search.searchResults.emptyUnapprovedResults.title',
                subtitle: 'search.searchResults.emptyUnapprovedResults.subtitle',
            },
            getSearchQuery: function () {
                var queryString = (0, SearchQueryUtils_1.buildQueryStringFromFilterFormValues)({
                    type: CONST_1.default.SEARCH.DATA_TYPES.EXPENSE,
                    groupBy: CONST_1.default.SEARCH.GROUP_BY.REPORTS,
                    status: [CONST_1.default.SEARCH.STATUS.EXPENSE.DRAFTS, CONST_1.default.SEARCH.STATUS.EXPENSE.OUTSTANDING],
                    reimbursable: CONST_1.default.SEARCH.BOOLEAN.YES,
                });
                return queryString;
            },
        }, {
            translationPath: 'search.unapprovedCompanyCards',
            type: CONST_1.default.SEARCH.DATA_TYPES.EXPENSE,
            icon: Expensicons.CreditCardHourglass,
            emptyState: {
                headerMedia: LottieAnimations_1.default.Fireworks,
                title: 'search.searchResults.emptyUnapprovedResults.title',
                subtitle: 'search.searchResults.emptyUnapprovedResults.subtitle',
            },
            getSearchQuery: function () {
                var queryString = (0, SearchQueryUtils_1.buildQueryStringFromFilterFormValues)({
                    type: CONST_1.default.SEARCH.DATA_TYPES.EXPENSE,
                    groupBy: CONST_1.default.SEARCH.GROUP_BY.MEMBERS,
                    feed: [CONST_1.default.COMPANY_CARDS.BANKS.BANK_OF_AMERICA],
                    status: [CONST_1.default.SEARCH.STATUS.EXPENSE.DRAFTS, CONST_1.default.SEARCH.STATUS.EXPENSE.OUTSTANDING],
                });
                return queryString;
            },
        });
    }
    else if (showShowUnapprovedCashSuggestion) {
        accountingSection.menuItems.push({
            translationPath: 'search.unapproved',
            type: CONST_1.default.SEARCH.DATA_TYPES.EXPENSE,
            icon: Expensicons.Hourglass,
            emptyState: {
                headerMedia: LottieAnimations_1.default.Fireworks,
                title: 'search.searchResults.emptyUnapprovedResults.title',
                subtitle: 'search.searchResults.emptyUnapprovedResults.subtitle',
            },
            getSearchQuery: function () {
                var queryString = (0, SearchQueryUtils_1.buildQueryStringFromFilterFormValues)({
                    type: CONST_1.default.SEARCH.DATA_TYPES.EXPENSE,
                    groupBy: CONST_1.default.SEARCH.GROUP_BY.REPORTS,
                    status: [CONST_1.default.SEARCH.STATUS.EXPENSE.DRAFTS, CONST_1.default.SEARCH.STATUS.EXPENSE.OUTSTANDING],
                    reimbursable: CONST_1.default.SEARCH.BOOLEAN.YES,
                });
                return queryString;
            },
        });
    }
    else if (showShowUnapprovedCompanyCardsSuggestion) {
        accountingSection.menuItems.push({
            translationPath: 'search.unapproved',
            type: CONST_1.default.SEARCH.DATA_TYPES.EXPENSE,
            icon: Expensicons.Hourglass,
            emptyState: {
                headerMedia: LottieAnimations_1.default.Fireworks,
                title: 'search.searchResults.emptyUnapprovedResults.title',
                subtitle: 'search.searchResults.emptyUnapprovedResults.subtitle',
            },
            getSearchQuery: function () {
                var queryString = (0, SearchQueryUtils_1.buildQueryStringFromFilterFormValues)({
                    type: CONST_1.default.SEARCH.DATA_TYPES.EXPENSE,
                    groupBy: CONST_1.default.SEARCH.GROUP_BY.MEMBERS,
                    feed: [CONST_1.default.COMPANY_CARDS.BANKS.BANK_OF_AMERICA],
                    status: [CONST_1.default.SEARCH.STATUS.EXPENSE.DRAFTS, CONST_1.default.SEARCH.STATUS.EXPENSE.OUTSTANDING],
                });
                return queryString;
            },
        });
    }
    if (shouldShowReconciliationSuggestion) {
        // s77rt TODO
    }
    // s77rt remove DEV lock
    if (accountingSection.menuItems.length > 0 && (0, Environment_1.isDevelopment)()) {
        typeMenuSections.push(accountingSection);
    }
    return typeMenuSections;
}
function createBaseSavedSearchMenuItem(item, key, index, title, isFocused) {
    return {
        key: key,
        title: title,
        hash: key,
        query: item.query,
        shouldShowRightComponent: true,
        focused: isFocused,
        pendingAction: item.pendingAction,
        disabled: item.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        shouldIconUseAutoWidthStyle: true,
    };
}
/**
 * Whether to show the empty state or not
 */
function shouldShowEmptyState(isDataLoaded, dataLength, type) {
    return !isDataLoaded || dataLength === 0 || !Object.values(CONST_1.default.SEARCH.DATA_TYPES).includes(type);
}
function isSearchDataLoaded(currentSearchResults, lastNonEmptySearchResults, queryJSON) {
    var _a, _b, _c;
    var searchResults = (currentSearchResults === null || currentSearchResults === void 0 ? void 0 : currentSearchResults.data) ? currentSearchResults : lastNonEmptySearchResults;
    var status = (queryJSON !== null && queryJSON !== void 0 ? queryJSON : {}).status;
    var isDataLoaded = (searchResults === null || searchResults === void 0 ? void 0 : searchResults.data) !== undefined &&
        ((_a = searchResults === null || searchResults === void 0 ? void 0 : searchResults.search) === null || _a === void 0 ? void 0 : _a.type) === (queryJSON === null || queryJSON === void 0 ? void 0 : queryJSON.type) &&
        (Array.isArray(status) ? ((_b = searchResults === null || searchResults === void 0 ? void 0 : searchResults.search) === null || _b === void 0 ? void 0 : _b.status) === status.join(',') : ((_c = searchResults === null || searchResults === void 0 ? void 0 : searchResults.search) === null || _c === void 0 ? void 0 : _c.status) === status);
    return isDataLoaded;
}
function getStatusOptions(type, groupBy) {
    switch (type) {
        case CONST_1.default.SEARCH.DATA_TYPES.CHAT:
            return chatStatusOptions;
        case CONST_1.default.SEARCH.DATA_TYPES.INVOICE:
            return invoiceStatusOptions;
        case CONST_1.default.SEARCH.DATA_TYPES.TRIP:
            return tripStatusOptions;
        case CONST_1.default.SEARCH.DATA_TYPES.TASK:
            return taskStatusOptions;
        case CONST_1.default.SEARCH.DATA_TYPES.EXPENSE:
        default:
            return groupBy === CONST_1.default.SEARCH.GROUP_BY.REPORTS || groupBy === CONST_1.default.SEARCH.GROUP_BY.MEMBERS ? expenseReportedStatusOptions : expenseStatusOptions;
    }
}
function getTypeOptions(policies, currentUserLogin) {
    var typeOptions = [
        { translation: 'common.expense', value: CONST_1.default.SEARCH.DATA_TYPES.EXPENSE },
        { translation: 'common.chat', value: CONST_1.default.SEARCH.DATA_TYPES.CHAT },
        { translation: 'common.invoice', value: CONST_1.default.SEARCH.DATA_TYPES.INVOICE },
        { translation: 'common.trip', value: CONST_1.default.SEARCH.DATA_TYPES.TRIP },
        { translation: 'common.task', value: CONST_1.default.SEARCH.DATA_TYPES.TASK },
    ];
    var shouldHideInvoiceOption = !(0, PolicyUtils_1.canSendInvoice)(policies, currentUserLogin) && !(0, ReportUtils_1.hasInvoiceReports)();
    // Remove the invoice option if the user is not allowed to send invoices
    return shouldHideInvoiceOption ? typeOptions.filter(function (typeOption) { return typeOption.value !== CONST_1.default.SEARCH.DATA_TYPES.INVOICE; }) : typeOptions;
}
function getGroupByOptions() {
    return Object.values(CONST_1.default.SEARCH.GROUP_BY).map(function (value) { return ({ translation: "search.filters.groupBy.".concat(value), value: value }); });
}
