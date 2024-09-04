import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type Form from './Form';

const INPUT_IDS = {
    CURRENCY: 'currency',
    SECURITY_CODE: 'securityCode',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type ChangeBillingCurrencyForm = Form<
    InputID,
    {
        [INPUT_IDS.CURRENCY]: ValueOf<typeof CONST.PAYMENT_CARD_CURRENCY>;
        [INPUT_IDS.SECURITY_CODE]: string;
    }
>;

export type {ChangeBillingCurrencyForm};
export default INPUT_IDS;
