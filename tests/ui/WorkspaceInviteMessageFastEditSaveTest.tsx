import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {addMembersToWorkspace} from '@libs/actions/Policy/Member';
import {saveFastEditApprovalWorkflow} from '@libs/actions/Workflow';
import Navigation from '@libs/Navigation/Navigation';

import WorkspaceInviteMessageComponent from '@pages/workspace/members/WorkspaceInviteMessageComponent';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import type {ApprovalWorkflowOnyx, Approver, Member} from '@src/types/onyx/ApprovalWorkflow';
import type {CurrentUserPersonalDetails, PersonalDetailsList} from '@src/types/onyx/PersonalDetails';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import {buildPersonalDetails} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'workflow-fast-edit-invite-test-policy';
const ALICE_EMAIL = 'alice@example.com';
const ALICE_ACCOUNT_ID = 1;
const BOB_EMAIL = 'bob@example.com';
const BOB_ACCOUNT_ID = 2;
const CAROL_EMAIL = 'carol@example.com';
const CAROL_ACCOUNT_ID = 3;
// Not in the workspace yet, so picking them on the expenses-from page is what leads to the invite page.
const DANA_EMAIL = 'dana@example.com';
const DANA_ACCOUNT_ID = 4;

// "+N more" and the create flow open expenses-from with no nested backTo. The Edit page passes itself as the nested backTo.
const NO_NESTED_BACK_TO = `workspaces/${POLICY_ID}/workflows/approvals/expenses-from` as Route;
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

jest.mock('@libs/actions/Policy/Member', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/actions/Policy/Member');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        addMembersToWorkspace: jest.fn(),
    };
});

const saveFastEditApprovalWorkflowMock = jest.mocked(saveFastEditApprovalWorkflow);
const addMembersToWorkspaceMock = jest.mocked(addMembersToWorkspace);
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
            [ALICE_EMAIL]: {email: ALICE_EMAIL, submitsTo: ALICE_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
            [BOB_EMAIL]: {email: BOB_EMAIL, submitsTo: CAROL_EMAIL, role: CONST.POLICY.ROLE.USER},
            [CAROL_EMAIL]: {email: CAROL_EMAIL, submitsTo: ALICE_EMAIL, role: CONST.POLICY.ROLE.USER},
        },
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

/** Seeds what the expenses-from page hands off: Dana is in the draft's members and in the invite draft, but not in the workspace yet. */
async function seedHandOff(overrides: Partial<ApprovalWorkflowOnyx>) {
    const seededWorkflow: ApprovalWorkflowOnyx = {
        action: CONST.APPROVAL_WORKFLOW.ACTION.EDIT,
        approvers: [CAROL_APPROVER],
        originalApprovers: [CAROL_APPROVER],
        originalMembers: [ALICE_MEMBER, BOB_MEMBER],
        members: [ALICE_MEMBER, BOB_MEMBER, DANA_MEMBER],
        availableMembers: [ALICE_MEMBER, BOB_MEMBER],
        usedApproverEmails: [],
        isDefault: false,
        ...overrides,
    };
    await act(async () => {
        await Onyx.set(ONYXKEYS.APPROVAL_WORKFLOW, seededWorkflow);
        await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${POLICY_ID}`, {[DANA_EMAIL]: DANA_ACCOUNT_ID});
        await waitForBatchedUpdatesWithAct();
    });
}

async function renderAndPressInvite(backTo: Route) {
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
    await waitForBatchedUpdatesWithAct();
    fireEvent.press(screen.getByText('Invite'));
    await waitForBatchedUpdatesWithAct();
}

describe('WorkspaceInviteMessageComponent - "+N more" workflow edit', () => {
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

    it('goes back to Workflows and saves the workflow with the invited member on a "+N more" edit', async () => {
        // Given a "+N more" edit that came here to invite Dana
        await seedHandOff({isFastEdit: true});

        // When the admin sends the invite
        await renderAndPressInvite(NO_NESTED_BACK_TO);

        // Then the admin lands on the Workflows page and the workflow is saved with Dana in it
        expect(goBackMock).toHaveBeenCalledTimes(1);
        expect(goBackMock.mock.calls.at(0)?.at(0)).toBe(`workspaces/${POLICY_ID}/workflows`);
        expect(saveFastEditApprovalWorkflowMock).toHaveBeenCalledTimes(1);
        const [params] = saveFastEditApprovalWorkflowMock.mock.calls.at(0) ?? [];
        expect(params?.approvalWorkflow.members.map((member) => member.email)).toEqual([ALICE_EMAIL, BOB_EMAIL, DANA_EMAIL]);
        expect(navigateMock).not.toHaveBeenCalled();
    });

    it('keeps the invited member out of the fast-edit save when a different approver was explicitly selected', async () => {
        // Given a "+N more" edit where the admin explicitly assigns Dana to Alice instead of the edited workflow's approver, Carol
        await seedHandOff({isFastEdit: true});
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_APPROVER_DRAFT}${POLICY_ID}`, ALICE_EMAIL);
            await waitForBatchedUpdatesWithAct();
        });

        // When the admin sends the invite
        await renderAndPressInvite(NO_NESTED_BACK_TO);

        // Then the invite assigns Dana to Alice while the fast-edit save leaves Dana out so it cannot reassign them to Carol
        expect(addMembersToWorkspaceMock.mock.lastCall?.at(-1)).toBe(ALICE_EMAIL);
        expect(saveFastEditApprovalWorkflowMock).toHaveBeenCalledTimes(1);
        const [params] = saveFastEditApprovalWorkflowMock.mock.calls.at(0) ?? [];
        expect(params?.approvalWorkflow.members.map((member) => member.email)).toEqual([ALICE_EMAIL, BOB_EMAIL]);
    });

    it('returns to the Edit page without saving when the invite came from the Edit page', async () => {
        // Given an invite reached from the Edit page, which owns the save
        await seedHandOff({isFastEdit: false});

        // When the admin sends the invite
        await renderAndPressInvite(EDIT_PAGE_BACK_TO);

        // Then the admin goes back to the Edit page and nothing is saved here
        expect(goBackMock.mock.calls.at(0)?.at(0)).toBe(EDIT_PAGE_ROUTE);
        expect(saveFastEditApprovalWorkflowMock).not.toHaveBeenCalled();
    });

    it('still continues the create flow to the approver step', async () => {
        // Given an invite reached from the first step of creating a workflow
        await seedHandOff({action: CONST.APPROVAL_WORKFLOW.ACTION.CREATE, isInitialFlow: true});

        // When the admin sends the invite
        await renderAndPressInvite(NO_NESTED_BACK_TO);

        // Then the admin continues to the approver step and nothing is saved yet
        expect(navigateMock).toHaveBeenCalledTimes(1);
        expect(navigateMock.mock.calls.at(0)?.at(0)).toBe(`workspaces/${POLICY_ID}/workflows/approvals/approver?approverIndex=0`);
        expect(saveFastEditApprovalWorkflowMock).not.toHaveBeenCalled();
    });
});
