import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type UpdateZenefitsApprovalModeParams = {
    policyID: string;
    approvalMode: ValueOf<typeof CONST.ZENEFITS.APPROVAL_MODE>;
};

export default UpdateZenefitsApprovalModeParams;
