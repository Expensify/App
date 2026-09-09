import {act, renderHook} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useOneTransactionThreadReportID from '@hooks/useOneTransactionThreadReportID';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const REPORT_ID = 'report1';
const CHAT_REPORT_ID = 'chat1';

const report: Report = {
    reportID: REPORT_ID,
    chatReportID: CHAT_REPORT_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
};

const chatReport: Report = {
    reportID: CHAT_REPORT_ID,
    type: CONST.REPORT.TYPE.CHAT,
};

function createIOUAction(reportActionID: string, transactionID: string, childReportID?: string): ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> {
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

describe('useOneTransactionThreadReportID', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, chatReport);
    });

    afterEach(() => {
        return Onyx.clear();
    });

    it('returns undefined when reportID is undefined', async () => {
        const {result} = renderHook(() => useOneTransactionThreadReportID(undefined), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdatesWithAct();
        expect(result.current).toBeUndefined();
    });

    it('returns the childReportID when the report has exactly one IOU transaction action', async () => {
        const action = createIOUAction('action1', 'transaction1', 'thread1');
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {[action.reportActionID]: action});
            await waitForBatchedUpdatesWithAct();
        });

        const {result} = renderHook(() => useOneTransactionThreadReportID(REPORT_ID), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdatesWithAct();
        expect(result.current).toBe('thread1');
    });

    it('returns CONST.FAKE_REPORT_ID when the single IOU action has no childReportID', async () => {
        const action = createIOUAction('action1', 'transaction1');
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {[action.reportActionID]: action});
            await waitForBatchedUpdatesWithAct();
        });

        const {result} = renderHook(() => useOneTransactionThreadReportID(REPORT_ID), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdatesWithAct();
        expect(result.current).toBe(CONST.FAKE_REPORT_ID);
    });

    it('returns undefined when the report has more than one IOU transaction action', async () => {
        const action1 = createIOUAction('action1', 'transaction1', 'thread1');
        const action2 = createIOUAction('action2', 'transaction2', 'thread2');
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                [action1.reportActionID]: action1,
                [action2.reportActionID]: action2,
            });
            await waitForBatchedUpdatesWithAct();
        });

        const {result} = renderHook(() => useOneTransactionThreadReportID(REPORT_ID), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdatesWithAct();
        expect(result.current).toBeUndefined();
    });

    it('returns undefined when there are no report actions', async () => {
        const {result} = renderHook(() => useOneTransactionThreadReportID(REPORT_ID), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdatesWithAct();
        expect(result.current).toBeUndefined();
    });

    it('returns undefined when the report is not an IOU, Expense, or Invoice report', async () => {
        const action = createIOUAction('action1', 'transaction1', 'thread1');
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {...report, type: CONST.REPORT.TYPE.CHAT});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {[action.reportActionID]: action});
            await waitForBatchedUpdatesWithAct();
        });

        const {result} = renderHook(() => useOneTransactionThreadReportID(REPORT_ID), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdatesWithAct();
        expect(result.current).toBeUndefined();
    });
});
