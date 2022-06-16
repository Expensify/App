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
            authEndpoint: `${CONFIG.EXPENSIFY.URL_API_ROOT}api?command=Push_Authenticate`,
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

    it('should store a new report action in Onyx when reportComment event is handled via Pusher', () => {
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
            .then(() => TestHelper.fetchPersonalDetailsForTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN, {
                [TEST_USER_LOGIN]: {
                    accountID: TEST_USER_ACCOUNT_ID,
                    email: TEST_USER_LOGIN,
                    firstName: 'Test',
                    lastName: 'User',
                },
            }))
            .then(() => {
                // This is a fire and forget response, but once it completes we should be able to verify that we
                // have an "optimistic" report action in Onyx.
                Report.addComment(REPORT_ID, 'Testing a comment');
                return waitForPromisesToResolve();
            })
            .then(() => {
                const resultAction = _.first(_.values(reportActions));

                // Store the generated clientID so that we can send it with our mock Pusher update
                clientID = resultAction.sequenceNumber;
                expect(resultAction.message).toEqual(REPORT_ACTION.message);
                expect(resultAction.person).toEqual(REPORT_ACTION.person);
                expect(resultAction.isPending).toEqual(true);

                // We subscribed to the Pusher channel above and now we need to simulate a reportComment action
                // Pusher event so we can verify that action was handled correctly and merged into the reportActions.
                const channel = Pusher.getChannel(`${CONST.PUSHER.PRIVATE_USER_CHANNEL_PREFIX}1${CONFIG.PUSHER.SUFFIX}`);
                channel.emit(Pusher.TYPE.ONYX_API_UPDATE, [
                    {
                        onyxMethod: 'merge',
                        key: `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`,
                        value: {
                            reportID: REPORT_ID,
                            maxSequenceNumber: 1,
                            notificationPreference: 'always',
                            lastMessageTimestamp: 0,
                            lastMessageText: 'Testing a comment',
                            lastActorEmail: TEST_USER_LOGIN,
                        },
                    },
                    {
                        onyxMethod: 'merge',
                        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
                        value: {
                            [clientID]: null,
                            [ACTION_ID]: _.without(resultAction, 'loading'),
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
                expect(resultAction.isPending).not.toBeDefined();
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
            .then(() => TestHelper.fetchPersonalDetailsForTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN, {
                [TEST_USER_LOGIN]: {
                    accountID: TEST_USER_ACCOUNT_ID,
                    email: TEST_USER_LOGIN,
                    firstName: 'Test',
                    lastName: 'User',
                },
            }))
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
});
