import type {TextStyle, ViewStyle} from 'react-native';
import Onyx from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {MenuItemWithLink} from '@components/MenuItemList';
import type {SearchColumnType, SearchStatus, SortOrder} from '@components/Search/types';
import ChatListItem from '@components/SelectionList/ChatListItem';
import ReportListItem from '@components/SelectionList/Search/ReportListItem';
import TransactionListItem from '@components/SelectionList/Search/TransactionListItem';
import type {ListItem, ReportActionListItemType, ReportListItemType, TransactionListItemType} from '@components/SelectionList/types';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {SaveSearchItem} from '@src/types/onyx/SaveSearch';
import type SearchResults from '@src/types/onyx/SearchResults';
import type {
    ListItemDataType,
    ListItemType,
    SearchDataTypes,
    SearchPersonalDetails,
    SearchPolicy,
    SearchReport,
    SearchTransaction,
    SearchTransactionAction,
} from '@src/types/onyx/SearchResults';
import type IconAsset from '@src/types/utils/IconAsset';
import {canApproveIOU, canIOUBePaid, canSubmitReport} from './actions/IOU';
import {convertToDisplayString} from './CurrencyUtils';
import DateUtils from './DateUtils';
import {formatPhoneNumber} from './LocalePhoneNumber';
import {translateLocal} from './Localize';
import Navigation from './Navigation/Navigation';
import {getDisplayNameOrDefault} from './PersonalDetailsUtils';
import {canSendInvoice} from './PolicyUtils';
import {isAddCommentAction, isDeletedAction} from './ReportActionsUtils';
import {
    getSearchReportName,
    hasInvoiceReports,
    hasOnlyHeldExpenses,
    hasViolations,
    isAllowedToApproveExpenseReport as isAllowedToApproveExpenseReportUtils,
    isClosedReport,
    isInvoiceReport,
    isMoneyRequestReport,
    isSettled,
} from './ReportUtils';
import {buildCannedSearchQuery} from './SearchQueryUtils';
import {
    getMerchant,
    getAmount as getTransactionAmount,
    getCreated as getTransactionCreatedDate,
    getMerchant as getTransactionMerchant,
    isAmountMissing,
    isExpensifyCardTransaction,
    isPartialMerchant,
    isPending,
    isReceiptBeingScanned,
    isScanRequest,
} from './TransactionUtils';

const columnNamesToSortingProperty = {
    [CONST.SEARCH.TABLE_COLUMNS.TO]: 'formattedTo' as const,
    [CONST.SEARCH.TABLE_COLUMNS.FROM]: 'formattedFrom' as const,
    [CONST.SEARCH.TABLE_COLUMNS.DATE]: 'date' as const,
    [CONST.SEARCH.TABLE_COLUMNS.TAG]: 'tag' as const,
    [CONST.SEARCH.TABLE_COLUMNS.MERCHANT]: 'formattedMerchant' as const,
    [CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]: 'formattedTotal' as const,
    [CONST.SEARCH.TABLE_COLUMNS.CATEGORY]: 'category' as const,
    [CONST.SEARCH.TABLE_COLUMNS.TYPE]: 'transactionType' as const,
    [CONST.SEARCH.TABLE_COLUMNS.ACTION]: 'action' as const,
    [CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION]: 'comment' as const,
    [CONST.SEARCH.TABLE_COLUMNS.TAX_AMOUNT]: null,
    [CONST.SEARCH.TABLE_COLUMNS.RECEIPT]: null,
};

let currentAccountID: number | undefined;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (session) => {
        currentAccountID = session?.accountID;
    },
});

const emptyPersonalDetails = {
    accountID: CONST.REPORT.OWNER_ACCOUNT_ID_FAKE,
    avatar: '',
    displayName: undefined,
    login: undefined,
};

type ReportKey = `${typeof ONYXKEYS.COLLECTION.REPORT}${string}`;

type TransactionKey = `${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}`;

type ReportActionKey = `${typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS}${string}`;

type PolicyKey = `${typeof ONYXKEYS.COLLECTION.POLICY}${string}`;
type ViolationKey = `${typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${string}`;

type SavedSearchMenuItem = MenuItemWithLink & {
    key: string;
    hash: string;
    query: string;
    styles?: Array<ViewStyle | TextStyle>;
};

type SearchTypeMenuItem = {
    translationPath: TranslationPaths;
    type: SearchDataTypes;
    icon: IconAsset;
    getRoute: (policyID?: string) => Route;
};

/**
 * @private
 *
 * Returns a list of properties that are common to every Search ListItem
 */
function getTransactionItemCommonFormattedProperties(
    transactionItem: SearchTransaction,
    from: SearchPersonalDetails,
    to: SearchPersonalDetails,
): Pick<TransactionListItemType, 'formattedFrom' | 'formattedTo' | 'formattedTotal' | 'formattedMerchant' | 'date'> {
    const isExpenseReport = transactionItem.reportType === CONST.REPORT.TYPE.EXPENSE;

    const formattedFrom = formatPhoneNumber(getDisplayNameOrDefault(from));
    const formattedTo = formatPhoneNumber(getDisplayNameOrDefault(to));
    const formattedTotal = getTransactionAmount(transactionItem, isExpenseReport);
    const date = transactionItem?.modifiedCreated ? transactionItem.modifiedCreated : transactionItem?.created;
    const merchant = getTransactionMerchant(transactionItem);
    const formattedMerchant = merchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT ? '' : merchant;

    return {
        formattedFrom,
        formattedTo,
        date,
        formattedTotal,
        formattedMerchant,
    };
}

/**
 * @private
 */
function isReportEntry(key: string): key is ReportKey {
    return key.startsWith(ONYXKEYS.COLLECTION.REPORT);
}

/**
 * @private
 */
function isTransactionEntry(key: string): key is TransactionKey {
    return key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION);
}

/**
 * @private
 */
function isPolicyEntry(key: string): key is PolicyKey {
    return key.startsWith(ONYXKEYS.COLLECTION.POLICY);
}

function isViolationEntry(key: string): key is ViolationKey {
    return key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
}

/**
 * @private
 */
function isReportActionEntry(key: string): key is ReportActionKey {
    return key.startsWith(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
}

/**
 * Determines whether to display the merchant field based on the transactions in the search results.
 */
function getShouldShowMerchant(data: OnyxTypes.SearchResults['data']): boolean {
    return Object.keys(data).some((key) => {
        if (isTransactionEntry(key)) {
            const item = data[key];
            const merchant = item.modifiedMerchant ? item.modifiedMerchant : item.merchant ?? '';
            return merchant !== '' && merchant !== CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
        }
        return false;
    });
}

/**
 * Type guard that checks if something is a ReportListItemType
 */
function isReportListItemType(item: ListItem): item is ReportListItemType {
    return 'transactions' in item;
}

/**
 * Type guard that checks if something is a TransactionListItemType
 */
function isTransactionListItemType(item: TransactionListItemType | ReportListItemType | ReportActionListItemType): item is TransactionListItemType {
    const transactionListItem = item as TransactionListItemType;
    return transactionListItem.transactionID !== undefined;
}

/**
 * Type guard that checks if something is a ReportActionListItemType
 */
function isReportActionListItemType(item: TransactionListItemType | ReportListItemType | ReportActionListItemType): item is ReportActionListItemType {
    const reportActionListItem = item as ReportActionListItemType;
    return reportActionListItem.reportActionID !== undefined;
}

/**
 * Checks if the date of transactions or reports indicate the need to display the year because they are from a past year.
 */
function shouldShowYear(data: TransactionListItemType[] | ReportListItemType[] | OnyxTypes.SearchResults['data']) {
    const currentYear = new Date().getFullYear();

    if (Array.isArray(data)) {
        return data.some((item: TransactionListItemType | ReportListItemType) => {
            if (isReportListItemType(item)) {
                // If the item is a ReportListItemType, iterate over its transactions and check them
                return item.transactions.some((transaction) => {
                    const transactionYear = new Date(getTransactionCreatedDate(transaction)).getFullYear();
                    return transactionYear !== currentYear;
                });
            }

            const createdYear = new Date(item?.modifiedCreated ? item.modifiedCreated : item?.created || '').getFullYear();
            return createdYear !== currentYear;
        });
    }

    for (const key in data) {
        if (isTransactionEntry(key)) {
            const item = data[key];
            const date = getTransactionCreatedDate(item);

            if (DateUtils.doesDateBelongToAPastYear(date)) {
                return true;
            }
        } else if (isReportActionEntry(key)) {
            const item = data[key];
            for (const action of Object.values(item)) {
                const date = action.created;

                if (DateUtils.doesDateBelongToAPastYear(date)) {
                    return true;
                }
            }
        }
    }
    return false;
}

/**
 * @private
 * Generates a display name for IOU reports considering the personal details of the payer and the transaction details.
 */
function getIOUReportName(data: OnyxTypes.SearchResults['data'], reportItem: SearchReport) {
    const payerPersonalDetails = reportItem.managerID ? data.personalDetailsList?.[reportItem.managerID] : emptyPersonalDetails;
    const payerName = payerPersonalDetails?.displayName ?? payerPersonalDetails?.login ?? translateLocal('common.hidden');
    const formattedAmount = convertToDisplayString(reportItem.total ?? 0, reportItem.currency ?? CONST.CURRENCY.USD);
    if (reportItem.action === CONST.SEARCH.ACTION_TYPES.VIEW || reportItem.action === CONST.SEARCH.ACTION_TYPES.PAY) {
        return translateLocal('iou.payerOwesAmount', {
            payer: payerName,
            amount: formattedAmount,
        });
    }

    if (reportItem.action === CONST.SEARCH.ACTION_TYPES.PAID) {
        return translateLocal('iou.payerPaidAmount', {
            payer: payerName,
            amount: formattedAmount,
        });
    }

    return reportItem.reportName;
}

/**
 * @private
 * Organizes data into List Sections for display, for the TransactionListItemType of Search Results.
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getTransactionsSections(data: OnyxTypes.SearchResults['data'], metadata: OnyxTypes.SearchResults['search']): TransactionListItemType[] {
    const shouldShowMerchant = getShouldShowMerchant(data);
    const doesDataContainAPastYearTransaction = shouldShowYear(data);

    return Object.keys(data)
        .filter(isTransactionEntry)
        .map((key) => {
            const transactionItem = data[key];
            const from = data.personalDetailsList?.[transactionItem.accountID];
            const to = transactionItem.managerID ? data.personalDetailsList?.[transactionItem.managerID] : emptyPersonalDetails;

            const {formattedFrom, formattedTo, formattedTotal, formattedMerchant, date} = getTransactionItemCommonFormattedProperties(transactionItem, from, to);

            return {
                ...transactionItem,
                action: getAction(data, key),
                from,
                to,
                formattedFrom,
                formattedTo,
                formattedTotal,
                formattedMerchant,
                date,
                shouldShowMerchant,
                shouldShowCategory: metadata?.columnsToShow?.shouldShowCategoryColumn,
                shouldShowTag: metadata?.columnsToShow?.shouldShowTagColumn,
                shouldShowTax: metadata?.columnsToShow?.shouldShowTaxColumn,
                keyForList: transactionItem.transactionID,
                shouldShowYear: doesDataContainAPastYearTransaction,
            };
        });
}

/**
 * Returns the action that can be taken on a given transaction or report
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getAction(data: OnyxTypes.SearchResults['data'], key: string): SearchTransactionAction {
    const isTransaction = isTransactionEntry(key);
    if (!isTransaction && !isReportEntry(key)) {
        return CONST.SEARCH.ACTION_TYPES.VIEW;
    }

    const transaction = isTransaction ? data[key] : undefined;
    const report = isTransaction ? data[`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`] : data[key];

    // Tracked and unreported expenses don't have a report, so we return early.
    if (!report) {
        return CONST.SEARCH.ACTION_TYPES.VIEW;
    }

    if (isSettled(report)) {
        return CONST.SEARCH.ACTION_TYPES.PAID;
    }

    if (isClosedReport(report)) {
        return CONST.SEARCH.ACTION_TYPES.DONE;
    }

    // We need to check both options for a falsy value since the transaction might not have an error but the report associated with it might. We return early if there are any errors for performance reasons, so we don't need to compute any other possible actions.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (transaction?.errors || report?.errors) {
        return CONST.SEARCH.ACTION_TYPES.REVIEW;
    }

    // We don't need to run the logic if this is not a transaction or iou/expense report, so let's shortcircuit the logic for performance reasons
    if (!isMoneyRequestReport(report)) {
        return CONST.SEARCH.ACTION_TYPES.VIEW;
    }

    const allReportTransactions = (
        isReportEntry(key)
            ? Object.entries(data)
                  .filter(([itemKey, value]) => isTransactionEntry(itemKey) && (value as SearchTransaction)?.reportID === report.reportID)
                  .map((item) => item[1])
            : [transaction]
    ) as SearchTransaction[];

    const allViolations = Object.fromEntries(Object.entries(data).filter(([itemKey]) => isViolationEntry(itemKey))) as OnyxCollection<OnyxTypes.TransactionViolation[]>;
    const policy = data[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`] ?? {};
    const isSubmitter = report.ownerAccountID === currentAccountID;
    const isAdmin = policy.role === CONST.POLICY.ROLE.ADMIN;
    const isApprover = report.managerID === currentAccountID;
    const shouldShowReview = hasViolations(report.reportID, allViolations, undefined, allReportTransactions) && (isSubmitter || isApprover || isAdmin);

    if (shouldShowReview) {
        return CONST.SEARCH.ACTION_TYPES.REVIEW;
    }

    // Submit/Approve/Pay can only be taken on transactions if the transaction is the only one on the report, otherwise `View` is the only option.
    // If this condition is not met, return early for performance reasons
    if (isTransaction && !data[key].isFromOneTransactionReport) {
        return CONST.SEARCH.ACTION_TYPES.VIEW;
    }

    const invoiceReceiverPolicy =
        isInvoiceReport(report) && report?.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS
            ? data[`${ONYXKEYS.COLLECTION.POLICY}${report?.invoiceReceiver?.policyID}`]
            : undefined;

    const chatReport = data[`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`] ?? {};
    const chatReportRNVP = data[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.chatReportID}`] ?? undefined;

    if (canIOUBePaid(report, chatReport, policy, allReportTransactions, false, chatReportRNVP, invoiceReceiverPolicy) && !hasOnlyHeldExpenses(report.reportID, allReportTransactions)) {
        return CONST.SEARCH.ACTION_TYPES.PAY;
    }
    const hasOnlyPendingCardOrScanningTransactions =
        allReportTransactions.length > 0 &&
        allReportTransactions.every(
            (t) => (isExpensifyCardTransaction(t) && isPending(t)) || (isPartialMerchant(getMerchant(t)) && isAmountMissing(t)) || (isScanRequest(t) && isReceiptBeingScanned(t)),
        );

    const isAllowedToApproveExpenseReport = isAllowedToApproveExpenseReportUtils(report, undefined, policy);
    if (canApproveIOU(report, policy) && isAllowedToApproveExpenseReport && !hasOnlyPendingCardOrScanningTransactions) {
        return CONST.SEARCH.ACTION_TYPES.APPROVE;
    }

    // We check for isAllowedToApproveExpenseReport because if the policy has preventSelfApprovals enabled, we disable the Submit action and in that case we want to show the View action instead
    if (canSubmitReport(report, policy, allReportTransactions, allViolations) && isAllowedToApproveExpenseReport) {
        return CONST.SEARCH.ACTION_TYPES.SUBMIT;
    }

    return CONST.SEARCH.ACTION_TYPES.VIEW;
}

/**
 * @private
 * Organizes data into List Sections for display, for the ReportActionListItemType of Search Results.
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getReportActionsSections(data: OnyxTypes.SearchResults['data']): ReportActionListItemType[] {
    const reportActionItems: ReportActionListItemType[] = [];

    const transactions = Object.keys(data)
        .filter(isTransactionEntry)
        .map((key) => data[key]);

    const reports = Object.keys(data)
        .filter(isReportEntry)
        .map((key) => data[key]);

    const policies = Object.keys(data)
        .filter(isPolicyEntry)
        .map((key) => data[key]);

    for (const key in data) {
        if (isReportActionEntry(key)) {
            const reportActions = data[key];
            for (const reportAction of Object.values(reportActions)) {
                const from = data.personalDetailsList?.[reportAction.accountID];
                const report = data[`${ONYXKEYS.COLLECTION.REPORT}${reportAction.reportID}`] ?? {};
                const policy = data[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`] ?? {};
                const invoiceReceiverPolicy: SearchPolicy | undefined =
                    report?.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS ? data[`${ONYXKEYS.COLLECTION.POLICY}${report.invoiceReceiver.policyID}`] : undefined;
                if (isDeletedAction(reportAction)) {
                    // eslint-disable-next-line no-continue
                    continue;
                }
                if (!isAddCommentAction(reportAction)) {
                    // eslint-disable-next-line no-continue
                    continue;
                }
                reportActionItems.push({
                    ...reportAction,
                    from,
                    reportName: getSearchReportName({report, policy, personalDetails: data.personalDetailsList, transactions, invoiceReceiverPolicy, reports, policies}),
                    formattedFrom: from?.displayName ?? from?.login ?? '',
                    date: reportAction.created,
                    keyForList: reportAction.reportActionID,
                });
            }
        }
    }
    return reportActionItems;
}

/**
 * @private
 * Organizes data into List Sections for display, for the ReportListItemType of Search Results.
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getReportSections(data: OnyxTypes.SearchResults['data'], metadata: OnyxTypes.SearchResults['search']): ReportListItemType[] {
    const shouldShowMerchant = getShouldShowMerchant(data);

    const doesDataContainAPastYearTransaction = shouldShowYear(data);

    const reportIDToTransactions: Record<string, ReportListItemType> = {};
    for (const key in data) {
        if (isReportEntry(key)) {
            const reportItem = {...data[key]};
            const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportItem.reportID}`;
            const transactions = reportIDToTransactions[reportKey]?.transactions ?? [];
            const isIOUReport = reportItem.type === CONST.REPORT.TYPE.IOU;

            reportIDToTransactions[reportKey] = {
                ...reportItem,
                action: getAction(data, key),
                keyForList: reportItem.reportID,
                from: data.personalDetailsList?.[reportItem.accountID ?? CONST.DEFAULT_NUMBER_ID],
                to: reportItem.managerID ? data.personalDetailsList?.[reportItem.managerID] : emptyPersonalDetails,
                transactions,
            };

            if (isIOUReport) {
                reportIDToTransactions[reportKey].reportName = getIOUReportName(data, reportIDToTransactions[reportKey]);
            }
        } else if (isTransactionEntry(key)) {
            const transactionItem = {...data[key]};
            const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${transactionItem.reportID}`;

            const from = data.personalDetailsList?.[transactionItem.accountID];
            const to = transactionItem.managerID ? data.personalDetailsList?.[transactionItem.managerID] : emptyPersonalDetails;

            const {formattedFrom, formattedTo, formattedTotal, formattedMerchant, date} = getTransactionItemCommonFormattedProperties(transactionItem, from, to);

            const transaction = {
                ...transactionItem,
                action: getAction(data, key),
                from,
                to,
                formattedFrom,
                formattedTo,
                formattedTotal,
                formattedMerchant,
                date,
                shouldShowMerchant,
                shouldShowCategory: metadata?.columnsToShow?.shouldShowCategoryColumn,
                shouldShowTag: metadata?.columnsToShow?.shouldShowTagColumn,
                shouldShowTax: metadata?.columnsToShow?.shouldShowTaxColumn,
                keyForList: transactionItem.transactionID,
                shouldShowYear: doesDataContainAPastYearTransaction,
            };
            if (reportIDToTransactions[reportKey]?.transactions) {
                reportIDToTransactions[reportKey].transactions.push(transaction);
            } else if (reportIDToTransactions[reportKey]) {
                reportIDToTransactions[reportKey].transactions = [transaction];
            }
        }
    }

    return Object.values(reportIDToTransactions);
}

/**
 * Returns the appropriate list item component based on the type and status of the search data.
 */
function getListItem(type: SearchDataTypes, status: SearchStatus, shouldGroupByReports = false): ListItemType<typeof type, typeof status> {
    if (type === CONST.SEARCH.DATA_TYPES.CHAT) {
        return ChatListItem;
    }
    if (!shouldGroupByReports) {
        return TransactionListItem;
    }
    return ReportListItem;
}

/**
 * Organizes data into appropriate list sections for display based on the type of search results.
 */
function getSections(type: SearchDataTypes, status: SearchStatus, data: OnyxTypes.SearchResults['data'], metadata: OnyxTypes.SearchResults['search'], shouldGroupByReports = false) {
    if (type === CONST.SEARCH.DATA_TYPES.CHAT) {
        return getReportActionsSections(data);
    }
    if (!shouldGroupByReports) {
        return getTransactionsSections(data, metadata);
    }
    return getReportSections(data, metadata);
}

/**
 * Sorts sections of data based on a specified column and sort order for displaying sorted results.
 */
function getSortedSections(
    type: SearchDataTypes,
    status: SearchStatus,
    data: ListItemDataType<typeof type, typeof status>,
    sortBy?: SearchColumnType,
    sortOrder?: SortOrder,
    shouldGroupByReports = false,
) {
    if (type === CONST.SEARCH.DATA_TYPES.CHAT) {
        return getSortedReportActionData(data as ReportActionListItemType[]);
    }
    if (!shouldGroupByReports) {
        return getSortedTransactionData(data as TransactionListItemType[], sortBy, sortOrder);
    }
    return getSortedReportData(data as ReportListItemType[]);
}

/**
 * @private
 * Sorts transaction sections based on a specified column and sort order.
 */
function getSortedTransactionData(data: TransactionListItemType[], sortBy?: SearchColumnType, sortOrder?: SortOrder) {
    if (!sortBy || !sortOrder) {
        return data;
    }

    const sortingProperty = columnNamesToSortingProperty[sortBy];

    if (!sortingProperty) {
        return data;
    }

    return data.sort((a, b) => {
        const aValue = sortingProperty === 'comment' ? a.comment?.comment : a[sortingProperty];
        const bValue = sortingProperty === 'comment' ? b.comment?.comment : b[sortingProperty];

        if (aValue === undefined || bValue === undefined) {
            return 0;
        }

        // We are guaranteed that both a and b will be string or number at the same time
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortOrder === CONST.SEARCH.SORT_ORDER.ASC ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }

        const aNum = aValue as number;
        const bNum = bValue as number;

        return sortOrder === CONST.SEARCH.SORT_ORDER.ASC ? aNum - bNum : bNum - aNum;
    });
}

/**
 * @private
 * Determines the date of the newest transaction within a report for sorting purposes.
 */
function getReportNewestTransactionDate(report: ReportListItemType) {
    return report.transactions?.reduce((max, curr) => (curr.modifiedCreated ?? curr.created > (max?.created ?? '') ? curr : max), report.transactions.at(0))?.created;
}

/**
 * @private
 * Sorts report sections based on a specified column and sort order.
 */
function getSortedReportData(data: ReportListItemType[]) {
    return data.sort((a, b) => {
        const aNewestTransaction = getReportNewestTransactionDate(a);
        const bNewestTransaction = getReportNewestTransactionDate(b);

        if (!aNewestTransaction || !bNewestTransaction) {
            return 0;
        }

        return bNewestTransaction.toLowerCase().localeCompare(aNewestTransaction);
    });
}

/**
 * @private
 * Sorts report actions sections based on a specified column and sort order.
 */
function getSortedReportActionData(data: ReportActionListItemType[]) {
    return data.sort((a, b) => {
        const aValue = a?.created;
        const bValue = b?.created;

        if (aValue === undefined || bValue === undefined) {
            return 0;
        }

        return bValue.toLowerCase().localeCompare(aValue);
    });
}

/**
 * Checks if the search results contain any data, useful for determining if the search results are empty.
 */
function isSearchResultsEmpty(searchResults: SearchResults) {
    return !Object.keys(searchResults?.data).some((key) => key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION));
}

/**
 * Returns the corresponding translation key for expense type
 */
function getExpenseTypeTranslationKey(expenseType: ValueOf<typeof CONST.SEARCH.TRANSACTION_TYPE>): TranslationPaths {
    // eslint-disable-next-line default-case
    switch (expenseType) {
        case CONST.SEARCH.TRANSACTION_TYPE.DISTANCE:
            return 'common.distance';
        case CONST.SEARCH.TRANSACTION_TYPE.CARD:
            return 'common.card';
        case CONST.SEARCH.TRANSACTION_TYPE.CASH:
            return 'iou.cash';
    }
}

/**
 * Constructs and configures the overflow menu for search items, handling interactions such as renaming or deleting items.
 */
function getOverflowMenu(itemName: string, hash: number, inputQuery: string, showDeleteModal: (hash: number) => void, isMobileMenu?: boolean, closeMenu?: () => void) {
    return [
        {
            text: translateLocal('common.rename'),
            onSelected: () => {
                if (isMobileMenu && closeMenu) {
                    closeMenu();
                }
                Navigation.navigate(ROUTES.SEARCH_SAVED_SEARCH_RENAME.getRoute({name: encodeURIComponent(itemName), jsonQuery: inputQuery}));
            },
            icon: Expensicons.Pencil,
            shouldShowRightIcon: false,
            shouldShowRightComponent: false,
            shouldCallAfterModalHide: true,
        },
        {
            text: translateLocal('common.delete'),
            onSelected: () => {
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
function isCorrectSearchUserName(displayName?: string) {
    return displayName && displayName.toUpperCase() !== CONST.REPORT.OWNER_EMAIL_FAKE;
}

function createTypeMenuItems(allPolicies: OnyxCollection<OnyxTypes.Policy> | null, email: string | undefined): SearchTypeMenuItem[] {
    const typeMenuItems: SearchTypeMenuItem[] = [
        {
            translationPath: 'common.expenses',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            icon: Expensicons.Receipt,
            getRoute: (policyID?: string) => {
                const query = buildCannedSearchQuery({policyID});
                return ROUTES.SEARCH_ROOT.getRoute({query});
            },
        },
        {
            translationPath: 'common.expenseReports',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            icon: Expensicons.Document,
            getRoute: (policyID?: string) => {
                const query = buildCannedSearchQuery({groupBy: CONST.SEARCH.GROUP_BY.REPORTS, policyID});
                return ROUTES.SEARCH_ROOT.getRoute({query});
            },
        },
        {
            translationPath: 'common.chats',
            type: CONST.SEARCH.DATA_TYPES.CHAT,
            icon: Expensicons.ChatBubbles,
            getRoute: (policyID?: string) => {
                const query = buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.CHAT, status: CONST.SEARCH.STATUS.CHAT.ALL, policyID});
                return ROUTES.SEARCH_ROOT.getRoute({query});
            },
        },
    ];

    if (canSendInvoice(allPolicies, email) || hasInvoiceReports()) {
        typeMenuItems.push({
            translationPath: 'workspace.common.invoices',
            type: CONST.SEARCH.DATA_TYPES.INVOICE,
            icon: Expensicons.InvoiceGeneric,
            getRoute: (policyID?: string) => {
                const query = buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.INVOICE, status: CONST.SEARCH.STATUS.INVOICE.ALL, policyID});
                return ROUTES.SEARCH_ROOT.getRoute({query});
            },
        });
    }

    typeMenuItems.push({
        translationPath: 'travel.trips',
        type: CONST.SEARCH.DATA_TYPES.TRIP,
        icon: Expensicons.Suitcase,
        getRoute: (policyID?: string) => {
            const query = buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.TRIP, status: CONST.SEARCH.STATUS.TRIP.ALL, policyID});
            return ROUTES.SEARCH_ROOT.getRoute({query});
        },
    });

    return typeMenuItems;
}

function createBaseSavedSearchMenuItem(item: SaveSearchItem, key: string, index: number, title: string, hash: number): SavedSearchMenuItem {
    return {
        key,
        title,
        hash: key,
        query: item.query,
        shouldShowRightComponent: true,
        focused: Number(key) === hash,
        pendingAction: item.pendingAction,
        disabled: item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        shouldIconUseAutoWidthStyle: true,
    };
}

/**
 * Whether to show the empty state or not
 */
function shouldShowEmptyState(isDataLoaded: boolean, dataLength: number, type: SearchDataTypes) {
    return !isDataLoaded || dataLength === 0 || !Object.values(CONST.SEARCH.DATA_TYPES).includes(type);
}

export {
    getListItem,
    getSections,
    getShouldShowMerchant,
    getSortedSections,
    isReportListItemType,
    isSearchResultsEmpty,
    isTransactionListItemType,
    isReportActionListItemType,
    shouldShowYear,
    getExpenseTypeTranslationKey,
    getOverflowMenu,
    isCorrectSearchUserName,
    isReportActionEntry,
    getAction,
    createTypeMenuItems,
    createBaseSavedSearchMenuItem,
    shouldShowEmptyState,
};
export type {SavedSearchMenuItem, SearchTypeMenuItem};
