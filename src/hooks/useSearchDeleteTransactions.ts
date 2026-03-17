import {useCallback} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import {useSearchStateContext} from '@components/Search/SearchContext';
import {deleteMoneyRequestOnSearch, revertSplitTransactionOnSearch} from '@libs/actions/Search';
import type {RevertSplitTransactionParams} from '@libs/API/parameters';
import {getChildTransactions, getOriginalTransactionWithSplitInfo, hasValidModifiedAmount} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import useOnyx from './useOnyx';

type TransactionMap = Record<string, Transaction | undefined>;

function hasTransactions(transactions?: TransactionMap | null): transactions is TransactionMap {
    return !!transactions && Object.keys(transactions).length > 0;
}

function mergeTransactions(searchTransactions?: TransactionMap, fullTransactionCollection?: TransactionMap): TransactionMap | undefined {
    if (!hasTransactions(searchTransactions) && !hasTransactions(fullTransactionCollection)) {
        return undefined;
    }

    return {
        ...(searchTransactions ?? {}),
        ...(fullTransactionCollection ?? {}),
    };
}

function getSearchTransactions(searchResultsRecord?: Record<string, unknown>): TransactionMap | undefined {
    if (!searchResultsRecord) {
        return undefined;
    }

    const searchTransactions: TransactionMap = {};

    for (const [key, value] of Object.entries(searchResultsRecord)) {
        if (!key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION) || !value) {
            continue;
        }

        searchTransactions[key] = value as Transaction;
    }

    return Object.keys(searchTransactions).length > 0 ? searchTransactions : undefined;
}

function useSearchDeleteTransactions() {
    const {currentSearchResults} = useSearchStateContext();
    const searchResultsRecord = currentSearchResults?.data as Record<string, unknown> | undefined;
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);

    const deleteTransactionsOnSearch = useCallback(
        (hash: number, transactionIDs: string[], transactions?: OnyxCollection<Transaction>) => {
            if (!transactionIDs.length) {
                return;
            }

            const searchTransactions = getSearchTransactions(searchResultsRecord);
            const fullTransactionCollection = hasTransactions(transactions as TransactionMap | null | undefined) ? (transactions as TransactionMap) : undefined;
            const mergedTransactions = mergeTransactions(searchTransactions, fullTransactionCollection);

            if (!hasTransactions(mergedTransactions)) {
                deleteMoneyRequestOnSearch(hash, transactionIDs, transactions);
                return;
            }

            const splitsByOriginalID: Record<string, string[]> = {};
            const nonSplitIDs: string[] = [];

            for (const transactionID of transactionIDs) {
                const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`;
                const transaction = searchTransactions?.[transactionKey] ?? mergedTransactions[transactionKey];
                const originalTransactionID = transaction?.comment?.originalTransactionID;
                const originalTransaction = originalTransactionID ? mergedTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`] : undefined;
                const {isExpenseSplit} = getOriginalTransactionWithSplitInfo(transaction, originalTransaction);

                if (isExpenseSplit && originalTransactionID) {
                    (splitsByOriginalID[originalTransactionID] ??= []).push(transactionID);
                } else {
                    nonSplitIDs.push(transactionID);
                }
            }

            for (const [originalTransactionID, splitTransactionIDs] of Object.entries(splitsByOriginalID)) {
                const deletingIDs = new Set(splitTransactionIDs);
                const childTransactions = getChildTransactions(mergedTransactions as OnyxCollection<Transaction>, allReports, originalTransactionID, true).filter(
                    (transaction) => transaction?.transactionID === undefined || !deletingIDs.has(transaction.transactionID),
                );
                const reportedChildTransactions = childTransactions.filter((transaction) => transaction?.reportID !== CONST.REPORT.UNREPORTED_REPORT_ID);

                if (reportedChildTransactions.length === 0) {
                    nonSplitIDs.push(...splitTransactionIDs);
                    continue;
                }

                if (reportedChildTransactions.length === 1 && childTransactions.length === reportedChildTransactions.length) {
                    const remaining = reportedChildTransactions.at(0);
                    if (!remaining) {
                        continue;
                    }

                    const remainingReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${remaining.reportID}`];
                    if ((remainingReport?.statusNum ?? 0) >= CONST.REPORT.STATUS_NUM.SUBMITTED) {
                        nonSplitIDs.push(...splitTransactionIDs);
                        continue;
                    }

                    const remainingPortion = Math.abs(hasValidModifiedAmount(remaining) ? Number(remaining.modifiedAmount) : Number(remaining.amount ?? 0));
                    const splitTransactionIDList = [...splitTransactionIDs];
                    if (remaining.transactionID !== originalTransactionID) {
                        splitTransactionIDList.push(remaining.transactionID);
                    }
                    const optimisticDeletedSplitTransactions: Record<string, Transaction> = {};
                    for (const transactionID of splitTransactionIDList) {
                        const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`;
                        const splitTransaction = mergedTransactions[transactionKey];

                        if (splitTransaction) {
                            optimisticDeletedSplitTransactions[transactionKey] = splitTransaction;
                        }
                    }
                    const originalTransactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`;
                    const optimisticOriginalTransaction = mergedTransactions[originalTransactionKey];
                    const previousSnapshotOriginalTransaction = searchTransactions?.[originalTransactionKey];
                    const remainingModifiedAmount = hasValidModifiedAmount(remaining) ? remaining.modifiedAmount : '';
                    const optimisticRestoredTransaction: Transaction = {
                        ...remaining,
                        transactionID: originalTransactionID,
                        amount: remaining.amount,
                        modifiedAmount: remainingModifiedAmount,
                        pendingAction: null,
                        comment: {
                            ...(remaining.comment ?? {}),
                            source: undefined,
                            originalTransactionID: undefined,
                        },
                    };
                    const revertSplitTransactionParams = {
                        transactionID: remaining.transactionID,
                        amount: remainingPortion,
                        created: remaining.created ?? '',
                        category: remaining.category ?? '',
                        tag: remaining.tag ?? '',
                        merchant: remaining.modifiedMerchant ?? remaining.merchant ?? '',
                        comment: remaining.comment?.comment ?? '',
                        reimbursable: remaining.reimbursable,
                        billable: remaining.billable,
                        reportID: remaining.reportID,
                        quantity: remaining.comment?.customUnit?.quantity ?? undefined,
                        customUnitRateID: remaining.comment?.customUnit?.customUnitRateID,
                        odometerStart: remaining.comment?.odometerStart,
                        odometerEnd: remaining.comment?.odometerEnd,
                        waypoints: remaining.comment?.waypoints ? JSON.stringify(remaining.comment.waypoints) : undefined,
                    } as RevertSplitTransactionParams;
                    revertSplitTransactionOnSearch(
                        hash,
                        originalTransactionID,
                        revertSplitTransactionParams,
                        optimisticDeletedSplitTransactions,
                        optimisticRestoredTransaction,
                        optimisticOriginalTransaction,
                        previousSnapshotOriginalTransaction,
                    );
                    continue;
                }

                nonSplitIDs.push(...splitTransactionIDs);
            }

            if (nonSplitIDs.length > 0) {
                deleteMoneyRequestOnSearch(hash, nonSplitIDs, mergedTransactions as OnyxCollection<Transaction>);
            }
        },
        [allReports, searchResultsRecord],
    );

    return {deleteTransactionsOnSearch};
}

export default useSearchDeleteTransactions;
