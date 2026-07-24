import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type UpdateZenefitsApprovalModeParams = {
    policyID: string;
    approvalMode: ValueOf<typeof CONST.ZENEFITS.APPROVAL_MODE>;
};

export default UpdateZenefitsApprovalModeParams;
