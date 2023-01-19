import _ from 'underscore';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import moment from 'moment';
import {
    beforeEach, beforeAll, afterEach, describe, it, expect,
} from '@jest/globals';
import ONYXKEYS from '../../src/ONYXKEYS';
import * as Pusher from '../../src/libs/Pusher/pusher';
import PusherConnectionManager from '../../src/libs/PusherConnectionManager';
import CONFIG from '../../src/CONFIG';
import CONST from '../../src/CONST';
import * as Report from '../../src/libs/actions/Report';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import * as TestHelper from '../utils/TestHelper';
import Log from '../../src/libs/Log';
import * as PersistedRequests from '../../src/libs/actions/PersistedRequests';
import * as User from '../../src/libs/actions/User';
import * as ReportUtils from '../../src/libs/ReportUtils';
import DateUtils from '../../src/libs/DateUtils';

jest.mock('../../src/libs/actions/Report', () => {
    const originalModule = jest.requireActual('../../src/libs/actions/Report');

    return {
        ...originalModule,
        showReportActionNotification: jest.fn(),
    };
});

describe('actions/Report', () => {
    beforeAll(() => {
        // When using the Pusher mock the act of calling Pusher.isSubscribed will create a
        // channel already in a subscribed state. These methods are normally used to prevent
        // duplicated subscriptions, but we don't need them for this test so forcing them to
        // return false will make the testing less complex.
        Pusher.isSubscribed = jest.fn().mockReturnValue(false);
        Pusher.isAlreadySubscribing = jest.fn().mockReturnValue(false);

        // Connect to Pusher
        PusherConnectionManager.init();
        Pusher.init({
            appKey: CONFIG.PUSHER.APP_KEY,
            cluster: CONFIG.PUSHER.CLUSTER,
            authEndpoint: `${CONFIG.EXPENSIFY.URL_API_ROOT}api?command=AuthenticatePusher`,
        });

        Onyx.init({
            keys: ONYXKEYS,
            registerStorageEventListener: () => {},
        });
    });

    beforeEach(() => Onyx.clear().then(waitForPromisesToResolve));

    afterEach(() => {
        // Unsubscribe from account channel after each test since we subscribe in the function
        // subscribeToUserEvents and we don't want duplicate event subscriptions.
        Pusher.unsubscribe(`${CONST.PUSHER.PRIVATE_USER_CHANNEL_PREFIX}1${CONFIG.PUSHER.SUFFIX}`);
    });

    it('should store a new report action in Onyx when onyxApiUpdate event is handled via Pusher', () => {
        global.fetch = TestHelper.getGlobalFetchMock();

        const TEST_USER_ACCOUNT_ID = 1;
        const TEST_USER_LOGIN = 'test@test.com';
        const REPORT_ID = 1;
        const ACTION_ID = 1;
        const REPORT_ACTION = {
            actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
            actorAccountID: TEST_USER_ACCOUNT_ID,
            actorEmail: TEST_USER_LOGIN,
            automatic: false,
            avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
            message: [{type: 'COMMENT', html: 'Testing a comment', text: 'Testing a comment'}],
            person: [{type: 'TEXT', style: 'strong', text: 'Test User'}],
            sequenceNumber: ACTION_ID,
            shouldShow: true,
        };

        let reportActions;
        Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
            callback: val => reportActions = val,
        });

        let clientID;

        // Set up Onyx with some test user data
        return TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN)
            .then(() => {
                User.subscribeToUserEvents();
                return waitForPromisesToResolve();
            })
            .then(() => TestHelper.setPersonalDetails(TEST_USER_LOGIN, TEST_USER_ACCOUNT_ID))
            .then(() => {
                // This is a fire and forget response, but once it completes we should be able to verify that we
                // have an "optimistic" report action in Onyx.
                Report.addComment(REPORT_ID, 'Testing a comment');
                return waitForPromisesToResolve();
            })
            .then(() => {
                const resultAction = _.first(_.values(reportActions));

                // Store the generated clientID so that we can send it with our mock Pusher update
                clientID = resultAction.clientID;
                expect(resultAction.message).toEqual(REPORT_ACTION.message);
                expect(resultAction.person).toEqual(REPORT_ACTION.person);
                expect(resultAction.pendingAction).toEqual(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                // We subscribed to the Pusher channel above and now we need to simulate a reportComment action
                // Pusher event so we can verify that action was handled correctly and merged into the reportActions.
                const channel = Pusher.getChannel(`${CONST.PUSHER.PRIVATE_USER_CHANNEL_PREFIX}1${CONFIG.PUSHER.SUFFIX}`);
                const actionWithoutLoading = {...resultAction};
                delete actionWithoutLoading.pendingAction;
                channel.emit(Pusher.TYPE.ONYX_API_UPDATE, [
                    {
                        onyxMethod: CONST.ONYX.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`,
                        value: {
                            reportID: REPORT_ID,
                            maxSequenceNumber: 1,
                            notificationPreference: 'always',
                            lastActionCreated: '2022-11-22 03:48:27.267',
                            lastMessageText: 'Testing a comment',
                            lastActorEmail: TEST_USER_LOGIN,
                        },
                    },
                    {
                        onyxMethod: CONST.ONYX.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
                        value: {
                            [clientID]: null,
                            [ACTION_ID]: actionWithoutLoading,
                        },
                    },
                ]);

                // Once a reportComment event is emitted to the Pusher channel we should see the comment get processed
                // by the Pusher callback and added to the storage so we must wait for promises to resolve again and
                // then verify the data is in Onyx.
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Verify there is only one action and our optimistic comment has been removed
                expect(_.size(reportActions)).toBe(1);

                const resultAction = reportActions[ACTION_ID];

                // Verify that our action is no longer in the loading state
                expect(resultAction.pendingAction).not.toBeDefined();
            });
    });

    it('should update pins in Onyx when togglePinned is called', () => {
        const TEST_USER_ACCOUNT_ID = 1;
        const TEST_USER_LOGIN = 'test@test.com';
        const REPORT_ID = 1;
        const REPORT = {
            reportID: REPORT_ID,
            isPinned: false,
        };

        let reportIsPinned;
        Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`,
            callback: val => reportIsPinned = lodashGet(val, 'isPinned'),
        });

        // Set up Onyx with some test user data
        return TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN)
            .then(() => {
                Report.togglePinnedState(REPORT);
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Test that Onyx immediately updated the report pin state.
                expect(reportIsPinned).toEqual(true);
            });
    });

    it('Should not leave duplicate comments when logger sends packet because of calling process queue while processing the queue', () => {
        const TEST_USER_ACCOUNT_ID = 1;
        const TEST_USER_LOGIN = 'test@test.com';
        const REPORT_ID = 1;
        const LOGGER_MAX_LOG_LINES = 50;

        // GIVEN a test user with initial data
        return TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN)
            .then(() => TestHelper.setPersonalDetails(TEST_USER_LOGIN, TEST_USER_ACCOUNT_ID))
            .then(() => {
                global.fetch = TestHelper.getGlobalFetchMock();

                // WHEN we add enough logs to send a packet
                for (let i = 0; i <= LOGGER_MAX_LOG_LINES; i++) {
                    Log.info('Test log info');
                }

                // And leave a comment on a report
                Report.addComment(REPORT_ID, 'Testing a comment');

                // Then we should expect that there is on persisted request
                expect(PersistedRequests.getAll().length).toBe(1);

                // When we wait for the queue to run
                return waitForPromisesToResolve();
            })
            .then(() => {
                // THEN only ONE call to AddComment will happen
                const URL_ARGUMENT_INDEX = 0;
                const addCommentCalls = _.filter(global.fetch.mock.calls, callArguments => callArguments[URL_ARGUMENT_INDEX].includes('AddComment'));
                expect(addCommentCalls.length).toBe(1);
            });
    });

    it('should be updated correctly when new comments are added, deleted or marked as unread', () => {
        const REPORT_ID = 1;
        let report;
        let reportActionCreatedDate;
        let currentTime;
        Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`,
            callback: val => report = val,
        });

        let reportActions;
        Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
            callback: val => reportActions = val,
        });

        const USER_1_LOGIN = 'user@test.com';
        const USER_1_ACCOUNT_ID = 1;
        const USER_2_LOGIN = 'different-user@test.com';
        const USER_2_ACCOUNT_ID = 2;
        const channel = Pusher.getChannel(`${CONST.PUSHER.PRIVATE_USER_CHANNEL_PREFIX}${USER_1_ACCOUNT_ID}${CONFIG.PUSHER.SUFFIX}`);
        return Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportName: 'Test', reportID: REPORT_ID})
            .then(() => TestHelper.signInWithTestUser(USER_1_ACCOUNT_ID, USER_1_LOGIN))
            .then(() => {
                // Given a test user that is subscribed to Pusher events
                User.subscribeToUserEvents();
                return waitForPromisesToResolve();
            })
            .then(() => TestHelper.setPersonalDetails(USER_1_LOGIN, USER_1_ACCOUNT_ID))
            .then(() => {
                // When a Pusher event is handled for a new report comment
                reportActionCreatedDate = DateUtils.getDBTime();
                channel.emit(Pusher.TYPE.ONYX_API_UPDATE, [
                    {
                        onyxMethod: CONST.ONYX.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`,
                        value: {
                            reportID: REPORT_ID,
                            maxSequenceNumber: 1,
                            notificationPreference: 'always',
                            lastMessageText: 'Comment 1',
                            lastActorEmail: USER_2_LOGIN,
                            lastReadSequenceNumber: 0,
                            lastActionCreated: reportActionCreatedDate,
                            lastReadTime: DateUtils.subtractMillisecondsFromDateTime(reportActionCreatedDate, 1),
                        },
                    },
                    {
                        onyxMethod: CONST.ONYX.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
                        value: {
                            1: {
                                actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                                actorAccountID: USER_2_ACCOUNT_ID,
                                actorEmail: USER_2_LOGIN,
                                automatic: false,
                                avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
                                message: [{type: 'COMMENT', html: 'Comment 1', text: 'Comment 1'}],
                                person: [{type: 'TEXT', style: 'strong', text: 'Test User'}],
                                sequenceNumber: 1,
                                shouldShow: true,
                                created: reportActionCreatedDate,
                                reportActionID: '1',
                            },
                        },
                    },
                ]);
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Then the report will be unread
                expect(ReportUtils.isUnread(report)).toBe(true);

                // When the user visits the report
                currentTime = DateUtils.getDBTime();
                Report.openReport(REPORT_ID);
                return waitForPromisesToResolve();
            })
            .then(() => {
                // The report will be read
                expect(ReportUtils.isUnread(report)).toBe(false);
                expect(moment.utc(report.lastReadTime).valueOf()).toBeGreaterThanOrEqual(moment.utc(currentTime).valueOf());

                // When the user manually marks a message as "unread"
                Report.markCommentAsUnread(REPORT_ID, reportActionCreatedDate);
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Then the report will be unread
                expect(ReportUtils.isUnread(report)).toBe(true);
                expect(report.lastReadTime).toBe(DateUtils.subtractMillisecondsFromDateTime(reportActionCreatedDate, 1));

                // When a new comment is added by the current user
                currentTime = DateUtils.getDBTime();
                Report.addComment(REPORT_ID, 'Current User Comment 1');
                return waitForPromisesToResolve();
            })
            .then(() => {
                // The report will be read and the lastReadTime updated
                expect(ReportUtils.isUnread(report)).toBe(false);
                expect(moment.utc(report.lastReadTime).valueOf()).toBeGreaterThanOrEqual(moment.utc(currentTime).valueOf());
                expect(report.lastMessageText).toBe('Current User Comment 1');

                // When another comment is added by the current user
                currentTime = DateUtils.getDBTime();
                Report.addComment(REPORT_ID, 'Current User Comment 2');
                return waitForPromisesToResolve();
            })
            .then(() => {
                // The report will be read and the lastReadTime updated
                expect(ReportUtils.isUnread(report)).toBe(false);
                expect(moment.utc(report.lastReadTime).valueOf()).toBeGreaterThanOrEqual(moment.utc(currentTime).valueOf());
                expect(report.lastMessageText).toBe('Current User Comment 2');

                // When another comment is added by the current user
                currentTime = DateUtils.getDBTime();
                Report.addComment(REPORT_ID, 'Current User Comment 3');
                return waitForPromisesToResolve();
            })
            .then(() => {
                // The report will be read and the lastReadTime updated
                expect(ReportUtils.isUnread(report)).toBe(false);
                expect(moment.utc(report.lastReadTime).valueOf()).toBeGreaterThanOrEqual(moment.utc(currentTime).valueOf());
                expect(report.lastMessageText).toBe('Current User Comment 3');

                const USER_1_BASE_ACTION = {
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    actorAccountID: USER_1_ACCOUNT_ID,
                    actorEmail: USER_1_LOGIN,
                    automatic: false,
                    avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
                    person: [{type: 'TEXT', style: 'strong', text: 'Test User'}],
                    shouldShow: true,
                    created: DateUtils.getDBTime(Date.now() - 3),
                    reportActionID: 'derp1',
                };

                const optimisticReportActions = {
                    onyxMethod: CONST.ONYX.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
                    value: {
                        [_.toArray(reportActions)[1].clientID]: null,
                        [_.toArray(reportActions)[2].clientID]: null,
                        [_.toArray(reportActions)[3].clientID]: null,
                        2: {
                            ...USER_1_BASE_ACTION,
                            message: [{type: 'COMMENT', html: 'Current User Comment 1', text: 'Current User Comment 1'}],
                            created: DateUtils.getDBTime(Date.now() - 2),
                            sequenceNumber: 2,
                            reportActionID: 'derp2',
                        },
                        3: {
                            ...USER_1_BASE_ACTION,
                            message: [{type: 'COMMENT', html: 'Current User Comment 2', text: 'Current User Comment 2'}],
                            created: DateUtils.getDBTime(Date.now() - 1),
                            sequenceNumber: 3,
                            reportActionID: 'derp3',
                        },
                        4: {
                            ...USER_1_BASE_ACTION,
                            message: [{type: 'COMMENT', html: 'Current User Comment 3', text: 'Current User Comment 3'}],
                            created: DateUtils.getDBTime(),
                            sequenceNumber: 4,
                            reportActionID: 'derp4',
                        },
                    },
                };
                reportActionCreatedDate = DateUtils.getDBTime();
                optimisticReportActions.value[4].created = reportActionCreatedDate;

                // When we emit the events for these pending created actions to update them to not pending
                channel.emit(Pusher.TYPE.ONYX_API_UPDATE, [
                    {
                        onyxMethod: CONST.ONYX.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`,
                        value: {
                            reportID: REPORT_ID,
                            maxSequenceNumber: 4,
                            notificationPreference: 'always',
                            lastMessageText: 'Current User Comment 3',
                            lastActorEmail: 'test@test.com',
                            lastReadSequenceNumber: 4,
                            lastActionCreated: reportActionCreatedDate,
                            lastReadTime: reportActionCreatedDate,
                        },
                    },
                    optimisticReportActions,
                ]);

                return waitForPromisesToResolve();
            })
            .then(() => {
                // If the user deletes a comment that is before the last read
                Report.deleteReportComment(REPORT_ID, {...reportActions[2], sequenceNumber: 2, clientID: null});
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Then no change will occur
                expect(report.lastReadTime).toBe(reportActionCreatedDate);
                expect(ReportUtils.isUnread(report)).toBe(false);

                // When the user manually marks a message as "unread"
                Report.markCommentAsUnread(REPORT_ID, reportActionCreatedDate);
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Then we should expect the report to be to be unread
                expect(ReportUtils.isUnread(report)).toBe(true);
                expect(report.lastReadTime).toBe(DateUtils.subtractMillisecondsFromDateTime(reportActionCreatedDate, 1));

                // If the user deletes the last comment after the lastReadTime the lastMessageText will reflect the new last comment
                Report.deleteReportComment(REPORT_ID, {...reportActions[4], sequenceNumber: 4, clientID: null});
                return waitForPromisesToResolve();
            })
            .then(() => {
                expect(ReportUtils.isUnread(report)).toBe(false);
                expect(report.lastMessageText).toBe('Current User Comment 2');
            });
    });

    it('Should properly update comment with links', () => {
        /* This tests a variety of scenarios when a user edits a comment.
         * We should generate a link when editing a message unless the link was
         * already in the comment and the user deleted it on purpose.
         */

        // User edits comment to add link
        // We should generate link
        let originalCommentHTML = 'Original Comment';
        let afterEditCommentText = 'Original Comment www.google.com';
        let newCommentMarkdown = Report.handleUserDeletedLinks(afterEditCommentText, originalCommentHTML);
        let expectedOutput = 'Original Comment [www.google.com](https://www.google.com)';
        expect(newCommentMarkdown).toBe(expectedOutput);

        // User deletes www.google.com link from comment but keeps link text
        // We should not generate link
        originalCommentHTML = 'Comment <a href="https://www.google.com" target="_blank">www.google.com</a>';
        afterEditCommentText = 'Comment www.google.com';
        newCommentMarkdown = Report.handleUserDeletedLinks(afterEditCommentText, originalCommentHTML);
        expectedOutput = 'Comment www.google.com';
        expect(newCommentMarkdown).toBe(expectedOutput);

        // User Delete only () part of link but leaves the []
        // We should not generate link
        originalCommentHTML = 'Comment <a href="https://www.google.com" target="_blank">www.google.com</a>';
        afterEditCommentText = 'Comment [www.google.com]';
        newCommentMarkdown = Report.handleUserDeletedLinks(afterEditCommentText, originalCommentHTML);
        expectedOutput = 'Comment [www.google.com]';
        expect(newCommentMarkdown).toBe(expectedOutput);

        // User Generates multiple links in one edit
        // We should generate both links
        originalCommentHTML = 'Comment';
        afterEditCommentText = 'Comment www.google.com www.facebook.com';
        newCommentMarkdown = Report.handleUserDeletedLinks(afterEditCommentText, originalCommentHTML);
        expectedOutput = 'Comment [www.google.com](https://www.google.com) [www.facebook.com](https://www.facebook.com)';
        expect(newCommentMarkdown).toBe(expectedOutput);

        // Comment has two links but user deletes only one of them
        // Should not generate link again for the deleted one
        originalCommentHTML = 'Comment <a href="https://www.google.com" target="_blank">www.google.com</a>  <a href="https://www.facebook.com" target="_blank">www.facebook.com</a>';
        afterEditCommentText = 'Comment www.google.com  [www.facebook.com](https://www.facebook.com)';
        newCommentMarkdown = Report.handleUserDeletedLinks(afterEditCommentText, originalCommentHTML);
        expectedOutput = 'Comment www.google.com  [www.facebook.com](https://www.facebook.com)';
        expect(newCommentMarkdown).toBe(expectedOutput);
    });

    it('should show a notification for report action updates with shouldNotify', () => {
        const TEST_USER_ACCOUNT_ID = 1;
        const REPORT_ID = 1;
        const REPORT_ACTION = {};

        // Setup user and pusher listeners
        return TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID)
            .then(() => {
                User.subscribeToUserEvents();
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Simulate a Pusher Onyx update with a report action with shouldNotify
                const channel = Pusher.getChannel(`${CONST.PUSHER.PRIVATE_USER_CHANNEL_PREFIX}${TEST_USER_ACCOUNT_ID}${CONFIG.PUSHER.SUFFIX}`);
                channel.emit(Pusher.TYPE.ONYX_API_UPDATE, [
                    {
                        onyxMethod: CONST.ONYX.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
                        value: {
                            1: REPORT_ACTION,
                        },
                        shouldNotify: true,
                    },
                ]);
                return waitForPromisesToResolve();
            }).then(() => {
                // Ensure we show a notification for this new report action
                expect(Report.showReportActionNotification).toBeCalledWith(String(REPORT_ID), REPORT_ACTION);
            });
    });
});
