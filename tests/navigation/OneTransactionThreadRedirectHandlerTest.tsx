import {render, waitFor} from '@testing-library/react-native';

import CONST from '@src/CONST';
import OneTransactionThreadRedirectHandler from '@src/pages/inbox/OneTransactionThreadRedirectHandler';
import SCREENS from '@src/SCREENS';
import type {ReportAction} from '@src/types/onyx';

import React from 'react';
import type {ValueOf} from 'type-fest';

const THREAD_REPORT_ID = '12345';
const EXPENSE_REPORT_ID = '54321';

const mockNavigate = jest.fn();

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: (...args: unknown[]) => mockNavigate(...args),
        isNavigationReady: () => Promise.resolve(),
    },
}));

let mockRouteName: string = SCREENS.REPORT;
let mockRouteParams: {reportID?: string; reportActionID?: string; backTo?: string} = {reportID: THREAD_REPORT_ID};
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

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => [{reportID: '12345', parentReportID: mockParentReportID, parentReportActionID: '1'}, {status: 'loaded'}],
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
        originalMessage: {type, IOUDetails},
    } as unknown as ReportAction;
}

describe('OneTransactionThreadRedirectHandler', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
        mockRouteName = SCREENS.REPORT;
        mockRouteParams = {reportID: THREAD_REPORT_ID};
        mockIsFocused = true;
        mockParentReportID = EXPENSE_REPORT_ID;
        mockOneTransactionThreadReportID = THREAD_REPORT_ID;
        mockParentReportAction = createIOUAction(CONST.IOU.REPORT_ACTION_TYPE.CREATE);
    });

    it('replaces the route with the parent report when the thread is the only expense of the report', async () => {
        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
        expect(mockNavigate).toHaveBeenCalledWith(`r/${EXPENSE_REPORT_ID}`, {forceReplace: true});
    });

    it('keeps the thread route when the parent report holds more than one expense', async () => {
        mockOneTransactionThreadReportID = undefined;

        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).not.toHaveBeenCalled());
    });

    it('keeps the thread route when a report action is linked, so the deep link keeps its anchor', async () => {
        mockRouteParams = {reportID: THREAD_REPORT_ID, reportActionID: '99999'};

        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).not.toHaveBeenCalled());
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

    it('does not redirect while the screen is blurred', async () => {
        mockIsFocused = false;

        render(<OneTransactionThreadRedirectHandler />);

        await waitFor(() => expect(mockNavigate).not.toHaveBeenCalled());
    });
});
