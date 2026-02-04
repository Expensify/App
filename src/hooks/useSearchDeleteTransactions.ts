import {useCallback} from 'react';
import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import {useSearchContext} from '@components/Search/SearchContext';
import {deleteMoneyRequestOnSearch} from '@libs/actions/Search';
import * as API from '@libs/API';
import type {RevertSplitTransactionParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

function useSearchDeleteTransactions() {
    const {currentSearchResults} = useSearchContext();
    const searchResultsRecord = currentSearchResults?.data as Record<string, unknown> | undefined;

    const deleteTransactionsOnSearch = useCallback(
        (hash: number, transactionIDs: string[]) => {
            if (!transactionIDs.length) {
                return;
            }

            if (!searchResultsRecord || Object.keys(searchResultsRecord).length === 0) {
                deleteMoneyRequestOnSearch(hash, transactionIDs);
                return;
            }

            const splitsByOriginalID: Record<string, string[]> = {};
            const nonSplitIDs: string[] = [];

            for (const transactionID of transactionIDs) {
                const transaction = searchResultsRecord[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] as Transaction | undefined;
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

                for (const [key, value] of Object.entries(searchResultsRecord)) {
                    if (!key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION)) {
                        continue;
                    }

                    const transaction = value as Transaction | undefined;
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
                    const remaining = siblings[0];
                    const remainingPortion = Math.abs(Number(remaining.modifiedAmount ?? remaining.amount ?? 0));

                    const optimisticData: OnyxUpdate[] = [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`,
                            value: {
                                data: {
                                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`]: null,
                                },
                            },
                        },
                    ];

                    const params: RevertSplitTransactionParams = {
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
                    };

                    API.write(WRITE_COMMANDS.REVERT_SPLIT_TRANSACTION, params, {optimisticData, successData: [], failureData: []});
                    continue;
                }

                nonSplitIDs.push(...splitTransactionIDs);
            }

            if (nonSplitIDs.length > 0) {
                deleteMoneyRequestOnSearch(hash, nonSplitIDs);
            }
        },
        [searchResultsRecord],
    );

    return {deleteTransactionsOnSearch};
}

export default useSearchDeleteTransactions;
