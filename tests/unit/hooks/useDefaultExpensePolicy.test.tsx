import {renderHook, waitFor} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';

import {getDefaultChatEnabledPolicySelection} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {ReactNode} from 'react';
import type {OnyxCollection} from 'react-native-onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

/**
 * Tests for the default expense workspace, driven by real Onyx data, and a parity check that it, the moving-expense
 * destination and the Create report default all resolve the same workspace from the same data (#105701).
 */

const USER_DOMAIN = 'example.com';
const USER_EMAIL = 'user@example.com';
const USER_ACCOUNT_ID = 1;
const SECURITY_GROUP_ID = '123456';
const DOMAIN_ACCOUNT_ID = 42;
const PERSONAL_POLICY_ID = 'personal';
const POLICY_A_ID = 'a';
const POLICY_B_ID = 'b';
const POLICY_C_ID = 'c';

// The hook reads the login from personal details, which come from a provider this test doesn't mount
jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: USER_ACCOUNT_ID, login: USER_EMAIL}),
}));

function makePolicy(id: string, overrides: Partial<Policy> = {}): Policy {
    return createMock<Policy>({
        id,
        name: `${id} workspace`,
        role: CONST.POLICY.ROLE.USER,
        type: CONST.POLICY.TYPE.TEAM,
        owner: 'owner@example.com',
        ownerAccountID: 99,
        outputCurrency: CONST.CURRENCY.USD,
        employeeList: {},
        ...overrides,
    });
}

const personalPolicy = makePolicy(PERSONAL_POLICY_ID, {type: CONST.POLICY.TYPE.PERSONAL});
const archived = {archivedDate: '2024-01-01'};

async function setPolicies(policies: Policy[], activePolicyID: string) {
    await Onyx.set(ONYXKEYS.SESSION, {email: USER_EMAIL, accountID: USER_ACCOUNT_ID});
    await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, activePolicyID);
    for (const policy of policies) {
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
    }
    await waitForBatchedUpdates();
}

async function lockToPreferredPolicy(preferredPolicyID: string) {
    await Onyx.set(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, {[USER_DOMAIN]: {securityGroupID: SECURITY_GROUP_ID, ownerAccountID: DOMAIN_ACCOUNT_ID}});
    await Onyx.set(`${ONYXKEYS.COLLECTION.SHARED_NVP_SECURITY_GROUP}${SECURITY_GROUP_ID}_${DOMAIN_ACCOUNT_ID}`, {
        enableRestrictedPrimaryPolicy: true,
        restrictedPrimaryPolicyID: preferredPolicyID,
    });
    await waitForBatchedUpdates();
}

function Wrapper({children}: {children: ReactNode}) {
    return <OnyxListItemProvider>{children}</OnyxListItemProvider>;
}

beforeAll(() => {
    Onyx.init({keys: ONYXKEYS});
    return waitForBatchedUpdates();
});

beforeEach(async () => {
    await Onyx.clear();
    await waitForBatchedUpdates();
});

describe('useDefaultExpensePolicy', () => {
    it('skips an archived active workspace and uses the only other eligible one', async () => {
        // Given the user's active workspace was archived and they belong to one other workspace
        await setPolicies([personalPolicy, makePolicy(POLICY_A_ID, archived), makePolicy(POLICY_B_ID)], POLICY_A_ID);

        // When the default expense workspace is resolved
        const {result} = renderHook(() => useDefaultExpensePolicy());

        // Then the other workspace is used, since nothing can be created on an archived one
        await waitFor(() => expect(result.current?.id).toBe(POLICY_B_ID));
    });

    it('has no default when the active workspace is personal and two workspaces are eligible', async () => {
        // Given a personal active workspace and two group workspaces
        await setPolicies([personalPolicy, makePolicy(POLICY_A_ID), makePolicy(POLICY_B_ID)], PERSONAL_POLICY_ID);

        // When the default expense workspace is resolved
        const {result} = renderHook(() => useDefaultExpensePolicy());
        await waitForBatchedUpdates();

        // Then there's no single default, so callers ask the user to pick
        expect(result.current).toBeUndefined();

        // And once one of the workspaces goes away, the remaining one becomes the default, which shows the policies were read
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_B_ID}`, null);
        await waitFor(() => expect(result.current?.id).toBe(POLICY_A_ID));
    });

    it('ignores the domain lock when the preferred workspace is archived', async () => {
        // Given a domain lock to workspace B, which has been archived, and an eligible active workspace A
        await setPolicies([personalPolicy, makePolicy(POLICY_A_ID), makePolicy(POLICY_B_ID, archived)], POLICY_A_ID);
        await lockToPreferredPolicy(POLICY_B_ID);

        // When the default expense workspace is resolved
        const {result} = renderHook(() => useDefaultExpensePolicy());

        // Then the active workspace is used, the same fallback useCreateReport applies
        await waitFor(() => expect(result.current?.id).toBe(POLICY_A_ID));
    });

    it('uses the preferred workspace when the domain lock points at an eligible one', async () => {
        // Given a domain lock to workspace B, while the active workspace is A
        await setPolicies([personalPolicy, makePolicy(POLICY_A_ID), makePolicy(POLICY_B_ID)], POLICY_A_ID);
        await lockToPreferredPolicy(POLICY_B_ID);

        // When the default expense workspace is resolved
        const {result} = renderHook(() => useDefaultExpensePolicy());

        // Then the preferred workspace wins over the active one
        await waitFor(() => expect(result.current?.id).toBe(POLICY_B_ID));
    });
});

describe('default workspace parity across flows', () => {
    it.each<[string, Policy[], string, string | undefined]>([
        ['the active workspace is archived and one other is eligible', [personalPolicy, makePolicy(POLICY_A_ID, archived), makePolicy(POLICY_B_ID)], POLICY_A_ID, POLICY_B_ID],
        [
            'the active workspace is archived and two others are eligible',
            [personalPolicy, makePolicy(POLICY_A_ID, archived), makePolicy(POLICY_B_ID), makePolicy(POLICY_C_ID)],
            POLICY_A_ID,
            undefined,
        ],
        [
            'the active workspace is Teachers Unite',
            [personalPolicy, makePolicy(CONST.TEACHERS_UNITE.TEST_POLICY_ID), makePolicy(POLICY_B_ID)],
            CONST.TEACHERS_UNITE.TEST_POLICY_ID,
            POLICY_B_ID,
        ],
        [
            'the user failed to leave the active workspace',
            [
                personalPolicy,
                makePolicy(POLICY_A_ID, {employeeList: {[USER_EMAIL]: {email: USER_EMAIL, role: CONST.POLICY.ROLE.USER, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}}}),
                makePolicy(POLICY_B_ID),
            ],
            POLICY_A_ID,
            POLICY_A_ID,
        ],
        [
            'the other workspace is pending deletion with errors',
            [personalPolicy, makePolicy(POLICY_A_ID), makePolicy(POLICY_B_ID, {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE, errors: {error: 'Failed'}})],
            PERSONAL_POLICY_ID,
            POLICY_A_ID,
        ],
        ['every group workspace is archived', [personalPolicy, makePolicy(POLICY_A_ID, archived), makePolicy(POLICY_B_ID, archived)], PERSONAL_POLICY_ID, undefined],
    ])('resolves the same default workspace in every flow when %s', async (_, policies, activePolicyID, expectedPolicyID) => {
        // Given the same workspaces and active workspace for every flow
        await setPolicies(policies, activePolicyID);
        const policyCollection: OnyxCollection<Policy> = Object.fromEntries(policies.map((policy) => [`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy]));

        // When the expense default, the moving-expense destination and the Create report default are resolved
        const {result} = renderHook(() => ({defaultExpensePolicy: useDefaultExpensePolicy(), policyForMovingExpenses: usePolicyForMovingExpenses()}), {wrapper: Wrapper});
        await waitFor(() => expect(result.current.policyForMovingExpenses.arePoliciesLoaded).toBe(true));
        await waitForBatchedUpdates();
        const createReportDefault = getDefaultChatEnabledPolicySelection(policyCollection, USER_EMAIL, activePolicyID);

        // Then all three agree, so the user gets the same workspace whichever flow they start from
        expect(result.current.defaultExpensePolicy?.id).toBe(expectedPolicyID);
        expect(result.current.policyForMovingExpenses.policyForMovingExpensesID).toBe(expectedPolicyID);
        expect(createReportDefault.defaultChatEnabledPolicyID).toBe(expectedPolicyID);

        // And moving expenses opens the selector or the upgrade path exactly when Create report would, so the selector never opens empty
        expect(result.current.policyForMovingExpenses.shouldSelectPolicy).toBe(!expectedPolicyID && createReportDefault.hasMultipleChatEnabledPolicies);
        expect(result.current.policyForMovingExpenses.shouldNavigateToUpgradePath).toBe(!createReportDefault.hasChatEnabledPolicies);
    });
});
