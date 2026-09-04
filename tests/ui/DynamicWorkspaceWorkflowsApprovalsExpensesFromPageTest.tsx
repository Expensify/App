import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {updateApprovalWorkflow} from '@libs/actions/Workflow';

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

jest.mock('@libs/actions/Workflow', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/actions/Workflow');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        updateApprovalWorkflow: jest.fn(),
    };
});

const updateApprovalWorkflowMock = jest.mocked(updateApprovalWorkflow);

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

/**
 * Seeds an EDIT-mode draft where the admin has already deselected Bob, i.e. the state the page is in
 * right before "Save" is pressed.
 */
async function seedWorkflowWithBobDeselected(isFastEdit: boolean) {
    const seededWorkflow: ApprovalWorkflowOnyx = {
        action: CONST.APPROVAL_WORKFLOW.ACTION.EDIT,
        approvers: [CAROL_APPROVER],
        originalApprovers: [CAROL_APPROVER],
        originalMembers: [ALICE_MEMBER, BOB_MEMBER],
        members: [ALICE_MEMBER],
        availableMembers: [ALICE_MEMBER, BOB_MEMBER],
        usedApproverEmails: [],
        isDefault: false,
        isFastEdit,
    };
    await act(async () => {
        await Onyx.set(ONYXKEYS.APPROVAL_WORKFLOW, seededWorkflow);
        await waitForBatchedUpdatesWithAct();
    });
}

describe('DynamicWorkspaceWorkflowsApprovalsExpensesFromPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        updateApprovalWorkflowMock.mockClear();
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

        fireEvent.press(screen.getByText('Save'));
        await waitForBatchedUpdatesWithAct();

        expect(updateApprovalWorkflowMock).toHaveBeenCalledTimes(1);
        const [savedWorkflow, membersToRemove] = updateApprovalWorkflowMock.mock.calls.at(0) ?? [];
        expect(savedWorkflow?.members.map((member) => member.email)).toEqual([ALICE_EMAIL]);
        expect(membersToRemove?.map((member) => member.email)).toEqual([BOB_EMAIL]);
    });

    it('leaves saving to the edit page when the sub-page was not opened as a fast edit', async () => {
        await seedWorkflowWithBobDeselected(false);

        renderExpensesFromPage();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText('Save'));
        await waitForBatchedUpdatesWithAct();

        expect(updateApprovalWorkflowMock).not.toHaveBeenCalled();
    });
});
