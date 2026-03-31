import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type Form from './Form';

const INPUT_IDS = CONST.SPEND_RULE_FORM.FIELDS;

type InputID = ValueOf<typeof INPUT_IDS>;

type SpendRuleMerchant = {
    name: string;
    matchType: ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>;
};

type SpendRuleForm = Form<
    InputID,
    {
        [INPUT_IDS.CARD_IDS]: string[];
        [INPUT_IDS.RESTRICTION_ACTION]: ValueOf<typeof CONST.SPEND_CARD_RULE.ACTION>;
        [INPUT_IDS.MERCHANTS]: SpendRuleMerchant[];
        [INPUT_IDS.CATEGORIES]: string[];
    }
>;

export type {InputID, SpendRuleForm, SpendRuleMerchant};
export default INPUT_IDS;
