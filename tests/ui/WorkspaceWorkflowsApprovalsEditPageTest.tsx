import {act, render} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import WorkspaceWorkflowsApprovalsEditPage from '@pages/workspace/workflows/approvals/WorkspaceWorkflowsApprovalsEditPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type {ApprovalWorkflowOnyx, Approver, Member} from '@src/types/onyx/ApprovalWorkflow';
import type {PersonalDetailsList} from '@src/types/onyx/PersonalDetails';
import type {PolicyEmployeeList} from '@src/types/onyx/PolicyEmployee';
import {buildPersonalDetails} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'workflow-approvals-edit-test-policy';
const ALICE_EMAIL = 'alice@example.com';
const ALICE_ACCOUNT_ID = 1;

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
        isPolicyExpenseChatEnabled: true,
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

const renderEditPage = () =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <WorkspaceWorkflowsApprovalsEditPage
                // @ts-expect-error - route type from navigator
                route={mockRoute}
            />
        </ComposeProviders>,
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
});
