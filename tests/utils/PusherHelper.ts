import type {OnyxKey} from 'react-native-onyx';
import Pusher from '@libs/Pusher';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import PusherConnectionManager from '@src/libs/PusherConnectionManager';
import type {AnyOnyxServerUpdate, OnyxServerUpdate} from '@src/types/onyx/OnyxUpdatesFromServer';

const CHANNEL_NAME = `${CONST.PUSHER.PRIVATE_USER_CHANNEL_PREFIX}1${CONFIG.PUSHER.SUFFIX}`;

function setup() {
    // When using the Pusher mock the act of calling Pusher.isSubscribed will create a
    // channel already in a subscribed state. These methods are normally used to prevent
    // duplicated subscriptions, but we don't need them for this test so forcing them to
    // return false will make the testing less complex.
    jest.spyOn(Pusher, 'isSubscribed').mockReturnValue(false);
    jest.spyOn(Pusher, 'isAlreadySubscribing').mockReturnValue(false);

    // Connect to Pusher
    PusherConnectionManager.init();
    Pusher.init({
        appKey: CONFIG.PUSHER.APP_KEY,
        cluster: CONFIG.PUSHER.CLUSTER,
        authEndpoint: `${CONFIG.EXPENSIFY.DEFAULT_API_ROOT}api/AuthenticatePusher?`,
    });

    const pusher = window.getPusherInstance();
    if (pusher && 'connection' in pusher) {
        pusher.connection?.emit('connected');
    }
}

function emitOnyxUpdate<TKey extends OnyxKey>(args: Array<OnyxServerUpdate<TKey>>) {
    Pusher.sendEvent(CHANNEL_NAME, Pusher.TYPE.MULTIPLE_EVENTS, {
        type: 'pusher',
        lastUpdateID: 0,
        previousUpdateID: 0,
        updates: [
            {
                eventType: Pusher.TYPE.MULTIPLE_EVENT_TYPE.ONYX_API_UPDATE,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data: args as AnyOnyxServerUpdate[],
            },
        ],
    });
}

function teardown() {
    // Unsubscribe from account channel after each test since we subscribe in the function
    // subscribeToUserEvents and we don't want duplicate event subscriptions.
    Pusher.unsubscribe(CHANNEL_NAME);
}

export default {
    setup,
    emitOnyxUpdate,
    teardown,
};
