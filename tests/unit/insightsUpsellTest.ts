import {getUpgradeablePolicyIDInScope, shouldUpsellControlPlan} from '@pages/Insights/dashboardSpecs';
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

describe('insights Control upsell', () => {
    describe('shouldUpsellControlPlan', () => {
        it('shows the upsell when no workspace in scope is on Control', () => {
            // Given a scope holding only Collect workspaces
            const policies = toCollection([buildPolicy(1, CONST.POLICY.TYPE.TEAM), buildPolicy(2, CONST.POLICY.TYPE.TEAM)]);

            // When Compliance checks whether it can render
            // Then it has no Control workspace to draw from, so the upsell stands in for the charts
            expect(shouldUpsellControlPlan(COMPLIANCE, policies, ALL_WORKSPACES)).toBe(true);
        });

        it('keeps the charts when every workspace in scope is on Control', () => {
            // Given a scope holding only Control workspaces
            const policies = toCollection([buildPolicy(1, CONST.POLICY.TYPE.CORPORATE), buildPolicy(2, CONST.POLICY.TYPE.CORPORATE)]);

            // When Compliance checks whether it can render
            // Then the data is available, so no upsell
            expect(shouldUpsellControlPlan(COMPLIANCE, policies, ALL_WORKSPACES)).toBe(false);
        });

        it('keeps the charts when a mixed scope holds at least one Control workspace', () => {
            // Given a scope mixing a Collect workspace with a Control one
            const policies = toCollection([buildPolicy(1, CONST.POLICY.TYPE.TEAM), buildPolicy(2, CONST.POLICY.TYPE.CORPORATE)]);

            // When Compliance checks whether it can render
            // Then one Control workspace is enough to have something to chart
            expect(shouldUpsellControlPlan(COMPLIANCE, policies, ALL_WORKSPACES)).toBe(false);
        });

        it('ignores Control workspaces the filter leaves out of scope', () => {
            // Given a Control workspace that the workspace filter excludes
            const policies = toCollection([buildPolicy(1, CONST.POLICY.TYPE.TEAM), buildPolicy(2, CONST.POLICY.TYPE.CORPORATE)]);

            // When only the Collect workspace is in scope
            // Then the out-of-scope Control workspace doesn't count, so the upsell shows
            expect(shouldUpsellControlPlan(COMPLIANCE, policies, ['1'])).toBe(true);
        });

        it('never shows the upsell on a dashboard that does not require Control', () => {
            // Given a scope with no Control workspace at all
            const policies = toCollection([buildPolicy(1, CONST.POLICY.TYPE.TEAM)]);

            // When Spend checks whether it can render, having declared no requiresControlPlan
            // Then it charts fine on any plan
            expect(shouldUpsellControlPlan(SPEND, policies, ALL_WORKSPACES)).toBe(false);
        });

        it('shows the upsell when the scope is empty', () => {
            // Given an account with no workspaces
            // When Compliance checks whether it can render
            // Then there is no Control workspace to draw from
            expect(shouldUpsellControlPlan(COMPLIANCE, {}, ALL_WORKSPACES)).toBe(true);
        });
    });

    describe('getUpgradeablePolicyIDInScope', () => {
        it('pre-selects the one workspace in scope the user could upgrade', () => {
            // Given exactly one upgradeable workspace the user administers, alongside one they are only a member of
            const policies = toCollection([buildPolicy(1, CONST.POLICY.TYPE.TEAM), buildPolicy(2, CONST.POLICY.TYPE.TEAM, CONST.POLICY.ROLE.USER)]);

            // When the CTA works out where to send them
            // Then it names the workspace they can actually act on
            expect(getUpgradeablePolicyIDInScope(policies, ALL_WORKSPACES, LOGIN)).toBe('1');
        });

        it('leaves the choice open when several workspaces qualify', () => {
            // Given two upgradeable workspaces the user administers
            const policies = toCollection([buildPolicy(1, CONST.POLICY.TYPE.TEAM), buildPolicy(2, CONST.POLICY.TYPE.TEAM)]);

            // When the CTA works out where to send them
            // Then it names none, so the upgrade flow asks which one
            expect(getUpgradeablePolicyIDInScope(policies, ALL_WORKSPACES, LOGIN)).toBeUndefined();
        });

        it('leaves the choice open when the user administers none of them', () => {
            // Given upgradeable workspaces the user is only a member of
            const policies = toCollection([buildPolicy(1, CONST.POLICY.TYPE.TEAM, CONST.POLICY.ROLE.USER), buildPolicy(2, CONST.POLICY.TYPE.TEAM, CONST.POLICY.ROLE.USER)]);

            // When the CTA works out where to send them
            // Then it names none, because the upgrade page would turn them away
            expect(getUpgradeablePolicyIDInScope(policies, ALL_WORKSPACES, LOGIN)).toBeUndefined();
        });

        it('never names a workspace the upgrade page would reject', () => {
            // Given the one upgradeable workspace in scope is one the user cannot edit
            const policies = toCollection([buildPolicy(1, CONST.POLICY.TYPE.TEAM, CONST.POLICY.ROLE.USER)]);

            // When the CTA works out where to send them
            // Then it sends them to the picker rather than a workspace that renders a not-found page
            expect(getUpgradeablePolicyIDInScope(policies, ALL_WORKSPACES, LOGIN)).toBeUndefined();
        });

        it('skips workspaces already on Control', () => {
            // Given an administered Control workspace next to an administered Collect one
            const policies = toCollection([buildPolicy(1, CONST.POLICY.TYPE.CORPORATE), buildPolicy(2, CONST.POLICY.TYPE.TEAM)]);

            // When the CTA works out where to send them
            // Then only the workspace that has somewhere to upgrade to qualifies
            expect(getUpgradeablePolicyIDInScope(policies, ALL_WORKSPACES, LOGIN)).toBe('2');
        });

        it('skips the personal workspace, which has no plan to upgrade', () => {
            // Given a personal workspace alongside the one upgradeable group workspace
            const policies = toCollection([buildPolicy(1, CONST.POLICY.TYPE.PERSONAL), buildPolicy(2, CONST.POLICY.TYPE.TEAM)]);

            // When the CTA works out where to send them
            // Then the personal workspace doesn't count, so the group one is still named outright
            expect(getUpgradeablePolicyIDInScope(policies, ALL_WORKSPACES, LOGIN)).toBe('2');
        });

        it('counts a free Submit workspace, which can still be upgraded', () => {
            // Given the one workspace in scope is on the free Submit plan
            const policies = toCollection([buildPolicy(1, CONST.POLICY.TYPE.TEAM, CONST.POLICY.ROLE.USER), buildPolicy(2, CONST.POLICY.TYPE.SUBMIT)]);

            // When the CTA works out where to send them
            // Then Submit is named, because the upgrade flow accepts it rather than only paid plans
            expect(getUpgradeablePolicyIDInScope(policies, ALL_WORKSPACES, LOGIN)).toBe('2');
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
