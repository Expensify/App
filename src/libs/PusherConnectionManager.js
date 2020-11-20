import _ from 'underscore';
import * as Pusher from './Pusher/pusher';
import API from './API';

function init() {
    /**
     * Pusher.reconnect() calls disconnect and connect on the
     * Pusher socket. In some cases, the authorizer might fail
     * or an error will be returned due to an out of date authToken.
     * Reconnect will preserve our existing subscriptions and retry
     * connecting until it succeeds. We're throttling this call so
     * that we retry as few times as possible.
     */
    const reconnectToPusher = _.throttle(Pusher.reconnect, 1000);

    /**
     * When authTokens expire they will automatically be refreshed.
     * The authorizer helps make sure that we are always passing the
     * current valid token to generate the signed auth response
     * needed to subscribe to Pusher channels.
     */
    Pusher.registerCustomAuthorizer(channel => ({
        authorize: (socketID, callback) => {
            console.debug('[Network] Attempting to authorize Pusher');

            API.Push_Authenticate({
                socket_id: socketID,
                channel_name: channel.name,
                doNotRetry: true,
            })
                .then((data) => {
                    if (data.jsonCode === 407) {
                        throw new Error(data.title);
                    }
                    callback(null, data);
                })
                .catch((error) => {
                    reconnectToPusher();
                    console.debug('[Network] Failed to authorize Pusher');
                    callback(new Error(`Error calling auth endpoint: ${error.message}`));
                });
        },
    }));

    /**
     * Events that happen on the pusher socket are used to determine if the app is online or offline.
     * The offline setting is stored in Onyx so the rest of the app has access to it.
     *
     * @params {string} eventName
     */
    Pusher.registerSocketEventCallback((eventName) => {
        switch (eventName) {
            case 'error':
                reconnectToPusher();
                break;
            default:
                break;
        }
    });
}

export default init;
