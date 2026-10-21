import {SEARCH_TRANSACTION_ROW_ONLY_FIELD_NAMES} from '@libs/getTransactionFromTransactionListItem';
import Log from '@libs/Log';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import type {OnyxCollection, OnyxMergeCollectionInput} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/**
 * Moving expenses from Search used to save the whole Search row on the transaction, including display-only fields such
 * as `formattedMerchant`, which then shadowed the real values (e.g. an edited merchant kept showing the old one). The
 * write paths no longer do this, but a client can still hold those fields in its local Onyx cache, so this clears them.
 * This is temporary and can be removed once those caches have had time to refresh.
 */
export default function RemoveSearchRowFieldsFromTransactions(): Promise<void> {
    return new Promise<void>((resolve) => {
        const connection = Onyx.connectWithoutView({
            key: ONYXKEYS.COLLECTION.TRANSACTION,
            callback: (transactions: OnyxCollection<Transaction>) => {
                Onyx.disconnect(connection);

                const updates: OnyxMergeCollectionInput<typeof ONYXKEYS.COLLECTION.TRANSACTION> = {};
                for (const transaction of Object.values(transactions ?? {})) {
                    if (!transaction?.transactionID) {
                        continue;
                    }
                    const leakedFields: Record<string, null> = {};
                    for (const fieldName of SEARCH_TRANSACTION_ROW_ONLY_FIELD_NAMES) {
                        if (fieldName in transaction) {
                            leakedFields[fieldName] = null;
                        }
                    }
                    if (Object.keys(leakedFields).length === 0) {
                        continue;
                    }
                    updates[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`] = leakedFields;
                }

                if (Object.keys(updates).length === 0) {
                    Log.info('[Migrate Onyx] Skipped RemoveSearchRowFieldsFromTransactions — no leaked Search row fields found');
                    return resolve();
                }

                // No need to add a new action just for this migration
                // eslint-disable-next-line rulesdir/prefer-actions-set-data
                Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION, updates).then(() => {
                    Log.info(`[Migrate Onyx] Ran RemoveSearchRowFieldsFromTransactions migration on ${Object.keys(updates).length} transactions`);
                    resolve();
                });
            },
        });
    });
}
