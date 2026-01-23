import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, render, screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import WorkspacesListPage from '@pages/workspace/WorkspacesListPage';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const Stack = createPlatformStackNavigator<AuthScreensParamList>();

const renderPage = (initialRouteName: typeof SCREENS.WORKSPACES_LIST = SCREENS.WORKSPACES_LIST) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
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
    });

    afterAll(() => {
        Onyx.clear();
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

        const newWorkspaceButton = screen.queryByAccessibilityHint('New workspace');
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

        const newWorkspaceButton = screen.queryByAccessibilityHint('New workspace');
        expect(newWorkspaceButton).toBeOnTheScreen();
    });

    it('should show a "new" dropdown button when workspaces and domains are present', async () => {
        const TEST_DOMAIN_ACCOUNT_ID = 123;
        const TEST_POLICY_ID = 'test-policy-id';

        await Onyx.set(`${ONYXKEYS.COLLECTION.DOMAIN}${TEST_DOMAIN_ACCOUNT_ID}`, {
            accountID: TEST_DOMAIN_ACCOUNT_ID,
            email: '+@test.com',
        });

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${TEST_POLICY_ID}`, {
            id: TEST_POLICY_ID,
            name: 'Test Policy',
            role: 'admin',
        });

        renderPage();

        await waitForBatchedUpdatesWithAct();

        const newDropdownButton = screen.getByTestId('dropdown-button-new');
        expect(newDropdownButton).toBeOnTheScreen();
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

        const newWorkspaceButton = screen.queryByAccessibilityHint('New workspace');
        expect(newWorkspaceButton).toBeOnTheScreen();
    });
});
