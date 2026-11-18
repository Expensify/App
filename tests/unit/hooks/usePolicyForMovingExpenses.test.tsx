import {renderHook, waitFor} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {ReactNode} from 'react';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

/**
 * Onyx resolves from the in-memory cache synchronously under Jest, so the real cold-start window can't be
 * reproduced by just rendering. Stub the loading check instead — it is the only thing the hydration guard reads.
 */
let mockArePolicyResultsLoading = false;
jest.mock('@src/types/utils/isLoadingOnyxValue', () => ({
    __esModule: true,
    default: (): boolean => mockArePolicyResultsLoading,
}));

const CURRENT_USER_LOGIN = 'member@example.com';
const OTHER_MEMBER_LOGIN = 'someone@example.com';
const CURRENT_USER_ACCOUNT_ID = 1;
const POLICY_ID = '1234';

// `Policy['role']` is typed as required, but the backend only populates it for the user's default/active
// workspace, so drop it to model a real member's non-active workspace.
const {role, ...groupPolicyWithoutGlobalRole} = createRandomPolicy(Number(POLICY_ID), CONST.POLICY.TYPE.TEAM, 'Group workspace');

/**
 * A group workspace the user belongs to, where the member's role arrives only inside `employeeList`. This is the
 * shape that used to make a real member look workspace-less and get routed to the reports upgrade screen.
 */
const policyWithRoleOnlyInEmployeeList: Omit<Policy, 'role'> = {
    ...groupPolicyWithoutGlobalRole,
    id: POLICY_ID,
    pendingAction: undefined,
    employeeList: {
        [CURRENT_USER_LOGIN]: {role: CONST.POLICY.ROLE.USER},
    },
};

function Wrapper({children}: {children: ReactNode}) {
    return <OnyxListItemProvider>{children}</OnyxListItemProvider>;
}

describe('usePolicyForMovingExpenses', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockArePolicyResultsLoading = false;
        await Onyx.clear();
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: CURRENT_USER_LOGIN});
        await waitForBatchedUpdates();
    });

    it('does not route to the upgrade path before the policy collection has loaded', async () => {
        // Given Onyx has not finished reading the policy collection yet, so it reads back empty
        mockArePolicyResultsLoading = true;

        // When the hook runs
        const {result} = renderHook(() => usePolicyForMovingExpenses(), {wrapper: Wrapper});
        await waitForBatchedUpdates();

        // Then it reports "I don't know yet" rather than claiming a real member has no workspace
        expect(result.current.arePoliciesLoaded).toBe(false);
        expect(result.current.shouldNavigateToUpgradePath).toBe(false);
    });

    it('routes to the upgrade path once the collection has loaded and the user genuinely has no workspace', async () => {
        // Given the policy collection has loaded and contains no group workspace for this user
        const {result} = renderHook(() => usePolicyForMovingExpenses(), {wrapper: Wrapper});

        // When hydration completes
        await waitFor(() => expect(result.current.arePoliciesLoaded).toBe(true));

        // Then the upgrade path is the correct answer
        expect(result.current.shouldNavigateToUpgradePath).toBe(true);
    });

    it('resolves a workspace whose role is only present in employeeList', async () => {
        // Given a group workspace where the member's role is only in `employeeList`, not on `policy.role`
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policyWithRoleOnlyInEmployeeList);
        await waitForBatchedUpdates();

        // When the hook resolves a policy for moving expenses
        const {result} = renderHook(() => usePolicyForMovingExpenses(), {wrapper: Wrapper});
        await waitFor(() => expect(result.current.arePoliciesLoaded).toBe(true));

        // Then that workspace is used and the user is not sent to the reports upgrade screen
        expect(result.current.policyForMovingExpensesID).toBe(POLICY_ID);
        expect(result.current.shouldNavigateToUpgradePath).toBe(false);
    });

    it('resolves a workspace whose employeeList does not list the user but whose role is set', async () => {
        // Given a group workspace with a partial employeeList that lacks the user, while `policy.role` carries their role
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
            ...groupPolicyWithoutGlobalRole,
            id: POLICY_ID,
            pendingAction: undefined,
            role: CONST.POLICY.ROLE.USER,
            employeeList: {[OTHER_MEMBER_LOGIN]: {role: CONST.POLICY.ROLE.USER}},
        });
        await waitForBatchedUpdates();

        // When the hook resolves a policy for moving expenses
        const {result} = renderHook(() => usePolicyForMovingExpenses(), {wrapper: Wrapper});
        await waitFor(() => expect(result.current.arePoliciesLoaded).toBe(true));

        // Then the workspace is used, as it is in every other flow, rather than treated as one the user was removed from
        expect(result.current.policyForMovingExpensesID).toBe(POLICY_ID);
    });

    it.each([
        ['a per diem expense', true, false],
        ['a time expense', false, true],
    ])('only moves %s to a workspace that supports it', async (_, isPerDiemRequest, isTimeRequest) => {
        // Given an otherwise eligible workspace that has neither per diem nor time tracking enabled
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {...policyWithRoleOnlyInEmployeeList, customUnits: {}, units: {time: {enabled: false}}});
        await waitForBatchedUpdates();

        // When the hook resolves a destination for that kind of expense
        const {result} = renderHook(() => usePolicyForMovingExpenses(isPerDiemRequest, isTimeRequest), {wrapper: Wrapper});
        await waitFor(() => expect(result.current.arePoliciesLoaded).toBe(true));

        // Then the flow-specific filter still applies on top of the shared rule, so the workspace isn't picked
        expect(result.current.policyForMovingExpensesID).toBeUndefined();
        expect(result.current.shouldNavigateToUpgradePath).toBe(true);
    });

    it("doesn't keep an expense on its own workspace once that workspace is archived", async () => {
        // Given an expense whose own workspace is archived, and one other workspace the user can submit to
        const ARCHIVED_POLICY_ID = '5678';
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${ARCHIVED_POLICY_ID}`, {...policyWithRoleOnlyInEmployeeList, id: ARCHIVED_POLICY_ID, archivedDate: '2024-01-01'});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policyWithRoleOnlyInEmployeeList);
        await waitForBatchedUpdates();

        // When the hook resolves a destination, preferring the expense's own workspace
        const {result} = renderHook(() => usePolicyForMovingExpenses(undefined, undefined, ARCHIVED_POLICY_ID), {wrapper: Wrapper});
        await waitFor(() => expect(result.current.arePoliciesLoaded).toBe(true));

        // Then the archived workspace is skipped, because nothing new can be created on it, and the other one is used
        expect(result.current.policyForMovingExpensesID).toBe(POLICY_ID);
    });

    it('lets the backend auto-select the policy for an unreported managed card transaction', async () => {
        // Given the user has no resolvable policy, but the transaction is a managed card transaction
        const {result} = renderHook(() => usePolicyForMovingExpenses(undefined, undefined, undefined, true), {wrapper: Wrapper});
        await waitForBatchedUpdates();

        // Then an empty policyID is returned so the backend picks the preferred policy, with no upgrade screen
        expect(result.current.policyForMovingExpensesID).toBeUndefined();
        expect(result.current.shouldNavigateToUpgradePath).toBe(false);
    });
});
