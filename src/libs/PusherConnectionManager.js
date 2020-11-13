import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../ONYXKEYS';
import * as Pusher from './Pusher/pusher';

function init() {
    let authToken;
    Onyx.connect({
        key: ONYXKEYS.SESSION,
        callback: val => authToken = val ? val.authToken : null,
    });

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
    Pusher.registerCustomAuthorizer((channel, {authEndpoint}) => ({
        authorize: (socketID, callback) => {
            console.debug('[Network] Attempting to authorize Pusher');

            const formData = new FormData();
            formData.append('socket_id', socketID);
            formData.append('channel_name', channel.name);
            formData.append('authToken', authToken);

            return fetch(authEndpoint, {
                method: 'POST',
                body: formData,
            })
                .then(authResponse => authResponse.json())
                .then(data => callback(null, data))
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
