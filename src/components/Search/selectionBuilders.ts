import type {OnyxEntry} from 'react-native-onyx';
import {isSplitAction} from '@libs/ReportSecondaryActionUtils';
import {canEditFieldOfMoneyRequest, canHoldUnholdReportAction, canRejectReportAction, isMoneyRequestReport, isOneTransactionReport} from '@libs/ReportUtils';
import {isTransactionListItemType, isTransactionReportGroupListItemType} from '@libs/SearchUIUtils';
import type {ArchivedReportsIDSet} from '@libs/SearchUIUtils';
import {getOriginalTransactionWithSplitInfo, hasValidModifiedAmount, isExpenseUnreported, isOnHold} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type {OutstandingReportsByPolicyIDDerivedValue, Report, Transaction} from '@src/types/onyx';
import type {TransactionGroupListItemType, TransactionListItemType, TransactionReportGroupListItemType} from './SearchList/ListItem/types';
import type {SearchData, SelectedReports, SelectedTransactionInfo, SelectedTransactions} from './types';

type MapTransactionItemToSelectedEntryParams = {
    item: TransactionListItemType;
    itemTransaction: OnyxEntry<Transaction>;
    originalItemTransaction: OnyxEntry<Transaction>;
    currentUserLogin: string;
    currentUserAccountID: number;
    archivedReportsIDSet: ArchivedReportsIDSet;
    outstandingReportsByPolicyID: OutstandingReportsByPolicyIDDerivedValue | undefined;
    selfDMReport: OnyxEntry<Report>;
    isProduction: boolean;
    allowNegativeAmount: boolean;
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
    archivedReportsIDSet,
    outstandingReportsByPolicyID,
    selfDMReport,
    isProduction,
    allowNegativeAmount,
    parentReport,
}: MapTransactionItemToSelectedEntryParams): [string, SelectedTransactionInfo] {
    const {canHoldRequest, canUnholdRequest} = canHoldUnholdReportAction(item.report, item.reportAction, item.holdReportAction, item, item.policy, currentUserAccountID);
    const canRejectRequest = item.report ? canRejectReportAction(currentUserLogin, item.report) : false;
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
            canSplit: isSplitAction(reportForSplit, [itemTransaction], originalItemTransaction, currentUserLogin, currentUserAccountID, item.policy, parentReport, isProduction),
            hasBeenSplit: getOriginalTransactionWithSplitInfo(itemTransaction, originalItemTransaction).isExpenseSplit,
            canChangeReport: canEditFieldOfMoneyRequest({
                reportAction: item.reportAction,
                fieldToEdit: CONST.EDIT_REQUEST_FIELD.REPORT,
                outstandingReportsByPolicyID,
                transaction: item,
                report: item.report,
                policy: item.policy,
                archivedReportsIDSet,
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
    item: TransactionListItemType;
    itemTransaction: OnyxEntry<Transaction>;
    originalItemTransaction: OnyxEntry<Transaction>;
    selectedTransactions: SelectedTransactions;
    currentUserLogin: string;
    currentUserAccountID: number;
    archivedReportsIDSet: ArchivedReportsIDSet;
    outstandingReportsByPolicyID: OutstandingReportsByPolicyIDDerivedValue | undefined;
    selfDMReport: OnyxEntry<Report>;
    isProduction: boolean;
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
    archivedReportsIDSet,
    outstandingReportsByPolicyID,
    selfDMReport,
    isProduction,
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
        archivedReportsIDSet,
        outstandingReportsByPolicyID,
        selfDMReport,
        isProduction,
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
                total: item.total ?? CONST.DEFAULT_NUMBER_ID,
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

export {mapTransactionItemToSelectedEntry, mapEmptyReportToSelectedEntry, prepareTransactionsList, deriveSelectedReports};
