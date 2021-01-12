import moment from 'moment';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../src/ONYXKEYS';
import * as Pusher from '../../src/libs/Pusher/pusher';
import PusherConnectionManager from '../../src/libs/PusherConnectionManager';
import CONFIG from '../../src/CONFIG';
import {subscribeToReportCommentEvents} from '../../src/libs/actions/Report';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';

describe('actions/Report', () => {
    it('should store a new report action in Onyx when one is handled via Pusher', () => {
        const REPORT_ID = 1;
        const ACTION_ID = 1;
        const REPORT_ACTION = {
            actionName: 'ADDCOMMENT',
            automatic: false,
            created: 'Nov 6 2020 9:14am PST',
            message: [{type: 'COMMENT', html: 'Testing a comment', text: 'Testing a comment'}],
            person: [{type: 'TEXT', style: 'strong', text: 'Test User'}],
            shouldShow: true,
            timestamp: moment().unix(),
            actorAccountID: 1,
            sequenceNumber: ACTION_ID,
            isAttachment: false,
            loading: false,
        };

        // When using the Pusher mock the act of calling Pusher.isSubscribed will create a
        // channel already in a subscribed state. These methods are normally used to prevent
        // duplicated subscriptions, but we don't need them for this test.
        Pusher.isSubscribed = jest.fn().mockReturnValue(false);
        Pusher.isAlreadySubscribing = jest.fn().mockReturnValue(false);

        // Connect to Pusher
        PusherConnectionManager.init();
        Pusher.init({
            appKey: CONFIG.PUSHER.APP_KEY,
            cluster: CONFIG.PUSHER.CLUSTER,
            authEndpoint: `${CONFIG.EXPENSIFY.URL_API_ROOT}api?command=Push_Authenticate`,
        });

        let reportActions;
        Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
            callback: val => reportActions = val,
        });

        // Set up Onyx with some test user data
        return Onyx.set(ONYXKEYS.SESSION, {accountID: 1, email: 'test@test.com'})
            .then(() => {
                subscribeToReportCommentEvents();
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Now that we are subscribed we need to simulate a reportComment action Pusher event.
                // Then verify that action was handled correctly and merged into the reportActions.
                const channel = Pusher.getChannel('private-user-accountID-1');
                channel.emit('reportComment', {
                    reportID: REPORT_ID,
                    reportAction: REPORT_ACTION,
                });

                // Once this happens we should see the comment get processed by the callback and added to the
                // storage so we must wait for promises to resolve again and then verify the data is in Onyx.
                return waitForPromisesToResolve();
            })
            .then(() => {
                const resultAction = reportActions[ACTION_ID];
                expect(resultAction).toEqual(REPORT_ACTION);
            });
    });
});
