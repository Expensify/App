import type {OnyxCollection} from 'react-native-onyx';
import type Transaction from '@src/types/onyx/Transaction';

const validTransactionDraftsSelector = (drafts: OnyxCollection<Transaction>): Record<string, Transaction> =>
    Object.values(drafts ?? {}).reduce<Record<string, Transaction>>((acc, draft) => {
        if (draft) {
            acc[draft.transactionID] = draft;
        }
        return acc;
    }, {});

const validTransactionDraftIDsSelector = (drafts: OnyxCollection<Transaction>): string[] => {
    const ids: string[] = [];
    for (const draft of Object.values(drafts ?? {})) {
        if (draft) {
            ids.push(draft.transactionID);
        }
    }
    return ids;
};

export {validTransactionDraftsSelector, validTransactionDraftIDsSelector};
