import {act, render} from '@testing-library/react-native';

import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {SearchQueryJSON} from '@components/Search/types';

import {queueBulkChangeReportPolicy} from '@libs/actions/Search';
import type * as SearchActions from '@libs/actions/Search';
import findAllMatchingDynamicSuffixes from '@libs/Navigation/helpers/dynamicRoutesUtils/findAllMatchingDynamicSuffixes';
import Navigation from '@libs/Navigation/Navigation';

import SearchChangeWorkspacePage from '@pages/Search/SearchChangeWorkspacePage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockQueryJSON: SearchQueryJSON = {
    inputQuery: 'type:expense-report status:all',
    hash: 12345,
    recentSearchHash: 12345,
    similarSearchHash: 12345,
    flatFilters: [],
    type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
    sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
    view: CONST.SEARCH.VIEW.TABLE,
    filters: {operator: CONST.SEARCH.SYNTAX_OPERATORS.AND, left: 'type', right: 'expense-report'},
};
const SUBMITTER_ACCOUNT_ID = 1;
const SUBMITTER_EMAIL = 'submitter@example.com';
const mockClearSelectedTransactions = jest.fn();
let mockAreAllMatchingItemsSelected = false;
let mockSelectedReports: Array<{reportID: string; policyID?: string}> = [{reportID: 'report1'}, {reportID: 'report2'}];
let mockSelectRow: ((option: {policyID: string}) => void) | undefined;
let mockConfirm: (() => void) | undefined;
let mockListData: Array<{policyID?: string}> = [];
let mockIsSaveDisabled: boolean | undefined;
let mockIsAppLoadPending = false;
let mockSearchData: Record<string, unknown> = {};

jest.mock('@components/SelectionList', () => {
    function MockSelectionList({
        data,
        onSelectRow,
        confirmButtonOptions,
    }: {
        data: Array<{policyID?: string}>;
        onSelectRow: (option: {policyID: string}) => void;
        confirmButtonOptions: {onConfirm: () => void; isDisabled?: boolean};
    }) {
        mockListData = data;
        mockIsSaveDisabled = confirmButtonOptions.isDisabled;
        mockSelectRow = onSelectRow;
        mockConfirm = confirmButtonOptions.onConfirm;
        return null;
    }
    return MockSelectionList;
});
jest.mock(
    '@components/BlockingViews/FullPageOfflineBlockingView',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: () => ({currentSearchQueryJSON: mockQueryJSON}),
    useSearchResultsContext: () => ({currentSearchResults: {data: mockSearchData}}),
    useSearchSelectionActions: () => ({clearSelectedTransactions: mockClearSelectedTransactions}),
    useSearchSelectionContext: () => ({
        selectedReports: mockSelectedReports,
        excludedTransactions: {tx3: {reportID: 'report3'}},
        areAllMatchingItemsSelected: mockAreAllMatchingItemsSelected,
    }),
}));
jest.mock('@libs/actions/Search', () => ({
    getReportFromSearchSnapshot: jest.requireActual<typeof SearchActions>('@libs/actions/Search').getReportFromSearchSnapshot,
    getReportActionsFromSearchSnapshot: jest.requireActual<typeof SearchActions>('@libs/actions/Search').getReportActionsFromSearchSnapshot,
    queueBulkChangeReportPolicy: jest.fn(),
}));
jest.mock('@hooks/useInFlightRequests', () => ({
    useIsAppLoadPending: () => mockIsAppLoadPending,
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    closeRHPFlow: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn((callback: () => void) => callback()),
    navigate: jest.fn(),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    getActiveRoute: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

function makeReport(reportID: string, statusNum: ValueOf<typeof CONST.REPORT.STATUS_NUM>): Report {
    return {reportID, policyID: 'policy1', type: CONST.REPORT.TYPE.EXPENSE, ownerAccountID: SUBMITTER_ACCOUNT_ID, stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum};
}

function makePolicy(policyID: string, name: string, role: ValueOf<typeof CONST.POLICY.ROLE>) {
    return {id: policyID, name, type: CONST.POLICY.TYPE.TEAM, role, employeeList: {[SUBMITTER_EMAIL]: {email: SUBMITTER_EMAIL, role: CONST.POLICY.ROLE.USER}}};
}

async function changeWorkspace(areAllMatchingItemsSelected: boolean) {
    mockAreAllMatchingItemsSelected = areAllMatchingItemsSelected;
    render(
        <OnyxListItemProvider>
            <SearchChangeWorkspacePage />
        </OnyxListItemProvider>,
    );
    await waitForBatchedUpdatesWithAct();
    act(() => mockSelectRow?.({policyID: 'policy2'}));
    await waitForBatchedUpdatesWithAct();
    mockConfirm?.();
}

function getQueuedQuery(): string {
    return jest.mocked(queueBulkChangeReportPolicy).mock.calls.at(0)?.at(0) ?? '';
}

describe('SearchChangeWorkspacePage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockSelectRow = undefined;
        mockConfirm = undefined;
        mockSelectedReports = [{reportID: 'report1'}, {reportID: 'report2'}];
        mockListData = [];
        mockIsAppLoadPending = false;
        mockSearchData = {
            [`${ONYXKEYS.COLLECTION.REPORT}report1`]: makeReport('report1', CONST.REPORT.STATUS_NUM.OPEN),
            [`${ONYXKEYS.COLLECTION.REPORT}report2`]: makeReport('report2', CONST.REPORT.STATUS_NUM.OPEN),
        };
        await Onyx.clear();
        // ReportUtils keeps the last signed-in user until the session is replaced
        await Onyx.set(ONYXKEYS.SESSION, {});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[SUBMITTER_ACCOUNT_ID]: {accountID: SUBMITTER_ACCOUNT_ID, login: SUBMITTER_EMAIL}});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy2`, makePolicy('policy2', 'Workspace 2', CONST.POLICY.ROLE.USER));
    });

    it('keeps Save disabled when every picked report is already on the chosen workspace', async () => {
        // Given two picked reports that are both on Workspace 2
        mockAreAllMatchingItemsSelected = false;
        mockSelectedReports = [
            {reportID: 'report1', policyID: 'policy2'},
            {reportID: 'report2', policyID: 'policy2'},
        ];
        render(
            <OnyxListItemProvider>
                <SearchChangeWorkspacePage />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // When the user picks Workspace 2
        act(() => mockSelectRow?.({policyID: 'policy2'}));
        await waitForBatchedUpdatesWithAct();

        // Then Save stays disabled, the same as picking a report's own workspace on its page
        expect(mockIsSaveDisabled).toBe(true);
    });

    it('shows a loading indicator instead of the workspaces while the app is still loading', async () => {
        // Given the app hasn't finished loading the workspaces yet
        mockIsAppLoadPending = true;

        // When the page renders
        render(
            <OnyxListItemProvider>
                <SearchChangeWorkspacePage />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the workspace list isn't shown, so it can't flash "No results found"
        expect(mockSelectRow).toBeUndefined();
    });

    it('keeps the workspaces in place when one is picked', async () => {
        // Given two workspaces the reports can move to
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy3`, makePolicy('policy3', 'Workspace 3', CONST.POLICY.ROLE.USER));
        render(
            <OnyxListItemProvider>
                <SearchChangeWorkspacePage />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();
        const initialOrder = mockListData.map((item) => item.policyID);

        // When the user picks the last one
        act(() => mockSelectRow?.({policyID: initialOrder.at(-1) ?? ''}));
        await waitForBatchedUpdatesWithAct();

        // Then the list keeps its order, the same as the single report page
        expect(mockListData.map((item) => item.policyID)).toEqual(initialOrder);
    });

    it('only lists workspaces the user administers when the reports are paid', async () => {
        // Given two paid reports, which the single report page only moves to a workspace the user administers
        mockSearchData = {
            [`${ONYXKEYS.COLLECTION.REPORT}report1`]: makeReport('report1', CONST.REPORT.STATUS_NUM.REIMBURSED),
            [`${ONYXKEYS.COLLECTION.REPORT}report2`]: makeReport('report2', CONST.REPORT.STATUS_NUM.REIMBURSED),
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy3`, makePolicy('policy3', 'Workspace 3', CONST.POLICY.ROLE.ADMIN));

        // When the page lists the workspaces
        render(
            <OnyxListItemProvider>
                <SearchChangeWorkspacePage />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then only the workspace the user administers is offered
        expect(mockListData.map((item) => item.policyID)).toEqual(['policy3']);
    });

    it('leaves out a workspace the submitter is not a member of', async () => {
        // Given a workspace the user administers that the submitter isn't a member of
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy3`, {id: 'policy3', name: 'Workspace 3', type: CONST.POLICY.TYPE.TEAM, role: CONST.POLICY.ROLE.ADMIN});

        // When the page lists the workspaces
        render(
            <OnyxListItemProvider>
                <SearchChangeWorkspacePage />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then it isn't offered, since a bulk move doesn't invite the submitter like a single report does
        expect(mockListData.map((item) => item.policyID)).toEqual(['policy2']);
    });

    it('lists a workspace the submitter is on when their login is in a different case', async () => {
        // Given the submitter's login has capitals, while the workspace members are stored in lowercase
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[SUBMITTER_ACCOUNT_ID]: {login: 'Submitter@Example.com'}});

        // When the page lists the workspaces
        render(
            <OnyxListItemProvider>
                <SearchChangeWorkspacePage />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the workspace is still offered
        expect(mockListData.map((item) => item.policyID)).toEqual(['policy2']);
    });

    it("lists the user's own workspace when it has no member list", async () => {
        // Given the user moves their own drafts, and Workspace 3 only says they're a member through its role
        mockSearchData = {
            [`${ONYXKEYS.COLLECTION.REPORT}report1`]: {...makeReport('report1', CONST.REPORT.STATUS_NUM.OPEN), stateNum: CONST.REPORT.STATE_NUM.OPEN},
        };
        mockSelectedReports = [{reportID: 'report1'}];
        await Onyx.merge(ONYXKEYS.SESSION, {email: SUBMITTER_EMAIL, accountID: SUBMITTER_ACCOUNT_ID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy3`, {id: 'policy3', name: 'Workspace 3', type: CONST.POLICY.TYPE.TEAM, role: CONST.POLICY.ROLE.USER});

        // When the page lists the workspaces
        render(
            <OnyxListItemProvider>
                <CurrentUserPersonalDetailsProvider>
                    <SearchChangeWorkspacePage />
                </CurrentUserPersonalDetailsProvider>
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then Workspace 3 is offered
        expect(mockListData.map((item) => item.policyID)).toContain('policy3');
    });

    it("lists the user's own workspace when their login is in a different case from the session", async () => {
        // Given the user moves their own draft, their login has capitals, and Workspace 3 has no member list
        mockSearchData = {
            [`${ONYXKEYS.COLLECTION.REPORT}report1`]: {...makeReport('report1', CONST.REPORT.STATUS_NUM.OPEN), stateNum: CONST.REPORT.STATE_NUM.OPEN},
        };
        mockSelectedReports = [{reportID: 'report1'}];
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[SUBMITTER_ACCOUNT_ID]: {login: 'Submitter@Example.com'}});
        await Onyx.merge(ONYXKEYS.SESSION, {email: SUBMITTER_EMAIL, accountID: SUBMITTER_ACCOUNT_ID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy3`, {id: 'policy3', name: 'Workspace 3', type: CONST.POLICY.TYPE.TEAM, role: CONST.POLICY.ROLE.USER});

        // When the page lists the workspaces
        render(
            <OnyxListItemProvider>
                <CurrentUserPersonalDetailsProvider>
                    <SearchChangeWorkspacePage />
                </CurrentUserPersonalDetailsProvider>
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then Workspace 3 is offered, the same as the Change workspace option counted it
        expect(mockListData.map((item) => item.policyID)).toContain('policy3');
    });

    it('leaves out a workspace that needs map or GPS for reports with a manual distance expense', async () => {
        // Given both reports have a manual distance expense, and Workspace 3 needs map or GPS for distance
        mockSearchData = {
            ...mockSearchData,
            [`${ONYXKEYS.COLLECTION.TRANSACTION}tx1`]: {transactionID: 'tx1', reportID: 'report1', iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL},
            [`${ONYXKEYS.COLLECTION.TRANSACTION}tx2`]: {transactionID: 'tx2', reportID: 'report2', iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL},
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy3`, {...makePolicy('policy3', 'Workspace 3', CONST.POLICY.ROLE.USER), requireMapOrGPS: true});

        // When the page lists the workspaces
        render(
            <OnyxListItemProvider>
                <SearchChangeWorkspacePage />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then Workspace 3 isn't offered, since a manual distance has no route
        expect(mockListData.map((item) => item.policyID)).toEqual(['policy2']);
    });

    it('only lists workspaces for the reports Change workspace was offered for', async () => {
        // Given an exported draft, which can't change workspace, and a paid report that can move to an admin workspace
        mockSearchData = {
            [`${ONYXKEYS.COLLECTION.REPORT}report1`]: {...makeReport('report1', CONST.REPORT.STATUS_NUM.OPEN), isExportedToIntegration: true},
            [`${ONYXKEYS.COLLECTION.REPORT}report2`]: makeReport('report2', CONST.REPORT.STATUS_NUM.REIMBURSED),
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy3`, makePolicy('policy3', 'Workspace 3', CONST.POLICY.ROLE.ADMIN));

        // When the page lists the workspaces
        render(
            <OnyxListItemProvider>
                <SearchChangeWorkspacePage />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the exported draft doesn't add Workspace 2, which only it could have moved to
        expect(mockListData.map((item) => item.policyID)).toEqual(['policy3']);
    });

    it('uses the rules of a selected report that is only in Onyx', async () => {
        // Given a paid report that the current search results don't hold, only Onyx
        mockSelectedReports = [{reportID: 'report1'}];
        mockSearchData = {};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}report1`, makeReport('report1', CONST.REPORT.STATUS_NUM.REIMBURSED));
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy3`, makePolicy('policy3', 'Workspace 3', CONST.POLICY.ROLE.ADMIN));

        // When the page lists the workspaces
        render(
            <OnyxListItemProvider>
                <SearchChangeWorkspacePage />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the report still counts, so the workspace the user administers is offered
        expect(mockListData.map((item) => item.policyID)).toEqual(['policy3']);
    });

    it('moves every matching report except the deselected ones when Select all is checked', async () => {
        // Given "Select all" on a reports search, with report3 deselected afterwards
        // When the user picks a workspace and saves
        await changeWorkspace(true);

        // Then the search goes to the backend without report3, and the selection is cleared
        expect(queueBulkChangeReportPolicy).toHaveBeenCalledWith(expect.any(String), 'policy2');
        expect(getQueuedQuery()).toContain('report3');
        expect(mockClearSelectedTransactions).toHaveBeenCalled();
    });

    it('moves only the picked reports when Select all is not checked', async () => {
        // Given two reports picked by hand
        // When the user picks a workspace and saves
        await changeWorkspace(false);

        // Then the backend gets a search for exactly those reports
        const queuedQuery = getQueuedQuery();
        expect(queueBulkChangeReportPolicy).toHaveBeenCalledWith(expect.any(String), 'policy2');
        expect(queuedQuery).toContain('report1');
        expect(queuedQuery).toContain('report2');
        expect(queuedQuery).not.toContain('report3');
    });
    it('closes when it opens with no reports selected', async () => {
        // Given the page opens from a refresh or a direct link, so Search has nothing selected
        mockSelectedReports = [];

        // When it renders
        render(
            <OnyxListItemProvider>
                <SearchChangeWorkspacePage />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then it closes instead of showing a Save that has no reports to move
        expect(Navigation.closeRHPFlow).toHaveBeenCalled();
    });

    it('stays open while reports are selected', async () => {
        // Given reports are selected in Search
        // When the page renders
        render(
            <OnyxListItemProvider>
                <SearchChangeWorkspacePage />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then it stays open so a workspace can be picked
        expect(Navigation.closeRHPFlow).not.toHaveBeenCalled();
    });
});

describe('SEARCH_CHANGE_WORKSPACE_RHP', () => {
    it('opens the Search page instead of the report Change workspace page', () => {
        // Given the report Change workspace page is a dynamic route that can open on top of Search
        // When the Search Change workspace route is matched against the dynamic routes
        const matches = findAllMatchingDynamicSuffixes(ROUTES.SEARCH_CHANGE_WORKSPACE_RHP);

        // Then nothing matches, so the route isn't taken over by the report page
        expect(matches).toEqual([]);
    });
});
