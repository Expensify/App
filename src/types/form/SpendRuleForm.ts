import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type Form from './Form';

const INPUT_IDS = {
    CARD_IDS: 'cardIDs',
    RESTRICTION_ACTION: 'restrictionAction',
    MERCHANT_NAMES: 'merchantNames',
    MERCHANT_MATCH_TYPES: 'merchantMatchTypes',
    CATEGORIES: 'categories',
    MAX_AMOUNT: 'maxAmount',
    CURRENCIES: 'currencies',
} as const;

type SpendRuleCategory = ValueOf<typeof CONST.SPEND_RULES.CATEGORIES>;
const SPEND_RULE_CATEGORIES = Object.values(CONST.SPEND_RULES.CATEGORIES) as SpendRuleCategory[];

type InputID = ValueOf<typeof INPUT_IDS>;

function isSpendRuleCategory(category: unknown): category is SpendRuleCategory {
    return typeof category === 'string' && SPEND_RULE_CATEGORIES.includes(category as SpendRuleCategory);
}

type SpendRuleForm = Form<
    InputID,
    {
        [INPUT_IDS.CARD_IDS]: string[];
        [INPUT_IDS.RESTRICTION_ACTION]: ValueOf<typeof CONST.SPEND_RULES.ACTION>;
        [INPUT_IDS.MERCHANT_NAMES]: string[];
        [INPUT_IDS.MERCHANT_MATCH_TYPES]: Array<ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>>;
        [INPUT_IDS.CATEGORIES]: SpendRuleCategory[];
        [INPUT_IDS.CURRENCIES]: string[];
        [INPUT_IDS.MAX_AMOUNT]: string;
    }
>;

export {SPEND_RULE_CATEGORIES, isSpendRuleCategory};
export type {SpendRuleForm, SpendRuleCategory};
