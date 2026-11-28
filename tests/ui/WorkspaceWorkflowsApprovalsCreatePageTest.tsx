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
    getActiveRoute: jest.fn(() => ''),
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
    return renderCreatePage();
}

async function renderCreatePage() {
    const result = render(
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
    return result;
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

    it.each([CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL, CONST.POLICY.APPROVAL_MODE.ADVANCED])('initializes a missing draft on direct entry with %s approvals', async (approvalMode) => {
        // Given a workspace that allows approval creation, with no saved draft
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {approvalMode, dynamicExternalWorkflowHidePeople: false});
        });

        // When the create route is opened without going through the wizard
        const page = await renderCreatePage();

        // Then the form is ready with a complete draft that supports editing its members and approvers
        expect(await screen.findByText(translateLocal('workflowsCreateApprovalsPage.submitButton'))).toBeTruthy();
        const draft = await getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW);
        expect(draft).toEqual({
            ...INITIAL_APPROVAL_WORKFLOW,
            isInitialFlow: false,
            availableMembers: expect.arrayContaining(EVERYONE.map((email) => expect.objectContaining({email}))),
            usedApproverEmails: [ALICE_EMAIL],
        });

        // When the page is reloaded without a persisted draft
        page.unmount();
        await act(async () => {
            await Onyx.set(ONYXKEYS.APPROVAL_WORKFLOW, null);
        });
        await renderCreatePage();

        // Then the form recovers rather than remaining on the loading indicator
        expect(await screen.findByText(translateLocal('workflowsCreateApprovalsPage.submitButton'))).toBeTruthy();
        expect(await getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW)).toEqual(draft);
    });

    it('preserves an existing draft and its selections across reloads', async () => {
        // Given a wizard draft with selected members and an approver
        const page = await renderCreatePageWithMembers([CAROL_EMAIL]);
        const draft = await getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW);

        // When the confirmation page is reloaded with that persisted draft
        page.unmount();
        await renderCreatePage();

        // Then initialization does not replace the in-progress selections
        expect(screen.getByText(translateLocal('workflowsCreateApprovalsPage.submitButton'))).toBeTruthy();
        expect(await getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW)).toEqual(draft);
    });

    it('does not initialize a draft when DEW hides people', async () => {
        // Given a DEW workspace whose people must not be shown
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
                approvalMode: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL,
                dynamicExternalWorkflowHidePeople: true,
            });
        });

        // When the create route is opened directly
        await renderCreatePage();

        // Then access remains blocked without creating a draft
        expect(screen.getByText(translateLocal('workspace.common.notAuthorized'))).toBeTruthy();
        expect(screen.queryByText(translateLocal('workflowsCreateApprovalsPage.submitButton'))).toBeNull();
        expect(await getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW)).toBeUndefined();
    });

    it('names a lone approver without a position', async () => {
        // Given a new workflow approved only by Bob
        // When the confirm page renders
        await renderCreatePageWithMembers(EVERYONE);

        // Then there's no first or final approver to tell apart, so Bob is just the approver
        expect(screen.getByText(translateLocal('workflowsPage.approver'))).toBeTruthy();
        expect(screen.queryByText(/^first approver$/i)).toBeNull();
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

    it('moves a member out of their current workflow when the new workflow takes them, with Multiple Approvers on', async () => {
        // Given Multiple Approvers is on and a rule already sends Alice's and Carol's reports to Alice
        const aliceWorkflowRuleKey = `${ONYXKEYS.COLLECTION.RULE}aliceWorkflowRule` as const;
        await act(async () => {
            await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.MULTIPLE_APPROVERS]);
            await Onyx.set(aliceWorkflowRuleKey, {
                scope: CONST.RULES.SCOPE.POLICY,
                scopeID: POLICY_ID,
                triggers: Object.fromEntries([['1', CONST.RULES.TRIGGERS.REPORT_SUBMIT]]),
                filters: {operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, left: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM, right: [ALICE_EMAIL, CAROL_EMAIL]},
                actions: Object.fromEntries([['1', {name: CONST.RULES.ACTIONS.FORWARD_TO, approver: ALICE_EMAIL}]]),
            });
        });
        await renderCreatePageWithMembers([CAROL_EMAIL]);

        // When the admin adds a workflow approved by Bob with Carol in it
        fireEvent.press(screen.getByText(translateLocal('workflowsCreateApprovalsPage.submitButton')));

        // Then Carol leaves Alice's rule, since a member can only belong to one workflow, and Alice stays in it
        await waitFor(async () => expect((await getOnyxValue(aliceWorkflowRuleKey))?.filters).toEqual(expect.objectContaining({right: [ALICE_EMAIL]})));
    });
});
