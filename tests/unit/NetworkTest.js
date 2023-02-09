import _ from 'underscore';
import Onyx from 'react-native-onyx';

import {
    beforeEach, describe, test, expect, afterEach,
} from '@jest/globals';
import * as DeprecatedAPI from '../../src/libs/deprecatedAPI';
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
import * as SequentialQueue from '../../src/libs/Network/SequentialQueue';
import * as MainQueue from '../../src/libs/Network/MainQueue';
import * as Request from '../../src/libs/Request';
import * as RequestThrottleMock from '../../src/libs/__mocks__/RequestThrottle';

jest.mock('../../src/libs/RequestThrottle');

jest.useFakeTimers();

Onyx.init({
    keys: ONYXKEYS,
});

const originalXHR = HttpUtils.xhr;

beforeEach(() => {
    global.fetch = TestHelper.getGlobalFetchMock();
    HttpUtils.xhr = originalXHR;
    PersistedRequests.clear();
    MainQueue.clear();

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
        return TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN)
            .then(() => {
                expect(isOffline).toBe(null);

                // Mock fetch() so that it throws a TypeError to simulate a bad network connection
                global.fetch = jest.fn().mockRejectedValue(new TypeError(CONST.ERROR.FAILED_TO_FETCH));

                const actualXhr = HttpUtils.xhr;
                HttpUtils.xhr = jest.fn();
                HttpUtils.xhr
                    .mockImplementationOnce(() => Promise.resolve({
                        jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED,
                    }))

                    // Fail the call to re-authenticate
                    .mockImplementationOnce(actualXhr)

                    // The next call should still be using the old authToken
                    .mockImplementationOnce(() => Promise.resolve({
                        jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED,
                    }))

                    // Succeed the call to set a new authToken
                    .mockImplementationOnce(() => Promise.resolve({
                        jsonCode: CONST.JSON_CODE.SUCCESS,
                        authToken: 'qwerty12345',
                    }))

                    // All remaining requests should succeed
                    .mockImplementation(() => Promise.resolve({
                        jsonCode: CONST.JSON_CODE.SUCCESS,
                    }));

                // This should first trigger re-authentication and then a Failed to fetch
                DeprecatedAPI.Get({returnValueList: 'chatList'});
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
                        const callsToChatList = _.filter(HttpUtils.xhr.mock.calls, ([command, params]) => (
                            command === 'Get' && params.returnValueList === 'chatList'
                        ));
                        const callsToAuthenticate = _.filter(HttpUtils.xhr.mock.calls, ([command]) => (
                            command === 'Authenticate'
                        ));

                        expect(callsToChatList.length).toBe(3);
                        expect(callsToAuthenticate.length).toBe(2);
                    });
            });
    });

    test('consecutive API calls eventually succeed when authToken is expired', () => {
        // Given a test user login and account ID
        const TEST_USER_LOGIN = 'test@testguy.com';
        const TEST_USER_ACCOUNT_ID = 1;
        const TEST_PERSONAL_DETAILS = {
            [TEST_USER_LOGIN]: {
                avatar: 'https://d1wpcgnaa73g0y.cloudfront.net/d77919198004a3d382b30ccc2edf037612ca2416.jpeg',
                firstName: '',
                lastName: '',
                timeZone: {automatic: true, selected: 'Europe/Amsterdam'},
                avatarThumbnail: 'https://d1wpcgnaa73g0y.cloudfront.net/d77919198004a3d382b30ccc2edf037612ca2416_128.jpeg',
            },
        };
        const TEST_ACCOUNT_DATA = {
            email: TEST_USER_LOGIN,
            isTwoFactorAuthRequired: false,
            samlRequired: false,
            samlSupported: false,
            twoFactorAuthEnabled: false,
            validated: true,
        };
        const TEST_CHAT_LIST = [1, 2, 3];

        let chatList;
        Onyx.connect({
            key: 'test_chatList',
            callback: val => chatList = val,
        });

        let account;
        Onyx.connect({
            key: 'test_account',
            callback: val => account = val,
        });

        let personalDetailsList;
        Onyx.connect({
            key: 'test_personalDetailsList',
            callback: val => personalDetailsList = val,
        });

        // When we sign in
        return TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN)
            .then(() => {
                HttpUtils.xhr = jest.fn();
                HttpUtils.xhr

                    // This will make the first call to DeprecatedAPI.Get() return with an expired session code
                    .mockImplementationOnce(() => Promise.resolve({
                        jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED,
                    }))

                    // The next 2 API calls will also fire and also return a 407
                    .mockImplementationOnce(() => Promise.resolve({
                        jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED,
                    }))

                    .mockImplementationOnce(() => Promise.resolve({
                        jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED,
                    }))

                    // The request to Authenticate should succeed and we mock the responses for the remaining calls
                    .mockImplementationOnce(() => Promise.resolve({
                        jsonCode: CONST.JSON_CODE.SUCCESS,
                        authToken: 'qwerty12345',
                    }))

                    // Get&returnValueList=personalDetailsList
                    .mockImplementationOnce(() => Promise.resolve({
                        jsonCode: CONST.JSON_CODE.SUCCESS,
                        personalDetailsList: TEST_PERSONAL_DETAILS,
                    }))

                    // Get&returnValueList=account
                    .mockImplementationOnce(() => Promise.resolve({
                        jsonCode: CONST.JSON_CODE.SUCCESS,
                        account: TEST_ACCOUNT_DATA,
                    }))

                    // Get&returnValueList=chatList
                    .mockImplementationOnce(() => Promise.resolve({
                        jsonCode: CONST.JSON_CODE.SUCCESS,
                        chatList: TEST_CHAT_LIST,
                    }));

                // And then make 3 API requests in quick succession with an expired authToken and handle the response
                DeprecatedAPI.Get({returnValueList: 'chatList'})
                    .then((response) => {
                        Onyx.merge('test_chatList', response.chatList);
                    });
                DeprecatedAPI.Get({returnValueList: 'personalDetailsList'})
                    .then((response) => {
                        Onyx.merge('test_personalDetailsList', response.personalDetailsList);
                    });
                DeprecatedAPI.Get({returnValueList: 'account'})
                    .then((response) => {
                        Onyx.merge('test_account', response.account);
                    });

                return waitForPromisesToResolve();
            })
            .then(() => {
                // We should expect to see seven request be made in total. 3 Get requests that initially fail. Then the call
                // to Authenticate. Followed by 3 requests to Get again.
                const callsToGet = _.filter(HttpUtils.xhr.mock.calls, ([command]) => command === 'Get');
                const callsToAuthenticate = _.filter(HttpUtils.xhr.mock.calls, ([command]) => command === 'Authenticate');
                expect(callsToGet.length).toBe(6);
                expect(callsToAuthenticate.length).toBe(1);
                expect(account).toEqual(TEST_ACCOUNT_DATA);
                expect(personalDetailsList).toEqual(TEST_PERSONAL_DETAILS);
                expect(chatList).toEqual(TEST_CHAT_LIST);
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
        const xhr = jest.spyOn(HttpUtils, 'xhr')
            .mockImplementationOnce(() => {
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

    test('Retryable requests should be persisted while offline', () => {
        // We don't expect calls `xhr` so we make the test fail if such call is made
        const xhr = jest.spyOn(HttpUtils, 'xhr').mockRejectedValue(new Error('Unexpected xhr call'));

        // Given we're offline
        return Onyx.set(ONYXKEYS.NETWORK, {isOffline: true})
            .then(() => {
                // When network calls with `persist` are made
                Network.post('mock command', {param1: 'value1', persist: true});
                Network.post('mock command', {param2: 'value2'});
                Network.post('mock command', {param3: 'value3', persist: true});
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Then `xhr` should not be used and requests should be persisted to storage
                expect(xhr).not.toHaveBeenCalled();

                const persisted = PersistedRequests.getAll();
                expect(persisted).toEqual([
                    expect.objectContaining({command: 'mock command', data: expect.objectContaining({param1: 'value1'})}),
                    expect.objectContaining({command: 'mock command', data: expect.objectContaining({param3: 'value3'})}),
                ]);

                PersistedRequests.clear();
                return waitForPromisesToResolve();
            })
            .then(() => {
                expect(PersistedRequests.getAll()).toEqual([]);
            });
    });

    test('Retryable requests should resume when we are online', () => {
        // We're setting up a basic case where all requests succeed when we resume connectivity
        const xhr = jest.spyOn(HttpUtils, 'xhr').mockResolvedValue({jsonCode: CONST.JSON_CODE.SUCCESS});

        // Given we have some requests made while we're offline
        return Onyx.multiSet({
            [ONYXKEYS.NETWORK]: {isOffline: true},
            [ONYXKEYS.CREDENTIALS]: {autoGeneratedLogin: 'test', autoGeneratedPassword: 'passwd'},
            [ONYXKEYS.SESSION]: {authToken: 'testToken'},
        })
            .then(() => {
                // When network calls with `persist` are made
                Network.post('mock command', {param1: 'value1', persist: true});
                Network.post('mock command', {param2: 'value2', persist: true});
                return waitForPromisesToResolve();
            })
            .then(() => {
                const persisted = PersistedRequests.getAll();
                expect(persisted).toHaveLength(2);
            })

            // When we resume connectivity
            .then(() => Onyx.set(ONYXKEYS.NETWORK, {isOffline: false}))
            .then(waitForPromisesToResolve)
            .then(() => {
                expect(NetworkStore.isOffline()).toBe(false);
                expect(SequentialQueue.isRunning()).toBe(false);

                // Then `xhr` should be called with expected data, and the persisted queue should be empty
                expect(xhr).toHaveBeenCalledTimes(2);
                expect(xhr.mock.calls).toEqual([
                    expect.arrayContaining(['mock command', expect.objectContaining({param1: 'value1'})]),
                    expect.arrayContaining(['mock command', expect.objectContaining({param2: 'value2'})]),
                ]);

                const persisted = PersistedRequests.getAll();
                expect(persisted).toEqual([]);
            });
    });

    test('persisted request should not be cleared until a backend response occurs', () => {
        // We're setting up xhr handler that will resolve calls programmatically
        const xhrCalls = [];
        const promises = [];

        jest.spyOn(HttpUtils, 'xhr')
            .mockImplementation(() => {
                promises.push(new Promise((resolve, reject) => {
                    xhrCalls.push({resolve, reject});
                }));

                return _.last(promises);
            });

        // Given we have some requests made while we're offline
        return Onyx.set(ONYXKEYS.NETWORK, {isOffline: true})
            .then(() => {
                // When network calls with `persist` are made
                Network.post('mock command', {param1: 'value1', persist: true});
                Network.post('mock command', {param2: 'value2', persist: true});
                return waitForPromisesToResolve();
            })

            // When we resume connectivity
            .then(() => Onyx.set(ONYXKEYS.NETWORK, {isOffline: false}))
            .then(waitForPromisesToResolve)
            .then(() => {
                // Then requests should remain persisted until the xhr call is resolved
                expect(_.size(PersistedRequests.getAll())).toEqual(2);

                xhrCalls[0].resolve({jsonCode: CONST.JSON_CODE.SUCCESS});
                return waitForPromisesToResolve();
            })
            .then(waitForPromisesToResolve)
            .then(() => {
                expect(_.size(PersistedRequests.getAll())).toEqual(1);
                expect(PersistedRequests.getAll()).toEqual([
                    expect.objectContaining({command: 'mock command', data: expect.objectContaining({param2: 'value2'})}),
                ]);

                // When a request fails it should be retried
                xhrCalls[1].reject(new Error(CONST.ERROR.FAILED_TO_FETCH));
                return waitForPromisesToResolve();
            })
            .then(() => {
                expect(_.size(PersistedRequests.getAll())).toEqual(1);
                expect(PersistedRequests.getAll()).toEqual([
                    expect.objectContaining({command: 'mock command', data: expect.objectContaining({param2: 'value2'})}),
                ]);

                // We need to advance past the request throttle back off timer because the request won't be retried until then
                jest.advanceTimersByTime(CONST.NETWORK.MAX_RANDOM_RETRY_WAIT_TIME);
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Finally, after it succeeds the queue should be empty
                xhrCalls[2].resolve({jsonCode: CONST.JSON_CODE.SUCCESS});
                return waitForPromisesToResolve();
            })
            .then(() => {
                expect(_.size(PersistedRequests.getAll())).toEqual(0);
            });
    });

    test('persisted requests should be retried using exponential back off', () => {
        // We're setting up xhr handler that rejects with a fetch error 3 times and then succeeds
        const xhr = jest.spyOn(HttpUtils, 'xhr')
            .mockRejectedValueOnce(new Error(CONST.ERROR.FAILED_TO_FETCH))
            .mockRejectedValueOnce(new Error(CONST.ERROR.FAILED_TO_FETCH))
            .mockRejectedValueOnce(new Error(CONST.ERROR.FAILED_TO_FETCH))
            .mockResolvedValueOnce({jsonCode: CONST.JSON_CODE.SUCCESS});

        // Given we have a request made while we're offline
        return Onyx.set(ONYXKEYS.NETWORK, {isOffline: true})
            .then(() => {
                // When network calls with `persist` are made
                Network.post('mock command', {param1: 'value1', persist: true});
                return waitForPromisesToResolve();
            })

            // When we resume connectivity
            .then(() => Onyx.set(ONYXKEYS.NETWORK, {isOffline: false}))
            .then(waitForPromisesToResolve)
            .then(() => {
                // Then there has only been one request so far
                expect(xhr).toHaveBeenCalledTimes(1);

                // And we still have 1 persisted request
                expect(_.size(PersistedRequests.getAll())).toEqual(1);
                expect(PersistedRequests.getAll()).toEqual([
                    expect.objectContaining({command: 'mock command', data: expect.objectContaining({param1: 'value1'})}),
                ]);

                // After the initial wait time
                jest.advanceTimersByTime(RequestThrottleMock.initialRequestWaitTime);
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Then we have retried the failing request
                expect(xhr).toHaveBeenCalledTimes(2);

                // Now we will double the wait time before the next retry
                jest.advanceTimersByTime(RequestThrottleMock.initialRequestWaitTime * 2);
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Then we have retried again
                expect(xhr).toHaveBeenCalledTimes(3);

                // Now we double the wait time again
                jest.advanceTimersByTime(RequestThrottleMock.initialRequestWaitTime * 2 * 2);
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Then the request is retried again
                expect(xhr).toHaveBeenCalledTimes(4);

                // The request succeeds so the queue is empty
                expect(_.size(PersistedRequests.getAll())).toEqual(0);
            });
    });

    test('responses with non 200 http status use exponential back off', () => {
        global.fetch = jest.fn()
            .mockResolvedValueOnce({ok: false, status: 500, statusText: 'Internal Server Error'})
            .mockResolvedValueOnce({ok: false, status: 500, statusText: 'Internal Server Error'})
            .mockResolvedValueOnce({ok: false, status: 500, statusText: 'Internal Server Error'})
            .mockResolvedValueOnce({jsonCode: CONST.JSON_CODE.SUCCESS});

        // Given we have a request made while we're offline
        return Onyx.set(ONYXKEYS.NETWORK, {isOffline: true})
            .then(() => {
                // When network calls with `persist` are made
                Network.post('500 request', {param1: 'value1', persist: true});
                return waitForPromisesToResolve();
            })

            // When we resume connectivity
            .then(() => Onyx.set(ONYXKEYS.NETWORK, {isOffline: false}))
            .then(waitForPromisesToResolve)
            .then(() => {
                // Then there has only been one request so far
                expect(global.fetch).toHaveBeenCalledTimes(1);

                // And we still have 1 persisted request
                expect(_.size(PersistedRequests.getAll())).toEqual(1);
                expect(PersistedRequests.getAll()).toEqual([
                    expect.objectContaining({command: '500 request', data: expect.objectContaining({param1: 'value1'})}),
                ]);

                // After the initial wait time
                jest.advanceTimersByTime(RequestThrottleMock.initialRequestWaitTime);
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Then we have retried the failing request
                expect(global.fetch).toHaveBeenCalledTimes(2);

                // Now we will double the wait time before the next retry
                jest.advanceTimersByTime(RequestThrottleMock.initialRequestWaitTime * 2);
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Then we have retried again
                expect(global.fetch).toHaveBeenCalledTimes(3);

                // Now we double the wait time again
                jest.advanceTimersByTime(RequestThrottleMock.initialRequestWaitTime * 2 * 2);
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Then the request is retried again
                expect(global.fetch).toHaveBeenCalledTimes(4);

                // The request succeeds so the queue is empty
                expect(_.size(PersistedRequests.getAll())).toEqual(0);
            });
    });

    test('test Bad Gateway status will log hmmm', () => {
        global.fetch = jest.fn()
            .mockResolvedValueOnce({ok: false, status: 502, statusText: 'Bad Gateway'});

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
        global.fetch = jest.fn()
            .mockResolvedValueOnce({ok: false, status: 418, statusText: 'I\'m a teapot'});

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
                Network.post('mock command', {param1: 'value1'})
                    .then(onResolved);
                return waitForPromisesToResolve();
            })
            .then(() => {
                const response = onResolved.mock.calls[0][0];
                expect(onResolved).toHaveBeenCalled();
                expect(response.jsonCode).toBe(CONST.JSON_CODE.UNABLE_TO_RETRY);
            });
    });

    test('persisted request can trigger reauthentication for anything retryable', () => {
        // We're setting up xhr handler that rejects once with a 407 code and again with success
        const xhr = jest.spyOn(HttpUtils, 'xhr')
            .mockResolvedValue({jsonCode: CONST.JSON_CODE.SUCCESS}) // Default
            .mockResolvedValueOnce({jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED}) // Initial call to test command return 407
            .mockResolvedValueOnce({jsonCode: CONST.JSON_CODE.SUCCESS}) // Call to Authenticate return 200
            .mockResolvedValueOnce({jsonCode: CONST.JSON_CODE.SUCCESS}); // Original command return 200

        // Given we have a request made while we're offline and we have credentials available to reauthenticate
        Onyx.merge(ONYXKEYS.CREDENTIALS, {autoGeneratedLogin: 'test', autoGeneratedPassword: 'passwd'});
        return waitForPromisesToResolve()
            .then(() => Onyx.set(ONYXKEYS.NETWORK, {isOffline: true}))
            .then(() => {
                Network.post('Mock', {param1: 'value1', persist: true, shouldRetry: true});
                return waitForPromisesToResolve();
            })

            // When we resume connectivity
            .then(() => Onyx.set(ONYXKEYS.NETWORK, {isOffline: false}))
            .then(waitForPromisesToResolve)
            .then(() => {
                const nonLogCalls = _.filter(xhr.mock.calls, ([commandName]) => commandName !== 'Log');

                // The request should be retried once and reauthenticate should be called the second time
                // expect(xhr).toHaveBeenCalledTimes(3);
                const [call1, call2, call3] = nonLogCalls;
                const [commandName1] = call1;
                const [commandName2] = call2;
                const [commandName3] = call3;
                expect(commandName1).toBe('Mock');
                expect(commandName2).toBe('Authenticate');
                expect(commandName3).toBe('Mock');
            });
    });

    test('several actions made while offline will get added in the order they are created', () => {
        // Given offline state where all requests will eventualy succeed without issue
        const xhr = jest.spyOn(HttpUtils, 'xhr')
            .mockResolvedValue({jsonCode: CONST.JSON_CODE.SUCCESS});
        return Onyx.multiSet({
            [ONYXKEYS.SESSION]: {authToken: 'anyToken'},
            [ONYXKEYS.NETWORK]: {isOffline: true},
            [ONYXKEYS.CREDENTIALS]: {autoGeneratedLogin: 'test_user', autoGeneratedPassword: 'psswd'},
        })
            .then(() => {
                // When we queue 6 persistable commands and one not persistable
                Network.post('MockCommand', {content: 'value1', persist: true});
                Network.post('MockCommand', {content: 'value2', persist: true});
                Network.post('MockCommand', {content: 'value3', persist: true});
                Network.post('MockCommand', {content: 'not-persisted'});
                Network.post('MockCommand', {content: 'value4', persist: true});
                Network.post('MockCommand', {content: 'value5', persist: true});
                Network.post('MockCommand', {content: 'value6', persist: true});

                return waitForPromisesToResolve();
            })
            .then(() => Onyx.set(ONYXKEYS.NETWORK, {isOffline: false}))
            .then(waitForPromisesToResolve)
            .then(() => {
                // Then expect only 6 calls to have been made and for them to be made in the order that we made them
                // and the non-persistable request isn't one of them
                expect(xhr.mock.calls.length).toBe(6);
                expect(xhr.mock.calls[0][1].content).toBe('value1');
                expect(xhr.mock.calls[1][1].content).toBe('value2');
                expect(xhr.mock.calls[2][1].content).toBe('value3');
                expect(xhr.mock.calls[3][1].content).toBe('value4');
                expect(xhr.mock.calls[4][1].content).toBe('value5');
                expect(xhr.mock.calls[5][1].content).toBe('value6');
            });
    });

    test('several actions made while offline will get added in the order they are created when we need to reauthenticate', () => {
        // Given offline state where all requests will eventualy succeed without issue and assumed to be valid credentials
        const xhr = jest.spyOn(HttpUtils, 'xhr')
            .mockResolvedValueOnce({jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED})
            .mockResolvedValue({jsonCode: CONST.JSON_CODE.SUCCESS});

        return Onyx.multiSet({
            [ONYXKEYS.NETWORK]: {isOffline: true},
            [ONYXKEYS.SESSION]: {authToken: 'test'},
            [ONYXKEYS.CREDENTIALS]: {autoGeneratedLogin: 'test', autoGeneratedPassword: 'passwd'},
        })
            .then(() => {
                // When we queue 6 persistable commands
                Network.post('MockCommand', {content: 'value1', persist: true});
                Network.post('MockCommand', {content: 'value2', persist: true});
                Network.post('MockCommand', {content: 'value3', persist: true});
                Network.post('MockCommand', {content: 'value4', persist: true});
                Network.post('MockCommand', {content: 'value5', persist: true});
                Network.post('MockCommand', {content: 'value6', persist: true});
                return waitForPromisesToResolve();
            })
            .then(() => Onyx.set(ONYXKEYS.NETWORK, {isOffline: false}))
            .then(waitForPromisesToResolve)
            .then(() => {
                // Then expect only 8 calls to have been made total and for them to be made in the order that we made them despite requiring reauthentication
                expect(xhr.mock.calls.length).toBe(8);
                expect(xhr.mock.calls[0][1].content).toBe('value1');

                // Our call to Authenticate will not have a "content" field
                expect(xhr.mock.calls[1][1].content).not.toBeDefined();

                // Rest of the calls have the expected params and are called in sequence
                expect(xhr.mock.calls[2][1].content).toBe('value1');
                expect(xhr.mock.calls[3][1].content).toBe('value2');
                expect(xhr.mock.calls[4][1].content).toBe('value3');
                expect(xhr.mock.calls[5][1].content).toBe('value4');
                expect(xhr.mock.calls[6][1].content).toBe('value5');
                expect(xhr.mock.calls[7][1].content).toBe('value6');
            });
    });

    test('Sequential queue will succeed if triggered while reauthentication via main queue is in progress', () => {
        // Given offline state where all requests will eventualy succeed without issue and assumed to be valid credentials
        const xhr = jest.spyOn(HttpUtils, 'xhr')
            .mockResolvedValueOnce({jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED})
            .mockResolvedValueOnce({jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED})
            .mockResolvedValue({jsonCode: CONST.JSON_CODE.SUCCESS, authToken: 'newToken'});

        return Onyx.multiSet({
            [ONYXKEYS.SESSION]: {authToken: 'oldToken'},
            [ONYXKEYS.NETWORK]: {isOffline: false},
            [ONYXKEYS.CREDENTIALS]: {autoGeneratedLogin: 'test_user', autoGeneratedPassword: 'psswd'},
        })
            .then(() => {
                // When we queue both non-persistable and persistable commands that will trigger reauthentication and go offline at the same time
                Network.post('AuthenticatePusher', {content: 'value1'});
                Onyx.set(ONYXKEYS.NETWORK, {isOffline: true});
                expect(NetworkStore.isOffline()).toBe(false);
                expect(NetworkStore.isAuthenticating()).toBe(false);
                return waitForPromisesToResolve();
            })
            .then(() => {
                Network.post('MockCommand', {persist: true});
                expect(PersistedRequests.getAll().length).toBe(1);
                expect(NetworkStore.isOffline()).toBe(true);
                expect(SequentialQueue.isRunning()).toBe(false);
                expect(NetworkStore.isAuthenticating()).toBe(false);

                // We should only have a single call at this point as the main queue is stopped since we've gone offline
                expect(xhr.mock.calls.length).toBe(1);

                // Come back from offline to trigger the sequential queue flush
                return Onyx.set(ONYXKEYS.NETWORK, {isOffline: false});
            })
            .then(() => {
                // When we wait for the sequential queue to finish
                expect(SequentialQueue.isRunning()).toBe(true);
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Then we should expect to see that...
                // The sequential queue has stopped
                expect(SequentialQueue.isRunning()).toBe(false);

                // All persisted requests have run
                expect(PersistedRequests.getAll().length).toBe(0);

                // We are not offline anymore
                expect(NetworkStore.isOffline()).toBe(false);

                // First call to xhr is the AuthenticatePusher request that could not call Authenticate because we went offline
                const [firstCommand] = xhr.mock.calls[0];
                expect(firstCommand).toBe('AuthenticatePusher');

                // Second call to xhr is the MockCommand that also failed with a 407
                const [secondCommand] = xhr.mock.calls[1];
                expect(secondCommand).toBe('MockCommand');

                // Third command should be the call to Authenticate
                const [thirdCommand] = xhr.mock.calls[2];
                expect(thirdCommand).toBe('Authenticate');

                const [fourthCommand] = xhr.mock.calls[3];
                expect(fourthCommand).toBe('MockCommand');

                // We are using the new authToken
                expect(NetworkStore.getAuthToken()).toBe('newToken');

                // We are no longer authenticating
                expect(NetworkStore.isAuthenticating()).toBe(false);
            });
    });

    test('Sequential queue will not run until credentials are read', () => {
        const xhr = jest.spyOn(HttpUtils, 'xhr');
        const processWithMiddleware = jest.spyOn(Request, 'processWithMiddleware');

        // Given a simulated a condition where the credentials have not yet been read from storage and we are offline
        return Onyx.multiSet({
            [ONYXKEYS.NETWORK]: {isOffline: true},
            [ONYXKEYS.CREDENTIALS]: {},
            [ONYXKEYS.SESSION]: null,
        })
            .then(() => {
                expect(NetworkStore.isOffline()).toBe(true);

                NetworkStore.resetHasReadRequiredDataFromStorage();

                // And queue a request while offline
                Network.post('MockCommand', {content: 'value1', persist: true});

                // Then we should expect the request to get persisted
                expect(PersistedRequests.getAll().length).toBe(1);

                // When we go online and wait for promises to resolve
                return Onyx.set(ONYXKEYS.NETWORK, {isOffline: false});
            })
            .then(waitForPromisesToResolve)
            .then(() => {
                expect(processWithMiddleware).toHaveBeenCalled();

                // Then we should not expect XHR to run
                expect(xhr).not.toHaveBeenCalled();

                // When we set our credentials and authToken
                return Onyx.multiSet({
                    [ONYXKEYS.CREDENTIALS]: {autoGeneratedLogin: 'test_user', autoGeneratedPassword: 'psswd'},
                    [ONYXKEYS.SESSION]: {authToken: 'oldToken'},
                });
            })
            .then(waitForPromisesToResolve)
            .then(() => {
                // Then we should expect XHR to run
                expect(xhr).toHaveBeenCalled();
            });
    });

    test('persistable request will move directly to the SequentialQueue when we are online and block non-persistable requests', () => {
        const xhr = jest.spyOn(HttpUtils, 'xhr');
        return Onyx.set(ONYXKEYS.NETWORK, {isOffline: false})
            .then(() => {
                // GIVEN that we are online
                expect(NetworkStore.isOffline()).toBe(false);

                // WHEN we make a request that should be retried, one that should not, and another that should
                Network.post('MockCommandOne', {persist: true});
                Network.post('MockCommandTwo');
                Network.post('MockCommandThree', {persist: true});

                // THEN the retryable requests should immediately be added to the persisted requests
                expect(PersistedRequests.getAll().length).toBe(2);

                // WHEN we wait for the queue to run and finish processing
                return waitForPromisesToResolve();
            })
            .then(() => {
                // THEN the queue should be stopped and there should be no more requests to run
                expect(SequentialQueue.isRunning()).toBe(false);
                expect(PersistedRequests.getAll().length).toBe(0);

                // And our persistable request should run before our non persistable one in a blocking way
                const firstRequest = xhr.mock.calls[0];
                const [firstRequestCommandName] = firstRequest;
                expect(firstRequestCommandName).toBe('MockCommandOne');

                const secondRequest = xhr.mock.calls[1];
                const [secondRequestCommandName] = secondRequest;
                expect(secondRequestCommandName).toBe('MockCommandThree');

                // WHEN we advance the main queue timer and wait for promises
                jest.advanceTimersByTime(CONST.NETWORK.PROCESS_REQUEST_DELAY_MS);
                return waitForPromisesToResolve();
            })
            .then(() => {
                // THEN we should see that our third (non-persistable) request has run last
                const thirdRequest = xhr.mock.calls[2];
                const [thirdRequestCommandName] = thirdRequest;
                expect(thirdRequestCommandName).toBe('MockCommandTwo');
            });
    });

    test('cancelled requests should not be retried', () => {
        const xhr = jest.spyOn(HttpUtils, 'xhr');

        // GIVEN a mock that will return a "cancelled" request error
        global.fetch = jest.fn()
            .mockRejectedValue(new DOMException('Aborted', CONST.ERROR.REQUEST_CANCELLED));

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
