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

// Inlined rather than read off `ONYXKEYS`: a `jest.mock` factory may only close over locals initialized with a literal.
// The test below asserts the two stay in sync.
const TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS_KEY = 'transactionThreadNavigationTransactionIDs';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: (...args: unknown[]) => mockNavigate(...args),
        goBack: (...args: unknown[]) => mockGoBack(...args),
        isNavigationReady: () => Promise.resolve(),
    },
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

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string, options?: {selector?: (value: unknown) => unknown}) => {
        if (key === TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS_KEY) {
            return [mockSiblingTransactionIDs, {status: 'loaded'}];
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
        mockGoBack.mockClear();
        mockRouteName = SCREENS.REPORT;
        mockRouteParams = {reportID: THREAD_REPORT_ID};
        mockIsFocused = true;
        mockParentReportID = EXPENSE_REPORT_ID;
        mockParentTransactionCount = 1;
        mockOneTransactionThreadReportID = THREAD_REPORT_ID;
        mockParentReportAction = createIOUAction(CONST.IOU.REPORT_ACTION_TYPE.CREATE);
        mockSiblingTransactionIDs = undefined;
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
        // Home "Recently added", "Review N flagged expenses" and the duplicate review list all seed a cross-report
        // sibling set and open the thread precisely because the arrows only exist in the thread's header. Redirecting
        // to the parent report would swap in `MoneyReportHeader` and dead-end the carousel mid-review.
        mockSiblingTransactionIDs = [TRANSACTION_ID, SIBLING_TRANSACTION_ID];

        render(<OneTransactionThreadRedirectHandler />);

        await waitForBatchedUpdatesWithAct();

        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockGoBack).not.toHaveBeenCalled();
    });

    it('redirects when the sibling set holds only this expense, because the carousel renders no arrows for it', async () => {
        mockSiblingTransactionIDs = [TRANSACTION_ID];

        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
        expect(mockNavigate).toHaveBeenCalledWith(`r/${EXPENSE_REPORT_ID}`, {forceReplace: true});
    });

    it('redirects when a sibling set left behind by another report does not contain this expense', async () => {
        mockSiblingTransactionIDs = ['33333', SIBLING_TRANSACTION_ID];

        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
        expect(mockNavigate).toHaveBeenCalledWith(`r/${EXPENSE_REPORT_ID}`, {forceReplace: true});
    });

    it('keeps the thread route after the carousel clears its sibling set', async () => {
        mockSiblingTransactionIDs = [TRANSACTION_ID, SIBLING_TRANSACTION_ID];

        const {rerender} = render(<OneTransactionThreadRedirectHandler />);

        await waitForBatchedUpdatesWithAct();
        expect(mockNavigate).not.toHaveBeenCalled();

        // `clearActiveTransactionIDs` runs when the carousel unmounts. Acting on that would eject the user out of a
        // thread they are still paging through, so the suppression is latched for the thread it was observed on.
        mockSiblingTransactionIDs = undefined;
        rerender(<OneTransactionThreadRedirectHandler />);

        await waitForBatchedUpdatesWithAct();

        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockGoBack).not.toHaveBeenCalled();
    });

    it('keeps the thread route when the parent report holds more than one expense', async () => {
        mockOneTransactionThreadReportID = undefined;

        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).not.toHaveBeenCalled());
    });

    it('keeps the thread route while a multi-expense report is still paginating in and only one of its IOU actions has loaded', async () => {
        mockParentTransactionCount = 3;

        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).not.toHaveBeenCalled());
    });

    it('keeps the thread route when a sibling expense is deleted while the user is reading it', async () => {
        // Two expenses, so this thread is not redundant and the user is on it legitimately.
        mockParentTransactionCount = 2;
        mockOneTransactionThreadReportID = undefined;

        const {rerender} = render(<OneTransactionThreadRedirectHandler />);

        await waitForBatchedUpdatesWithAct();
        expect(mockNavigate).not.toHaveBeenCalled();

        // Someone deletes the other expense. `transactionCount` is merged optimistically, so the report becomes a
        // single-expense one underneath the user - but the thread they are reading must stay put.
        mockParentTransactionCount = 1;
        mockOneTransactionThreadReportID = THREAD_REPORT_ID;
        rerender(<OneTransactionThreadRedirectHandler />);

        await waitForBatchedUpdatesWithAct();

        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockGoBack).not.toHaveBeenCalled();
    });

    it('still redirects when the parent report only loads after the thread has mounted', async () => {
        // A cold open: nothing about the parent is in Onyx yet, so no answer can be latched.
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

        await waitFor(() => expect(mockNavigate).not.toHaveBeenCalled());
    });

    it('keeps the thread route after the app clears the linked action param mid-session', async () => {
        mockRouteParams = {reportID: THREAD_REPORT_ID, reportActionID: '99999'};

        const {rerender} = render(<OneTransactionThreadRedirectHandler />);

        await waitForBatchedUpdatesWithAct();

        // Sending a comment jumps the report to its live tail, which clears the anchor it was opened with. The user is
        // still reading the thread, so this must not become a redirect.
        mockRouteParams = {reportID: THREAD_REPORT_ID, reportActionID: ''};
        rerender(<OneTransactionThreadRedirectHandler />);

        await waitForBatchedUpdatesWithAct();

        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockGoBack).not.toHaveBeenCalled();
    });

    it('still redirects a thread routed onto later without an anchor of its own', async () => {
        mockRouteParams = {reportID: THREAD_REPORT_ID, reportActionID: '99999'};

        const {rerender} = render(<OneTransactionThreadRedirectHandler />);

        await waitForBatchedUpdatesWithAct();
        expect(mockNavigate).not.toHaveBeenCalled();

        // The screen is not remounted when a later route swaps in another thread, so the latch has to be per report.
        mockRouteParams = {reportID: '67890'};
        rerender(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
        expect(mockNavigate).toHaveBeenCalledWith(`r/${EXPENSE_REPORT_ID}`, {forceReplace: true});
    });

    it('keeps the thread route for a send money action', async () => {
        mockParentReportAction = createIOUAction(CONST.IOU.REPORT_ACTION_TYPE.PAY, {amount: 100});

        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).not.toHaveBeenCalled());
    });

    it('keeps the report inside the search RHP when redirecting from there', async () => {
        mockRouteName = SCREENS.RIGHT_MODAL.SEARCH_REPORT;

        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
        expect(mockNavigate).toHaveBeenCalledWith(`search/view/${EXPENSE_REPORT_ID}`, {forceReplace: true});
    });

    it("reuses the route's own backTo instead of the thread we are replacing", async () => {
        mockRouteParams = {reportID: THREAD_REPORT_ID, backTo: 'home'};

        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
        expect(mockNavigate).toHaveBeenCalledWith(`r/${EXPENSE_REPORT_ID}?backTo=home`, {forceReplace: true});
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

        await waitFor(() => expect(mockNavigate).not.toHaveBeenCalled());
    });

    it('goes back to the parent report instead of stacking a duplicate when backTo already points at it', async () => {
        mockRouteParams = {reportID: THREAD_REPORT_ID, backTo: `/r/${EXPENSE_REPORT_ID}`};

        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockGoBack).toHaveBeenCalledTimes(1));
        expect(mockGoBack).toHaveBeenCalledWith(`/r/${EXPENSE_REPORT_ID}`);
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('goes back to the parent report in the search RHP when backTo already points at it', async () => {
        mockRouteName = SCREENS.RIGHT_MODAL.SEARCH_REPORT;
        mockRouteParams = {reportID: THREAD_REPORT_ID, backTo: `/search/view/${EXPENSE_REPORT_ID}?q=whatever`};

        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockGoBack).toHaveBeenCalledTimes(1));
        expect(mockGoBack).toHaveBeenCalledWith(`/search/view/${EXPENSE_REPORT_ID}?q=whatever`);
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it.each([
        ['the search money request report', `/search/r/${EXPENSE_REPORT_ID}`],
        ['the expense report RHP', `/e/${EXPENSE_REPORT_ID}`],
    ])('goes back to the parent report instead of stacking a duplicate when backTo points at %s', async (_name, backTo) => {
        mockRouteName = SCREENS.RIGHT_MODAL.SEARCH_REPORT;
        mockRouteParams = {reportID: THREAD_REPORT_ID, backTo};

        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockGoBack).toHaveBeenCalledTimes(1));
        expect(mockGoBack).toHaveBeenCalledWith(backTo);
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it.each([
        ['the inbox report', SCREENS.REPORT, `/r/${EXPENSE_REPORT_ID}/9999`],
        ['the search RHP report', SCREENS.RIGHT_MODAL.SEARCH_REPORT, `/search/view/${EXPENSE_REPORT_ID}/9999`],
    ])('goes back to the parent report when backTo is %s anchored at one of its actions', async (_name, routeName, backTo) => {
        // `backTo` is `Navigation.getActiveRoute()`, and both routes end in an optional `:reportActionID`, so it can
        // carry an anchor. It still renders the parent, so this must not fall through to a replace.
        mockRouteName = routeName;
        mockRouteParams = {reportID: THREAD_REPORT_ID, backTo};

        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockGoBack).toHaveBeenCalledTimes(1));
        expect(mockGoBack).toHaveBeenCalledWith(backTo);
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it.each([
        ['a dynamic modal nested under the inbox report', SCREENS.REPORT, `/r/${EXPENSE_REPORT_ID}/duplicates/review/${THREAD_REPORT_ID}`],
        ['a dynamic modal nested under the search RHP report', SCREENS.RIGHT_MODAL.SEARCH_REPORT, `/search/view/${EXPENSE_REPORT_ID}/duplicates/review/${THREAD_REPORT_ID}`],
        ['a sub-route of the search money request report', SCREENS.RIGHT_MODAL.SEARCH_REPORT, `/search/r/${EXPENSE_REPORT_ID}/duplicates/review/${THREAD_REPORT_ID}`],
        ['a sub-route of the expense report RHP', SCREENS.RIGHT_MODAL.SEARCH_REPORT, `/e/${EXPENSE_REPORT_ID}/duplicates/review/${THREAD_REPORT_ID}`],
    ])('does not go back when backTo points at %s rather than the report itself', async (_name, routeName, backTo) => {
        // `createDynamicRoute` builds a dynamic modal's path as `<activeRoute>/<suffix>`, so any modal opened from the
        // parent report is nested under it. Popping onto one would drop the user back into the page they came from -
        // for Review duplicates that is the list whose row they just tapped, making the row a dead control.
        mockRouteName = routeName;
        mockRouteParams = {reportID: THREAD_REPORT_ID, backTo};

        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
        expect(mockGoBack).not.toHaveBeenCalled();
    });

    it('replaces the route when backTo is anchored at an action of a different report', async () => {
        mockRouteParams = {reportID: THREAD_REPORT_ID, backTo: '/r/99999/9999'};

        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
        expect(mockNavigate).toHaveBeenCalledWith(`r/${EXPENSE_REPORT_ID}?backTo=${encodeURIComponent('/r/99999/9999')}`, {forceReplace: true});
        expect(mockGoBack).not.toHaveBeenCalled();
    });

    it('leaves the route alone on a screen other than the inbox report and the search RHP report', async () => {
        // `RHPReportScreen` also backs `AGENT_REPORT`; redirecting from there would eject the user out of the RHP.
        mockRouteName = SCREENS.RIGHT_MODAL.AGENT_REPORT;

        render(<OneTransactionThreadRedirectHandler />);

        // The redirect is deferred behind `isNavigationReady()`, so microtasks have to flush before "nothing happened"
        // means anything - `waitFor` would resolve on the first tick and pass either way.
        await waitForBatchedUpdatesWithAct();

        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockGoBack).not.toHaveBeenCalled();
    });

    it('replaces the route when backTo points at a report other than the parent', async () => {
        mockRouteParams = {reportID: THREAD_REPORT_ID, backTo: '/r/99999'};

        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
        expect(mockNavigate).toHaveBeenCalledWith(`r/${EXPENSE_REPORT_ID}?backTo=${encodeURIComponent('/r/99999')}`, {forceReplace: true});
        expect(mockGoBack).not.toHaveBeenCalled();
    });

    it('redirects only once for the same thread when the effect re-runs before the transition finishes', async () => {
        const {rerender} = render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));

        // A late Onyx update re-runs the effect while the route being replaced is still mounted.
        mockRouteParams = {reportID: THREAD_REPORT_ID, backTo: 'home'};
        rerender(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
    });
});
