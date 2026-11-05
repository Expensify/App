import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import type {SettingsNavigatorParamList} from '@navigation/types';

import DynamicWorkspaceOwnerChangeWrapperPage from '@pages/workspace/members/DynamicWorkspaceOwnerChangeWrapperPage';

import {checkBulkTransferPolicyBillingOwner, queueBulkTransferPolicyBillingOwner, requestWorkspaceOwnerChange} from '@userActions/Policy/Member';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
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
jest.mock(
    '@pages/workspace/AccessOrNotFoundWrapper',
    () =>
        ({children}: React.PropsWithChildren) =>
            children,
);
jest.mock('@userActions/Policy/Member', () => ({
    checkBulkTransferPolicyBillingOwner: jest.fn(),
    queueBulkTransferPolicyBillingOwner: jest.fn(),
    requestWorkspaceOwnerChange: jest.fn(),
    clearWorkspaceOwnerChangeFlow: jest.fn(),
}));

type OwnerChangePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_OWNER_CHANGE_CHECK>;

const mockCheckBulkTransferPolicyBillingOwner = jest.mocked(checkBulkTransferPolicyBillingOwner);

const CURRENT_USER_ACCOUNT_ID = 1;
const OWNER_ACCOUNT_ID = 2;
const OWNER_EMAIL = 'owner@example.com';

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
        jest.clearAllMocks();
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: 'admin@example.com'});
        await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);
    });

    it('offers to take over all of the owner workspaces when the user can take over billing for them together', async () => {
        // Given the owner has two paid workspaces the user is an admin on, and the server can take over both together
        await setPolicies(createOwnerPolicy('1'), createOwnerPolicy('2'));
        mockCheckBulkTransferPolicyBillingOwner.mockResolvedValue(['1', '2']);

        // When the user opens the transfer flow for the first workspace
        renderOwnerChangePage();
        await waitForBatchedUpdatesWithAct();

        // Then nothing is transferred yet, and the user is asked whether to take over both
        expect(mockCheckBulkTransferPolicyBillingOwner).toHaveBeenCalledWith(['1', '2']);
        expect(requestWorkspaceOwnerChange).not.toHaveBeenCalled();
        expect(screen.getByText('Take over all 2 workspaces')).toBeOnTheScreen();

        // When the user takes over all of them
        fireEvent.press(screen.getByText('Take over all 2 workspaces'));

        // Then billing for both is taken over together
        expect(queueBulkTransferPolicyBillingOwner).toHaveBeenCalledWith('1', ['1', '2']);
        expect(requestWorkspaceOwnerChange).not.toHaveBeenCalled();
    });

    it('continues with this workspace only when the user picks it', async () => {
        // Given the user is asked whether to take over both of the owner's workspaces
        await setPolicies(createOwnerPolicy('1'), createOwnerPolicy('2'));
        mockCheckBulkTransferPolicyBillingOwner.mockResolvedValue(['1', '2']);
        renderOwnerChangePage();
        await waitForBatchedUpdatesWithAct();

        // When the user picks just this workspace
        fireEvent.press(screen.getByText('Just this workspace'));
        await waitForBatchedUpdatesWithAct();

        // Then only this workspace goes through the usual transfer
        expect(requestWorkspaceOwnerChange).toHaveBeenCalledWith(expect.objectContaining({id: '1'}), CURRENT_USER_ACCOUNT_ID, 'admin@example.com');
        expect(queueBulkTransferPolicyBillingOwner).not.toHaveBeenCalled();
        expect(screen.queryByText('Just this workspace')).not.toBeOnTheScreen();
    });

    it('transfers this workspace without asking when the server can only take over this one', async () => {
        // Given the user isn't an admin on all of the owner's workspaces, so the server returns only this one
        await setPolicies(createOwnerPolicy('1'), createOwnerPolicy('2'));
        mockCheckBulkTransferPolicyBillingOwner.mockResolvedValue([]);

        // When the user opens the transfer flow
        renderOwnerChangePage();
        await waitForBatchedUpdatesWithAct();

        // Then the usual transfer runs, so its duplicate subscription step can explain why
        expect(requestWorkspaceOwnerChange).toHaveBeenCalledWith(expect.objectContaining({id: '1'}), CURRENT_USER_ACCOUNT_ID, 'admin@example.com');
        expect(screen.queryByText('Just this workspace')).not.toBeOnTheScreen();
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
});
