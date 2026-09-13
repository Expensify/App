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

// Inlined because a `jest.mock` factory may only close over locals initialized with a literal. A test below asserts
// the two stay in sync.
const TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS_KEY = 'transactionThreadNavigationTransactionIDs';

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

// Not `useResponsiveLayout`: its `shouldUseNarrowLayout` counts the RHP this handler runs inside as narrow, so the
// handler reads the raw layout instead. Jest resolves the `.native.ts` variant, which is hardcoded to `true`, so the
// wide branch is only reachable in tests through this mock.
let mockIsNarrowLayout = false;

jest.mock('@libs/getIsNarrowLayout', () => ({
    __esModule: true,
    default: () => mockIsNarrowLayout,
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
            return [options?.selector ? options.selector(mockSiblingTransactionIDs) : mockSiblingTransactionIDs, {status: 'loaded'}];
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
        mockIsNarrowLayout = false;
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
        // Home "Recently added", "Review N flagged expenses" and the duplicate review list open a thread precisely for
        // the prev/next arrows, which only exist in the thread's header. Redirecting would dead-end them mid-review.
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
        // A cold open: nothing about the parent is in Onyx yet.
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

    it('opens the expense report in the wide RHP when redirecting from the search RHP outside search', async () => {
        mockRouteName = SCREENS.RIGHT_MODAL.SEARCH_REPORT;

        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
        expect(mockNavigate).toHaveBeenCalledWith(`e/${EXPENSE_REPORT_ID}`, {forceReplace: true});
    });

    it('opens the expense report as a full report view on a narrow layout, which has no wide RHP', async () => {
        mockRouteName = SCREENS.RIGHT_MODAL.SEARCH_REPORT;
        mockIsNarrowLayout = true;

        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
        expect(mockNavigate).toHaveBeenCalledWith(`r/${EXPENSE_REPORT_ID}`, {forceReplace: true});
    });

    it("reuses the route's own backTo instead of the thread we are replacing", async () => {
        mockRouteParams = {reportID: THREAD_REPORT_ID, backTo: 'home'};

        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
        expect(mockNavigate).toHaveBeenCalledWith(`r/${EXPENSE_REPORT_ID}?backTo=home`, {forceReplace: true});
    });

    it('inherits the nested backTo when the route came from the parent report itself', async () => {
        // A thread opened from its own report carries that report as `backTo`. Keeping it would leave the report
        // pointing at itself, which makes `linkTo` refuse to navigate at all.
        mockRouteParams = {reportID: THREAD_REPORT_ID, backTo: `/r/${EXPENSE_REPORT_ID}?backTo=%2Fsearch`};

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

    it('does not recognise an anchored parent backTo, so the report is left pointing at itself', async () => {
        // `getRoutePath` only strips the query string, so `/r/<parent>/<actionID>` does not match the built
        // `r/<parent>`. Documents current behavior - see the regression note on the PR.
        mockRouteParams = {reportID: THREAD_REPORT_ID, backTo: `/r/${EXPENSE_REPORT_ID}/9999`};

        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
        expect(mockNavigate).toHaveBeenCalledWith(`r/${EXPENSE_REPORT_ID}?backTo=${encodeURIComponent(`/r/${EXPENSE_REPORT_ID}/9999`)}`, {forceReplace: true});
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
});
