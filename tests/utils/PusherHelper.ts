import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import * as Pusher from '@src/libs/Pusher/pusher';
import PusherConnectionManager from '@src/libs/PusherConnectionManager';
import type {OnyxServerUpdate} from '@src/types/onyx/OnyxUpdatesFromServer';
import asMutable from '@src/types/utils/asMutable';

const CHANNEL_NAME = `${CONST.PUSHER.PRIVATE_USER_CHANNEL_PREFIX}1${CONFIG.PUSHER.SUFFIX}`;

function setup() {
    // When using the Pusher mock the act of calling Pusher.isSubscribed will create a
    // channel already in a subscribed state. These methods are normally used to prevent
    // duplicated subscriptions, but we don't need them for this test so forcing them to
    // return false will make the testing less complex.
    asMutable(Pusher).isSubscribed = jest.fn().mockReturnValue(false);
    asMutable(Pusher).isAlreadySubscribing = jest.fn().mockReturnValue(false);

    // Connect to Pusher
    PusherConnectionManager.init();
    Pusher.init({
        appKey: CONFIG.PUSHER.APP_KEY,
        cluster: CONFIG.PUSHER.CLUSTER,
        authEndpoint: `${CONFIG.EXPENSIFY.DEFAULT_API_ROOT}api/AuthenticatePusher?`,
    });

    window.getPusherInstance()?.connection.emit('connected');
}

function emitOnyxUpdate(args: OnyxServerUpdate[]) {
    const channel = Pusher.getChannel(CHANNEL_NAME);
    channel?.emit(Pusher.TYPE.MULTIPLE_EVENTS, {
        type: 'pusher',
        lastUpdateID: null,
        previousUpdateID: null,
        updates: [
            {
                eventType: Pusher.TYPE.MULTIPLE_EVENT_TYPE.ONYX_API_UPDATE,
                data: args,
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
