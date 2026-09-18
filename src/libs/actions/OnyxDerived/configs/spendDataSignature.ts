import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

const EMPTY_SIGNATURE = {expenses: 0, cardExpenses: 0};

// Not in Onyx: it detects change rather than being data, and would persist tens of thousands of entries.
let lastSeenFingerprints: Record<string, string> = {};

/** Fields the Home cards count or total. Edits land in the `modified` versions, so both are read. */
function getFingerprint(transaction: Transaction | undefined): string {
    if (!transaction) {
        return '';
    }
    return [
        transaction.amount,
        transaction.modifiedAmount,
        transaction.created,
        transaction.modifiedCreated,
        transaction.currency,
        transaction.modifiedCurrency,
        transaction.cardID,
        transaction.reportID,
    ].join('|');
}

function rebuildFingerprints(transactions: OnyxCollection<Transaction> | undefined) {
    lastSeenFingerprints = {};
    for (const [key, transaction] of Object.entries(transactions ?? {})) {
        lastSeenFingerprints[key] = getFingerprint(transaction);
    }
}

/**
 * Counters that move when spend data changes. Nothing patches the Home snapshots, so the cards watch
 * these instead of fetching on every screen focus.
 */
export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.SPEND_DATA_SIGNATURE,
    dependencies: [ONYXKEYS.COLLECTION.TRANSACTION, ONYXKEYS.CARD_LIST],
    compute: ([transactions, cardList], {sourceValues, currentValue}) => {
        const transactionUpdates = sourceValues?.[ONYXKEYS.COLLECTION.TRANSACTION];

        if (!transactionUpdates) {
            rebuildFingerprints(transactions);
            return currentValue ?? EMPTY_SIGNATURE;
        }

        let hasChangedExpense = false;
        let hasChangedCardExpense = false;

        for (const key of Object.keys(transactionUpdates)) {
            const transaction = transactions?.[key];
            const fingerprint = getFingerprint(transaction);
            if (fingerprint === lastSeenFingerprints[key]) {
                continue;
            }
            lastSeenFingerprints[key] = fingerprint;
            hasChangedExpense = true;

            const cardID = transaction?.cardID ?? transactionUpdates[key]?.cardID;
            if (cardID !== undefined && !!cardList?.[String(cardID)]) {
                hasChangedCardExpense = true;
            }
        }

        if (!hasChangedExpense) {
            return currentValue ?? EMPTY_SIGNATURE;
        }

        const previous = currentValue ?? EMPTY_SIGNATURE;
        return {
            expenses: previous.expenses + 1,
            cardExpenses: hasChangedCardExpense ? previous.cardExpenses + 1 : previous.cardExpenses,
        };
    },
});
