import moment from 'moment';
import Onyx from 'react-native-onyx';
import AsyncStorage from '@react-native-community/async-storage';
import ONYXKEYS from '../../src/ONYXKEYS';
import * as Pusher from '../../src/libs/Pusher/pusher';
import PusherConnectionManager from '../../src/libs/PusherConnectionManager';
import CONFIG from '../../src/CONFIG';
import {subscribeToReportCommentEvents} from '../../src/libs/actions/Report';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';

// This step just sets up Onyx for testing.
Onyx.registerLogger(() => {});
Onyx.init({
    keys: ONYXKEYS,
    registerStorageEventListener: () => {},
});

describe('actions/Report', () => {
    it('should subscribe to the private-user-accountID channel and handle reportComment events', () => {
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

        // Connect to Pusher
        PusherConnectionManager.init();
        Pusher.init({
            appKey: CONFIG.PUSHER.APP_KEY,
            cluster: CONFIG.PUSHER.CLUSTER,
            authEndpoint: `${CONFIG.EXPENSIFY.URL_API_ROOT}api?command=Push_Authenticate`,
        });

        // Set up Onyx with some test user data
        Onyx.set(ONYXKEYS.SESSION, {accountID: 1, email: 'test@test.com'});
        return waitForPromisesToResolve()
            .then(() => {
                subscribeToReportCommentEvents();
                return waitForPromisesToResolve();
            })
            .then(() => {
                const PRIVATE_USER_CHANNEL = 'private-user-accountID-1';
                const isSubscribedToPrivateChannel = Pusher.isSubscribed(PRIVATE_USER_CHANNEL);
                expect(isSubscribedToPrivateChannel).toBe(true);

                // Now that we are subscribed we need to simulate a reportComment action Pusher event.
                // Then verify that action was handled correctly and merged into the reportActions.
                const channel = Pusher.getChannel(PRIVATE_USER_CHANNEL);
                channel.emit('reportComment', {
                    reportID: REPORT_ID,
                    reportAction: REPORT_ACTION,
                });

                // Once this happens we should see the comment get processed by the callback so we must wait for
                // for promises to resolve again/
                return waitForPromisesToResolve();
            })
            .then(() => (

                // The only thing left to do is check the report actions and verify the comment has been merged into
                // the store. Onyx does not have a getter method so we will ask AsyncStorage directly.
                AsyncStorage.getItem(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`)
            ))
            .then((reportActionData) => {
                const data = JSON.parse(reportActionData);
                const resultAction = data[ACTION_ID];
                expect(resultAction).toEqual(REPORT_ACTION);
            });
    });
});
