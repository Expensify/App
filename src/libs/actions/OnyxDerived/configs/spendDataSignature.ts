import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import {hasKeyTriggeredCompute} from '@userActions/OnyxDerived/utils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

/**
 * Counters that move when spend data changes. Nothing patches the Home snapshots, so the cards watch
 * these instead of fetching on every screen focus.
 */
const EMPTY_SIGNATURE = {expenses: 0, cardExpenses: 0};

/** What the last compute saw: the counted fields, plus the card, which a later delete needs. */
type SeenTransaction = {
    fingerprint: string;
    cardFingerprint: string;
    cardID: number | undefined;
};

// The map stays out of Onyx: it is not data, and it would write tens of thousands of entries to disk.
let lastSeenTransactions: Record<string, SeenTransaction> = {};

let hasBaseline = false;

/** Fields the card totals read. Edits land in the `modified` versions, so both are read. */
function getCardFingerprint(transaction: Transaction | undefined): string {
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

/** The card fields, plus what the other cards filter or group by: reimbursable, merchant and category. */
function getFingerprint(transaction: Transaction | undefined, cardFingerprint: string): string {
    if (!transaction) {
        return '';
    }
    return [cardFingerprint, transaction.reimbursable, transaction.merchant, transaction.modifiedMerchant, transaction.category].join('|');
}

function getSeenTransaction(transaction: Transaction | undefined): SeenTransaction {
    const cardFingerprint = getCardFingerprint(transaction);
    return {fingerprint: getFingerprint(transaction, cardFingerprint), cardFingerprint, cardID: transaction?.cardID};
}

function rebuildBaseline(transactions: OnyxCollection<Transaction> | undefined) {
    lastSeenTransactions = {};
    hasBaseline = true;
    for (const [key, transaction] of Object.entries(transactions ?? {})) {
        lastSeenTransactions[key] = getSeenTransaction(transaction);
    }
}

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.SPEND_DATA_SIGNATURE,
    dependencies: [ONYXKEYS.COLLECTION.TRANSACTION, ONYXKEYS.CARD_LIST],
    compute: ([transactions, cardList], {sourceValues, currentValue, triggeredKeys}) => {
        const transactionUpdates = sourceValues?.[ONYXKEYS.COLLECTION.TRANSACTION];

        if (!transactionUpdates) {
            // Rebuilding reads every transaction, so only do it when transactions changed but we got no
            // delta: the first load, or a restore from disk. A card write leaves the old map valid.
            // `!hasBaseline` forces the first build: before all connections are set a recompute returns early
            // without recording what triggered it, so the first flush names only the dependency that connected
            // last. If that is the card list, waiting on a TRANSACTION trigger leaves the map empty all session.
            if (!hasBaseline || hasKeyTriggeredCompute(ONYXKEYS.COLLECTION.TRANSACTION, triggeredKeys)) {
                rebuildBaseline(transactions);
            }
            return currentValue ?? EMPTY_SIGNATURE;
        }

        let hasChangedExpense = false;
        let hasChangedCardExpense = false;

        for (const key of Object.keys(transactionUpdates)) {
            const transaction = transactions?.[key];
            const lastSeen = lastSeenTransactions[key];

            // Nothing was counted for this key, so its removal changes no total.
            if (!transaction && !lastSeen) {
                continue;
            }

            const seen = getSeenTransaction(transaction);
            if (seen.fingerprint === lastSeen?.fingerprint) {
                continue;
            }
            hasChangedExpense = true;

            // A deleted expense is `undefined` everywhere, so its card comes from what we stored for it.
            // A merchant, category or reimbursable edit leaves the card totals as they were.
            const cardID = transaction?.cardID ?? lastSeen?.cardID;
            if (cardID !== undefined && !!cardList?.[String(cardID)] && seen.cardFingerprint !== lastSeen?.cardFingerprint) {
                hasChangedCardExpense = true;
            }

            if (!transaction) {
                delete lastSeenTransactions[key];
            } else {
                lastSeenTransactions[key] = seen;
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
    onReset: () => {
        lastSeenTransactions = {};
        hasBaseline = false;
    },
});
