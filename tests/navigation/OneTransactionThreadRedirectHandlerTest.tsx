/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-type-assertion */
import {render, waitFor} from '@testing-library/react-native';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import OneTransactionThreadRedirectHandler from '@src/pages/inbox/OneTransactionThreadRedirectHandler';
import SCREENS from '@src/SCREENS';
import type {ReportAction} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import React from 'react';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const THREAD_REPORT_ID = '12345';
const EXPENSE_REPORT_ID = '54321';
const TRANSACTION_ID = '11111';
const SIBLING_TRANSACTION_ID = '22222';

// Inlined because a `jest.mock` factory may only close over locals initialized with a literal.
const TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS_KEY = 'transactionThreadNavigationTransactionIDs';
const SINGLE_EXPENSE_REPORT_VIEW_KEY = 'nvp_expensify_singleExpenseReportView';

const mockNavigate = jest.fn();

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: (...args: unknown[]) => mockNavigate(...args),
    },
}));

let mockIsSearchTopmostFullScreenRoute = false;

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => ({
    __esModule: true,
    default: () => mockIsSearchTopmostFullScreenRoute,
}));

let mockRouteName: string = SCREENS.REPORT;
let mockRouteParams: {reportID?: string; reportActionID?: string; backTo?: string; referrer?: string} = {reportID: THREAD_REPORT_ID};
let mockIsFocused = true;

jest.mock('@react-navigation/native', () => {
    const actual = jest.requireActual('@react-navigation/native');
    return {
        ...actual,
        useRoute: () => ({name: mockRouteName, params: mockRouteParams}),
        useIsFocused: () => mockIsFocused,
    };
});

let mockParentReportID: string | undefined = EXPENSE_REPORT_ID;
let mockParentTransactionCount: number | undefined = 1;
let mockSiblingTransactionIDs: string[] | undefined;
let mockSingleExpenseReportView: string | undefined;
let mockSingleExpenseReportViewStatus = 'loaded';

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string, options?: {selector?: (value: unknown) => unknown}) => {
        if (key === TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS_KEY) {
            return [options?.selector ? options.selector(mockSiblingTransactionIDs) : mockSiblingTransactionIDs, {status: 'loaded'}];
        }
        if (key === SINGLE_EXPENSE_REPORT_VIEW_KEY) {
            return [mockSingleExpenseReportView, {status: mockSingleExpenseReportViewStatus}];
        }
        const value = key.endsWith(EXPENSE_REPORT_ID)
            ? {reportID: EXPENSE_REPORT_ID, type: 'expense', transactionCount: mockParentTransactionCount}
            : {reportID: THREAD_REPORT_ID, parentReportID: mockParentReportID, parentReportActionID: '1'};
        return [options?.selector ? options.selector(value) : value, {status: 'loaded'}];
    },
}));

let mockOneTransactionThreadReportID: string | undefined = THREAD_REPORT_ID;

jest.mock('@hooks/useOneTransactionThreadReportID', () => ({
    __esModule: true,
    default: () => mockOneTransactionThreadReportID,
}));

let mockParentReportAction: ReportAction | undefined;

jest.mock('@hooks/useParentReportAction', () => ({
    __esModule: true,
    default: () => mockParentReportAction,
}));

function createIOUAction(type: ValueOf<typeof CONST.IOU.REPORT_ACTION_TYPE>, IOUDetails?: Record<string, unknown>): ReportAction {
    return {
        reportActionID: '1',
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        created: '2024-01-01 00:00:00',
        originalMessage: {type, IOUDetails, IOUTransactionID: TRANSACTION_ID},
    } as unknown as ReportAction;
}

describe('OneTransactionThreadRedirectHandler', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
        mockRouteName = SCREENS.REPORT;
        mockRouteParams = {reportID: THREAD_REPORT_ID};
        mockIsFocused = true;
        mockIsSearchTopmostFullScreenRoute = false;
        mockParentReportID = EXPENSE_REPORT_ID;
        mockParentTransactionCount = 1;
        mockOneTransactionThreadReportID = THREAD_REPORT_ID;
        mockParentReportAction = createIOUAction(CONST.IOU.REPORT_ACTION_TYPE.CREATE);
        mockSiblingTransactionIDs = undefined;
        mockSingleExpenseReportView = undefined;
        mockSingleExpenseReportViewStatus = 'loaded';
    });

    it('replaces the route with the parent report when the thread is the only expense of the report', async () => {
        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
        expect(mockNavigate).toHaveBeenCalledWith(`r/${EXPENSE_REPORT_ID}`, {forceReplace: true});
    });

    it('mocks the sibling set under the key the handler subscribes to', () => {
        expect(TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS_KEY).toBe(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS);
    });

    it('keeps the thread route while the prev/next carousel is stepping through a sibling set', async () => {
        mockSiblingTransactionIDs = [TRANSACTION_ID, SIBLING_TRANSACTION_ID];

        render(<OneTransactionThreadRedirectHandler />);

        await waitForBatchedUpdatesWithAct();

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('redirects when the sibling set holds only this expense, because the carousel renders no arrows for it', async () => {
        mockSiblingTransactionIDs = [TRANSACTION_ID];

        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
        expect(mockNavigate).toHaveBeenCalledWith(`r/${EXPENSE_REPORT_ID}`, {forceReplace: true});
    });

    it('keeps the thread route when the parent report holds more than one expense', async () => {
        mockOneTransactionThreadReportID = undefined;

        render(<OneTransactionThreadRedirectHandler />);

        await waitForBatchedUpdatesWithAct();

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('keeps the thread route while a multi-expense report is still paginating in and only one of its IOU actions has loaded', async () => {
        mockParentTransactionCount = 3;

        render(<OneTransactionThreadRedirectHandler />);

        await waitForBatchedUpdatesWithAct();

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('still redirects when the parent report only loads after the thread has mounted', async () => {
        mockParentTransactionCount = undefined;

        const {rerender} = render(<OneTransactionThreadRedirectHandler />);

        await waitForBatchedUpdatesWithAct();
        expect(mockNavigate).not.toHaveBeenCalled();

        mockParentTransactionCount = 1;
        rerender(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
        expect(mockNavigate).toHaveBeenCalledWith(`r/${EXPENSE_REPORT_ID}`, {forceReplace: true});
    });

    it('keeps the thread route when a report action is linked, so the deep link keeps its anchor', async () => {
        mockRouteParams = {reportID: THREAD_REPORT_ID, reportActionID: '99999'};

        render(<OneTransactionThreadRedirectHandler />);

        await waitForBatchedUpdatesWithAct();

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('keeps the thread route for a send money action', async () => {
        mockParentReportAction = createIOUAction(CONST.IOU.REPORT_ACTION_TYPE.PAY, {amount: 100});

        render(<OneTransactionThreadRedirectHandler />);

        await waitForBatchedUpdatesWithAct();

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('stays on the search RHP route when redirecting from inside Search', async () => {
        mockRouteName = SCREENS.RIGHT_MODAL.SEARCH_REPORT;
        mockIsSearchTopmostFullScreenRoute = true;

        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
        expect(mockNavigate).toHaveBeenCalledWith(`search/view/${EXPENSE_REPORT_ID}`, {forceReplace: true});
    });

    it('stays in the RHP when redirecting from the search RHP outside Search', async () => {
        mockRouteName = SCREENS.RIGHT_MODAL.SEARCH_REPORT;

        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
        expect(mockNavigate).toHaveBeenCalledWith(`e/${EXPENSE_REPORT_ID}`, {forceReplace: true});
    });

    it("reuses the route's own backTo instead of the thread we are replacing", async () => {
        mockRouteParams = {reportID: THREAD_REPORT_ID, backTo: 'home'};

        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
        expect(mockNavigate).toHaveBeenCalledWith(`r/${EXPENSE_REPORT_ID}?backTo=home`, {forceReplace: true});
    });

    it('inherits the nested backTo when the route came from the parent report itself', async () => {
        mockRouteParams = {reportID: THREAD_REPORT_ID, backTo: `/r/${EXPENSE_REPORT_ID}?backTo=${encodeURIComponent('/search')}`};

        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
        expect(mockNavigate).toHaveBeenCalledWith(`r/${EXPENSE_REPORT_ID}?backTo=${encodeURIComponent('/search')}`, {forceReplace: true});
    });

    it('drops a self-referencing backTo that has nothing nested inside it', async () => {
        mockRouteParams = {reportID: THREAD_REPORT_ID, backTo: `/r/${EXPENSE_REPORT_ID}`};

        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
        expect(mockNavigate).toHaveBeenCalledWith(`r/${EXPENSE_REPORT_ID}`, {forceReplace: true});
    });

    it('keeps a backTo that points at a report other than the parent', async () => {
        mockRouteParams = {reportID: THREAD_REPORT_ID, backTo: '/r/99999'};

        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
        expect(mockNavigate).toHaveBeenCalledWith(`r/${EXPENSE_REPORT_ID}?backTo=${encodeURIComponent('/r/99999')}`, {forceReplace: true});
    });

    it('drops a parent backTo anchored at one of the report actions', async () => {
        mockRouteParams = {reportID: THREAD_REPORT_ID, backTo: `/r/${EXPENSE_REPORT_ID}/9999`};

        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
        expect(mockNavigate).toHaveBeenCalledWith(`r/${EXPENSE_REPORT_ID}`, {forceReplace: true});
    });

    it('drops a parent backTo that reaches the report through another route shape', async () => {
        mockRouteParams = {reportID: THREAD_REPORT_ID, backTo: `/e/${EXPENSE_REPORT_ID}`};

        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
        expect(mockNavigate).toHaveBeenCalledWith(`r/${EXPENSE_REPORT_ID}`, {forceReplace: true});
    });

    it('forwards the notification referrer so the report it redirects to still marks itself read', async () => {
        mockRouteParams = {reportID: THREAD_REPORT_ID, referrer: CONST.REFERRER.NOTIFICATION};

        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
        expect(mockNavigate).toHaveBeenCalledWith(`r/${EXPENSE_REPORT_ID}?referrer=${CONST.REFERRER.NOTIFICATION}`, {forceReplace: true});
    });

    it('forwards the notification referrer alongside backTo', async () => {
        mockRouteParams = {reportID: THREAD_REPORT_ID, referrer: CONST.REFERRER.NOTIFICATION, backTo: 'home'};

        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
        expect(mockNavigate).toHaveBeenCalledWith(`r/${EXPENSE_REPORT_ID}?referrer=${CONST.REFERRER.NOTIFICATION}&backTo=home`, {forceReplace: true});
    });

    it('does not redirect while the screen is blurred', async () => {
        mockIsFocused = false;

        render(<OneTransactionThreadRedirectHandler />);

        await waitForBatchedUpdatesWithAct();

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('mocks the single-expense report view under the key the handler subscribes to', () => {
        expect(SINGLE_EXPENSE_REPORT_VIEW_KEY).toBe(ONYXKEYS.NVP_SINGLE_EXPENSE_REPORT_VIEW);
    });

    it('keeps the thread route when the user views single-expense reports in the table view', async () => {
        // Given the user picked the table view, where the expense is a row the user opens on purpose
        mockSingleExpenseReportView = CONST.REPORT_LAYOUT.SINGLE_EXPENSE_REPORT_VIEW.TABLE;

        // When the expense's thread opens
        render(<OneTransactionThreadRedirectHandler />);

        await waitForBatchedUpdatesWithAct();

        // Then it stays on the thread instead of bouncing back to the report
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('waits for the single-expense report view to load before redirecting', async () => {
        // Given the saved view hasn't loaded yet, so we can't tell whether the user picked the table view
        mockSingleExpenseReportViewStatus = 'loading';

        // When the expense's thread opens, for example from a deep link
        render(<OneTransactionThreadRedirectHandler />);

        await waitForBatchedUpdatesWithAct();

        // Then it doesn't redirect too early
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('redirects when the user views single-expense reports in the expense view', async () => {
        // Given the user explicitly picked the expense view
        mockSingleExpenseReportView = CONST.REPORT_LAYOUT.SINGLE_EXPENSE_REPORT_VIEW.EXPENSE;

        // When the expense's thread opens
        render(<OneTransactionThreadRedirectHandler />);

        // Then it's replaced with the report, which shows the expense inline
        await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
        expect(mockNavigate).toHaveBeenCalledWith(`r/${EXPENSE_REPORT_ID}`, {forceReplace: true});
    });
});
