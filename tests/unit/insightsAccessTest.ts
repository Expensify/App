import {getAccessibleDashboards} from '@pages/Insights/dashboardSpecs';
import {canViewAllPolicyData} from '@pages/Insights/insightsAccess';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Beta, Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import createRandomPolicy from '../utils/collections/policies';

const LOGIN = 'user@example.com';
const SPEND = CONST.INSIGHTS.DASHBOARD.SPEND;
const COMPLIANCE = CONST.INSIGHTS.DASHBOARD.COMPLIANCE;

/** Builds a workspace the current user holds the given role on. */
function buildPolicy(index: number, role: ValueOf<typeof CONST.POLICY.ROLE>, type: ValueOf<typeof CONST.POLICY.TYPE> = CONST.POLICY.TYPE.TEAM): Policy {
    return {...createRandomPolicy(index, type), id: String(index), role};
}

/** Keys the workspaces the way the policy collection stores them. */
function toCollection(policies: Policy[]): OnyxCollection<Policy> {
    return Object.fromEntries(policies.map((policy) => [`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy]));
}

const isComplianceBetaEnabled = (beta: Beta) => beta === CONST.BETAS.INSIGHTS_COMPLIANCE;
const isNoBetaEnabled = () => false;

describe('insightsAccess', () => {
    describe('canViewAllPolicyData', () => {
        it('lets admins and auditors view all of the workspace data', () => {
            // Given a workspace the user administers and one they audit
            const adminPolicy = buildPolicy(1, CONST.POLICY.ROLE.ADMIN);
            const auditorPolicy = buildPolicy(2, CONST.POLICY.ROLE.AUDITOR);

            // When their access is checked
            // Then both roles can see every member's data
            expect(canViewAllPolicyData(adminPolicy, LOGIN)).toBe(true);
            expect(canViewAllPolicyData(auditorPolicy, LOGIN)).toBe(true);
        });

        it('keeps other members from viewing all of the workspace data', () => {
            // Given a workspace the user is a regular member of
            const memberPolicy = buildPolicy(1, CONST.POLICY.ROLE.USER);

            // When their access is checked
            // Then they can only see their own data, so the workspace doesn't qualify
            expect(canViewAllPolicyData(memberPolicy, LOGIN)).toBe(false);
        });

        it('leaves out personal workspaces', () => {
            // Given a personal workspace, which the user always administers
            const personalPolicy = buildPolicy(1, CONST.POLICY.ROLE.ADMIN, CONST.POLICY.TYPE.PERSONAL);

            // When their access is checked
            // Then it doesn't qualify, since it has no other members' data to review
            expect(canViewAllPolicyData(personalPolicy, LOGIN)).toBe(false);
        });
    });

    describe('getAccessibleDashboards', () => {
        it('hides Compliance without the beta, even from admins', () => {
            // Given an admin of a workspace who doesn't have the compliance beta
            const policies = toCollection([buildPolicy(1, CONST.POLICY.ROLE.ADMIN)]);

            // When the dashboards they can open are resolved
            const dashboards = getAccessibleDashboards(policies, LOGIN, isNoBetaEnabled);

            // Then only Spend is offered, so the beta keeps Compliance out of production
            expect(dashboards).toEqual([SPEND]);
        });

        it('offers Compliance to admins and auditors with the beta', () => {
            // Given one user who administers a workspace and another who audits one, both with the beta
            const adminPolicies = toCollection([buildPolicy(1, CONST.POLICY.ROLE.ADMIN)]);
            const auditorPolicies = toCollection([buildPolicy(1, CONST.POLICY.ROLE.AUDITOR)]);

            // When the dashboards they can open are resolved
            // Then both get Spend followed by Compliance, in the order the tabs are shown
            expect(getAccessibleDashboards(adminPolicies, LOGIN, isComplianceBetaEnabled)).toEqual([SPEND, COMPLIANCE]);
            expect(getAccessibleDashboards(auditorPolicies, LOGIN, isComplianceBetaEnabled)).toEqual([SPEND, COMPLIANCE]);
        });

        it('hides Compliance from members who are neither admin nor auditor', () => {
            // Given a user with the beta who is only a regular member of their workspaces
            const policies = toCollection([buildPolicy(1, CONST.POLICY.ROLE.USER), buildPolicy(2, CONST.POLICY.ROLE.USER)]);

            // When the dashboards they can open are resolved
            const dashboards = getAccessibleDashboards(policies, LOGIN, isComplianceBetaEnabled);

            // Then only Spend is offered, since they can't review other members' violations
            expect(dashboards).toEqual([SPEND]);
        });

        it('offers Compliance when any of the workspaces qualifies, whatever the roles on the others', () => {
            // Given a user with the beta who administers one workspace and is a regular member of another
            const policies = toCollection([buildPolicy(1, CONST.POLICY.ROLE.ADMIN), buildPolicy(2, CONST.POLICY.ROLE.USER)]);

            // When the dashboards they can open are resolved
            const dashboards = getAccessibleDashboards(policies, LOGIN, isComplianceBetaEnabled);

            // Then Compliance is offered, so narrowing the workspace filter to the member one can't hide its tab
            expect(dashboards).toEqual([SPEND, COMPLIANCE]);
        });
    });
});
