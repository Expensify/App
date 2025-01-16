import type {ChannelAuthorizationCallback} from 'pusher-js/with-encryption';
import CONST from '@src/CONST';
import * as Session from './actions/Session';
import Log from './Log';
import type {SocketEventName} from './Pusher/library/types';
import * as Pusher from './Pusher/pusher';
import type {EventCallbackError, States} from './Pusher/pusher';

function init() {
    /**
     * When authTokens expire they will automatically be refreshed.
     * The authorizer helps make sure that we are always passing the
     * current valid token to generate the signed auth response
     * needed to subscribe to Pusher channels.
     */
    Pusher.registerCustomAuthorizer((channel) => ({
        authorize: (socketId: string, callback: ChannelAuthorizationCallback) => {
            Session.authenticatePusher(socketId, channel.name, callback);
        },
    }));

    Pusher.registerSocketEventCallback((eventName: SocketEventName, error?: EventCallbackError | States) => {
        switch (eventName) {
            case 'error': {
                if (error && 'type' in error) {
                    const errorType = error?.type;
                    const code = error?.data?.code;
                    const errorMessage = error?.data?.message || '';
                    if (errorType === CONST.ERROR.PUSHER_ERROR && code === 1006) {
                        // 1006 code happens when a websocket connection is closed. There may or may not be a reason attached indicating why the connection was closed.
                        // https://datatracker.ietf.org/doc/html/rfc6455#section-7.1.5
                        Log.hmmm('[PusherConnectionManager] Channels Error 1006', {error});

                        // The 1006 errors don't always have a message, but when they do, it seems that it prevents the pusher client from reconnecting.
                        // On the advice from Pusher directly, they suggested to manually reconnect in those scenarios.
                        if (errorMessage) {
                            Log.hmmm('[PusherConnectionManager] Channels Error 1006 message', {errorMessage});
                            Pusher.reconnect();
                        }
                    } else if (errorType === CONST.ERROR.PUSHER_ERROR && code === 4201) {
                        // This means the connection was closed because Pusher did not receive a reply from the client when it pinged them for a response
                        // https://pusher.com/docs/channels/library_auth_reference/pusher-websockets-protocol/#4200-4299
                        Log.hmmm('[PusherConnectionManager] Pong reply not received', {error});
                    } else if (errorType === CONST.ERROR.WEB_SOCKET_ERROR) {
                        // It's not clear why some errors are wrapped in a WebSocketError type - this error could mean different things depending on the contents.
                        Log.hmmm('[PusherConnectionManager] WebSocketError', {error});
                    } else {
                        Log.alert(`${CONST.ERROR.ENSURE_BUGBOT} [PusherConnectionManager] Unknown error event`, {error});
                    }
                }
                break;
            }
            case 'connected':
                Log.hmmm('[PusherConnectionManager] connected event');
                break;
            case 'disconnected':
                Log.hmmm('[PusherConnectionManager] disconnected event');
                break;
            case 'state_change':
                Log.hmmm('[PusherConnectionManager] state change', {states: error});
                break;
            default:
                Log.hmmm('[PusherConnectionManager] unhandled event', {eventName});
                break;
        }
    });
}

export default {
    init,
};
