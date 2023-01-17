import lodashGet from 'lodash/get';
import CONST from '../../CONST';
import * as NetworkStore from '../Network/NetworkStore';
import * as MainQueue from '../Network/MainQueue';
import * as Authentication from '../Authentication';
import * as Request from '../Request';
import Log from '../Log';
import NetworkConnection from '../NetworkConnection';

// We store a reference to the active authentication request so that we are only ever making one request to authenticate at a time.
let isAuthenticating = null;

/**
 * @param {String} commandName
 * @returns {Promise}
 */
function reauthenticate(commandName) {
    if (isAuthenticating) {
        return isAuthenticating;
    }

    isAuthenticating = Authentication.reauthenticate(commandName)
        .then((response) => {
            isAuthenticating = null;
            return response;
        })
        .catch((error) => {
            isAuthenticating = null;
            throw error;
        });

    return isAuthenticating;
}

/**
 * Reauthentication middleware
 *
 * @param {Promise} response
 * @param {Object} request
 * @param {Boolean} isFromSequentialQueue
 * @returns {Promise}
 */
function Reauthentication(response, request, isFromSequentialQueue) {
    return response
        .then((data) => {
            // If there is no data for some reason then we cannot reauthenticate
            if (!data) {
                Log.hmmm('Undefined data in Reauthentication');
                return;
            }

            if (NetworkStore.isOffline()) {
                // If we are offline and somehow handling this response we do not want to reauthenticate
                throw new Error('Unable to reauthenticate because we are offline');
            }

            if (data.jsonCode === CONST.JSON_CODE.NOT_AUTHENTICATED) {
                // There are some API requests that should not be retried when there is an auth failure like
                // creating and deleting logins. In those cases, they should handle the original response instead
                // of the new response created by handleExpiredAuthToken.
                const shouldRetry = lodashGet(request, 'data.shouldRetry');
                const apiRequestType = lodashGet(request, 'data.apiRequestType');
                if (!shouldRetry && !apiRequestType) {
                    if (isFromSequentialQueue) {
                        return data;
                    }

                    if (request.resolve) {
                        request.resolve(data);
                    }
                    return data;
                }

                // We are already authenticating and using the DeprecatedAPI so we will replay the request
                if (!apiRequestType && NetworkStore.isAuthenticating()) {
                    MainQueue.replay(request);
                    return data;
                }

                return reauthenticate(request.commandName)
                    .then((authenticateResponse) => {
                        if (isFromSequentialQueue || apiRequestType === CONST.API_REQUEST_TYPE.MAKE_REQUEST_WITH_SIDE_EFFECTS) {
                            return Request.processWithMiddleware(request, isFromSequentialQueue);
                        }

                        if (apiRequestType === CONST.API_REQUEST_TYPE.READ) {
                            NetworkConnection.triggerReconnectionCallbacks('read request made with expired authToken');
                            return Promise.resolve();
                        }

                        MainQueue.replay(request);
                        return authenticateResponse;
                    })
                    .catch(() => {
                        if (isFromSequentialQueue || apiRequestType) {
                            throw new Error('Failed to reauthenticate');
                        }

                        // If we make it here, then our reauthenticate request could not be made due to a networking issue. The original request can be retried safely.
                        MainQueue.replay(request);
                    });
            }

            if (isFromSequentialQueue) {
                return data;
            }

            if (request.resolve) {
                request.resolve(data);
            }

            // Return response data so we can chain the response with the following middlewares.
            return data;
        });
}

export default Reauthentication;
