import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import {search} from '@libs/actions/Search';
import {getLoginByAccountID} from '@libs/PersonalDetailsUtils';
import {getVisibleTransactionViolations} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction, TransactionViolation, TransactionViolations} from '@src/types/onyx';

import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useMemo, useState} from 'react';

import type {GroupChildrenContentProps, TransactionListItemType} from './types';

import TransactionGroupListExpandedItem from './TransactionGroupListExpanded';
import useGroupChildren from './useGroupChildren';

function GroupChildrenContent({
    item,
    isExpanded,
    groupBy,
    searchType,
    columns,
    canSelectMultiple,
    onSelectRow,
    onCheckboxPress,
    onLongPressRow,
    nonPersonalAndWorkspaceCards,
    onUndelete,
    newTransactionID,
}: GroupChildrenContentProps) {
    const currentUserDetails = useCurrentUserPersonalDetails();
    const isScreenFocused = useIsFocused();
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
    });

    const isEmpty = transactions.length === 0;
    const shouldDisplayEmptyView = isEmpty && isExpenseReportType;

    const refreshTransactions = () => {
        if (!groupItem.transactionsQueryJSON) {
            return;
        }
        search({
            queryJSON: groupItem.transactionsQueryJSON,
            searchKey: undefined,
            offset: 0,
            shouldCalculateTotals: false,
            isLoading: !!transactionsSnapshot?.search?.isLoading,
        });
    };

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

    useEffect(() => {
        if (!newTransactionID || !isExpanded) {
            return;
        }
        refreshTransactions();
        // Only refresh when a new transaction is created in this group — refreshTransactions is excluded to avoid infinite loops
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newTransactionID, isExpanded]);

    useEffect(() => {
        if (!isExpanded || isExpenseReportType) {
            return;
        }
        refreshTransactions();
        // Only fetch on expand — refreshTransactions and isExpenseReportType are excluded to prevent re-fetching on every render
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isExpanded]);

    const wasScreenFocusedRef = React.useRef(isScreenFocused);
    useEffect(() => {
        const didReturnToScreen = wasScreenFocusedRef.current === false && isScreenFocused === true;
        wasScreenFocusedRef.current = isScreenFocused;
        if (!didReturnToScreen || !isExpanded || isExpenseReportType) {
            return;
        }
        refreshTransactions();
        // Only refresh when returning to this screen while expanded — other deps excluded to avoid redundant fetches
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isScreenFocused]);

    const filteredViolations: Record<string, TransactionViolation[]> = useMemo(() => {
        if (!snapshotData) {
            return {};
        }

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
        return result;
    }, [snapshotData, currentUserDetails.email, currentUserDetails.accountID]);

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
        />
    );
}

export default GroupChildrenContent;
