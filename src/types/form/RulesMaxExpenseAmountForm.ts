import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    MAX_EXPENSE_AMOUNT: 'maxExpenseAmount',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type RulesMaxExpenseAmountForm = Form<
    InputID,
    {
        [INPUT_IDS.MAX_EXPENSE_AMOUNT]: string;
    }
>;

export type {RulesMaxExpenseAmountForm};
export default INPUT_IDS;
