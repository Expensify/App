import type {OnyxCollection} from 'react-native-onyx';
import type Transaction from '@src/types/onyx/Transaction';

const validTransactionDraftsSelector = (drafts: OnyxCollection<Transaction>): Record<string, Transaction> =>
    Object.values(drafts ?? {}).reduce<Record<string, Transaction>>((acc, draft) => {
        if (draft) {
            acc[draft.transactionID] = draft;
        }
        return acc;
    }, {});

// eslint-disable-next-line import/prefer-default-export
export {validTransactionDraftsSelector};
