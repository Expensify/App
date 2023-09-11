import _ from 'underscore';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import HttpUtils from '../../src/libs/HttpUtils';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import ONYXKEYS from '../../src/ONYXKEYS';
import CONST from '../../src/CONST';
import * as Network from '../../src/libs/Network';
import * as NetworkStore from '../../src/libs/Network/NetworkStore';
import * as Session from '../../src/libs/actions/Session';
import * as PersistedRequests from '../../src/libs/actions/PersistedRequests';
import Log from '../../src/libs/Log';
import * as MainQueue from '../../src/libs/Network/MainQueue';
import * as App from '../../src/libs/actions/App';
import NetworkConnection from '../../src/libs/NetworkConnection';

jest.mock('../../src/libs/Log');
jest.useFakeTimers();

Onyx.init({
    keys: ONYXKEYS,
});

const originalXHR = HttpUtils.xhr;

beforeEach(() => {
    global.fetch = TestHelper.getGlobalFetchMock();
    HttpUtils.xhr = originalXHR;
    MainQueue.clear();
    HttpUtils.cancelPendingRequests();
    PersistedRequests.clear();
    NetworkStore.checkRequiredData();

    // Wait for any Log command to finish and Onyx to fully clear
    jest.advanceTimersByTime(CONST.NETWORK.PROCESS_REQUEST_DELAY_MS);
    return waitForPromisesToResolve()
        .then(() => Onyx.clear())
        .then(waitForPromisesToResolve);
});

afterEach(() => {
    NetworkStore.resetHasReadRequiredDataFromStorage();
    Onyx.addDelayToConnectCallback(0);
    jest.clearAllMocks();
});

describe('NetworkTests', () => {
    test('failing to reauthenticate while offline should not log out user', () => {
        // Given a test user login and account ID
        const TEST_USER_LOGIN = 'test@testguy.com';
        const TEST_USER_ACCOUNT_ID = 1;

        let isOffline;

        Onyx.connect({
            key: ONYXKEYS.NETWORK,
            callback: (val) => {
                isOffline = val && val.isOffline;
            },
        });

        // Given a test user login and account ID
        return TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN).then(() => {
            expect(isOffline).toBe(null);

            // Mock fetch() so that it throws a TypeError to simulate a bad network connection
            global.fetch = jest.fn().mockRejectedValue(new TypeError(CONST.ERROR.FAILED_TO_FETCH));

            const actualXhr = HttpUtils.xhr;
            HttpUtils.xhr = jest.fn();
            HttpUtils.xhr
                .mockImplementationOnce(() =>
                    Promise.resolve({
                        jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED,
                    }),
                )

                // Fail the call to re-authenticate
                .mockImplementationOnce(actualXhr)

                // The next call should still be using the old authToken
                .mockImplementationOnce(() =>
                    Promise.resolve({
                        jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED,
                    }),
                )

                // Succeed the call to set a new authToken
                .mockImplementationOnce(() =>
                    Promise.resolve({
                        jsonCode: CONST.JSON_CODE.SUCCESS,
                        authToken: 'qwerty12345',
                    }),
                )

                // All remaining requests should succeed
                .mockImplementation(() =>
                    Promise.resolve({
                        jsonCode: CONST.JSON_CODE.SUCCESS,
                    }),
                );

            // This should first trigger re-authentication and then a Failed to fetch
            App.confirmReadyToOpenApp();
            App.openApp();
            return waitForPromisesToResolve()
                .then(() => Onyx.set(ONYXKEYS.NETWORK, {isOffline: false}))
                .then(() => {
                    expect(isOffline).toBe(false);

                    // Advance the network request queue by 1 second so that it can realize it's back online
                    jest.advanceTimersByTime(CONST.NETWORK.PROCESS_REQUEST_DELAY_MS);
                    return waitForPromisesToResolve();
                })
                .then(() => {
                    // Then we will eventually have 3 calls to chatList and 2 calls to Authenticate
                    const callsToOpenApp = _.filter(HttpUtils.xhr.mock.calls, ([command]) => command === 'OpenApp');
                    const callsToAuthenticate = _.filter(HttpUtils.xhr.mock.calls, ([command]) => command === 'Authenticate');

                    expect(callsToOpenApp.length).toBe(1);
                    expect(callsToAuthenticate.length).toBe(1);
                });
        });
    });

    test('consecutive API calls eventually succeed when authToken is expired', () => {
        // Given a test user login and account ID
        const TEST_USER_LOGIN = 'test@testguy.com';
        const TEST_USER_ACCOUNT_ID = 1;

        const reconnectionCallbacksSpy = jest.spyOn(NetworkConnection, 'triggerReconnectionCallbacks');
        expect(reconnectionCallbacksSpy.mock.calls.length).toBe(0);

        // When we sign in
        return TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN)
            .then(() => {
                HttpUtils.xhr = jest.fn();
                HttpUtils.xhr

                    // And mock the first call to OpenApp return with an expired session code
                    .mockImplementationOnce(() =>
                        Promise.resolve({
                            jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED,
                        }),
                    )

                    // The next 2 API calls will also fire and also return a 407
                    .mockImplementationOnce(() =>
                        Promise.resolve({
                            jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED,
                        }),
                    )

                    .mockImplementationOnce(() =>
                        Promise.resolve({
                            jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED,
                        }),
                    )

                    // The request to Authenticate should succeed and we mock the responses for the remaining calls
                    .mockImplementationOnce(() =>
                        Promise.resolve({
                            jsonCode: CONST.JSON_CODE.SUCCESS,
                            authToken: 'qwerty12345',
                        }),
                    );

                // And then make 3 API requests in quick succession with an expired authToken and handle the response
                // It doesn't matter which requests these are really as all the response is mocked we just want to see
                // that we get re-authenticated
                App.openApp();
                App.openApp();
                App.openApp();
                return waitForPromisesToResolve();
            })
            .then(() => {
                // We should expect to see the three calls to OpenApp, but only one call to Authenticate.
                // And we should also see the reconnection callbacks triggered.
                const callsToOpenApp = _.filter(HttpUtils.xhr.mock.calls, ([command]) => command === 'OpenApp');
                const callsToAuthenticate = _.filter(HttpUtils.xhr.mock.calls, ([command]) => command === 'Authenticate');
                expect(callsToOpenApp.length).toBe(3);
                expect(callsToAuthenticate.length).toBe(1);
                expect(reconnectionCallbacksSpy.mock.calls.length).toBe(3);
            });
    });

    test('Request will not run until credentials are read from Onyx', () => {
        // In order to test an scenario where the auth token and credentials hasn't been read from storage we reset hasReadRequiredDataFromStorage
        // and set the session and credentials to "ready" the Network

        // Given a test user login and account ID
        const TEST_USER_LOGIN = 'test@testguy.com';

        // Given a delay to the Onyx.connect callbacks
        const ONYX_DELAY_MS = 3000;
        Onyx.addDelayToConnectCallback(ONYX_DELAY_MS);

        // Given initial state to Network
        NetworkStore.resetHasReadRequiredDataFromStorage();

        // Given some mock functions to track the isReady
        // flag in Network and the http requests made
        const spyHttpUtilsXhr = jest.spyOn(HttpUtils, 'xhr').mockImplementation(() => Promise.resolve({}));

        // When we make a request
        Session.beginSignIn(TEST_USER_LOGIN);

        // Then we should expect that no requests have been made yet
        expect(spyHttpUtilsXhr).not.toHaveBeenCalled();

        // Once credentials are set and we wait for promises to resolve
        Onyx.merge(ONYXKEYS.CREDENTIALS, {login: 'test-login'});
        Onyx.merge(ONYXKEYS.SESSION, {authToken: 'test-auth-token'});
        return waitForPromisesToResolve().then(() => {
            // Then we should expect the request to have been made since the network is now ready
            expect(spyHttpUtilsXhr).not.toHaveBeenCalled();
        });
    });

    test('Non-retryable request will not be retried if connection is lost in flight', () => {
        // Given a xhr mock that will fail as if network connection dropped
        const xhr = jest.spyOn(HttpUtils, 'xhr').mockImplementationOnce(() => {
            Onyx.merge(ONYXKEYS.NETWORK, {isOffline: true});
            return Promise.reject(new Error(CONST.ERROR.FAILED_TO_FETCH));
        });

        // Given a non-retryable request (that is bound to fail)
        const promise = Network.post('Get');

        return waitForPromisesToResolve()
            .then(() => {
                // When network connection is recovered
                Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Advance the network request queue by 1 second so that it can realize it's back online
                jest.advanceTimersByTime(CONST.NETWORK.PROCESS_REQUEST_DELAY_MS);
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Then the request should only have been attempted once and we should get an unable to retry
                expect(xhr).toHaveBeenCalledTimes(1);

                // And the promise should be resolved with the special offline jsonCode
                return expect(promise).resolves.toEqual({jsonCode: CONST.JSON_CODE.UNABLE_TO_RETRY});
            });
    });

    test('test Bad Gateway status will log hmmm', () => {
        global.fetch = jest.fn().mockResolvedValueOnce({ok: false, status: CONST.HTTP_STATUS.BAD_GATEWAY, statusText: 'Bad Gateway'});

        const logHmmmSpy = jest.spyOn(Log, 'hmmm');

        // Given we have a request made while online
        return Onyx.set(ONYXKEYS.NETWORK, {isOffline: false})
            .then(() => {
                Network.post('MockBadNetworkResponse', {param1: 'value1'});
                return waitForPromisesToResolve();
            })
            .then(() => {
                expect(logHmmmSpy).toHaveBeenCalled();
            });
    });

    test('test unknown status will log alert', () => {
        global.fetch = jest.fn().mockResolvedValueOnce({ok: false, status: 418, statusText: "I'm a teapot"});

        const logAlertSpy = jest.spyOn(Log, 'alert');

        // Given we have a request made while online
        return Onyx.set(ONYXKEYS.NETWORK, {isOffline: false})
            .then(() => {
                Network.post('MockBadNetworkResponse', {param1: 'value1'});
                return waitForPromisesToResolve();
            })
            .then(() => {
                expect(logAlertSpy).toHaveBeenCalled();
            });
    });

    test('test Failed to fetch error for non-retryable requests resolve with unable to retry jsonCode', () => {
        // Setup xhr handler that rejects once with a Failed to Fetch
        global.fetch = jest.fn().mockRejectedValue(new Error(CONST.ERROR.FAILED_TO_FETCH));
        const onResolved = jest.fn();

        // Given we have a request made while online
        return Onyx.set(ONYXKEYS.NETWORK, {isOffline: false})
            .then(() => {
                expect(NetworkStore.isOffline()).toBe(false);

                // When network calls with are made
                Network.post('mock command', {param1: 'value1'}).then(onResolved);
                return waitForPromisesToResolve();
            })
            .then(() => {
                const response = onResolved.mock.calls[0][0];
                expect(onResolved).toHaveBeenCalled();
                expect(response.jsonCode).toBe(CONST.JSON_CODE.UNABLE_TO_RETRY);
            });
    });

    test('cancelled requests should not be retried', () => {
        const xhr = jest.spyOn(HttpUtils, 'xhr');

        // GIVEN a mock that will return a "cancelled" request error
        global.fetch = jest.fn().mockRejectedValue(new DOMException('Aborted', CONST.ERROR.REQUEST_CANCELLED));

        return Onyx.set(ONYXKEYS.NETWORK, {isOffline: false})
            .then(() => {
                // WHEN we make a few requests and then cancel them
                Network.post('MockCommandOne');
                Network.post('MockCommandTwo');
                Network.post('MockCommandThree');

                // WHEN we wait for the requests to all cancel
                return waitForPromisesToResolve();
            })
            .then(() => {
                // THEN expect our queue to be empty and for no requests to have been retried
                expect(MainQueue.getAll().length).toBe(0);
                expect(xhr.mock.calls.length).toBe(3);
            });
    });
});
