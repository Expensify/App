import * as Pusher from './Pusher/pusher';
import * as Session from './actions/Session';
import Log from './Log';
import CONST from '../CONST';

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
    Pusher.registerSocketEventCallback((eventName, error) => {
        switch (eventName) {
            case 'error':
                if (error && error.type === 'PusherError' && error.data.code === 1006) {
                    Log.hmmm('[PusherConnectionManager] Channels Error 1006', {error});
                } else if (error && error.type === 'PusherError' && error.data.code === 4201) {
                    Log.hmmm('[PusherConnectionManager] Pong reply not received', {error});
                } else if (error && error.type === 'WebSocketError') {
                    Log.hmmm('[PusherConnectionManager] WebSocketError', {error});
                } else {
                    Log.alert(`${CONST.ERROR.ENSURE_BUGBOT} [PusherConnectionManager] Unknown error event`, {error});
                }
                break;
            case 'connected':
                Log.info('[PusherConnectionManager] connected event');
                break;
            case 'disconnected':
                Log.info('[PusherConnectionManager] disconnected event');
                break;
            default:
                Log.info('[PusherConnectionManager] unhandled event', false, {eventName});
                break;
        }
    });
}

export default {
    init,
};
