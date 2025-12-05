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
import {removeApprovalWorkflow} from '@libs/actions/Workflow';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import {updateWorkflowDataOnApproverRemoval} from '@libs/WorkflowUtils';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import WorkspaceMembersPage from '@pages/workspace/WorkspaceMembersPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.unmock('react-native-reanimated');
jest.unmock('react-native-worklets');

jest.mock('@src/components/ConfirmedRoute.tsx');

jest.mock('@libs/WorkflowUtils', () => {
    // eslint-disable-next-line
    const actual = jest.requireActual('@libs/WorkflowUtils');
    // eslint-disable-next-line
    return {
        ...actual,
        updateWorkflowDataOnApproverRemoval: jest.fn(() => [{members: [], approvers: [], isDefault: false, removeApprovalWorkflow: true}]),
    };
});

jest.mock('@libs/actions/Workflow', () => {
    // eslint-disable-next-line
    const actual = jest.requireActual('@libs/actions/Workflow');
    // eslint-disable-next-line
    return {
        ...actual,
        removeApprovalWorkflow: jest.fn(),
    };
});

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

            // Find and verify "Make admin" dropdown menu item is not present
            const makeAdminText = TestHelper.translateLocal('workspace.people.makeAdmin', {count: 1});
            const makeAdminMenuItem = screen.queryByTestId(`PopoverMenuItem-${makeAdminText}`);
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

            // Find and verify "Make member" dropdown menu item is not present
            const makeMemberText = TestHelper.translateLocal('workspace.people.makeMember', {count: 1});
            const makeMemberMenuItem = screen.queryByTestId(`PopoverMenuItem-${makeMemberText}`);
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

            // Find and verify "Make auditor" dropdown menu item is not present
            const makeAuditorText = TestHelper.translateLocal('workspace.people.makeAuditor', {count: 1});
            const makeAuditorMenuItem = screen.queryByTestId(`PopoverMenuItem-${makeAuditorText}`);
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
            fireEvent.press(screen.getByTestId('selection-list-select-all-checkbox'));

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

            // Press confirm button
            fireEvent.press(screen.getByLabelText(confirmText));

            await waitForBatchedUpdatesWithAct();

            // Verify workflow actions are only called once when an approver is removed
            expect(updateWorkflowDataOnApproverRemoval).toHaveBeenCalledTimes(1);
            expect(removeApprovalWorkflow).toHaveBeenCalledTimes(1);

            unmount();
            await waitForBatchedUpdatesWithAct();
        });
    });
});
