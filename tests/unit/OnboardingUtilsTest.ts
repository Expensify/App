import CONST from '@src/CONST';
import {getVisibleJoinablePoliciesCount} from '@src/libs/OnboardingUtils';
import type {JoinablePolicies} from '@src/types/onyx';
import type {JoinablePolicy} from '@src/types/onyx/JoinablePolicies';

function createJoinablePolicy(policyID: string, policyType: JoinablePolicy['policyType']): JoinablePolicy {
    return {
        policyID,
        policyType,
        policyOwner: `${policyID}@example.com`,
        policyName: `Workspace ${policyID}`,
        employeeCount: 1,
        hasPendingAccess: false,
        automaticJoiningEnabled: false,
    };
}

describe('getVisibleJoinablePoliciesCount', () => {
    it('returns 0 for undefined or empty joinable policies', () => {
        expect(getVisibleJoinablePoliciesCount(undefined, false)).toBe(0);
        expect(getVisibleJoinablePoliciesCount({}, false)).toBe(0);
    });

    it('counts non-SUBMIT policies regardless of the SUBMIT_2026 beta', () => {
        const joinablePolicies: JoinablePolicies = {
            a: createJoinablePolicy('a', CONST.POLICY.TYPE.TEAM),
            b: createJoinablePolicy('b', CONST.POLICY.TYPE.CORPORATE),
        };
        expect(getVisibleJoinablePoliciesCount(joinablePolicies, false)).toBe(2);
        expect(getVisibleJoinablePoliciesCount(joinablePolicies, true)).toBe(2);
    });

    // Repro guard: SUBMIT policies are hidden while the beta is off, so a user whose only joinable policies are
    // SUBMIT must not get a phantom WORKSPACES step (inflated counter + blank back navigation from EMPLOYEES).
    it('hides SUBMIT policies when the SUBMIT_2026 beta is disabled', () => {
        const joinablePolicies: JoinablePolicies = {
            a: createJoinablePolicy('a', CONST.POLICY.TYPE.SUBMIT),
            b: createJoinablePolicy('b', CONST.POLICY.TYPE.SUBMIT),
        };
        expect(getVisibleJoinablePoliciesCount(joinablePolicies, false)).toBe(0);
    });

    it('counts SUBMIT policies when the SUBMIT_2026 beta is enabled', () => {
        const joinablePolicies: JoinablePolicies = {
            a: createJoinablePolicy('a', CONST.POLICY.TYPE.SUBMIT),
            b: createJoinablePolicy('b', CONST.POLICY.TYPE.SUBMIT),
        };
        expect(getVisibleJoinablePoliciesCount(joinablePolicies, true)).toBe(2);
    });

    it('counts only the visible policies in a mixed set when the beta is off', () => {
        const joinablePolicies: JoinablePolicies = {
            a: createJoinablePolicy('a', CONST.POLICY.TYPE.TEAM),
            b: createJoinablePolicy('b', CONST.POLICY.TYPE.SUBMIT),
            c: createJoinablePolicy('c', CONST.POLICY.TYPE.CORPORATE),
        };
        expect(getVisibleJoinablePoliciesCount(joinablePolicies, false)).toBe(2);
        expect(getVisibleJoinablePoliciesCount(joinablePolicies, true)).toBe(3);
    });
});
