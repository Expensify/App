import {getApprovalWorkflow, isGroupPolicy, isPolicyAdmin, isPolicyAuditor} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

/** Whether the user can see every member's data in the workspace. */
function canViewAllPolicyData(policy: Policy, login: string | undefined): boolean {
    return isGroupPolicy(policy) && (isPolicyAdmin(policy, login) || isPolicyAuditor(policy, login));
}

/** Whether the workspace has at least two members to compare. */
function hasMultipleMembers(policy: Policy): boolean {
    return Object.keys(policy.employeeList ?? {}).length >= 2;
}

/** Whether expenses in the workspace go through approval before they are closed. */
function hasApprovalsEnabled(policy: Policy): boolean {
    return getApprovalWorkflow(policy) !== CONST.POLICY.APPROVAL_MODE.OPTIONAL;
}

export {canViewAllPolicyData, hasApprovalsEnabled, hasMultipleMembers};
