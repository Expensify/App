import * as Pusher from './Pusher/pusher';
import * as Session from './actions/Session';
import Log from './Log';

function init() {
    /**
     * When authTokens expire they will automatically be refreshed.
     * The authorizer helps make sure that we are always passing the
     * current valid token to generate the signed auth response
     * needed to subscribe to Pusher channels.
     */
    Pusher.registerCustomAuthorizer(channel => ({
        authorize: (socketID, callback) => {
            Session.authenticatePusher(socketID, channel.name, callback);
        },
    }));

    /**
     * @params {string} eventName
     */
    Pusher.registerSocketEventCallback((eventName, data) => {
        switch (eventName) {
            case 'error':
                Log.info('[PusherConnectionManager] error event', false, {error: data});
                Session.reauthenticatePusher();
                break;
            case 'connected':
                Log.info('[PusherConnectionManager] connected event');
                break;
            case 'disconnected':
                Log.info('[PusherConnectionManager] disconnected event');
                break;
            default:
                break;
        }
    });
}

export default {
    init,
};
