import INSIGHTS_DASHBOARD_SPECS, {getAccessibleDashboards, getPoliciesInScope, getVisibleCharts} from '@pages/Insights/dashboardSpecs';
import {canViewAllPolicyData, hasMultipleMembers} from '@pages/Insights/insightsAccess';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Beta, Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import createRandomPolicy from '../utils/collections/policies';

const LOGIN = 'user@example.com';
const SPEND = CONST.INSIGHTS.DASHBOARD.SPEND;
const COMPLIANCE = CONST.INSIGHTS.DASHBOARD.COMPLIANCE;
const EFFICIENCY = CONST.INSIGHTS.DASHBOARD.EFFICIENCY;

/** Builds a workspace the current user holds the given role on. */
function buildPolicy(index: number, role: ValueOf<typeof CONST.POLICY.ROLE>, type: ValueOf<typeof CONST.POLICY.TYPE> = CONST.POLICY.TYPE.TEAM): Policy {
    return {...createRandomPolicy(index, type), id: String(index), role};
}

/** Gives a workspace the given number of members. */
function withMembers(policy: Policy, memberCount: number): Policy {
    const employeeList = Object.fromEntries(Array.from({length: memberCount}, (_, index) => [`member${index}@example.com`, {email: `member${index}@example.com`}]));
    return {...policy, employeeList};
}

/** Keys the workspaces the way the policy collection stores them. */
function toCollection(policies: Policy[]): OnyxCollection<Policy> {
    return Object.fromEntries(policies.map((policy) => [`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy]));
}

const COMPLIANCE_SPEC = INSIGHTS_DASHBOARD_SPECS[COMPLIANCE];
const SUBMITTER_CHART = CONST.INSIGHTS.GRAPH.VIOLATIONS_BY_SUBMITTER;
const APPROVER_CHART = CONST.INSIGHTS.GRAPH.VIOLATIONS_BY_APPROVER;

/** Returns the graph keys of the Compliance supporting charts the given workspaces make visible. */
function getVisibleComplianceCharts(policies: Policy[], policyIDs: string[] = []) {
    return getVisibleCharts(COMPLIANCE_SPEC.supportingCharts, getPoliciesInScope(toCollection(policies), policyIDs), LOGIN, COMPLIANCE_SPEC.isPolicyEligible).map(({graphKey}) => graphKey);
}

const isComplianceBetaEnabled = (beta: Beta) => beta === CONST.BETAS.INSIGHTS_COMPLIANCE;
const isEfficiencyBetaEnabled = (beta: Beta) => beta === CONST.BETAS.INSIGHTS_EFFICIENCY;
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

        it('hides Compliance once its only qualifying workspace is deleted offline', () => {
            // Given an admin with the beta whose only workspace is waiting for the server to confirm its deletion
            const policies = toCollection([{...buildPolicy(1, CONST.POLICY.ROLE.ADMIN), pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}]);

            // When the dashboards they can open are resolved
            const dashboards = getAccessibleDashboards(policies, LOGIN, isComplianceBetaEnabled);

            // Then Compliance is gone right away, instead of turning into a not-found page on reconnect
            expect(dashboards).toEqual([SPEND]);
        });

        it('offers Efficiency to admins and auditors with the beta, on every plan', () => {
            // Given an admin of a Collect workspace and an auditor of a Control workspace, both with the beta
            const adminPolicies = toCollection([buildPolicy(1, CONST.POLICY.ROLE.ADMIN, CONST.POLICY.TYPE.TEAM)]);
            const auditorPolicies = toCollection([buildPolicy(1, CONST.POLICY.ROLE.AUDITOR, CONST.POLICY.TYPE.CORPORATE)]);

            // When the dashboards they can open are resolved
            // Then both get Spend followed by Efficiency, since no plan is required
            expect(getAccessibleDashboards(adminPolicies, LOGIN, isEfficiencyBetaEnabled)).toEqual([SPEND, EFFICIENCY]);
            expect(getAccessibleDashboards(auditorPolicies, LOGIN, isEfficiencyBetaEnabled)).toEqual([SPEND, EFFICIENCY]);
        });

        it('hides Efficiency from members who are neither admin nor auditor', () => {
            // Given a user with the beta who is only a regular member of their workspace
            const policies = toCollection([buildPolicy(1, CONST.POLICY.ROLE.USER)]);

            // When the dashboards they can open are resolved
            const dashboards = getAccessibleDashboards(policies, LOGIN, isEfficiencyBetaEnabled);

            // Then only Spend is offered, since they can't see how long other members' reports take
            expect(dashboards).toEqual([SPEND]);
        });
    });
    describe('hasMultipleMembers', () => {
        it('qualifies a workspace with at least two members to compare', () => {
            // Given a workspace with two members
            const policy = withMembers(buildPolicy(1, CONST.POLICY.ROLE.ADMIN), 2);

            // When it is checked
            // Then it qualifies, since a member ranking has someone to compare against
            expect(hasMultipleMembers(policy)).toBe(true);
        });

        it('leaves out a workspace with a single member or no member list', () => {
            // Given a workspace the user is the only member of, and one whose members haven't loaded
            const singleMemberPolicy = withMembers(buildPolicy(1, CONST.POLICY.ROLE.ADMIN), 1);
            const policyWithoutMembers = buildPolicy(2, CONST.POLICY.ROLE.ADMIN);

            // When they are checked
            // Then neither qualifies, so a ranking never lists the user alone
            expect(hasMultipleMembers(singleMemberPolicy)).toBe(false);
            expect(hasMultipleMembers(policyWithoutMembers)).toBe(false);
        });
    });

    describe('getVisibleCharts', () => {
        it('shows the member charts when an administered workspace has members to compare and approvals', () => {
            // Given a workspace the user administers, with two members and approvals turned on
            const policy = {...withMembers(buildPolicy(1, CONST.POLICY.ROLE.ADMIN), 2), approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC};

            // When the Compliance charts to show are resolved
            const charts = getVisibleComplianceCharts([policy]);

            // Then both the submitter and the approver rankings are shown
            expect(charts).toContain(SUBMITTER_CHART);
            expect(charts).toContain(APPROVER_CHART);
        });

        it('hides the approver chart when the administered workspace has approvals turned off', () => {
            // Given a workspace the user administers, with two members but optional approvals
            const policy = {...withMembers(buildPolicy(1, CONST.POLICY.ROLE.ADMIN), 2), approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL};

            // When the Compliance charts to show are resolved
            const charts = getVisibleComplianceCharts([policy]);

            // Then only the submitter ranking is shown, since there are no approvers to rank
            expect(charts).toContain(SUBMITTER_CHART);
            expect(charts).not.toContain(APPROVER_CHART);
        });

        it('ignores workspaces the user cannot review, even when they have members to compare', () => {
            // Given a user who administers a workspace they are alone in, and is a regular member of a shared one with approvals
            const administeredPolicy = withMembers(buildPolicy(1, CONST.POLICY.ROLE.ADMIN), 1);
            const memberPolicy = {...withMembers(buildPolicy(2, CONST.POLICY.ROLE.USER), 2), approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC};

            // When the Compliance charts to show are resolved
            const charts = getVisibleComplianceCharts([administeredPolicy, memberPolicy]);

            // Then neither member ranking is shown, since Compliance only reports on workspaces the user administers or audits
            expect(charts).not.toContain(SUBMITTER_CHART);
            expect(charts).not.toContain(APPROVER_CHART);
        });

        it('only counts the workspaces selected in the filter', () => {
            // Given an administered workspace with members to compare and another the user is alone in
            const sharedPolicy = {...withMembers(buildPolicy(1, CONST.POLICY.ROLE.ADMIN), 2), approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC};
            const soloPolicy = withMembers(buildPolicy(2, CONST.POLICY.ROLE.ADMIN), 1);

            // When the filter is narrowed to the workspace the user is alone in
            const charts = getVisibleComplianceCharts([sharedPolicy, soloPolicy], [soloPolicy.id]);

            // Then the member rankings are hidden, since the selected workspace has no one to compare
            expect(charts).not.toContain(SUBMITTER_CHART);
            expect(charts).not.toContain(APPROVER_CHART);
        });

        it('keeps the charts that declare no eligibility', () => {
            // Given a user who administers a workspace they are alone in
            const policy = withMembers(buildPolicy(1, CONST.POLICY.ROLE.ADMIN), 1);

            // When the Compliance charts to show are resolved
            const charts = getVisibleComplianceCharts([policy]);

            // Then Top violations is still shown, since it doesn't depend on the workspace setup
            expect(charts).toEqual([CONST.INSIGHTS.GRAPH.TOP_VIOLATIONS]);
        });
    });
});
