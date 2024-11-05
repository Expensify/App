import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type UpdateNetSuiteAccountingMethodParams = {
    policyID: string;
    accountingMethod: ValueOf<typeof CONST.NETSUITE_ACCOUNTING_METHODS>;
};

export default UpdateNetSuiteAccountingMethodParams;
