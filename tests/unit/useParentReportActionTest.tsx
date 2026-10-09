import {act, renderHook} from '@testing-library/react-native';

import useParentReportAction from '@hooks/useParentReportAction';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const PARENT_REPORT_ID = '1';
const PARENT_REPORT_ACTION_ID = '100';

const threadReport = {reportID: '2', parentReportID: PARENT_REPORT_ID, parentReportActionID: PARENT_REPORT_ACTION_ID} as Report;

const parentReportAction = {
    reportActionID: PARENT_REPORT_ACTION_ID,
    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    created: '2026-10-08 10:00:00.000',
    childReportID: threadReport.reportID,
    childVisibleActionCount: 1,
    childLastVisibleActionCreated: '2026-10-08 10:00:00.000',
} as ReportAction;

describe('useParentReportAction', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${PARENT_REPORT_ID}`, {[PARENT_REPORT_ACTION_ID]: parentReportAction});
        await waitForBatchedUpdates();
    });

    const replyInThread = async () => {
        // A reply in the thread bumps the reply counters on the parent action (see getOptimisticDataForAncestors)
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${PARENT_REPORT_ID}`, {
                [PARENT_REPORT_ACTION_ID]: {childVisibleActionCount: 2, childLastVisibleActionCreated: '2026-10-08 11:00:00.000'},
            });
            await waitForBatchedUpdates();
        });
    };

    it('should keep the parent action identity on a reply when thread replies are ignored', async () => {
        // Given a thread screen that only renders its parent message
        const {result} = renderHook(() => useParentReportAction(threadReport, {shouldIgnoreThreadReplies: true}));
        await act(async () => {
            await waitForBatchedUpdates();
        });
        const firstResult = result.current;
        expect(firstResult).toEqual(expect.objectContaining({reportActionID: PARENT_REPORT_ACTION_ID}));
        expect(firstResult).not.toHaveProperty('childVisibleActionCount');

        // When someone replies in the thread
        await replyInThread();

        // Then the parent action keeps its identity, so the caller does not re-render for every reply
        expect(result.current).toBe(firstResult);
    });

    it('should return the reply counters by default', async () => {
        // Given a caller that needs the reply counters (e.g. the thread replies row)
        const {result} = renderHook(() => useParentReportAction(threadReport));
        await act(async () => {
            await waitForBatchedUpdates();
        });

        // When someone replies in the thread
        await replyInThread();

        // Then the parent action carries the updated counters
        expect(result.current?.childVisibleActionCount).toBe(2);
    });
});
