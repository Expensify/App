import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    MAX_EXPENSE_AUTO_PAY_AMOUNT: 'maxExpenseAutoPayAmount',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type RulesAutoPayReportsUnderModalForm = Form<
    InputID,
    {
        [INPUT_IDS.MAX_EXPENSE_AUTO_PAY_AMOUNT]: string;
    }
>;

export type {RulesAutoPayReportsUnderModalForm};
export default INPUT_IDS;
