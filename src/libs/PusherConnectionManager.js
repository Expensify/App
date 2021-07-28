import _ from 'underscore';
import * as Pusher from './Pusher/pusher';
import * as API from './API';
import Log from './Log';

// It's necessary to throttle requests to reauthenticate since calling this multiple times will cause Pusher to
// reconnect each time when we only need to reconnect once. This way, if an authToken is expired and we try to
// subscribe to a bunch of channels at once we will only reauthenticate and force reconnect Pusher once.
const reauthenticate = _.throttle(() => {
    Log.info('[Pusher] Re-authenticating and then reconnecting', true);
    API.reauthenticate('Push_Authenticate')
        .then(() => Pusher.reconnect())
        .catch(() => {
            console.debug(
                '[PusherConnectionManager]',
                'Unable to re-authenticate Pusher because we are offline.',
            );
        });
}, 5000, {trailing: false});

function init() {
    /**
     * When authTokens expire they will automatically be refreshed.
     * The authorizer helps make sure that we are always passing the
     * current valid token to generate the signed auth response
     * needed to subscribe to Pusher channels.
     */
    Pusher.registerCustomAuthorizer(channel => ({
        authorize: (socketID, callback) => {
            Log.info('[PusherConnectionManager] Attempting to authorize Pusher', true);

            API.Push_Authenticate({
                socket_id: socketID,
                channel_name: channel.name,
                doNotRetry: true,
                forceNetworkRequest: true,
            })
                .then((data) => {
                    if (data.jsonCode === 407) {
                        callback(new Error('Expensify session expired'), {auth: ''});

                        // Attempt to refresh the authToken then reconnect to Pusher
                        reauthenticate();
                        return;
                    }

                    Log.info('[PusherConnectionManager] Pusher authenticated successfully', true);
                    callback(null, data);
                })
                .catch((error) => {
                    Log.info('[PusherConnectionManager] Unhandled error: ', error);
                    callback(error, {auth: ''});
                });
        },
    }));

    /**
     * Events that happen on the pusher socket are used to determine if the app is online or offline.
     * The offline setting is stored in Onyx so the rest of the app has access to it.
     *
     * @params {string} eventName
     */
    Pusher.registerSocketEventCallback((eventName, data) => {
        switch (eventName) {
            case 'error':
                Log.info('[PusherConnectionManager] error event', true, {error: data});
                reauthenticate();
                break;
            case 'connected':
                Log.info('[PusherConnectionManager] connected event', true);
                break;
            case 'disconnected':
                Log.info('[PusherConnectionManager] disconnected event', true);
                break;
            default:
                break;
        }
    });
}

export default {
    init,
};
