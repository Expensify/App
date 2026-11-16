import {createEligiblePolicyIdMapper} from '@hooks/useOutstandingReports';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import createRandomPolicy from '../utils/collections/policies';
import createMock from '../utils/createMock';

describe('createEligiblePolicyIdMapper', () => {
    const ownerLogin = 'owner@example.com';

    it('keeps a workspace the owner can create expenses on', () => {
        // Given a workspace where the owner can create expenses
        // When the policy is mapped to an eligible ID
        // Then the workspace ID is kept, so its reports stay available as a destination
        const policy = createMock<Policy>({...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE), role: CONST.POLICY.ROLE.USER});

        expect(createEligiblePolicyIdMapper(ownerLogin)(policy)).toBe(policy.id);
    });

    it('drops a workspace the owner cannot create expenses on', () => {
        // Given an approve-only workspace
        // When the policy is mapped to an eligible ID
        // Then it maps to null, so its reports are never offered as a destination
        const policy = createMock<Policy>({...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE), role: CONST.POLICY.ROLE.APPROVE_ONLY});

        expect(createEligiblePolicyIdMapper(ownerLogin)(policy)).toBeNull();
    });

    it('resolves the owner role from the employee list', () => {
        // Given a policy whose role for the owner lives in the employee list
        // When the policy is mapped to an eligible ID
        // Then the owner's approve-only role is resolved, not the missing top-level role
        const policy = createMock<Policy>({
            ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
            role: undefined,
            employeeList: {[ownerLogin]: {email: ownerLogin, role: CONST.POLICY.ROLE.APPROVE_ONLY}},
        });

        expect(createEligiblePolicyIdMapper(ownerLogin)(policy)).toBeNull();
    });

    it('drops an undefined policy', () => {
        // Given no policy data
        // When the policy is mapped to an eligible ID
        // Then it maps to null instead of throwing
        expect(createEligiblePolicyIdMapper(ownerLogin)(undefined)).toBeNull();
    });
});
