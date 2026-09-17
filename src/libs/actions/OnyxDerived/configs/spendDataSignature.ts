import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

const EMPTY_SIGNATURE = {expenses: 0, cardExpenses: 0};

// Kept out of Onyx on purpose: it is a change detector, not data, and it would otherwise persist one
// entry per transaction for a collection that holds tens of thousands of them.
let lastSeenFingerprints: Record<string, string> = {};

/**
 * The fields the Home cards count or total. A write that leaves these alone cannot move a card.
 * Edits land in the `modified` fields rather than the originals, so both are read (see `getAmount`).
 */
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
 * Counters that move when spend data changes. The Home cards render server-computed snapshots that no
 * update ever patches, so they use these counters to know a refetch is owed instead of refetching on
 * every screen focus. Only the keys that changed are visited, and only a change to a field the cards
 * actually use counts, so merely opening an expense does not cost a search.
 */
export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.SPEND_DATA_SIGNATURE,
    dependencies: [ONYXKEYS.COLLECTION.TRANSACTION, ONYXKEYS.CARD_LIST],
    compute: ([transactions, cardList], {sourceValues, currentValue}) => {
        const transactionUpdates = sourceValues?.[ONYXKEYS.COLLECTION.TRANSACTION];

        // A full compute has no delta to count, so record what exists and leave the counters alone.
        // The cards fetch on mount anyway, so nothing is missed by not counting the initial load.
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
