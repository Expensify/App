import _ from 'underscore';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import {
    beforeEach, beforeAll, afterEach, jest, describe, it, expect,
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
        let reportActionCreated;
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
                reportActionCreated = DateUtils.getDBTime();
                channel.emit(Pusher.TYPE.ONYX_API_UPDATE, [
                    {
                        onyxMethod: CONST.ONYX.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`,
                        value: {
                            reportID: REPORT_ID,
                            maxSequenceNumber: 1,
                            notificationPreference: 'always',
                            lastActionCreated: '2022-11-22 03:48:27.267',
                            lastMessageText: 'Comment 1',
                            lastActorEmail: USER_2_LOGIN,
                            lastReadSequenceNumber: 0,
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
                                created: reportActionCreated,
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
                Report.openReport(REPORT_ID);
                return waitForPromisesToResolve();
            })
            .then(() => {
                // The report will be read
                expect(ReportUtils.isUnread(report)).toBe(false);

                // When the user manually marks a message as "unread"
                Report.markCommentAsUnread(REPORT_ID, reportActionCreated, 1);
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Then the report will be unread
                expect(ReportUtils.isUnread(report)).toBe(true);

                // When a new comment is added by the current user
                Report.addComment(REPORT_ID, 'Current User Comment 1');
                return waitForPromisesToResolve();
            })
            .then(() => {
                // The report will be read and the lastReadSequenceNumber incremented
                expect(ReportUtils.isUnread(report)).toBe(false);
                expect(report.lastReadSequenceNumber).toBe(2);
                expect(report.lastMessageText).toBe('Current User Comment 1');

                // When another comment is added by the current user
                Report.addComment(REPORT_ID, 'Current User Comment 2');
                return waitForPromisesToResolve();
            })
            .then(() => {
                // The report will be read and the lastReadSequenceNumber incremented
                expect(ReportUtils.isUnread(report)).toBe(false);
                expect(report.lastReadSequenceNumber).toBe(3);
                expect(report.lastMessageText).toBe('Current User Comment 2');

                // When another comment is added by the current user
                Report.addComment(REPORT_ID, 'Current User Comment 3');
                return waitForPromisesToResolve();
            })
            .then(() => {
                // The report will be read and the lastReadSequenceNumber incremented
                expect(ReportUtils.isUnread(report)).toBe(false);
                expect(report.lastReadSequenceNumber).toBe(4);
                expect(report.lastMessageText).toBe('Current User Comment 3');

                const USER_1_BASE_ACTION = {
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    actorAccountID: USER_1_ACCOUNT_ID,
                    actorEmail: USER_1_LOGIN,
                    automatic: false,
                    avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
                    person: [{type: 'TEXT', style: 'strong', text: 'Test User'}],
                    shouldShow: true,
                    created: DateUtils.getDBTime(),
                    reportActionID: 'derp',
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
                            created: DateUtils.getDBTime(),
                            sequenceNumber: 2,
                        },
                        3: {
                            ...USER_1_BASE_ACTION,
                            message: [{type: 'COMMENT', html: 'Current User Comment 2', text: 'Current User Comment 2'}],
                            created: DateUtils.getDBTime(),
                            sequenceNumber: 3,
                        },
                        4: {
                            ...USER_1_BASE_ACTION,
                            message: [{type: 'COMMENT', html: 'Current User Comment 3', text: 'Current User Comment 3'}],
                            created: DateUtils.getDBTime(),
                            sequenceNumber: 4,
                        },
                    },
                };
                reportActionCreated = DateUtils.getDBTime();
                optimisticReportActions.value[4].created = reportActionCreated;

                // When we emit the events for these pending created actions to update them to not pending
                channel.emit(Pusher.TYPE.ONYX_API_UPDATE, [
                    {
                        onyxMethod: CONST.ONYX.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`,
                        value: {
                            reportID: REPORT_ID,
                            maxSequenceNumber: 4,
                            notificationPreference: 'always',
                            lastActionCreated: '2022-11-22 03:48:27.267',
                            lastMessageText: 'Current User Comment 3',
                            lastActorEmail: 'test@test.com',
                            lastReadSequenceNumber: 4,
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
                expect(report.lastReadSequenceNumber).toBe(4);
                expect(ReportUtils.isUnread(report)).toBe(false);

                // When the user manually marks a message as "unread"
                Report.markCommentAsUnread(REPORT_ID, reportActionCreated, 3);
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Then we should expect the report to be to be unread
                expect(ReportUtils.isUnread(report)).toBe(true);
                expect(report.lastReadSequenceNumber).toBe(2);

                // If the user deletes the last comment after the last read the lastMessageText will reflect the new last comment
                Report.deleteReportComment(REPORT_ID, {...reportActions[4], sequenceNumber: 4, clientID: null});
                return waitForPromisesToResolve();
            })
            .then(() => {
                expect(ReportUtils.isUnread(report)).toBe(false);
                expect(report.lastMessageText).toBe('Current User Comment 2');
            });
    });
});
