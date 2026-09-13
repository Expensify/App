/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */
import {act, render, waitFor} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import OneTransactionThreadRedirectHandler from '@src/pages/inbox/OneTransactionThreadRedirectHandler';
import SCREENS from '@src/SCREENS';
import type {Report, ReportAction} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const CHAT_REPORT_ID = 'chat1';
const EXPENSE_REPORT_ID = 'expense1';
const THREAD_REPORT_ID = 'thread1';
const SECOND_THREAD_REPORT_ID = 'thread2';

const mockNavigate = jest.fn();

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: (...args: unknown[]) => mockNavigate(...args),
    },
}));

// Onyx, not layout, is what this suite pins down, and the inbox route below never reads the narrow-layout branch.
jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => ({shouldUseNarrowLayout: false}),
}));

const mockRoute = {name: SCREENS.REPORT, params: {reportID: THREAD_REPORT_ID}};

jest.mock('@react-navigation/native', () => {
    const actual = jest.requireActual('@react-navigation/native');
    return {
        ...actual,
        useRoute: () => mockRoute,
        useIsFocused: () => true,
    };
});

function createIOUAction(reportActionID: string, transactionID: string, childReportID: string): ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> {
    return {
        reportActionID,
        childReportID,
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        created: '2025-02-14 08:12:05.165',
        originalMessage: {
            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            amount: 10402,
            currency: CONST.CURRENCY.USD,
            IOUTransactionID: transactionID,
        },
        message: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
                html: '$104.02 expense',
                text: '$104.02 expense',
            },
        ],
    };
}

const chatReport: Report = {
    reportID: CHAT_REPORT_ID,
    type: CONST.REPORT.TYPE.CHAT,
};

const threadReport: Report = {
    reportID: THREAD_REPORT_ID,
    parentReportID: EXPENSE_REPORT_ID,
    parentReportActionID: 'action1',
    type: CONST.REPORT.TYPE.EXPENSE,
};

/** Seeds the chat report, the expense report with the given transaction count, the thread and the parent's IOU actions. */
async function seedOnyx(transactionCount: number, actions: Array<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>) {
    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, chatReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_REPORT_ID}`, {
            reportID: EXPENSE_REPORT_ID,
            chatReportID: CHAT_REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            transactionCount,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${THREAD_REPORT_ID}`, threadReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${EXPENSE_REPORT_ID}`, Object.fromEntries(actions.map((action) => [action.reportActionID, action])));
        await waitForBatchedUpdatesWithAct();
    });
}

/**
 * `OneTransactionThreadRedirectHandlerTest` mocks the hooks to pin down the decision table. This suite feeds the
 * handler real Onyx data, so it catches a wrong Onyx key or reportID that the mocked suite would pass.
 */
describe('OneTransactionThreadRedirectHandler with real Onyx data', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockNavigate.mockClear();
    });

    afterEach(() => {
        return Onyx.clear();
    });

    it('redirects to the parent report when the thread is the only expense of that report', async () => {
        await seedOnyx(1, [createIOUAction('action1', 'transaction1', THREAD_REPORT_ID)]);

        render(<OneTransactionThreadRedirectHandler />, {wrapper: OnyxListItemProvider});

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
        expect(mockNavigate).toHaveBeenCalledWith(`r/${EXPENSE_REPORT_ID}`, {forceReplace: true});
    });

    it('keeps the thread route when the parent report holds more than one expense', async () => {
        await seedOnyx(2, [createIOUAction('action1', 'transaction1', THREAD_REPORT_ID), createIOUAction('action2', 'transaction2', SECOND_THREAD_REPORT_ID)]);

        render(<OneTransactionThreadRedirectHandler />, {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdatesWithAct();

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('keeps the thread route while a multi-expense report is still paginating in', async () => {
        // The server counter says three expenses, but only one IOU action has arrived so far.
        await seedOnyx(3, [createIOUAction('action1', 'transaction1', THREAD_REPORT_ID)]);

        render(<OneTransactionThreadRedirectHandler />, {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdatesWithAct();

        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
