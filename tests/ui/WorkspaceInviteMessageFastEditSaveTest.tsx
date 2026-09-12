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
import {buildPersonalDetails} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'workflow-fast-edit-invite-test-policy';
const ALICE_EMAIL = 'alice@example.com';
const ALICE_ACCOUNT_ID = 1;
const BOB_EMAIL = 'bob@example.com';
const BOB_ACCOUNT_ID = 2;
const CAROL_EMAIL = 'carol@example.com';
const CAROL_ACCOUNT_ID = 3;
// Not in the workspace yet — picking them on the expenses-from page is what detours through the invite page.
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

// goBack runs `afterTransition` once the screen transition finishes, which never happens in a test. Run it
// synchronously so the deferred save is observable, and record the route so the destination can be asserted.
jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn((_route?: string, options?: {afterTransition?: () => void}) => {
        options?.afterTransition?.();
    }),
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    dismissModal: jest.fn(),
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
        goBackMock.mockImplementation((_route?: string, options?: {afterTransition?: () => void}) => {
            options?.afterTransition?.();
        });
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
        await seedFastEditHandOff();

        renderInviteMessagePage(FAST_EDIT_BACK_TO);
        await waitForBatchedUpdatesWithAct();

        await pressInvite();

        expect(addMembersToWorkspaceMock).toHaveBeenCalledTimes(1);
        expect(updateApprovalWorkflowMock).toHaveBeenCalledTimes(1);
        const [savedWorkflow, membersToRemove] = updateApprovalWorkflowMock.mock.calls.at(0) ?? [];
        // The invited member has to reach the save, or they never get a submitsTo and the workflow comes back unchanged.
        expect(savedWorkflow?.members.map((member) => member.email)).toEqual([ALICE_EMAIL, BOB_EMAIL, DANA_EMAIL]);
        expect(membersToRemove).toEqual([]);
        // Back to the workflows page, not the approver step of the create flow.
        expect(goBackMock).toHaveBeenCalledTimes(1);
        expect(goBackMock.mock.calls.at(0)?.at(0)).toBe(`workspaces/${POLICY_ID}/workflows`);
        expect(navigateMock).not.toHaveBeenCalled();
    });

    it('clears the draft after the fast-edit save, so the next session starts clean', async () => {
        await seedFastEditHandOff();

        renderInviteMessagePage(FAST_EDIT_BACK_TO);
        await waitForBatchedUpdatesWithAct();

        await pressInvite();

        // updateApprovalWorkflow is mocked here, so the draft can only be gone if the page cleared it itself.
        await expect(getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW)).resolves.toBeUndefined();
    });

    it('saves through the rules-based path when the MULTIPLE_APPROVERS beta is enabled', async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.MULTIPLE_APPROVERS]);
            await waitForBatchedUpdatesWithAct();
        });
        await seedFastEditHandOff();

        renderInviteMessagePage(FAST_EDIT_BACK_TO);
        await waitForBatchedUpdatesWithAct();

        await pressInvite();

        expect(updateApprovalWorkflowMock).not.toHaveBeenCalled();
        expect(updateApprovalWorkflowRulesMock).toHaveBeenCalledTimes(1);
        const [rulesParams] = updateApprovalWorkflowRulesMock.mock.calls.at(0) ?? [];
        expect(rulesParams?.approvalWorkflow.members.map((member) => member.email)).toEqual([ALICE_EMAIL, BOB_EMAIL, DANA_EMAIL]);
        // The rules path diffs membership itself, so it needs the original members as the "before" side.
        expect(rulesParams?.initialApprovalWorkflow.members.map((member) => member.email)).toEqual([ALICE_EMAIL, BOB_EMAIL]);
        await expect(getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW)).resolves.toBeUndefined();
    });

    it('leaves the save to the edit page when the invite came from an edit-page session', async () => {
        await seedFastEditHandOff({isFastEdit: false});

        renderInviteMessagePage(EDIT_PAGE_BACK_TO);
        await waitForBatchedUpdatesWithAct();

        await pressInvite();

        expect(updateApprovalWorkflowMock).not.toHaveBeenCalled();
        expect(updateApprovalWorkflowRulesMock).not.toHaveBeenCalled();
        // The nested backTo wins: the edit page is still in the stack and owns the save.
        expect(goBackMock.mock.calls.at(0)?.at(0)).toBe(EDIT_PAGE_ROUTE);
        // The draft must survive for that page to save.
        const draft = await getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW);
        expect(draft?.members.map((member) => member.email)).toEqual([ALICE_EMAIL, BOB_EMAIL, DANA_EMAIL]);
    });

    it('still routes a create-flow invite to the approver step', async () => {
        // The create flow also opens expenses-from with no nested backTo, but the approver step is the next
        // legitimate step there, so it must not be diverted by the fast-edit save.
        await seedFastEditHandOff({action: CONST.APPROVAL_WORKFLOW.ACTION.CREATE, isInitialFlow: true, isFastEdit: undefined});

        renderInviteMessagePage(FAST_EDIT_BACK_TO);
        await waitForBatchedUpdatesWithAct();

        await pressInvite();

        expect(updateApprovalWorkflowMock).not.toHaveBeenCalled();
        expect(navigateMock).toHaveBeenCalledTimes(1);
        expect(navigateMock.mock.calls.at(0)?.at(0)).toBe(`workspaces/${POLICY_ID}/workflows/approvals/approver?approverIndex=0`);
    });

    it('lets a superseded in-flight save land without wiping the draft a newer session already seeded', async () => {
        await seedFastEditHandOff();

        renderInviteMessagePage(FAST_EDIT_BACK_TO);
        await waitForBatchedUpdatesWithAct();

        // Hold the deferred save, then start a newer "+N more" session before releasing it.
        let releaseSave: (() => void) | undefined;
        goBackMock.mockImplementation((_route?: string, options?: {afterTransition?: () => void}) => {
            releaseSave = options?.afterTransition;
        });

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

        await act(async () => {
            releaseSave?.();
            await waitForBatchedUpdatesWithAct();
        });

        // The invite already happened, so the write it belongs to still has to land...
        expect(updateApprovalWorkflowMock).toHaveBeenCalledTimes(1);
        const [, , , , shouldClearApprovalWorkflowDraft] = updateApprovalWorkflowMock.mock.calls.at(0) ?? [];
        // ...but it must not clear the newer draft, directly or through its optimistic data.
        expect(shouldClearApprovalWorkflowDraft).toBe(false);
        const draft = await getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW);
        expect(draft?.members.map((member) => member.email)).toEqual([CAROL_EMAIL]);
        expect(draft?.isFastEdit).toBe(true);
    });

    it('queues the save before navigating, so a reload during the pop cannot lose it', async () => {
        await seedFastEditHandOff();

        renderInviteMessagePage(FAST_EDIT_BACK_TO);
        await waitForBatchedUpdatesWithAct();

        // Never release the transition: the app was reloaded or closed during the pop, so the in-memory
        // afterTransition callback is gone.
        goBackMock.mockImplementation(() => {});

        await pressInvite();

        // The invite is already queued at this point, so the workflow write has to be queued too — otherwise the
        // member is invited with no submitsTo, the exact silent no-op this save exists to prevent.
        expect(addMembersToWorkspaceMock).toHaveBeenCalledTimes(1);
        expect(updateApprovalWorkflowMock).toHaveBeenCalledTimes(1);
        expect(updateApprovalWorkflowMock.mock.invocationCallOrder.at(0) ?? 0).toBeLessThan(goBackMock.mock.invocationCallOrder.at(0) ?? 0);
        const [savedWorkflow, , , , shouldClearApprovalWorkflowDraft] = updateApprovalWorkflowMock.mock.calls.at(0) ?? [];
        expect(savedWorkflow?.members.map((member) => member.email)).toEqual([ALICE_EMAIL, BOB_EMAIL, DANA_EMAIL]);
        // The save must stay off APPROVAL_WORKFLOW so it can run before the transition without blanking the page.
        expect(shouldClearApprovalWorkflowDraft).toBe(false);
    });
});
