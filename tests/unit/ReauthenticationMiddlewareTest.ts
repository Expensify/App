import {getLastRedirectToSignInTime} from '@libs/actions/SignInRedirect';
import Reauthentication, {resetReauthentication} from '@libs/Middleware/Reauthentication';
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
jest.mock('@libs/actions/SignInRedirect', () => ({
    __esModule: true,
    default: jest.fn(),
    getLastRedirectToSignInTime: jest.fn(() => 0),
}));

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
    NetworkStore.setIsAuthenticating(false);
    resetReauthentication();
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
        jest.mocked(reauthenticate).mockResolvedValueOnce(false);

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

    test('does not apply original request failure data after failed reauthentication redirects to sign-in', () => {
        jest.mocked(reauthenticate).mockResolvedValueOnce(false);

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

    test('rejects for a sequential queue write when reauthentication is unsuccessful so the request is not dropped', () => {
        jest.mocked(reauthenticate).mockResolvedValueOnce(false);

        const request: OnyxRequest<typeof ONYXKEYS.NETWORK> = {
            command: 'RenameReport',
            data: {apiRequestType: CONST.API_REQUEST_TYPE.WRITE, shouldRetry: true},
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
            true,
        )
            .then(() => {
                throw new Error('Expected the middleware to reject so the SequentialQueue keeps the request');
            })
            .catch((error: Error) => {
                expect(error.message).toBe('Failed to reauthenticate');

                // The SequentialQueue applies failureData when it finally gives up retrying, so it must stay intact here
                expect(request.failureData).not.toBeUndefined();
                expect(request.finallyData).not.toBeUndefined();
            });
    });

    test('resolves with the original response for a sequential queue write when reauthentication failed with a sign-out redirect', () => {
        jest.mocked(reauthenticate).mockResolvedValueOnce(false);
        // The failed reauthentication redirected to sign-in, so the store (incl. the persisted queue) is being cleared
        jest.mocked(getLastRedirectToSignInTime).mockReturnValueOnce(Date.now());

        const request: OnyxRequest<typeof ONYXKEYS.NETWORK> = {
            command: 'RenameReport',
            data: {apiRequestType: CONST.API_REQUEST_TYPE.WRITE, shouldRetry: true},
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.NETWORK,
                    value: {shouldFailAllRequests: true},
                },
            ],
        };

        return Reauthentication(
            Promise.resolve({
                jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED,
            }),
            request,
            true,
        ).then((response) => {
            // Resolving (not throwing) lets the queue delete the request instead of rolling it back into a store that
            // is being wiped, which would orphan it on disk for a future session.
            expect(response?.jsonCode).toBe(CONST.JSON_CODE.NOT_AUTHENTICATED);
            expect(request.failureData).toBeUndefined();
        });
    });

    test('reauthenticates a sequential queue request without apiRequestType instead of resolving it with the 407 while the authenticating flag is set', () => {
        jest.mocked(reauthenticate).mockResolvedValueOnce(false);
        NetworkStore.setIsAuthenticating(true);

        const request: OnyxRequest<typeof ONYXKEYS.NETWORK> = {
            command: 'TestCommand',
            data: {shouldRetry: true},
        };

        return Reauthentication(
            Promise.resolve({
                jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED,
            }),
            request,
            true,
        )
            .then(() => {
                throw new Error('Expected the middleware to reject so the SequentialQueue keeps the request');
            })
            .catch((error: Error) => {
                expect(error.message).toBe('Failed to reauthenticate');
                expect(reauthenticate).toHaveBeenCalled();
            })
            .finally(() => NetworkStore.setIsAuthenticating(false));
    });

    test('still replays a main queue request and resolves with the original response while the authenticating flag is set', () => {
        NetworkStore.setIsAuthenticating(true);

        const request: OnyxRequest<typeof ONYXKEYS.NETWORK> = {
            command: 'TestCommand',
            data: {shouldRetry: true},
        };

        return Reauthentication(
            Promise.resolve({
                jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED,
            }),
            request,
            false,
        )
            .then((response) => {
                expect(response?.jsonCode).toBe(CONST.JSON_CODE.NOT_AUTHENTICATED);
                expect(reauthenticate).not.toHaveBeenCalled();
            })
            .finally(() => NetworkStore.setIsAuthenticating(false));
    });

    test('starts a fresh authentication when the in-flight one has been pending for too long', () => {
        const dateNowSpy = jest.spyOn(Date, 'now');
        const startTime = 1000000000000;
        dateNowSpy.mockReturnValue(startTime);

        // The first 407 starts an authentication that never settles (e.g. an interrupted SAML sign-in)
        jest.mocked(reauthenticate).mockReturnValueOnce(new Promise<boolean>(() => {}));

        const stuckRequest: OnyxRequest<typeof ONYXKEYS.NETWORK> = {
            command: 'TestCommand',
            data: {apiRequestType: CONST.API_REQUEST_TYPE.WRITE, shouldRetry: true},
        };

        // Intentionally not returned/awaited — this promise stays pending while the authentication hangs
        Reauthentication(
            Promise.resolve({
                jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED,
            }),
            stuckRequest,
            true,
        );

        return waitForBatchedUpdates()
            .then(() => {
                expect(reauthenticate).toHaveBeenCalledTimes(1);

                // Advance past the stuck-authentication window and let the next attempt succeed
                dateNowSpy.mockReturnValue(startTime + CONST.NETWORK.MAX_AUTHENTICATION_PENDING_TIME_MS + 1);
                jest.mocked(reauthenticate).mockResolvedValueOnce(true);

                const retriedRequest: OnyxRequest<typeof ONYXKEYS.NETWORK> = {
                    command: 'TestCommand',
                    data: {apiRequestType: CONST.API_REQUEST_TYPE.WRITE, shouldRetry: true},
                };

                return Reauthentication(
                    Promise.resolve({
                        jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED,
                    }),
                    retriedRequest,
                    true,
                );
            })
            .then(() => {
                // The stale attempt was discarded and a fresh authentication ran instead of chaining onto the stuck one
                expect(reauthenticate).toHaveBeenCalledTimes(2);
            })
            .finally(() => {
                dateNowSpy.mockRestore();
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
});
