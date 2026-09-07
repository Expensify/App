import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {updateApprovalWorkflow, updateApprovalWorkflowRules} from '@libs/actions/Workflow';
import Navigation from '@libs/Navigation/Navigation';

import DynamicWorkspaceWorkflowsApprovalsExpensesFromPage from '@pages/workspace/workflows/approvals/DynamicWorkspaceWorkflowsApprovalsExpensesFromPage';

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
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    dismissModal: jest.fn(),
}));

// The real helper defers the callback until the screen transition finishes, which never happens in a test.
jest.mock('@libs/Navigation/runAfterPredictedTransition', () => ({
    __esModule: true,
    default: (callback: () => void) => {
        callback();
        return {cancel: jest.fn()};
    },
}));

// Only the two save actions are mocked. clearApprovalWorkflow and validateApprovalWorkflow stay real so the
// tests below can assert on the draft the page leaves behind in Onyx.
jest.mock('@libs/actions/Workflow', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/actions/Workflow');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        updateApprovalWorkflow: jest.fn(),
        updateApprovalWorkflowRules: jest.fn(),
    };
});

const updateApprovalWorkflowMock = jest.mocked(updateApprovalWorkflow);
const updateApprovalWorkflowRulesMock = jest.mocked(updateApprovalWorkflowRules);
const goBackMock = jest.mocked(Navigation.goBack);

function buildPolicy(): Policy {
    const employeeList: PolicyEmployeeList = {
        [ALICE_EMAIL]: {email: ALICE_EMAIL, submitsTo: ALICE_EMAIL},
        [BOB_EMAIL]: {email: BOB_EMAIL, submitsTo: CAROL_EMAIL},
        [CAROL_EMAIL]: {email: CAROL_EMAIL, submitsTo: ALICE_EMAIL},
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
        pendingAction: null,
        errors: {},
    } as Policy;
}

const CAROL_APPROVER: Approver = {email: CAROL_EMAIL, displayName: 'carol'};
const BOB_MEMBER: Member = {email: BOB_EMAIL, displayName: 'bob'};
const ALICE_MEMBER: Member = {email: ALICE_EMAIL, displayName: 'alice'};

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

/**
 * Seeds an EDIT-mode draft where the admin has already deselected Bob, i.e. the state the page is in
 * right before "Save" is pressed.
 */
async function seedWorkflowWithBobDeselected(isFastEdit: boolean) {
    await seedWorkflow({isFastEdit});
}

async function enableMultipleApproversBeta() {
    await act(async () => {
        await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.MULTIPLE_APPROVERS]);
        await waitForBatchedUpdatesWithAct();
    });
}

async function pressSave() {
    fireEvent.press(screen.getByText('Save'));
    await waitForBatchedUpdatesWithAct();
}

describe('DynamicWorkspaceWorkflowsApprovalsExpensesFromPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        updateApprovalWorkflowMock.mockClear();
        updateApprovalWorkflowRulesMock.mockClear();
        goBackMock.mockClear();
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);
            await Onyx.set(ONYXKEYS.IS_LOADING_REPORT_DATA, false);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildPolicy());
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [ALICE_ACCOUNT_ID]: buildPersonalDetails(ALICE_EMAIL, ALICE_ACCOUNT_ID, 'alice'),
                [BOB_ACCOUNT_ID]: buildPersonalDetails(BOB_EMAIL, BOB_ACCOUNT_ID, 'bob'),
                [CAROL_ACCOUNT_ID]: buildPersonalDetails(CAROL_EMAIL, CAROL_ACCOUNT_ID, 'carol'),
            } satisfies PersonalDetailsList);
            await Onyx.merge(ONYXKEYS.SESSION, {email: ALICE_EMAIL, accountID: ALICE_ACCOUNT_ID});
            await waitForBatchedUpdatesWithAct();
        });
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    it('saves the workflow itself on a fast edit, removing the member the admin deselected', async () => {
        await seedWorkflowWithBobDeselected(true);

        renderExpensesFromPage();
        await waitForBatchedUpdatesWithAct();

        await pressSave();

        expect(updateApprovalWorkflowMock).toHaveBeenCalledTimes(1);
        const [savedWorkflow, membersToRemove] = updateApprovalWorkflowMock.mock.calls.at(0) ?? [];
        expect(savedWorkflow?.members.map((member) => member.email)).toEqual([ALICE_EMAIL]);
        expect(membersToRemove?.map((member) => member.email)).toEqual([BOB_EMAIL]);
    });

    it('leaves saving to the edit page when the sub-page was not opened as a fast edit', async () => {
        await seedWorkflowWithBobDeselected(false);

        renderExpensesFromPage();
        await waitForBatchedUpdatesWithAct();

        await pressSave();

        expect(updateApprovalWorkflowMock).not.toHaveBeenCalled();
    });

    it('saves through the rules-based path when the MULTIPLE_APPROVERS beta is enabled', async () => {
        await enableMultipleApproversBeta();
        await seedWorkflowWithBobDeselected(true);

        renderExpensesFromPage();
        await waitForBatchedUpdatesWithAct();

        await pressSave();

        expect(updateApprovalWorkflowMock).not.toHaveBeenCalled();
        expect(updateApprovalWorkflowRulesMock).toHaveBeenCalledTimes(1);
        const [rulesParams] = updateApprovalWorkflowRulesMock.mock.calls.at(0) ?? [];
        // The rules path diffs membership itself, so it needs the original members as the "before" side.
        expect(rulesParams?.approvalWorkflow.members.map((member) => member.email)).toEqual([ALICE_EMAIL]);
        expect(rulesParams?.initialApprovalWorkflow.members.map((member) => member.email)).toEqual([ALICE_EMAIL, BOB_EMAIL]);
        await expect(getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW)).resolves.toBeUndefined();
    });

    it('clears the draft after a fast-edit save', async () => {
        await seedWorkflowWithBobDeselected(true);

        renderExpensesFromPage();
        await waitForBatchedUpdatesWithAct();

        await pressSave();

        // updateApprovalWorkflow is mocked here, so the draft can only be gone if the page cleared it itself.
        await expect(getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW)).resolves.toBeUndefined();
    });

    it('clears the draft when a fast edit is saved with no effective change', async () => {
        // Members match originalMembers, so updateApprovalWorkflow's employee diff comes out empty and the
        // real action returns before the optimistic data that would otherwise clear the draft.
        await seedWorkflow({isFastEdit: true, members: [ALICE_MEMBER], originalMembers: [ALICE_MEMBER]});

        renderExpensesFromPage();
        await waitForBatchedUpdatesWithAct();

        await pressSave();

        expect(updateApprovalWorkflowMock).toHaveBeenCalledTimes(1);
        const [, membersToRemove] = updateApprovalWorkflowMock.mock.calls.at(0) ?? [];
        expect(membersToRemove).toEqual([]);
        await expect(getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW)).resolves.toBeUndefined();
    });

    it('validates before navigating, so a failed validation keeps the admin on the page and saves nothing', async () => {
        // A circular forwardsTo is approver-level state this page cannot edit, so the admin can hit this
        // without doing anything wrong on this screen.
        await seedWorkflow({isFastEdit: true, approvers: [{...CAROL_APPROVER, isCircularReference: true}], originalApprovers: [CAROL_APPROVER]});

        renderExpensesFromPage();
        await waitForBatchedUpdatesWithAct();

        await pressSave();

        expect(goBackMock).not.toHaveBeenCalled();
        expect(updateApprovalWorkflowMock).not.toHaveBeenCalled();
        expect(updateApprovalWorkflowRulesMock).not.toHaveBeenCalled();
        // The draft has to survive so the errors stay on screen and the member change isn't silently dropped.
        const draft = await getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW);
        expect(draft?.errors?.['approver-0']).toBe('workflowsPage.approverCircularReference');
    });

    it('navigates back before saving on a successful fast edit', async () => {
        await seedWorkflowWithBobDeselected(true);

        renderExpensesFromPage();
        await waitForBatchedUpdatesWithAct();

        await pressSave();

        expect(goBackMock).toHaveBeenCalledTimes(1);
        expect(updateApprovalWorkflowMock).toHaveBeenCalledTimes(1);
        // The save is deferred until the transition finishes, so it must never precede the navigation.
        expect(goBackMock.mock.invocationCallOrder.at(0) ?? 0).toBeLessThan(updateApprovalWorkflowMock.mock.invocationCallOrder.at(0) ?? 0);
    });
});
