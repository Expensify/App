import spendDataSignatureConfig from '@libs/actions/OnyxDerived/configs/spendDataSignature';

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
        const result = spendDataSignatureConfig.compute([transactions, cardList], {currentValue: {expenses: 4, cardExpenses: 2}});

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
        spendDataSignatureConfig.compute([stored, cardList], {currentValue: {expenses: 0, cardExpenses: 0}});

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
        spendDataSignatureConfig.compute([stored, cardList], {currentValue: {expenses: 0, cardExpenses: 0}});

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
        spendDataSignatureConfig.compute([stored, cardList], {currentValue: {expenses: 0, cardExpenses: 0}});

        // When the user edits the amount, which Onyx records as `modifiedAmount` rather than `amount`
        const edited: OnyxCollection<Transaction> = {[transactionKey('1')]: {...makeTransaction('1', CARD_ID), modifiedAmount: 7777}};
        const result = spendDataSignatureConfig.compute([edited, cardList], {
            currentValue: {expenses: 0, cardExpenses: 0},
            sourceValues: {[ONYXKEYS.COLLECTION.TRANSACTION]: edited},
        });

        // Then the cards know they are stale, even though `amount` never changed
        expect(result).toEqual({expenses: 1, cardExpenses: 1});
    });
});
