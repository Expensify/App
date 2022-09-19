import lodashGet from 'lodash/get';
import CONST from '../../CONST';
import * as NetworkStore from '../Network/NetworkStore';
import * as MainQueue from '../Network/MainQueue';
// eslint-disable-next-line import/no-cycle
import * as Authentication from '../Authentication';
import * as PersistedRequests from '../actions/PersistedRequests';
import * as Request from '../Request';
import Log from '../Log';

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
                if (!shouldRetry) {
                    if (isFromSequentialQueue) {
                        return data;
                    }

                    if (request.resolve) {
                        request.resolve(data);
                    }
                    return data;
                }

                // We are already authenticating
                if (NetworkStore.isAuthenticating()) {
                    if (isFromSequentialQueue) {
                        // This should never happen in theory. If we go offline while we are Authenticating or handling a response with a 407 jsonCode then isAuthenticating should be
                        // set to false. If we do somehow get here, we will log about it since we will never know it happened otherwise and it would be difficult to diagnose.
                        const message = 'Cannot complete sequential request because we are already authenticating';
                        Log.alert(`${CONST.ERROR.ENSURE_BUGBOT} ${message}`);
                        throw new Error(message);
                    }

                    MainQueue.replay(request);
                    return data;
                }

                return Authentication.reauthenticate(request.commandName)
                    .then((authenticateResponse) => {
                        if (isFromSequentialQueue) {
                            return Request.processWithMiddleware(request, true);
                        }

                        MainQueue.replay(request);
                        return authenticateResponse;
                    })
                    .catch(() => {
                        if (isFromSequentialQueue) {
                            throw new Error('Unable to reauthenticate sequential queue request because we failed to reauthenticate');
                        }

                        // If we make it here, then our reauthenticate request could not be made due to a networking issue. The original request can be retried safely.
                        MainQueue.replay(request);
                    });
            }

            if (isFromSequentialQueue) {
                PersistedRequests.remove(request);
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
