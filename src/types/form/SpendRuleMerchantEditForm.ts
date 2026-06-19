import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    MERCHANT_NAME: 'merchantName',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type SpendRuleMerchantEditForm = Form<InputID, {merchantName: string}>;

export type {SpendRuleMerchantEditForm};
export default INPUT_IDS;
