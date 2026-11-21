/**
 * Measures one member toggle on the approval workflow "Expenses from" page, for workspaces with many members and
 * workflows with many selected members. Each measured run renders the real page with M workspace members and a
 * workflow that already has S of them, selects one more member the way the list does, and waits until the page has
 * handed the list its rebuilt rows with that member selected. The list itself is mocked, as in the page's UI tests,
 * so the time is the page's own work (Onyx writes, re-render and the member list build), not the list's rendering.
 *
 * Run with: npm run perf-local -- --testMatch '<rootDir>/tests/perf-local/ExpensesFromMemberList.perf-local.ts'
 * It prints one line per scenario, so it also runs under plain Jest:
 * npx jest --testMatch '<rootDir>/tests/perf-local/ExpensesFromMemberList.perf-local.ts' --runInBand
 */
import {act, render} from '@testing-library/react-native';

import ApproverSelectionList from '@components/ApproverSelectionList';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import DynamicWorkspaceWorkflowsApprovalsExpensesFromPage from '@pages/workspace/workflows/approvals/DynamicWorkspaceWorkflowsApprovalsExpensesFromPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, PolicyEmployeeList} from '@src/types/onyx';
import type {ApprovalWorkflowOnyx, Member} from '@src/types/onyx/ApprovalWorkflow';

import type {PropsWithChildren} from 'react';

import React from 'react';
import Onyx from 'react-native-onyx';
import {measureAsyncFunction} from 'reassure';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'expenses-from-perf-policy';
const ADMIN_EMAIL = 'admin@perf.example';
const ADMIN_ACCOUNT_ID = 1;
const FIRST_MEMBER_ACCOUNT_ID = 1000;
const RUNS = 10;
const WARMUP_RUNS = 1;
const TEST_TIMEOUT_MS = 20 * 60 * 1000;

jest.mock('@components/ApproverSelectionList', () => jest.fn(() => null));
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@hooks/usePersonalDetailSearchSelector', () =>
    jest.fn(() => ({
        setSearchTerm: jest.fn(),
        debouncedSearchTerm: '',
        availableOptions: {selectedOptions: [], recentOptions: [], personalDetails: [], userToInvite: null},
        areOptionsInitialized: true,
    })),
);

/** One member in fifty has a phone login when `phoneShare` is 0.02, spread evenly through the workspace. */
function getMemberLogin(index: number, phoneShare: number): string {
    const phoneEvery = phoneShare > 0 ? Math.round(1 / phoneShare) : 0;
    if (phoneEvery && index % phoneEvery === 0) {
        return `+1202555${String(index).padStart(4, '0')}${CONST.SMS.DOMAIN}`;
    }
    return `member${String(index).padStart(5, '0')}@perf.example`;
}

/** A workspace with the admin and `memberCount` members, and the personal details of all of them. */
function buildWorkspace(memberCount: number, phoneShare: number) {
    const employeeList: PolicyEmployeeList = {[ADMIN_EMAIL]: {email: ADMIN_EMAIL, role: CONST.POLICY.ROLE.ADMIN, submitsTo: ADMIN_EMAIL}};
    const personalDetails: PersonalDetailsList = {[ADMIN_ACCOUNT_ID]: {accountID: ADMIN_ACCOUNT_ID, login: ADMIN_EMAIL, displayName: 'Admin'}};
    const memberLogins: string[] = [];
    for (let index = 0; index < memberCount; index++) {
        const login = getMemberLogin(index, phoneShare);
        const accountID = FIRST_MEMBER_ACCOUNT_ID + index;
        memberLogins.push(login);
        employeeList[login] = {email: login, role: CONST.POLICY.ROLE.USER, submitsTo: ADMIN_EMAIL};
        personalDetails[accountID] = {accountID, login, displayName: `Member ${index}`};
    }
    const policy = createMock<Policy>({
        id: POLICY_ID,
        name: 'Perf Workspace',
        type: CONST.POLICY.TYPE.CORPORATE,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: ADMIN_EMAIL,
        approver: ADMIN_EMAIL,
        employeeList,
        areWorkflowsEnabled: true,
        outputCurrency: 'USD',
    });
    return {policy, personalDetails, memberLogins};
}

function getLastListProps() {
    const listProps = jest.mocked(ApproverSelectionList).mock.lastCall?.[0];
    if (!listProps) {
        throw new Error('The page did not render the member list');
    }
    return listProps;
}

function writeResult(label: string, result: {meanDuration: number; stdevDuration: number; durations: number[]; outlierDurations?: number[]}, listRendersPerToggle: number[]) {
    // Written to stdout directly so the numbers reach the CI log even when Jest runs with --silent.
    const durations = result.durations.map((duration) => duration.toFixed(1)).join(', ');
    const outliers = (result.outlierDurations ?? []).map((duration) => duration.toFixed(1)).join(', ');
    process.stdout.write(
        `[ExpensesFromBench] ${label} mean=${result.meanDuration.toFixed(1)}ms stdev=${result.stdevDuration.toFixed(1)}ms runs=${RUNS} durations=[${durations}] outliers=[${outliers}] listRendersPerToggle=[${listRendersPerToggle.join(', ')}]\n`,
    );
}

const SCENARIOS = [
    {memberCount: 1_000, selectedCount: 100, phoneShare: 0},
    {memberCount: 1_000, selectedCount: 500, phoneShare: 0},
    {memberCount: 3_000, selectedCount: 300, phoneShare: 0},
    {memberCount: 5_000, selectedCount: 500, phoneShare: 0},
    {memberCount: 1_000, selectedCount: 500, phoneShare: 0.02},
];

describe('Approval workflow "Expenses from" member toggle', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.mocked(ApproverSelectionList).mockClear();
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);
            await Onyx.set(ONYXKEYS.IS_LOADING_REPORT_DATA, false);
            await Onyx.merge(ONYXKEYS.SESSION, {email: ADMIN_EMAIL, accountID: ADMIN_ACCOUNT_ID});
        });
    });

    test.each(SCENARIOS)(
        '$memberCount members, $selectedCount selected, phone share $phoneShare',
        async ({memberCount, selectedCount, phoneShare}) => {
            const {policy, personalDetails, memberLogins} = buildWorkspace(memberCount, phoneShare);
            const initialMembers: Member[] = memberLogins.slice(0, selectedCount).map((email) => ({email, displayName: email}));
            const targetLogin = memberLogins.at(selectedCount) ?? '';
            const workflow: ApprovalWorkflowOnyx = {
                action: CONST.APPROVAL_WORKFLOW.ACTION.EDIT,
                approvers: [{email: ADMIN_EMAIL, displayName: 'Admin'}],
                originalApprovers: [{email: ADMIN_EMAIL, displayName: 'Admin'}],
                members: initialMembers,
                availableMembers: [],
                usedApproverEmails: [],
                isDefault: false,
            };
            await act(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
                await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
                await Onyx.set(ONYXKEYS.APPROVAL_WORKFLOW, workflow);
            });

            const {unmount} = render(
                React.createElement(
                    ComposeProviders,
                    createMock<React.ComponentProps<typeof ComposeProviders>>({components: [OnyxListItemProvider, LocaleContextProvider]}),
                    React.createElement(
                        DynamicWorkspaceWorkflowsApprovalsExpensesFromPage,
                        createMock<React.ComponentProps<typeof DynamicWorkspaceWorkflowsApprovalsExpensesFromPage>>({route: {params: {policyID: POLICY_ID}}}),
                    ),
                ),
            );
            await waitForBatchedUpdatesWithAct();
            // Every workspace member plus the admin is listed once.
            expect(getLastListProps().allApprovers).toHaveLength(memberCount + 1);

            let completedToggles = 0;
            const listRendersPerToggle: number[] = [];

            const result = await measureAsyncFunction(
                async () => {
                    const listProps = getLastListProps();
                    const target = listProps.allApprovers.find((approver) => approver.login === targetLogin);
                    if (!target) {
                        throw new Error(`${targetLogin} is not in the member list`);
                    }
                    const selected = listProps.allApprovers.filter((approver) => approver.isSelected);
                    const listRendersBefore = jest.mocked(ApproverSelectionList).mock.calls.length;
                    await act(async () => {
                        listProps.onSelectApprover?.([...selected, {...target, isSelected: true}]);
                    });
                    await waitForBatchedUpdatesWithAct();
                    const updatedTarget = getLastListProps().allApprovers.find((approver) => approver.login === targetLogin);
                    listRendersPerToggle.push(jest.mocked(ApproverSelectionList).mock.calls.length - listRendersBefore);
                    if (updatedTarget?.isSelected) {
                        completedToggles++;
                    }
                },
                {
                    runs: RUNS,
                    warmupRuns: WARMUP_RUNS,
                    // The numbers are written to stdout below, so this also runs under plain Jest, which has no .reassure output folder
                    writeFile: false,
                    // Put the workflow back to its S selected members, so every measured run makes the same toggle.
                    beforeEach: async () => {
                        await act(async () => {
                            await Onyx.merge(ONYXKEYS.APPROVAL_WORKFLOW, {members: initialMembers});
                        });
                        await waitForBatchedUpdatesWithAct();
                    },
                },
            );

            writeResult(`members=${memberCount} selected=${selectedCount} phoneShare=${phoneShare}`, result, listRendersPerToggle);
            unmount();

            // Every measured run (plus the warmup run) ended with the member selected in the rebuilt list.
            expect(completedToggles).toBe(RUNS + WARMUP_RUNS);
        },
        TEST_TIMEOUT_MS,
    );
});
