import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {convertPolicyEmployeesToApprovalWorkflows, INITIAL_APPROVAL_WORKFLOW} from '@libs/WorkflowUtils';

import WorkspaceWorkflowsApprovalsCreatePage from '@pages/workspace/workflows/approvals/WorkspaceWorkflowsApprovalsCreatePage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import {buildPersonalDetails, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'workflow-approvals-create-test-policy';
const ALICE_EMAIL = 'alice@example.com';
const ALICE_ACCOUNT_ID = 1;
const BOB_EMAIL = 'bob@example.com';
const BOB_ACCOUNT_ID = 2;
const CAROL_EMAIL = 'carol@example.com';
const CAROL_ACCOUNT_ID = 3;
const EVERYONE = [ALICE_EMAIL, BOB_EMAIL, CAROL_EMAIL];

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

/** A workspace where everyone submits to Alice, the default approver. */
function buildPolicy(): Policy {
    return {
        id: POLICY_ID,
        name: 'Test Workspace',
        type: CONST.POLICY.TYPE.CORPORATE,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: ALICE_EMAIL,
        employeeList: Object.fromEntries(EVERYONE.map((email) => [email, {email, submitsTo: ALICE_EMAIL}])),
        approver: ALICE_EMAIL,
        areWorkflowsEnabled: true,
        outputCurrency: 'USD',
    } as Policy;
}

const mockRoute = {
    key: 'test-route',
    name: 'Workspace_Approvals_New',
    params: {policyID: POLICY_ID},
};

const Stack = createStackNavigator();

async function renderCreatePageWithMembers(memberEmails: string[]) {
    await act(async () => {
        await Onyx.set(ONYXKEYS.APPROVAL_WORKFLOW, {
            ...INITIAL_APPROVAL_WORKFLOW,
            approvers: [{email: BOB_EMAIL, displayName: 'bob'}],
            members: memberEmails.map((email) => ({email, displayName: email})),
        });
    });
    render(
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name={SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_NEW}>
                    {() => (
                        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                            <WorkspaceWorkflowsApprovalsCreatePage
                                // @ts-expect-error - route type from navigator
                                route={mockRoute}
                            />
                        </ComposeProviders>
                    )}
                </Stack.Screen>
            </Stack.Navigator>
        </NavigationContainer>,
    );
    await waitForBatchedUpdatesWithAct();
}

async function getApprovalWorkflows() {
    const policy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`);
    return convertPolicyEmployeesToApprovalWorkflows({policy, personalDetails: {}, localeCompare: (a: string, b: string) => a.localeCompare(b)}).approvalWorkflows;
}

describe('WorkspaceWorkflowsApprovalsCreatePage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);
            await Onyx.set(ONYXKEYS.IS_LOADING_REPORT_DATA, false);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildPolicy());
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [ALICE_ACCOUNT_ID]: buildPersonalDetails(ALICE_EMAIL, ALICE_ACCOUNT_ID, 'alice'),
                [BOB_ACCOUNT_ID]: buildPersonalDetails(BOB_EMAIL, BOB_ACCOUNT_ID, 'bob'),
                [CAROL_ACCOUNT_ID]: buildPersonalDetails(CAROL_EMAIL, CAROL_ACCOUNT_ID, 'carol'),
            });
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

    it('makes a new workflow with everyone in it the default one', async () => {
        // Given a new workflow approved by Bob with everyone in it
        await renderCreatePageWithMembers(EVERYONE);

        // When the admin adds the workflow
        fireEvent.press(screen.getByText(translateLocal('workflowsCreateApprovalsPage.submitButton')));

        // Then Bob's workflow replaces Alice's as the default one, rather than leaving Alice's behind with no one in it
        await waitFor(async () => expect((await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`))?.approver).toBe(BOB_EMAIL));
        const approvalWorkflows = await getApprovalWorkflows();
        expect(approvalWorkflows).toHaveLength(1);
        expect(approvalWorkflows.at(0)?.isDefault).toBe(true);
        expect(approvalWorkflows.at(0)?.approvers.map((approver) => approver.email)).toEqual([BOB_EMAIL]);
    });

    it('keeps the current default workflow when the new workflow leaves someone out', async () => {
        // Given a new workflow approved by Bob with everyone except Alice
        await renderCreatePageWithMembers([BOB_EMAIL, CAROL_EMAIL]);

        // When the admin adds the workflow
        fireEvent.press(screen.getByText(translateLocal('workflowsCreateApprovalsPage.submitButton')));

        // Then Alice stays the default approver for herself, next to Bob's new workflow
        await waitFor(async () => expect((await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`))?.employeeList?.[CAROL_EMAIL]?.submitsTo).toBe(BOB_EMAIL));
        expect((await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`))?.approver).toBe(ALICE_EMAIL);
        const approvalWorkflows = await getApprovalWorkflows();
        expect(approvalWorkflows).toHaveLength(2);
        expect(approvalWorkflows.find((workflow) => workflow.isDefault)?.approvers.map((approver) => approver.email)).toEqual([ALICE_EMAIL]);
    });
});
