import * as Authentication from '@libs/Authentication';
import Log from '@libs/Log';
import * as MainQueue from '@libs/Network/MainQueue';
import * as NetworkStore from '@libs/Network/NetworkStore';
import NetworkConnection from '@libs/NetworkConnection';
import * as Request from '@libs/Request';
import CONST from '@src/CONST';
import Middleware from './types';

// We store a reference to the active authentication request so that we are only ever making one request to authenticate at a time.
let isAuthenticating: Promise<void> | null = null;

function reauthenticate(commandName?: string): Promise<void> {
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

const Reauthentication: Middleware = (response, request, isFromSequentialQueue) =>
    response
        .then((data) => {
            // If there is no data for some reason then we cannot reauthenticate
            if (!data) {
                Log.hmmm('Undefined data in Reauthentication');
                return;
            }

            if (data.jsonCode === CONST.JSON_CODE.NOT_AUTHENTICATED) {
                if (NetworkStore.isOffline()) {
                    // If we are offline and somehow handling this response we do not want to reauthenticate
                    throw new Error('Unable to reauthenticate because we are offline');
                }

                // There are some API requests that should not be retried when there is an auth failure like
                // creating and deleting logins. In those cases, they should handle the original response instead
                // of the new response created by handleExpiredAuthToken.
                const shouldRetry = request?.data?.shouldRetry;
                const apiRequestType = request?.data?.apiRequestType;

                // For the SignInWithShortLivedAuthToken command, if the short token expires, the server returns a 407 error,
                // and credentials are still empty at this time, which causes reauthenticate to throw an error (requireParameters),
                // and the subsequent SaveResponseInOnyx also cannot be executed, so we need this parameter to skip the reauthentication logic.
                const skipReauthentication = request?.data?.skipReauthentication;
                if ((!shouldRetry && !apiRequestType) || skipReauthentication) {
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

                return reauthenticate(request?.commandName)
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
        })
        .catch((error) => {
            // If the request is on the sequential queue, re-throw the error so we can decide to retry or not
            if (isFromSequentialQueue) {
                throw error;
            }

            // If we have caught a networking error from a DeprecatedAPI request, resolve it as unable to retry, otherwise the request will never resolve or reject.
            if (request.resolve) {
                request.resolve({jsonCode: CONST.JSON_CODE.UNABLE_TO_RETRY});
            }
        });

export default Reauthentication;
