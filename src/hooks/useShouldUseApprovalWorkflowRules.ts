import CONST from '@src/CONST';

import usePermissions from './usePermissions';

/**
 * Whether approval workflows are read from and saved as approval workflow rules, which the `MULTIPLE_APPROVERS` beta turns on.
 * A workflow whose employee settings send some reports where it doesn't keeps routing by them, see `hasApprovalWorkflowForks`.
 */
function useShouldUseApprovalWorkflowRules(): boolean {
    const {isBetaEnabled} = usePermissions();
    return isBetaEnabled(CONST.BETAS.MULTIPLE_APPROVERS);
}

export default useShouldUseApprovalWorkflowRules;
