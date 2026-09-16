import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';

import ONYXKEYS from '@src/ONYXKEYS';

const EMPTY_SIGNATURE = {expenses: 0, cardExpenses: 0};

/**
 * Counters that move whenever spend data changes. The Home cards render server-computed snapshots that
 * no update ever patches, so they use these counters to know a refetch is owed instead of refetching on
 * every screen focus. Only the keys that changed are visited, so a write costs one lookup, not a scan.
 */
export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.SPEND_DATA_SIGNATURE,
    dependencies: [ONYXKEYS.COLLECTION.TRANSACTION, ONYXKEYS.CARD_LIST],
    compute: ([transactions, cardList], {sourceValues, currentValue}) => {
        const transactionUpdates = sourceValues?.[ONYXKEYS.COLLECTION.TRANSACTION];

        // A full compute has no delta to count. Start from zero and let later writes move the counters:
        // the cards refetch on mount anyway, so nothing is missed by not counting the initial load.
        if (!transactionUpdates) {
            return currentValue ?? EMPTY_SIGNATURE;
        }

        const changedKeys = Object.keys(transactionUpdates);
        if (changedKeys.length === 0) {
            return currentValue ?? EMPTY_SIGNATURE;
        }

        const previous = currentValue ?? EMPTY_SIGNATURE;
        const hasChangedCardExpense = changedKeys.some((key) => {
            const cardID = transactionUpdates?.[key]?.cardID ?? transactions?.[key]?.cardID;
            return cardID !== undefined && !!cardList?.[String(cardID)];
        });

        return {
            expenses: previous.expenses + 1,
            cardExpenses: hasChangedCardExpense ? previous.cardExpenses + 1 : previous.cardExpenses,
        };
    },
});
