import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type UpdateBillingCurrencyParams = {
    currency: ValueOf<typeof CONST.PAYMENT_CARD_CURRENCY>;
    cardCVV: string;
};

export default UpdateBillingCurrencyParams;
