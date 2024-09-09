import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    MAX_EXPENSE_AUTO_APPROVAL_AMOUNT: 'maxExpenseAutoApprovalAmount',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type RulesAutoApproveReportsUnderModalForm = Form<
    InputID,
    {
        [INPUT_IDS.MAX_EXPENSE_AUTO_APPROVAL_AMOUNT]: string;
    }
>;

export type {RulesAutoApproveReportsUnderModalForm};
export default INPUT_IDS;
