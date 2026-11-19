import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import Navigation from '@libs/Navigation/Navigation';

import WorkspaceWorkflowsApprovalsForkPage from '@pages/workspace/workflows/approvals/WorkspaceWorkflowsApprovalsForkPage';

import {removeApprovalWorkflowForks} from '@userActions/Workflow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import type {PolicyEmployeeList} from '@src/types/onyx/PolicyEmployee';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import Onyx from 'react-native-onyx';

import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'workflow-approvals-fork-test-policy';
const ADMIN_EMAIL = 'admin@example.com';
const ALICE_EMAIL = 'alice@example.com';
const BOB_EMAIL = 'bob@example.com';
const CHARLIE_EMAIL = 'charlie@example.com';
const DENISE_EMAIL = 'denise@example.com';
const SUBMITTER_EMAIL = 'submitter@example.com';

jest.mock('@userActions/Workflow', () => ({
    ...jest.requireActual<Record<string, unknown>>('@userActions/Workflow'),
    removeApprovalWorkflowForks: jest.fn(),
}));

// Matches ModalActions.CONFIRM (components/Modal/Global/ModalContext.tsx), inlined since a jest.mock factory
// can't reference an out-of-scope import.
const mockShowConfirmModal = jest.fn<Promise<{action: string}>, [{title: string}]>(() => Promise.resolve({action: 'CONFIRM'}));
jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: () => ({showConfirmModal: mockShowConfirmModal}),
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useIsFocused: () => true,
    usePreventRemove: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    dismissModal: jest.fn(),
}));

function buildPolicy(employeeList: PolicyEmployeeList): Policy {
    return {
        id: POLICY_ID,
        name: 'Test Workspace',
        type: CONST.POLICY.TYPE.CORPORATE,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: ADMIN_EMAIL,
        employeeList,
        approver: ALICE_EMAIL,
        approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
        areWorkflowsEnabled: true,
        outputCurrency: 'USD',
        avatarURL: '',
        lastModified: new Date().toISOString(),
        pendingAction: null,
        errors: {},
    };
}

const Stack = createStackNavigator();

function renderForkPage(forkApproverEmail: string) {
    const route = {key: 'fork-route', name: 'Workspace_Workflows_Approvals_Fork', params: {policyID: POLICY_ID, firstApproverEmail: ALICE_EMAIL, forkApproverEmail}};
    return render(
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name={SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_FORK}>
                    {() => (
                        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
                            <WorkspaceWorkflowsApprovalsForkPage
                                // @ts-expect-error - route type from navigator
                                route={route}
                            />
                        </ComposeProviders>
                    )}
                </Stack.Screen>
            </Stack.Navigator>
        </NavigationContainer>,
    );
}

async function setPolicy(employeeList: PolicyEmployeeList) {
    await act(async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildPolicy(employeeList));
        await waitForBatchedUpdatesWithAct();
    });
}

function runAfterTransition() {
    const [, options] = jest.mocked(Navigation.goBack).mock.calls.at(-1) ?? [];
    options?.afterTransition?.();
}

describe('WorkspaceWorkflowsApprovalsForkPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);
            await Onyx.set(ONYXKEYS.IS_LOADING_REPORT_DATA, false);
            await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.MULTIPLE_APPROVERS]);
            await Onyx.merge(ONYXKEYS.SESSION, {email: ADMIN_EMAIL, accountID: 1});
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

    it('removes the fork of a workflow that has only that one without asking first', async () => {
        // Given Alice sends reports over 2,000.00 to Bob, who sends them to Denise to approve instead of on to Charlie
        await setPolicy({
            [ADMIN_EMAIL]: {email: ADMIN_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
            [SUBMITTER_EMAIL]: {email: SUBMITTER_EMAIL, submitsTo: ALICE_EMAIL},
            [ALICE_EMAIL]: {email: ALICE_EMAIL, forwardsTo: CHARLIE_EMAIL, approvalLimit: 200000, overLimitForwardsTo: BOB_EMAIL},
            [BOB_EMAIL]: {email: BOB_EMAIL, forwardsTo: DENISE_EMAIL},
            [CHARLIE_EMAIL]: {email: CHARLIE_EMAIL},
            [DENISE_EMAIL]: {email: DENISE_EMAIL},
        });
        renderForkPage(BOB_EMAIL);
        await waitForBatchedUpdatesWithAct();

        // When the admin removes the fork
        fireEvent.press(screen.getByText(translateLocal('workflowsApprovalForkPage.removeFork')));
        await waitForBatchedUpdatesWithAct();
        runAfterTransition();

        // Then nothing asks for confirmation, since only that fork goes, and the workflow is saved with the approvers it shows
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(removeApprovalWorkflowForks).toHaveBeenCalledTimes(1);
        const approvalWorkflow = jest.mocked(removeApprovalWorkflowForks).mock.calls.at(0)?.at(0)?.approvalWorkflow;
        expect(approvalWorkflow?.approvers.map(({email}) => email)).toEqual([ALICE_EMAIL, BOB_EMAIL, CHARLIE_EMAIL]);
        expect(approvalWorkflow?.members.map(({email}) => email)).toEqual([SUBMITTER_EMAIL]);
    });

    it('asks before removing every fork of a workflow that has more than one', async () => {
        // Given Alice sends reports over 5,000.00 to Bob, who approves them, and Charlie sends the ones over 1,000.00 to Denise,
        // who approves them, so both skip the approvers after them
        await setPolicy({
            [ADMIN_EMAIL]: {email: ADMIN_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
            [SUBMITTER_EMAIL]: {email: SUBMITTER_EMAIL, submitsTo: ALICE_EMAIL},
            [ALICE_EMAIL]: {email: ALICE_EMAIL, forwardsTo: CHARLIE_EMAIL, approvalLimit: 500000, overLimitForwardsTo: BOB_EMAIL},
            [BOB_EMAIL]: {email: BOB_EMAIL},
            [CHARLIE_EMAIL]: {email: CHARLIE_EMAIL, forwardsTo: ADMIN_EMAIL, approvalLimit: 100000, overLimitForwardsTo: DENISE_EMAIL},
            [DENISE_EMAIL]: {email: DENISE_EMAIL},
        });
        renderForkPage(BOB_EMAIL);
        await waitForBatchedUpdatesWithAct();

        // When the admin removes the forks and confirms
        fireEvent.press(screen.getByText(translateLocal('workflowsApprovalForkPage.removeForks')));
        await waitForBatchedUpdatesWithAct();
        runAfterTransition();

        // Then they were asked first, since removing one fork removes the other too, and the workflow is saved once
        expect(mockShowConfirmModal).toHaveBeenCalledWith(expect.objectContaining({title: translateLocal('workflowsApprovalForkPage.removeForksTitle')}));
        expect(removeApprovalWorkflowForks).toHaveBeenCalledTimes(1);
    });

    it('keeps the forks when the admin cancels', async () => {
        // Given the same workflow with two forks, and the admin will cancel the confirmation
        mockShowConfirmModal.mockImplementationOnce(() => Promise.resolve({action: 'CLOSE'}));
        await setPolicy({
            [ADMIN_EMAIL]: {email: ADMIN_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
            [SUBMITTER_EMAIL]: {email: SUBMITTER_EMAIL, submitsTo: ALICE_EMAIL},
            [ALICE_EMAIL]: {email: ALICE_EMAIL, forwardsTo: CHARLIE_EMAIL, approvalLimit: 500000, overLimitForwardsTo: BOB_EMAIL},
            [BOB_EMAIL]: {email: BOB_EMAIL},
            [CHARLIE_EMAIL]: {email: CHARLIE_EMAIL, forwardsTo: ADMIN_EMAIL, approvalLimit: 100000, overLimitForwardsTo: DENISE_EMAIL},
            [DENISE_EMAIL]: {email: DENISE_EMAIL},
        });
        renderForkPage(BOB_EMAIL);
        await waitForBatchedUpdatesWithAct();

        // When the admin presses the button
        fireEvent.press(screen.getByText(translateLocal('workflowsApprovalForkPage.removeForks')));
        await waitForBatchedUpdatesWithAct();

        // Then nothing is saved and the page stays open
        expect(Navigation.goBack).not.toHaveBeenCalled();
        expect(removeApprovalWorkflowForks).not.toHaveBeenCalled();
    });
});
