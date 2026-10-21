import {SEARCH_TRANSACTION_ROW_ONLY_FIELD_NAMES} from '@libs/getTransactionFromTransactionListItem';
import Log from '@libs/Log';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/**
 * Removes the Search row display-only fields (e.g. `formattedMerchant`) from cached transactions.
 */
export default function RemoveSearchRowFieldsFromTransactions(): Promise<void> {
    return new Promise<void>((resolve) => {
        // connectWithoutView is appropriate here because migrations run once at startup, before anything renders
        const connection = Onyx.connectWithoutView({
            key: ONYXKEYS.COLLECTION.TRANSACTION,
            callback: (transactions: OnyxCollection<Transaction>) => {
                Onyx.disconnect(connection);

                const updates: Record<string, Record<string, null>> = {};
                for (const [key, transaction] of Object.entries(transactions ?? {})) {
                    if (!transaction) {
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
                    updates[key] = leakedFields;
                }

                if (Object.keys(updates).length === 0) {
                    Log.info('[Migrate Onyx] Skipped RemoveSearchRowFieldsFromTransactions — no leaked Search row fields found');
                    return resolve();
                }

                // No need to add a new action just for this migration
                // eslint-disable-next-line rulesdir/prefer-actions-set-data
                Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION, updates)
                    .then(() => {
                        Log.info(`[Migrate Onyx] Ran RemoveSearchRowFieldsFromTransactions migration on ${Object.keys(updates).length} transactions`);
                    })
                    .catch((error: unknown) => {
                        // The cleanup is non-critical, so never block startup on it; it runs again on the next launch
                        Log.warn('[Migrate Onyx] RemoveSearchRowFieldsFromTransactions failed', {error});
                    })
                    .finally(resolve);
            },
        });
    });
}
