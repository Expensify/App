import {reconnect} from '@libs/actions/Reconnect';
import redirectToSignIn, {getLastRedirectToSignInTime} from '@libs/actions/SignInRedirect';
import HttpsError from '@libs/Errors/HttpsError';
import Log from '@libs/Log';
import {replay as replayMainQueue} from '@libs/Network/MainQueue';
import {isAuthenticating as isAuthenticatingNetworkStore, setIsAuthenticating} from '@libs/Network/NetworkStore';
import type {RequestError} from '@libs/Network/SequentialQueue';
import {getIsOffline} from '@libs/NetworkState';
import reauthenticateLibs from '@libs/Reauthentication';
import {processWithMiddleware} from '@libs/Request';
import RequestThrottle from '@libs/RequestThrottle';

import CONST from '@src/CONST';
import type Request from '@src/types/onyx/Request';
import type {PaginatedRequest} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import type Middleware from './types';

// We store a reference to the active authentication request so that we are only ever making one request to authenticate at a time.
let isAuthenticating: Promise<boolean> | null = null;
let authenticationStartTime = 0;

// Bumped whenever a stuck authentication chain is discarded so the discarded chain can notice it no longer owns the
// shared state (throttle, flags) and stop retrying.
let authenticationGeneration = 0;

const reauthThrottle = new RequestThrottle('Re-authentication');

function reauthenticate(commandName?: string): Promise<boolean> {
    if (isAuthenticating) {
        if (Date.now() - authenticationStartTime <= CONST.NETWORK.MAX_AUTHENTICATION_PENDING_TIME_MS) {
            return isAuthenticating;
        }

        // The in-flight authentication attempt never settled (e.g. a SAML/short-lived-token login that hung mid-flow).
        // If we kept returning the stuck promise, every subsequent 407 would chain onto it and token renewal would be
        // blocked forever. Discard it and start fresh so the session can recover without a page refresh.
        Log.hmmm('[Reauthenticate] Discarding an authentication attempt that has been pending for too long and starting a fresh one', {
            commandName,
            elapsedTime: Date.now() - authenticationStartTime,
        });
        isAuthenticating = null;
        // The stuck attempt may have left the network paused (see NetworkStore.isAuthenticating)
        setIsAuthenticating(false);
        // The stuck chain and the fresh one share this throttle: reclaim the full retry budget for the fresh chain and
        // cancel the stuck chain's pending backoff timer (parking that chain for good).
        reauthThrottle.clear();
    }

    authenticationGeneration += 1;
    const authenticationPromise = retryReauthenticate(commandName, authenticationGeneration).finally(() => {
        // Reset the isAuthenticating state to allow new reauthentication flows to start fresh. The identity check keeps a
        // discarded (stuck) attempt that settles late from clobbering a newer in-flight one.
        if (isAuthenticating !== authenticationPromise) {
            return;
        }
        isAuthenticating = null;
    });
    isAuthenticating = authenticationPromise;

    return authenticationPromise;
}

function retryReauthenticate(commandName?: string, generation: number = authenticationGeneration): Promise<boolean> {
    // Stamp each attempt rather than only the chain start: an actively retrying chain keeps refreshing this and is
    // never misclassified as stuck, while a chain whose current attempt itself hangs goes stale and gets discarded
    // by the next reauthenticate() call.
    authenticationStartTime = Date.now();
    return reauthenticateLibs(commandName).catch((error: RequestError) => {
        // A discarded (stuck) chain must not keep retrying: a newer chain owns the shared throttle and flags now.
        if (generation !== authenticationGeneration) {
            Log.hmmm('[Reauthenticate] Abandoning a discarded authentication attempt because a newer one is in flight', {commandName});
            return false;
        }
        return reauthThrottle
            .sleep(error, 'Authenticate')
            .then(() => retryReauthenticate(commandName, generation))
            .catch(() => {
                setIsAuthenticating(false);
                Log.hmmm('[Reauthenticate] Redirecting to Sign In because we failed to reauthenticate after multiple attempts', {error});
                redirectToSignIn('passwordForm.error.fallback');
                return false;
            });
    });
}

// Used in tests to reset the reauthentication state
function resetReauthentication(): void {
    // Resets the authentication state flag to allow new reauthentication flows to start fresh
    isAuthenticating = null;
    authenticationStartTime = 0;
    authenticationGeneration += 1;

    // Clears any pending reauth timeouts set by reauthThrottle.sleep()
    reauthThrottle.clear();
}

function isExpiredSessionError(error: unknown): error is HttpsError {
    return error instanceof HttpsError && Number(error.status) === CONST.JSON_CODE.NOT_AUTHENTICATED;
}

// Preserve hard HTTP failures from Authenticate as response-shaped data so the
// auth flow can map them to the right sign-in error instead of retrying them
// like transient transport failures.
function shouldResolveAuthenticateHTTPError(error: unknown, request: {command: string}): error is HttpsError {
    return request.command === 'Authenticate' && error instanceof HttpsError && !!error.status && error.message !== CONST.ERROR.EXPENSIFY_SERVICE_INTERRUPTED;
}

function handleExpiredSession<TKey extends OnyxKey>(
    request: Request<TKey> | PaginatedRequest<TKey>,
    isFromSequentialQueue: boolean,
    data: Response<TKey> = {jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED} as Response<TKey>,
): Promise<Response<TKey> | void> {
    if (getIsOffline()) {
        // Both body-level and HTTP-level 407 responses should honor the existing
        // offline pause so flaky connectivity does not trigger sign-out retries.
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
            return Promise.resolve(data);
        }

        if (request.resolve) {
            request.resolve(data);
        }
        return Promise.resolve(data);
    }

    // We are already authenticating and using the DeprecatedAPI so we will replay the request to the main queue.
    // Sequential queue requests must never take this path: resolving with the 407 data would read as success to the
    // SequentialQueue, which would delete the persisted request and silently lose the user's write. They fall through
    // to reauthenticate() below, which chains them onto the in-flight authentication and retries them once it settles.
    if (!apiRequestType && !isFromSequentialQueue && isAuthenticatingNetworkStore()) {
        replayMainQueue(request);
        return Promise.resolve(data);
    }

    return reauthenticate(request?.commandName)
        .then((wasSuccessful) => {
            if (!wasSuccessful) {
                // When the failed reauthentication triggered a sign-out redirect, the whole store (including the
                // persisted request queue) is about to be cleared — resolve with the original response like before so
                // the queue deletes the request instead of rolling it back into storage mid-clear, which would orphan
                // it on disk for a future session. Without a redirect the session can still recover (e.g. a stuck SAML
                // login), so throw to keep the write queued for retry instead of silently dropping it.
                const didRedirectToSignIn = Date.now() - getLastRedirectToSignInTime() < CONST.NETWORK.MAX_AUTHENTICATION_PENDING_TIME_MS;
                if (isFromSequentialQueue && !didRedirectToSignIn) {
                    throw new Error('Failed to reauthenticate');
                }

                // Reauth already handled the sign-in redirect, so do not briefly show the failed request UI before sign-in.
                request.failureData = undefined;
                request.finallyData = undefined;
                return data;
            }

            if (isFromSequentialQueue || apiRequestType === CONST.API_REQUEST_TYPE.MAKE_REQUEST_WITH_SIDE_EFFECTS) {
                return processWithMiddleware(request, isFromSequentialQueue);
            }

            if (apiRequestType === CONST.API_REQUEST_TYPE.READ) {
                // Re-sync app data after successful re-authentication
                reconnect();
                return Promise.resolve();
            }

            replayMainQueue(request);
        })
        .catch(() => {
            if (isFromSequentialQueue || apiRequestType) {
                throw new Error('Failed to reauthenticate');
            }

            // If we make it here, then our reauthenticate request could not be made due to a networking issue. The original request can be retried safely.
            replayMainQueue(request);
        });
}

const Reauthentication: Middleware = (response, request, isFromSequentialQueue) =>
    response
        .then((data) => {
            // If there is no data for some reason then we cannot reauthenticate
            if (!data) {
                Log.hmmm('[Reauthenticate] Undefined data in Reauthentication');
                return;
            }

            if (data.jsonCode === CONST.JSON_CODE.NOT_AUTHENTICATED) {
                return handleExpiredSession(request, isFromSequentialQueue, data);
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
            if (isExpiredSessionError(error)) {
                return Promise.resolve()
                    .then(() => handleExpiredSession(request, isFromSequentialQueue))
                    .catch((reauthenticationError) => {
                        if (isFromSequentialQueue) {
                            throw reauthenticationError;
                        }

                        if (request.resolve) {
                            request.resolve({jsonCode: CONST.JSON_CODE.UNABLE_TO_RETRY});
                        }
                    });
            }

            if (shouldResolveAuthenticateHTTPError(error, request)) {
                if (request.resolve) {
                    request.resolve({
                        jsonCode: Number(error.status),
                        message: error.message,
                        title: error.title,
                    });
                }
                return;
            }

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
export {resetReauthentication};
