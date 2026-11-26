/* eslint-disable @typescript-eslint/naming-convention */
import type {OnyxCollection} from 'react-native-onyx';

import type {Report, ReportActions, ReportAttributesDerivedValue, ReportNameValuePairs} from '../../src/types/onyx';

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
    describe('createUnreadReportsTracker', () => {
        // A small seeded generator keeps every run of this test on the same sequence of updates
        let seed = 42;
        const random = () => {
            seed = (seed * 1103515245 + 12345) % 2147483648;
            return seed / 2147483648;
        };
        const pick = <T>(values: T[]): T => values[Math.floor(random() * values.length)];
        const chatReportIDs = ['1', '2', '3', '4', '5', '6'];
        const expenseReportIDs = ['11', '12', '13', '14', '15', '16', '17', '18'];
        const threadReportIDs = ['21', '22', '23', '24', '25', '26', '27', '28'];
        const allReportIDs = [...chatReportIDs, ...expenseReportIDs, ...threadReportIDs];
        const times = ['2024-01-01 00:00:00.000', '2024-01-02 00:00:00.000', '2024-01-03 00:00:00.000', '2024-01-04 00:00:00.000'];
        const notificationPreferences = [
            CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
            CONST.REPORT.NOTIFICATION_PREFERENCE.DAILY,
            CONST.REPORT.NOTIFICATION_PREFERENCE.MUTE,
            CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
        ];

        const createReport = (reportID: string): Report => ({
            reportID,
            reportName: 'test',
            type: expenseReportIDs.includes(reportID) ? CONST.REPORT.TYPE.EXPENSE : CONST.REPORT.TYPE.CHAT,
            chatReportID: expenseReportIDs.includes(reportID) ? pick(chatReportIDs) : undefined,
            chatType: chatReportIDs.includes(reportID) ? pick([undefined, CONST.REPORT.CHAT_TYPE.POLICY_ROOM]) : undefined,
            participants: {[TEST_USER_ACCOUNT_ID]: {notificationPreference: pick(notificationPreferences)}},
            lastReadTime: pick(times),
            lastVisibleActionCreated: pick(times),
            lastActorAccountID: pick([TEST_USER_ACCOUNT_ID, 2]),
            lastMessageText: pick(['', 'test']),
        });
        const createExpenseActions = (): ReportActions => {
            const actions: ReportActions = {};
            const count = pick([0, 1, 1, 2]);
            for (let index = 0; index < count; index++) {
                actions[`${index}`] = {
                    reportActionID: `${index}`,
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    created: pick(times),
                    childReportID: pick(threadReportIDs),
                    message: [{type: CONST.REPORT.MESSAGE.TYPE.COMMENT, html: 'expense', text: 'expense'}],
                    // A pay action only gives a thread when its chat is a DM, so it makes the result depend on the chat
                    // eslint-disable-next-line @typescript-eslint/no-deprecated -- getOriginalMessage reads the IOU type and transaction from it
                    originalMessage: {
                        type: pick([CONST.IOU.REPORT_ACTION_TYPE.CREATE, CONST.IOU.REPORT_ACTION_TYPE.PAY]),
                        IOUTransactionID: `${index}`,
                        amount: 100,
                        currency: CONST.CURRENCY.USD,
                    },
                };
            }
            return actions;
        };
        const createAttributes = (): ReportAttributesDerivedValue['reports'][string] => ({
            reportName: 'test',
            isEmpty: random() < 0.2,
            brickRoadStatus: undefined,
            requiresAttention: random() < 0.2,
            reportErrors: {},
        });

        it('matches the full check after every kind of update', () => {
            // Given reports, expense actions, name value pairs and attributes linked to each other like the real data
            let reports: OnyxCollection<Report> = {};
            let reportActions: OnyxCollection<ReportActions> = {};
            let reportNameValuePairs: OnyxCollection<ReportNameValuePairs> = {};
            let reportAttributes: ReportAttributesDerivedValue['reports'] = {};
            for (const reportID of allReportIDs) {
                reports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] = createReport(reportID);
                reportNameValuePairs[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`] = {private_isArchived: random() < 0.1 ? pick(times) : ''};
                reportAttributes[reportID] = createAttributes();
            }
            for (const reportID of expenseReportIDs) {
                reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] = createExpenseActions();
            }
            let currentReportID: string | undefined = pick(allReportIDs);
            let draftComment: string | undefined;
            const getUnreadReportIDs = UnreadIndicatorUpdater.createUnreadReportsTracker();

            for (let step = 0; step < 2000; step++) {
                // When one piece of data changes like an Onyx update does, keeping every other member as the same object
                const reportID = pick(allReportIDs);
                switch (pick(['report', 'report', 'remove', 'actions', 'nameValuePairs', 'attributes', 'current'])) {
                    case 'report':
                        reports = {...reports, [`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]: createReport(reportID)};
                        break;
                    case 'remove': {
                        const {[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]: removedReport, ...remainingReports} = reports ?? {};
                        reports = remainingReports;
                        break;
                    }
                    case 'actions':
                        reportActions = {...reportActions, [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${pick(expenseReportIDs)}`]: createExpenseActions()};
                        break;
                    case 'nameValuePairs':
                        reportNameValuePairs = {
                            ...reportNameValuePairs,
                            [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`]: {private_isArchived: random() < 0.5 ? pick(times) : ''},
                        };
                        break;
                    case 'attributes':
                        reportAttributes = Object.fromEntries(Object.entries(reportAttributes).map(([id, attributes]) => [id, id === reportID ? createAttributes() : {...attributes}]));
                        break;
                    default:
                        currentReportID = pick([...allReportIDs, undefined]);
                        draftComment = pick([undefined, 'draft']);
                }
                const data = {reportNameValuePairs, reportActions, reportAttributes, currentUserLogin: TEST_USER_LOGIN, currentUserAccountID: TEST_USER_ACCOUNT_ID};

                // Then the tracker gives exactly the reports the full check over every report gives
                const expectedReportIDs = UnreadIndicatorUpdater.getUnreadReportsForUnreadIndicator(reports, currentReportID, draftComment, data)
                    .map((report) => report?.reportID)
                    .sort();
                expect(getUnreadReportIDs(reports, currentReportID, draftComment, data)).toEqual(expectedReportIDs);
            }
        });
    });
});
