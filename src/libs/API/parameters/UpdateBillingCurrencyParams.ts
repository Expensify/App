import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type UpdateBillingCurrencyParams = {
    currency: ValueOf<typeof CONST.PAYMENT_CARD_CURRENCY>;
    cardCVV: string;
};

export default UpdateBillingCurrencyParams;
