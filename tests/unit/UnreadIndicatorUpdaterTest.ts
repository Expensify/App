import type {ReportAction, ReportActions} from '../../src/types/onyx';

/* eslint-disable @typescript-eslint/naming-convention */
import CONST from '../../src/CONST';
import UnreadIndicatorUpdater from '../../src/libs/UnreadIndicatorUpdater';
import ONYXKEYS from '../../src/ONYXKEYS';
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
                expect(UnreadIndicatorUpdater.getUnreadReportIDsForUnreadIndicator(reportsToBeUsed, '3', undefined).length).toBe(2);
            });
        });

        it('given some reports are incomplete', () => {
            const reportsToBeUsed = {
                1: {reportID: '1', type: CONST.REPORT.TYPE.EXPENSE, lastReadTime: '2023-07-08 07:15:44.030', lastVisibleActionCreated: '2023-08-08 07:15:44.030'},
                2: {reportID: '2', type: CONST.REPORT.TYPE.TASK, lastReadTime: '2023-02-05 09:12:05.000', lastVisibleActionCreated: '2023-02-06 07:15:44.030'},
                3: {reportID: '3', type: CONST.REPORT.TYPE.TASK},
            };
            expect(UnreadIndicatorUpdater.getUnreadReportIDsForUnreadIndicator(reportsToBeUsed, '3', undefined).length).toBe(0);
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
                expect(UnreadIndicatorUpdater.getUnreadReportIDsForUnreadIndicator(reportsToBeUsed, '3', undefined).length).toBe(1);
            });
        });
    });

    describe('expense report with one transaction thread', () => {
        const EXPENSE_REPORT_ID = '1';
        const THREAD_REPORT_ID = '200';
        const READ_TIME = '2023-08-10 07:15:44.030';
        const OLDER_MESSAGE_TIME = '2023-08-08 07:15:44.030';
        const NEWER_MESSAGE_TIME = '2023-08-12 07:15:44.030';
        const OTHER_USER_ACCOUNT_ID = 2;

        const getReports = (thread: {lastReadTime: string; lastVisibleActionCreated: string}) => ({
            [`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_REPORT_ID}`]: {
                reportID: EXPENSE_REPORT_ID,
                reportName: 'test',
                type: CONST.REPORT.TYPE.EXPENSE,
                lastReadTime: READ_TIME,
                lastVisibleActionCreated: OLDER_MESSAGE_TIME,
                lastActorAccountID: OTHER_USER_ACCOUNT_ID,
                lastMessageText: 'test',
                participants: {[TEST_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}},
            },
            [`${ONYXKEYS.COLLECTION.REPORT}${THREAD_REPORT_ID}`]: {
                reportID: THREAD_REPORT_ID,
                reportName: 'thread',
                type: CONST.REPORT.TYPE.CHAT,
                parentReportID: EXPENSE_REPORT_ID,
                lastActorAccountID: OTHER_USER_ACCOUNT_ID,
                lastMessageText: 'test',
                ...thread,
            },
        });

        const getReportActions = (iouAction: Partial<ReportAction> = {}) => ({
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${EXPENSE_REPORT_ID}`]: {
                10: {
                    reportActionID: '10',
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    created: '2023-08-01 07:15:44.030',
                    childReportID: THREAD_REPORT_ID,
                    // eslint-disable-next-line @typescript-eslint/no-deprecated -- the fixture must carry an IOU originalMessage so the report is mapped to its transaction thread
                    originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, IOUTransactionID: 'transaction1', amount: 100, currency: CONST.CURRENCY.USD},
                    message: [{type: 'COMMENT', html: 'test', text: 'test'}],
                    ...iouAction,
                },
            } as ReportActions,
        });

        const scan = (reports: ReturnType<typeof getReports>, reportActions: ReturnType<typeof getReportActions>) =>
            UnreadIndicatorUpdater.getUnreadReportIDsForUnreadIndicator(reports, undefined, undefined, {
                reportActions,
                currentUserAccountID: TEST_USER_ACCOUNT_ID,
                currentUserLogin: TEST_USER_LOGIN,
            });

        it('counts the report as unread when its only transaction thread has a newer message than the last read', () => {
            // Given an expense report that was read after its own last message, but whose transaction thread got a message after that
            const reports = getReports({lastReadTime: OLDER_MESSAGE_TIME, lastVisibleActionCreated: NEWER_MESSAGE_TIME});

            // When the unread reports are scanned
            const unreadReportIDs = scan(reports, getReportActions());

            // Then the expense report is unread because of the thread message, even though its own last message was already read
            expect(unreadReportIDs).toContain(EXPENSE_REPORT_ID);
        });

        it('does not count the report as unread when its transaction thread is read', () => {
            // Given the same expense report, but the thread was read after its newest message
            const reports = getReports({lastReadTime: NEWER_MESSAGE_TIME, lastVisibleActionCreated: NEWER_MESSAGE_TIME});

            // When the unread reports are scanned
            const unreadReportIDs = scan(reports, getReportActions());

            // Then nothing is left to read, so the expense report is not counted
            expect(unreadReportIDs).not.toContain(EXPENSE_REPORT_ID);
        });

        it('stops counting the thread message after the report actions change so the thread is no longer attached to the report', () => {
            // Given a scan that counted the report because of the message in its thread
            const reports = getReports({lastReadTime: OLDER_MESSAGE_TIME, lastVisibleActionCreated: NEWER_MESSAGE_TIME});
            expect(scan(reports, getReportActions())).toContain(EXPENSE_REPORT_ID);

            // When the expense is deleted, so the report actions are replaced by ones where the thread is not attached to the report anymore
            const reportActionsAfterDelete = getReportActions({
                message: [{type: 'COMMENT', html: '', text: '', isDeletedParentAction: true, deleted: '2023-08-13 07:15:44.030'}],
                // eslint-disable-next-line @typescript-eslint/no-deprecated -- a deleted IOU action keeps its deletion in the originalMessage that getOriginalMessage reads
                originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, IOUTransactionID: 'transaction1', amount: 100, currency: CONST.CURRENCY.USD, deleted: '2023-08-13 07:15:44.030'},
            });
            const unreadReportIDs = scan(reports, reportActionsAfterDelete);

            // Then the result follows the new actions instead of repeating the earlier answer
            expect(unreadReportIDs).not.toContain(EXPENSE_REPORT_ID);
        });

        it('does not count a read report that has no transaction thread', () => {
            // Given an expense report read after its last message and no report actions
            const reports = getReports({lastReadTime: OLDER_MESSAGE_TIME, lastVisibleActionCreated: OLDER_MESSAGE_TIME});

            // When the unread reports are scanned
            const unreadReportIDs = scan(reports, {});

            // Then the report is not counted
            expect(unreadReportIDs).not.toContain(EXPENSE_REPORT_ID);
        });
    });
});
