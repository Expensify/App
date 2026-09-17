import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type UpdateGustoApprovalModeParams = {
    policyID: string;
    approvalMode: ValueOf<typeof CONST.GUSTO.APPROVAL_MODE>;
};

export default UpdateGustoApprovalModeParams;
