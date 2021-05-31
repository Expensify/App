import _ from 'underscore';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../src/ONYXKEYS';
import * as Pusher from '../../src/libs/Pusher/pusher';
import PusherConnectionManager from '../../src/libs/PusherConnectionManager';
import CONFIG from '../../src/CONFIG';
import CONST from '../../src/CONST';
import {addAction, togglePinnedState, subscribeToUserEvents} from '../../src/libs/actions/Report';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import PushNotification from '../../src/libs/Notification/PushNotification';
import {signInWithTestUser, fetchPersonalDetailsForTestUser} from '../utils/TestHelper';
import CONST from '../../src/CONST';

PushNotification.register = () => {};
PushNotification.deregister = () => {};

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
    });

    afterEach(() => {
        // Unsubscribe from account channel after each test since we subscribe in the function
        // subscribeToUserEvents and we don't want duplicate event subscriptions.
        Pusher.unsubscribe('private-user-accountID-1');
    });

    it('should store a new report action in Onyx when reportComment event is handled via Pusher', () => {
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
        return signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN)
            .then(() => {
                subscribeToUserEvents();
                return waitForPromisesToResolve();
            })
            .then(() => fetchPersonalDetailsForTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN, {
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
                addAction(REPORT_ID, 'Testing a comment');
                return waitForPromisesToResolve();
            })
            .then(() => {
                const resultAction = _.first(_.values(reportActions));

                // Store the generated clientID so that we can send it with our mock Pusher update
                clientID = resultAction.sequenceNumber;

                expect(resultAction.message).toEqual(REPORT_ACTION.message);
                expect(resultAction.person).toEqual(REPORT_ACTION.person);
                expect(resultAction.loading).toEqual(true);
            })
            .then(() => {
                // We subscribed to the Pusher channel above and now we need to simulate a reportComment action
                // Pusher event so we can verify that action was handled correctly and merged into the reportActions.
                const channel = Pusher.getChannel('private-user-accountID-1');
                channel.emit(Pusher.TYPE.REPORT_COMMENT, {
                    reportID: REPORT_ID,
                    reportAction: {...REPORT_ACTION, clientID},
                });

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
                expect(resultAction.loading).toEqual(false);
            });
    });

    it('should update pins in Onyx when togglePinned event is handled via Pusher', () => {
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
            callback: val => reportIsPinned = val.isPinned,
        });

        // Set up Onyx with some test user data
        return signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN)
            .then(() => {
                subscribeToUserEvents();
                return waitForPromisesToResolve();
            })
            .then(() => {
                togglePinnedState(REPORT);
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Before pusher event gets sent back, test that Onyx immediately updated the report pin state.
                expect(reportIsPinned).toEqual(true);
            })
            .then(() => {
                // We subscribed to the Pusher channel above and now we need to simulate a reportTogglePinned
                // Pusher event so we can verify that pinning was handled correctly and merged into the report.
                const channel = Pusher.getChannel('private-user-accountID-1');
                channel.emit(Pusher.TYPE.REPORT_TOGGLE_PINNED, {
                    reportID: REPORT_ID,
                    isPinned: true,
                });

                // Once an event is emitted to the Pusher channel we should see the report pin get updated
                // by the Pusher callback and added to the storage so we must wait for promises to resolve again and
                // then verify the data is in Onyx.
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Make sure the pin state gets from the Pusher callback into Onyx.
                expect(reportIsPinned).toEqual(true);
            });
    });
});
