import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import type {SettingsNavigatorParamList} from '@navigation/types';

import DynamicWorkspaceOwnerChangeWrapperPage from '@pages/workspace/members/DynamicWorkspaceOwnerChangeWrapperPage';

import {checkBulkTransferPolicyBillingOwner, queueBulkTransferPolicyBillingOwner, requestWorkspaceOwnerChange, skipBulkTransferPolicyBillingOwnerCheck} from '@userActions/Policy/Member';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {SubscriptionTransfer} from '@src/types/onyx/BillingTakeoverPolicies';
import type Policy from '@src/types/onyx/Policy';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useIsFocused: () => true,
    useNavigationState: () => false,
    usePreventRemove: () => {},
}));
jest.mock('@src/hooks/useResponsiveLayout');
jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({__esModule: true, default: () => ({didScreenTransitionEnd: true})}));
jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => ''));
jest.mock('@hooks/useScreenBoundDynamicRoute', () => jest.fn(() => (path: string) => path));
jest.mock('@hooks/useNavigateToCardAuthenticationOnLink', () => jest.fn());
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({accountID: 1, login: 'admin@example.com'}));
let mockIsOffline = false;
jest.mock('@hooks/useNetwork', () => () => ({isOffline: mockIsOffline}));
jest.mock(
    '@pages/workspace/AccessOrNotFoundWrapper',
    () =>
        ({children}: React.PropsWithChildren) =>
            children,
);
jest.mock('@userActions/Policy/Member', () => ({
    checkBulkTransferPolicyBillingOwner: jest.fn(),
    skipBulkTransferPolicyBillingOwnerCheck: jest.fn(),
    queueBulkTransferPolicyBillingOwner: jest.fn(),
    requestWorkspaceOwnerChange: jest.fn(),
    clearWorkspaceOwnerChangeFlow: jest.fn(),
}));

type OwnerChangePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_OWNER_CHANGE_CHECK>;

const mockCheckBulkTransferPolicyBillingOwner = jest.mocked(checkBulkTransferPolicyBillingOwner);
const mockSkipBulkTransferPolicyBillingOwnerCheck = jest.mocked(skipBulkTransferPolicyBillingOwnerCheck);

const CURRENT_USER_ACCOUNT_ID = 1;
const OWNER_ACCOUNT_ID = 2;
const OWNER_EMAIL = 'owner@example.com';
const SECOND_POLICY_ID = '2';

function createOwnerPolicy(id: string, overrides: Partial<Policy> = {}): Policy {
    return createMock<Policy>({
        id,
        name: `Workspace ${id}`,
        type: CONST.POLICY.TYPE.TEAM,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: OWNER_EMAIL,
        ownerAccountID: OWNER_ACCOUNT_ID,
        ...overrides,
    });
}

async function answerCheck(policyIDs: string[], subscriptionTransfers: Record<string, SubscriptionTransfer> = {}) {
    const checkID = mockCheckBulkTransferPolicyBillingOwner.mock.calls.at(-1)?.[1];
    await Onyx.set(ONYXKEYS.BILLING_TAKEOVER_POLICIES, {checkID, policyIDs, subscriptionTransfers, isLoading: false});
    await waitForBatchedUpdatesWithAct();
}

async function setPolicies(...policies: Policy[]) {
    await Promise.all(policies.map((policy) => Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy)));
}

function renderOwnerChangePage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <DynamicWorkspaceOwnerChangeWrapperPage
                route={{
                    key: 'ownerChange',
                    name: SCREENS.WORKSPACE.DYNAMIC_OWNER_CHANGE_CHECK,
                    params: {policyID: '1', accountID: CURRENT_USER_ACCOUNT_ID, error: CONST.POLICY.OWNERSHIP_ERRORS.AMOUNT_OWED},
                }}
                navigation={createMock<OwnerChangePageProps['navigation']>({})}
            />
        </ComposeProviders>,
    );
}

describe('DynamicWorkspaceOwnerChangeWrapperPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
        jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
        jest.spyOn(Navigation, 'setParams').mockImplementation(() => {});
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: 'admin@example.com'});
        await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);
        mockIsOffline = false;
        mockCheckBulkTransferPolicyBillingOwner.mockImplementation((policyIDs, checkID) => {
            Onyx.set(ONYXKEYS.BILLING_TAKEOVER_POLICIES, {checkID, isLoading: true});
        });
        mockSkipBulkTransferPolicyBillingOwnerCheck.mockImplementation((checkID) => {
            Onyx.set(ONYXKEYS.BILLING_TAKEOVER_POLICIES, {checkID, policyIDs: [], isLoading: false});
        });
    });

    it('offers to take over all of the owner workspaces when the user can take over billing for them together', async () => {
        // Given the owner has two paid workspaces the user is an admin on, and the server can take over both together
        await setPolicies(createOwnerPolicy('1'), createOwnerPolicy('2'));
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[OWNER_ACCOUNT_ID]: {accountID: OWNER_ACCOUNT_ID, login: OWNER_EMAIL, displayName: 'Test Card'}});

        // When the user opens the transfer flow for the first workspace
        renderOwnerChangePage();
        await waitForBatchedUpdatesWithAct();
        await answerCheck(['1', '2']);

        // Then nothing is transferred yet, and the user is asked whether to take over both of the owner's workspaces
        expect(mockCheckBulkTransferPolicyBillingOwner).toHaveBeenCalledWith(['1', '2'], expect.any(String));
        expect(requestWorkspaceOwnerChange).not.toHaveBeenCalled();
        expect(screen.getByText(/^Test Card owns 2 workspaces where you're an admin/)).toBeOnTheScreen();
        expect(screen.getByText('Yes, all 2')).toBeOnTheScreen();

        // When the user takes over all of them
        fireEvent.press(screen.getByText('Yes, all 2'));

        // Then billing for both is taken over together
        expect(queueBulkTransferPolicyBillingOwner).toHaveBeenCalledWith('1', ['1', '2'], false);
        expect(requestWorkspaceOwnerChange).not.toHaveBeenCalled();
    });

    it('keeps loading after taking over all workspaces until the success page opens', async () => {
        // Given the user is asked whether to take over both of the owner's workspaces
        await setPolicies(createOwnerPolicy('1'), createOwnerPolicy('2'));
        renderOwnerChangePage();
        await waitForBatchedUpdatesWithAct();
        await answerCheck(['1', '2']);

        // When the user takes over both and the transfer is queued
        fireEvent.press(screen.getByText('Yes, all 2'));
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, {isLoading: true});
        await waitForBatchedUpdatesWithAct();
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, {isLoading: false, isChangeOwnerSuccessful: true, changeOwnerPolicyCount: 2});
        await waitForBatchedUpdatesWithAct();

        // Then the question doesn't come back while the success page opens
        expect(screen.queryByText('Yes, all 2')).not.toBeOnTheScreen();
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
    });

    it('starts a new transfer when an earlier transfer of this workspace finished', async () => {
        // Given an earlier transfer finished while the user was away, so the workspace is still marked as transferred
        await setPolicies(createOwnerPolicy('1', {isChangeOwnerSuccessful: true}), createOwnerPolicy('2'));

        // When the user opens the transfer flow again
        renderOwnerChangePage();
        await waitForBatchedUpdatesWithAct();
        await answerCheck([]);

        // Then a new transfer starts instead of the success page opening
        expect(requestWorkspaceOwnerChange).toHaveBeenCalledWith(expect.objectContaining({id: '1'}), CURRENT_USER_ACCOUNT_ID, 'admin@example.com');
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('continues with this workspace only when the user picks it', async () => {
        // Given the user is asked whether to take over both of the owner's workspaces
        await setPolicies(createOwnerPolicy('1'), createOwnerPolicy('2'));
        renderOwnerChangePage();
        await waitForBatchedUpdatesWithAct();
        await answerCheck(['1', '2']);

        // When the user picks just this workspace
        fireEvent.press(screen.getByText('No, just this one'));
        await waitForBatchedUpdatesWithAct();

        // Then only this workspace goes through the usual transfer
        expect(requestWorkspaceOwnerChange).toHaveBeenCalledWith(expect.objectContaining({id: '1'}), CURRENT_USER_ACCOUNT_ID, 'admin@example.com');
        expect(queueBulkTransferPolicyBillingOwner).not.toHaveBeenCalled();
        expect(screen.queryByText('No, just this one')).not.toBeOnTheScreen();
    });

    it('transfers this workspace without asking when the server can only take over this one', async () => {
        // Given the user isn't an admin on all of the owner's workspaces, so the server returns only this one
        await setPolicies(createOwnerPolicy('1'), createOwnerPolicy('2'));

        // When the user opens the transfer flow
        renderOwnerChangePage();
        await waitForBatchedUpdatesWithAct();
        await answerCheck([]);

        // Then the usual transfer runs, so its duplicate subscription step can explain why
        expect(requestWorkspaceOwnerChange).toHaveBeenCalledWith(expect.objectContaining({id: '1'}), CURRENT_USER_ACCOUNT_ID, 'admin@example.com');
        expect(screen.queryByText('No, just this one')).not.toBeOnTheScreen();
    });

    it('skips the check when the owner has no other workspace the user is an admin on', async () => {
        // Given the owner's only other paid workspace is one the user isn't an admin on
        await setPolicies(createOwnerPolicy('1'), createOwnerPolicy('2', {role: CONST.POLICY.ROLE.USER}));

        // When the user opens the transfer flow
        renderOwnerChangePage();
        await waitForBatchedUpdatesWithAct();

        // Then the usual transfer starts right away
        expect(mockCheckBulkTransferPolicyBillingOwner).not.toHaveBeenCalled();
        expect(requestWorkspaceOwnerChange).toHaveBeenCalledWith(expect.objectContaining({id: '1'}), CURRENT_USER_ACCOUNT_ID, 'admin@example.com');
    });

    it('offers to take over the annual subscription together with the last workspace', async () => {
        // Given the owner is on an annual subscription, so taking over their last workspace takes it over too
        await setPolicies(createOwnerPolicy('1'), createOwnerPolicy('2'));
        renderOwnerChangePage();
        await waitForBatchedUpdatesWithAct();
        await answerCheck(['1', SECOND_POLICY_ID], {[SECOND_POLICY_ID]: {ownerUserCount: 5, totalUserCount: 8, endDate: '2027-01-01'}});

        // Then the step says how much the user's subscription grows
        expect(screen.getByText(/increase your subscription size by 5 members making your new subscription size 8/)).toBeOnTheScreen();

        // When the user takes over all of them
        fireEvent.press(screen.getByText('Yes, all 2'));

        // Then the transfer takes over the annual subscription too
        expect(queueBulkTransferPolicyBillingOwner).toHaveBeenCalledWith('1', ['1', '2'], true);
    });

    it('ignores the answer an earlier check left behind', async () => {
        // Given an earlier check said both workspaces could be taken over together
        await setPolicies(createOwnerPolicy('1'), createOwnerPolicy('2'));
        await Onyx.set(ONYXKEYS.BILLING_TAKEOVER_POLICIES, {policyIDs: ['1', '2']});

        // When the user opens the transfer flow
        renderOwnerChangePage();
        await waitForBatchedUpdatesWithAct();

        // Then the page runs a new check instead of offering what the earlier one said
        expect(mockCheckBulkTransferPolicyBillingOwner).toHaveBeenCalledWith(['1', '2'], expect.any(String));
        expect(screen.queryByText('Yes, all 2')).not.toBeOnTheScreen();

        // When this check only returns this workspace
        await answerCheck([]);

        // Then the usual transfer runs instead of the question
        expect(requestWorkspaceOwnerChange).toHaveBeenCalledWith(expect.objectContaining({id: '1'}), CURRENT_USER_ACCOUNT_ID, 'admin@example.com');
        expect(screen.queryByText('Yes, all 2')).not.toBeOnTheScreen();
    });

    it('transfers this workspace only when the user is offline', async () => {
        // Given the user is offline, so the check can't answer
        mockIsOffline = true;
        await setPolicies(createOwnerPolicy('1'), createOwnerPolicy('2'));

        // When the user opens the transfer flow
        renderOwnerChangePage();
        await waitForBatchedUpdatesWithAct();

        // Then the usual transfer starts without the check
        expect(mockCheckBulkTransferPolicyBillingOwner).not.toHaveBeenCalled();
        expect(mockSkipBulkTransferPolicyBillingOwnerCheck).toHaveBeenCalled();
        expect(requestWorkspaceOwnerChange).toHaveBeenCalledWith(expect.objectContaining({id: '1'}), CURRENT_USER_ACCOUNT_ID, 'admin@example.com');
    });
});
