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
// run synchronously by default. Set `shouldDefer` to hold them so a test can interleave work with an in-flight save
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
        // Given a "+N more" fast edit with Bob deselected, which is the state right before Save is pressed
        await seedWorkflowWithBobDeselected(true);

        renderExpensesFromPage();
        await waitForBatchedUpdatesWithAct();

        // When the admin presses Save
        await pressSave();

        // Then this page performs the save itself, with Bob in membersToRemove. A fast edit returns to the
        // workflows page, so no other screen would ever write the change and it would silently vanish
        expect(updateApprovalWorkflowMock).toHaveBeenCalledTimes(1);
        const [savedWorkflow, membersToRemove] = updateApprovalWorkflowMock.mock.calls.at(0) ?? [];
        expect(savedWorkflow?.members.map((member) => member.email)).toEqual([ALICE_EMAIL]);
        expect(membersToRemove?.map((member) => member.email)).toEqual([BOB_EMAIL]);
    });

    it('leaves saving to the edit page when the sub-page was not opened as a fast edit', async () => {
        // Given the same page reached from an edit-page session rather than a "+N more" chip
        await seedWorkflowWithBobDeselected(false);

        renderExpensesFromPage();
        await waitForBatchedUpdatesWithAct();

        // When the admin presses Save
        await pressSave();

        // Then nothing is written here, because the edit page is still in the stack and owns the save. Writing
        // from both would double-write the same workflow
        expect(updateApprovalWorkflowMock).not.toHaveBeenCalled();
    });

    it('saves through the rules-based path when the MULTIPLE_APPROVERS beta is enabled', async () => {
        // Given the same fast edit on a workspace with the rules-based approvals beta on
        await enableMultipleApproversBeta();
        await seedWorkflowWithBobDeselected(true);

        renderExpensesFromPage();
        await waitForBatchedUpdatesWithAct();

        // When the admin presses Save
        await pressSave();

        // Then the save goes through the rules backend instead of employeeList, and is handed the original
        // members as the "before" side because that path diffs membership itself
        expect(updateApprovalWorkflowMock).not.toHaveBeenCalled();
        expect(updateApprovalWorkflowRulesMock).toHaveBeenCalledTimes(1);
        const [rulesParams] = updateApprovalWorkflowRulesMock.mock.calls.at(0) ?? [];
        expect(rulesParams?.approvalWorkflow.members.map((member) => member.email)).toEqual([ALICE_EMAIL]);
        expect(rulesParams?.initialApprovalWorkflow.members.map((member) => member.email)).toEqual([ALICE_EMAIL, BOB_EMAIL]);
        await expect(getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW)).resolves.toBeUndefined();
    });

    it('clears the draft after a fast-edit save', async () => {
        // Given a fast edit ready to save
        await seedWorkflowWithBobDeselected(true);

        renderExpensesFromPage();
        await waitForBatchedUpdatesWithAct();

        // When the admin presses Save
        await pressSave();

        // Then the draft is gone. updateApprovalWorkflow is mocked here, so it can only have been cleared by the
        // page itself, which matters because a stranded isFastEdit would let a later sub-page save on its own
        await expect(getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW)).resolves.toBeUndefined();
    });

    it('clears the draft when a fast edit is saved with no effective change', async () => {
        // Given a fast edit where the members match originalMembers, so the real updateApprovalWorkflow's
        // employee diff comes out empty and it returns before the optimistic data that would clear the draft
        await seedWorkflow({isFastEdit: true, members: [ALICE_MEMBER], originalMembers: [ALICE_MEMBER]});

        renderExpensesFromPage();
        await waitForBatchedUpdatesWithAct();

        // When the admin presses Save without having changed anything
        await pressSave();

        // Then the page still tears the draft down itself, so the next "+N more" opens clean rather than
        // inheriting a stale isFastEdit from an apparently successful save
        expect(updateApprovalWorkflowMock).toHaveBeenCalledTimes(1);
        const [, membersToRemove] = updateApprovalWorkflowMock.mock.calls.at(0) ?? [];
        expect(membersToRemove).toEqual([]);
        await expect(getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW)).resolves.toBeUndefined();
    });

    it('does not block a fast edit on approver-level errors this page cannot fix', async () => {
        // Given a workflow whose approver chain is already circular, which is approver-level state this page has
        // no field for
        await seedWorkflow({isFastEdit: true, approvers: [{...CAROL_APPROVER, isCircularReference: true}], originalApprovers: [CAROL_APPROVER]});

        renderExpensesFromPage();
        await waitForBatchedUpdatesWithAct();

        // When the admin presses Save
        await pressSave();

        // Then the save goes through anyway. Rejecting here would dead-end every fast edit on such a policy
        // behind a generic alert the admin cannot act on, and a Back that discards their member change
        expect(goBackMock).toHaveBeenCalledTimes(1);
        expect(updateApprovalWorkflowMock).toHaveBeenCalledTimes(1);
    });

    it('discards the draft when a fast edit is abandoned without saving', async () => {
        // Given a fast edit the admin backs out of instead of saving
        await seedWorkflowWithBobDeselected(true);

        const {unmount} = renderExpensesFromPage();
        await waitForBatchedUpdatesWithAct();

        // When the page is torn down
        unmount();
        await waitForBatchedUpdatesWithAct();

        // Then nothing is written and the draft goes with it. This page is the only screen in a fast-edit
        // session, so leaving isFastEdit behind would hand a later edit page's sub-page a licence to save
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
            // Given a hand-off where the invite-message route really is the screen being opened
            getActiveRouteMock.mockReturnValue(`workspaces/${POLICY_ID}/workflows/approvals/expenses-from/invite-message`);

            const {unmount} = await seedStagedNonMemberAndSave();

            // When this page is torn down behind that hand-off
            unmount();
            await waitForBatchedUpdatesWithAct();

            // Then both drafts survive, because the invite page reads them and is the screen that will finish
            // the save. Clearing here would lose the member the admin picked
            const draft = await getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW);
            expect(draft?.members.map((member) => member.email)).toEqual([ALICE_EMAIL, DANA_EMAIL]);
            expect(draft?.isFastEdit).toBe(true);
            await expect(getOnyxValue(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${POLICY_ID}`)).resolves.toEqual({[DANA_EMAIL]: DANA_ACCOUNT_ID});
        });

        it('discards both drafts when the invite detour is dismissed instead of completed', async () => {
            // Given the same hand-off, but the admin dismisses the whole RHP with close, Escape, the backdrop,
            // or any dismissModal. The hand-off flag is still latched and no invite page is left behind
            const {unmount} = await seedStagedNonMemberAndSave();

            getActiveRouteMock.mockReturnValue(`workspaces/${POLICY_ID}/workflows`);

            // When this page is torn down
            unmount();
            await waitForBatchedUpdatesWithAct();

            // Then both drafts go with it. Nothing was saved, so leaving isFastEdit plus a never-invited member
            // in persisted Onyx would hand them to whichever session runs next
            await expect(getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW)).resolves.toBeUndefined();
            await expect(getOnyxValue(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${POLICY_ID}`)).resolves.toEqual({});
        });
    });

    it('keeps the draft when a non-fast-edit session unmounts, so the edit page can resume it', async () => {
        // Given an edit-page session, where this sub-page is only one step of a longer edit
        await seedWorkflowWithBobDeselected(false);

        const {unmount} = renderExpensesFromPage();
        await waitForBatchedUpdatesWithAct();

        // When this page is torn down
        unmount();
        await waitForBatchedUpdatesWithAct();

        // Then the draft survives with the pending selection intact, because the edit page behind it resumes
        // that draft and would otherwise lose the admin's unsaved edits
        const draft = await getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW);
        expect(draft?.members.map((member) => member.email)).toEqual([ALICE_EMAIL]);
    });

    it('lets a superseded in-flight save land without wiping the draft a newer session already seeded', async () => {
        // Given a saved fast edit whose draft teardown is held behind the screen transition, the way the real
        // helper holds it for up to about two seconds, with this page already unmounted
        await seedWorkflowWithBobDeselected(true);
        mockPredictedTransition.shouldDefer = true;

        const {unmount} = renderExpensesFromPage();
        await waitForBatchedUpdatesWithAct();

        await pressSave();
        unmount();
        await waitForBatchedUpdatesWithAct();

        // When the admin taps another workflow's "+N more" and the held teardown then runs
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

        // Then the write the admin already confirmed still lands, because dropping it would lose the change they
        // pressed Save on
        expect(updateApprovalWorkflowMock).toHaveBeenCalledTimes(1);
        const [, membersToRemove, , , shouldClearApprovalWorkflowDraft] = updateApprovalWorkflowMock.mock.calls.at(0) ?? [];
        expect(membersToRemove?.map((member) => member.email)).toEqual([BOB_EMAIL]);
        // Then the newer draft survives, both from the teardown and from the write's optimistic data, so the
        // session the admin just started does not open with an empty picker
        expect(shouldClearApprovalWorkflowDraft).toBe(false);
        const draft = await getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW);
        expect(draft?.members.map((member) => member.email)).toEqual([CAROL_EMAIL]);
        expect(draft?.isFastEdit).toBe(true);
    });

    it('leaves a newer "+N more" draft alone when this page is torn down after that session started', async () => {
        // Given the other ordering of the same race: the admin taps another workflow's "+N more" while this page
        // is still sliding away, so the newer draft is seeded before this page unmounts and its cleanup runs
        // against a draft belonging to a session it never owned
        await seedWorkflowWithBobDeselected(true);
        mockPredictedTransition.shouldDefer = true;

        const {unmount} = renderExpensesFromPage();
        await waitForBatchedUpdatesWithAct();

        await pressSave();

        await act(async () => {
            selectApprovalWorkflowForEdit({
                workflow: {members: [{email: CAROL_EMAIL, displayName: 'carol'}], approvers: [{email: ALICE_EMAIL, displayName: 'alice'}], isDefault: false},
                defaultWorkflowMembers: [],
                usedApproverEmails: [],
                isFastEdit: true,
            });
            await waitForBatchedUpdatesWithAct();
        });

        // When this page is torn down and the held teardown then runs
        unmount();
        await waitForBatchedUpdatesWithAct();

        await act(async () => {
            mockPredictedTransition.flush();
            await waitForBatchedUpdatesWithAct();
        });

        // Then the confirmed write still lands
        expect(updateApprovalWorkflowMock).toHaveBeenCalledTimes(1);
        const [, membersToRemove] = updateApprovalWorkflowMock.mock.calls.at(0) ?? [];
        expect(membersToRemove?.map((member) => member.email)).toEqual([BOB_EMAIL]);
        // Then the newer session's draft survives the unmount too, so its picker does not open empty. The
        // deferred teardown is guarded, but an unguarded unmount would wipe the draft before it ever ran
        const draft = await getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW);
        expect(draft?.members.map((member) => member.email)).toEqual([CAROL_EMAIL]);
        expect(draft?.isFastEdit).toBe(true);
    });

    it('discards the newer draft when a second "+N more" reuses this still-open page and is then abandoned', async () => {
        // Given a fast edit that is still on screen when a second "+N more" is tapped. That navigates to this
        // same dynamic route, so the draft is swapped without remounting and this page becomes the screen for
        // the newer session
        await seedWorkflowWithBobDeselected(true);

        const {unmount} = renderExpensesFromPage();
        await waitForBatchedUpdatesWithAct();

        await act(async () => {
            selectApprovalWorkflowForEdit({
                workflow: {members: [{email: CAROL_EMAIL, displayName: 'carol'}], approvers: [{email: ALICE_EMAIL, displayName: 'alice'}], isDefault: false},
                defaultWorkflowMembers: [],
                usedApproverEmails: [],
                isFastEdit: true,
            });
            await waitForBatchedUpdatesWithAct();
        });

        // When the admin backs out without saving
        unmount();
        await waitForBatchedUpdatesWithAct();

        // Then the newer draft goes too. A session snapshot latched on first sight would still be holding the
        // first session's id and would strand this one in persisted Onyx, isFastEdit and all
        expect(updateApprovalWorkflowMock).not.toHaveBeenCalled();
        await expect(getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW)).resolves.toBeUndefined();
    });

    it('queues the save before navigating on a successful fast edit', async () => {
        // Given a fast edit ready to save
        await seedWorkflowWithBobDeselected(true);

        renderExpensesFromPage();
        await waitForBatchedUpdatesWithAct();

        // When the admin presses Save
        await pressSave();

        // Then the write is queued before the navigation, so it is already persisted in the request queue if the
        // app reloads during the transition. Only the draft teardown waits for that transition
        expect(goBackMock).toHaveBeenCalledTimes(1);
        expect(updateApprovalWorkflowMock).toHaveBeenCalledTimes(1);
        expect(updateApprovalWorkflowMock.mock.invocationCallOrder.at(0) ?? 0).toBeLessThan(goBackMock.mock.invocationCallOrder.at(0) ?? 0);
        // Then that early write stays off APPROVAL_WORKFLOW, so it cannot blank the list on a page still on screen
        const [, , , , shouldClearApprovalWorkflowDraft] = updateApprovalWorkflowMock.mock.calls.at(0) ?? [];
        expect(shouldClearApprovalWorkflowDraft).toBe(false);
    });

    it('still saves a confirmed fast edit when the transition callback never runs', async () => {
        // Given a fast edit where everything waiting on the transition is held and never released, standing in
        // for the app being reloaded or closed inside that window so any in-memory callback is gone
        await seedWorkflowWithBobDeselected(true);
        mockPredictedTransition.shouldDefer = true;

        const {unmount} = renderExpensesFromPage();
        await waitForBatchedUpdatesWithAct();

        // When the admin presses Save and the page is torn down without the transition ever completing
        await pressSave();
        unmount();
        await waitForBatchedUpdatesWithAct();

        // Then the member the admin deselected is still removed, because the save was queued up front rather
        // than deferred. Deferring it would have lost the change to the reload with nothing left to recover it
        expect(updateApprovalWorkflowMock).toHaveBeenCalledTimes(1);
        const [, membersToRemove] = updateApprovalWorkflowMock.mock.calls.at(0) ?? [];
        expect(membersToRemove?.map((member) => member.email)).toEqual([BOB_EMAIL]);
    });
});
