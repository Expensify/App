import {reconnect} from '@libs/actions/Reconnect';
import redirectToSignIn from '@libs/actions/SignInRedirect';
import HttpsError from '@libs/Errors/HttpsError';
import Log from '@libs/Log';
import {replay as replayMainQueue} from '@libs/Network/MainQueue';
import {getAuthToken, getAuthTokenType, isAuthenticating as isAuthenticatingNetworkStore, setIsAuthenticating} from '@libs/Network/NetworkStore';
import type {RequestError} from '@libs/Network/SequentialQueue';
import {getIsOffline} from '@libs/NetworkState';
import reauthenticateLibs from '@libs/Reauthentication';
import type {ReauthenticationResult} from '@libs/Reauthentication';
import {getSentAuthState, processWithMiddleware} from '@libs/Request';
import RequestThrottle from '@libs/RequestThrottle';
import trackAuthenticationError from '@libs/telemetry/trackAuthenticationError';

import CONST from '@src/CONST';
import type Request from '@src/types/onyx/Request';
import type {PaginatedRequest} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import type Middleware from './types';

// We store a reference to the active authentication request so that we are only ever making one request to authenticate at a time.
let isAuthenticating: Promise<ReauthenticationResult> | null = null;

const reauthThrottle = new RequestThrottle('Re-authentication');

function reauthenticate(commandName?: string): Promise<ReauthenticationResult> {
    if (isAuthenticating) {
        return isAuthenticating;
    }

    // Every retry compares against the token this flow started with, so a session switch during a retry's backoff is not taken as the new baseline.
    const authTokenAtFlowStart = getAuthToken() ?? null;
    isAuthenticating = retryReauthenticate(authTokenAtFlowStart, commandName).finally(() => {
        // Reset the isAuthenticating state to allow new reauthentication flows to start fresh
        isAuthenticating = null;
        reauthThrottle.clear();
    });

    return isAuthenticating;
}

function retryReauthenticate(authTokenAtFlowStart: string | null, commandName?: string): Promise<ReauthenticationResult> {
    return reauthenticateLibs(commandName, authTokenAtFlowStart).catch((error: RequestError) => {
        return reauthThrottle
            .sleep(error, 'Authenticate')
            .then(() => retryReauthenticate(authTokenAtFlowStart, commandName))
            .catch(() => {
                // The session switched to another token while this flow was retrying, so its failure does not apply to the current session.
                const currentAuthToken = getAuthToken();
                if (currentAuthToken !== authTokenAtFlowStart) {
                    setIsAuthenticating(false);
                    Log.hmmm('[Reauthenticate] Session changed while retrying re-authentication. Keeping the current session.', {command: commandName});
                    return {wasSuccessful: !!currentAuthToken};
                }

                trackAuthenticationError(error, {
                    errorType: 'retries_exhausted',
                    functionName: 'reauthenticate',
                    command: commandName,
                });
                setIsAuthenticating(false);
                Log.hmmm('[Reauthenticate] Redirecting to Sign In because we failed to reauthenticate after multiple attempts', {error});
                redirectToSignIn(CONST.SIGN_OUT_REASON.REAUTH_FAILED, 'passwordForm.error.fallback');
                return {wasSuccessful: false};
            });
    });
}

// Used in tests to reset the reauthentication state
function resetReauthentication(): void {
    // Resets the authentication state flag to allow new reauthentication flows to start fresh
    isAuthenticating = null;

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
    return (
        request.command === 'Authenticate' &&
        error instanceof HttpsError &&
        !!error.status &&
        error.message !== CONST.ERROR.EXPENSIFY_SERVICE_INTERRUPTED &&
        error.message !== CONST.ERROR.SERVICE_UNAVAILABLE
    );
}

type SessionChange = 'unchanged' | 'tokenReplaced' | 'accountChanged';

/**
 * Compares the session a request was sent with to the current session. A 407 for a token that has since been
 * replaced does not mean the current session expired, and a request sent for another account (for example before
 * connecting as a copilot) must not run under the current account's token.
 */
function getSessionChangeSinceSent<TKey extends OnyxKey>(request: Request<TKey> | PaginatedRequest<TKey>): SessionChange {
    const sentAuthState = getSentAuthState(request);

    // A request that carries its own authToken is always sent with it, and one sent without a token is waiting for a session.
    if (!sentAuthState?.authToken || request.data?.authToken) {
        return 'unchanged';
    }

    const currentAuthToken = getAuthToken();
    if (sentAuthState.authToken === currentAuthToken) {
        return 'unchanged';
    }

    // Connecting as a copilot and returning to the original account both change the token type. The session's accountID is not compared:
    // the ConnectAsDelegate response updates it before the copilot token is saved, while requests still use the original account's token.
    if (sentAuthState.authTokenType !== getAuthTokenType()) {
        return 'accountChanged';
    }

    // Without a current token there is nothing to retry with, so re-authentication decides what happens next.
    if (!currentAuthToken) {
        return 'unchanged';
    }

    return 'tokenReplaced';
}

function retryWithCurrentSession<TKey extends OnyxKey>(
    request: Request<TKey> | PaginatedRequest<TKey>,
    isFromSequentialQueue: boolean,
    apiRequestType: unknown,
): Promise<Response<TKey> | void> {
    if (isFromSequentialQueue || apiRequestType === CONST.API_REQUEST_TYPE.MAKE_REQUEST_WITH_SIDE_EFFECTS) {
        return processWithMiddleware(request, isFromSequentialQueue);
    }

    if (apiRequestType === CONST.API_REQUEST_TYPE.READ) {
        // READ requests are not replayed one by one. ReconnectApp loads their data again with the current session instead.
        reconnect();
        return Promise.resolve();
    }

    replayMainQueue(request);
    return Promise.resolve();
}

function resolveRequestForChangedAccount<TKey extends OnyxKey>(request: Request<TKey> | PaginatedRequest<TKey>, isFromSequentialQueue: boolean, data: Response<TKey>): Response<TKey> {
    Log.hmmm('[Reauthenticate] Not retrying a request that was sent for a different account', {command: request.command});

    // The request's Onyx updates target the account it was sent for, so applying them would write into the current account.
    request.failureData = undefined;
    request.finallyData = undefined;

    if (!isFromSequentialQueue && request.resolve) {
        request.resolve(data);
    }
    return data;
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

    const sessionChange = getSessionChangeSinceSent(request);
    if (sessionChange === 'accountChanged') {
        return Promise.resolve(resolveRequestForChangedAccount(request, isFromSequentialQueue, data));
    }

    // Another request already re-authenticated, so retry with the newer token. Re-authenticating again could
    // overwrite a token the session switched to in the meantime, such as a copilot token.
    if (sessionChange === 'tokenReplaced') {
        Log.hmmm('[Reauthenticate] Retrying a request that failed with a replaced authToken', {command: request.command});
        return retryWithCurrentSession(request, isFromSequentialQueue, apiRequestType);
    }

    // We are already authenticating and using the DeprecatedAPI so we will replay the request
    if (!apiRequestType && isAuthenticatingNetworkStore()) {
        replayMainQueue(request);
        return Promise.resolve(data);
    }

    return reauthenticate(request?.commandName)
        .then((result) => {
            if (!result.wasSuccessful) {
                if (isFromSequentialQueue) {
                    // A resolved 407 reads as success to SequentialQueue, which deletes the persisted write.
                    // Throw on every give-up: the latched short-lived-token abort and the delegate restore return
                    // false with the session alive. One that did sign out costs nothing, its Onyx.clear empties the queue first.
                    throw new Error('Failed to reauthenticate');
                }

                // Reauth already handled the sign-in redirect, so do not briefly show the failed request UI before sign-in.
                // However, during a delegate auth failure, restoreDelegateSession restores the original account rather than
                // signing out. Preserve failureData and finallyData so that loading states are properly cleared.
                if (!result.didRestoreOriginalSession) {
                    request.failureData = undefined;
                    request.finallyData = undefined;
                }
                return data;
            }

            // The session can switch accounts while re-authentication is in flight, for example when connecting as a copilot.
            if (getSessionChangeSinceSent(request) === 'accountChanged') {
                return resolveRequestForChangedAccount(request, isFromSequentialQueue, data);
            }

            return retryWithCurrentSession(request, isFromSequentialQueue, apiRequestType);
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
