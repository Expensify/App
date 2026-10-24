import {createEligiblePolicyIdMapper} from '@hooks/useOutstandingReports';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import createRandomPolicy from '../utils/collections/policies';
import createMock from '../utils/createMock';

describe('createEligiblePolicyIdMapper', () => {
    const ownerLogin = 'owner@example.com';

    it('keeps a workspace the owner can create expenses on', () => {
        const policy = createMock<Policy>({...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE), role: CONST.POLICY.ROLE.USER});

        expect(createEligiblePolicyIdMapper(ownerLogin)(policy)).toBe(policy.id);
    });

    it('drops a workspace the owner cannot create expenses on', () => {
        const policy = createMock<Policy>({...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE), role: CONST.POLICY.ROLE.APPROVE_ONLY});

        expect(createEligiblePolicyIdMapper(ownerLogin)(policy)).toBeNull();
    });

    it('resolves the owner role from the employee list', () => {
        const policy = createMock<Policy>({
            ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
            role: undefined,
            employeeList: {[ownerLogin]: {email: ownerLogin, role: CONST.POLICY.ROLE.APPROVE_ONLY}},
        });

        expect(createEligiblePolicyIdMapper(ownerLogin)(policy)).toBeNull();
    });

    it('drops an undefined policy', () => {
        expect(createEligiblePolicyIdMapper(ownerLogin)(undefined)).toBeNull();
    });
});
