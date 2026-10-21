/** Predicates that decide which Insights dashboards and charts a workspace makes available to the current user. */

import {isGroupPolicy, isPolicyAdmin, isPolicyAuditor} from '@libs/PolicyUtils';

import type {Policy} from '@src/types/onyx';

/** Whether the user can see every member's data in the workspace, which admins and auditors can. */
function canViewAllPolicyData(policy: Policy, login: string | undefined): boolean {
    return isGroupPolicy(policy) && (isPolicyAdmin(policy, login) || isPolicyAuditor(policy, login));
}

// eslint-disable-next-line import/prefer-default-export -- more predicates are added here as the dashboards grow
export {canViewAllPolicyData};
