import * as Reconnect from '@libs/actions/Reconnect';
import redirectToSignIn from '@libs/actions/SignInRedirect';
import Reauthentication, {resetReauthentication} from '@libs/Middleware/Reauthentication';
import SaveResponseInOnyx from '@libs/Middleware/SaveResponseInOnyx';
import reauthenticate from '@libs/Reauthentication';
import RequestThrottle from '@libs/RequestThrottle';
import trackAuthenticationError from '@libs/telemetry/trackAuthenticationError';

import CONST from '@src/CONST';
import * as PersistedRequests from '@src/libs/actions/PersistedRequests';
import HttpsError from '@src/libs/Errors/HttpsError';
import HttpUtils from '@src/libs/HttpUtils';
import * as Network from '@src/libs/Network';
import * as MainQueue from '@src/libs/Network/MainQueue';
import * as NetworkStore from '@src/libs/Network/NetworkStore';
import * as SequentialQueue from '@src/libs/Network/SequentialQueue';
import {setHasRadio} from '@src/libs/NetworkState';
import * as Request from '@src/libs/Request';
import ONYXKEYS from '@src/ONYXKEYS';
import type OnyxRequest from '@src/types/onyx/Request';

import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForNetworkPromises from '../utils/waitForNetworkPromises';

jest.mock('@libs/Reauthentication');
jest.mock('@libs/telemetry/trackAuthenticationError', () => jest.fn());
jest.mock('@libs/actions/SignInRedirect', () => jest.fn(() => Promise.resolve()));

Onyx.init({
    keys: ONYXKEYS,
});

beforeEach(() => {
    Network.clearProcessQueueInterval();
    Request.clearMiddlewares();
    SequentialQueue.resetQueue();
    MainQueue.clear();
    HttpUtils.cancelPendingRequests();
    NetworkStore.checkRequiredData();
    global.fetch = TestHelper.getGlobalFetchMock();
    setHasRadio(true);
    jest.clearAllMocks();

    return Onyx.clear()
        .then(() => waitForBatchedUpdates())
        .then(() => PersistedRequests.clear())
        .then(() => waitForBatchedUpdates())
        .then(() => waitForNetworkPromises());
});

describe('Reauthentication middleware', () => {
    test('clears original request failure updates when failed reauthentication redirects to sign-in', () => {
        jest.mocked(reauthenticate).mockResolvedValueOnce({wasSuccessful: false});

        const request: OnyxRequest<typeof ONYXKEYS.NETWORK> = {
            command: 'TestCommand',
            data: {apiRequestType: CONST.API_REQUEST_TYPE.MAKE_REQUEST_WITH_SIDE_EFFECTS},
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.NETWORK,
                    value: {shouldFailAllRequests: true},
                },
            ],
            finallyData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.NETWORK,
                    value: {shouldForceOffline: true},
                },
            ],
        };

        return Reauthentication(
            Promise.resolve({
                jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED,
            }),
            request,
            false,
        ).then((response) => {
            expect(response?.jsonCode).toBe(CONST.JSON_CODE.NOT_AUTHENTICATED);
            expect(request.failureData).toBeUndefined();
            expect(request.finallyData).toBeUndefined();
        });
    });

    test('preserves original request failure and finally data when reauthentication restores the original session', () => {
        jest.mocked(reauthenticate).mockResolvedValueOnce({wasSuccessful: false, didRestoreOriginalSession: true});

        const request: OnyxRequest<typeof ONYXKEYS.NETWORK> = {
            command: 'TestCommand',
            data: {apiRequestType: CONST.API_REQUEST_TYPE.MAKE_REQUEST_WITH_SIDE_EFFECTS},
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.NETWORK,
                    value: {shouldFailAllRequests: true},
                },
            ],
            finallyData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.NETWORK,
                    value: {shouldForceOffline: true},
                },
            ],
        };

        return Reauthentication(
            Promise.resolve({
                jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED,
            }),
            request,
            false,
        ).then((response) => {
            expect(response?.jsonCode).toBe(CONST.JSON_CODE.NOT_AUTHENTICATED);
            expect(request.failureData).toBeDefined();
            expect(request.finallyData).toBeDefined();
        });
    });

    test('does not apply original request failure data after failed reauthentication redirects to sign-in', () => {
        jest.mocked(reauthenticate).mockResolvedValueOnce({wasSuccessful: false});

        let shouldFailAllRequests: boolean | undefined;
        let shouldForceOffline: boolean | undefined;
        Onyx.connect({
            key: ONYXKEYS.NETWORK,
            callback: (val) => {
                shouldFailAllRequests = val?.shouldFailAllRequests;
                shouldForceOffline = val?.shouldForceOffline;
            },
        });

        Request.addMiddleware(Reauthentication);
        Request.addMiddleware(SaveResponseInOnyx);
        jest.spyOn(HttpUtils, 'xhr').mockResolvedValueOnce({
            jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED,
        });

        return Request.processWithMiddleware({
            command: 'TestCommand',
            data: {apiRequestType: CONST.API_REQUEST_TYPE.MAKE_REQUEST_WITH_SIDE_EFFECTS},
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.NETWORK,
                    value: {shouldFailAllRequests: true},
                },
            ],
            finallyData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.NETWORK,
                    value: {shouldForceOffline: true},
                },
            ],
        })
            .then((response) => {
                expect(response?.jsonCode).toBe(CONST.JSON_CODE.NOT_AUTHENTICATED);
                return waitForBatchedUpdates();
            })
            .then(() => {
                expect(shouldFailAllRequests).toBeFalsy();
                expect(shouldForceOffline).toBeFalsy();
            });
    });

    test('rejects a queued write when reauthentication gives up so the queue keeps it', () => {
        jest.mocked(reauthenticate).mockResolvedValueOnce({wasSuccessful: false});

        const request: OnyxRequest<typeof ONYXKEYS.NETWORK> = {
            command: 'TestCommand',
            data: {apiRequestType: CONST.API_REQUEST_TYPE.WRITE},
        };

        return expect(
            Reauthentication(
                Promise.resolve({
                    jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED,
                }),
                request,
                true,
            ),
        ).rejects.toThrow('Failed to reauthenticate');
    });

    test('keeps the failure updates of a queued write when reauthentication gives up and signs out', () => {
        // Same mock as the abort case on purpose: the middleware cannot tell the two apart.
        jest.mocked(reauthenticate).mockResolvedValueOnce({wasSuccessful: false});

        const request: OnyxRequest<typeof ONYXKEYS.NETWORK> = {
            command: 'TestCommand',
            data: {apiRequestType: CONST.API_REQUEST_TYPE.WRITE},
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.NETWORK,
                    value: {shouldFailAllRequests: true},
                },
            ],
            finallyData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.NETWORK,
                    value: {shouldForceOffline: true},
                },
            ],
        };

        return expect(
            Reauthentication(
                Promise.resolve({
                    jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED,
                }),
                request,
                true,
            ),
        )
            .rejects.toThrow('Failed to reauthenticate')
            .then(() => {
                expect(request.failureData).toBeDefined();
                expect(request.finallyData).toBeDefined();
            });
    });

    test('resolves Authenticate HTTP failures as auth responses instead of retryable errors', () => {
        const resolve = jest.fn();
        const request: OnyxRequest<typeof ONYXKEYS.NETWORK> = {
            command: 'Authenticate',
            data: {},
            resolve,
        };

        return Reauthentication(
            Promise.reject(
                new HttpsError({
                    message: 'Forbidden',
                    status: '403',
                }),
            ),
            request,
            false,
        ).then(() => {
            expect(resolve).toHaveBeenCalledWith({
                jsonCode: 403,
                message: 'Forbidden',
                title: '',
            });
        });
    });

    test('should report one exception when reauthentication runs out of retries and signs the user out', () => {
        // Given every Authenticate attempt fails on the network and the retry throttle has no retries left
        const networkError = new Error('Unable to retry Authenticate request');
        jest.mocked(reauthenticate).mockRejectedValueOnce(networkError);
        const sleepSpy = jest.spyOn(RequestThrottle.prototype, 'sleep').mockRejectedValueOnce(undefined);

        const request: OnyxRequest<typeof ONYXKEYS.NETWORK> = {
            command: 'OpenReport',
            commandName: 'OpenReport',
            data: {apiRequestType: CONST.API_REQUEST_TYPE.READ},
        };

        // When an expired session triggers reauthentication
        return Reauthentication(Promise.resolve({jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED}), request, false)
            .then(() => {
                // Then the sign-out is reported once as an actionable exception, since the per-attempt network_retry reports only go to Sentry logs
                expect(trackAuthenticationError).toHaveBeenCalledTimes(1);
                expect(trackAuthenticationError).toHaveBeenCalledWith(networkError, expect.objectContaining({errorType: 'retries_exhausted', functionName: 'reauthenticate'}));
            })
            .finally(() => {
                sleepSpy.mockRestore();
                resetReauthentication();
            });
    });

    test('does not reauthenticate HTTP 407 while offline', () => {
        const resolve = jest.fn();
        const request: OnyxRequest<typeof ONYXKEYS.NETWORK> = {
            command: 'TestCommand',
            data: {apiRequestType: CONST.API_REQUEST_TYPE.READ},
            resolve,
        };

        setHasRadio(false);

        return Reauthentication(
            Promise.reject(
                new HttpsError({
                    message: 'Proxy Authentication Required',
                    status: String(CONST.JSON_CODE.NOT_AUTHENTICATED),
                }),
            ),
            request,
            false,
        )
            .then(() => {
                expect(reauthenticate).not.toHaveBeenCalled();
                expect(resolve).toHaveBeenCalledWith({jsonCode: CONST.JSON_CODE.UNABLE_TO_RETRY});
            })
            .finally(() => setHasRadio(true));
    });

    test('retries a request with the current authToken instead of reauthenticating when another request already replaced it', async () => {
        // Given a request is sent with a token that another request's re-authentication replaces before its 407 arrives
        await Onyx.set(ONYXKEYS.SESSION, {accountID: 1, authToken: 'expiredToken'});
        await waitForBatchedUpdates();
        Request.addMiddleware(Reauthentication);
        const xhrSpy = jest
            .spyOn(HttpUtils, 'xhr')
            .mockImplementationOnce(() => {
                NetworkStore.setAuthToken('newToken');
                return Promise.resolve({jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED});
            })
            .mockResolvedValueOnce({jsonCode: CONST.JSON_CODE.SUCCESS});

        // When the 407 for the replaced token is handled
        const response = await Request.processWithMiddleware({
            command: 'TestCommand',
            data: {apiRequestType: CONST.API_REQUEST_TYPE.MAKE_REQUEST_WITH_SIDE_EFFECTS},
        });

        // Then the request is retried with the current token and no second re-authentication starts
        expect(reauthenticate).not.toHaveBeenCalled();
        expect(xhrSpy).toHaveBeenCalledTimes(2);
        expect(xhrSpy.mock.calls.at(1)?.at(1)).toEqual(expect.objectContaining({authToken: 'newToken'}));
        expect(response?.jsonCode).toBe(CONST.JSON_CODE.SUCCESS);
    });

    test('does not retry a request under a copilot session that started after the request was sent', async () => {
        // Given a request is sent with the user's own token and they connect as a copilot before its 407 arrives
        await Onyx.set(ONYXKEYS.SESSION, {accountID: 1, authToken: 'expiredToken'});
        await waitForBatchedUpdates();
        Request.addMiddleware(Reauthentication);
        const xhrSpy = jest.spyOn(HttpUtils, 'xhr').mockImplementationOnce(() =>
            Onyx.merge(ONYXKEYS.SESSION, {accountID: 2, authToken: 'copilotToken', authTokenType: CONST.AUTH_TOKEN_TYPES.DELEGATE})
                .then(waitForBatchedUpdates)
                .then(() => ({jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED})),
        );
        const request: OnyxRequest<typeof ONYXKEYS.NETWORK> = {
            command: 'TestCommand',
            data: {apiRequestType: CONST.API_REQUEST_TYPE.MAKE_REQUEST_WITH_SIDE_EFFECTS},
            failureData: [{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.NETWORK, value: {shouldFailAllRequests: true}}],
        };

        // When the 407 is handled
        const response = await Request.processWithMiddleware(request);

        // Then the request is neither re-authenticated nor retried, and its updates are not applied to the copilot account
        expect(reauthenticate).not.toHaveBeenCalled();
        expect(xhrSpy).toHaveBeenCalledTimes(1);
        expect(response?.jsonCode).toBe(CONST.JSON_CODE.NOT_AUTHENTICATED);
        expect(request.failureData).toBeUndefined();
    });

    test('reauthenticates a request sent with the current authToken before the session account ID was updated', async () => {
        // Given a request is sent with the current copilot token while the session still has the previous account ID,
        // and the account ID is updated before the request's 407 arrives
        await Onyx.set(ONYXKEYS.SESSION, {accountID: 1, authToken: 'copilotToken', authTokenType: CONST.AUTH_TOKEN_TYPES.DELEGATE});
        await waitForBatchedUpdates();
        Request.addMiddleware(Reauthentication);
        jest.spyOn(HttpUtils, 'xhr').mockImplementationOnce(() =>
            Onyx.merge(ONYXKEYS.SESSION, {accountID: 2})
                .then(waitForBatchedUpdates)
                .then(() => ({jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED})),
        );
        jest.mocked(reauthenticate).mockResolvedValueOnce({wasSuccessful: false});

        // When the 407 is handled
        await Request.processWithMiddleware({
            command: 'TestCommand',
            data: {apiRequestType: CONST.API_REQUEST_TYPE.MAKE_REQUEST_WITH_SIDE_EFFECTS},
        });

        // Then the current session expired, so it is re-authenticated instead of being treated as another account's request
        expect(reauthenticate).toHaveBeenCalledTimes(1);
    });

    test('does not retry a request under a copilot session that started while re-authentication was in flight', async () => {
        // Given the user connects as a copilot while the re-authentication for an expired request is in flight
        await Onyx.set(ONYXKEYS.SESSION, {accountID: 1, authToken: 'expiredToken'});
        await waitForBatchedUpdates();
        Request.addMiddleware(Reauthentication);
        const xhrSpy = jest.spyOn(HttpUtils, 'xhr').mockResolvedValueOnce({jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED});
        jest.mocked(reauthenticate).mockImplementationOnce(() =>
            Onyx.merge(ONYXKEYS.SESSION, {accountID: 2, authToken: 'copilotToken', authTokenType: CONST.AUTH_TOKEN_TYPES.DELEGATE})
                .then(waitForBatchedUpdates)
                .then(() => ({wasSuccessful: true})),
        );

        // When re-authentication finishes
        const response = await Request.processWithMiddleware({
            command: 'TestCommand',
            data: {apiRequestType: CONST.API_REQUEST_TYPE.MAKE_REQUEST_WITH_SIDE_EFFECTS},
        });

        // Then the request sent for the user's own account is not retried with the copilot token
        expect(reauthenticate).toHaveBeenCalledTimes(1);
        expect(xhrSpy).toHaveBeenCalledTimes(1);
        expect(response?.jsonCode).toBe(CONST.JSON_CODE.NOT_AUTHENTICATED);
    });

    test('retries a request with the re-authenticated token when ConnectAsDelegate updated the session account before the copilot token', async () => {
        // Given a request's token expires while ConnectAsDelegate's response has already set the session's accountID to the delegator,
        // but the copilot token is not saved yet, so re-authentication issues a new token for the user's own account
        await Onyx.set(ONYXKEYS.SESSION, {accountID: 1, authToken: 'expiredToken'});
        await waitForBatchedUpdates();
        Request.addMiddleware(Reauthentication);
        const xhrSpy = jest
            .spyOn(HttpUtils, 'xhr')
            .mockImplementationOnce(() =>
                Onyx.merge(ONYXKEYS.SESSION, {accountID: 2})
                    .then(waitForBatchedUpdates)
                    .then(() => ({jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED})),
            )
            .mockResolvedValueOnce({jsonCode: CONST.JSON_CODE.SUCCESS});
        jest.mocked(reauthenticate).mockImplementationOnce(() => {
            NetworkStore.setAuthToken('newToken');
            return Promise.resolve({wasSuccessful: true});
        });

        // When re-authentication finishes
        const response = await Request.processWithMiddleware({
            command: 'TestCommand',
            data: {apiRequestType: CONST.API_REQUEST_TYPE.MAKE_REQUEST_WITH_SIDE_EFFECTS},
        });

        // Then the request is retried with the user's new token instead of being dropped as another account's request
        expect(xhrSpy).toHaveBeenCalledTimes(2);
        expect(xhrSpy.mock.calls.at(1)?.at(1)).toEqual(expect.objectContaining({authToken: 'newToken'}));
        expect(response?.jsonCode).toBe(CONST.JSON_CODE.SUCCESS);
    });

    test('reauthenticates a request that carries its own authToken instead of retrying it with that token', async () => {
        // Given a request that sends its own authToken, which differs from the session's current token
        await Onyx.set(ONYXKEYS.SESSION, {accountID: 1, authToken: 'currentToken'});
        await waitForBatchedUpdates();
        Request.addMiddleware(Reauthentication);
        const xhrSpy = jest.spyOn(HttpUtils, 'xhr').mockResolvedValueOnce({jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED});
        jest.mocked(reauthenticate).mockResolvedValueOnce({wasSuccessful: false});

        // When its 407 is handled
        await Request.processWithMiddleware({
            command: 'TestCommand',
            data: {apiRequestType: CONST.API_REQUEST_TYPE.MAKE_REQUEST_WITH_SIDE_EFFECTS, authToken: 'ownToken'},
        });

        // Then it goes through re-authentication, because retrying would send the same token again and fail forever
        expect(reauthenticate).toHaveBeenCalledTimes(1);
        expect(xhrSpy).toHaveBeenCalledTimes(1);
    });

    test('gives every retry of one re-authentication flow the token the flow started with', async () => {
        // Given Authenticate fails once on the network, and the user connects as a copilot during the backoff
        await Onyx.set(ONYXKEYS.SESSION, {accountID: 1, authToken: 'expiredToken'});
        await waitForBatchedUpdates();
        const sleepSpy = jest.spyOn(RequestThrottle.prototype, 'sleep').mockImplementationOnce(() => {
            NetworkStore.setAuthToken('copilotToken');
            return Promise.resolve();
        });
        jest.mocked(reauthenticate).mockRejectedValueOnce(new Error(CONST.ERROR.FAILED_TO_FETCH)).mockResolvedValueOnce({wasSuccessful: false});

        try {
            // When an expired request starts re-authentication
            await Reauthentication(Promise.resolve({jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED}), {command: 'TestCommand', data: {apiRequestType: CONST.API_REQUEST_TYPE.READ}}, false);

            // Then the retry compares against the original token, so it can tell that the session changed
            expect(jest.mocked(reauthenticate).mock.calls.map((call) => call.at(1))).toEqual(['expiredToken', 'expiredToken']);
        } finally {
            sleepSpy.mockRestore();
            resetReauthentication();
        }
    });

    test('does not sign out a session that switched while re-authentication ran out of retries', async () => {
        // Given every Authenticate attempt fails on the network, and the user connects as a copilot while it retries
        await Onyx.set(ONYXKEYS.SESSION, {accountID: 1, authToken: 'expiredToken'});
        await waitForBatchedUpdates();
        jest.mocked(reauthenticate).mockImplementationOnce(() => {
            NetworkStore.setAuthToken('copilotToken');
            return Promise.reject(new Error(CONST.ERROR.FAILED_TO_FETCH));
        });
        const sleepSpy = jest.spyOn(RequestThrottle.prototype, 'sleep').mockRejectedValueOnce(undefined);
        const reconnectSpy = jest.spyOn(Reconnect, 'reconnect').mockImplementation(() => {});

        try {
            // When the retries run out
            await Reauthentication(Promise.resolve({jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED}), {command: 'TestCommand', data: {apiRequestType: CONST.API_REQUEST_TYPE.READ}}, false);

            // Then the failure belongs to the previous session, so the copilot session is not signed out
            expect(redirectToSignIn).not.toHaveBeenCalled();
            expect(trackAuthenticationError).not.toHaveBeenCalled();
        } finally {
            sleepSpy.mockRestore();
            reconnectSpy.mockRestore();
            resetReauthentication();
        }
    });

    test('removes a queued write sent for another account instead of retrying it under the copilot account', async () => {
        // Given a queued write is sent with the user's own token and they connect as a copilot before its 407 arrives
        await Onyx.set(ONYXKEYS.SESSION, {accountID: 1, authToken: 'expiredToken'});
        await waitForBatchedUpdates();
        Request.addMiddleware(Reauthentication);
        const xhrSpy = jest.spyOn(HttpUtils, 'xhr').mockImplementationOnce(() =>
            Onyx.merge(ONYXKEYS.SESSION, {accountID: 2, authToken: 'copilotToken', authTokenType: CONST.AUTH_TOKEN_TYPES.DELEGATE})
                .then(waitForBatchedUpdates)
                .then(() => ({jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED})),
        );
        const request: OnyxRequest<typeof ONYXKEYS.NETWORK> = {
            command: 'TestCommand',
            data: {apiRequestType: CONST.API_REQUEST_TYPE.WRITE},
            failureData: [{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.NETWORK, value: {shouldFailAllRequests: true}}],
        };

        // When the 407 is handled by the sequential queue
        const response = await Request.processWithMiddleware(request, true);

        // Then the write resolves so the queue removes it, and it is never sent with the copilot token
        expect(reauthenticate).not.toHaveBeenCalled();
        expect(xhrSpy).toHaveBeenCalledTimes(1);
        expect(response?.jsonCode).toBe(CONST.JSON_CODE.NOT_AUTHENTICATED);
        expect(request.failureData).toBeUndefined();
    });

    test('retries a queued write with the current authToken when another request already replaced it', async () => {
        // Given a queued write is sent with a token that another request's re-authentication replaces before its 407 arrives
        await Onyx.set(ONYXKEYS.SESSION, {accountID: 1, authToken: 'expiredToken'});
        await waitForBatchedUpdates();
        Request.addMiddleware(Reauthentication);
        const xhrSpy = jest
            .spyOn(HttpUtils, 'xhr')
            .mockImplementationOnce(() => {
                NetworkStore.setAuthToken('newToken');
                return Promise.resolve({jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED});
            })
            .mockResolvedValueOnce({jsonCode: CONST.JSON_CODE.SUCCESS});

        // When the sequential queue handles the 407
        const response = await Request.processWithMiddleware({command: 'TestCommand', data: {apiRequestType: CONST.API_REQUEST_TYPE.WRITE}}, true);

        // Then the write is sent again with the current token without starting another re-authentication
        expect(reauthenticate).not.toHaveBeenCalled();
        expect(xhrSpy).toHaveBeenCalledTimes(2);
        expect(xhrSpy.mock.calls.at(1)?.at(1)).toEqual(expect.objectContaining({authToken: 'newToken'}));
        expect(response?.jsonCode).toBe(CONST.JSON_CODE.SUCCESS);
    });

    test('should give each reauthentication flow a fresh retry budget', async () => {
        // Given three separate expired-session flows where each Authenticate fails 4 times before it succeeds,
        // so the failures add up to more than MAX_REQUEST_RETRIES across the session but not within one flow
        jest.useFakeTimers({doNotFake: ['nextTick', 'setImmediate']});
        const reconnectSpy = jest.spyOn(Reconnect, 'reconnect').mockImplementation(() => {});
        const failuresPerFlow = 4;
        const flowCount = 3;
        expect(failuresPerFlow * flowCount).toBeGreaterThan(CONST.NETWORK.MAX_REQUEST_RETRIES);

        try {
            for (let flow = 0; flow < flowCount; flow++) {
                for (let failure = 0; failure < failuresPerFlow; failure++) {
                    jest.mocked(reauthenticate).mockRejectedValueOnce(new Error(CONST.ERROR.FAILED_TO_FETCH));
                }
                jest.mocked(reauthenticate).mockResolvedValueOnce({wasSuccessful: true});

                // When a READ request hits an expired session and the retries run out their backoff timers
                const middlewarePromise = Reauthentication(
                    Promise.resolve({jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED}),
                    {command: 'TestCommand', data: {apiRequestType: CONST.API_REQUEST_TYPE.READ}},
                    false,
                );
                await jest.runAllTimersAsync();
                await middlewarePromise;
            }

            // Then every flow reauthenticates and the user is never signed out
            expect(reauthenticate).toHaveBeenCalledTimes(flowCount * (failuresPerFlow + 1));
            expect(reconnectSpy).toHaveBeenCalledTimes(flowCount);
            expect(redirectToSignIn).not.toHaveBeenCalled();
        } finally {
            jest.mocked(reauthenticate).mockReset();
            reconnectSpy.mockRestore();
            jest.useRealTimers();
        }
    });
});
