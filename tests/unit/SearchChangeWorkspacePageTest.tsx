import {act, render} from '@testing-library/react-native';

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
const mockClearSelectedTransactions = jest.fn();
let mockAreAllMatchingItemsSelected = false;
let mockSelectedReports: Array<{reportID: string; policyID?: string}> = [{reportID: 'report1'}, {reportID: 'report2'}];
let mockSelectRow: ((option: {policyID: string}) => void) | undefined;
let mockConfirm: (() => void) | undefined;
let mockListData: Array<{policyID?: string}> = [];
let mockIsSaveDisabled: boolean | undefined;
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
    queueBulkChangeReportPolicy: jest.fn(),
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

function makeReport(reportID: string, statusNum: number) {
    return {reportID, policyID: 'policy1', type: CONST.REPORT.TYPE.EXPENSE, ownerAccountID: 1, stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum};
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
        mockSearchData = {
            [`${ONYXKEYS.COLLECTION.REPORT}report1`]: makeReport('report1', CONST.REPORT.STATUS_NUM.OPEN),
            [`${ONYXKEYS.COLLECTION.REPORT}report2`]: makeReport('report2', CONST.REPORT.STATUS_NUM.OPEN),
        };
        await Onyx.clear();
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {1: {accountID: 1, login: 'submitter@example.com'}});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy2`, {id: 'policy2', name: 'Workspace 2', type: CONST.POLICY.TYPE.TEAM, role: CONST.POLICY.ROLE.USER});
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

    it('keeps the workspaces in place when one is picked', async () => {
        // Given two workspaces the reports can move to
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy3`, {id: 'policy3', name: 'Workspace 3', type: CONST.POLICY.TYPE.TEAM, role: CONST.POLICY.ROLE.USER});
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
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy3`, {id: 'policy3', name: 'Workspace 3', type: CONST.POLICY.TYPE.TEAM, role: CONST.POLICY.ROLE.ADMIN});

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
