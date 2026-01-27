import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type Form from './Form';

const INPUT_IDS = CONST.MERCHANT_RULES.FIELDS;

type InputID = ValueOf<typeof INPUT_IDS>;

type MerchantRuleForm = Form<
    InputID,
    {
        [INPUT_IDS.BILLABLE]: boolean;
        [INPUT_IDS.CATEGORY]: string;
        [INPUT_IDS.DESCRIPTION]: string;
        [INPUT_IDS.MERCHANT]: string;
        [INPUT_IDS.MERCHANT_TO_MATCH]: string;
        [INPUT_IDS.REIMBURSABLE]: boolean;
        [INPUT_IDS.TAG]: string;
        [INPUT_IDS.TAX]: string;
    }
>;

export type {MerchantRuleForm, InputID};
export default INPUT_IDS;
