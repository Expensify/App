/* eslint-disable @typescript-eslint/naming-convention */
import CONST from '../../src/CONST';
import UnreadIndicatorUpdater from '../../src/libs/UnreadIndicatorUpdater';
import * as TestHelper from '../utils/TestHelper';

const TEST_USER_ACCOUNT_ID = 1;
const TEST_USER_LOGIN = 'test@test.com';

describe('UnreadIndicatorUpdaterTest', () => {
    describe('should return correct number of unread reports', () => {
        it('given last read time < last visible action created', () => {
            const reportsToBeUsed = {
                1: {
                    reportID: '1',
                    reportName: 'test',
                    type: CONST.REPORT.TYPE.EXPENSE,
                    lastReadTime: '2023-07-08 07:15:44.030',
                    lastVisibleActionCreated: '2023-08-08 07:15:44.030',
                    lastMessageText: 'test',
                },
                2: {
                    reportID: '2',
                    reportName: 'test',
                    type: CONST.REPORT.TYPE.TASK,
                    lastReadTime: '2023-02-05 09:12:05.000',
                    lastVisibleActionCreated: '2023-02-06 07:15:44.030',
                    lastMessageText: 'test',
                },
                3: {reportID: '3', reportName: 'test', type: CONST.REPORT.TYPE.TASK, lastMessageText: 'test'},
            };
            TestHelper.setPersonalDetails(TEST_USER_LOGIN, TEST_USER_ACCOUNT_ID).then(() => {
                expect(UnreadIndicatorUpdater.getUnreadReportsForUnreadIndicator(reportsToBeUsed, '3', undefined).length).toBe(2);
            });
        });

        it('given some reports are incomplete', () => {
            const reportsToBeUsed = {
                1: {reportID: '1', type: CONST.REPORT.TYPE.EXPENSE, lastReadTime: '2023-07-08 07:15:44.030', lastVisibleActionCreated: '2023-08-08 07:15:44.030'},
                2: {reportID: '2', type: CONST.REPORT.TYPE.TASK, lastReadTime: '2023-02-05 09:12:05.000', lastVisibleActionCreated: '2023-02-06 07:15:44.030'},
                3: {reportID: '3', type: CONST.REPORT.TYPE.TASK},
            };
            expect(UnreadIndicatorUpdater.getUnreadReportsForUnreadIndicator(reportsToBeUsed, '3', undefined).length).toBe(0);
        });

        it('given notification preference of some reports is hidden', () => {
            const reportsToBeUsed = {
                1: {
                    reportID: '1',
                    reportName: 'test',
                    type: CONST.REPORT.TYPE.EXPENSE,
                    participants: {
                        [TEST_USER_ACCOUNT_ID]: {
                            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                        },
                    },
                    lastReadTime: '2023-07-08 07:15:44.030',
                    lastVisibleActionCreated: '2023-08-08 07:15:44.030',
                    lastMessageText: 'test',
                },
                2: {
                    reportID: '2',
                    reportName: 'test',
                    type: CONST.REPORT.TYPE.TASK,
                    lastReadTime: '2023-02-05 09:12:05.000',
                    lastVisibleActionCreated: '2023-02-06 07:15:44.030',
                    lastMessageText: 'test',
                },
                3: {reportID: '3', reportName: 'test', type: CONST.REPORT.TYPE.TASK, lastMessageText: 'test'},
            };
            TestHelper.setPersonalDetails(TEST_USER_LOGIN, TEST_USER_ACCOUNT_ID).then(() => {
                expect(UnreadIndicatorUpdater.getUnreadReportsForUnreadIndicator(reportsToBeUsed, '3', undefined).length).toBe(1);
            });
        });
    });

    describe('memoizedGetUnreadReportsForUnreadIndicator', () => {
        it('keeps a single cache entry across report updates', () => {
            // Given the memoized lookup and three report collections, as three report writes would produce
            const memoized = UnreadIndicatorUpdater.memoizedGetUnreadReportsForUnreadIndicator;
            memoized.cache.clear();
            const snapshots = [1, 2, 3].map((i) => ({
                1: {reportID: '1', reportName: 'test', type: CONST.REPORT.TYPE.CHAT, lastReadTime: `2023-07-0${i} 07:15:44.030`},
            }));

            // When each collection is looked up in turn
            for (const snapshot of snapshots) {
                memoized(snapshot, undefined, undefined);
            }

            // Then only the latest collection is cached, so older report snapshots are not kept alive
            expect(memoized.cache.size).toBe(1);
        });

        it('reuses the result when called again with the same collection', () => {
            // Given a report collection that was already looked up once
            const memoized = UnreadIndicatorUpdater.memoizedGetUnreadReportsForUnreadIndicator;
            memoized.cache.clear();
            const reports = {1: {reportID: '1', reportName: 'test', type: CONST.REPORT.TYPE.CHAT}};
            const first = memoized(reports, undefined, undefined);

            // When the same collection is looked up again, as happens on a navigation change with no report write
            const second = memoized(reports, undefined, undefined);

            // Then the cached result is returned instead of recomputing it
            expect(second).toBe(first);
        });
    });
});
