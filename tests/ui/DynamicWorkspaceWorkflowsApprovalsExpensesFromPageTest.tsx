import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {selectApprovalWorkflowForEdit, updateApprovalWorkflow, updateApprovalWorkflowRules} from '@libs/actions/Workflow';
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
// Not in the workspace, so selecting them is what sends a fast edit through the invite detour.
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

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    dismissModal: jest.fn(),
}));

// The real helper defers the callback until the screen transition finishes, which never happens in a test. Callbacks
// run synchronously by default; set `shouldDefer` to hold them so a test can interleave work with an in-flight save
// the way the real helper does (it can wait up to MAX_TRANSITION_START_WAIT_MS + MAX_TRANSITION_DURATION_MS).
const mockPredictedTransition = {
    shouldDefer: false,
    pendingCallbacks: [] as Array<() => void>,
    flush() {
        const callbacks = mockPredictedTransition.pendingCallbacks;
        mockPredictedTransition.pendingCallbacks = [];
        for (const callback of callbacks) {
            callback();
        }
    },
};

jest.mock('@libs/Navigation/runAfterPredictedTransition', () => ({
    __esModule: true,
    default: (callback: () => void) => {
        if (mockPredictedTransition.shouldDefer) {
            mockPredictedTransition.pendingCallbacks.push(callback);
        } else {
            callback();
        }
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
const navigateMock = jest.mocked(Navigation.navigate);
const getActiveRouteMock = jest.mocked(Navigation.getActiveRoute);

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
const DANA_MEMBER: Member = {email: DANA_EMAIL, displayName: 'dana'};

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
        navigateMock.mockClear();
        getActiveRouteMock.mockReturnValue('');
        mockPredictedTransition.shouldDefer = false;
        mockPredictedTransition.pendingCallbacks = [];
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

    it('does not block a fast edit on approver-level errors this page cannot fix', async () => {
        // A circular forwardsTo is approver-level state this page has no field for. Rejecting the save on it would
        // dead-end every fast edit on such a policy: a generic alert the admin can't act on, and a Back that
        // discards the member change. That validation belongs on the edit page.
        await seedWorkflow({isFastEdit: true, approvers: [{...CAROL_APPROVER, isCircularReference: true}], originalApprovers: [CAROL_APPROVER]});

        renderExpensesFromPage();
        await waitForBatchedUpdatesWithAct();

        await pressSave();

        expect(goBackMock).toHaveBeenCalledTimes(1);
        expect(updateApprovalWorkflowMock).toHaveBeenCalledTimes(1);
    });

    it('discards the draft when a fast edit is abandoned without saving', async () => {
        await seedWorkflowWithBobDeselected(true);

        const {unmount} = renderExpensesFromPage();
        await waitForBatchedUpdatesWithAct();

        unmount();
        await waitForBatchedUpdatesWithAct();

        expect(updateApprovalWorkflowMock).not.toHaveBeenCalled();
        await expect(getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW)).resolves.toBeUndefined();
    });

    describe('when a fast edit detours through the invite flow', () => {
        /**
         * Seeds the state right before Save, with Dana staged for invite: she is in the draft's members and in the
         * invite draft, but not in the workspace. Pressing Save takes the usersToInvite branch, which navigates to
         * the invite-message page and latches the hand-off flag.
         */
        async function seedStagedNonMemberAndSave() {
            await seedWorkflow({isFastEdit: true, members: [ALICE_MEMBER, DANA_MEMBER]});
            await act(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${POLICY_ID}`, {[DANA_EMAIL]: DANA_ACCOUNT_ID});
                await waitForBatchedUpdatesWithAct();
            });

            const rendered = renderExpensesFromPage();
            await waitForBatchedUpdatesWithAct();
            await pressSave();

            // The hand-off, not a save: the invite page finishes this one.
            expect(navigateMock).toHaveBeenCalledTimes(1);
            expect(updateApprovalWorkflowMock).not.toHaveBeenCalled();
            return rendered;
        }

        it('keeps both drafts for the invite page while the hand-off is genuinely in flight', async () => {
            getActiveRouteMock.mockReturnValue(`workspaces/${POLICY_ID}/workflows/approvals/expenses-from/invite-message`);

            const {unmount} = await seedStagedNonMemberAndSave();
            unmount();
            await waitForBatchedUpdatesWithAct();

            // The invite page reads both, and it is the screen that will save the workflow.
            const draft = await getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW);
            expect(draft?.members.map((member) => member.email)).toEqual([ALICE_EMAIL, DANA_EMAIL]);
            expect(draft?.isFastEdit).toBe(true);
            await expect(getOnyxValue(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${POLICY_ID}`)).resolves.toEqual({[DANA_EMAIL]: DANA_ACCOUNT_ID});
        });

        it('discards both drafts when the invite detour is dismissed instead of completed', async () => {
            const {unmount} = await seedStagedNonMemberAndSave();

            // Dismissing the whole RHP (close, Escape, backdrop, any dismissModal) unmounts this page with the
            // hand-off flag still latched, and leaves no invite page behind to consume either draft.
            getActiveRouteMock.mockReturnValue(`workspaces/${POLICY_ID}/workflows`);
            unmount();
            await waitForBatchedUpdatesWithAct();

            // Nothing was saved, so nothing may be left in persisted Onyx — least of all isFastEdit plus a
            // never-invited member, which a later session would inherit.
            await expect(getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW)).resolves.toBeUndefined();
            await expect(getOnyxValue(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${POLICY_ID}`)).resolves.toEqual({});
        });
    });

    it('keeps the draft when a non-fast-edit session unmounts, so the edit page can resume it', async () => {
        await seedWorkflowWithBobDeselected(false);

        const {unmount} = renderExpensesFromPage();
        await waitForBatchedUpdatesWithAct();

        unmount();
        await waitForBatchedUpdatesWithAct();

        const draft = await getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW);
        expect(draft?.members.map((member) => member.email)).toEqual([ALICE_EMAIL]);
    });

    it('lets a superseded in-flight save land without wiping the draft a newer session already seeded', async () => {
        await seedWorkflowWithBobDeselected(true);
        // Hold the save behind the screen transition, the way the real helper does for up to ~2s.
        mockPredictedTransition.shouldDefer = true;

        const {unmount} = renderExpensesFromPage();
        await waitForBatchedUpdatesWithAct();

        await pressSave();
        // Navigating back tears this page down while its save is still queued.
        unmount();
        await waitForBatchedUpdatesWithAct();

        // The admin taps another workflow's "+N more" before the queued save runs.
        await act(async () => {
            selectApprovalWorkflowForEdit({
                workflow: {members: [{email: CAROL_EMAIL, displayName: 'carol'}], approvers: [{email: ALICE_EMAIL, displayName: 'alice'}], isDefault: false},
                defaultWorkflowMembers: [],
                usedApproverEmails: [],
                isFastEdit: true,
            });
            await waitForBatchedUpdatesWithAct();
        });

        await act(async () => {
            mockPredictedTransition.flush();
            await waitForBatchedUpdatesWithAct();
        });

        // The write the admin already confirmed still has to land...
        expect(updateApprovalWorkflowMock).toHaveBeenCalledTimes(1);
        const [, membersToRemove, , , shouldClearApprovalWorkflowDraft] = updateApprovalWorkflowMock.mock.calls.at(0) ?? [];
        expect(membersToRemove?.map((member) => member.email)).toEqual([BOB_EMAIL]);
        // ...but it must not clear the newer draft, directly or through its optimistic data.
        expect(shouldClearApprovalWorkflowDraft).toBe(false);
        const draft = await getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW);
        expect(draft?.members.map((member) => member.email)).toEqual([CAROL_EMAIL]);
        expect(draft?.isFastEdit).toBe(true);
    });

    it('queues the save before navigating on a successful fast edit', async () => {
        await seedWorkflowWithBobDeselected(true);

        renderExpensesFromPage();
        await waitForBatchedUpdatesWithAct();

        await pressSave();

        expect(goBackMock).toHaveBeenCalledTimes(1);
        expect(updateApprovalWorkflowMock).toHaveBeenCalledTimes(1);
        // The write must be queued before the navigation, so it is already persisted in the request queue if the
        // app reloads during the transition. Only the draft teardown waits for the transition.
        expect(updateApprovalWorkflowMock.mock.invocationCallOrder.at(0) ?? 0).toBeLessThan(goBackMock.mock.invocationCallOrder.at(0) ?? 0);
        // The save never touches APPROVAL_WORKFLOW, so it can't blank the list mid-transition.
        const [, , , , shouldClearApprovalWorkflowDraft] = updateApprovalWorkflowMock.mock.calls.at(0) ?? [];
        expect(shouldClearApprovalWorkflowDraft).toBe(false);
    });

    it('still saves a confirmed fast edit when the transition callback never runs', async () => {
        await seedWorkflowWithBobDeselected(true);
        // Hold everything that waits on the transition, and never flush it — the app was reloaded or closed
        // during the ~2s window, so any in-memory callback is gone.
        mockPredictedTransition.shouldDefer = true;

        const {unmount} = renderExpensesFromPage();
        await waitForBatchedUpdatesWithAct();

        await pressSave();
        unmount();
        await waitForBatchedUpdatesWithAct();

        // The save was queued up front, so the member the admin deselected is still removed.
        expect(updateApprovalWorkflowMock).toHaveBeenCalledTimes(1);
        const [, membersToRemove] = updateApprovalWorkflowMock.mock.calls.at(0) ?? [];
        expect(membersToRemove?.map((member) => member.email)).toEqual([BOB_EMAIL]);
    });
});
