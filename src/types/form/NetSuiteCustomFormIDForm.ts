import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type Form from './Form';

type InputID = ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>;

type NetSuiteCustomFormIDForm = Form<
    InputID,
    {
        [CONST.NETSUITE_EXPENSE_TYPE.REIMBURSABLE]: string;
        [CONST.NETSUITE_EXPENSE_TYPE.NON_REIMBURSABLE]: string;
    }
>;

// eslint-disable-next-line import/prefer-default-export
export type {NetSuiteCustomFormIDForm};
