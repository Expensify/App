import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type UpdateGustoApprovalModeParams = {
    policyID: string;
    approvalMode: ValueOf<typeof CONST.HR.APPROVAL_MODE>;
};

export default UpdateGustoApprovalModeParams;
