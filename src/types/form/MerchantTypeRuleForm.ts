import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type Form from './Form';

const INPUT_IDS = CONST.MERCHANT_TYPE_RULE.FIELDS;

type InputID = ValueOf<typeof INPUT_IDS>;

type MerchantTypeRuleForm = Form<
    InputID,
    {
        [INPUT_IDS.GROUP_ID]: string;
        [INPUT_IDS.CATEGORY]: string;
    }
>;

// eslint-disable-next-line import/prefer-default-export
export type {MerchantTypeRuleForm};
