import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import {clearPaymentCardFormErrorAndSubmit} from '@userActions/PaymentMethods';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AddPaymentCardForm} from '@src/types/form/AddPaymentCardForm';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

function getAddPaymentCardDraft(): Promise<OnyxEntry<AddPaymentCardForm>> {
    return new Promise((resolve) => {
        const connection = Onyx.connect({
            key: ONYXKEYS.FORMS.ADD_PAYMENT_CARD_FORM_DRAFT,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value);
            },
        });
    });
}

describe('clearPaymentCardFormErrorAndSubmit', () => {
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
        await Onyx.merge(ONYXKEYS.FORMS.ADD_PAYMENT_CARD_FORM_DRAFT, {currency: CONST.PAYMENT_CARD_CURRENCY.GBP});
        await waitForBatchedUpdates();

        clearPaymentCardFormErrorAndSubmit();
        await waitForBatchedUpdates();

        const draft = await getAddPaymentCardDraft();

        expect(draft).not.toHaveProperty('currency');
        expect(draft?.currency).toBeUndefined();
    });
});
