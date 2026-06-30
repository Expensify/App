import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    GROUP_ID: 'groupID',
    CATEGORY: 'category',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type MerchantTypeRuleForm = Form<
    InputID,
    {
        [INPUT_IDS.GROUP_ID]: string;
        [INPUT_IDS.CATEGORY]: string;
    }
>;

export type {MerchantTypeRuleForm};
export default INPUT_IDS;
