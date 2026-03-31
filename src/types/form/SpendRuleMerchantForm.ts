import type Form from './Form';

const INPUT_IDS = {
    MERCHANT_NAME: 'merchantName',
} as const;

type InputID = (typeof INPUT_IDS)[keyof typeof INPUT_IDS];

type SpendRuleMerchantForm = Form<
    InputID,
    {
        [INPUT_IDS.MERCHANT_NAME]: string;
    }
>;

export type {InputID, SpendRuleMerchantForm};
export default INPUT_IDS;
