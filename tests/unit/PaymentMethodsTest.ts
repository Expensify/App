import getMakeDefaultPaymentOnyxData from '@userActions/getMakeDefaultPaymentOnyxData';
import {clearAddPaymentCardDraftCurrency} from '@userActions/PaymentMethods';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AddPaymentCardForm} from '@src/types/form/AddPaymentCardForm';
import type PaymentMethod from '@src/types/onyx/PaymentMethod';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

function getAddPaymentCardDraft(): Promise<OnyxEntry<AddPaymentCardForm>> {
    return new Promise((resolve) => {
        const connection = Onyx.connect({
            key: ONYXKEYS.FORMS.ADD_PAYMENT_CARD_FORM_DRAFT,
            callback: (value) => {
                connection.unsubscribe();
                resolve(value);
            },
        });
    });
}

describe('clearAddPaymentCardDraftCurrency', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    // The currency picker persists its selection to ADD_PAYMENT_CARD_FORM_DRAFT.currency, and FormProvider hydrates a
    // draft value over an input's defaultValue whenever that draft value is `!== undefined`. Clearing the draft with
    // `Onyx.merge({currency: null})` therefore only works because Onyx treats a nested null as a deletion sentinel and
    // strips the key. A literal null (e.g. if this were ever changed to `Onyx.set`) would be hydrated by FormProvider
    // and clobber the preferred-currency default, blanking the selector / submitting a null currency. Guard that here.
    it('removes the currency key from the draft rather than storing a literal null', async () => {
        // Given a currency the user picked earlier, still sitting in the add-card draft
        await Onyx.merge(ONYXKEYS.FORMS.ADD_PAYMENT_CARD_FORM_DRAFT, {currency: CONST.PAYMENT_CARD_CURRENCY.GBP});
        await waitForBatchedUpdates();

        // When the draft currency is cleared
        await clearAddPaymentCardDraftCurrency();

        const draft = await getAddPaymentCardDraft();

        // Then the key is gone rather than null, so FormProvider falls back to the preferred currency
        expect(draft).not.toHaveProperty('currency');
        expect(draft?.currency).toBeUndefined();
    });
});

describe('getMakeDefaultPaymentOnyxData', () => {
    const bankAccountID = 123;
    const fundID = 456;
    it.each([bankAccountID, 0])('returns only a wallet merge for one bank ID argument (%s)', (replacementBankAccountID) => {
        // Given a deletion caller that supplies only a replacement bank ID.
        // When the shared action builds the batch used to link the replacement account.
        const updates = getMakeDefaultPaymentOnyxData(replacementBankAccountID);

        // Then no bank or fund update is invented, including the original zero-ID fallback.
        expect(updates).toStrictEqual([
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.USER_WALLET,
                value: {
                    walletLinkedAccountID: replacementBankAccountID || undefined,
                    walletLinkedAccountType: replacementBankAccountID ? CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT : CONST.PAYMENT_METHODS.DEBIT_CARD,
                    errors: null,
                },
            },
        ]);
    });

    it.each([true, false])('preserves bank-to-debit switches and error omission (optimistic %s)', (isOptimisticData) => {
        // Given payment methods produced by the bank and debit-card lists.
        const previousPaymentMethod = createMock<PaymentMethod>({accountType: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT, methodID: bankAccountID});
        const currentPaymentMethod = createMock<PaymentMethod>({accountType: CONST.PAYMENT_METHODS.DEBIT_CARD, methodID: fundID});

        // When a full call switches from the bank to a debit card.
        const updates = getMakeDefaultPaymentOnyxData(0, fundID, previousPaymentMethod, currentPaymentMethod, isOptimisticData);

        // Then the mutable batch preserves wallet-first ordering and both method categories.
        expect(updates).toStrictEqual([
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.USER_WALLET,
                value: {
                    walletLinkedAccountID: fundID,
                    walletLinkedAccountType: CONST.PAYMENT_METHODS.DEBIT_CARD,
                    ...(isOptimisticData ? {errors: null} : {}),
                },
            },
            {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.BANK_ACCOUNT_LIST, value: {[bankAccountID]: {isDefault: !isOptimisticData}}},
            {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.FUND_LIST, value: {[fundID]: {isDefault: isOptimisticData}}},
        ]);
    });

    it('preserves the reverse debit-to-bank switch', () => {
        // Given the debit card is currently default and a bank account is selected.
        const previousPaymentMethod = createMock<PaymentMethod>({accountType: CONST.PAYMENT_METHODS.DEBIT_CARD, methodID: fundID});
        const currentPaymentMethod = createMock<PaymentMethod>({accountType: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT, methodID: bankAccountID});

        // When the bank becomes default.
        const updates = getMakeDefaultPaymentOnyxData(bankAccountID, 0, previousPaymentMethod, currentPaymentMethod);

        // Then the wallet and list defaults retain their original order and values.
        expect(updates).toStrictEqual([
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.USER_WALLET,
                value: {walletLinkedAccountID: bankAccountID, walletLinkedAccountType: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT, errors: null},
            },
            {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.FUND_LIST, value: {[fundID]: {isDefault: false}}},
            {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.BANK_ACCOUNT_LIST, value: {[bankAccountID]: {isDefault: true}}},
        ]);
    });

    it.each([true, false])('omits list updates when optional methods are absent (optimistic %s)', (isOptimisticData) => {
        // Given no previous or current list method, as allowed by the original optional call.
        // When a fund-only wallet update is constructed.
        const updates = getMakeDefaultPaymentOnyxData(0, fundID, undefined, undefined, isOptimisticData);

        // Then the fallback category and failure error omission remain unchanged.
        expect(updates).toStrictEqual([
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.USER_WALLET,
                value: {
                    walletLinkedAccountID: fundID,
                    walletLinkedAccountType: CONST.PAYMENT_METHODS.DEBIT_CARD,
                    ...(isOptimisticData ? {errors: null} : {}),
                },
            },
        ]);
    });

    it('skips both method list updates for zero method IDs', () => {
        // Given both selected methods have zero IDs, which the existing action treats as absent.
        const previousPaymentMethod = createMock<PaymentMethod>({accountType: CONST.PAYMENT_METHODS.DEBIT_CARD, methodID: 0});
        const currentPaymentMethod = createMock<PaymentMethod>({accountType: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT, methodID: 0});

        // When the original optional-parameter call is used.
        const updates = getMakeDefaultPaymentOnyxData(bankAccountID, undefined, previousPaymentMethod, currentPaymentMethod);

        // Then only the wallet changes, without a zero-key list entry.
        expect(updates).toStrictEqual(getMakeDefaultPaymentOnyxData(bankAccountID));
    });
});
