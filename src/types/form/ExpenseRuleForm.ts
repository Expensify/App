import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    BILLABLE: 'billable',
    CATEGORY: 'category',
    DESCRIPTION: 'comment',
    CREATE_REPORT: 'createReport',
    MERCHANT: 'merchantToMatch',
    RENAME_MERCHANT: 'merchant',
    REIMBURSABLE: 'reimbursable',
    REPORT: 'report',
    TAG: 'tag',
    TAX: 'tax',
} as const;

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

type ExpenseRuleFormFieldID = InputID;

export type {ExpenseRuleForm, ExpenseRuleFormFieldID};
export default INPUT_IDS;
