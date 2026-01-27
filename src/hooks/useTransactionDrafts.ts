import {useMemo} from 'react';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';

function useTransactionDrafts() {
    const [allTransactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {canBeMissing: true});

    const draftTransactionIDs = useMemo(
        () =>
            Object.values(allTransactionDrafts ?? {})
                .filter((transaction): transaction is NonNullable<typeof transaction> => !!transaction)
                .map((transaction) => transaction.transactionID),
        [allTransactionDrafts],
    );

    return {allTransactionDrafts, draftTransactionIDs};
}

export default useTransactionDrafts;
