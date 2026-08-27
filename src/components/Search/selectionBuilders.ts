import {isSplitAction} from '@libs/ReportSecondaryActionUtils';
import {canEditFieldOfMoneyRequest, canHoldUnholdReportAction, canRejectReportAction, getReimbursableTotal, isMoneyRequestReport, isOneTransactionReport} from '@libs/ReportUtils';
import {isTransactionListItemType, isTransactionReportGroupListItemType} from '@libs/SearchUIUtils';
import {getOriginalTransactionWithSplitInfo, hasValidModifiedAmount, isExpenseUnreported, isOnHold, isTransactionPendingDelete} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import type {OutstandingReportsByPolicyIDDerivedValue, Report, ReportNameValuePairs, Transaction} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import type {TransactionGroupListItemType, TransactionListItemType, TransactionReportGroupListItemType} from './SearchList/ListItem/types';
import type {SearchData, SelectedReports, SelectedTransactionInfo, SelectedTransactions} from './types';

type MapTransactionItemToSelectedEntryParams = {
    /** The transaction row being added to the selection */
    item: TransactionListItemType;

    /** Live Onyx transaction for the row, used for hold/split checks */
    itemTransaction: OnyxEntry<Transaction>;

    /** Original transaction when the row is a split, used to derive split info */
    originalItemTransaction: OnyxEntry<Transaction>;

    /** Email of the current user */
    currentUserLogin: string;

    /** Account ID of the current user */
    currentUserAccountID: number;

    /** Report name-value pairs collection, used for the change-report eligibility archived check */
    reportNameValuePairs: OnyxCollection<ReportNameValuePairs>;

    /** Derived outstanding reports per policy, used for the change-report eligibility check */
    outstandingReportsByPolicyID: OutstandingReportsByPolicyIDDerivedValue | undefined;

    /** The current user's self-DM report, used as the parent for unreported (track) expenses */
    selfDMReport: OnyxEntry<Report>;

    /** Keep the amount signed instead of taking its absolute value */
    allowNegativeAmount: boolean;

    /** The row's parent report, used for split eligibility */
    parentReport: OnyxEntry<Report> | undefined;
};

/**
 * Builds the `[keyForList, SelectedTransactionInfo]` entry for a single transaction row, precomputing the
 * per-row action flags (hold/unhold, reject, split, change-report, etc.) that the selection footer and bulk
 * actions rely on.
 */
function mapTransactionItemToSelectedEntry({
    item,
    itemTransaction,
    originalItemTransaction,
    currentUserLogin,
    currentUserAccountID,
    reportNameValuePairs,
    outstandingReportsByPolicyID,
    selfDMReport,
    allowNegativeAmount,
    parentReport,
}: MapTransactionItemToSelectedEntryParams): [string, SelectedTransactionInfo] {
    const {canHoldRequest, canUnholdRequest} = canHoldUnholdReportAction(item.report, item.reportAction, item.holdReportAction, item, item.policy, currentUserAccountID);
    const canRejectRequest = item.report ? canRejectReportAction(item.report, currentUserAccountID, item.policy) : false;
    const amount = hasValidModifiedAmount(item) ? Number(item.modifiedAmount) : item.amount;
    const isUnreported = isExpenseUnreported(item);
    const reportForSplit = item.report ?? (isUnreported ? selfDMReport : undefined);

    return [
        item.keyForList,
        {
            transaction: item,
            isSelected: true,
            canReject: canRejectRequest,
            canHold: canHoldRequest,
            isHeld: isOnHold(item),
            canUnhold: canUnholdRequest,
            canSplit: isSplitAction(reportForSplit, [itemTransaction], originalItemTransaction, currentUserLogin, currentUserAccountID, item.policy, parentReport),
            hasBeenSplit: getOriginalTransactionWithSplitInfo(itemTransaction, originalItemTransaction).isExpenseSplit,
            canChangeReport: canEditFieldOfMoneyRequest({
                reportAction: item.reportAction,
                fieldToEdit: CONST.EDIT_REQUEST_FIELD.REPORT,
                outstandingReportsByPolicyID,
                transaction: item,
                report: item.report,
                policy: item.policy,
                reportNameValuePairs,
            }),
            action: item.action,
            groupCurrency: item.groupCurrency,
            groupExchangeRate: item.groupExchangeRate,
            currencyConversionRate: item.currencyConversionRate,
            reportID: item.reportID,
            policyID: item.policyID,
            amount: allowNegativeAmount ? amount : Math.abs(amount),
            groupAmount: item.groupAmount,
            currency: item.currency,
            isFromOneTransactionReport: isOneTransactionReport(item.report),
            ownerAccountID: item.reportAction?.actorAccountID,
            reportAction: item.reportAction,
            report: item.report,
        },
    ];
}

function mapEmptyReportToSelectedEntry(item: TransactionReportGroupListItemType | TransactionGroupListItemType): [string, SelectedTransactionInfo] {
    if (isTransactionReportGroupListItemType(item)) {
        const currency = item.currency ?? '';
        return [
            item.keyForList ?? '',
            {
                isFromOneTransactionReport: false,
                isSelected: true,
                canHold: false,
                canSplit: false,
                canReject: false,
                hasBeenSplit: false,
                isHeld: false,
                canUnhold: false,
                canChangeReport: false,
                action: item.action ?? CONST.SEARCH.ACTION_TYPES.VIEW,
                reportID: item.reportID,
                policyID: item.policyID ?? CONST.POLICY.ID_FAKE,
                amount: item.totalDisplaySpend ?? item.total ?? 0,
                currency,
                ...(currency ? {groupCurrency: currency} : {}),
            },
        ];
    }

    const currency = item.currency ?? '';

    return [
        item.keyForList ?? '',
        {
            isFromOneTransactionReport: false,
            isSelected: true,
            canHold: false,
            canSplit: false,
            canReject: false,
            hasBeenSplit: false,
            isHeld: false,
            canUnhold: false,
            canChangeReport: false,
            action: CONST.SEARCH.ACTION_TYPES.VIEW,
            reportID: item.reportID,
            policyID: item.policyID ?? CONST.POLICY.ID_FAKE,
            amount: item.total ?? 0,
            currency,
            ...(currency ? {groupCurrency: currency} : {}),
        },
    ];
}

type PrepareTransactionsListParams = {
    /** The transaction row being toggled in the selection */
    item: TransactionListItemType;

    /** Live Onyx transaction for the row, used for hold/split checks */
    itemTransaction: OnyxEntry<Transaction>;

    /** Original transaction when the row is a split, used to derive split info */
    originalItemTransaction: OnyxEntry<Transaction>;

    /** Current selection map the row is toggled against */
    selectedTransactions: SelectedTransactions;

    /** Email of the current user */
    currentUserLogin: string;

    /** Account ID of the current user */
    currentUserAccountID: number;

    /** Report name-value pairs collection, used for the change-report eligibility archived check */
    reportNameValuePairs: OnyxCollection<ReportNameValuePairs>;

    /** Derived outstanding reports per policy, used for the change-report eligibility check */
    outstandingReportsByPolicyID: OutstandingReportsByPolicyIDDerivedValue | undefined;

    /** The current user's self-DM report, used as the parent for unreported (track) expenses */
    selfDMReport: OnyxEntry<Report>;

    /** The row's parent report, used for split eligibility */
    parentReport: OnyxEntry<Report> | undefined;
};

/**
 * Toggles a single transaction in the selection map: removes its entry when it is already selected, otherwise
 * adds it (built via `mapTransactionItemToSelectedEntry`). Returns the next selection map.
 */
function prepareTransactionsList({
    item,
    itemTransaction,
    originalItemTransaction,
    selectedTransactions,
    currentUserLogin,
    currentUserAccountID,
    reportNameValuePairs,
    outstandingReportsByPolicyID,
    selfDMReport,
    parentReport,
}: PrepareTransactionsListParams) {
    if (selectedTransactions[item.keyForList]?.isSelected) {
        const {[item.keyForList]: omittedTransaction, ...transactions} = selectedTransactions;

        return transactions;
    }

    const [key, selectedInfo] = mapTransactionItemToSelectedEntry({
        item,
        itemTransaction,
        originalItemTransaction,
        currentUserLogin,
        currentUserAccountID,
        reportNameValuePairs,
        outstandingReportsByPolicyID,
        selfDMReport,
        allowNegativeAmount: false,
        parentReport,
    });

    return {
        ...selectedTransactions,
        [key]: selectedInfo,
    };
}

/**
 * Derives `selectedReports` from the current selection + visible rows.
 *
 * Note: `selectedTransactionIDs` and `selectedTransactions` are two separate properties.
 * Setting or clearing one of them does not influence the other.
 * IDs should be used if transaction details are not required.
 */
function deriveSelectedReports(transactionIDs: SelectedTransactions, data: SearchData): SelectedReports[] {
    if (data.length && data.every(isTransactionReportGroupListItemType)) {
        const result: SelectedReports[] = [];
        for (const item of data) {
            if (!isMoneyRequestReport(item)) {
                continue;
            }
            const isSelected =
                item.transactions.length === 0
                    ? !!item.keyForList && transactionIDs[item.keyForList]?.isSelected
                    : item.transactions.every(({keyForList}) => transactionIDs[keyForList]?.isSelected);
            if (!isSelected) {
                continue;
            }
            result.push({
                reportID: item.reportID,
                action: item.action ?? CONST.SEARCH.ACTION_TYPES.VIEW,
                total: getReimbursableTotal({
                    total: item.total ?? CONST.DEFAULT_NUMBER_ID,
                    nonReimbursableTotal: item.nonReimbursableTotal,
                    reimbursableTotal: item.reimbursableTotal,
                }),
                policyID: item.policyID,
                canPay: item.canPay,
                canApprove: item.canApprove,
                canSubmit: item.canSubmit,
                canChangeApprover: item.canChangeApprover,
                currency: item.currency,
                chatReportID: item.chatReportID,
                managerID: item.managerID,
                ownerAccountID: item.ownerAccountID,
                parentReportActionID: item.parentReportActionID,
                parentReportID: item.parentReportID,
                type: item.type,
            });
        }
        return result;
    }
    if (data.length && data.every(isTransactionListItemType)) {
        const result: SelectedReports[] = [];
        for (const item of data) {
            if (!item.keyForList || !transactionIDs[item.keyForList]?.isSelected) {
                continue;
            }
            const total = hasValidModifiedAmount(item) ? Number(item.modifiedAmount) : (item.amount ?? CONST.DEFAULT_NUMBER_ID);
            result.push({
                reportID: item.reportID,
                action: item.action ?? CONST.SEARCH.ACTION_TYPES.VIEW,
                total,
                policyID: item.policyID,
                canPay: item.canPay,
                canApprove: item.canApprove,
                canSubmit: item.canSubmit,
                canChangeApprover: item.canChangeApprover,
                currency: item.currency,
                chatReportID: item.report?.chatReportID,
                managerID: item.report?.managerID,
                ownerAccountID: item.report?.ownerAccountID,
                parentReportActionID: item.report?.parentReportActionID,
                parentReportID: item.report?.parentReportID,
                type: item.report?.type,
            });
        }
        return result;
    }
    return [];
}

type GroupSelectionParams = {
    /** The group's own key, which is where a group selected before its children loaded is stored */
    groupKey: string | undefined;

    /** The group's loaded rows */
    children: TransactionListItemType[];

    /** The rows with a selection entry of their own */
    selectedTransactions: SelectedTransactions;

    /** Rows taken back out of a wider selection */
    excludedTransactions: SelectedTransactions;

    /** Whether every matching item is selected, which checks rows that have no entry of their own */
    areAllMatchingItemsSelected: boolean;
};

/** What a group's checkbox shows: fully checked, and whether only some of its rows are. Rows being deleted count for neither. */
function getGroupCheckboxState({groupKey, children, selectedTransactions, excludedTransactions, areAllMatchingItemsSelected}: GroupSelectionParams): {
    isSelectAllChecked: boolean;
    isIndeterminate: boolean;
} {
    let selectableCount = 0;
    let checkedCount = 0;
    for (const child of children) {
        if (isTransactionPendingDelete(child)) {
            continue;
        }
        selectableCount++;
        if (isRowChecked({rowKey: child.keyForList, parentGroupKey: groupKey, selectedTransactions, excludedTransactions, areAllMatchingItemsSelected})) {
            checkedCount++;
        }
    }
    // A group carrying no rows answers from its own key. One whose rows are all being deleted has rows, so it does not.
    if (children.length === 0) {
        return {
            isSelectAllChecked: !!groupKey && isRowChecked({rowKey: groupKey, parentGroupKey: undefined, selectedTransactions, excludedTransactions, areAllMatchingItemsSelected}),
            isIndeterminate: false,
        };
    }
    return {isSelectAllChecked: selectableCount > 0 && checkedCount === selectableCount, isIndeterminate: checkedCount > 0 && checkedCount !== selectableCount};
}

type RowCheckedParams = {
    /** The row's own selection key */
    rowKey: string;

    /** The group the row is rendered under, whose exclusion covers the row as well */
    parentGroupKey: string | undefined;

    /** The rows with a selection entry of their own */
    selectedTransactions: SelectedTransactions;

    /** Rows taken back out of a wider selection */
    excludedTransactions: SelectedTransactions;

    /** Whether every matching item is selected, which checks rows that have no entry of their own */
    areAllMatchingItemsSelected: boolean;
};

/** Whether a row's checkbox reads as checked, which is what a click has to toggle. */
function isRowChecked({rowKey, parentGroupKey, selectedTransactions, excludedTransactions, areAllMatchingItemsSelected}: RowCheckedParams): boolean {
    // An entry of its own wins, since a row picked individually is not covered by anything wider.
    if (selectedTransactions[rowKey]?.isSelected) {
        return true;
    }
    if (Object.hasOwn(excludedTransactions, rowKey) || (!!parentGroupKey && Object.hasOwn(excludedTransactions, parentGroupKey))) {
        return false;
    }
    // Otherwise it is checked by whatever covers it: every matching item, or its group being selected as a whole.
    return areAllMatchingItemsSelected || !!(parentGroupKey && selectedTransactions[parentGroupKey]?.isSelected);
}

export {mapTransactionItemToSelectedEntry, mapEmptyReportToSelectedEntry, prepareTransactionsList, deriveSelectedReports, getGroupCheckboxState, isRowChecked};
