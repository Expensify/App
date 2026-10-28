import {act, render} from '@testing-library/react-native';

import type {SelectionListApprover} from '@components/ApproverSelectionList';
import ApproverSelectionList from '@components/ApproverSelectionList';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import PersonalDetailsByLoginProvider from '@components/PersonalDetailsByLoginProvider';

import {INITIAL_APPROVAL_WORKFLOW} from '@libs/WorkflowUtils';

import WorkspaceWorkflowsApprovalsOverLimitApproverPage from '@pages/workspace/workflows/approvals/WorkspaceWorkflowsApprovalsOverLimitApproverPage';

import {setApprovalWorkflow} from '@userActions/Workflow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import type {PersonalDetailsList} from '@src/types/onyx/PersonalDetails';

import type {PropsWithChildren} from 'react';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import {buildPersonalDetails} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'workflow-over-limit-approver-test-policy';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_ACCOUNT_ID = 1;
const BOB_EMAIL = 'bob@example.com';
const BOB_ACCOUNT_ID = 2;
const ERIN_EMAIL = 'erin@example.com';
const ERIN_ACCOUNT_ID = 3;
const DAVE_EMAIL = 'dave@example.com';
const DAVE_ACCOUNT_ID = 4;
const FRANK_EMAIL = 'frank@example.com';
const FRANK_ACCOUNT_ID = 5;

// The tests read the rows the page hands the list, so the list itself renders nothing.
jest.mock('@components/ApproverSelectionList', () => jest.fn(() => null));
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => jest.fn(({children}: PropsWithChildren) => children));

jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actualNav = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actualNav,
        useNavigationState: () => [],
    };
});

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
}));

function buildPolicy(): Policy {
    return createMock<Policy>({
        id: POLICY_ID,
        name: 'Test Workspace',
        type: CONST.POLICY.TYPE.CORPORATE,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: ADMIN_EMAIL,
        approver: ADMIN_EMAIL,
        approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
        areWorkflowsEnabled: true,
        employeeList: {
            [ADMIN_EMAIL]: {email: ADMIN_EMAIL, role: CONST.POLICY.ROLE.ADMIN, submitsTo: ADMIN_EMAIL},
            [BOB_EMAIL]: {email: BOB_EMAIL, role: CONST.POLICY.ROLE.USER, submitsTo: ADMIN_EMAIL},
            [ERIN_EMAIL]: {email: ERIN_EMAIL, role: CONST.POLICY.ROLE.USER, submitsTo: ADMIN_EMAIL},
            [DAVE_EMAIL]: {email: DAVE_EMAIL, role: CONST.POLICY.ROLE.USER, submitsTo: ADMIN_EMAIL},
            [FRANK_EMAIL]: {email: FRANK_EMAIL, role: CONST.POLICY.ROLE.USER, submitsTo: ADMIN_EMAIL},
        },
    });
}

function buildPersonalDetailsList(): PersonalDetailsList {
    return {
        [ADMIN_ACCOUNT_ID]: buildPersonalDetails(ADMIN_EMAIL, ADMIN_ACCOUNT_ID, 'admin'),
        [BOB_ACCOUNT_ID]: buildPersonalDetails(BOB_EMAIL, BOB_ACCOUNT_ID, 'bob'),
        [ERIN_ACCOUNT_ID]: buildPersonalDetails(ERIN_EMAIL, ERIN_ACCOUNT_ID, 'erin'),
        [DAVE_ACCOUNT_ID]: buildPersonalDetails(DAVE_EMAIL, DAVE_ACCOUNT_ID, 'dave'),
        [FRANK_ACCOUNT_ID]: buildPersonalDetails(FRANK_EMAIL, FRANK_ACCOUNT_ID, 'frank'),
    };
}

async function renderPage(approverIndex: number) {
    const result = render(
        <ComposeProviders components={[OnyxListItemProvider, PersonalDetailsByLoginProvider, LocaleContextProvider]}>
            <WorkspaceWorkflowsApprovalsOverLimitApproverPage
                // @ts-expect-error - the page only reads route.params
                route={{name: SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_OVER_LIMIT_APPROVER, params: {policyID: POLICY_ID, approverIndex}}}
            />
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();
    return result;
}

function getRowLogins() {
    const rows: SelectionListApprover[] = jest.mocked(ApproverSelectionList).mock.lastCall?.[0].allApprovers ?? [];
    return rows.map((row) => row.login);
}

describe('WorkspaceWorkflowsApprovalsOverLimitApproverPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.mocked(ApproverSelectionList).mockClear();
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);
            await Onyx.set(ONYXKEYS.IS_LOADING_REPORT_DATA, false);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildPolicy());
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, buildPersonalDetailsList());
            await Onyx.merge(ONYXKEYS.SESSION, {email: ADMIN_EMAIL, accountID: ADMIN_ACCOUNT_ID});
            setApprovalWorkflow({
                ...INITIAL_APPROVAL_WORKFLOW,
                action: CONST.APPROVAL_WORKFLOW.ACTION.EDIT,
                members: [{email: DAVE_EMAIL, displayName: DAVE_EMAIL}],
                approvers: [
                    {email: BOB_EMAIL, displayName: BOB_EMAIL, approvalLimit: 5000},
                    {email: ERIN_EMAIL, displayName: ERIN_EMAIL},
                ],
            });
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('never offers an approver of the workflow as the additional approver for reports over the limit', async () => {
        // Given Bob > Erin, where Bob is setting a limit, and Erin already approves every report after him

        // When the admin picks who else approves Bob's reports over the limit
        await renderPage(0);

        // Then neither Bob nor Erin can be picked, since the limit would add no one, while everyone else can
        const logins = getRowLogins();
        expect(logins).not.toContain(BOB_EMAIL);
        expect(logins).not.toContain(ERIN_EMAIL);
        expect(logins).toEqual(expect.arrayContaining([ADMIN_EMAIL, DAVE_EMAIL, FRANK_EMAIL]));
    });
});
