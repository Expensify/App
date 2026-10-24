import {isUnread} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const CURRENT_USER_ACCOUNT_ID = 5;
const REPORT_ID = 'manual-unread-state';
const LAST_READ_TIME = '2026-01-01 11:00:00.000';

describe('manual unread state', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID});
        await waitForBatchedUpdates();
    });

    describe.each(['own activity', 'read transaction thread'])('%s', (activity) => {
        const report: Report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.CHAT,
            lastMessageText: 'Message',
            lastReadTime: LAST_READ_TIME,
            lastVisibleActionCreated: '2026-01-01 12:00:00.000',
            lastActorAccountID: activity === 'own activity' ? CURRENT_USER_ACCOUNT_ID : CURRENT_USER_ACCOUNT_ID + 1,
            manuallyMarkedUnreadReportActionID: 'old-marked-action',
        };
        const transactionThreadReport: Report | undefined =
            activity === 'read transaction thread'
                ? {
                      reportID: 'read-thread',
                      lastReadTime: '2026-01-01 13:00:00.000',
                      lastVisibleActionCreated: report.lastVisibleActionCreated,
                  }
                : undefined;

        it.each(['2026-01-01 09:59:59.999', null])('does not treat an old anchor as unread intent (manual cursor: %s)', async (manuallyMarkedUnreadTime) => {
            // Given a retained divider anchor whose manual cursor is consumed or absent
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${REPORT_ID}`, {manuallyMarkedUnreadTime});
            await waitForBatchedUpdates();

            // When unread state is derived after reading the report
            // Then the anchor cannot bypass self-author or transaction-thread read checks
            expect(isUnread(report, transactionThreadReport, false, false)).toBe(false);
        });

        it('honors a new explicit mark even when its anchor points to the same message', async () => {
            // Given an explicit manual mark that still matches the report's read cursor
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${REPORT_ID}`, {manuallyMarkedUnreadTime: LAST_READ_TIME});
            await waitForBatchedUpdates();

            // When unread state is derived before that manual mark is consumed
            // Then it overrides the self-author and transaction-thread read checks
            expect(isUnread(report, transactionThreadReport, false, false)).toBe(true);
        });
    });
});
