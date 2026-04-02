import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type Form from './Form';

const INPUT_IDS = CONST.SPEND_RULES.FORM.FIELDS;

type InputID = ValueOf<typeof INPUT_IDS>;

type SpendRuleForm = Form<
    InputID,
    {
        [INPUT_IDS.CARD_IDS]: string[];
        [INPUT_IDS.RESTRICTION_ACTION]: ValueOf<typeof CONST.SPEND_RULES.ACTION>;
        [INPUT_IDS.MERCHANT_NAMES]: string[];
        [INPUT_IDS.MERCHANT_MATCH_TYPES]: Array<ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>>;
        [INPUT_IDS.CATEGORIES]: string[];
        [INPUT_IDS.MAX_AMOUNT]: string;
    }
>;

export type {InputID, SpendRuleForm};
export default INPUT_IDS;
