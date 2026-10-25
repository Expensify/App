import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {WorkspaceNavigatorParamList} from '@libs/Navigation/types';

import WorkspacesListPage from '@pages/workspace/WorkspacesListPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useResponsiveLayout', () => {
    const actual = jest.requireActual<{default: typeof useResponsiveLayout}>('@hooks/useResponsiveLayout');
    return {__esModule: true, default: jest.fn(actual.default)};
});

const Stack = createPlatformStackNavigator<WorkspaceNavigatorParamList>();

const renderPage = (initialRouteName: typeof SCREENS.WORKSPACES_LIST = SCREENS.WORKSPACES_LIST) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={initialRouteName}>
                        <Stack.Screen
                            name={SCREENS.WORKSPACES_LIST}
                            component={WorkspacesListPage}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
};

describe('WorkspaceListPage', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
        jest.mocked(useResponsiveLayout).mockImplementation(jest.requireActual<{default: typeof useResponsiveLayout}>('@hooks/useResponsiveLayout').default);
    });

    it('should not show new workspace button when the restrict creation policy in the group domain is enabled', async () => {
        const TEST_DOMAIN = 'domain.com';
        const TEST_SECURITY_GROUP_ID = 'test-id';
        const TEST_POLICY_ID = 'test-policy-id';
        const TEST_EMAIL = 'test@domain.com';
        const TEST_ACCOUNT_ID = 1;

        await Onyx.set(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, {
            [TEST_DOMAIN]: TEST_SECURITY_GROUP_ID,
        });

        await Onyx.set(`${ONYXKEYS.COLLECTION.SECURITY_GROUP}${TEST_SECURITY_GROUP_ID}`, {
            enableRestrictedPolicyCreation: true,
        });

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${TEST_POLICY_ID}`, {
            id: TEST_POLICY_ID,
            name: 'Test Policy',
            role: 'admin',
        });

        await Onyx.set(`${ONYXKEYS.SESSION}`, {
            email: TEST_EMAIL,
            accountID: TEST_ACCOUNT_ID,
        });

        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [TEST_ACCOUNT_ID]: {
                login: TEST_EMAIL,
                accountID: TEST_ACCOUNT_ID,
                displayName: TEST_EMAIL,
            },
        });

        renderPage();

        await waitForBatchedUpdatesWithAct();

        const newWorkspaceButton = screen.queryByAccessibilityHint('New');
        expect(newWorkspaceButton).not.toBeOnTheScreen();
    });

    it('should not show new workspace button when the restrict creation policy in the group domain is enabled and the restricting group is under the sharedNVP key', async () => {
        const TEST_DOMAIN = 'domain.com';
        const TEST_SECURITY_GROUP_ID = '123456';
        const TEST_OWNER_ACCOUNT_ID = 42;
        const TEST_POLICY_ID = 'A1B2C3D4E5F6A7B8';
        const TEST_EMAIL = 'test@domain.com';
        const TEST_ACCOUNT_ID = 1;

        // Given an object membership, which carries the owner account ID
        await Onyx.set(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, {
            [TEST_DOMAIN]: {securityGroupID: TEST_SECURITY_GROUP_ID, ownerAccountID: TEST_OWNER_ACCOUNT_ID},
        });

        // Given the group forbids workspace creation, stored under the sharedNVP key
        await Onyx.set(`${ONYXKEYS.COLLECTION.SHARED_NVP_SECURITY_GROUP}${TEST_SECURITY_GROUP_ID}_${TEST_OWNER_ACCOUNT_ID}`, {
            enableRestrictedPolicyCreation: true,
        });

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${TEST_POLICY_ID}`, {
            id: TEST_POLICY_ID,
            name: 'Test Policy',
            role: 'admin',
        });

        await Onyx.set(`${ONYXKEYS.SESSION}`, {
            email: TEST_EMAIL,
            accountID: TEST_ACCOUNT_ID,
        });

        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [TEST_ACCOUNT_ID]: {
                login: TEST_EMAIL,
                accountID: TEST_ACCOUNT_ID,
                displayName: TEST_EMAIL,
            },
        });

        // When the workspaces list is opened
        renderPage();

        await waitForBatchedUpdatesWithAct();

        // Then the new workspace button is not rendered
        const newWorkspaceButton = screen.queryByAccessibilityHint('New');
        expect(newWorkspaceButton).not.toBeOnTheScreen();
    });

    it('should show new workspace button when the restrict creation policy in the group domain is disabled', async () => {
        const TEST_DOMAIN = 'domain.com';
        const TEST_SECURITY_GROUP_ID = 'test-id';
        const TEST_POLICY_ID = 'test-policy-id';
        const TEST_EMAIL = 'test@domain.com';
        const TEST_ACCOUNT_ID = 1;

        await Onyx.set(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, {
            [TEST_DOMAIN]: TEST_SECURITY_GROUP_ID,
        });

        await Onyx.set(`${ONYXKEYS.COLLECTION.SECURITY_GROUP}${TEST_SECURITY_GROUP_ID}`, {
            enableRestrictedPolicyCreation: false,
        });

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${TEST_POLICY_ID}`, {
            id: TEST_POLICY_ID,
            name: 'Test Policy',
            role: 'admin',
        });

        await Onyx.set(`${ONYXKEYS.SESSION}`, {
            email: TEST_EMAIL,
            accountID: TEST_ACCOUNT_ID,
        });

        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [TEST_ACCOUNT_ID]: {
                login: TEST_EMAIL,
                accountID: TEST_ACCOUNT_ID,
                displayName: TEST_EMAIL,
            },
        });

        renderPage();

        await waitForBatchedUpdatesWithAct();

        const newWorkspaceButton = screen.queryByAccessibilityHint('New');
        expect(newWorkspaceButton).toBeOnTheScreen();
    });

    it('should show the owner email of a pending join request workspace when the owner is not in the personal details list', async () => {
        const TEST_POLICY_ID = 'pending-policy-id';
        const OWNER_EMAIL = 'owner@example.com';

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${TEST_POLICY_ID}`, {
            id: TEST_POLICY_ID,
            isJoinRequestPending: true,
            policyDetailsForNonMembers: {
                [TEST_POLICY_ID]: {
                    name: 'Pending Workspace',
                    type: CONST.POLICY.TYPE.TEAM,
                    ownerAccountID: 42,
                    ownerEmail: OWNER_EMAIL,
                },
            },
        });

        renderPage();

        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('Pending Workspace')).toBeOnTheScreen();
        expect(screen.getByText(new RegExp(OWNER_EMAIL))).toBeOnTheScreen();
        // The workspace default icon is derived from nonMemberDetails.name ("Pending Workspace"), so the
        // rendered SVG test ID is keyed by its first alphanumeric character. The icon is decorative and
        // hidden from accessibility, so the query must include hidden elements.
        expect(screen.getByTestId('SvgDefaultAvatar_p Icon', {includeHiddenElements: true})).toBeOnTheScreen();
    });

    it('should show a "New workspace" button when there are workspaces but no domains', async () => {
        const TEST_POLICY_ID = 'test-policy-id';

        await Onyx.clear();
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${TEST_POLICY_ID}`, {
            id: TEST_POLICY_ID,
            name: 'Test Policy',
            role: 'admin',
        });

        renderPage();

        await waitForBatchedUpdatesWithAct();

        const newDropdownButton = screen.queryByTestId('dropdown-button-new');
        expect(newDropdownButton).not.toBeOnTheScreen();

        const newWorkspaceButton = screen.queryByAccessibilityHint('New');
        expect(newWorkspaceButton).toBeOnTheScreen();
    });

    it('should offer the actions of the selected workspaces in the bulk action bar', async () => {
        const TEST_ACCOUNT_ID = 1;
        const OTHER_OWNER_ACCOUNT_ID = 2;

        // Given the wide layout, where every row has a checkbox and the actions float in a bar over the table
        jest.mocked(useResponsiveLayout).mockReturnValue({
            shouldUseNarrowLayout: false,
            isSmallScreenWidth: false,
            isInNarrowPaneModal: false,
            isExtraSmallScreenHeight: false,
            isMediumScreenWidth: false,
            isLargeScreenWidth: true,
            isExtraLargeScreenWidth: false,
            isExtraSmallScreenWidth: false,
            isSmallScreen: false,
            onboardingIsMediumOrLargerScreenWidth: true,
            isInLandscapeMode: false,
        });

        // Given one workspace the user owns and one they administer for someone else
        await Onyx.set(ONYXKEYS.SESSION, {email: 'test@domain.com', accountID: TEST_ACCOUNT_ID});
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [TEST_ACCOUNT_ID]: {login: 'test@domain.com', accountID: TEST_ACCOUNT_ID, displayName: 'test@domain.com'},
        });
        await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, 'other-policy');

        // Given a saved card, which mobile requires before an ownership transfer is offered
        await Onyx.set(ONYXKEYS.FUND_LIST, {card: {methodID: 1, accountType: CONST.PAYMENT_METHODS.DEBIT_CARD}});
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}owned-policy`, {
            id: 'owned-policy',
            name: 'Owned Workspace',
            role: CONST.POLICY.ROLE.ADMIN,
            type: CONST.POLICY.TYPE.TEAM,
            owner: 'test@domain.com',
            ownerAccountID: TEST_ACCOUNT_ID,
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}other-policy`, {
            id: 'other-policy',
            name: 'Other Workspace',
            role: CONST.POLICY.ROLE.ADMIN,
            type: CONST.POLICY.TYPE.TEAM,
            owner: 'owner@domain.com',
            ownerAccountID: OTHER_OWNER_ACCOUNT_ID,
        });

        renderPage();
        await waitForBatchedUpdatesWithAct();

        const pressRowCheckbox = (index: number) => {
            const checkbox = screen.getAllByLabelText('Select').at(index);
            if (!checkbox) {
                throw new Error(`No selectable row at index ${index}`);
            }
            fireEvent.press(checkbox);
        };

        // When only the owned workspace is selected, which sorts after the other one by name
        pressRowCheckbox(1);
        await waitForBatchedUpdatesWithAct();

        // Then the actions that need exactly one workspace are offered, and Transfer owner and Leave are not because the user owns it
        expect(screen.getByText('1 selected')).toBeOnTheScreen();
        expect(screen.getByText('Set as default')).toBeOnTheScreen();
        expect(screen.getByText('Export members')).toBeOnTheScreen();
        expect(screen.queryByText('Transfer owner')).not.toBeOnTheScreen();
        expect(screen.queryByText('Leave')).not.toBeOnTheScreen();

        // When the other workspace is selected too
        pressRowCheckbox(0);
        await waitForBatchedUpdatesWithAct();

        // Then the single workspace actions are dropped and the actions that apply to either workspace are offered
        expect(screen.getByText('2 selected')).toBeOnTheScreen();
        expect(screen.queryByText('Set as default')).not.toBeOnTheScreen();
        expect(screen.getByText('Export members')).toBeOnTheScreen();
        expect(screen.getByText('Transfer owner')).toBeOnTheScreen();
        expect(screen.getByText('Leave')).toBeOnTheScreen();
    });
});
