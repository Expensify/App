import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalActions, ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import PersonalDetailsByLoginProvider from '@components/PersonalDetailsByLoginProvider';

import * as useConfirmModalModule from '@hooks/useConfirmModal';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import useNetwork from '@hooks/useNetwork';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type {SettingsNavigatorParamList, WorkspaceSplitNavigatorParamList} from '@navigation/types';

import WorkspaceMembersRolePage from '@pages/workspace/members/WorkspaceMembersRolePage';
import WorkspaceMembersPage from '@pages/workspace/WorkspaceMembersPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {OfficeLocation} from '@src/types/onyx/Policy';

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
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));

const hasPendingOpacity = (style: unknown): boolean => {
    const entries: unknown[] = Array.isArray(style) ? style : [style];
    return entries.some((entry) => {
        if (!entry || typeof entry !== 'object' || !('opacity' in entry)) {
            return false;
        }
        const {opacity} = entry;
        return opacity === 0.5;
    });
};

TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<WorkspaceSplitNavigatorParamList>();

const renderPage = (initialRouteName: typeof SCREENS.WORKSPACE.MEMBERS, initialParams: WorkspaceSplitNavigatorParamList[typeof SCREENS.WORKSPACE.MEMBERS]) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider, CurrentReportIDContextProvider, ModalProvider, PersonalDetailsByLoginProvider]}>
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
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider, CurrentReportIDContextProvider, ModalProvider, PersonalDetailsByLoginProvider]}>
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
                        connection.unsubscribe();
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

    describe('Approver column', () => {
        const approverHeaderLabel = () => TestHelper.translateLocal('workflowsPage.approver');

        it("shows each member's first approver, including the admin who approves themselves", async () => {
            // Given a policy with approvals on and every member (including the admin) submitting to the admin:
            // the admin's own first approver resolves to themselves, which is what the Workflows tab shows too.
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

            const adminRow = screen.getByLabelText(new RegExp(`^Admin User, ${adminEmail}, ${TestHelper.translateLocal('common.approver')}: Admin User`));
            expect(adminRow).toBeOnTheScreen();

            unmount();
        });

        it('dims only the approver cell while approvals are being turned back on offline', async () => {
            // Given approvals being re-enabled offline. That rewrites who everyone submits to, but it marks the
            // policy rather than the employees, so the row has no field of its own to read the change from.
            const mockedUseNetwork = jest.mocked(useNetwork);
            mockedUseNetwork.mockReturnValue({isOffline: true});

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {
                    approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                    pendingFields: {approvalMode: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                    employeeList: {
                        [ownerEmail]: {email: ownerEmail, role: CONST.POLICY.ROLE.ADMIN, submitsTo: adminEmail},
                        [adminEmail]: {email: adminEmail, role: CONST.POLICY.ROLE.ADMIN, submitsTo: adminEmail},
                    },
                });
            });

            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            const ownerRow = await screen.findByLabelText(new RegExp(`^Owner User, ${ownerEmail}, ${TestHelper.translateLocal('common.approver')}: Admin User`));

            // Only the approver is mid-change, so the dim belongs to that cell. Dimming the row instead would read
            // as the whole member being mid-change, and it would come and go with the column's own layout rules.
            let node: typeof ownerRow | null = ownerRow;
            let isRowDimmed = false;
            while (node && !isRowDimmed) {
                isRowDimmed = hasPendingOpacity(node.props?.style);
                node = node.parent;
            }
            expect(isRowDimmed).toBe(false);
            expect(ownerRow.findAll((descendant) => hasPendingOpacity(descendant.props?.style))).not.toHaveLength(0);

            mockedUseNetwork.mockReturnValue({isOffline: false});
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

        it('hides the column when approvals are on but no member has an approver', async () => {
            // Given approvals are on while no member submits to anyone, so the derived approver map is empty and the
            // column would render blank for every row.
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC});
            });

            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            await waitFor(() => {
                expect(screen.getByText(ADMIN_OPTION)).toBeOnTheScreen();
            });
            expect(screen.queryByLabelText(approverHeaderLabel())).not.toBeOnTheScreen();

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

            // The owner is the default approver, so they approve their own expenses and show as their own approver.
            expect(screen.getByLabelText(new RegExp(`^Owner User, ${ownerEmail}, ${approverLabel}: Owner User`))).toBeOnTheScreen();

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

    describe('Office locations and work arrangements', () => {
        const officeLocations: Record<string, OfficeLocation> = {
            OFFICE1: {name: 'Headquarters', address: {addressStreet: '88 Kearny St', city: 'San Francisco', state: 'CA', zipCode: '94108', country: 'US'}, isDefault: true},
            OFFICE2: {name: 'New Jersey Office', address: {addressStreet: '900 Asbury Ave', city: 'Ocean City', state: 'NJ', zipCode: '08226', country: 'US'}},
        };
        const officeLocationsPolicy = {
            ...policy,
            officeLocations,
            commuterExclusions: {method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE},
            employeeList: {
                ...policy.employeeList,
                [userEmail]: {email: userEmail, role: CONST.POLICY.ROLE.USER, officeID: 'OFFICE2'},
            },
        };

        const openBulkActionsForMember = async () => {
            await screen.findByText(USER_OPTION);
            selectCheckboxByMemberName('Member');
            await waitForBatchedUpdatesWithAct();
            await openBulkActions();
        };

        beforeEach(async () => {
            await act(async () => {
                await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.COMMUTER_EXCLUSIONS_ARRANGEMENTS]);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, officeLocationsPolicy);
            });
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should show the office of each member, and the primary office for members without one', async () => {
            // Given a workspace with offices where only one member is assigned to an office
            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();
            await screen.findByText(USER_OPTION);

            // Then the office location column shows the assigned office, and the primary office for everyone else
            expect(screen.getByText(TestHelper.translateLocal('workspace.people.officeLocation'))).toBeOnTheScreen();
            expect(screen.getByText('New Jersey Office')).toBeOnTheScreen();
            expect(screen.getAllByText('Headquarters')).toHaveLength(Object.keys(policy.employeeList).length - 1);

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should show the company address for every member when the workspace has no other office', async () => {
            // Given a workspace whose only office is its company address
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {
                    address: {addressStreet: '1 Market St', city: 'San Francisco', state: 'CA', zipCode: '94105', country: 'US'},
                    officeLocations: null,
                    employeeList: {[userEmail]: {officeID: null}},
                });
            });
            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();
            await screen.findByText(USER_OPTION);

            // Then the office location column shows the company address for every member, as it counts as an office
            expect(screen.getByText(TestHelper.translateLocal('workspace.people.officeLocation'))).toBeOnTheScreen();
            expect(screen.getAllByText(TestHelper.translateLocal('common.companyAddress'))).toHaveLength(Object.keys(policy.employeeList).length);

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should hand the selected members to the office location picker', async () => {
            // Given an admin who selected a member
            const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();
            await openBulkActionsForMember();

            // When they choose to change the office location
            expect(screen.getByText(TestHelper.translateLocal('workspace.people.changeWorkArrangement'))).toBeOnTheScreen();
            const changeOfficeLocationItem = screen.getByText(TestHelper.translateLocal('workspace.people.changeOfficeLocation'));
            fireEvent.press(changeOfficeLocationItem, {
                nativeEvent: {},
                type: 'press',
                target: changeOfficeLocationItem,
                currentTarget: changeOfficeLocationItem,
            });
            await waitForBatchedUpdatesWithAct();

            // Then the office location picker opens for that member
            await waitFor(() => {
                expect(navigateSpy).toHaveBeenCalledWith(ROUTES.WORKSPACE_MEMBERS_CHANGE_OFFICE_LOCATION.getRoute(policy.id));
            });
            expect(await getOnyxValue(ONYXKEYS.RAM_ONLY_WORKSPACE_MEMBERS_SELECTED_FOR_BULK_EDIT)).toEqual({policyID: policy.id, accountIDs: [userAccountID]});

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should clear the selection once a bulk change has been applied', async () => {
            // Given an admin who selected a member and opened a bulk change for them
            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();
            await screen.findByText(USER_OPTION);
            selectCheckboxByMemberName('Member');
            await act(async () => {
                await Onyx.set(ONYXKEYS.RAM_ONLY_WORKSPACE_MEMBERS_SELECTED_FOR_BULK_EDIT, {policyID: policy.id, accountIDs: [userAccountID]});
            });
            const selectedLabel = TestHelper.translateLocal('workspace.common.selected', {count: 1});
            expect(screen.getByText(selectedLabel)).toBeOnTheScreen();

            // When the bulk change is applied, which clears the members handed to it
            await act(async () => {
                await Onyx.set(ONYXKEYS.RAM_ONLY_WORKSPACE_MEMBERS_SELECTED_FOR_BULK_EDIT, null);
            });

            // Then the members page drops its selection too
            await waitFor(() => {
                expect(screen.queryByText(selectedLabel)).not.toBeOnTheScreen();
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should hide the office location column and bulk changes without the commuter exclusions arrangements beta', async () => {
            // Given a workspace with offices, and an admin with the commuter exclusions beta but not the arrangements beta
            await act(async () => {
                await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.COMMUTER_EXCLUSIONS]);
            });
            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            // When they open the bulk actions for a member
            await openBulkActionsForMember();

            // Then there is no office location column, and neither change is offered
            expect(screen.queryByText(TestHelper.translateLocal('workspace.people.officeLocation'))).not.toBeOnTheScreen();
            expect(screen.queryByText('New Jersey Office')).not.toBeOnTheScreen();
            expect(screen.queryByText(TestHelper.translateLocal('workspace.people.changeOfficeLocation'))).not.toBeOnTheScreen();
            expect(screen.queryByText(TestHelper.translateLocal('workspace.people.changeWorkArrangement'))).not.toBeOnTheScreen();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should offer office location and work arrangement changes to People Admins', async () => {
            // Given a People Admin, who manages members, offices and work arrangements included
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {
                    role: CONST.POLICY.ROLE.PEOPLE_ADMIN,
                    employeeList: {[selfEmail]: {email: selfEmail, role: CONST.POLICY.ROLE.PEOPLE_ADMIN}},
                });
            });
            const {unmount} = renderPage(SCREENS.WORKSPACE.MEMBERS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            // When they open the bulk actions for a member
            await openBulkActionsForMember();

            // Then both changes are offered
            expect(screen.getByText(TestHelper.translateLocal('workspace.people.changeOfficeLocation'))).toBeOnTheScreen();
            expect(screen.getByText(TestHelper.translateLocal('workspace.people.changeWorkArrangement'))).toBeOnTheScreen();

            unmount();
            await waitForBatchedUpdatesWithAct();
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
