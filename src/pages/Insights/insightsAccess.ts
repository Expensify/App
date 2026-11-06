import {isGroupPolicy, isPolicyAdmin, isPolicyAuditor} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

/** Whether the user can see every member's data in the workspace. */
function canViewAllPolicyData(policy: Policy, login: string | undefined): boolean {
    return isGroupPolicy(policy) && (isPolicyAdmin(policy, login) || isPolicyAuditor(policy, login));
}

/** Whether the workspace has at least two members to compare, ignoring those pending removal. */
function hasMultipleMembers(policy: Policy): boolean {
    return Object.values(policy.employeeList ?? {}).filter((employee) => employee.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length >= 2;
}

export {canViewAllPolicyData, hasMultipleMembers};
