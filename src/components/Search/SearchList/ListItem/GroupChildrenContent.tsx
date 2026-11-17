import {resolveGroupCount} from '@components/Search/selectionBuilders';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import {search} from '@libs/actions/Search';
import {getLoginByAccountID} from '@libs/PersonalDetailsUtils';
import {getVisibleTransactionViolations} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction, TransactionViolation, TransactionViolations} from '@src/types/onyx';

import React, {useState} from 'react';

import type {GroupChildrenContentProps, TransactionListItemType} from './types';

import TransactionGroupListExpandedItem from './TransactionGroupListExpanded';
import useGroupChildren from './useGroupChildren';

function GroupChildrenContent({
    item,
    groupBy,
    searchType,
    columns,
    canSelectMultiple,
    onSelectRow,
    onCheckboxPress,
    onLongPressRow,
    nonPersonalAndWorkspaceCards,
    onUndelete,
}: GroupChildrenContentProps) {
    const currentUserDetails = useCurrentUserPersonalDetails();
    const {isOffline} = useNetwork();

    const groupItem = item;
    const isExpenseReportType = searchType === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;

    const [transactionsSnapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${groupItem.transactionsQueryJSON?.hash}`);
    const [transactionsVisibleLimit, setTransactionsVisibleLimit] = useState<number>(CONST.TRANSACTION.RESULTS_PAGE_SIZE);
    const snapshotData = transactionsSnapshot?.data;

    // Uses groupKeyForList: this split container's own keyForList is prefixed.
    const {transactions} = useGroupChildren({
        groupKey: groupItem.groupKeyForList,
        groupTransactions: groupItem.transactions,
        groupCount: resolveGroupCount(groupItem),
    });

    const isEmpty = transactions.length === 0;
    const shouldDisplayEmptyView = isEmpty && isExpenseReportType;

    const searchTransactions = (pageSize = 0) => {
        if (!groupItem.transactionsQueryJSON) {
            return;
        }
        search({
            queryJSON: groupItem.transactionsQueryJSON,
            searchKey: undefined,
            offset: (transactionsSnapshot?.search?.offset ?? 0) + pageSize,
            shouldCalculateTotals: false,
            isLoading: !!transactionsSnapshot?.search?.isLoading,
        });
    };

    let filteredViolations: Record<string, TransactionViolation[]>;
    if (!snapshotData) {
        filteredViolations = {};
    } else {
        const groupViolations: Record<string, TransactionViolations | undefined> = {};
        for (const [key, value] of Object.entries(snapshotData)) {
            if (key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS)) {
                groupViolations[key] = value as TransactionViolations;
            }
        }
        const result: Record<string, TransactionViolation[]> = {};
        for (const key of Object.keys(snapshotData)) {
            if (!key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION)) {
                continue;
            }
            const snapshotTransaction = snapshotData[key as keyof typeof snapshotData] as Transaction;
            if (!snapshotTransaction || typeof snapshotTransaction !== 'object' || !('transactionID' in snapshotTransaction) || !('reportID' in snapshotTransaction)) {
                continue;
            }
            const report = snapshotData[`${ONYXKEYS.COLLECTION.REPORT}${snapshotTransaction.reportID}`];
            const policy = snapshotData[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];
            if (report && policy) {
                const transactionViolations = groupViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${snapshotTransaction.transactionID}`];
                if (transactionViolations) {
                    const merged = getVisibleTransactionViolations(
                        snapshotTransaction,
                        transactionViolations,
                        currentUserDetails?.email ?? '',
                        currentUserDetails.accountID,
                        report,
                        getLoginByAccountID(report.ownerAccountID, snapshotData.personalDetailsList),
                        policy,
                    );
                    if (merged.length > 0) {
                        result[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${snapshotTransaction.transactionID}`] = merged;
                    }
                }
            }
        }
        filteredViolations = result;
    }

    const onExpandedRowLongPress = (transaction: TransactionListItemType) => {
        onLongPressRow?.(transaction);
    };

    return (
        <TransactionGroupListExpandedItem
            showTooltip
            canSelectMultiple={canSelectMultiple}
            onSelectionButtonPress={onCheckboxPress}
            onSelectRow={onSelectRow}
            columns={columns}
            groupBy={groupBy}
            accountID={currentUserDetails.accountID}
            isOffline={isOffline}
            violations={filteredViolations}
            transactions={transactions}
            transactionsVisibleLimit={transactionsVisibleLimit}
            setTransactionsVisibleLimit={setTransactionsVisibleLimit}
            isEmpty={isEmpty}
            shouldDisplayEmptyView={shouldDisplayEmptyView}
            isExpenseReportType={isExpenseReportType}
            transactionsSnapshot={transactionsSnapshot}
            transactionsQueryJSON={groupItem.transactionsQueryJSON}
            searchTransactions={searchTransactions}
            isInSingleTransactionReport={groupItem.transactions.length === 1}
            onLongPress={onExpandedRowLongPress}
            nonPersonalAndWorkspaceCards={nonPersonalAndWorkspaceCards}
            onUndelete={onUndelete}
            hideSearchTableHeader
            syncScrollKey={groupItem.groupKeyForList}
        />
    );
}

export default GroupChildrenContent;
