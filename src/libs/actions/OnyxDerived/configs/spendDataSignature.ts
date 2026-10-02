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

/**
 * The card fields, plus what the other cards filter or group by: reimbursable, merchant and category.
 * The pending flag moves it again once the server accepts a write, since a refetch sent before that can miss it.
 * A new expense sets `pendingAction`, an edit only sets `pendingFields`.
 */
function getFingerprint(transaction: Transaction | undefined, cardFingerprint: string): string {
    if (!transaction) {
        return '';
    }
    const hasPendingWrite = !!transaction.pendingAction || Object.values(transaction.pendingFields ?? {}).some((pendingField) => !!pendingField);
    return [cardFingerprint, transaction.reimbursable, transaction.merchant, transaction.modifiedMerchant, transaction.category, hasPendingWrite].join('|');
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
            // Rebuilding reads every expense, so only do it on the first load or when expenses changed without a list
            // of what changed. `!hasBaseline` forces the first build, since the first run may name only the card list.
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
