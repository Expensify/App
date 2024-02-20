import type Form from './Form';

const INPUT_IDS = {
    MERCHANT: 'merchant',
    MONEY_REQUEST_MERCHANT: 'moneyRequestMerchant',
} as const;

type MoneyRequestMerchantForm = Form<{
    [INPUT_IDS.MERCHANT]: string;
    [INPUT_IDS.MONEY_REQUEST_MERCHANT]: string;
}>;

export type {MoneyRequestMerchantForm};
export default INPUT_IDS;
