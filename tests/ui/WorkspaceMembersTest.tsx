import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import WorkspaceMembersPage from '@pages/workspace/WorkspaceMembersPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.unmock('react-native-reanimated');

jest.mock('@src/components/ConfirmedRoute.tsx');

TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<WorkspaceSplitNavigatorParamList>();

const renderPage = (initialRouteName: typeof SCREENS.WORKSPACE.MEMBERS, initialParams: WorkspaceSplitNavigatorParamList[typeof SCREENS.WORKSPACE.MEMBERS]) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={initialRouteName}>
                        <Stack.Screen
                            name={SCREENS.WORKSPACE.MEMBERS}
                            component={WorkspaceMembersPage}
                            initialParams={initialParams}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
};

describe('WorkspaceMembers', () => {
    const ownerAccountID = 1;
    const ownerEmail = 'owner@gmail.com';
    const adminAccountID = 1234;
    const adminEmail = 'admin@example.com';
    const auditorAccountID = 1235;
    const auditorEmail = 'auditor@example.com';
    const userAccountID = 1236;
    const userEmail = 'user@example.com';
    const selfAccountID = 1206;
    const selfEmail = 'test@example.com';
    const ADMIN_OPTION = 'Admin User';
    const AUDITOR_OPTION = 'Auditor User';
    const USER_OPTION = 'Member User';
    const policy = {
        ...LHNTestUtils.getFakePolicy(),
        role: CONST.POLICY.ROLE.ADMIN,
        owner: ownerEmail,
        ownerAccountID,
        employeeList: {
            [ownerEmail]: {email: ownerEmail, role: CONST.POLICY.ROLE.ADMIN},
            [adminEmail]: {email: adminEmail, role: CONST.POLICY.ROLE.ADMIN},
            [auditorEmail]: {email: auditorEmail, role: CONST.POLICY.ROLE.AUDITOR},
            [userEmail]: {email: userEmail, role: CONST.POLICY.ROLE.USER},
            [selfEmail]: {email: selfEmail, role: CONST.POLICY.ROLE.ADMIN},
        },
    };

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        await TestHelper.signInWithTestUser(selfAccountID, selfEmail, undefined, 'Self');
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
            await Onyx.set(`${ONYXKEYS.PERSONAL_DETAILS_LIST}`, {
                [ownerAccountID]: TestHelper.buildPersonalDetails(ownerEmail, ownerAccountID, 'Owner'),
                [adminAccountID]: TestHelper.buildPersonalDetails(adminEmail, adminAccountID, 'Admin'),
                [auditorAccountID]: TestHelper.buildPersonalDetails(auditorEmail, auditorAccountID, 'Auditor'),
                [userAccountID]: TestHelper.buildPersonalDetails(userEmail, userAccountID, 'Member'),
                [selfAccountID]: TestHelper.buildPersonalDetails(selfEmail, selfAccountID, 'Self'),
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
        });
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue({
            isSmallScreenWidth: false,
            shouldUseNarrowLayout: false,
        } as ResponsiveLayoutResult);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    describe('Changing roles options', () => {
        it('should show Make member/auditor when admin is selected', async () => {
            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            // Wait for initial render and verify members are visible
            await waitFor(() => {
                expect(screen.getByText(ADMIN_OPTION)).toBeOnTheScreen();
            });

            // Select admin option by clicking their checkboxes
            fireEvent.press(screen.getByTestId(`TableListItemCheckbox-${ADMIN_OPTION}`));
            const dropdownMenuButtonTestID = 'WorkspaceMembersPage-header-dropdown-menu-button';

            // Wait for selection mode to be active and click the dropdown menu button
            await waitFor(() => {
                expect(screen.getByTestId(dropdownMenuButtonTestID)).toBeOnTheScreen();
            });

            // Click the "1 selected" button to open the menu
            const dropdownButton = screen.getByTestId(dropdownMenuButtonTestID);
            fireEvent.press(dropdownButton);

            await waitForBatchedUpdatesWithAct();

            // Wait for menu items to be visible
            await waitFor(() => {
                const makeMemberText = TestHelper.translateLocal('workspace.people.makeMember');
                expect(screen.getByText(makeMemberText)).toBeOnTheScreen();
            });

            // Find and verify "Make member" dropdown menu item
            const makeMemberMenuItem = screen.getByTestId('PopoverMenuItem-Make member');
            expect(makeMemberMenuItem).toBeOnTheScreen();

            // Find and verify "Make auditor" dropdown menu item
            const makeAuditorMenuItem = screen.getByTestId('PopoverMenuItem-Make auditor');
            expect(makeAuditorMenuItem).toBeOnTheScreen();

            // Find and verify "Make admin" dropdown menu item is not present
            const makeAdminMenuItem = screen.queryByTestId('PopoverMenuItem-Make admin');
            expect(makeAdminMenuItem).not.toBeOnTheScreen();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should show Make admin/auditor when member is selected', async () => {
            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            // Wait for initial render and verify members are visible
            await waitFor(() => {
                expect(screen.getByText(USER_OPTION)).toBeOnTheScreen();
            });

            // Select member option by clicking their checkboxes
            fireEvent.press(screen.getByTestId(`TableListItemCheckbox-${USER_OPTION}`));
            const dropdownMenuButtonTestID = 'WorkspaceMembersPage-header-dropdown-menu-button';

            // Wait for selection mode to be active and click the dropdown menu button
            await waitFor(() => {
                expect(screen.getByTestId(dropdownMenuButtonTestID)).toBeOnTheScreen();
            });

            // Click the "1 selected" button to open the menu
            const dropdownButton = screen.getByTestId(dropdownMenuButtonTestID);
            fireEvent.press(dropdownButton);

            await waitForBatchedUpdatesWithAct();

            // Wait for menu items to be visible
            await waitFor(() => {
                const makeAdminText = TestHelper.translateLocal('workspace.people.makeAdmin');
                expect(screen.getByText(makeAdminText)).toBeOnTheScreen();
            });

            // Find and verify "Make admin" dropdown menu item
            const makeAdminMenuItem = screen.getByTestId('PopoverMenuItem-Make admin');
            expect(makeAdminMenuItem).toBeOnTheScreen();

            // Find and verify "Make auditor" dropdown menu item
            const makeAuditorMenuItem = screen.getByTestId('PopoverMenuItem-Make auditor');
            expect(makeAuditorMenuItem).toBeOnTheScreen();

            // Find and verify "Make member" dropdown menu item is not present
            const makeMemberMenuItem = screen.queryByTestId('PopoverMenuItem-Make member');
            expect(makeMemberMenuItem).not.toBeOnTheScreen();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should show Make member/admin when auditor is selected', async () => {
            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            // Wait for initial render and verify members are visible
            await waitFor(() => {
                expect(screen.getByText(AUDITOR_OPTION)).toBeOnTheScreen();
            });

            // Select auditor option by clicking their checkboxes
            fireEvent.press(screen.getByTestId(`TableListItemCheckbox-${AUDITOR_OPTION}`));
            const dropdownMenuButtonTestID = 'WorkspaceMembersPage-header-dropdown-menu-button';

            // Wait for selection mode to be active and click the dropdown menu button
            await waitFor(() => {
                expect(screen.getByTestId(dropdownMenuButtonTestID)).toBeOnTheScreen();
            });

            // Click the "1 selected" button to open the menu
            const dropdownButton = screen.getByTestId(dropdownMenuButtonTestID);
            fireEvent.press(dropdownButton);

            await waitForBatchedUpdatesWithAct();

            // Wait for menu items to be visible
            await waitFor(() => {
                const makeMemberText = TestHelper.translateLocal('workspace.people.makeMember');
                expect(screen.getByText(makeMemberText)).toBeOnTheScreen();
            });

            // Find and verify "Make member" dropdown menu item
            const makeMemberMenuItem = screen.getByTestId('PopoverMenuItem-Make member');
            expect(makeMemberMenuItem).toBeOnTheScreen();

            // Find and verify "Make admin" dropdown menu item
            const makeAdminMenuItem = screen.getByTestId('PopoverMenuItem-Make admin');
            expect(makeAdminMenuItem).toBeOnTheScreen();

            // Find and verify "Make auditor" dropdown menu item is not present
            const makeAuditorMenuItem = screen.queryByTestId('PopoverMenuItem-Make auditor');
            expect(makeAuditorMenuItem).not.toBeOnTheScreen();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should show Make member/admin/auditor when mix is selected', async () => {
            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            // Wait for initial render and verify members are visible
            await waitFor(() => {
                expect(screen.getByText(AUDITOR_OPTION)).toBeOnTheScreen();
            });
            await waitFor(() => {
                expect(screen.getByText(ADMIN_OPTION)).toBeOnTheScreen();
            });

            // Select options by clicking their checkboxes
            fireEvent.press(screen.getByTestId(`TableListItemCheckbox-${AUDITOR_OPTION}`));
            fireEvent.press(screen.getByTestId(`TableListItemCheckbox-${ADMIN_OPTION}`));
            const dropdownMenuButtonTestID = 'WorkspaceMembersPage-header-dropdown-menu-button';

            // Wait for selection mode to be active and click the dropdown menu button
            await waitFor(() => {
                expect(screen.getByTestId(dropdownMenuButtonTestID)).toBeOnTheScreen();
            });

            // Click the "2 selected" button to open the menu
            const dropdownButton = screen.getByTestId(dropdownMenuButtonTestID);
            fireEvent.press(dropdownButton);

            await waitForBatchedUpdatesWithAct();

            // Wait for menu items to be visible
            await waitFor(() => {
                const makeMemberText = TestHelper.translateLocal('workspace.people.makeMember');
                expect(screen.getByText(makeMemberText)).toBeOnTheScreen();
            });

            // Find and verify "Make member" dropdown menu item
            const makeMemberMenuItem = screen.getByTestId('PopoverMenuItem-Make member');
            expect(makeMemberMenuItem).toBeOnTheScreen();

            // Find and verify "Make admin" dropdown menu item
            const makeAdminMenuItem = screen.getByTestId('PopoverMenuItem-Make admin');
            expect(makeAdminMenuItem).toBeOnTheScreen();

            // Find and verify "Make auditor" dropdown menu item
            const makeAuditorMenuItem = screen.getByTestId('PopoverMenuItem-Make auditor');
            expect(makeAuditorMenuItem).toBeOnTheScreen();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });
    });
});
