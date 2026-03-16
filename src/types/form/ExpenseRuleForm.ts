import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type Form from './Form';

const INPUT_IDS = CONST.EXPENSE_RULES.FIELDS;

type InputID = ValueOf<typeof INPUT_IDS>;

type ExpenseRuleForm = Form<
    InputID,
    {
        [INPUT_IDS.BILLABLE]: 'true' | 'false';
        [INPUT_IDS.CATEGORY]: string;
        [INPUT_IDS.DESCRIPTION]: string;
        [INPUT_IDS.CREATE_REPORT]: boolean;
        [INPUT_IDS.RENAME_MERCHANT]: string;
        [INPUT_IDS.MERCHANT]: string;
        [INPUT_IDS.REIMBURSABLE]: 'true' | 'false';
        [INPUT_IDS.REPORT]: string;
        [INPUT_IDS.TAG]: string;
        [INPUT_IDS.TAX]: string;
    }
>;

export type {ExpenseRuleForm, InputID};
export default INPUT_IDS;
