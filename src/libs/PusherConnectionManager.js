import * as Pusher from './Pusher/pusher';
import * as API from './API';
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
            Log.info('[PusherConnectionManager] Attempting to authorize Pusher', true);

            API.Push_Authenticate({
                socket_id: socketID,
                channel_name: channel.name,
                doNotRetry: true,
            })
                .then((data) => {
                    if (data.jsonCode === 407) {
                        callback(new Error('Pusher: Expensify session expired. Re-authenticating...'));

                        // Attempt to refresh the authToken then reconnect to Pusher
                        API.reauthenticate('Push_Authenticate').then(() => Pusher.reconnect());
                        return;
                    }

                    Log.info('[PusherConnectionManager] Pusher authenticated successfully', true);
                    callback(null, data);
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
                Pusher.reconnect();
                break;
            case 'connected':
                Log.info('[PusherConnectionManager] connected event', true);
                break;
            case 'disconnected':
                Log.info('[PusherConnectionManager] disconnected event', true);
                break;
            case 'state_change':
                Log.info('[PusherConnectionManager] state_change event', true, {states: data});
                break;
            default:
                break;
        }
    });
}

export default {
    init,
};
