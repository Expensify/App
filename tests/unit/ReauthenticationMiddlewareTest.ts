import * as Reconnect from '@libs/actions/Reconnect';
import redirectToSignIn from '@libs/actions/SignInRedirect';
import Reauthentication from '@libs/Middleware/Reauthentication';
import SaveResponseInOnyx from '@libs/Middleware/SaveResponseInOnyx';
import reauthenticate from '@libs/Reauthentication';

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
jest.mock('@libs/actions/SignInRedirect');

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
});
