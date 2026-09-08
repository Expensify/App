import type Transaction from '@src/types/onyx/Transaction';

import type {OnyxCollection} from 'react-native-onyx';
import type {ReadonlyDeep} from 'type-fest';

const validTransactionDraftsSelector = <TDraft extends ReadonlyDeep<Transaction>>(drafts: OnyxCollection<TDraft>): Record<string, TDraft> =>
    Object.values(drafts ?? {}).reduce<Record<string, TDraft>>((acc, draft) => {
        if (draft) {
            acc[draft.transactionID] = draft;
        }
        return acc;
    }, {});

const validTransactionDraftIDsSelector = (drafts: ReadonlyDeep<OnyxCollection<Transaction>>): string[] =>
    Object.values(drafts ?? {}).reduce<string[]>((acc, draft) => {
        if (draft) {
            acc.push(draft.transactionID);
        }
        return acc;
    }, []);

export {validTransactionDraftsSelector, validTransactionDraftIDsSelector};
