import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalActions, ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import * as useConfirmModalModule from '@hooks/useConfirmModal';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type {SettingsNavigatorParamList, WorkspaceSplitNavigatorParamList} from '@navigation/types';

import WorkspaceMembersRolePage from '@pages/workspace/members/WorkspaceMembersRolePage';
import WorkspaceMembersPage from '@pages/workspace/WorkspaceMembersPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type {ValueOf} from 'type-fest';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import getOnyxValue from '../utils/getOnyxValue';
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

const RoleStack = createPlatformStackNavigator<SettingsNavigatorParamList>();

const renderRolePage = (policyID: string) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider, CurrentReportIDContextProvider, ModalProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <RoleStack.Navigator initialRouteName={SCREENS.WORKSPACE.MEMBERS_ROLE}>
                        <RoleStack.Screen
                            name={SCREENS.WORKSPACE.MEMBERS_ROLE}
                            component={WorkspaceMembersRolePage}
                            initialParams={{policyID}}
                        />
                    </RoleStack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
};

/**
 * The wide layout offers the bulk actions in the floating bar over the table, which gives the first few an inline
 * button and moves the rest behind "More". Opening that menu puts every action on screen at once, whichever half of
 * the bar it landed in. Only the bar's button carries this label, so the page's own "More" button is not matched.
 */
const openBulkActions = async () => {
    const moreButton = screen.queryByLabelText(TestHelper.translateLocal('common.more'));
    if (!moreButton) {
        return;
    }

    fireEvent.press(moreButton);
    await waitForBatchedUpdatesWithAct();
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
        it('should offer one Change role action instead of one action per role', async () => {
            // Given the members page with an admin selected
            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            await waitFor(() => {
                expect(screen.getByText(ADMIN_OPTION)).toBeOnTheScreen();
            });

            selectCheckboxByMemberName('Admin');

            // When the actions the bar moved behind "More" are opened
            await openBulkActions();

            // Then the bar offers Change role alongside Remove, and none of the per-role actions it replaced
            expect(screen.getByText(TestHelper.translateLocal('workspace.people.changeRole'))).toBeOnTheScreen();
            expect(screen.getByText(TestHelper.translateLocal('workspace.people.removeMembersTitle', {count: 1}))).toBeOnTheScreen();
            expect(screen.queryByText(TestHelper.translateLocal('workspace.people.makeMember', {count: 1}))).not.toBeOnTheScreen();
            expect(screen.queryByText(TestHelper.translateLocal('workspace.people.makeAdmin', {count: 1}))).not.toBeOnTheScreen();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should not offer Change role on a workspace without paid roles', async () => {
            // Given a Submit workspace, which has no roles to move a member between
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {type: CONST.POLICY.TYPE.SUBMIT});
            });

            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            await waitFor(() => {
                expect(screen.getByText(USER_OPTION)).toBeOnTheScreen();
            });

            // When a member is selected and the actions are opened
            selectCheckboxByMemberName('Member');
            await openBulkActions();

            // Then only Remove is offered
            expect(screen.getByText(TestHelper.translateLocal('workspace.people.removeMembersTitle', {count: 1}))).toBeOnTheScreen();
            expect(screen.queryByText(TestHelper.translateLocal('workspace.people.changeRole'))).not.toBeOnTheScreen();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });
    });

    describe('Role selection screen', () => {
        const roleName = (role: ValueOf<typeof CONST.POLICY.ROLE>) => TestHelper.translateLocal('workspace.common.roleName', role);
        const memberRoleName = () => TestHelper.translateLocal('common.member');

        const selectForRoleChange = async (logins: string[]) => {
            await act(async () => {
                await Onyx.set(ONYXKEYS.RAM_ONLY_WORKSPACE_MEMBERS_SELECTED_FOR_ROLE_CHANGE, {policyID: policy.id, logins});
            });
        };

        it('should offer every role the current member may assign', async () => {
            // Given an admin selected for a role change on a Control workspace
            await selectForRoleChange([adminEmail]);

            const {unmount} = renderRolePage(policy.id);
            await waitForBatchedUpdatesWithAct();

            // Then the screen lists all of the Control roles, with the selection's shared role already picked
            await waitFor(() => {
                expect(screen.getByText(roleName(CONST.POLICY.ROLE.ADMIN))).toBeOnTheScreen();
            });
            expect(screen.getByText(roleName(CONST.POLICY.ROLE.AUDITOR))).toBeOnTheScreen();
            expect(screen.getByText(roleName(CONST.POLICY.ROLE.CARD_ADMIN))).toBeOnTheScreen();
            expect(screen.getByText(roleName(CONST.POLICY.ROLE.PEOPLE_ADMIN))).toBeOnTheScreen();
            expect(screen.getByText(roleName(CONST.POLICY.ROLE.PAYMENTS_ADMIN))).toBeOnTheScreen();
            expect(screen.getByText(memberRoleName())).toBeOnTheScreen();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should only offer member and auditor to a People Admin', async () => {
            // Given a People Admin, who may assign no role above auditor
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {
                    role: CONST.POLICY.ROLE.PEOPLE_ADMIN,
                    employeeList: {[selfEmail]: {email: selfEmail, role: CONST.POLICY.ROLE.PEOPLE_ADMIN}},
                });
            });
            await selectForRoleChange([userEmail]);

            const {unmount} = renderRolePage(policy.id);
            await waitForBatchedUpdatesWithAct();

            // Then only the two roles they may assign are listed
            await waitFor(() => {
                expect(screen.getByText(roleName(CONST.POLICY.ROLE.AUDITOR))).toBeOnTheScreen();
            });
            expect(screen.getByText(memberRoleName())).toBeOnTheScreen();
            expect(screen.queryByText(roleName(CONST.POLICY.ROLE.ADMIN))).not.toBeOnTheScreen();
            expect(screen.queryByText(roleName(CONST.POLICY.ROLE.CARD_ADMIN))).not.toBeOnTheScreen();
            expect(screen.queryByText(roleName(CONST.POLICY.ROLE.PEOPLE_ADMIN))).not.toBeOnTheScreen();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should ask for a role rather than disabling Save when the selection has no role in common', async () => {
            // Given a mixed selection, which leaves the screen with nothing picked
            await selectForRoleChange([adminEmail, userEmail]);

            const {unmount} = renderRolePage(policy.id);
            await waitForBatchedUpdatesWithAct();

            // When Save is pressed without picking a role
            const saveButton = await screen.findByText(TestHelper.translateLocal('common.save'));
            fireEvent.press(saveButton, {
                nativeEvent: {},
                type: 'press',
                target: saveButton,
                currentTarget: saveButton,
            });
            await waitForBatchedUpdatesWithAct();

            // Then the screen asks for one instead of leaving the button dead
            await waitFor(() => {
                expect(screen.getByText(TestHelper.translateLocal('common.error.pleaseSelectOne'))).toBeOnTheScreen();
            });

            // When Save is pressed again with still nothing picked, the ask stays up rather than being counted as handled
            fireEvent.press(saveButton, {
                nativeEvent: {},
                type: 'press',
                target: saveButton,
                currentTarget: saveButton,
            });
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(TestHelper.translateLocal('common.error.pleaseSelectOne'))).toBeOnTheScreen();

            // When a role is then picked, the message clears
            const auditorRow = screen.getByText(roleName(CONST.POLICY.ROLE.AUDITOR));
            fireEvent.press(auditorRow, {
                nativeEvent: {},
                type: 'press',
                target: auditorRow,
                currentTarget: auditorRow,
            });
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText(TestHelper.translateLocal('common.error.pleaseSelectOne'))).not.toBeOnTheScreen();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should ignore a selection stashed on another workspace', async () => {
            // Given an admin stashed for a role change on a different workspace, as backing out of this screen there would leave behind
            await act(async () => {
                await Onyx.set(ONYXKEYS.RAM_ONLY_WORKSPACE_MEMBERS_SELECTED_FOR_ROLE_CHANGE, {policyID: 'ANOTHER_WORKSPACE', logins: [adminEmail]});
            });

            const {unmount} = renderRolePage(policy.id);
            await waitForBatchedUpdatesWithAct();

            // When Save is pressed
            const saveButton = await screen.findByText(TestHelper.translateLocal('common.save'));
            fireEvent.press(saveButton, {
                nativeEvent: {},
                type: 'press',
                target: saveButton,
                currentTarget: saveButton,
            });
            await waitForBatchedUpdatesWithAct();

            // Then the stashed admin was never adopted, so the screen has nothing picked to save
            await waitFor(() => {
                expect(screen.getByText(TestHelper.translateLocal('common.error.pleaseSelectOne'))).toBeOnTheScreen();
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should drop the selection when the screen is left without saving', async () => {
            // Given an admin selected for a role change
            await selectForRoleChange([adminEmail]);

            const {unmount} = renderRolePage(policy.id);
            await waitForBatchedUpdatesWithAct();

            // When the screen is left without saving
            unmount();
            await waitForBatchedUpdatesWithAct();

            // Then nothing is left for a later visit to act on, and the empty selection that reports a saved change is not written
            const stashedSelection = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.RAM_ONLY_WORKSPACE_MEMBERS_SELECTED_FOR_ROLE_CHANGE,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });
            expect(stashedSelection).toBeUndefined();
        });

        it('should only offer the roles that can pay when the selection holds the Authorized Payer', async () => {
            // Given a selection holding the Authorized Payer, who must stay a valid payer
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {
                    reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                    reimburser: adminEmail,
                });
            });
            await selectForRoleChange([adminEmail]);

            const {unmount} = renderRolePage(policy.id);
            await waitForBatchedUpdatesWithAct();

            // Then only Admin and Payments Admin are offered, and every role that cannot pay is withheld
            await waitFor(() => {
                expect(screen.getByText(roleName(CONST.POLICY.ROLE.PAYMENTS_ADMIN))).toBeOnTheScreen();
            });
            expect(screen.getByText(roleName(CONST.POLICY.ROLE.ADMIN))).toBeOnTheScreen();
            expect(screen.queryByText(memberRoleName())).not.toBeOnTheScreen();
            expect(screen.queryByText(roleName(CONST.POLICY.ROLE.AUDITOR))).not.toBeOnTheScreen();
            expect(screen.queryByText(roleName(CONST.POLICY.ROLE.CARD_ADMIN))).not.toBeOnTheScreen();

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

            // Open the bulk actions
            await openBulkActions();

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

        it('should reassign the submitters of a removed approver whose personal details are missing', async () => {
            // Given an approver with no personal details loaded, who a member submits to
            const approverWithoutDetails = 'nodetails@example.com';
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {
                    approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                    employeeList: {
                        [approverWithoutDetails]: {email: approverWithoutDetails, role: CONST.POLICY.ROLE.USER},
                        [userEmail]: {email: userEmail, role: CONST.POLICY.ROLE.USER, submitsTo: approverWithoutDetails},
                    },
                });
            });
            // The admin confirms the removal prompt
            const showConfirmModal = jest.fn(() => Promise.resolve({action: ModalActions.CONFIRM}));
            const confirmModalSpy = jest.spyOn(useConfirmModalModule, 'default').mockReturnValue(createMock<ReturnType<typeof useConfirmModalModule.default>>({showConfirmModal}));
            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            // When the admin removes that approver
            const row = await screen.findByLabelText(new RegExp(`^${approverWithoutDetails}`));
            fireEvent.press(within(row).getByLabelText(TestHelper.translateLocal('common.select')));
            await openBulkActions();
            const removeMenuItem = screen.getByText(TestHelper.translateLocal('workspace.people.removeMembersTitle', {count: 1}));
            fireEvent.press(removeMenuItem, {nativeEvent: {}, type: 'press', target: removeMenuItem, currentTarget: removeMenuItem});
            await waitForBatchedUpdatesWithAct();
            expect(showConfirmModal).toHaveBeenCalledTimes(1);

            // Then the approver is removed and the member is moved to the workspace owner, instead of being left
            // submitting to someone no longer on the workspace
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.employeeList?.[approverWithoutDetails]).toBeUndefined();
            expect(updatedPolicy?.employeeList?.[userEmail]?.submitsTo).toBe(ownerEmail);

            unmount();
            confirmModalSpy.mockRestore();
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

        const selectAdminAndOpenBulkActions = async () => {
            await screen.findByText(ADMIN_OPTION);
            selectCheckboxByMemberName('Admin');
            await openBulkActions();
        };

        it('should show the unable-to-remove modal when removing a RuleBot enforcing agent rules', async () => {
            await makeAdminTheRuleBot();

            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            await selectAdminAndOpenBulkActions();

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
            // Given the RuleBot selected for a role change
            await makeAdminTheRuleBot();
            await act(async () => {
                await Onyx.set(ONYXKEYS.RAM_ONLY_WORKSPACE_MEMBERS_SELECTED_FOR_ROLE_CHANGE, {policyID: policy.id, logins: [adminEmail]});
            });

            const {unmount} = renderRolePage(policy.id);
            await waitForBatchedUpdatesWithAct();

            // When a role below admin is picked and saved
            const memberRow = await screen.findByText(TestHelper.translateLocal('common.member'));
            fireEvent.press(memberRow, {
                nativeEvent: {},
                type: 'press',
                target: memberRow,
                currentTarget: memberRow,
            });
            await waitForBatchedUpdatesWithAct();

            const saveButton = screen.getByText(TestHelper.translateLocal('common.save'));
            fireEvent.press(saveButton, {
                nativeEvent: {},
                type: 'press',
                target: saveButton,
                currentTarget: saveButton,
            });
            await waitForBatchedUpdatesWithAct();

            // Then the role change is refused with the agent rules modal
            await waitFor(() => {
                expect(screen.getByText(TestHelper.translateLocal('workspace.rules.agentRules.unableToChangeRoleTitle'))).toBeOnTheScreen();
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });
    });

    describe('Secondary login invite', () => {
        it('hides an empty employeeList entry and still shows a member whose personal details are missing', async () => {
            // Given a secondary login left as an empty object after the backend nulls it and successData clears pendingAction,
            // plus a real member who has no personal details
            const secondaryEmail = 'secondary@example.com';
            const memberWithoutDetails = 'nodetails@example.com';
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {
                    employeeList: {
                        [secondaryEmail]: {},
                        [memberWithoutDetails]: {email: memberWithoutDetails, role: CONST.POLICY.ROLE.USER},
                    },
                });
            });

            // When the members page renders
            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            // Then the empty secondary entry is not a row, and the member without personal details still is
            await waitFor(() => {
                expect(screen.getAllByText(memberWithoutDetails).length).toBeGreaterThan(0);
            });
            expect(screen.queryAllByText(secondaryEmail)).toHaveLength(0);

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
            const selectedLabel = TestHelper.translateLocal('workspace.common.selected', {count: 1});
            expect(screen.getByText(selectedLabel)).toBeOnTheScreen();

            // Then clearing the search drops the selection, because it only ever applied to the searched rows
            fireEvent.changeText(searchInput, '');
            await waitForBatchedUpdatesWithAct();
            expect(screen.getByText(ADMIN_OPTION)).toBeOnTheScreen();
            expect(screen.queryByText(selectedLabel)).not.toBeOnTheScreen();
            expect(getSelectAllCheckbox()).not.toBeChecked();

            unmount();
        });
    });

    describe('Inline role editing', () => {
        it('lets a just-invited member be role-edited before their account resolves', async () => {
            // Given a member invited with optimistic personal details, which is how a new invite stays until the
            // account resolves, including while the invite is still offline
            const invitedEmail = 'invited@example.com';
            const invitedAccountID = 424242;
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.PERSONAL_DETAILS_LIST}`, {
                    [invitedAccountID]: {
                        ...TestHelper.buildPersonalDetails(invitedEmail, invitedAccountID, 'Invited'),
                        isOptimisticPersonalDetail: true,
                    },
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {
                    employeeList: {
                        [invitedEmail]: {
                            email: invitedEmail,
                            role: CONST.POLICY.ROLE.USER,
                            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                        },
                    },
                });
            });
            jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue(
                createMock<ResponsiveLayoutResult>({
                    isSmallScreenWidth: false,
                    shouldUseNarrowLayout: false,
                    isMediumScreenWidth: false,
                    isLargeScreenWidth: true,
                }),
            );

            // When the members table renders that invite on a wide layout, where the role cell can be edited inline
            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();
            const invitedRow = await screen.findByLabelText(new RegExp(`^Invited User, ${invitedEmail}`));

            // Then the role cell is editable, matching the member details pane, which does not wait for the account to resolve
            await waitFor(() => {
                expect(within(invitedRow).UNSAFE_getAllByProps({accessibilityLabel: TestHelper.translateLocal('common.edit')}).length).toBeGreaterThan(0);
            });

            unmount();
        });
    });
});
