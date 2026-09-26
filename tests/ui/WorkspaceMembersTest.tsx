import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react-native';

import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
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

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@src/components/ConfirmedRoute.tsx');

TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<WorkspaceSplitNavigatorParamList>();

const renderPage = (initialRouteName: typeof SCREENS.WORKSPACE.MEMBERS, initialParams: WorkspaceSplitNavigatorParamList[typeof SCREENS.WORKSPACE.MEMBERS]) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider, CurrentReportIDContextProvider, ModalProvider]}>
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
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue(
            createMock<ResponsiveLayoutResult>({
                isSmallScreenWidth: false,
                shouldUseNarrowLayout: false,
            }),
        );
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
            const bulkActionsDropdown = screen.UNSAFE_getAllByType(ButtonWithDropdownMenu).find(({props}) => props.testID === dropdownMenuButtonTestID);
            expect(bulkActionsDropdown?.props.shouldPopoverUseScrollView).toBe(true);
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

        it('should hide demotions but offer Make payments admin when the selected member is the Authorized Payer resolved via policy.reimburser', async () => {
            // Given a workspace whose Authorized Payer is an admin configured through policy.reimburser
            // (the canonical resolution) rather than achAccount.reimburser. Demotions to roles that cannot
            // pay must stay hidden, but changing to Payments Admin (the other valid payer role) must be offered.
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {
                    reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                    reimburser: adminEmail,
                });
            });

            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            await waitFor(() => {
                expect(screen.getByText(ADMIN_OPTION)).toBeOnTheScreen();
            });

            // When that payer is bulk-selected and the actions dropdown is opened
            selectCheckboxByMemberName('Admin');
            fireEvent.press(await screen.findByTestId('WorkspaceMembersPage-header-dropdown-menu-button'));
            await waitForBatchedUpdatesWithAct();

            // Then the Remove option is still available
            const removeText = TestHelper.translateLocal('workspace.people.removeMembersTitle', {count: 1});
            await waitFor(() => {
                expect(screen.getByTestId(`PopoverMenuItem-${removeText}`)).toBeOnTheScreen();
            });

            // ...the demotions that would strip the payer of pay capability are hidden
            const makeMemberText = TestHelper.translateLocal('workspace.people.makeMember', {count: 1});
            expect(screen.queryByTestId(`PopoverMenuItem-${makeMemberText}`)).not.toBeOnTheScreen();

            const makeAuditorText = TestHelper.translateLocal('workspace.people.makeAuditor', {count: 1});
            expect(screen.queryByTestId(`PopoverMenuItem-${makeAuditorText}`)).not.toBeOnTheScreen();

            const makeCardAdminText = TestHelper.translateLocal('workspace.people.makeCardAdmin', {count: 1});
            expect(screen.queryByTestId(`PopoverMenuItem-${makeCardAdminText}`)).not.toBeOnTheScreen();

            // ...but Make payments admin IS offered — Payments Admin is a valid payer role
            const makePaymentsAdminText = TestHelper.translateLocal('workspace.people.makePaymentsAdmin', {count: 1});
            expect(screen.getByTestId(`PopoverMenuItem-${makePaymentsAdminText}`)).toBeOnTheScreen();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should offer Make workspace admin but hide demotions when the selected member is a Payments Admin who is the Authorized Payer', async () => {
            // Given a Payments Admin who is also the Authorized Payer. Admin and Payments Admin are both valid
            // payer roles, so promoting this payer to Admin keeps them a valid payer and must be offered.
            // Every demotion to a role that cannot pay (Member, Auditor, Card Admin) stays gated on the payer.
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {
                    reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                    reimburser: userEmail,
                    employeeList: {
                        [userEmail]: {email: userEmail, role: CONST.POLICY.ROLE.PAYMENTS_ADMIN},
                    },
                });
            });

            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            await waitFor(() => {
                expect(screen.getByText(USER_OPTION)).toBeOnTheScreen();
            });

            // When that payer is bulk-selected and the actions dropdown is opened
            selectCheckboxByMemberName('Member');
            fireEvent.press(await screen.findByTestId('WorkspaceMembersPage-header-dropdown-menu-button'));
            await waitForBatchedUpdatesWithAct();

            // Then the Remove option is still available
            const removeText = TestHelper.translateLocal('workspace.people.removeMembersTitle', {count: 1});
            await waitFor(() => {
                expect(screen.getByTestId(`PopoverMenuItem-${removeText}`)).toBeOnTheScreen();
            });

            // ...and "Make workspace admin" IS offered — Admin is a valid payer role
            const makeAdminText = TestHelper.translateLocal('workspace.people.makeAdmin', {count: 1});
            expect(screen.getByTestId(`PopoverMenuItem-${makeAdminText}`)).toBeOnTheScreen();

            // ...but the demotions that would strip the payer of pay capability stay hidden
            const makeMemberText = TestHelper.translateLocal('workspace.people.makeMember', {count: 1});
            expect(screen.queryByTestId(`PopoverMenuItem-${makeMemberText}`)).not.toBeOnTheScreen();

            const makeAuditorText = TestHelper.translateLocal('workspace.people.makeAuditor', {count: 1});
            expect(screen.queryByTestId(`PopoverMenuItem-${makeAuditorText}`)).not.toBeOnTheScreen();

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

            // The prompt resolves the approver's and workspace owner's display names through the translate-aware pipeline
            const warningPrompt = TestHelper.translateLocal('workspace.people.removeMembersWarningPrompt', 'Admin User', 'Owner User');
            expect(screen.getByText(warningPrompt)).toBeOnTheScreen();

            unmount();
        });
    });

    describe('RuleBot restrictions', () => {
        const makeAdminTheRuleBot = async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {
                    ruleBotAccountID: adminAccountID,
                    rules: {
                        agentRules: {
                            rule1: {ruleID: 'rule1', prompt: 'Flag all weekend expenses', created: '2025-01-01 00:00:00'},
                        },
                    },
                });
            });
        };

        const selectAdminAndOpenDropdown = async () => {
            await screen.findByText(ADMIN_OPTION);
            selectCheckboxByMemberName('Admin');
            fireEvent.press(await screen.findByTestId('WorkspaceMembersPage-header-dropdown-menu-button'));
            await waitForBatchedUpdatesWithAct();
        };

        it('should show the unable-to-remove modal when removing a RuleBot enforcing agent rules', async () => {
            await makeAdminTheRuleBot();

            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            await selectAdminAndOpenDropdown();

            const removeMenuItem = screen.getByText(TestHelper.translateLocal('workspace.people.removeMembersTitle', {count: 1}));
            fireEvent.press(removeMenuItem, {
                nativeEvent: {},
                type: 'press',
                target: removeMenuItem,
                currentTarget: removeMenuItem,
            });
            await waitForBatchedUpdatesWithAct();

            await waitFor(() => {
                expect(screen.getByText(TestHelper.translateLocal('workspace.rules.agentRules.unableToRemoveTitle'))).toBeOnTheScreen();
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should show the unable-to-change-role modal when demoting a RuleBot enforcing agent rules', async () => {
            await makeAdminTheRuleBot();

            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            await selectAdminAndOpenDropdown();

            const makeMemberMenuItem = screen.getByText(TestHelper.translateLocal('workspace.people.makeMember', {count: 1}));
            fireEvent.press(makeMemberMenuItem, {
                nativeEvent: {},
                type: 'press',
                target: makeMemberMenuItem,
                currentTarget: makeMemberMenuItem,
            });
            await waitForBatchedUpdatesWithAct();

            await waitFor(() => {
                expect(screen.getByText(TestHelper.translateLocal('workspace.rules.agentRules.unableToChangeRoleTitle'))).toBeOnTheScreen();
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
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

    describe('Approver column', () => {
        const approverHeaderLabel = () => TestHelper.translateLocal('workflowsPage.approver');

        it("shows each member's first approver, blank for the self-approving admin", async () => {
            // Given a policy with approvals on and every member (including the admin) submitting to the admin:
            // the admin's own first approver resolves to themselves, so their row is treated as having no approver.
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {
                    approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                    employeeList: {
                        [ownerEmail]: {email: ownerEmail, role: CONST.POLICY.ROLE.ADMIN, submitsTo: adminEmail},
                        [adminEmail]: {email: adminEmail, role: CONST.POLICY.ROLE.ADMIN, submitsTo: adminEmail},
                        [auditorEmail]: {email: auditorEmail, role: CONST.POLICY.ROLE.AUDITOR, submitsTo: adminEmail},
                        [userEmail]: {email: userEmail, role: CONST.POLICY.ROLE.USER, submitsTo: adminEmail},
                        [selfEmail]: {email: selfEmail, role: CONST.POLICY.ROLE.ADMIN, submitsTo: adminEmail},
                    },
                });
            });

            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByLabelText(approverHeaderLabel())).toBeOnTheScreen();

            const ownerRow = await screen.findByLabelText(new RegExp(`^Owner User, ${ownerEmail}, ${TestHelper.translateLocal('common.approver')}: Admin User`));
            expect(ownerRow).toBeOnTheScreen();

            // No "Approver: ..." segment between the email and the role label proves the admin's own row was
            // treated as having no approver, rather than the assertion just missing a rendered Text node (the
            // segment lives only in the row's accessibilityLabel, nothing else renders it).
            const adminRoleLabel = TestHelper.translateLocal('workspace.common.roleName', CONST.POLICY.ROLE.ADMIN);
            const adminRow = screen.getByLabelText(new RegExp(`^Admin User, ${adminEmail}, ${adminRoleLabel}$`));
            expect(adminRow).toBeOnTheScreen();

            unmount();
        });

        it('hides the column when approvals are turned off', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL});
            });

            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            await waitFor(() => {
                expect(screen.getByText(ADMIN_OPTION)).toBeOnTheScreen();
            });
            expect(screen.queryByLabelText(approverHeaderLabel())).not.toBeOnTheScreen();

            unmount();
        });

        it('hides the column on narrow layout', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC});
            });
            jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue(
                createMock<ResponsiveLayoutResult>({
                    isSmallScreenWidth: true,
                    shouldUseNarrowLayout: true,
                }),
            );

            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            await waitFor(() => {
                expect(screen.getByText(ADMIN_OPTION)).toBeOnTheScreen();
            });
            expect(screen.queryByLabelText(approverHeaderLabel())).not.toBeOnTheScreen();

            unmount();
        });

        it("keeps the column while a removed approver's submitsTo is still resolving", async () => {
            // Given approvals are on but no member has a resolved `submitsTo` yet (the base fixture's employeeList
            // entries have none, e.g. the admin's own approver was just removed and the server hasn't responded):
            // the derived approver map is empty, but the column must stay, since it is gated on approvals being
            // enabled, not on the map having entries.
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC});
            });

            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            await waitFor(() => {
                expect(screen.getByText(ADMIN_OPTION)).toBeOnTheScreen();
            });
            expect(screen.getByLabelText(approverHeaderLabel())).toBeOnTheScreen();

            unmount();
        });

        it('shows the default approver for a member whose workflow a downgrade stopped enforcing', async () => {
            // Given a workspace downgraded out of advanced approvals, where the owner still submits to the auditor:
            // the workflow is gone from the Workflows tab, since a non-advanced mode enforces only its default
            // workflow, but the owner's `submitsTo` survives the downgrade, so the approver it names is still
            // derivable here. The owner submits to the default approver like everyone else now, so the admin is the
            // approver to show. `signInWithTestUser` puts this suite on every beta, and the Workflows tab keeps all
            // workflows under the multiple-approvers beta, so the beta is cleared to match the tab's own behavior.
            await act(async () => {
                await Onyx.set(ONYXKEYS.BETAS, []);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {
                    type: CONST.POLICY.TYPE.TEAM,
                    approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                    approver: adminEmail,
                    employeeList: {
                        [ownerEmail]: {email: ownerEmail, role: CONST.POLICY.ROLE.ADMIN, submitsTo: auditorEmail},
                        [adminEmail]: {email: adminEmail, role: CONST.POLICY.ROLE.ADMIN, submitsTo: adminEmail},
                        [auditorEmail]: {email: auditorEmail, role: CONST.POLICY.ROLE.AUDITOR, submitsTo: adminEmail},
                    },
                });
            });

            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            // The auditor submits to the default approver, so their approver shows unchanged.
            const approverLabel = TestHelper.translateLocal('common.approver');
            expect(await screen.findByLabelText(new RegExp(`^Auditor User, ${auditorEmail}, ${approverLabel}: Admin User`))).toBeOnTheScreen();

            // The owner falls back to the default approver rather than keeping the auditor the downgrade dropped.
            expect(screen.getByLabelText(new RegExp(`^Owner User, ${ownerEmail}, ${approverLabel}: Admin User`))).toBeOnTheScreen();

            unmount();
        });

        it('falls every member back to the default approver when no workflow is the default one', async () => {
            // Given a downgraded workspace where the admin approves everyone and the auditor approves the admin,
            // while the default approver is still the owner: neither workflow is the enforced one, so every member
            // submits to the owner. Betas are cleared for the same reason as the test above.
            await act(async () => {
                await Onyx.set(ONYXKEYS.BETAS, []);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {
                    type: CONST.POLICY.TYPE.TEAM,
                    approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                    approver: ownerEmail,
                    employeeList: {
                        [ownerEmail]: {email: ownerEmail, role: CONST.POLICY.ROLE.ADMIN, submitsTo: adminEmail},
                        [adminEmail]: {email: adminEmail, role: CONST.POLICY.ROLE.ADMIN, submitsTo: auditorEmail},
                        [auditorEmail]: {email: auditorEmail, role: CONST.POLICY.ROLE.AUDITOR, submitsTo: adminEmail},
                    },
                });
            });

            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            const approverLabel = TestHelper.translateLocal('common.approver');
            expect(await screen.findByLabelText(new RegExp(`^Auditor User, ${auditorEmail}, ${approverLabel}: Owner User`))).toBeOnTheScreen();
            expect(screen.getByLabelText(new RegExp(`^Admin User, ${adminEmail}, ${approverLabel}: Owner User`))).toBeOnTheScreen();

            // The owner is the default approver, so they approve their own expenses and no approver shows.
            const roleLabel = TestHelper.translateLocal('workspace.common.roleName', CONST.POLICY.ROLE.OWNER);
            expect(screen.getByLabelText(new RegExp(`^Owner User, ${ownerEmail}, ${roleLabel}$`))).toBeOnTheScreen();

            unmount();
        });
    });

    describe('Selection and search', () => {
        it('should clear a Select All made inside a search once the search field is cleared', async () => {
            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            await waitFor(() => {
                expect(screen.getByText(ADMIN_OPTION)).toBeOnTheScreen();
            });

            // Given a search that narrows the list to a subset of the members
            const searchInput = screen.getByPlaceholderText(TestHelper.translateLocal('workspace.people.findMember'));
            fireEvent.changeText(searchInput, auditorEmail);
            await waitForBatchedUpdatesWithAct();
            expect(screen.queryByText(ADMIN_OPTION)).not.toBeOnTheScreen();

            // When every visible row is selected via the header checkbox
            // The table renders a second, hidden header for width measurement, so the label is not unique
            const selectAllLabel = TestHelper.translateLocal('workspace.common.selectAll');
            const getSelectAllCheckbox = () => {
                const checkbox = screen.getAllByLabelText(selectAllLabel).at(0);
                if (!checkbox) {
                    throw new Error('No Select all checkbox rendered');
                }
                return checkbox;
            };
            fireEvent.press(getSelectAllCheckbox());
            await waitForBatchedUpdatesWithAct();
            expect(screen.getByTestId('WorkspaceMembersPage-header-dropdown-menu-button')).toBeOnTheScreen();

            // Then clearing the search drops the selection, because it only ever applied to the searched rows
            fireEvent.changeText(searchInput, '');
            await waitForBatchedUpdatesWithAct();
            expect(screen.getByText(ADMIN_OPTION)).toBeOnTheScreen();
            expect(screen.queryByTestId('WorkspaceMembersPage-header-dropdown-menu-button')).not.toBeOnTheScreen();
            expect(getSelectAllCheckbox()).not.toBeChecked();

            unmount();
        });
    });
});
