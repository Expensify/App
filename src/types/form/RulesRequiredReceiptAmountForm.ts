import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    MAX_EXPENSE_AMOUNT_NO_RECEIPT: 'maxExpenseAmountNoReceipt',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type RulesRequiredReceiptAmountForm = Form<
    InputID,
    {
        [INPUT_IDS.MAX_EXPENSE_AMOUNT_NO_RECEIPT]: string;
    }
>;

export type {RulesRequiredReceiptAmountForm};
export default INPUT_IDS;
