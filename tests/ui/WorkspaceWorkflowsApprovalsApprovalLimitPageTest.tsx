import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import Navigation from '@libs/Navigation/Navigation';
import {INITIAL_APPROVAL_WORKFLOW} from '@libs/WorkflowUtils';

import WorkspaceWorkflowsApprovalsApprovalLimitPage from '@pages/workspace/workflows/approvals/WorkspaceWorkflowsApprovalsApprovalLimitPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {ApprovalWorkflowOnyx, Policy} from '@src/types/onyx';
import type {Approver} from '@src/types/onyx/ApprovalWorkflow';

import type {PropsWithChildren} from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import {buildPersonalDetails, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'workflow-approvals-approval-limit-test-policy';
const ALICE_EMAIL = 'alice@example.com';
const ALICE_ACCOUNT_ID = 1;
const BOB_EMAIL = 'bob@example.com';
const BOB_ACCOUNT_ID = 2;
const CAROL_EMAIL = 'carol@example.com';
const CAROL_ACCOUNT_ID = 3;
const EVERYONE = [ALICE_EMAIL, BOB_EMAIL, CAROL_EMAIL];

jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => jest.fn(({children}: PropsWithChildren) => children));

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
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

/** A Control workspace where everyone submits to Alice */
function buildPolicy(): Policy {
    return {
        id: POLICY_ID,
        name: 'Test Workspace',
        type: CONST.POLICY.TYPE.CORPORATE,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: ALICE_EMAIL,
        employeeList: Object.fromEntries(EVERYONE.map((email) => [email, {email, submitsTo: ALICE_EMAIL}])),
        approver: ALICE_EMAIL,
        approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
        areWorkflowsEnabled: true,
        outputCurrency: 'USD',
    };
}

const Stack = createStackNavigator();

/** Opens the page for the workflow's second approver, Bob, in a workflow Alice approves first */
async function renderPageForBob(action: ApprovalWorkflowOnyx['action'], bob: Partial<Approver> = {}, carol?: Approver) {
    const approvers: Approver[] = [{email: ALICE_EMAIL, displayName: 'alice'}, {email: BOB_EMAIL, displayName: 'bob', ...bob}, ...(carol ? [carol] : [])];
    await act(async () => {
        await Onyx.set(ONYXKEYS.APPROVAL_WORKFLOW, {
            ...INITIAL_APPROVAL_WORKFLOW,
            action,
            members: [{email: CAROL_EMAIL, displayName: 'carol'}],
            approvers,
            originalApprovers: approvers,
        });
    });
    await renderPageForApprover(1);
}

/** Opens the page for the approver at `approverIndex` of the workflow being edited */
async function renderPageForApprover(approverIndex: number) {
    render(
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name={SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_APPROVAL_LIMIT}>
                    {() => (
                        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
                            <WorkspaceWorkflowsApprovalsApprovalLimitPage
                                // @ts-expect-error - the page only reads route.params
                                route={{name: SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_APPROVAL_LIMIT, params: {policyID: POLICY_ID, approverIndex}}}
                            />
                        </ComposeProviders>
                    )}
                </Stack.Screen>
            </Stack.Navigator>
        </NavigationContainer>,
    );
    await waitForBatchedUpdatesWithAct();
}

async function getApprovers() {
    return (await getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW))?.approvers;
}

describe('WorkspaceWorkflowsApprovalsApprovalLimitPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.mocked(Navigation.goBack).mockClear();
        jest.mocked(Navigation.navigate).mockClear();
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
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('makes a new approver an optional over-limit approver for the report total the admin enters', async () => {
        // Given Bob was just added after Alice to a new workflow, so he gets every report
        await renderPageForBob(CONST.APPROVAL_WORKFLOW.ACTION.CREATE);
        expect(screen.getByText(translateLocal('workflowsApprovalLimitPage.whenShouldApprove', {approverName: 'bob'}))).toBeOnTheScreen();
        expect(screen.queryByText(translateLocal('workflowsApprovalLimitPage.reportTotal'))).toBeNull();

        // When the admin has him approve only the reports over 1,000.00
        fireEvent.press(screen.getByText(translateLocal('workflowsApprovalLimitPage.overSetAmount')));
        await waitForBatchedUpdatesWithAct();
        fireEvent.changeText(screen.getByLabelText(translateLocal('workflowsApprovalLimitPage.reportTotal')), '1000');
        await waitForBatchedUpdatesWithAct();

        // Then the page says which reports he gets before the admin moves on
        expect(screen.getByText(translateLocal('workflowsApprovalLimitPage.approvesOverAmount', {approverName: 'bob', amount: '$1,000.00'}))).toBeOnTheScreen();

        // When the admin moves on
        fireEvent.press(screen.getByText(translateLocal('workflowsApprovalLimitPage.next')));
        await waitForBatchedUpdatesWithAct();

        // Then Bob only gets the reports over that amount, and the admin is taken to confirm the workflow
        expect((await getApprovers())?.at(1)?.overLimitAmount).toBe(100000);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(POLICY_ID), {forceReplace: true});
    });

    it('asks for a report total before saving an optional over-limit approver', async () => {
        // Given Bob gets every report in a new workflow
        await renderPageForBob(CONST.APPROVAL_WORKFLOW.ACTION.CREATE);

        // When the admin has him approve only the reports over an amount, without entering one
        fireEvent.press(screen.getByText(translateLocal('workflowsApprovalLimitPage.overSetAmount')));
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText(translateLocal('workflowsApprovalLimitPage.next')));
        await waitForBatchedUpdatesWithAct();

        // Then the admin is asked for the amount, and Bob still gets every report
        expect(screen.getByText(translateLocal('workflowsApprovalLimitPage.enterAmountError'))).toBeOnTheScreen();
        expect((await getApprovers())?.at(1)?.overLimitAmount).toBeUndefined();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('keeps an optional over-limit approver from getting the reports over less than the one right before them', async () => {
        // Given Bob gets the reports over 1,000.00, and Carol is being added right after him in a new workflow
        await act(async () => {
            await Onyx.set(ONYXKEYS.APPROVAL_WORKFLOW, {
                ...INITIAL_APPROVAL_WORKFLOW,
                action: CONST.APPROVAL_WORKFLOW.ACTION.CREATE,
                members: [{email: ALICE_EMAIL, displayName: 'alice'}],
                approvers: [
                    {email: ALICE_EMAIL, displayName: 'alice'},
                    {email: BOB_EMAIL, displayName: 'bob', overLimitAmount: 100000},
                    {email: CAROL_EMAIL, displayName: 'carol'},
                ],
            });
        });
        await renderPageForApprover(2);

        // When the admin has Carol approve only the reports over 500.00
        fireEvent.press(screen.getByText(translateLocal('workflowsApprovalLimitPage.overSetAmount')));
        await waitForBatchedUpdatesWithAct();
        fireEvent.changeText(screen.getByLabelText(translateLocal('workflowsApprovalLimitPage.reportTotal')), '500');
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText(translateLocal('workflowsApprovalLimitPage.next')));
        await waitForBatchedUpdatesWithAct();

        // Then the admin is asked for a higher amount, since every report reaching Carol after Bob is already over 1,000.00
        expect(screen.getByText(translateLocal('workflowsPage.overLimitAmountBelowPreviousApprover'))).toBeOnTheScreen();
        expect((await getApprovers())?.at(2)?.overLimitAmount).toBeUndefined();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('has an optional over-limit approver approve every report again when the admin picks always', async () => {
        // Given Bob only gets the reports over 1,000.00 in the edited workflow
        await renderPageForBob(CONST.APPROVAL_WORKFLOW.ACTION.EDIT, {overLimitAmount: 100000});

        // When the admin has him always approve and saves
        fireEvent.press(screen.getByText(translateLocal('workflowsApprovalLimitPage.always')));
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText(translateLocal('common.save')));
        await waitForBatchedUpdatesWithAct();

        // Then Bob gets every report again, and the admin goes back to the workflow
        expect((await getApprovers())?.at(1)?.overLimitAmount).toBeUndefined();
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(POLICY_ID, ALICE_EMAIL, undefined), {compareParams: false});
    });

    it('removes the approver and moves up the approvers after them', async () => {
        // Given Bob only gets the reports over 1,000.00, followed by Carol, in the edited workflow
        await renderPageForBob(CONST.APPROVAL_WORKFLOW.ACTION.EDIT, {overLimitAmount: 100000}, {email: CAROL_EMAIL, displayName: 'carol'});

        // When the admin removes him
        fireEvent.press(screen.getByText(translateLocal('workflowsApprovalLimitPage.removeApprover')), {nativeEvent: {}});
        await waitForBatchedUpdatesWithAct();

        // Then Carol takes his place right after Alice, and the admin goes back to the workflow
        expect((await getApprovers())?.map((approver) => approver?.email)).toEqual([ALICE_EMAIL, CAROL_EMAIL]);
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(POLICY_ID, ALICE_EMAIL, undefined), {compareParams: false});
    });
});
