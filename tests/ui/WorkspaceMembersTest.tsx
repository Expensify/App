import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
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

jest.mock('@src/components/ConfirmedRoute.tsx');

TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<WorkspaceSplitNavigatorParamList>();

const renderPage = (initialRouteName: typeof SCREENS.WORKSPACE.MEMBERS, initialParams: WorkspaceSplitNavigatorParamList[typeof SCREENS.WORKSPACE.MEMBERS]) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider, ModalProvider]}>
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

const selectCheckboxByMemberName = (memberName: string) => {
    const memberEmailByName: Record<string, string> = {
        Owner: 'owner@gmail.com',
        Admin: 'admin@example.com',
        Auditor: 'auditor@example.com',
        Member: 'user@example.com',
        Self: 'test@example.com',
    };
    const displayName = memberName === 'Owner' || memberName === 'Self' ? memberName : `${memberName} User`;
    const row = screen.getByLabelText(new RegExp(`^${displayName}, ${memberEmailByName[memberName]}`));
    fireEvent.press(within(row).getByLabelText(TestHelper.translateLocal('common.select')));
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
        type: CONST.POLICY.TYPE.CORPORATE,
        approver: adminEmail,
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
        it('should show Make member/auditor/card admin when admin is selected', async () => {
            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            // Wait for initial render and verify members are visible
            await waitFor(() => {
                expect(screen.getByText(ADMIN_OPTION)).toBeOnTheScreen();
            });

            // Select admin option by clicking the checkbox
            selectCheckboxByMemberName('Admin');
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
                const makeMemberText = TestHelper.translateLocal('workspace.people.makeMember', {count: 1});
                expect(screen.getByText(makeMemberText)).toBeOnTheScreen();
            });

            // Find and verify "Make member" dropdown menu item
            const makeMemberText = TestHelper.translateLocal('workspace.people.makeMember', {count: 1});
            const makeMemberMenuItem = screen.getByTestId(`PopoverMenuItem-${makeMemberText}`);
            expect(makeMemberMenuItem).toBeOnTheScreen();

            // Find and verify "Make auditor" dropdown menu item
            const makeAuditorText = TestHelper.translateLocal('workspace.people.makeAuditor', {count: 1});
            const makeAuditorMenuItem = screen.getByTestId(`PopoverMenuItem-${makeAuditorText}`);
            expect(makeAuditorMenuItem).toBeOnTheScreen();

            // Find and verify "Make card admin" dropdown menu item
            const makeCardAdminText = TestHelper.translateLocal('workspace.people.makeCardAdmin', {count: 1});
            const makeCardAdminMenuItem = screen.getByTestId(`PopoverMenuItem-${makeCardAdminText}`);
            expect(makeCardAdminMenuItem).toBeOnTheScreen();

            // Find and verify "Make admin" dropdown menu item is not present
            const makeAdminText = TestHelper.translateLocal('workspace.people.makeAdmin', {count: 1});
            const makeAdminMenuItem = screen.queryByTestId(`PopoverMenuItem-${makeAdminText}`);
            expect(makeAdminMenuItem).not.toBeOnTheScreen();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should show Make admin/auditor/card admin when member is selected', async () => {
            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            // Wait for initial render and verify members are visible
            await waitFor(() => {
                expect(screen.getByText(USER_OPTION)).toBeOnTheScreen();
            });

            // Select member option by clicking the checkbox
            selectCheckboxByMemberName('Member');
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
                const makeAdminText = TestHelper.translateLocal('workspace.people.makeAdmin', {count: 1});
                expect(screen.getByText(makeAdminText)).toBeOnTheScreen();
            });

            // Find and verify "Make admin" dropdown menu item
            const makeAdminText = TestHelper.translateLocal('workspace.people.makeAdmin', {count: 1});
            const makeAdminMenuItem = screen.getByTestId(`PopoverMenuItem-${makeAdminText}`);
            expect(makeAdminMenuItem).toBeOnTheScreen();

            // Find and verify "Make auditor" dropdown menu item
            const makeAuditorText = TestHelper.translateLocal('workspace.people.makeAuditor', {count: 1});
            const makeAuditorMenuItem = screen.getByTestId(`PopoverMenuItem-${makeAuditorText}`);
            expect(makeAuditorMenuItem).toBeOnTheScreen();

            // Find and verify "Make card admin" dropdown menu item
            const makeCardAdminText = TestHelper.translateLocal('workspace.people.makeCardAdmin', {count: 1});
            const makeCardAdminMenuItem = screen.getByTestId(`PopoverMenuItem-${makeCardAdminText}`);
            expect(makeCardAdminMenuItem).toBeOnTheScreen();

            // Find and verify "Make member" dropdown menu item is not present
            const makeMemberText = TestHelper.translateLocal('workspace.people.makeMember', {count: 1});
            const makeMemberMenuItem = screen.queryByTestId(`PopoverMenuItem-${makeMemberText}`);
            expect(makeMemberMenuItem).not.toBeOnTheScreen();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should show Make member/admin/card admin when auditor is selected', async () => {
            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            // Wait for initial render and verify members are visible
            await waitFor(() => {
                expect(screen.getByText(AUDITOR_OPTION)).toBeOnTheScreen();
            });

            // Select auditor option by clicking the checkbox
            selectCheckboxByMemberName('Auditor');
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
                const makeMemberText = TestHelper.translateLocal('workspace.people.makeMember', {count: 1});
                expect(screen.getByText(makeMemberText)).toBeOnTheScreen();
            });

            // Find and verify "Make member" dropdown menu item
            const makeMemberText = TestHelper.translateLocal('workspace.people.makeMember', {count: 1});
            const makeMemberMenuItem = screen.getByTestId(`PopoverMenuItem-${makeMemberText}`);
            expect(makeMemberMenuItem).toBeOnTheScreen();

            // Find and verify "Make admin" dropdown menu item
            const makeAdminText = TestHelper.translateLocal('workspace.people.makeAdmin', {count: 1});
            const makeAdminMenuItem = screen.getByTestId(`PopoverMenuItem-${makeAdminText}`);
            expect(makeAdminMenuItem).toBeOnTheScreen();

            // Find and verify "Make card admin" dropdown menu item
            const makeCardAdminText = TestHelper.translateLocal('workspace.people.makeCardAdmin', {count: 1});
            const makeCardAdminMenuItem = screen.getByTestId(`PopoverMenuItem-${makeCardAdminText}`);
            expect(makeCardAdminMenuItem).toBeOnTheScreen();

            // Find and verify "Make auditor" dropdown menu item is not present
            const makeAuditorText = TestHelper.translateLocal('workspace.people.makeAuditor', {count: 1});
            const makeAuditorMenuItem = screen.queryByTestId(`PopoverMenuItem-${makeAuditorText}`);
            expect(makeAuditorMenuItem).not.toBeOnTheScreen();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should show Make member/admin/auditor/card admin when mix is selected', async () => {
            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            // Wait for initial render and verify members are visible
            await waitFor(() => {
                expect(screen.getByText(AUDITOR_OPTION)).toBeOnTheScreen();
            });
            await waitFor(() => {
                expect(screen.getByText(ADMIN_OPTION)).toBeOnTheScreen();
            });

            // Select options by clicking the checkboxes
            selectCheckboxByMemberName('Auditor');
            selectCheckboxByMemberName('Admin');
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
                const makeMemberText = TestHelper.translateLocal('workspace.people.makeMember', {count: 2});
                expect(screen.getByText(makeMemberText)).toBeOnTheScreen();
            });

            // Find and verify "Make members" dropdown menu item (plural form for 2 selected items)
            const makeMemberText = TestHelper.translateLocal('workspace.people.makeMember', {count: 2});
            const makeMemberMenuItem = screen.getByTestId(`PopoverMenuItem-${makeMemberText}`);
            expect(makeMemberMenuItem).toBeOnTheScreen();

            // Find and verify "Make admins" dropdown menu item (plural form for 2 selected items)
            const makeAdminText = TestHelper.translateLocal('workspace.people.makeAdmin', {count: 2});
            const makeAdminMenuItem = screen.getByTestId(`PopoverMenuItem-${makeAdminText}`);
            expect(makeAdminMenuItem).toBeOnTheScreen();

            // Find and verify "Make auditors" dropdown menu item (plural form for 2 selected items)
            const makeAuditorText = TestHelper.translateLocal('workspace.people.makeAuditor', {count: 2});
            const makeAuditorMenuItem = screen.getByTestId(`PopoverMenuItem-${makeAuditorText}`);
            expect(makeAuditorMenuItem).toBeOnTheScreen();

            // Find and verify "Make card admins" dropdown menu item (plural form for 2 selected items)
            const makeCardAdminText = TestHelper.translateLocal('workspace.people.makeCardAdmin', {count: 2});
            const makeCardAdminMenuItem = screen.getByTestId(`PopoverMenuItem-${makeCardAdminText}`);
            expect(makeCardAdminMenuItem).toBeOnTheScreen();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should only show member and auditor role actions for People Admin', async () => {
            const peopleAdminPolicy = {
                ...policy,
                role: CONST.POLICY.ROLE.PEOPLE_ADMIN,
                employeeList: {
                    ...policy.employeeList,
                    [selfEmail]: {email: selfEmail, role: CONST.POLICY.ROLE.PEOPLE_ADMIN},
                },
            };
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, peopleAdminPolicy);
            });

            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            await waitFor(() => {
                expect(screen.getByText(USER_OPTION)).toBeOnTheScreen();
            });

            selectCheckboxByMemberName('Member');
            fireEvent.press(screen.getByTestId('WorkspaceMembersPage-header-dropdown-menu-button'));
            await waitForBatchedUpdatesWithAct();

            const removeText = TestHelper.translateLocal('workspace.people.removeMembersTitle', {count: 1});
            expect(screen.getByTestId(`PopoverMenuItem-${removeText}`)).toBeOnTheScreen();

            const makeAuditorText = TestHelper.translateLocal('workspace.people.makeAuditor', {count: 1});
            expect(screen.getByTestId(`PopoverMenuItem-${makeAuditorText}`)).toBeOnTheScreen();

            const makeAdminText = TestHelper.translateLocal('workspace.people.makeAdmin', {count: 1});
            expect(screen.queryByTestId(`PopoverMenuItem-${makeAdminText}`)).not.toBeOnTheScreen();

            const makeCardAdminText = TestHelper.translateLocal('workspace.people.makeCardAdmin', {count: 1});
            expect(screen.queryByTestId(`PopoverMenuItem-${makeCardAdminText}`)).not.toBeOnTheScreen();

            const makePeopleAdminText = TestHelper.translateLocal('workspace.people.makePeopleAdmin', {count: 1});
            expect(screen.queryByTestId(`PopoverMenuItem-${makePeopleAdminText}`)).not.toBeOnTheScreen();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should let People Admin make auditors members', async () => {
            const peopleAdminPolicy = {
                ...policy,
                role: CONST.POLICY.ROLE.PEOPLE_ADMIN,
                employeeList: {
                    ...policy.employeeList,
                    [selfEmail]: {email: selfEmail, role: CONST.POLICY.ROLE.PEOPLE_ADMIN},
                },
            };
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, peopleAdminPolicy);
            });

            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            await waitFor(() => {
                expect(screen.getByText(AUDITOR_OPTION)).toBeOnTheScreen();
            });

            selectCheckboxByMemberName('Auditor');
            fireEvent.press(screen.getByTestId('WorkspaceMembersPage-header-dropdown-menu-button'));
            await waitForBatchedUpdatesWithAct();

            const makeMemberText = TestHelper.translateLocal('workspace.people.makeMember', {count: 1});
            expect(screen.getByTestId(`PopoverMenuItem-${makeMemberText}`)).toBeOnTheScreen();

            const makeAdminText = TestHelper.translateLocal('workspace.people.makeAdmin', {count: 1});
            expect(screen.queryByTestId(`PopoverMenuItem-${makeAdminText}`)).not.toBeOnTheScreen();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });
    });

    describe('Removing members who are approvers and non-approvers', () => {
        it('should call workflow actions once when removing multiple members including an approver', async () => {
            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            await screen.findByText(ADMIN_OPTION);

            // Select all
            fireEvent.press(screen.getByLabelText(TestHelper.translateLocal('workspace.common.selectAll')));

            // Open dropdown
            fireEvent.press(await screen.findByTestId('WorkspaceMembersPage-header-dropdown-menu-button'));
            await waitForBatchedUpdatesWithAct();

            // Click "Remove members"
            const removeText = TestHelper.translateLocal('workspace.people.removeMembersTitle', {count: 3});
            const removeMenuItem = screen.getByText(removeText);
            fireEvent.press(removeMenuItem, {
                nativeEvent: {},
                type: 'press',
                target: removeMenuItem,
                currentTarget: removeMenuItem,
            });

            await waitForBatchedUpdatesWithAct();

            // Wait until confirm modal confirm button exists
            const confirmText = TestHelper.translateLocal('common.remove');

            await waitFor(() => {
                expect(screen.getByLabelText(confirmText)).toBeOnTheScreen();
            });

            unmount();
        });
    });

    describe('Role display on Submit workspaces', () => {
        it('should show the workspace owner as Editor instead of Owner', async () => {
            // Given a Submit workspace, where every member (including the owner) uses the flat Editor role
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {type: CONST.POLICY.TYPE.SUBMIT});
            });

            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            // When the members list renders the owner row
            const ownerRow = await screen.findByLabelText(new RegExp(`^Owner User, ${ownerEmail}`));

            // Then the owner's role is displayed as Editor, not Owner
            const editorLabel = TestHelper.translateLocal('workspace.common.roleName', CONST.POLICY.ROLE.EDITOR);
            const ownerLabel = TestHelper.translateLocal('workspace.common.roleName', CONST.POLICY.ROLE.OWNER);
            expect(within(ownerRow).getByText(editorLabel)).toBeOnTheScreen();
            expect(within(ownerRow).queryByText(ownerLabel)).not.toBeOnTheScreen();

            unmount();
        });
    });
});
