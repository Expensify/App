import {getPoliciesInScope, getUpgradeablePolicyIDsInScope, shouldUpsellControlPlan} from '@pages/Insights/dashboardSpecs';
import {getDashboardState, INSIGHTS_DASHBOARD_STATE} from '@pages/Insights/resolveDashboardState';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import createRandomPolicy from '../utils/collections/policies';

const LOGIN = 'user@example.com';
const SPEND = CONST.INSIGHTS.DASHBOARD.SPEND;
const COMPLIANCE = CONST.INSIGHTS.DASHBOARD.COMPLIANCE;
const ALL_WORKSPACES: string[] = [];

/** Builds a workspace on the given plan that the current user holds the given role on. */
function buildPolicy(index: number, type: ValueOf<typeof CONST.POLICY.TYPE>, role: ValueOf<typeof CONST.POLICY.ROLE> = CONST.POLICY.ROLE.ADMIN): Policy {
    return {...createRandomPolicy(index, type), id: String(index), role};
}

/** Keys the workspaces the way the policy collection stores them. */
function toCollection(policies: Policy[]): OnyxCollection<Policy> {
    return Object.fromEntries(policies.map((policy) => [`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy]));
}

/** Narrows the workspaces to the given filter the way the dashboard does before it checks the upsell. */
function inScope(policies: Policy[], policyIDs: string[] = ALL_WORKSPACES): Policy[] {
    return getPoliciesInScope(toCollection(policies), policyIDs);
}

describe('insights Control upsell', () => {
    describe('shouldUpsellControlPlan', () => {
        it('shows the upsell when no workspace in scope is on Control', () => {
            // Given a scope holding only Collect workspaces
            const policies = inScope([buildPolicy(1, CONST.POLICY.TYPE.TEAM), buildPolicy(2, CONST.POLICY.TYPE.TEAM)]);

            // When Compliance checks whether it can render
            // Then it has no Control workspace to draw from, so the upsell stands in for the charts
            expect(shouldUpsellControlPlan(COMPLIANCE, policies, ALL_WORKSPACES, LOGIN)).toBe(true);
        });

        it('keeps the charts when every workspace in scope is on Control', () => {
            // Given a scope holding only Control workspaces
            const policies = inScope([buildPolicy(1, CONST.POLICY.TYPE.CORPORATE), buildPolicy(2, CONST.POLICY.TYPE.CORPORATE)]);

            // When Compliance checks whether it can render
            // Then the data is available, so no upsell
            expect(shouldUpsellControlPlan(COMPLIANCE, policies, ALL_WORKSPACES, LOGIN)).toBe(false);
        });

        it('keeps the charts when a mixed scope holds at least one Control workspace', () => {
            // Given a scope mixing a Collect workspace with a Control one
            const policies = inScope([buildPolicy(1, CONST.POLICY.TYPE.TEAM), buildPolicy(2, CONST.POLICY.TYPE.CORPORATE)]);

            // When Compliance checks whether it can render
            // Then one Control workspace is enough to have something to chart
            expect(shouldUpsellControlPlan(COMPLIANCE, policies, ALL_WORKSPACES, LOGIN)).toBe(false);
        });

        it('ignores Control workspaces the filter leaves out of scope', () => {
            // Given a Control workspace that the workspace filter excludes
            const policies = inScope([buildPolicy(1, CONST.POLICY.TYPE.TEAM), buildPolicy(2, CONST.POLICY.TYPE.CORPORATE)], ['1']);

            // When only the Collect workspace is in scope
            // Then the out-of-scope Control workspace doesn't count, so the upsell shows
            expect(shouldUpsellControlPlan(COMPLIANCE, policies, ['1'], LOGIN)).toBe(true);
        });

        it('keeps the usual states when every workspace the filter selects has left Onyx', () => {
            // Given a Control workspace and a stored filter holding only a workspace the user has since left
            const policies = inScope([buildPolicy(1, CONST.POLICY.TYPE.CORPORATE)], ['99']);

            // When Compliance checks whether it can render
            // Then the stale filter says nothing about the user's plans, so no upsell
            expect(shouldUpsellControlPlan(COMPLIANCE, policies, ['99'], LOGIN)).toBe(false);
        });

        it('still shows the upsell when the filter mixes a left workspace with a Collect one', () => {
            // Given a stored filter holding a workspace the user has left and a Collect workspace
            const policies = inScope([buildPolicy(1, CONST.POLICY.TYPE.TEAM), buildPolicy(2, CONST.POLICY.TYPE.CORPORATE)], ['1', '99']);

            // When Compliance checks whether it can render
            // Then the workspace still in scope has no Control plan, so the upsell shows
            expect(shouldUpsellControlPlan(COMPLIANCE, policies, ['1', '99'], LOGIN)).toBe(true);
        });

        it('never shows the upsell on a dashboard that does not require Control', () => {
            // Given a scope with no Control workspace at all
            const policies = inScope([buildPolicy(1, CONST.POLICY.TYPE.TEAM)]);

            // When Spend checks whether it can render, having declared no requiresControlPlan
            // Then it charts fine on any plan
            expect(shouldUpsellControlPlan(SPEND, policies, ALL_WORKSPACES, LOGIN)).toBe(false);
        });

        it('shows the upsell when the scope is empty', () => {
            // Given an account with no workspaces
            // When Compliance checks whether it can render
            // Then there is no Control workspace to draw from
            expect(shouldUpsellControlPlan(COMPLIANCE, inScope([]), ALL_WORKSPACES, LOGIN)).toBe(true);
        });

        it('shows the upsell when the only Control workspace is one the user cannot see every member of', () => {
            // Given an administered Collect workspace, which is what opens the dashboard, next to a Control one the
            // user is only a member of
            const policies = inScope([buildPolicy(1, CONST.POLICY.TYPE.TEAM), buildPolicy(2, CONST.POLICY.TYPE.CORPORATE, CONST.POLICY.ROLE.USER)]);

            // When Compliance checks whether it can render
            // Then the Control workspace charts nothing for this user, so withholding the upsell would leave the page blank
            expect(shouldUpsellControlPlan(COMPLIANCE, policies, ALL_WORKSPACES, LOGIN)).toBe(true);
        });

        it('keeps the charts when an auditor can see every member of the Control workspace', () => {
            // Given a Control workspace the user audits rather than administers
            const policies = inScope([buildPolicy(1, CONST.POLICY.TYPE.CORPORATE, CONST.POLICY.ROLE.AUDITOR)]);

            // When Compliance checks whether it can render
            // Then an auditor sees every member's data, so there is something to chart
            expect(shouldUpsellControlPlan(COMPLIANCE, policies, ALL_WORKSPACES, LOGIN)).toBe(false);
        });

        it('shows the upsell when the only Control workspace is archived', () => {
            // Given an administered Control workspace that has been archived
            const policies = inScope([{...buildPolicy(1, CONST.POLICY.TYPE.CORPORATE), archivedDate: '2026-01-01'}]);

            // When Compliance checks whether it can render
            // Then an archived workspace contributes no data, so the upsell stands in
            expect(shouldUpsellControlPlan(COMPLIANCE, policies, ALL_WORKSPACES, LOGIN)).toBe(true);
        });

        it('shows the upsell when the only Control workspace is being deleted', () => {
            // Given an administered Control workspace whose delete is still in flight, which only sets pendingAction
            const policies = inScope([{...buildPolicy(1, CONST.POLICY.TYPE.CORPORATE), pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}]);

            // When Compliance checks whether it can render
            // Then a workspace on its way out is no reason to withhold the upsell
            expect(shouldUpsellControlPlan(COMPLIANCE, policies, ALL_WORKSPACES, LOGIN)).toBe(true);
        });
    });

    describe('getUpgradeablePolicyIDsInScope', () => {
        it('names the one workspace in scope the user could upgrade', () => {
            // Given exactly one upgradeable workspace the user administers, alongside one they are only a member of
            const policies = inScope([buildPolicy(1, CONST.POLICY.TYPE.TEAM), buildPolicy(2, CONST.POLICY.TYPE.TEAM, CONST.POLICY.ROLE.USER)]);

            // When the CTA works out where to send them
            // Then only the workspace they can actually act on qualifies, so the CTA pre-selects it
            expect(getUpgradeablePolicyIDsInScope(policies, LOGIN)).toEqual(['1']);
        });

        it('names every workspace when several qualify', () => {
            // Given two upgradeable workspaces the user administers
            const policies = inScope([buildPolicy(1, CONST.POLICY.TYPE.TEAM), buildPolicy(2, CONST.POLICY.TYPE.TEAM)]);

            // When the CTA works out where to send them
            // Then both qualify, so the CTA sends them to the workspace list to pick one
            expect(getUpgradeablePolicyIDsInScope(policies, LOGIN)).toEqual(['1', '2']);
        });

        it('names none when the user administers none of them', () => {
            // Given upgradeable workspaces the user is only a member of
            const policies = inScope([buildPolicy(1, CONST.POLICY.TYPE.TEAM, CONST.POLICY.ROLE.USER), buildPolicy(2, CONST.POLICY.TYPE.TEAM, CONST.POLICY.ROLE.USER)]);

            // When the CTA works out where to send them
            // Then none qualify, so the CTA is hidden rather than leading to a not-found page
            expect(getUpgradeablePolicyIDsInScope(policies, LOGIN)).toEqual([]);
        });

        it('names none for an auditor, who can view the dashboard but not upgrade', () => {
            // Given a Collect workspace the user audits rather than administers
            const policies = inScope([buildPolicy(1, CONST.POLICY.TYPE.TEAM, CONST.POLICY.ROLE.AUDITOR)]);

            // When the CTA works out where to send them
            // Then none qualify, because the upgrade page would turn an auditor away
            expect(getUpgradeablePolicyIDsInScope(policies, LOGIN)).toEqual([]);
        });

        it('names none when the only workspace the user could upgrade is outside the filter', () => {
            // Given an administered Collect workspace that the filter excludes, and a Collect one in scope the user is only a member of
            const policies = inScope([buildPolicy(1, CONST.POLICY.TYPE.TEAM), buildPolicy(2, CONST.POLICY.TYPE.TEAM, CONST.POLICY.ROLE.USER)], ['2']);

            // When the CTA works out where to send them
            // Then none qualify, so the CTA never asks them to upgrade a workspace the dashboard isn't showing
            expect(getUpgradeablePolicyIDsInScope(policies, LOGIN)).toEqual([]);
        });

        it('does not count ownership alone, because the upgrade page gates on editing rights', () => {
            // Given the user owns the one upgradeable workspace in scope but is not an admin of it
            const policies = inScope([{...buildPolicy(1, CONST.POLICY.TYPE.TEAM, CONST.POLICY.ROLE.USER), owner: LOGIN}]);

            // When the CTA works out where to send them
            // Then none qualify, since ownership on its own does not get them into the upgrade page
            expect(getUpgradeablePolicyIDsInScope(policies, LOGIN)).toEqual([]);
        });

        it('skips a workspace that is being deleted, which the upsell check already discounts', () => {
            // Given the only administered Collect workspace has a delete in flight, next to one the user is only a member of
            const policies = inScope([
                {...buildPolicy(1, CONST.POLICY.TYPE.TEAM), pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
                buildPolicy(2, CONST.POLICY.TYPE.TEAM, CONST.POLICY.ROLE.USER),
            ]);

            // When the CTA works out where to send them
            // Then none qualify, so the CTA never starts an upgrade on a workspace that is on its way out
            expect(getUpgradeablePolicyIDsInScope(policies, LOGIN)).toEqual([]);
        });

        it('skips workspaces already on Control', () => {
            // Given an administered Control workspace next to an administered Collect one
            const policies = inScope([buildPolicy(1, CONST.POLICY.TYPE.CORPORATE), buildPolicy(2, CONST.POLICY.TYPE.TEAM)]);

            // When the CTA works out where to send them
            // Then only the workspace that has somewhere to upgrade to qualifies
            expect(getUpgradeablePolicyIDsInScope(policies, LOGIN)).toEqual(['2']);
        });

        it('skips the personal workspace, which has no plan to upgrade', () => {
            // Given a personal workspace alongside the one upgradeable group workspace
            const policies = inScope([buildPolicy(1, CONST.POLICY.TYPE.PERSONAL), buildPolicy(2, CONST.POLICY.TYPE.TEAM)]);

            // When the CTA works out where to send them
            // Then the personal workspace doesn't count, so only the group one qualifies
            expect(getUpgradeablePolicyIDsInScope(policies, LOGIN)).toEqual(['2']);
        });

        it('counts a free Submit workspace, which can still be upgraded', () => {
            // Given the one workspace in scope the user can edit is on the free Submit plan
            const policies = inScope([buildPolicy(1, CONST.POLICY.TYPE.TEAM, CONST.POLICY.ROLE.USER), buildPolicy(2, CONST.POLICY.TYPE.SUBMIT)]);

            // When the CTA works out where to send them
            // Then Submit qualifies, because the upgrade flow accepts it rather than only paid plans
            expect(getUpgradeablePolicyIDsInScope(policies, LOGIN)).toEqual(['2']);
        });
    });

    describe('getDashboardState', () => {
        it('shows the upsell ahead of every data-driven state', () => {
            // Given a dashboard that has nothing to show regardless of the request, while offline and with no response in
            // When the state is resolved
            // Then the upsell wins, so the user never waits on a request or lands on the offline blocker
            expect(getDashboardState(undefined, true, [], true)).toBe(INSIGHTS_DASHBOARD_STATE.UPSELL);
        });

        it('falls through to the usual states when the upsell does not apply', () => {
            // Given the same dashboard with a Control workspace in scope
            // When the state is resolved
            // Then the offline blocker still takes over, as it did before the upsell existed
            expect(getDashboardState(undefined, true, [], false)).toBe(INSIGHTS_DASHBOARD_STATE.OFFLINE);
        });
    });
});
