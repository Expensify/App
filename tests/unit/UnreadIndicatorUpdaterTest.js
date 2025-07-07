"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention */
var CONST_1 = require("../../src/CONST");
var UnreadIndicatorUpdater = require("../../src/libs/UnreadIndicatorUpdater");
var TestHelper = require("../utils/TestHelper");
var TEST_USER_ACCOUNT_ID = 1;
var TEST_USER_LOGIN = 'test@test.com';
describe('UnreadIndicatorUpdaterTest', function () {
    describe('should return correct number of unread reports', function () {
        it('given last read time < last visible action created', function () {
            var reportsToBeUsed = {
                1: {
                    reportID: '1',
                    reportName: 'test',
                    type: CONST_1.default.REPORT.TYPE.EXPENSE,
                    lastReadTime: '2023-07-08 07:15:44.030',
                    lastVisibleActionCreated: '2023-08-08 07:15:44.030',
                    lastMessageText: 'test',
                },
                2: {
                    reportID: '2',
                    reportName: 'test',
                    type: CONST_1.default.REPORT.TYPE.TASK,
                    lastReadTime: '2023-02-05 09:12:05.000',
                    lastVisibleActionCreated: '2023-02-06 07:15:44.030',
                    lastMessageText: 'test',
                },
                3: { reportID: '3', reportName: 'test', type: CONST_1.default.REPORT.TYPE.TASK, lastMessageText: 'test' },
            };
            TestHelper.setPersonalDetails(TEST_USER_LOGIN, TEST_USER_ACCOUNT_ID).then(function () {
                expect(UnreadIndicatorUpdater.getUnreadReportsForUnreadIndicator(reportsToBeUsed, '3').length).toBe(2);
            });
        });
        it('given some reports are incomplete', function () {
            var reportsToBeUsed = {
                1: { reportID: '1', type: CONST_1.default.REPORT.TYPE.EXPENSE, lastReadTime: '2023-07-08 07:15:44.030', lastVisibleActionCreated: '2023-08-08 07:15:44.030' },
                2: { reportID: '2', type: CONST_1.default.REPORT.TYPE.TASK, lastReadTime: '2023-02-05 09:12:05.000', lastVisibleActionCreated: '2023-02-06 07:15:44.030' },
                3: { reportID: '3', type: CONST_1.default.REPORT.TYPE.TASK },
            };
            expect(UnreadIndicatorUpdater.getUnreadReportsForUnreadIndicator(reportsToBeUsed, '3').length).toBe(0);
        });
        it('given notification preference of some reports is hidden', function () {
            var _a;
            var reportsToBeUsed = {
                1: {
                    reportID: '1',
                    reportName: 'test',
                    type: CONST_1.default.REPORT.TYPE.EXPENSE,
                    participants: (_a = {},
                        _a[TEST_USER_ACCOUNT_ID] = {
                            notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                        },
                        _a),
                    lastReadTime: '2023-07-08 07:15:44.030',
                    lastVisibleActionCreated: '2023-08-08 07:15:44.030',
                    lastMessageText: 'test',
                },
                2: {
                    reportID: '2',
                    reportName: 'test',
                    type: CONST_1.default.REPORT.TYPE.TASK,
                    lastReadTime: '2023-02-05 09:12:05.000',
                    lastVisibleActionCreated: '2023-02-06 07:15:44.030',
                    lastMessageText: 'test',
                },
                3: { reportID: '3', reportName: 'test', type: CONST_1.default.REPORT.TYPE.TASK, lastMessageText: 'test' },
            };
            TestHelper.setPersonalDetails(TEST_USER_LOGIN, TEST_USER_ACCOUNT_ID).then(function () {
                expect(UnreadIndicatorUpdater.getUnreadReportsForUnreadIndicator(reportsToBeUsed, '3').length).toBe(1);
            });
        });
    });
});
