/**
 * Measures the room members page for big rooms in big workspaces. Each scenario renders the real
 * DynamicRoomMembersPage and times two things: opening it until the first member row is on screen, and pressing
 * "Select all" until every member is checked. Building the member rows checks every member's role on the workspace,
 * so both grow with the size of the room and the size of the workspace.
 *
 * Run with: npm run perf-local -- --testMatch '<rootDir>/tests/perf-local/RoomMembersPage.perf-local.ts'
 * It prints one line per scenario, so it also runs under plain Jest:
 * npx jest --testMatch '<rootDir>/tests/perf-local/RoomMembersPage.perf-local.ts' --runInBand
 */
import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {setHasRadio} from '@libs/NetworkState';
import {buildParticipantsFromAccountIDs} from '@libs/ReportUtils';

import DynamicRoomMembersPage from '@pages/DynamicRoomMembersPage';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, PolicyEmployeeList, Report} from '@src/types/onyx';

import {useIsFocused, useRoute} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {measureAsyncFunction} from 'reassure';

import {createRandomReport} from '../utils/collections/reports';
import createMock from '../utils/createMock';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Lazy icon loading resolves asynchronously and would add work that has nothing to do with the member list.
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: () => ({}),
    useMemoizedLazyExpensifyIcons: () => ({}),
}));

// A wide layout, so the table shows its "Select all" checkbox.
jest.mock('@hooks/useResponsiveLayout');

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<Record<string, unknown>>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: jest.fn(),
        useFocusEffect: jest.fn(),
        useRoute: jest.fn(),
        usePreventRemove: jest.fn(),
    };
});

jest.setTimeout(30 * 60 * 1000);

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_LOGIN = 'admin@example.com';
const POLICY_ID = 'perfRoomPolicy';
const ROOM_REPORT_ID = '5000';
const FIRST_MEMBER_ACCOUNT_ID = 2;
// Every member submits to one of a few approvers, as in a real company, so most members are not approvers.
const APPROVER_COUNT = 20;
const RUNS = 3;
const WARMUP_RUNS = 1;
const WAIT_TIMEOUT_MS = 10 * 60 * 1000;

const SCENARIOS = [
    {roomMembers: 500, workspaceMembers: 500},
    {roomMembers: 2_000, workspaceMembers: 2_000},
    {roomMembers: 5_000, workspaceMembers: 5_000},
    {roomMembers: 300, workspaceMembers: 10_000},
];

type RoomMembersPageProps = React.ComponentProps<typeof DynamicRoomMembersPage>;

const pad = (value: number) => String(value).padStart(6, '0');
const memberLogin = (accountID: number) => `member${pad(accountID)}@example.com`;
const memberName = (accountID: number) => `Member ${pad(accountID)}`;
const FIRST_MEMBER_NAME = memberName(FIRST_MEMBER_ACCOUNT_ID);

// The page reads its report through withReportOrNotFound, which only needs the reportID route param.
const pageProps = {route: {params: {reportID: ROOM_REPORT_ID}}} as unknown as RoomMembersPageProps;

function buildWorkspace(workspaceMembers: number) {
    const personalDetails: PersonalDetailsList = {
        [CURRENT_USER_ACCOUNT_ID]: {accountID: CURRENT_USER_ACCOUNT_ID, login: CURRENT_USER_LOGIN, displayName: 'Workspace Admin'},
    };
    const employeeList: PolicyEmployeeList = {
        [CURRENT_USER_LOGIN]: {email: CURRENT_USER_LOGIN, role: CONST.POLICY.ROLE.ADMIN},
    };
    for (let index = 0; index < workspaceMembers; index++) {
        const accountID = FIRST_MEMBER_ACCOUNT_ID + index;
        const login = memberLogin(accountID);
        personalDetails[accountID] = {accountID, login, displayName: memberName(accountID)};
        employeeList[login] = {email: login, role: CONST.POLICY.ROLE.USER, submitsTo: memberLogin(FIRST_MEMBER_ACCOUNT_ID + (index % APPROVER_COUNT))};
    }
    const policy = createMock<Policy>({
        id: POLICY_ID,
        name: 'Perf workspace',
        type: CONST.POLICY.TYPE.CORPORATE,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: CURRENT_USER_LOGIN,
        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
        outputCurrency: CONST.CURRENCY.USD,
        approver: CURRENT_USER_LOGIN,
        employeeList,
    });
    return {personalDetails, policy};
}

function buildRoom(roomMembers: number): Report {
    const accountIDs = [CURRENT_USER_ACCOUNT_ID, ...Array.from({length: roomMembers}, (_, index) => FIRST_MEMBER_ACCOUNT_ID + index)];
    return {
        ...createRandomReport(Number(ROOM_REPORT_ID), CONST.REPORT.CHAT_TYPE.POLICY_ROOM),
        reportID: ROOM_REPORT_ID,
        type: CONST.REPORT.TYPE.CHAT,
        chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
        policyID: POLICY_ID,
        reportName: '#perf-room',
        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        participants: buildParticipantsFromAccountIDs(accountIDs),
        parentReportID: undefined,
        parentReportActionID: undefined,
    };
}

async function seed(roomMembers: number, workspaceMembers: number) {
    const {personalDetails, policy} = buildWorkspace(workspaceMembers);
    await Promise.all([
        Onyx.set(ONYXKEYS.IS_LOADING_REPORT_DATA, false),
        Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails),
        Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy),
        Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${ROOM_REPORT_ID}`, buildRoom(roomMembers)),
        Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${ROOM_REPORT_ID}`, {isLoadingInitialReportActions: false}),
    ]);
    await waitForBatchedUpdates();
}

function renderPage() {
    const page = React.createElement(DynamicRoomMembersPage, pageProps);
    const wrapper = ({children}: {children: React.ReactNode}) =>
        React.createElement(ComposeProviders, {components: [OnyxListItemProvider, LocaleContextProvider, CurrentUserPersonalDetailsProvider], children});
    return render(page, {wrapper});
}

function isSelectAllChecked(): boolean {
    const checkbox = screen.getByLabelText(TestHelper.translateLocal('workspace.common.selectAll'));
    const state = checkbox.props.accessibilityState as {checked?: boolean | 'mixed'} | undefined;
    return state?.checked === true;
}

function writeResult(label: string, result: {meanDuration: number; stdevDuration: number; durations: number[]}) {
    // Written to stdout directly so the numbers show up even when Jest runs with --silent.
    const durations = result.durations.map((duration) => duration.toFixed(1)).join(', ');
    process.stdout.write(`[RoomMembersPageBench] ${label} mean=${result.meanDuration.toFixed(1)}ms stdev=${result.stdevDuration.toFixed(1)}ms runs=${RUNS} durations=[${durations}]\n`);
}

describe('Room members page in a big room', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        initOnyxDerivedValues();
    });

    beforeEach(async () => {
        global.fetch = TestHelper.getGlobalFetchMock();
        setHasRadio(true);
        jest.mocked(useIsFocused).mockReturnValue(true);
        jest.mocked(useRoute).mockReturnValue({key: 'room-members', name: 'Room_Members_Root', params: {}} as ReturnType<typeof useRoute>);
        await TestHelper.signInWithTestUser(CURRENT_USER_ACCOUNT_ID, CURRENT_USER_LOGIN);
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    test.each(SCENARIOS)('$roomMembers room members in a workspace of $workspaceMembers members', async ({roomMembers, workspaceMembers}) => {
        await seed(roomMembers, workspaceMembers);
        let view: ReturnType<typeof renderPage> | undefined;
        const unmount = async () => {
            view?.unmount();
            view = undefined;
            await waitForBatchedUpdates();
        };

        // Opening: from mounting the page until the first member row is on screen.
        const open = await measureAsyncFunction(
            async () => {
                view = renderPage();
                await screen.findByText(FIRST_MEMBER_NAME, undefined, {timeout: WAIT_TIMEOUT_MS});
            },
            {runs: RUNS, warmupRuns: WARMUP_RUNS, writeFile: false, afterEach: unmount},
        );
        writeResult(`open room=${roomMembers} workspace=${workspaceMembers}`, open);

        // Select all: from pressing the header checkbox until every member is checked.
        let checkedRuns = 0;
        const selectAll = await measureAsyncFunction(
            async () => {
                fireEvent.press(screen.getByLabelText(TestHelper.translateLocal('workspace.common.selectAll')));
                await waitForBatchedUpdates();
                if (isSelectAllChecked()) {
                    checkedRuns++;
                }
            },
            {
                runs: RUNS,
                warmupRuns: WARMUP_RUNS,
                writeFile: false,
                beforeEach: async () => {
                    view = renderPage();
                    await screen.findByText(FIRST_MEMBER_NAME, undefined, {timeout: WAIT_TIMEOUT_MS});
                },
                afterEach: unmount,
            },
        );
        writeResult(`selectAll room=${roomMembers} workspace=${workspaceMembers}`, selectAll);

        // Every press (plus the warmup) checked every member, so the timing covers a real Select all.
        expect(checkedRuns).toBe(RUNS + WARMUP_RUNS);
    });
});
