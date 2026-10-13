import CONST from '@src/CONST';
import type {OnyxInputOrEntry, Policy} from '@src/types/onyx';

import type {TupleToUnion} from 'type-fest';

/**
 * Workspace roles from highest to lowest privilege, matching the role hierarchy in Auth.
 */
const POLICY_ROLE_RANKING = [
    CONST.POLICY.ROLE.ADMIN,
    CONST.POLICY.ROLE.PAYMENTS_ADMIN,
    CONST.POLICY.ROLE.CARD_ADMIN,
    CONST.POLICY.ROLE.PEOPLE_ADMIN,
    CONST.POLICY.ROLE.AUDITOR,
    CONST.POLICY.ROLE.EDITOR,
    CONST.POLICY.ROLE.USER,
    CONST.POLICY.ROLE.GUEST,
] as const;

/**
 * Returns the highest-privilege role held across the given policies.
 * Defaults to user when no ranked role is found, so a member on any workspace is not reported as a guest.
 */
function getHighestPolicyRole(policyList: Array<OnyxInputOrEntry<Pick<Policy, 'role'>>>): TupleToUnion<typeof POLICY_ROLE_RANKING> {
    const roles = new Set(policyList.map((policy) => policy?.role));
    for (const rankedRole of POLICY_ROLE_RANKING) {
        if (roles.has(rankedRole)) {
            return rankedRole;
        }
    }
    return CONST.POLICY.ROLE.USER;
}

export default getHighestPolicyRole;
