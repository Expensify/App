import {renderHook} from '@testing-library/react-native';

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

const CURRENT_USER_LOGIN = 'member@example.com';
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
        await Onyx.clear();
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: CURRENT_USER_LOGIN});
        await waitForBatchedUpdates();
    });

    it('should route to the upgrade path when the user has no group workspace', async () => {
        // Given the policy collection contains no group workspace for this user
        // When the hook runs
        const {result} = renderHook(() => usePolicyForMovingExpenses(), {wrapper: Wrapper});
        await waitForBatchedUpdates();

        // Then the upgrade path is the correct answer
        expect(result.current.shouldNavigateToUpgradePath).toBe(true);
    });

    it('resolves a workspace whose role is only present in employeeList', async () => {
        // Given a group workspace where the member's role is only in `employeeList`, not on `policy.role`
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policyWithRoleOnlyInEmployeeList);
        await waitForBatchedUpdates();

        // When the hook resolves a policy for moving expenses
        const {result} = renderHook(() => usePolicyForMovingExpenses(), {wrapper: Wrapper});
        await waitForBatchedUpdates();

        // Then that workspace is used and the user is not sent to the reports upgrade screen
        expect(result.current.policyForMovingExpensesID).toBe(POLICY_ID);
        expect(result.current.shouldNavigateToUpgradePath).toBe(false);
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
