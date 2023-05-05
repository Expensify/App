import * as Pusher from '../../src/libs/Pusher/pusher';
import PusherConnectionManager from '../../src/libs/PusherConnectionManager';
import CONFIG from '../../src/CONFIG';
import CONST from '../../src/CONST';

const CHANNEL_NAME = `${CONST.PUSHER.PRIVATE_USER_CHANNEL_PREFIX}1${CONFIG.PUSHER.SUFFIX}`;

function setup() {
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
        authEndpoint: `${CONFIG.EXPENSIFY.DEFAULT_API_ROOT}api?command=AuthenticatePusher`,
    });
}

/**
 * @param {Array} args
 */
function emitOnyxUpdate(args) {
    const channel = Pusher.getChannel(CHANNEL_NAME);
    channel.emit(Pusher.TYPE.ONYX_API_UPDATE, args);
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
