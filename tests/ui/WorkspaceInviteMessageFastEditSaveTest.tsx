import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {addMembersToWorkspace} from '@libs/actions/Policy/Member';
import {selectApprovalWorkflowForEdit, updateApprovalWorkflow, updateApprovalWorkflowRules} from '@libs/actions/Workflow';
import Navigation from '@libs/Navigation/Navigation';

import WorkspaceInviteMessageComponent from '@pages/workspace/members/WorkspaceInviteMessageComponent';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import type {ApprovalWorkflowOnyx, Approver, Member} from '@src/types/onyx/ApprovalWorkflow';
import type {CurrentUserPersonalDetails, PersonalDetailsList} from '@src/types/onyx/PersonalDetails';
import type {PolicyEmployeeList} from '@src/types/onyx/PolicyEmployee';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import {buildPersonalDetails} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'workflow-fast-edit-invite-test-policy';
const ALICE_EMAIL = 'alice@example.com';
const ALICE_ACCOUNT_ID = 1;
const BOB_EMAIL = 'bob@example.com';
const BOB_ACCOUNT_ID = 2;
const CAROL_EMAIL = 'carol@example.com';
const CAROL_ACCOUNT_ID = 3;
// Not in the workspace yet, so picking them on the expenses-from page is what detours through the invite page.
const DANA_EMAIL = 'dana@example.com';
const DANA_ACCOUNT_ID = 4;

// The "+N more" fast edit opens expenses-from with no nested backTo. That is exactly the case where no edit page is
// left in the stack to save the workflow, so the invite page has to finish the save itself.
const FAST_EDIT_BACK_TO = `workspaces/${POLICY_ID}/workflows/approvals/expenses-from` as Route;
const EDIT_PAGE_ROUTE = `workspaces/${POLICY_ID}/workflows/approvals/edit`;
const EDIT_PAGE_BACK_TO = `workspaces/${POLICY_ID}/workflows/approvals/expenses-from?backTo=${encodeURIComponent(EDIT_PAGE_ROUTE)}` as Route;

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

// Only the writes are mocked. clearApprovalWorkflow, validateFastEditApprovalWorkflow and the session ID stay real
// so the tests can assert on the draft the page leaves behind in Onyx.
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

jest.mock('@libs/actions/Policy/Member', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/actions/Policy/Member');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        addMembersToWorkspace: jest.fn(),
    };
});

const updateApprovalWorkflowMock = jest.mocked(updateApprovalWorkflow);
const updateApprovalWorkflowRulesMock = jest.mocked(updateApprovalWorkflowRules);
const addMembersToWorkspaceMock = jest.mocked(addMembersToWorkspace);
const goBackMock = jest.mocked(Navigation.goBack);
const navigateMock = jest.mocked(Navigation.navigate);

const CAROL_APPROVER: Approver = {email: CAROL_EMAIL, displayName: 'carol'};
const ALICE_MEMBER: Member = {email: ALICE_EMAIL, displayName: 'alice'};
const BOB_MEMBER: Member = {email: BOB_EMAIL, displayName: 'bob'};
const DANA_MEMBER: Member = {email: DANA_EMAIL, displayName: 'dana'};

function buildPolicy(): Policy {
    const employeeList: PolicyEmployeeList = {
        [ALICE_EMAIL]: {email: ALICE_EMAIL, submitsTo: ALICE_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
        [BOB_EMAIL]: {email: BOB_EMAIL, submitsTo: CAROL_EMAIL, role: CONST.POLICY.ROLE.USER},
        [CAROL_EMAIL]: {email: CAROL_EMAIL, submitsTo: ALICE_EMAIL, role: CONST.POLICY.ROLE.USER},
    };
    return {
        id: POLICY_ID,
        name: 'Test Workspace',
        type: CONST.POLICY.TYPE.CORPORATE,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: ALICE_EMAIL,
        employeeList,
        approver: ALICE_EMAIL,
        approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
        areWorkflowsEnabled: true,
        outputCurrency: 'USD',
        avatarURL: '',
        pendingAction: null,
        errors: {},
    } as Policy;
}

const currentUserPersonalDetails = {
    accountID: ALICE_ACCOUNT_ID,
    login: ALICE_EMAIL,
    email: ALICE_EMAIL,
    displayName: 'alice',
} as CurrentUserPersonalDetails;

const renderInviteMessagePage = (backTo: Route) =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <WorkspaceInviteMessageComponent
                        policy={buildPolicy()}
                        policyID={POLICY_ID}
                        backTo={backTo}
                        currentUserPersonalDetails={currentUserPersonalDetails}
                    />
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );

/**
 * Seeds the state the expenses-from page hands off: Dana is staged in `members` and in the invite draft, but is not
 * a workspace member yet.
 */
async function seedFastEditHandOff(overrides: Partial<ApprovalWorkflowOnyx> = {}) {
    const seededWorkflow: ApprovalWorkflowOnyx = {
        action: CONST.APPROVAL_WORKFLOW.ACTION.EDIT,
        approvers: [CAROL_APPROVER],
        originalApprovers: [CAROL_APPROVER],
        originalMembers: [ALICE_MEMBER, BOB_MEMBER],
        members: [ALICE_MEMBER, BOB_MEMBER, DANA_MEMBER],
        availableMembers: [ALICE_MEMBER, BOB_MEMBER],
        usedApproverEmails: [],
        isDefault: false,
        isFastEdit: true,
        ...overrides,
    };
    await act(async () => {
        await Onyx.set(ONYXKEYS.APPROVAL_WORKFLOW, seededWorkflow);
        await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${POLICY_ID}`, {[DANA_EMAIL]: DANA_ACCOUNT_ID});
        await waitForBatchedUpdatesWithAct();
    });
}

async function pressInvite() {
    fireEvent.press(screen.getByText('Invite'));
    await waitForBatchedUpdatesWithAct();
}

describe('WorkspaceInviteMessageComponent — approval workflow fast edit', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
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

    it('saves the workflow after inviting a new member on a fast edit', async () => {
        // Given a fast edit that detoured here to invite Dana, who is not a workspace member yet
        await seedFastEditHandOff();

        renderInviteMessagePage(FAST_EDIT_BACK_TO);
        await waitForBatchedUpdatesWithAct();

        // When the admin sends the invite
        await pressInvite();

        // Then the workflow is saved with Dana in it. There is no edit page behind a fast edit, so if this page
        // did not save, Dana would be invited with no submitsTo and the workflow would come back unchanged
        expect(addMembersToWorkspaceMock).toHaveBeenCalledTimes(1);
        expect(updateApprovalWorkflowMock).toHaveBeenCalledTimes(1);
        const [savedWorkflow, membersToRemove] = updateApprovalWorkflowMock.mock.calls.at(0) ?? [];
        expect(savedWorkflow?.members.map((member) => member.email)).toEqual([ALICE_EMAIL, BOB_EMAIL, DANA_EMAIL]);
        expect(membersToRemove).toEqual([]);
        // Then the admin lands on the workflows page rather than the create flow's approver step, because this
        // session already has an approver and is only changing who submits to it
        expect(goBackMock).toHaveBeenCalledTimes(1);
        expect(goBackMock.mock.calls.at(0)?.at(0)).toBe(`workspaces/${POLICY_ID}/workflows`);
        expect(navigateMock).not.toHaveBeenCalled();
    });

    it('clears the draft after the fast-edit save, so the next session starts clean', async () => {
        // Given a fast edit that detoured here to invite a new member
        await seedFastEditHandOff();

        renderInviteMessagePage(FAST_EDIT_BACK_TO);
        await waitForBatchedUpdatesWithAct();

        // When the admin sends the invite and the save runs
        await pressInvite();

        // Then the draft is gone. updateApprovalWorkflow is mocked here, so it can only have been cleared by the
        // page itself, which matters because neither real save path reliably clears it and a stranded isFastEdit
        // would let a later sub-page save on its own
        await expect(getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW)).resolves.toBeUndefined();
    });

    it('saves through the rules-based path when the MULTIPLE_APPROVERS beta is enabled', async () => {
        // Given the same invite detour on a workspace with the rules-based approvals beta on
        await act(async () => {
            await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.MULTIPLE_APPROVERS]);
            await waitForBatchedUpdatesWithAct();
        });
        await seedFastEditHandOff();

        renderInviteMessagePage(FAST_EDIT_BACK_TO);
        await waitForBatchedUpdatesWithAct();

        // When the admin sends the invite
        await pressInvite();

        // Then the save goes through the rules backend instead of employeeList, and is handed the original
        // members as the "before" side because that path diffs membership itself
        expect(updateApprovalWorkflowMock).not.toHaveBeenCalled();
        expect(updateApprovalWorkflowRulesMock).toHaveBeenCalledTimes(1);
        const [rulesParams] = updateApprovalWorkflowRulesMock.mock.calls.at(0) ?? [];
        expect(rulesParams?.approvalWorkflow.members.map((member) => member.email)).toEqual([ALICE_EMAIL, BOB_EMAIL, DANA_EMAIL]);
        expect(rulesParams?.initialApprovalWorkflow.members.map((member) => member.email)).toEqual([ALICE_EMAIL, BOB_EMAIL]);
        await expect(getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW)).resolves.toBeUndefined();
    });

    it('hides the Approver row on a fast-edit invite, so it cannot fight the workflow save', async () => {
        // Given a fast edit that detoured here on a Control workspace, where the Approver row would normally show
        await seedFastEditHandOff();

        renderInviteMessagePage(FAST_EDIT_BACK_TO);
        await waitForBatchedUpdatesWithAct();

        // When the page renders and the admin sends the invite
        // Then the row is not offered, because it is seeded from the policy's default approver rather than the
        // workflow being edited, so it asks the admin a question this path has no way to honor
        expect(screen.queryByText(TestHelper.translateLocal('workflowsPage.approver'))).not.toBeOnTheScreen();

        await pressInvite();

        // Then no submitsTo is passed to the invite, leaving the workflow save as the only thing that routes this
        // member. Otherwise the legacy path would overwrite the admin's pick with the workflow's first approver,
        // and the rules path would leave submitsTo on the row's value while the rules sent them somewhere else
        expect(addMembersToWorkspaceMock.mock.calls.at(0)?.at(8)).toBeUndefined();
    });

    it('still offers the Approver row on an invite that is not a fast edit', async () => {
        // Given the generic member invite flow on the same Control workspace
        await seedFastEditHandOff({isFastEdit: false});

        renderInviteMessagePage(`workspaces/${POLICY_ID}/members` as Route);
        await waitForBatchedUpdatesWithAct();

        // When the page renders
        // Then the Approver row is still there, because that flow really is choosing an approver and nothing
        // else will set one for the invited member
        expect(screen.getByText(TestHelper.translateLocal('workflowsPage.approver'))).toBeOnTheScreen();
    });

    it('leaves the save to the edit page when the invite came from an edit-page session', async () => {
        // Given an invite reached from an edit-page session, which carries a nested backTo to that page
        await seedFastEditHandOff({isFastEdit: false});

        renderInviteMessagePage(EDIT_PAGE_BACK_TO);
        await waitForBatchedUpdatesWithAct();

        // When the admin sends the invite
        await pressInvite();

        // Then nothing is saved here and the admin goes back to the edit page, because that page is still in the
        // stack and owns the save. Saving twice would double-write the same workflow
        expect(updateApprovalWorkflowMock).not.toHaveBeenCalled();
        expect(updateApprovalWorkflowRulesMock).not.toHaveBeenCalled();
        expect(goBackMock.mock.calls.at(0)?.at(0)).toBe(EDIT_PAGE_ROUTE);
        // Then the draft survives, because the edit page needs it to save
        const draft = await getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW);
        expect(draft?.members.map((member) => member.email)).toEqual([ALICE_EMAIL, BOB_EMAIL, DANA_EMAIL]);
    });

    it('still routes a create-flow invite to the approver step', async () => {
        // Given a create-flow invite, which also opens expenses-from with no nested backTo and so looks like a
        // fast edit from here
        await seedFastEditHandOff({action: CONST.APPROVAL_WORKFLOW.ACTION.CREATE, isInitialFlow: true, isFastEdit: undefined});

        renderInviteMessagePage(FAST_EDIT_BACK_TO);
        await waitForBatchedUpdatesWithAct();

        // When the admin sends the invite
        await pressInvite();

        // Then nothing is saved and the admin continues to the approver step, because a workflow being created
        // has no approver yet and saving now would write it back incomplete
        expect(updateApprovalWorkflowMock).not.toHaveBeenCalled();
        expect(navigateMock).toHaveBeenCalledTimes(1);
        expect(navigateMock.mock.calls.at(0)?.at(0)).toBe(`workspaces/${POLICY_ID}/workflows/approvals/approver?approverIndex=0`);
    });

    it('lets a superseded in-flight save land without wiping the draft a newer session already seeded', async () => {
        // Given a fast-edit invite whose draft teardown is still held behind the screen transition, and a newer
        // "+N more" session seeded into the single APPROVAL_WORKFLOW slot before it is released
        await seedFastEditHandOff();

        renderInviteMessagePage(FAST_EDIT_BACK_TO);
        await waitForBatchedUpdatesWithAct();

        mockPredictedTransition.shouldDefer = true;

        await pressInvite();

        await act(async () => {
            selectApprovalWorkflowForEdit({
                workflow: {members: [{email: CAROL_EMAIL, displayName: 'carol'}], approvers: [ALICE_MEMBER], isDefault: false},
                defaultWorkflowMembers: [],
                usedApproverEmails: [],
                isFastEdit: true,
            });
            await waitForBatchedUpdatesWithAct();
        });

        // When the held teardown finally runs
        await act(async () => {
            mockPredictedTransition.flush();
            await waitForBatchedUpdatesWithAct();
        });

        // Then the write still lands, because the invite already happened and the member would otherwise be left
        // with no submitsTo
        expect(updateApprovalWorkflowMock).toHaveBeenCalledTimes(1);
        const [, , , , shouldClearApprovalWorkflowDraft] = updateApprovalWorkflowMock.mock.calls.at(0) ?? [];
        // Then the newer draft survives, both from the teardown and from the write's optimistic data, so the
        // session the admin just started does not open with an empty picker
        expect(shouldClearApprovalWorkflowDraft).toBe(false);
        const draft = await getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW);
        expect(draft?.members.map((member) => member.email)).toEqual([CAROL_EMAIL]);
        expect(draft?.isFastEdit).toBe(true);
    });

    it('queues the save before navigating, so a reload during the pop cannot lose it', async () => {
        // Given a fast-edit invite where the transition never completes, standing in for the app being reloaded
        // or closed during the pop so any in-memory callback is gone
        await seedFastEditHandOff();

        renderInviteMessagePage(FAST_EDIT_BACK_TO);
        await waitForBatchedUpdatesWithAct();

        mockPredictedTransition.shouldDefer = true;

        // When the admin sends the invite
        await pressInvite();

        // Then the workflow write is already queued, before the navigation, because the invite itself is queued
        // by this point and leaving the member invited with no submitsTo is the exact silent no-op this exists
        // to prevent
        expect(addMembersToWorkspaceMock).toHaveBeenCalledTimes(1);
        expect(updateApprovalWorkflowMock).toHaveBeenCalledTimes(1);
        expect(updateApprovalWorkflowMock.mock.invocationCallOrder.at(0) ?? 0).toBeLessThan(goBackMock.mock.invocationCallOrder.at(0) ?? 0);
        const [savedWorkflow, , , , shouldClearApprovalWorkflowDraft] = updateApprovalWorkflowMock.mock.calls.at(0) ?? [];
        expect(savedWorkflow?.members.map((member) => member.email)).toEqual([ALICE_EMAIL, BOB_EMAIL, DANA_EMAIL]);
        // Then that early write stays off APPROVAL_WORKFLOW, so running before the transition cannot blank the
        // page that is still on screen
        expect(shouldClearApprovalWorkflowDraft).toBe(false);
    });
});
