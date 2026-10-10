import {isSplitAction} from '@libs/ReportSecondaryActionUtils';
import {canEditFieldOfMoneyRequest, canHoldUnholdReportAction, canRejectReportAction, getReimbursableTotal, isMoneyRequestReport, isOneTransactionReport} from '@libs/ReportUtils';
import {isGroupedItemArray, isGroupEntry, isTransactionGroupListItemType, isTransactionListItemType, isTransactionReportGroupListItemType} from '@libs/SearchUIUtils';
import type {SearchGroupKey} from '@libs/SearchUIUtils';
import type {ShiftRangeBatch} from '@libs/shiftRangeSelection';
import {getOriginalTransactionWithSplitInfo, hasValidModifiedAmount, isExpenseUnreported, isOnHold, isTransactionPendingDelete} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import type {OutstandingReportsByPolicyIDDerivedValue, Report, ReportNameValuePairs, Rule, Transaction} from '@src/types/onyx';
import type {SearchGroupBase, SearchResultDataType} from '@src/types/onyx/SearchResults';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {deepEqual} from 'fast-equals';

import type {OpenGroupKeys} from './hooks/useOpenGroupsRegistry';
import type {SearchListItem, TransactionGroupListItemType, TransactionListItemType, TransactionReportGroupListItemType} from './SearchList/ListItem/types';
import type {SearchData, SelectedReports, SelectedTransactionInfo, SelectedTransactions} from './types';

/**
 * Group-by snapshot rows carry the total number of transactions in the group. That total can be larger than the
 * rows currently loaded when the query has a `limit:` smaller than the group.
 */
function getSearchGroupCount(group: SearchGroupBase | TransactionGroupListItemType | undefined): number | undefined {
    if (!group || !('count' in group) || typeof group.count !== 'number') {
        return undefined;
    }
    return group.count;
}

function getSearchGroupCountByKey(searchData: SearchResultDataType | undefined, groupKey: string | undefined): number | undefined {
    if (!searchData || !groupKey || !isGroupEntry(groupKey)) {
        return undefined;
    }
    return getSearchGroupCount(searchData[groupKey]);
}

/**
 * Snapshot `count` is not decremented when a child is pending-delete, so drop those loaded children before
 * comparing. A `limit:` that left children unloaded still leaves `count` larger than the remaining selectable
 * rows, so that case stays a partial selection.
 */
function getRemainingSearchGroupCount(groupCount: number | undefined, loadedChildrenCount: number, loadedSelectableCount: number): number | undefined {
    if (groupCount === undefined) {
        return undefined;
    }
    const pendingDeleteLoadedCount = Math.max(loadedChildrenCount - loadedSelectableCount, 0);
    return Math.max(groupCount - pendingDeleteLoadedCount, 0);
}

function areLoadedRowsSelected(selectedTransactions: SelectedTransactions, loadedRows: TransactionListItemType[]): boolean {
    return loadedRows.every((row) => isTransactionPendingDelete(row) || !!selectedTransactions[row.keyForList ?? row.transactionID]);
}

/** The count recorded on a group's rows when its selection last covered it, or undefined when it does not. */
function getCoveredGroupCount(selectedTransactions: SelectedTransactions, rowKeys: string[]): number | undefined {
    for (const key of rowKeys) {
        const entry = selectedTransactions[key];
        if (entry?.isEntireGroupSelected && entry.coveredGroupCount !== undefined) {
            return entry.coveredGroupCount;
        }
    }
    return undefined;
}

type StampGroupCoverageFlagsParams = {
    selectedTransactions: SelectedTransactions;
    groupKey: string | undefined;
    groupCount: number | undefined;

    /** The group's rows as loaded, including any being deleted */
    loadedRows: TransactionListItemType[];

    /** The count the group was covered at before this change, which lets a partly loaded group keep its coverage while rows only leave it */
    priorCoveredGroupCount?: number;
};

/**
 * The count a group is wholly selected at, or undefined. Kept rows can be stale, so only a fully loaded group with every row checked earns it, and a partly loaded one
 * keeps it only while every loaded row stays checked and its count has not risen. With no rows loaded, the selected rows are counted instead.
 */
function getWholeGroupCoverage({selectedTransactions, groupKey, groupCount, loadedRows, priorCoveredGroupCount}: StampGroupCoverageFlagsParams): number | undefined {
    if (loadedRows.length === 0) {
        const selectedRowCount = Object.entries(selectedTransactions).filter(([key, transaction]) => key !== groupKey && transaction.groupKey === groupKey).length;
        return selectedRowCount > 0 && selectedRowCount === groupCount ? groupCount : undefined;
    }
    const loadedSelectableCount = loadedRows.filter((row) => !isTransactionPendingDelete(row)).length;
    if (loadedSelectableCount === 0 || !areLoadedRowsSelected(selectedTransactions, loadedRows)) {
        return undefined;
    }
    const remainingGroupCount = getRemainingSearchGroupCount(groupCount, loadedRows.length, loadedSelectableCount);
    if (remainingGroupCount === undefined || loadedSelectableCount >= remainingGroupCount) {
        return loadedSelectableCount;
    }
    return priorCoveredGroupCount !== undefined && remainingGroupCount <= priorCoveredGroupCount ? remainingGroupCount : undefined;
}

/**
 * Sets `isEntireGroupSelected`, with the count it holds at, on every row of the group.
 * A `limit:` that leaves children unloaded must not look like a whole-group selection, because delete only
 * removes the loaded rows. `isSelectedViaGroup` is left alone so export can still treat a group-row click as a
 * group export.
 */
function stampGroupCoverageFlags({selectedTransactions, groupKey, groupCount, loadedRows, priorCoveredGroupCount}: StampGroupCoverageFlagsParams): SelectedTransactions {
    if (!groupKey) {
        return selectedTransactions;
    }

    const coveredGroupCount = getWholeGroupCoverage({selectedTransactions, groupKey, groupCount, loadedRows, priorCoveredGroupCount});
    const isEntireGroupSelected = coveredGroupCount !== undefined;
    const nextSelectedTransactions = {...selectedTransactions};
    for (const [key, transaction] of Object.entries(nextSelectedTransactions)) {
        if (key !== groupKey && transaction.groupKey !== groupKey) {
            continue;
        }
        nextSelectedTransactions[key] = {...transaction, groupKey, isEntireGroupSelected, ...(isEntireGroupSelected ? {coveredGroupCount} : {})};
    }

    return nextSelectedTransactions;
}

type MapTransactionItemToSelectedEntryParams = {
    /** The transaction row being added to the selection */
    item: TransactionListItemType;

    /** Live Onyx transaction for the row, used for hold/split checks */
    itemTransaction: OnyxEntry<Transaction>;

    /** Original transaction when the row is a split, used to derive split info */
    originalItemTransaction: OnyxEntry<Transaction>;

    /** Email of the current user */
    currentUserLogin: string;

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

    /** Approval workflow rules, used for split eligibility */
    rules: OnyxCollection<Rule>;
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
    rules,
}: MapTransactionItemToSelectedEntryParams): [string, SelectedTransactionInfo] {
    const {canHoldRequest, canUnholdRequest} = canHoldUnholdReportAction(item.report, item.reportAction, item.holdReportAction, item, item.policy, currentUserAccountID, rules);
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
            // TODO: Pass reportOwnerLogin in PR 4d. This runs once per search result, so it needs a precomputed map of accountID to login rather than a hook.
            // isAwaitingFirstLevelApproval falls back to the personal details store until then. See https://github.com/Expensify/App/issues/66413.
            canSplit: isSplitAction(reportForSplit, [itemTransaction], originalItemTransaction, currentUserLogin, currentUserAccountID, rules, undefined, item.policy, parentReport),
            hasBeenSplit: getOriginalTransactionWithSplitInfo(itemTransaction, originalItemTransaction).isExpenseSplit,
            canChangeReport: canEditFieldOfMoneyRequest({
                reportAction: item.reportAction,
                fieldToEdit: CONST.EDIT_REQUEST_FIELD.REPORT,
                outstandingReportsByPolicyID,
                transaction: item,
                report: item.report,
                policy: item.policy,
                reportNameValuePairs,
                rules,
            }),
            action: item.action,
            groupCurrency: item.groupCurrency,
            groupExchangeRate: item.groupExchangeRate,
            currencyConversionRate: item.currencyConversionRate,
            reportID: item.reportID,
            policyID: item.policyID,
            amount: allowNegativeAmount ? amount : Math.abs(amount),
            displayAmount: item.formattedTotal,
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
        return [
            item.keyForList ?? '',
            buildGroupSelectedEntry({
                amount: item.totalDisplaySpend ?? item.total ?? 0,
                displayAmount: item.totalDisplaySpend ?? 0,
                currency: item.currency ?? '',
                action: item.action ?? CONST.SEARCH.ACTION_TYPES.VIEW,
                reportID: item.reportID,
                policyID: item.policyID,
            }),
        ];
    }

    const total = item.total ?? 0;
    return [
        item.keyForList ?? '',
        buildGroupSelectedEntry({
            amount: total,
            displayAmount: total,
            currency: item.currency ?? '',
            action: CONST.SEARCH.ACTION_TYPES.VIEW,
            reportID: item.reportID,
            policyID: item.policyID,
        }),
    ];
}

type BuildGroupSelectedEntryParams = {
    /** The group's total, which the selection's total adds up */
    amount: number;

    /** The group's total as the footer shows it */
    displayAmount: number;

    currency: string;

    action: ValueOf<typeof CONST.SEARCH.ACTION_TYPES>;

    /** Set only for a report row, since a group of expenses is not a report */
    reportID: string | undefined;

    /** Set only for a report row, and a placeholder policy stands in otherwise */
    policyID: string | undefined;
};

/** The entry of a group selected under its own key, which stands for every row in it. */
function buildGroupSelectedEntry({amount, displayAmount, currency, action, reportID, policyID}: BuildGroupSelectedEntryParams): SelectedTransactionInfo {
    return {
        isFromOneTransactionReport: false,
        isSelected: true,
        canHold: false,
        canSplit: false,
        canReject: false,
        hasBeenSplit: false,
        isHeld: false,
        canUnhold: false,
        canChangeReport: false,
        action,
        reportID,
        policyID: policyID ?? CONST.POLICY.ID_FAKE,
        amount,
        displayAmount,
        currency,
        ...(currency ? {groupCurrency: currency} : {}),
    };
}

/** The group a row checked through its group header stands for, or undefined for a row checked on its own. */
function getClaimedGroupKey(transaction: SelectedTransactionInfo): SearchGroupKey | undefined {
    return transaction.isSelectedViaGroup && transaction.groupKey && isGroupEntry(transaction.groupKey) ? transaction.groupKey : undefined;
}

/**
 * Rows checked again inside a group excluded whole from Select all. The group's exclusion still takes them off with the rest of the group,
 * so a count or a total adds them back.
 */
function getRowsCheckedInExcludedGroups(selectedTransactions: SelectedTransactions, excludedTransactions: SelectedTransactions): SelectedTransactions {
    const rows: SelectedTransactions = {};
    for (const [key, transaction] of Object.entries(selectedTransactions)) {
        if (!isGroupEntry(key) && transaction.isSelected && !!transaction.groupKey && isGroupEntry(transaction.groupKey) && Object.hasOwn(excludedTransactions, transaction.groupKey)) {
            rows[key] = transaction;
        }
    }
    return rows;
}

/** For each group checked through its header, how many selected rows stand for it and whether any of them records the group as wholly selected. */
function getGroupClaims(selectedTransactions: SelectedTransactions): Map<SearchGroupKey, {rowCount: number; isEntireGroupSelected: boolean}> {
    const claimByGroupKey = new Map<SearchGroupKey, {rowCount: number; isEntireGroupSelected: boolean}>();
    for (const transaction of Object.values(selectedTransactions)) {
        const groupKey = getClaimedGroupKey(transaction);
        if (!groupKey) {
            continue;
        }
        const claim = claimByGroupKey.get(groupKey) ?? {rowCount: 0, isEntireGroupSelected: false};
        claim.rowCount += 1;
        claim.isEntireGroupSelected = claim.isEntireGroupSelected || !!transaction.isEntireGroupSelected;
        claimByGroupKey.set(groupKey, claim);
    }
    return claimByGroupKey;
}

/** The keys of the selected rows in each group, whether the group's rows are loaded or not. */
function getSelectedRowKeysByGroupKey(selectedTransactions: SelectedTransactions): Map<string, string[]> {
    const rowKeysByGroupKey = new Map<string, string[]>();
    for (const [key, transaction] of Object.entries(selectedTransactions)) {
        if (!transaction.groupKey || isGroupEntry(key)) {
            continue;
        }
        const rowKeys = rowKeysByGroupKey.get(transaction.groupKey);
        if (rowKeys) {
            rowKeys.push(key);
        } else {
            rowKeysByGroupKey.set(transaction.groupKey, [key]);
        }
    }
    return rowKeysByGroupKey;
}

/**
 * A header check stands for every row of the group, as an export reads it, so until the stamp finds the group wholly selected, one entry for the whole group replaces its rows.
 * So does a wholly selected group whose rows outnumber its count, since some left it unseen, or that holds rows kept off the page, whose amounts may be out of date.
 * Under Select all every action sends the query, so nothing is merged.
 */
function mergeRowsIntoPartlyLoadedGroups(
    selectedTransactions: SelectedTransactions,
    searchData: SearchResultDataType | undefined,
    areAllMatchingItemsSelected: boolean,
): SelectedTransactions {
    if (areAllMatchingItemsSelected) {
        return selectedTransactions;
    }
    const partlyLoadedGroups = new Map<SearchGroupKey, SearchGroupBase>();
    for (const [groupKey, rowKeys] of getSelectedRowKeysByGroupKey(selectedTransactions)) {
        if (!isGroupEntry(groupKey)) {
            continue;
        }
        const group = searchData?.[groupKey];
        const groupCount = getSearchGroupCount(group);
        if (!group || groupCount === undefined) {
            continue;
        }
        const claimedRowCount = rowKeys.filter((key) => getClaimedGroupKey(selectedTransactions[key]) === groupKey).length;
        const isWhollySelected = rowKeys.some((key) => !!selectedTransactions[key].isEntireGroupSelected);
        const isStamped = rowKeys.some((key) => selectedTransactions[key].isEntireGroupSelected !== undefined);
        const isClaimStillLoading = claimedRowCount > 0 && !isWhollySelected && (isStamped || claimedRowCount < groupCount);
        const hasRowsThatLeft = (claimedRowCount > 0 || isWhollySelected) && rowKeys.length > groupCount;
        const hasRowsKeptOffPage = isWhollySelected && rowKeys.some((key) => !!selectedTransactions[key].isKeptOffPage);
        if (isClaimStillLoading || hasRowsThatLeft || hasRowsKeptOffPage) {
            partlyLoadedGroups.set(groupKey, group);
        }
    }
    if (partlyLoadedGroups.size === 0) {
        return selectedTransactions;
    }

    // The group's entry stands for every row in it, so a row of the group checked one by one would otherwise be counted a second time.
    const merged: SelectedTransactions = {};
    for (const [key, transaction] of Object.entries(selectedTransactions)) {
        const groupKey = transaction.groupKey;
        if (!groupKey || !isGroupEntry(groupKey) || !partlyLoadedGroups.has(groupKey)) {
            merged[key] = transaction;
        }
    }
    for (const [groupKey, group] of partlyLoadedGroups) {
        merged[groupKey] = buildGroupSelectedEntry({
            amount: group.total,
            displayAmount: group.total,
            currency: group.currency,
            action: CONST.SEARCH.ACTION_TYPES.VIEW,
            reportID: undefined,
            policyID: undefined,
        });
    }
    return merged;
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

    currentUserAccountID: number;

    /** Report name-value pairs collection, used for the change-report eligibility archived check */
    reportNameValuePairs: OnyxCollection<ReportNameValuePairs>;

    /** Derived outstanding reports per policy, used for the change-report eligibility check */
    outstandingReportsByPolicyID: OutstandingReportsByPolicyIDDerivedValue | undefined;

    /** The current user's self-DM report, used as the parent for unreported (track) expenses */
    selfDMReport: OnyxEntry<Report>;

    /** The row's parent report, used for split eligibility */
    parentReport: OnyxEntry<Report> | undefined;

    /** Approval workflow rules, used for split eligibility */
    rules: OnyxCollection<Rule>;
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
    rules,
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
        rules,
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

    /** How many rows the group holds, loaded or not, or undefined where the group carries no count */
    groupCount: number | undefined;
};

/** Whether clicking a group's checkbox means "deselect": true once any row under it reads as checked. */
function isGroupSelected(params: GroupSelectionParams): boolean {
    const {isSelectAllChecked, isIndeterminate} = getGroupCheckboxState(params);
    return isSelectAllChecked || isIndeterminate;
}

/** What a group's checkbox shows: fully checked, and whether only some of its rows are. Rows being deleted count for neither. */
function getGroupCheckboxState({groupKey, children, selectedTransactions, excludedTransactions, areAllMatchingItemsSelected, groupCount}: GroupSelectionParams): {
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
    // The group's own key answers for the rows it has not loaded, which is every row while none are.
    const areUnloadedRowsChecked = !!groupKey && isRowChecked({rowKey: groupKey, parentGroupKey: undefined, selectedTransactions, excludedTransactions, areAllMatchingItemsSelected});
    // A group carrying no rows answers from its own key. One whose rows are all being deleted has rows, so it does not.
    if (children.length === 0) {
        return {isSelectAllChecked: areUnloadedRowsChecked, isIndeterminate: false};
    }
    const hasUnloadedRows = groupCount !== undefined && groupCount > children.length;
    const hasCheckedUnloadedRows = hasUnloadedRows && areUnloadedRowsChecked;
    // The rows not loaded are covered by the group's own key, Select all, a header check, or rows checked one by one that the stamp found to be every row of the group.
    const isGroupCoveredByLoadedRows = () =>
        !!groupKey &&
        children.some((child) => {
            const entry = selectedTransactions[child.keyForList];
            return !!entry && (getClaimedGroupKey(entry) === groupKey || (entry.groupKey === groupKey && !!entry.isEntireGroupSelected));
        });
    // A refresh can leave rows checked or unchecked one by one off the loaded page, and the header still has to show them.
    let loadedRowKeys: Set<string> | undefined;
    const isRowLeftOut = (key: string, entry: SelectedTransactionInfo) => {
        if (!groupKey || key === groupKey || entry.groupKey !== groupKey) {
            return false;
        }
        loadedRowKeys ??= new Set(children.map((child) => child.keyForList));
        return !loadedRowKeys.has(key);
    };
    const hasExcludedRowLeftOut = () => Object.entries(excludedTransactions).some(([key, entry]) => isRowLeftOut(key, entry));
    const hasCheckedRowLeftOut = () => Object.entries(selectedTransactions).some(([key, entry]) => !!entry.isSelected && isRowLeftOut(key, entry));
    const areUnloadedRowsCovered = () => !hasUnloadedRows || ((areUnloadedRowsChecked || isGroupCoveredByLoadedRows()) && !hasExcludedRowLeftOut());
    const isSelectAllChecked = selectableCount > 0 && checkedCount === selectableCount && areUnloadedRowsCovered();
    return {isSelectAllChecked, isIndeterminate: !isSelectAllChecked && (checkedCount > 0 || hasCheckedUnloadedRows || (hasUnloadedRows && hasCheckedRowLeftOut()))};
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

/** Openness is the gate, not the rows: a closed group still carries the ones it loaded. */
function resolveGroupChildren(group: TransactionGroupListItemType, openGroupKeys: OpenGroupKeys): TransactionListItemType[] {
    return openGroupKeys.has(group.keyForList) ? group.transactions : [];
}

type ShiftRangeSource = {
    /** Each group header followed by the rows it carries, in visual order */
    items: SearchListItem[];

    childrenByGroupKey: Map<string, TransactionListItemType[]>;

    /** So a child's selection is stored and removed under the right parent */
    groupKeyByChildKey: Map<string, string>;
};

/** One pass, so what a range spans and who owns each row cannot disagree. Flattens only in group-by views. */
function buildShiftRangeSource(sortedData: SearchListItem[], openGroupKeys: OpenGroupKeys, groupsAreHeaders: boolean): ShiftRangeSource {
    const childrenByGroupKey = new Map<string, TransactionListItemType[]>();
    const groupKeyByChildKey = new Map<string, string>();
    if (!groupsAreHeaders || !isGroupedItemArray(sortedData)) {
        return {items: sortedData, childrenByGroupKey, groupKeyByChildKey};
    }

    const items: SearchListItem[] = [];
    for (const group of sortedData) {
        items.push(group);
        if (!group.keyForList) {
            continue;
        }
        const children = resolveGroupChildren(group, openGroupKeys);
        childrenByGroupKey.set(group.keyForList, children);
        for (const child of children) {
            items.push(child);
            if (child.keyForList) {
                groupKeyByChildKey.set(child.keyForList, group.keyForList);
            }
        }
    }
    return {items, childrenByGroupKey, groupKeyByChildKey};
}

type GroupLookups = {
    /** The group a child row belongs to, so its selection is stored and removed under the right parent */
    groupKeyByChildKey: ReadonlyMap<string, string>;

    /** Each group's rows as the range sees them */
    childrenByGroupKey: ReadonlyMap<string, TransactionListItemType[]>;

    /** Supplied by the provider, which is what reads Onyx for a row's action flags */
    buildSelectedEntry: (item: TransactionListItemType) => [string, SelectedTransactionInfo];

    /** The group's total on the server, which can be more than the rows it has loaded */
    getGroupCount: (groupKey: string) => number | undefined;
};

/** Undefined under select-all-matching, where the group is selected without its rows being known. */
function resolveGroupBlock(selection: SelectedTransactions, childKey: string, areAllMatchingItemsSelected: boolean, lookups: GroupLookups) {
    const groupKey = lookups.groupKeyByChildKey.get(childKey);
    if (!groupKey || areAllMatchingItemsSelected || !selection[groupKey]?.isSelected) {
        return undefined;
    }
    return {groupKey, loaded: lookups.childrenByGroupKey.get(groupKey) ?? []};
}

/** A group selected before its children loaded lives under its own key, so dropping one child means writing it out first. */
function spellOutGroupSelection(selection: SelectedTransactions, childKey: string, areAllMatchingItemsSelected: boolean, lookups: GroupLookups): SelectedTransactions {
    const block = resolveGroupBlock(selection, childKey, areAllMatchingItemsSelected, lookups);
    // Counted the same way the loop writes, so writing out can never delete the entry and put nothing back.
    const selectable = block?.loaded.filter((child) => !isTransactionPendingDelete(child)) ?? [];
    if (!block || selectable.length === 0) {
        return selection;
    }
    const {groupKey} = block;
    const spelledOut: SelectedTransactions = {...selection};
    delete spelledOut[groupKey];
    for (const child of selectable) {
        const [key, info] = lookups.buildSelectedEntry(child);
        // No `isSelectedViaGroup`: the caller is about to drop one of these, so the group stops being a whole-group selection.
        spelledOut[key] = {...info, groupKey};
    }
    return spelledOut;
}

/** What a shift+click range writes: the rows it covers selected, the rows it gave back dropped, and the same map back when neither happened. */
function applyShiftRangeBatchToSelection(
    batch: ShiftRangeBatch<SearchListItem>,
    selection: SelectedTransactions,
    areAllMatchingItemsSelected: boolean,
    lookups: GroupLookups,
): SelectedTransactions {
    let updated: SelectedTransactions = {...selection};
    // Returning the given map unchanged is what lets the commit bail on identity rather than re-render every row.
    let hasWritten = false;
    // Whole wins over partial, since that is the gesture a header click makes.
    const partialGroupKeys = new Set<string>();
    const wholeGroupKeys = new Set<string>();
    // Every group written under, with the rows it has loaded, so its coverage can be recounted once the batch is in.
    const touchedGroups = new Map<string, TransactionListItemType[]>();
    const touchGroup = (groupKey: string, loadedRows: TransactionListItemType[]) => {
        if (touchedGroups.has(groupKey)) {
            return;
        }
        touchedGroups.set(groupKey, loadedRows);
    };

    const dropKey = (key: string) => {
        if (!Object.hasOwn(updated, key)) {
            return;
        }
        delete updated[key];
        hasWritten = true;
    };

    // `blockGroupKey` is set only when a whole group row joins the range, which is what makes its children narrowable later.
    const addTransaction = (transaction: TransactionListItemType, blockGroupKey: string | undefined) => {
        if (!transaction.keyForList || isTransactionPendingDelete(transaction)) {
            return;
        }
        updated = spellOutGroupSelection(updated, transaction.keyForList, areAllMatchingItemsSelected, lookups);
        const [key, info] = lookups.buildSelectedEntry(transaction);
        const parentGroupKey = blockGroupKey ?? lookups.groupKeyByChildKey.get(transaction.keyForList);
        // A row the range only re-covers keeps its group claim. Only a row the range gives back makes the group partial.
        const isAlreadySelectedViaGroup = !!parentGroupKey && updated[key]?.groupKey === parentGroupKey && !!updated[key]?.isSelectedViaGroup;
        if (parentGroupKey) {
            if (blockGroupKey) {
                wholeGroupKeys.add(parentGroupKey);
            } else if (!isAlreadySelectedViaGroup) {
                partialGroupKeys.add(parentGroupKey);
            }
            touchGroup(parentGroupKey, lookups.childrenByGroupKey.get(parentGroupKey) ?? []);
        }
        const entry = parentGroupKey ? {...info, groupKey: parentGroupKey, isSelectedViaGroup: !!blockGroupKey || isAlreadySelectedViaGroup} : info;
        // Re-covering a row is not a write, and coverage is recounted after the batch, so it is left out of the comparison.
        if (deepEqual({...updated[key], isEntireGroupSelected: undefined, coveredGroupCount: undefined}, {...entry, isEntireGroupSelected: undefined, coveredGroupCount: undefined})) {
            return;
        }
        updated[key] = entry;
        hasWritten = true;
    };

    let selectedRowKeysByGroupKey: Map<string, string[]> | undefined;
    const removeRow = (row: SearchListItem) => {
        if (isTransactionListItemType(row) || (isTransactionReportGroupListItemType(row) && row.transactions.length === 0)) {
            if (row.keyForList) {
                const parentGroupKey = lookups.groupKeyByChildKey.get(row.keyForList);
                if (parentGroupKey) {
                    partialGroupKeys.add(parentGroupKey);
                    touchGroup(parentGroupKey, lookups.childrenByGroupKey.get(parentGroupKey) ?? []);
                }
                updated = spellOutGroupSelection(updated, row.keyForList, areAllMatchingItemsSelected, lookups);
                dropKey(row.keyForList);
            }
            return;
        }
        if (isTransactionGroupListItemType(row)) {
            // A group can hold an entry under its own key as well as under its children's, including children a refresh left off the loaded page.
            if (row.keyForList) {
                dropKey(row.keyForList);
                selectedRowKeysByGroupKey ??= getSelectedRowKeysByGroupKey(selection);
                for (const key of selectedRowKeysByGroupKey.get(row.keyForList) ?? []) {
                    dropKey(key);
                }
            }
            for (const child of row.transactions ?? []) {
                if (child.keyForList) {
                    dropKey(child.keyForList);
                }
            }
        }
    };

    const addRow = (row: SearchListItem) => {
        if (isTransactionListItemType(row)) {
            addTransaction(row, undefined);
            return;
        }
        if (isTransactionReportGroupListItemType(row) && row.transactions.length === 0) {
            if (row.keyForList && row.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                const [key, info] = mapEmptyReportToSelectedEntry(row);
                if (!deepEqual(updated[key], info)) {
                    updated[key] = info;
                    hasWritten = true;
                }
            }
            return;
        }
        if (isTransactionGroupListItemType(row)) {
            const selectable = (row.transactions ?? []).filter((child) => !isTransactionPendingDelete(child));
            if (selectable.length === 0) {
                return;
            }
            // The children carry the selection from here, so the group's own key would count it twice.
            if (row.keyForList) {
                dropKey(row.keyForList);
                touchedGroups.set(row.keyForList, row.transactions ?? []);
            }
            for (const child of selectable) {
                addTransaction(child, row.keyForList);
            }
        }
    };

    for (const row of batch.toDeselect) {
        removeRow(row);
    }
    for (const row of batch.toSelect) {
        addRow(row);
    }

    // Rows left behind must stop claiming the group covers them, or an export sends a whole-group filter.
    for (const [key, transaction] of Object.entries(updated)) {
        if (transaction.isSelectedViaGroup && transaction.groupKey && partialGroupKeys.has(transaction.groupKey) && !wholeGroupKeys.has(transaction.groupKey)) {
            updated[key] = {...transaction, isSelectedViaGroup: false};
            hasWritten = true;
        }
    }

    // Delete takes a whole group on this flag, so each group the range wrote under is recounted, keeping the coverage it had while its rows only left it.
    selectedRowKeysByGroupKey ??= getSelectedRowKeysByGroupKey(selection);
    const coverageByGroupKey = new Map<string, number | undefined>();
    for (const [groupKey, loadedRows] of touchedGroups) {
        const priorCoveredGroupCount = getCoveredGroupCount(selection, selectedRowKeysByGroupKey.get(groupKey) ?? []);
        coverageByGroupKey.set(groupKey, getWholeGroupCoverage({selectedTransactions: updated, groupKey, groupCount: lookups.getGroupCount(groupKey), loadedRows, priorCoveredGroupCount}));
    }

    for (const [key, transaction] of Object.entries(updated)) {
        const groupKey = touchedGroups.has(key) ? key : transaction.groupKey;
        if (!groupKey || !coverageByGroupKey.has(groupKey)) {
            continue;
        }
        const coveredGroupCount = coverageByGroupKey.get(groupKey);
        const isEntireGroupSelected = coveredGroupCount !== undefined;
        const isUnchanged =
            transaction.groupKey === groupKey &&
            transaction.isEntireGroupSelected === isEntireGroupSelected &&
            (!isEntireGroupSelected || transaction.coveredGroupCount === coveredGroupCount);
        if (isUnchanged) {
            continue;
        }
        updated[key] = {...transaction, groupKey, isEntireGroupSelected, ...(isEntireGroupSelected ? {coveredGroupCount} : {})};
        hasWritten = true;
    }

    return hasWritten ? updated : selection;
}

export {
    getCoveredGroupCount,
    mapTransactionItemToSelectedEntry,
    mapEmptyReportToSelectedEntry,
    prepareTransactionsList,
    deriveSelectedReports,
    buildShiftRangeSource,
    applyShiftRangeBatchToSelection,
    spellOutGroupSelection,
    isGroupSelected,
    getGroupCheckboxState,
    isRowChecked,
    getSearchGroupCount,
    getSearchGroupCountByKey,
    getClaimedGroupKey,
    getGroupClaims,
    getSelectedRowKeysByGroupKey,
    getRemainingSearchGroupCount,
    getRowsCheckedInExcludedGroups,
    mergeRowsIntoPartlyLoadedGroups,
    stampGroupCoverageFlags,
};
