import {useCallback} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import {useSearchStateContext} from '@components/Search/SearchContext';
import {deleteMoneyRequestOnSearch, revertSplitTransactionOnSearch} from '@libs/actions/Search';
import {hasValidModifiedAmount} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

function useSearchDeleteTransactions() {
    const {currentSearchResults} = useSearchStateContext();
    const searchResultsRecord = currentSearchResults?.data as Record<string, unknown> | undefined;

    const deleteTransactionsOnSearch = useCallback(
        (hash: number, transactionIDs: string[], transactions?: OnyxCollection<Transaction>) => {
            if (!transactionIDs.length) {
                return;
            }

            if (!searchResultsRecord || Object.keys(searchResultsRecord).length === 0) {
                deleteMoneyRequestOnSearch(hash, transactionIDs, transactions);
                return;
            }

            const splitsByOriginalID: Record<string, string[]> = {};
            const nonSplitIDs: string[] = [];

            for (const transactionID of transactionIDs) {
                const transaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
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

                for (const [key, value] of Object.entries(transactions ?? {})) {
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
                    const remainingPortion = Math.abs(hasValidModifiedAmount(remaining) ? Number(remaining.modifiedAmount) : Number(remaining.amount ?? 0));
                    const splitTransactionIDList = [...splitTransactionIDs];
                    if (remaining.transactionID !== originalTransactionID) {
                        splitTransactionIDList.push(remaining.transactionID);
                    }
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
                    revertSplitTransactionOnSearch(
                        hash,
                        originalTransactionID,
                        {
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
                        },
                        splitTransactionIDList,
                        optimisticRestoredTransaction,
                    );
                    continue;
                }

                nonSplitIDs.push(...splitTransactionIDs);
            }

            if (nonSplitIDs.length > 0) {
                deleteMoneyRequestOnSearch(hash, nonSplitIDs, transactions);
            }
        },
        [searchResultsRecord],
    );

    return {deleteTransactionsOnSearch};
}

export default useSearchDeleteTransactions;
