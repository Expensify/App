import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import Navigation from '@libs/Navigation/Navigation';

import WorkspaceWorkflowsApprovalsEditPage from '@pages/workspace/workflows/approvals/WorkspaceWorkflowsApprovalsEditPage';

import {removeApprovalWorkflow, updateApprovalWorkflow, updateApprovalWorkflowRules} from '@userActions/Workflow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import type {ApprovalWorkflowOnyx, Approver, Member} from '@src/types/onyx/ApprovalWorkflow';
import type {PersonalDetailsList} from '@src/types/onyx/PersonalDetails';
import type {PolicyEmployeeList} from '@src/types/onyx/PolicyEmployee';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import Onyx from 'react-native-onyx';

import {buildPersonalDetails, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'workflow-approvals-edit-test-policy';
const ALICE_EMAIL = 'alice@example.com';
const ALICE_ACCOUNT_ID = 1;
const BOB_EMAIL = 'bob@example.com';
const BOB_ACCOUNT_ID = 2;
const CAROL_EMAIL = 'carol@example.com';
const CAROL_ACCOUNT_ID = 3;

jest.mock('@userActions/Workflow', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@userActions/Workflow');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        updateApprovalWorkflow: jest.fn(),
        updateApprovalWorkflowRules: jest.fn(),
        removeApprovalWorkflow: jest.fn(),
    };
});

jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    // Matches ModalActions.CONFIRM (components/Modal/Global/ModalContext.tsx), inlined since a jest.mock factory
    // can't reference an out-of-scope import.
    default: () => ({showConfirmModal: () => Promise.resolve({action: 'CONFIRM'})}),
}));

jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actualNav = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actualNav,
        useIsFocused: () => true,
        usePreventRemove: jest.fn(),
    };
});

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    dismissModal: jest.fn(),
}));

function buildPolicy(): Policy {
    const employeeList: PolicyEmployeeList = {
        [ALICE_EMAIL]: {
            email: ALICE_EMAIL,
            submitsTo: ALICE_EMAIL,
            forwardsTo: undefined,
        },
        // A second, non-default workflow (Bob submits to Carol rather than Alice, the policy's default approver),
        // so the delete test below can exercise a workflow the "isDefault" guard would otherwise hide the Delete
        // button for.
        [BOB_EMAIL]: {
            email: BOB_EMAIL,
            submitsTo: CAROL_EMAIL,
            forwardsTo: undefined,
        },
        [CAROL_EMAIL]: {
            email: CAROL_EMAIL,
            forwardsTo: undefined,
        },
    };
    return {
        id: POLICY_ID,
        name: 'Test Workspace',
        type: CONST.POLICY.TYPE.CORPORATE,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: ALICE_EMAIL,
        employeeList,
        approver: ALICE_EMAIL,
        areWorkflowsEnabled: true,
        outputCurrency: 'USD',
        avatarURL: '',
        lastModified: new Date().toISOString(),
        pendingAction: null,
        errors: {},
    } as Policy;
}

function buildPersonalDetailsList(): PersonalDetailsList {
    return {
        [ALICE_ACCOUNT_ID]: buildPersonalDetails(ALICE_EMAIL, ALICE_ACCOUNT_ID, 'alice'),
        [BOB_ACCOUNT_ID]: buildPersonalDetails(BOB_EMAIL, BOB_ACCOUNT_ID, 'bob'),
        [CAROL_ACCOUNT_ID]: buildPersonalDetails(CAROL_EMAIL, CAROL_ACCOUNT_ID, 'carol'),
    };
}

const mockRoute = {
    key: 'test-route',
    name: 'Workspace_Approvals_Edit',
    params: {
        policyID: POLICY_ID,
        firstApproverEmail: ALICE_EMAIL,
    },
};

const bobsWorkflowRoute = {
    key: 'test-route-bob',
    name: 'Workspace_Approvals_Edit',
    params: {
        policyID: POLICY_ID,
        firstApproverEmail: CAROL_EMAIL,
    },
};

const Stack = createStackNavigator();

const renderEditPage = (route: typeof mockRoute = mockRoute) =>
    render(
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name={SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_EDIT}>
                    {() => (
                        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                            <WorkspaceWorkflowsApprovalsEditPage
                                // @ts-expect-error - route type from navigator
                                route={route}
                            />
                        </ComposeProviders>
                    )}
                </Stack.Screen>
            </Stack.Navigator>
        </NavigationContainer>,
    );

describe('WorkspaceWorkflowsApprovalsEditPage', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);
            await Onyx.set(ONYXKEYS.IS_LOADING_REPORT_DATA, false);

            const policy = buildPolicy();
            const personalDetails = buildPersonalDetailsList();

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await Onyx.merge(ONYXKEYS.SESSION, {email: ALICE_EMAIL, accountID: ALICE_ACCOUNT_ID});
            await waitForBatchedUpdatesWithAct();
        });
    });

    afterEach(async () => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    it('preserves pending edits when resuming an EDIT-mode workflow on first mount', async () => {
        const PENDING_MEMBER: Member = {
            email: 'pending-edit@example.com',
            displayName: 'Pending Edit User',
        };
        const aliceApprover: Approver = {
            email: ALICE_EMAIL,
            displayName: 'alice',
        };
        const seededWorkflow: ApprovalWorkflowOnyx = {
            action: CONST.APPROVAL_WORKFLOW.ACTION.EDIT,
            approvers: [aliceApprover],
            originalApprovers: [aliceApprover],
            members: [PENDING_MEMBER],
            availableMembers: [],
            usedApproverEmails: [],
            isDefault: false,
        };
        await act(async () => {
            await Onyx.set(ONYXKEYS.APPROVAL_WORKFLOW, seededWorkflow);
            await waitForBatchedUpdatesWithAct();
        });

        renderEditPage();
        await waitForBatchedUpdatesWithAct();

        const members = await new Promise<Member[]>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.APPROVAL_WORKFLOW,
                callback: (state) => {
                    resolve(state?.members ?? []);
                    Onyx.disconnect(connection);
                },
            });
        });

        expect(members.map((m) => m.email)).toContain(PENDING_MEMBER.email);
    });

    it('should write deduplicated availableMembers to the approval workflow onyx state for self-approval workflow', async () => {
        renderEditPage();
        await waitForBatchedUpdatesWithAct();

        const availableMembers = await new Promise<Member[]>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.APPROVAL_WORKFLOW,
                callback: (state) => {
                    resolve(state?.availableMembers ?? []);
                    Onyx.disconnect(connection);
                },
            });
        });
        const emails = availableMembers.map((m) => m.email);
        const uniqueEmails = [...new Set(emails)];

        expect(emails.length).toBeGreaterThan(0);
        expect(emails).toHaveLength(uniqueEmails.length);
        expect(emails).toContain(ALICE_EMAIL);
    });

    describe('Save', () => {
        it('pops only the editor and applies the update after the transition', async () => {
            renderEditPage();
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByText(translateLocal('common.save')));
            await waitForBatchedUpdatesWithAct();

            // Pops just this screen (via the mocked Navigation.goBack) rather than tearing down the whole RHP stack
            // with dismissModal, and defers the write to an afterTransition callback instead of writing immediately.
            expect(Navigation.goBack).toHaveBeenCalled();
            expect(Navigation.dismissModal).not.toHaveBeenCalled();

            const [, options] = jest.mocked(Navigation.goBack).mock.calls.at(-1) ?? [];
            expect(options?.afterTransition).toBeInstanceOf(Function);
            expect(updateApprovalWorkflow).not.toHaveBeenCalled();

            options?.afterTransition?.();

            expect(updateApprovalWorkflow).toHaveBeenCalledTimes(1);
            expect(updateApprovalWorkflowRules).not.toHaveBeenCalled();
        });

        it('writes through the rules-based path instead when MULTIPLE_APPROVERS is enabled', async () => {
            await act(async () => {
                await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.MULTIPLE_APPROVERS]);
            });

            renderEditPage();
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByText(translateLocal('common.save')));
            await waitForBatchedUpdatesWithAct();

            const [, options] = jest.mocked(Navigation.goBack).mock.calls.at(-1) ?? [];
            options?.afterTransition?.();

            expect(updateApprovalWorkflowRules).toHaveBeenCalledTimes(1);
            expect(updateApprovalWorkflow).not.toHaveBeenCalled();
        });
    });

    describe('Delete', () => {
        it('pops only the editor and removes the workflow after the transition', async () => {
            // Bob's workflow (submits to Carol) is not the policy's default, so the Delete button renders for it.
            renderEditPage(bobsWorkflowRoute);
            await waitForBatchedUpdatesWithAct();

            // MenuItem's onPressAction only forwards to onPress when it is handed a truthy event, so fireEvent.press
            // has to supply one rather than being called bare the way the Save button above can be.
            fireEvent.press(screen.getByText(translateLocal('common.delete')), {nativeEvent: {}});
            await waitForBatchedUpdatesWithAct();

            expect(Navigation.goBack).toHaveBeenCalled();
            expect(Navigation.dismissModal).not.toHaveBeenCalled();
            expect(removeApprovalWorkflow).not.toHaveBeenCalled();

            const [, options] = jest.mocked(Navigation.goBack).mock.calls.at(-1) ?? [];
            options?.afterTransition?.();

            expect(removeApprovalWorkflow).toHaveBeenCalledTimes(1);
        });
    });

    describe('shared approver hint', () => {
        const aliceApprover: Approver = {
            email: ALICE_EMAIL,
            displayName: 'alice',
        };

        // Alice also approves another workflow, which is the case the hint is about.
        const workflowWithSharedApprover: ApprovalWorkflowOnyx = {
            action: CONST.APPROVAL_WORKFLOW.ACTION.EDIT,
            approvers: [aliceApprover],
            originalApprovers: [aliceApprover],
            members: [{email: 'member@example.com', displayName: 'Member'}],
            availableMembers: [],
            usedApproverEmails: [ALICE_EMAIL],
            isDefault: false,
        };

        it('is shown without the multiple approvers beta', async () => {
            await act(async () => {
                await Onyx.set(ONYXKEYS.APPROVAL_WORKFLOW, workflowWithSharedApprover);
                await waitForBatchedUpdatesWithAct();
            });

            renderEditPage();
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(translateLocal('workflowsPage.approverInMultipleWorkflows'))).toBeOnTheScreen();
        });

        it('is hidden with the multiple approvers beta, since each workflow routes through its own rules', async () => {
            await act(async () => {
                await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.MULTIPLE_APPROVERS]);
                await Onyx.set(ONYXKEYS.APPROVAL_WORKFLOW, workflowWithSharedApprover);
                await waitForBatchedUpdatesWithAct();
            });

            renderEditPage();
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText(translateLocal('workflowsPage.approverInMultipleWorkflows'))).not.toBeOnTheScreen();
        });
    });
});
