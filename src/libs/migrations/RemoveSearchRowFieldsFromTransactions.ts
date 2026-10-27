import {SEARCH_TRANSACTION_ROW_ONLY_FIELD_NAMES} from '@libs/getTransactionFromTransactionListItem';
import Log from '@libs/Log';
import readOnceOnyxValue from '@libs/readOnceOnyxValue';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

/**
 * Removes the Search row display-only fields (e.g. `formattedMerchant`) from cached transactions.
 */
export default async function RemoveSearchRowFieldsFromTransactions(): Promise<void> {
    const transactions = await readOnceOnyxValue(ONYXKEYS.COLLECTION.TRANSACTION);

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
        return;
    }

    try {
        // No need to add a new action just for this migration
        // eslint-disable-next-line rulesdir/prefer-actions-set-data
        await Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION, updates);
        Log.info(`[Migrate Onyx] Ran RemoveSearchRowFieldsFromTransactions migration on ${Object.keys(updates).length} transactions`);
    } catch (error) {
        // The cleanup is non-critical, so never block startup on it; it runs again on the next launch
        Log.warn('[Migrate Onyx] RemoveSearchRowFieldsFromTransactions failed', {error});
    }
}
