import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {saveFastEditApprovalWorkflow} from '@libs/actions/Workflow';
import Navigation from '@libs/Navigation/Navigation';

import DynamicWorkspaceWorkflowsApprovalsExpensesFromPage from '@pages/workspace/workflows/approvals/DynamicWorkspaceWorkflowsApprovalsExpensesFromPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import type {ApprovalWorkflowOnyx, Approver, Member} from '@src/types/onyx/ApprovalWorkflow';
import type {PersonalDetailsList} from '@src/types/onyx/PersonalDetails';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import {buildPersonalDetails} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'workflow-approvals-expenses-from-test-policy';
const ALICE_EMAIL = 'alice@example.com';
const ALICE_ACCOUNT_ID = 1;
const BOB_EMAIL = 'bob@example.com';
const BOB_ACCOUNT_ID = 2;
const CAROL_EMAIL = 'carol@example.com';
const CAROL_ACCOUNT_ID = 3;
// Not in the workspace, so selecting them sends the save through the invite page.
const DANA_EMAIL = 'dana@example.com';
const DANA_ACCOUNT_ID = 4;

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

// goBack runs afterTransition right away, since no screen transition ever finishes in a test.
jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn((_route?: string, options?: {afterTransition?: () => void}) => options?.afterTransition?.()),
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    dismissModal: jest.fn(),
}));

jest.mock('@libs/actions/Workflow', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/actions/Workflow');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        saveFastEditApprovalWorkflow: jest.fn(),
    };
});

const saveFastEditApprovalWorkflowMock = jest.mocked(saveFastEditApprovalWorkflow);
const goBackMock = jest.mocked(Navigation.goBack);
const navigateMock = jest.mocked(Navigation.navigate);

const CAROL_APPROVER: Approver = {email: CAROL_EMAIL, displayName: 'carol'};
const ALICE_MEMBER: Member = {email: ALICE_EMAIL, displayName: 'alice'};
const BOB_MEMBER: Member = {email: BOB_EMAIL, displayName: 'bob'};
const DANA_MEMBER: Member = {email: DANA_EMAIL, displayName: 'dana'};

function buildPolicy(): Policy {
    return {
        id: POLICY_ID,
        name: 'Test Workspace',
        type: CONST.POLICY.TYPE.CORPORATE,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: ALICE_EMAIL,
        employeeList: {
            [ALICE_EMAIL]: {email: ALICE_EMAIL, submitsTo: ALICE_EMAIL},
            [BOB_EMAIL]: {email: BOB_EMAIL, submitsTo: CAROL_EMAIL},
            [CAROL_EMAIL]: {email: CAROL_EMAIL, submitsTo: ALICE_EMAIL},
        },
        approver: ALICE_EMAIL,
        areWorkflowsEnabled: true,
        outputCurrency: 'USD',
        avatarURL: '',
        pendingAction: null,
        errors: {},
    } as Policy;
}

const mockRoute = {
    key: 'test-route',
    name: SCREENS.WORKSPACE.DYNAMIC_WORKFLOWS_APPROVALS_EXPENSES_FROM,
    params: {policyID: POLICY_ID},
};

const Stack = createStackNavigator();

const renderExpensesFromPage = () =>
    render(
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name={SCREENS.WORKSPACE.DYNAMIC_WORKFLOWS_APPROVALS_EXPENSES_FROM}>
                    {() => (
                        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                            {/* @ts-expect-error - the navigator supplies the route and navigation props at runtime */}
                            <DynamicWorkspaceWorkflowsApprovalsExpensesFromPage route={mockRoute} />
                        </ComposeProviders>
                    )}
                </Stack.Screen>
            </Stack.Navigator>
        </NavigationContainer>,
    );

/** Seeds an EDIT draft where the admin has already deselected Bob, which is the state right before Save is pressed. */
async function seedWorkflow(overrides: Partial<ApprovalWorkflowOnyx>) {
    const seededWorkflow: ApprovalWorkflowOnyx = {
        action: CONST.APPROVAL_WORKFLOW.ACTION.EDIT,
        approvers: [CAROL_APPROVER],
        originalApprovers: [CAROL_APPROVER],
        originalMembers: [ALICE_MEMBER, BOB_MEMBER],
        members: [ALICE_MEMBER],
        availableMembers: [ALICE_MEMBER, BOB_MEMBER],
        usedApproverEmails: [],
        isDefault: false,
        ...overrides,
    };
    await act(async () => {
        await Onyx.set(ONYXKEYS.APPROVAL_WORKFLOW, seededWorkflow);
        await waitForBatchedUpdatesWithAct();
    });
}

async function renderAndPressSave() {
    const rendered = renderExpensesFromPage();
    await waitForBatchedUpdatesWithAct();
    fireEvent.press(screen.getByText('Save'));
    await waitForBatchedUpdatesWithAct();
    return rendered;
}

describe('DynamicWorkspaceWorkflowsApprovalsExpensesFromPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);
            await Onyx.set(ONYXKEYS.IS_LOADING_REPORT_DATA, false);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildPolicy());
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [ALICE_ACCOUNT_ID]: buildPersonalDetails(ALICE_EMAIL, ALICE_ACCOUNT_ID, 'alice'),
                [BOB_ACCOUNT_ID]: buildPersonalDetails(BOB_EMAIL, BOB_ACCOUNT_ID, 'bob'),
                [CAROL_ACCOUNT_ID]: buildPersonalDetails(CAROL_EMAIL, CAROL_ACCOUNT_ID, 'carol'),
                [DANA_ACCOUNT_ID]: buildPersonalDetails(DANA_EMAIL, DANA_ACCOUNT_ID, 'dana'),
            } satisfies PersonalDetailsList);
            await Onyx.merge(ONYXKEYS.SESSION, {email: ALICE_EMAIL, accountID: ALICE_ACCOUNT_ID});
            await waitForBatchedUpdatesWithAct();
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    it('saves a "+N more" edit with the new members and the original members', async () => {
        // Given a "+N more" edit where Bob was deselected
        await seedWorkflow({isFastEdit: true});

        // When the admin presses Save
        await renderAndPressSave();

        // Then the page goes back and saves the workflow with Alice only, keeping Alice and Bob as the originals
        expect(goBackMock).toHaveBeenCalledTimes(1);
        expect(saveFastEditApprovalWorkflowMock).toHaveBeenCalledTimes(1);
        const [params] = saveFastEditApprovalWorkflowMock.mock.calls.at(0) ?? [];
        expect(params?.approvalWorkflow.members.map((member) => member.email)).toEqual([ALICE_EMAIL]);
        expect(params?.approvalWorkflow.originalMembers?.map((member) => member.email)).toEqual([ALICE_EMAIL, BOB_EMAIL]);
        expect(params?.isMultipleApproversBetaEnabled).toBe(false);
    });

    it('passes the rules beta flag through', async () => {
        // Given the rules beta is on and a "+N more" edit is ready to save
        await act(async () => {
            await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.MULTIPLE_APPROVERS]);
            await waitForBatchedUpdatesWithAct();
        });
        await seedWorkflow({isFastEdit: true});

        // When the admin presses Save
        await renderAndPressSave();

        // Then the save is told to use the rules path
        const [params] = saveFastEditApprovalWorkflowMock.mock.calls.at(0) ?? [];
        expect(params?.isMultipleApproversBetaEnabled).toBe(true);
    });

    it('leaves the save and the draft to the Edit page when opened from it', async () => {
        // Given the page was opened from the Edit page, not the "+N more" shortcut
        await seedWorkflow({isFastEdit: false});

        // When the admin presses Save and the page closes
        const {unmount} = await renderAndPressSave();
        unmount();
        await waitForBatchedUpdatesWithAct();

        // Then nothing is saved here, and the draft survives for the Edit page to save
        expect(saveFastEditApprovalWorkflowMock).not.toHaveBeenCalled();
        const draft = await getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW);
        expect(draft?.members.map((member) => member.email)).toEqual([ALICE_EMAIL]);
    });

    it('discards the draft when a "+N more" edit is closed without saving', async () => {
        // Given a "+N more" edit
        await seedWorkflow({isFastEdit: true});
        const {unmount} = renderExpensesFromPage();
        await waitForBatchedUpdatesWithAct();

        // When the admin backs out without pressing Save
        unmount();
        await waitForBatchedUpdatesWithAct();

        // Then nothing is saved and the draft is gone, so it cannot leak into the next session
        expect(saveFastEditApprovalWorkflowMock).not.toHaveBeenCalled();
        await expect(getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW)).resolves.toBeUndefined();
    });

    it('hands a non-member off to the invite page without saving', async () => {
        // Given a "+N more" edit where Dana, who is not a workspace member, was selected
        await seedWorkflow({isFastEdit: true, members: [ALICE_MEMBER, DANA_MEMBER]});
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${POLICY_ID}`, {[DANA_EMAIL]: DANA_ACCOUNT_ID});
            await waitForBatchedUpdatesWithAct();
        });

        // When the admin presses Save and the page is replaced by the invite page
        const {unmount} = await renderAndPressSave();
        unmount();
        await waitForBatchedUpdatesWithAct();

        // Then the invite page opens, nothing is saved yet, and the draft is kept for the invite page to save
        expect(navigateMock).toHaveBeenCalledTimes(1);
        expect(saveFastEditApprovalWorkflowMock).not.toHaveBeenCalled();
        const draft = await getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW);
        expect(draft?.members.map((member) => member.email)).toEqual([ALICE_EMAIL, DANA_EMAIL]);
        expect(draft?.isFastEdit).toBe(true);
    });
});
