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

    test('hands the 407 back without reauthenticating a request pinned to a server other than the active one', () => {
        // Given a request pinned to staging while the app is on production, like a LogOut sent after switching servers
        const request: OnyxRequest<typeof ONYXKEYS.NETWORK> = {
            command: 'TestCommand',
            data: {apiRequestType: CONST.API_REQUEST_TYPE.MAKE_REQUEST_WITH_SIDE_EFFECTS},
            server: CONST.SERVER.STAGING,
        };

        // When it gets a 407
        return Reauthentication(Promise.resolve({jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED}), request, false).then((response) => {
            // Then the 407 goes back to the caller and no new token is fetched, because reauthentication signs in on the
            // active server and a token from there can't work on staging
            expect(response?.jsonCode).toBe(CONST.JSON_CODE.NOT_AUTHENTICATED);
            expect(reauthenticate).not.toHaveBeenCalled();
        });
    });

    test('reauthenticates a request pinned to the active server as usual', () => {
        // Given a request pinned to production, which is also the active server
        jest.mocked(reauthenticate).mockResolvedValueOnce({wasSuccessful: false});
        const request: OnyxRequest<typeof ONYXKEYS.NETWORK> = {
            command: 'TestCommand',
            data: {apiRequestType: CONST.API_REQUEST_TYPE.MAKE_REQUEST_WITH_SIDE_EFFECTS},
            server: CONST.SERVER.PRODUCTION,
        };

        // When it gets a 407
        return Reauthentication(Promise.resolve({jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED}), request, false).then(() => {
            // Then it is reauthenticated like any other request, because the new token comes from the server it is pinned to
            expect(reauthenticate).toHaveBeenCalledTimes(1);
        });
    });

    describe('replay after a successful reauthentication', () => {
        beforeEach(() => {
            Request.addMiddleware(Reauthentication);
            jest.mocked(reauthenticate).mockResolvedValue({wasSuccessful: true});
        });

        test('replays a queued write once and resolves when the replay succeeds', () => {
            // Given a queued write whose session expired, and a server that accepts it with the fresh token
            const xhr = jest.spyOn(HttpUtils, 'xhr').mockResolvedValueOnce({jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED}).mockResolvedValue({jsonCode: CONST.JSON_CODE.SUCCESS});
            const request: OnyxRequest<typeof ONYXKEYS.NETWORK> = {
                command: 'TestCommand',
                data: {apiRequestType: CONST.API_REQUEST_TYPE.WRITE},
            };

            // When the queue sends it
            return Request.processWithMiddleware(request, true).then((response) => {
                // Then it is replayed once after reauthenticating, so a normal session expiry still recovers in place
                expect(response?.jsonCode).toBe(CONST.JSON_CODE.SUCCESS);
                expect(reauthenticate).toHaveBeenCalledTimes(1);
                expect(xhr).toHaveBeenCalledTimes(2);
            });
        });

        test('rejects a queued write that is rejected again after reauthentication instead of replaying it forever', () => {
            // Given a queued write the server keeps rejecting even with a fresh token, like a body the browser sent empty
            const xhr = jest.spyOn(HttpUtils, 'xhr').mockResolvedValue({jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED});
            const request: OnyxRequest<typeof ONYXKEYS.NETWORK> = {
                command: 'TestCommand',
                data: {apiRequestType: CONST.API_REQUEST_TYPE.WRITE},
            };

            // When the queue sends it
            return (
                expect(Request.processWithMiddleware(request, true))
                    // Then the second rejection is handed to the queue's backoff instead of reauthenticating and replaying again
                    .rejects.toThrow(CONST.ERROR.REAUTH_REPLAY_REJECTED)
                    .then(() => {
                        expect(reauthenticate).toHaveBeenCalledTimes(1);
                        expect(xhr).toHaveBeenCalledTimes(2);
                    })
            );
        });

        test('rejects the same way when the replay gets an HTTP 407', () => {
            // Given a queued write that keeps failing with an HTTP-level 407 instead of a JSON one
            const xhr = jest.spyOn(HttpUtils, 'xhr').mockRejectedValue(
                new HttpsError({
                    message: 'Proxy Authentication Required',
                    status: String(CONST.JSON_CODE.NOT_AUTHENTICATED),
                }),
            );
            const request: OnyxRequest<typeof ONYXKEYS.NETWORK> = {
                command: 'TestCommand',
                data: {apiRequestType: CONST.API_REQUEST_TYPE.WRITE},
            };

            // When the queue sends it
            return (
                expect(Request.processWithMiddleware(request, true))
                    // Then the second rejection is handed to the queue's backoff instead of reauthenticating and replaying again
                    .rejects.toThrow(CONST.ERROR.REAUTH_REPLAY_REJECTED)
                    .then(() => {
                        expect(reauthenticate).toHaveBeenCalledTimes(1);
                        expect(xhr).toHaveBeenCalledTimes(2);
                    })
            );
        });

        test('resolves a side-effect request with the 407 when the replay is rejected again', () => {
            // Given a side-effect request the server keeps rejecting even with a fresh token
            const xhr = jest.spyOn(HttpUtils, 'xhr').mockResolvedValue({jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED});
            const request: OnyxRequest<typeof ONYXKEYS.NETWORK> = {
                command: 'TestCommand',
                data: {apiRequestType: CONST.API_REQUEST_TYPE.MAKE_REQUEST_WITH_SIDE_EFFECTS},
            };

            // When it is sent outside the queue
            return Request.processWithMiddleware(request, false).then((response) => {
                // Then the caller gets the 407 after one replay, so its failure data runs instead of the request hanging
                expect(response?.jsonCode).toBe(CONST.JSON_CODE.NOT_AUTHENTICATED);
                expect(reauthenticate).toHaveBeenCalledTimes(1);
                expect(xhr).toHaveBeenCalledTimes(2);
            });
        });
    });
});
