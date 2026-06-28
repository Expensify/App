import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {PolicyCategoryExpenseLimitType} from '@src/types/onyx/PolicyCategory';
import type Form from './Form';

const INPUT_IDS = CONST.FLAG_FOR_REVIEW_RULE.FIELDS;

type InputID = ValueOf<typeof INPUT_IDS>;

type FlagForReviewRuleForm = Form<
    InputID,
    {
        [INPUT_IDS.CATEGORY]: string;
        [INPUT_IDS.MAX_EXPENSE_AMOUNT]: string;
        [INPUT_IDS.EXPENSE_LIMIT_TYPE]: PolicyCategoryExpenseLimitType;
    }
>;

// eslint-disable-next-line import/prefer-default-export
export type {FlagForReviewRuleForm};
