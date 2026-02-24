import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    MAX_EXPENSE_AMOUNT: 'maxExpenseAmount',
    EXPENSE_LIMIT_TYPE: 'expenseLimitType',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type WorkspaceCategoryFlagAmountsOverForm = Form<
    InputID,
    {
        [INPUT_IDS.MAX_EXPENSE_AMOUNT]: string;
        [INPUT_IDS.EXPENSE_LIMIT_TYPE]: string;
    }
>;

export type {WorkspaceCategoryFlagAmountsOverForm};
export default INPUT_IDS;
