import type * as NetworkStateModule from '../../src/libs/NetworkState';
import type {Report, ReportAction, ReportActions} from '../../src/types/onyx';

/* eslint-disable @typescript-eslint/naming-convention */
import CONST from '../../src/CONST';
import {getIsOffline} from '../../src/libs/NetworkState';
import UnreadIndicatorUpdater from '../../src/libs/UnreadIndicatorUpdater';
import ONYXKEYS from '../../src/ONYXKEYS';
import * as TestHelper from '../utils/TestHelper';

jest.mock('../../src/libs/NetworkState', () => ({
    ...jest.requireActual<typeof NetworkStateModule>('../../src/libs/NetworkState'),
    getIsOffline: jest.fn(() => false),
}));

const mockGetIsOffline = jest.mocked(getIsOffline);

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

        const getReports = (
            thread: {lastReadTime: string; lastVisibleActionCreated: string},
            expenseReport: Omit<Partial<Report>, 'reportID'> = {},
            extraReports: Record<string, Report> = {},
        ) => ({
            [`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_REPORT_ID}`]: {
                reportID: EXPENSE_REPORT_ID,
                reportName: 'test',
                type: CONST.REPORT.TYPE.EXPENSE,
                lastReadTime: READ_TIME,
                lastVisibleActionCreated: OLDER_MESSAGE_TIME,
                lastActorAccountID: OTHER_USER_ACCOUNT_ID,
                lastMessageText: 'test',
                participants: {[TEST_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}},
                ...expenseReport,
            },
            ...extraReports,
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

        const scan = (reports: ReturnType<typeof getReports>, reportActions: ReturnType<typeof getReportActions>, currentReportID?: string) =>
            UnreadIndicatorUpdater.getUnreadReportIDsForUnreadIndicator(reports, currentReportID, undefined, {
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

        it('counts a report read after its last message when the user was mentioned later', () => {
            // Given a chat read after its last visible message, but with a mention that came after the read
            const reports = getReports(
                {lastReadTime: NEWER_MESSAGE_TIME, lastVisibleActionCreated: NEWER_MESSAGE_TIME},
                {type: CONST.REPORT.TYPE.CHAT, lastMentionedTime: NEWER_MESSAGE_TIME},
            );

            // When the unread reports are scanned
            const unreadReportIDs = scan(reports, {});

            // Then the mention keeps the report unread, so a read last message alone does not skip it
            expect(unreadReportIDs).toContain(EXPENSE_REPORT_ID);
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

        describe('when the same report actions are scanned again', () => {
            const THREAD_UNREAD = {lastReadTime: OLDER_MESSAGE_TIME, lastVisibleActionCreated: NEWER_MESSAGE_TIME};

            afterEach(() => {
                mockGetIsOffline.mockReturnValue(false);
            });

            it('follows the transaction count of an open bill, which only has a transaction thread while it holds one expense', () => {
                // Given an open bill with one expense, counted because of the unread message in its transaction thread
                const reportActions = getReportActions();
                const bill = {type: CONST.REPORT.UNSUPPORTED_TYPE.BILL, transactionCount: 1};
                expect(scan(getReports(THREAD_UNREAD, bill), reportActions, EXPENSE_REPORT_ID)).toContain(EXPENSE_REPORT_ID);

                // When the same actions are scanned after the bill got a second expense
                const unreadReportIDs = scan(getReports(THREAD_UNREAD, {...bill, transactionCount: 2}), reportActions, EXPENSE_REPORT_ID);

                // Then the bill has no single transaction thread anymore, so the thread message no longer counts
                expect(unreadReportIDs).not.toContain(EXPENSE_REPORT_ID);
            });

            it('follows the report type, so a thread only counts while the report can have one', () => {
                // Given a report that was read before its own last message, but whose transaction thread was read after everything
                const reportReadBeforeItsLastMessage = {lastReadTime: OLDER_MESSAGE_TIME, lastVisibleActionCreated: READ_TIME};
                const threadReadAfterEverything = {lastReadTime: NEWER_MESSAGE_TIME, lastVisibleActionCreated: NEWER_MESSAGE_TIME};
                const reportActions = getReportActions();

                // When the same actions are scanned for an expense report, where the thread read time counts
                const asExpenseReport = scan(getReports(threadReadAfterEverything, reportReadBeforeItsLastMessage), reportActions);

                // Then the report is read
                expect(asExpenseReport).not.toContain(EXPENSE_REPORT_ID);

                // When the same actions are scanned for a plain chat, which cannot have a transaction thread
                const asChat = scan(getReports(threadReadAfterEverything, {...reportReadBeforeItsLastMessage, type: CONST.REPORT.TYPE.CHAT}), reportActions);

                // Then the thread no longer counts and the report is unread, instead of repeating the earlier answer
                expect(asChat).toContain(EXPENSE_REPORT_ID);
            });

            it('follows the chat report, which decides whether a lone pay action is the send money flow', () => {
                // Given a report with a single pay action, which only has a transaction thread in a direct message chat
                const CHAT_REPORT_ID = '300';
                const chatReportKey = `${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`;
                const reportActions = getReportActions({
                    // eslint-disable-next-line @typescript-eslint/no-deprecated -- the fixture must carry a pay originalMessage so the action is read as a pay action
                    originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.PAY, IOUTransactionID: 'transaction1', amount: 100, currency: CONST.CURRENCY.USD},
                });
                const directMessageChat = {reportID: CHAT_REPORT_ID, reportName: 'chat', type: CONST.REPORT.TYPE.CHAT};
                const workspaceChat = {...directMessageChat, chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT};
                expect(scan(getReports(THREAD_UNREAD, {chatReportID: CHAT_REPORT_ID}, {[chatReportKey]: directMessageChat}), reportActions)).toContain(EXPENSE_REPORT_ID);

                // When the same actions are scanned and the chat report is now a workspace chat
                const unreadReportIDs = scan(getReports(THREAD_UNREAD, {chatReportID: CHAT_REPORT_ID}, {[chatReportKey]: workspaceChat}), reportActions);

                // Then the thread no longer counts
                expect(unreadReportIDs).not.toContain(EXPENSE_REPORT_ID);
            });

            it('follows the offline state, which keeps a pending deleted expense as a second expense of the report', () => {
                // Given a report with one expense and a second one that is being deleted, so only offline it is still counted
                const reports = getReports(THREAD_UNREAD);
                const actionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${EXPENSE_REPORT_ID}`;
                const pendingDeleteAction = {
                    reportActionID: '11',
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    created: '2023-08-02 07:15:44.030',
                    childReportID: '201',
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    // eslint-disable-next-line @typescript-eslint/no-deprecated -- the fixture must carry an IOU originalMessage so the action is read as an expense
                    originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, IOUTransactionID: 'transaction2', amount: 100, currency: CONST.CURRENCY.USD},
                    message: [{type: 'COMMENT', html: '', text: '', isDeletedParentAction: true, deleted: '2023-08-13 07:15:44.030'}],
                };
                const reportActions = {[actionsKey]: {...getReportActions()[actionsKey], 11: pendingDeleteAction} as ReportActions};
                expect(scan(reports, reportActions)).toContain(EXPENSE_REPORT_ID);

                // When the same actions are scanned offline
                mockGetIsOffline.mockReturnValue(true);
                const offlineScan = scan(reports, reportActions);

                // Then the report has two expenses and no single transaction thread, and the thread counts again when the app is back online
                expect(offlineScan).not.toContain(EXPENSE_REPORT_ID);
                mockGetIsOffline.mockReturnValue(false);
                expect(scan(reports, reportActions)).toContain(EXPENSE_REPORT_ID);
            });
        });
    });
});
