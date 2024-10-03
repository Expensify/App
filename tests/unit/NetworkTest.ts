import type {Mock} from 'jest-mock';
import MockedOnyx from 'react-native-onyx';
import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import * as PersistedRequests from '@src/libs/actions/PersistedRequests';
import * as PersonalDetails from '@src/libs/actions/PersonalDetails';
import * as Session from '@src/libs/actions/Session';
import HttpUtils from '@src/libs/HttpUtils';
import Log from '@src/libs/Log';
import * as Network from '@src/libs/Network';
import * as MainQueue from '@src/libs/Network/MainQueue';
import * as NetworkStore from '@src/libs/Network/NetworkStore';
import NetworkConnection from '@src/libs/NetworkConnection';
import ONYXKEYS from '@src/ONYXKEYS';
import type ReactNativeOnyxMock from '../../__mocks__/react-native-onyx';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

type OnResolved = (params: {jsonCode?: string | number}) => void;

const Onyx = MockedOnyx as typeof ReactNativeOnyxMock;

jest.mock('@src/libs/Log');

Onyx.init({
    keys: ONYXKEYS,
});

OnyxUpdateManager();
const originalXHR = HttpUtils.xhr;

beforeEach(() => {
    global.fetch = TestHelper.getGlobalFetchMock();
    HttpUtils.xhr = originalXHR;
    MainQueue.clear();
    HttpUtils.cancelPendingRequests();
    NetworkStore.checkRequiredData();

    // Wait for any Log command to finish and Onyx to fully clear
    return waitForBatchedUpdates()
        .then(() => PersistedRequests.clear())
        .then(() => Onyx.clear())
        .then(waitForBatchedUpdates);
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

        let isOffline: boolean;

        Onyx.connect({
            key: ONYXKEYS.NETWORK,
            callback: (val) => {
                isOffline = !!val?.isOffline;
            },
        });

        // Given a test user login and account ID
        return TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN).then(() => {
            expect(isOffline).toBe(false);

            // Mock fetch() so that it throws a TypeError to simulate a bad network connection
            global.fetch = jest.fn().mockRejectedValue(new TypeError(CONST.ERROR.FAILED_TO_FETCH));

            const actualXhr = HttpUtils.xhr;

            const mockedXhr = jest.fn();
            mockedXhr
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

            HttpUtils.xhr = mockedXhr;

            // This should first trigger re-authentication and then a Failed to fetch
            PersonalDetails.openPublicProfilePage(TEST_USER_ACCOUNT_ID);
            return waitForBatchedUpdates()
                .then(() => Onyx.set(ONYXKEYS.NETWORK, {isOffline: false}))
                .then(() => {
                    expect(isOffline).toBe(false);

                    // Advance the network request queue by 1 second so that it can realize it's back online
                    jest.advanceTimersByTime(CONST.NETWORK.PROCESS_REQUEST_DELAY_MS);
                    return waitForBatchedUpdates();
                })
                .then(() => {
                    // Then we will eventually have 1 call to OpenPublicProfilePage and 1 calls to Authenticate
                    const callsToOpenPublicProfilePage = (HttpUtils.xhr as Mock).mock.calls.filter(([command]) => command === 'OpenPublicProfilePage');
                    const callsToAuthenticate = (HttpUtils.xhr as Mock).mock.calls.filter(([command]) => command === 'Authenticate');

                    expect(callsToOpenPublicProfilePage.length).toBe(1);
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
                const mockedXhr = jest.fn();
                mockedXhr

                    // And mock the first call to openPublicProfilePage return with an expired session code
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

                HttpUtils.xhr = mockedXhr;

                // And then make 3 API READ requests in quick succession with an expired authToken and handle the response
                // It doesn't matter which requests these are really as all the response is mocked we just want to see
                // that we get re-authenticated
                PersonalDetails.openPublicProfilePage(TEST_USER_ACCOUNT_ID);
                PersonalDetails.openPublicProfilePage(TEST_USER_ACCOUNT_ID);
                PersonalDetails.openPublicProfilePage(TEST_USER_ACCOUNT_ID);
                return waitForBatchedUpdates();
            })
            .then(() => {
                // We should expect to see the three calls to OpenApp, but only one call to Authenticate.
                // And we should also see the reconnection callbacks triggered.
                const callsToopenPublicProfilePage = (HttpUtils.xhr as Mock).mock.calls.filter(([command]) => command === 'OpenPublicProfilePage');
                const callsToAuthenticate = (HttpUtils.xhr as Mock).mock.calls.filter(([command]) => command === 'Authenticate');
                expect(callsToopenPublicProfilePage.length).toBe(3);
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
        return waitForBatchedUpdates().then(() => {
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

        return waitForBatchedUpdates()
            .then(() => {
                // When network connection is recovered
                Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
                return waitForBatchedUpdates();
            })
            .then(() => {
                // Advance the network request queue by 1 second so that it can realize it's back online
                jest.advanceTimersByTime(CONST.NETWORK.PROCESS_REQUEST_DELAY_MS);
                return waitForBatchedUpdates();
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
                return waitForBatchedUpdates();
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
                return waitForBatchedUpdates();
            })
            .then(() => {
                expect(logAlertSpy).toHaveBeenCalled();
            });
    });

    test('test Failed to fetch error for non-retryable requests resolve with unable to retry jsonCode', () => {
        // Setup xhr handler that rejects once with a Failed to Fetch
        global.fetch = jest.fn().mockRejectedValue(new Error(CONST.ERROR.FAILED_TO_FETCH));
        const onResolved = jest.fn() as jest.MockedFunction<OnResolved>;

        // Given we have a request made while online
        return Onyx.set(ONYXKEYS.NETWORK, {isOffline: false})
            .then(() => {
                expect(NetworkStore.isOffline()).toBe(false);

                // When network calls with are made
                Network.post('mock command', {param1: 'value1'}).then(onResolved);
                return waitForBatchedUpdates();
            })
            .then(() => {
                const response = onResolved.mock.calls.at(0)?.at(0);
                expect(onResolved).toHaveBeenCalled();
                expect(response?.jsonCode).toBe(CONST.JSON_CODE.UNABLE_TO_RETRY);
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
                return waitForBatchedUpdates();
            })
            .then(() => {
                // THEN expect our queue to be empty and for no requests to have been retried
                expect(MainQueue.getAll().length).toBe(0);
                expect(xhr.mock.calls.length).toBe(3);
            });
    });
});
