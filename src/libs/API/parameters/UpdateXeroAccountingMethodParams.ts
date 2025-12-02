import type {CONST as COMMON_CONST} from 'expensify-common';
import type {ValueOf} from 'type-fest';

type UpdateXeroAccountingMethodParams = {
    policyID: string;
    accountingMethod: ValueOf<typeof COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD>;
};

export default UpdateXeroAccountingMethodParams;
