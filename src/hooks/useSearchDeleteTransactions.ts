import {useCallback} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import {useSearchStateContext} from '@components/Search/SearchContext';
import {deleteMoneyRequestOnSearch, revertSplitTransactionOnSearch} from '@libs/actions/Search';
import type {RevertSplitTransactionParams} from '@libs/API/parameters';
import {hasValidModifiedAmount} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import useOnyx from './useOnyx';

type TransactionMap = Record<string, Transaction | undefined>;

function hasTransactions(transactions?: TransactionMap | null): transactions is TransactionMap {
    return !!transactions && Object.keys(transactions).length > 0;
}

function getSearchTransactions(searchResultsRecord?: Record<string, unknown>): TransactionMap | undefined {
    if (!searchResultsRecord) {
        return undefined;
    }

    const searchTransactions = Object.entries(searchResultsRecord).reduce<TransactionMap>((acc, [key, value]) => {
        if (!key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION) || !value) {
            return acc;
        }

        acc[key] = value as Transaction;
        return acc;
    }, {});

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

            const availableTransactions = hasTransactions(transactions as TransactionMap | null | undefined) ? (transactions as TransactionMap) : getSearchTransactions(searchResultsRecord);

            if (!hasTransactions(availableTransactions)) {
                deleteMoneyRequestOnSearch(hash, transactionIDs, transactions);
                return;
            }

            const splitsByOriginalID: Record<string, string[]> = {};
            const nonSplitIDs: string[] = [];

            for (const transactionID of transactionIDs) {
                const transaction = availableTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
                const originalTransactionID = transaction?.comment?.originalTransactionID;

                if (originalTransactionID && transaction?.comment?.source === CONST.IOU.TYPE.SPLIT) {
                    (splitsByOriginalID[originalTransactionID] ??= []).push(transactionID);
                } else {
                    nonSplitIDs.push(transactionID);
                }
            }

            for (const [originalTransactionID, splitTransactionIDs] of Object.entries(splitsByOriginalID)) {
                const deletingIDs = new Set(splitTransactionIDs);
                const siblings: Transaction[] = [];

                for (const [key, value] of Object.entries(availableTransactions)) {
                    if (!key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION)) {
                        continue;
                    }

                    const transaction = value;
                    if (!transaction?.transactionID) {
                        continue;
                    }

                    if (transaction.comment?.originalTransactionID !== originalTransactionID) {
                        continue;
                    }

                    if (deletingIDs.has(transaction.transactionID)) {
                        continue;
                    }

                    siblings.push(transaction);
                }

                if (siblings.length === 0) {
                    nonSplitIDs.push(...splitTransactionIDs);
                    continue;
                }

                if (siblings.length === 1) {
                    const remaining = siblings.at(0);
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
                    const optimisticDeletedSplitTransactions = splitTransactionIDList.reduce<Record<string, Transaction>>((acc, transactionID) => {
                        const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`;
                        const splitTransaction = availableTransactions[transactionKey];

                        if (splitTransaction) {
                            acc[transactionKey] = splitTransaction;
                        }

                        return acc;
                    }, {});
                    const optimisticOriginalTransaction = availableTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`];
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
                    );
                    continue;
                }

                nonSplitIDs.push(...splitTransactionIDs);
            }

            if (nonSplitIDs.length > 0) {
                deleteMoneyRequestOnSearch(hash, nonSplitIDs, availableTransactions as OnyxCollection<Transaction>);
            }
        },
        [allReports, searchResultsRecord],
    );

    return {deleteTransactionsOnSearch};
}

export default useSearchDeleteTransactions;
