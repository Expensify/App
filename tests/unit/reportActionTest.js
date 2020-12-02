import moment from 'moment';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../src/ONYXKEYS';
import {addAction, subscribeToReportCommentEvents} from '../../src/libs/actions/Report';
import * as Pusher from '../../src/libs/Pusher/pusher';
import PusherConnectionManager from '../../src/libs/PusherConnectionManager';
import CONFIG from '../../src/CONFIG';

const resolveAllPromises = () => new Promise(setImmediate);

Onyx.registerLogger(() => {});
Onyx.init({
    keys: ONYXKEYS,
    registerStorageEventListener: () => {},
});

jest.mock('../../node_modules/urbanairship-react-native', () => {
    const airshipMock = require('./mocks/urbanairship-react-native');
    airshipMock.EventType = {
        PushReceived: 'pushReceived',
    };
    return airshipMock;
});

jest.mock('../../node_modules/@react-native-community/async-storage', () => (
    require('./mocks/@react-native-community/async-storage')
));

// jest.mock('../../src/libs/Network', () => {
//     return {
//         post: () => {},
//         registerParameterEnhancer: (params) => {
//             return params;
//         },
//     };
// });

jest.mock('../../node_modules/@react-native-community/push-notification-ios', () => (
    require('./mocks/@react-native-community/push-notification-ios')
));

jest.mock('pusher-js/react-native', () => (
    require('pusher-js-mock').PusherMock
));

jest.mock('../../node_modules/react-native-config', () => (
    require('./mocks/react-native-config')
));

jest.mock('../../node_modules/@react-native-community/netinfo', () => (
    require('./mocks/@react-native-community/netinfo')
));

describe('Report Action', () => {
    it('should subscribe to the private-user-accountID channel', async (done) => {
        const reportID = 1;
        const CREATED_ACTION = {
            actionName: 'CREATED',
            automatic: false,
            created: 'Oct 28 2020 4:29pm PDT',
            message: [
                {type: 'TEXT', style: 'strong', text: '__fake__'},
                {type: 'TEXT', style: 'normal', text: ' created this report'},
            ],
            person: [{type: 'TEXT', style: 'strong', text: '__fake__'}],
            sequenceNumber: 0,
            shouldShow: true,
            timestamp: 1604682894,
        };

        const mockOnyxCallback = jest.fn();

        PusherConnectionManager.init();
        Pusher.init({
            appKey: CONFIG.PUSHER.APP_KEY,
            cluster: CONFIG.PUSHER.CLUSTER,
            authEndpoint: `${CONFIG.EXPENSIFY.URL_API_ROOT}api?command=Push_Authenticate`,
        });

        // Set up fake accountID, email, and reportActions key
        await Onyx.set(ONYXKEYS.SESSION, {accountID: 1, email: 'test@test.com'});
        await Onyx.set(ONYXKEYS.MY_PERSONAL_DETAILS, {});

        // Simulate fetching a brand new report and actions
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
            reportID,
            reportName: 'Test User',
        });

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
            [CREATED_ACTION.sequenceNumber]: CREATED_ACTION,
        });

        Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            initWithStoredValues: false,
            callback: (val) => {
                try {
                    mockOnyxCallback(val);

                    // Verify that the optimistic comment has a loading state
                    if (mockOnyxCallback.mock.calls.length === 1) {
                        expect(val[0]).toStrictEqual(CREATED_ACTION);
                        expect(val[1]).toBeTruthy();
                        expect(val[1].loading).toBe(true);
                        return;
                    }

                    // Verify the loading state is now false
                    expect(val[1].loading).toBe(false);
                    done();
                } catch (err) {
                    done(err);
                }
            },
        });

        subscribeToReportCommentEvents();
        const PRIVATE_USER_CHANNEL = 'private-user-accountID-1';
        const isSubscribedToPrivateChannel = Pusher.isSubscribed(PRIVATE_USER_CHANNEL);
        expect(isSubscribedToPrivateChannel).toBe(true);

        // Add an action
        addAction(reportID, 'Testing a comment');

        // We have to resolve all the promises here otherwise we will end up
        // handling the mock pusher payload before the optimistic comment set in
        // addAction()
        await resolveAllPromises();

        // Simulate handling the comment push event from the server
        const testReportCommentPusherPayload = {
            reportID,
            reportAction: {
                actionName: 'ADDCOMMENT',
                automatic: false,
                created: 'Nov 6 2020 9:14am PST',
                message: [{type: 'COMMENT', html: 'Testing a comment', text: 'Testing a comment'}],
                person: [{type: 'TEXT', style: 'strong', text: 'Test User'}],
                shouldShow: true,
                timestamp: moment().unix(),
                actorAccountID: 1,
                sequenceNumber: 1,
            },
        };

        const channel = Pusher.getChannel(PRIVATE_USER_CHANNEL);
        channel.emit('reportComment', testReportCommentPusherPayload);
    });
});
