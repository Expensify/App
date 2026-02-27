import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    MERCHANT: 'merchant',
    MONEY_REQUEST_MERCHANT: 'moneyRequestMerchant',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type MoneyRequestMerchantForm = Form<
    InputID,
    {
        [INPUT_IDS.MERCHANT]: string;
        [INPUT_IDS.MONEY_REQUEST_MERCHANT]: string;
    }
>;

export type {MoneyRequestMerchantForm};
export default INPUT_IDS;
