/* eslint-disable @typescript-eslint/naming-convention */
import CONST from '../../src/CONST';
import getUnreadReportsForUnreadIndicator from '../../src/libs/UnreadIndicatorUpdater';

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
            expect(getUnreadReportsForUnreadIndicator(reportsToBeUsed, '3').length).toBe(2);
        });

        it('given some reports are incomplete', () => {
            const reportsToBeUsed = {
                1: {reportID: '1', type: CONST.REPORT.TYPE.EXPENSE, lastReadTime: '2023-07-08 07:15:44.030', lastVisibleActionCreated: '2023-08-08 07:15:44.030'},
                2: {reportID: '2', type: CONST.REPORT.TYPE.TASK, lastReadTime: '2023-02-05 09:12:05.000', lastVisibleActionCreated: '2023-02-06 07:15:44.030'},
                3: {reportID: '3', type: CONST.REPORT.TYPE.TASK},
            };
            expect(getUnreadReportsForUnreadIndicator(reportsToBeUsed, '3').length).toBe(0);
        });

        it('given notification preference of some reports is hidden', () => {
            const reportsToBeUsed = {
                1: {
                    reportID: '1',
                    reportName: 'test',
                    type: CONST.REPORT.TYPE.EXPENSE,
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
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
            expect(getUnreadReportsForUnreadIndicator(reportsToBeUsed, '3').length).toBe(1);
        });
    });
});
