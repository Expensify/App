import spendDataSignatureConfig from '@libs/actions/OnyxDerived/configs/spendDataSignature';

import type {OnyxKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardList, Transaction} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import createRandomCard from '../../utils/collections/card';
import createRandomTransaction from '../../utils/collections/transaction';

const CARD_ID = 11111;
const OTHER_CARD_ID = 99999;

const cardList: CardList = {[CARD_ID]: {...createRandomCard(CARD_ID), cardID: CARD_ID}};

function makeTransaction(transactionID: string, cardID?: number): Transaction {
    return {...createRandomTransaction(Number(transactionID)), transactionID, cardID};
}

function transactionKey(transactionID: string) {
    return `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}` as const;
}

/** A flush where transactions fired, like the first load or a restore from disk. */
const TRANSACTIONS_FIRED = new Set<OnyxKey>([ONYXKEYS.COLLECTION.TRANSACTION]);

/** Stores the fingerprints the way the first load does, so later changes have something to compare to. */
function seedBaseline(transactions: OnyxCollection<Transaction>) {
    spendDataSignatureConfig.compute([transactions, cardList], {currentValue: {expenses: 0, cardExpenses: 0}, triggeredKeys: TRANSACTIONS_FIRED});
}

describe('spendDataSignature', () => {
    it('starts at zero when there is nothing to count', () => {
        // Given no transactions and no previous value

        // When the value is computed from scratch
        const result = spendDataSignatureConfig.compute([undefined, undefined], {});

        // Then both counters start at zero
        expect(result).toEqual({expenses: 0, cardExpenses: 0});
    });

    it('does not move the counters on a full recompute', () => {
        // Given a stored value and a full recompute, which carries no delta
        const transactions: OnyxCollection<Transaction> = {[transactionKey('1')]: makeTransaction('1')};

        // When it recomputes with no source values
        const result = spendDataSignatureConfig.compute([transactions, cardList], {currentValue: {expenses: 4, cardExpenses: 2}, triggeredKeys: TRANSACTIONS_FIRED});

        // Then the counters are left alone, so loading from disk does not look like a change
        expect(result).toEqual({expenses: 4, cardExpenses: 2});
    });

    it('moves the expense counter when an expense changes', () => {
        // Given one changed expense that is not on a card
        const changed = {[transactionKey('1')]: makeTransaction('1')};

        // When the value is computed with that delta
        const result = spendDataSignatureConfig.compute([changed, cardList], {
            currentValue: {expenses: 0, cardExpenses: 0},
            sourceValues: {[ONYXKEYS.COLLECTION.TRANSACTION]: changed},
        });

        // Then only the expense counter moves
        expect(result).toEqual({expenses: 1, cardExpenses: 0});
    });

    it('moves both counters when the expense is on one of the user`s cards', () => {
        // Given a changed expense charged to a card the user holds
        const changed = {[transactionKey('1')]: makeTransaction('1', CARD_ID)};

        // When the value is computed with that delta
        const result = spendDataSignatureConfig.compute([changed, cardList], {
            currentValue: {expenses: 0, cardExpenses: 0},
            sourceValues: {[ONYXKEYS.COLLECTION.TRANSACTION]: changed},
        });

        // Then the card counter moves too, so the card totals know they are stale
        expect(result).toEqual({expenses: 1, cardExpenses: 1});
    });

    it('leaves the card counter alone for a card the user does not hold', () => {
        // Given a changed expense on someone else's card
        const changed = {[transactionKey('1')]: makeTransaction('1', OTHER_CARD_ID)};

        // When the value is computed with that delta
        const result = spendDataSignatureConfig.compute([changed, cardList], {
            currentValue: {expenses: 0, cardExpenses: 0},
            sourceValues: {[ONYXKEYS.COLLECTION.TRANSACTION]: changed},
        });

        // Then the card totals are not refetched for a card that is not on the page
        expect(result).toEqual({expenses: 1, cardExpenses: 0});
    });

    it('reads the card from the stored transaction when the delta omits it', () => {
        // Given a partial update to an expense whose card is only known from the stored collection
        const stored: OnyxCollection<Transaction> = {[transactionKey('1')]: makeTransaction('1', CARD_ID)};
        const changed = {[transactionKey('1')]: {...makeTransaction('1'), cardID: undefined, amount: 500}};

        // When the value is computed with that delta
        const result = spendDataSignatureConfig.compute([stored, cardList], {
            currentValue: {expenses: 0, cardExpenses: 0},
            sourceValues: {[ONYXKEYS.COLLECTION.TRANSACTION]: changed},
        });

        // Then the card counter still moves, since an amount edit changes the card total
        expect(result).toEqual({expenses: 1, cardExpenses: 1});
    });

    it('ignores an empty delta', () => {
        // Given a flush that carries no changed transaction keys
        const result = spendDataSignatureConfig.compute([undefined, cardList], {
            currentValue: {expenses: 3, cardExpenses: 1},
            sourceValues: {[ONYXKEYS.COLLECTION.TRANSACTION]: {}},
        });

        // Then nothing moves
        expect(result).toEqual({expenses: 3, cardExpenses: 1});
    });

    it('does not move the counters when a write leaves the counted fields alone', () => {
        // Given a stored expense that the derived value has already seen
        const stored: OnyxCollection<Transaction> = {[transactionKey('1')]: makeTransaction('1', CARD_ID)};
        seedBaseline(stored);

        // When the same expense is written again with no change to amount, date, currency, card or report,
        // which is what merely opening it in the RHP does
        const result = spendDataSignatureConfig.compute([stored, cardList], {
            currentValue: {expenses: 0, cardExpenses: 0},
            sourceValues: {[ONYXKEYS.COLLECTION.TRANSACTION]: stored},
        });

        // Then nothing moves, so viewing an expense costs no search
        expect(result).toEqual({expenses: 0, cardExpenses: 0});
    });

    it('moves the counters when the amount of a seen expense changes', () => {
        // Given a stored expense the derived value has already seen
        const stored: OnyxCollection<Transaction> = {[transactionKey('1')]: makeTransaction('1', CARD_ID)};
        seedBaseline(stored);

        // When its amount is edited
        const edited: OnyxCollection<Transaction> = {[transactionKey('1')]: {...makeTransaction('1', CARD_ID), amount: 9999}};
        const result = spendDataSignatureConfig.compute([edited, cardList], {
            currentValue: {expenses: 0, cardExpenses: 0},
            sourceValues: {[ONYXKEYS.COLLECTION.TRANSACTION]: edited},
        });

        // Then both counters move, because the card total and the chart both change
        expect(result).toEqual({expenses: 1, cardExpenses: 1});
    });

    it('moves the counters when an expense is edited, which lands in the modified fields', () => {
        // Given a stored expense the derived value has already seen
        const stored: OnyxCollection<Transaction> = {[transactionKey('1')]: makeTransaction('1', CARD_ID)};
        seedBaseline(stored);

        // When the user edits the amount, which Onyx records as `modifiedAmount` rather than `amount`
        const edited: OnyxCollection<Transaction> = {[transactionKey('1')]: {...makeTransaction('1', CARD_ID), modifiedAmount: 7777}};
        const result = spendDataSignatureConfig.compute([edited, cardList], {
            currentValue: {expenses: 0, cardExpenses: 0},
            sourceValues: {[ONYXKEYS.COLLECTION.TRANSACTION]: edited},
        });

        // Then the cards know they are stale, even though `amount` never changed
        expect(result).toEqual({expenses: 1, cardExpenses: 1});
    });

    it('moves both counters when a card expense is deleted', () => {
        // Given a card expense the derived value has already seen
        const stored: OnyxCollection<Transaction> = {[transactionKey('1')]: makeTransaction('1', CARD_ID)};
        seedBaseline(stored);

        // When it is deleted, so it is gone from both the collection and the update
        const removed = {[transactionKey('1')]: undefined};
        const result = spendDataSignatureConfig.compute([{}, cardList], {
            currentValue: {expenses: 0, cardExpenses: 0},
            sourceValues: {[ONYXKEYS.COLLECTION.TRANSACTION]: removed},
        });

        // Then the card total also knows it is out of date, because it counted that expense
        expect(result).toEqual({expenses: 1, cardExpenses: 1});
    });

    it('does not replay a delete on the next flush', () => {
        // Given a deleted card expense that has already been counted
        const stored: OnyxCollection<Transaction> = {[transactionKey('1')]: makeTransaction('1', CARD_ID)};
        seedBaseline(stored);
        const removed = {[transactionKey('1')]: undefined};
        spendDataSignatureConfig.compute([{}, cardList], {
            currentValue: {expenses: 0, cardExpenses: 0},
            sourceValues: {[ONYXKEYS.COLLECTION.TRANSACTION]: removed},
        });

        // When the same removal is seen again
        const result = spendDataSignatureConfig.compute([{}, cardList], {
            currentValue: {expenses: 1, cardExpenses: 1},
            sourceValues: {[ONYXKEYS.COLLECTION.TRANSACTION]: removed},
        });

        // Then nothing moves, because the expense was already forgotten the first time
        expect(result).toEqual({expenses: 1, cardExpenses: 1});
    });

    it('keeps the baseline when only the card list changes', () => {
        // Given a stored expense the derived value has already seen
        const stored: OnyxCollection<Transaction> = {[transactionKey('1')]: makeTransaction('1', CARD_ID)};
        seedBaseline(stored);

        // When only the card list is written, so no transaction changed
        spendDataSignatureConfig.compute([stored, cardList], {
            currentValue: {expenses: 0, cardExpenses: 0},
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.CARD_LIST]),
        });

        // Then the stored fingerprints survive, so an unchanged expense still counts as no change
        const result = spendDataSignatureConfig.compute([stored, cardList], {
            currentValue: {expenses: 0, cardExpenses: 0},
            sourceValues: {[ONYXKEYS.COLLECTION.TRANSACTION]: stored},
        });
        expect(result).toEqual({expenses: 0, cardExpenses: 0});
    });

    it('drops its baseline when Onyx is cleared', () => {
        // Given a stored expense the derived value has already seen
        const stored: OnyxCollection<Transaction> = {[transactionKey('1')]: makeTransaction('1', CARD_ID)};
        seedBaseline(stored);

        // When Onyx is cleared and the same expense is written again as the data comes back
        spendDataSignatureConfig.onReset?.();
        const result = spendDataSignatureConfig.compute([stored, cardList], {
            currentValue: {expenses: 0, cardExpenses: 0},
            sourceValues: {[ONYXKEYS.COLLECTION.TRANSACTION]: stored},
        });

        // Then it counts as a change, because the fingerprints from before the clear are gone
        expect(result).toEqual({expenses: 1, cardExpenses: 1});
    });
});
