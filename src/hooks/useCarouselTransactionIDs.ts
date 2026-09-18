import {isDeletedTransaction, isTransactionPendingDelete} from '@libs/TransactionUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {useCallback} from 'react';

import useOnyx from './useOnyx';

type CarouselTransactionIDs = {
    /** The seeded carousel IDs, minus the expenses that are gone */
    transactionIDs: string[];

    /** The search snapshot the carousel was seeded from, when it was seeded from one */
    snapshot: OnyxEntry<OnyxTypes.SearchResults>;
};

function useCarouselTransactionIDs(): CarouselTransactionIDs {
    const [seededTransactionIDs = getEmptyArray<string>()] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS);
    const [snapshotHash] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_SNAPSHOT_HASH);
    const [snapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}`);
    const [siblingDescriptors] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_THREAD_REPORT_IDS);

    const validTransactionIDsSelector = useCallback(
        (allTransactions: OnyxCollection<OnyxTypes.Transaction>) =>
            seededTransactionIDs.filter((transactionID) => {
                const key = `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}` as const;

                const liveTransaction = allTransactions?.[key];
                if (liveTransaction === null) {
                    return false;
                }
                const transaction = liveTransaction ?? snapshot?.data?.[key];

                if (!transaction) {
                    return !!siblingDescriptors?.[transactionID];
                }
                return !isTransactionPendingDelete(transaction) && !isDeletedTransaction(transaction);
            }),
        [seededTransactionIDs, snapshot, siblingDescriptors],
    );
    const [validTransactionIDs = getEmptyArray<string>(), transactionsMetadata] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {selector: validTransactionIDsSelector});

    return {transactionIDs: isLoadingOnyxValue(transactionsMetadata) ? seededTransactionIDs : validTransactionIDs, snapshot};
}

export default useCarouselTransactionIDs;
