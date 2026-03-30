import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type Form from './Form';

const INPUT_IDS = CONST.SPEND_RULE_FORM.FIELDS;

type InputID = ValueOf<typeof INPUT_IDS>;

type SpendRuleForm = Form<
    InputID,
    {
        [INPUT_IDS.CARD_IDS]: string[];
    }
>;

export type {InputID, SpendRuleForm};
export default INPUT_IDS;
