import _ from 'underscore';
import Onyx from 'react-native-onyx';

import {
    beforeEach, jest, test, expect, afterEach,
} from '@jest/globals';
import * as API from '../../src/libs/API';
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

// Set up manual mocks for methods used in the actions so our test does not fail.
jest.mock('../../src/libs/Notification/PushNotification', () => ({
    // There is no need for a jest.fn() since we don't need to make assertions against it.
    register: () => {},
    deregister: () => {},
}));

jest.useFakeTimers();

Onyx.init({
    keys: ONYXKEYS,
});

const originalXHR = HttpUtils.xhr;

beforeEach(() => {
    HttpUtils.xhr = originalXHR;
    PersistedRequests.clear();
    Network.clearRequestQueue();
    return Onyx.clear().then(waitForPromisesToResolve);
});

afterEach(() => {
    NetworkStore.setHasReadRequiredDataFromStorage(false);
    Onyx.addDelayToConnectCallback(0);
    jest.clearAllMocks();
});

test('failing to reauthenticate while experiencing a networking issue should not log out user', () => {
    // Given a test user login and account ID
    const TEST_USER_LOGIN = 'test@testguy.com';
    const TEST_USER_ACCOUNT_ID = 1;

    let session;
    Onyx.connect({
        key: ONYXKEYS.SESSION,
        callback: (val) => {
            session = val;
        },
    });

    // Given a test user login and account ID
    return TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN)
        .then(() => {
            // Mock fetch() so that it throws a TypeError to simulate a bad network connection
            global.fetch = jest.fn(() => new Promise((_resolve, reject) => reject(new TypeError(CONST.ERROR.FAILED_TO_FETCH))));

            const actualXhr = HttpUtils.xhr;
            HttpUtils.xhr = jest.fn();
            HttpUtils.xhr
                .mockImplementationOnce(() => Promise.resolve({
                    jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED,
                }))

                // Fail the call to re-authenticate with a "Failed to fetch" error
                .mockImplementationOnce(actualXhr);

            // This should first trigger re-authentication and then an API is offline error, but we should go no further than that.
            // This is a pretty rare case, but basically if a user gets a Fetch error while trying to authenticate we should make sure they
            // do not get logged out.
            API.Get({returnValueList: 'chatList'});
            return waitForPromisesToResolve()
                .then(() => {
                    // Advance the network request queue by 1 second so that it can realize it's back online
                    jest.advanceTimersByTime(CONST.NETWORK.PROCESS_REQUEST_DELAY_MS);
                    return waitForPromisesToResolve();
                })
                .then(() => {
                    // We should just have 1 call to Get and 1 call to Authenticate
                    const callsToChatList = _.filter(HttpUtils.xhr.mock.calls, ([command, params]) => (
                        command === 'Get' && params.returnValueList === 'chatList'
                    ));
                    const callsToAuthenticate = _.filter(HttpUtils.xhr.mock.calls, ([command]) => (
                        command === 'Authenticate'
                    ));

                    expect(callsToChatList.length).toBe(1);
                    expect(callsToAuthenticate.length).toBe(1);
                    expect(session.authToken).toBeTruthy();
                    expect(session.accountID).toBe(TEST_USER_ACCOUNT_ID);
                    expect(session.email).toBe(TEST_USER_LOGIN);
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

                // This will make the first call to API.Get() return with an expired session code
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

                // The request to Authenticate should succeed and we mock the responses for the remaining calls in the order that we make them
                .mockImplementationOnce(() => Promise.resolve({
                    jsonCode: CONST.JSON_CODE.SUCCESS,
                    authToken: 'qwerty12345',
                }))

                // Get&returnValueList=chatList
                .mockImplementationOnce(() => Promise.resolve({
                    jsonCode: CONST.JSON_CODE.SUCCESS,
                    chatList: TEST_CHAT_LIST,
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
                }));

            // And then make 3 API requests in quick succession with an expired authToken and handle the response
            API.Get({returnValueList: 'chatList'})
                .then((response) => {
                    Onyx.merge('test_chatList', response.chatList);
                });
            API.Get({returnValueList: 'personalDetailsList'})
                .then((response) => {
                    Onyx.merge('test_personalDetailsList', response.personalDetailsList);
                });
            API.Get({returnValueList: 'account'})
                .then((response) => {
                    Onyx.merge('test_account', response.account);
                });

            return waitForPromisesToResolve();
        })
        .then(() => {
            // Wait for the next tick of main queue and wait for Onyx data to update
            jest.advanceTimersByTime(CONST.NETWORK.PROCESS_REQUEST_DELAY_MS);
            return waitForPromisesToResolve();
        }).then(() => {
            // We should expect to see seven request be made in total. 3 Get requests that initially fail. Then the call
            // to Authenticate. Followed by 3 requests to Get again.
            const callsToGet = _.filter(HttpUtils.xhr.mock.calls, ([command]) => command === 'Get');
            expect(callsToGet.length).toBe(6);

            const callsToAuthenticate = _.filter(HttpUtils.xhr.mock.calls, ([command]) => command === 'Authenticate');
            expect(callsToAuthenticate.length).toBe(1);
            expect(account).toEqual(TEST_ACCOUNT_DATA);
            expect(personalDetailsList).toEqual(TEST_PERSONAL_DETAILS);
            expect(chatList).toEqual(TEST_CHAT_LIST);
        });
});

test('retry network request if auth and credentials are not read from Onyx yet', () => {
    // In order to test an scenario where the auth token and credentials hasn't been read from storage we set
    // NetworkStore.setHasReadRequiredDataFromStorage(false) and set the session and credentials to "ready" the Network

    // Given a test user login and account ID
    const TEST_USER_LOGIN = 'test@testguy.com';

    // Given a delay to the Onyx.connect callbacks
    const ONYX_DELAY_MS = 3000;
    Onyx.addDelayToConnectCallback(ONYX_DELAY_MS);

    // Given initial state to Network
    NetworkStore.setHasReadRequiredDataFromStorage(false);

    // Given an initial value to trigger an update
    Onyx.merge(ONYXKEYS.CREDENTIALS, {login: 'test-login'});
    Onyx.merge(ONYXKEYS.SESSION, {authToken: 'test-auth-token'});

    // Given some mock functions to track the isReady
    // flag in Network and the http requests made
    const spyHttpUtilsXhr = jest.spyOn(HttpUtils, 'xhr').mockImplementation(() => Promise.resolve({}));

    // When we make an arbitrary request that can be retried
    // And we wait for the Onyx.callbacks to be set
    Session.fetchAccountDetails(TEST_USER_LOGIN);
    return waitForPromisesToResolve().then(() => {
        // Then we expect not having the Network ready and not making an http request
        expect(NetworkStore.hasReadRequiredDataFromStorage()).toBe(false);
        expect(spyHttpUtilsXhr).not.toHaveBeenCalled();

        // When we resolve Onyx.connect callbacks
        jest.advanceTimersByTime(ONYX_DELAY_MS);

        // Then we should expect call Network.setIsReady(true)
        // And We should expect not making an http request yet
        expect(NetworkStore.hasReadRequiredDataFromStorage()).toBe(true);
        expect(spyHttpUtilsXhr).not.toHaveBeenCalled();

        // When we run processNetworkRequestQueue in the setInterval of Network.js
        jest.advanceTimersByTime(CONST.NETWORK.PROCESS_REQUEST_DELAY_MS);

        // Then we should expect a retry of the network request
        expect(spyHttpUtilsXhr).toHaveBeenCalled();
    });
});

test('Network request should return an error if connection is lost while request is running', () => {
    // Given a xhr mock that will fail as if network connection dropped
    const xhr = jest.spyOn(HttpUtils, 'xhr')
        .mockImplementationOnce(() => {
            Onyx.merge(ONYXKEYS.NETWORK, {isOffline: true});
            return Promise.reject(new Error(CONST.ERROR.FAILED_TO_FETCH));
        })
        .mockResolvedValue({jsonCode: CONST.JSON_CODE.SUCCESS, fromRetriedResult: true});

    // Given a regular "retryable" request (that is bound to fail)
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
            // Then the request should only have been called once
            expect(xhr).toHaveBeenCalledTimes(1);

            // And the promise should be rejected with an API offline error
            return expect(promise).rejects.toEqual(new Error(CONST.ERROR.API_OFFLINE));
        });
});

test('requests should be persisted while offline', () => {
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
        });
});

test('requests should resume when we are online', () => {
    // // We're setting up a basic case where all requests succeed when we resume connectivity
    const xhr = jest.spyOn(HttpUtils, 'xhr').mockResolvedValue({jsonCode: CONST.JSON_CODE.SUCCESS});

    // // Given we have some requests made while we're offline
    return Onyx.set(ONYXKEYS.NETWORK, {isOffline: true})
        .then(() => {
            // When network calls with `persist` are made
            Network.post('MockCommand', {param1: 'value1', persist: true});
            Network.post('MockCommand', {param2: 'value2', persist: true});
            return waitForPromisesToResolve();
        })

        // When we resume connectivity
        .then(() => Onyx.set(ONYXKEYS.NETWORK, {isOffline: false}))
        .then(waitForPromisesToResolve)
        .then(() => {
            // Then `xhr` should be called with expected data, and the persisted queue should be empty
            expect(xhr).toHaveBeenCalledTimes(2);
            expect(xhr.mock.calls).toEqual([
                expect.arrayContaining(['MockCommand', expect.objectContaining({param1: 'value1'})]),
                expect.arrayContaining(['MockCommand', expect.objectContaining({param2: 'value2'})]),
            ]);

            const persisted = PersistedRequests.getAll();
            expect(persisted).toEqual([]);
        });
});

test('persisted request should not be cleared until a successful jsonCode response occurs', () => {
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
            Network.post('MockCommand', {param1: 'value1', persist: true});
            Network.post('MockCommand', {param2: 'value2', persist: true});
            return waitForPromisesToResolve();
        })

        // When we resume connectivity
        .then(() => Onyx.set(ONYXKEYS.NETWORK, {isOffline: false}))
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
                expect.objectContaining({command: 'MockCommand', data: expect.objectContaining({param2: 'value2'})}),
            ]);

            // When a request fails it should not be removed
            xhrCalls[1].reject(new Error(CONST.ERROR.FAILED_TO_FETCH));
            return waitForPromisesToResolve();
        })
        .then(() => {
            // One request remains and it will run again next time something triggers the sync queue to run
            expect(_.size(PersistedRequests.getAll())).toEqual(1);
            expect(PersistedRequests.getAll()).toEqual([
                expect.objectContaining({command: 'MockCommand', data: expect.objectContaining({param2: 'value2'})}),
            ]);
            return Onyx.set(ONYXKEYS.NETWORK, {isOffline: true});
        })
        .then(() => Onyx.set(ONYXKEYS.NETWORK, {isOffline: false}))
        .then(() => {
            // When run again the queue should be empty even if we get a 404 or other non-200 jsonCode
            xhrCalls[2].resolve({jsonCode: 404});
            return waitForPromisesToResolve();
        })
        .then(() => {
            expect(_.size(PersistedRequests.getAll())).toEqual(0);
        });
});

test('test bad response will log alert', () => {
    global.fetch = jest.fn()
        .mockResolvedValueOnce({ok: false, status: 502, statusText: 'Bad Gateway'});

    const logAlertSpy = jest.spyOn(Log, 'alert');

    // Given we have a request made while online
    return Onyx.set(ONYXKEYS.NETWORK, {isOffline: false})
        .then(waitForPromisesToResolve)
        .then(() => {
            Network.post('MockBadNetworkResponse', {param1: 'value1'});
            return waitForPromisesToResolve();
        })
        .then(() => {
            expect(logAlertSpy).toHaveBeenCalled();
        });
});

test('persisted request can trigger reauthentication', () => {
    // We're setting up xhr handler that rejects once with a 407 code and again with success
    const xhr = jest.spyOn(HttpUtils, 'xhr')
        .mockResolvedValue({jsonCode: CONST.JSON_CODE.SUCCESS}) // Default
        .mockResolvedValueOnce({jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED}) // Initial call to test command return 407
        .mockResolvedValueOnce({jsonCode: CONST.JSON_CODE.SUCCESS}) // Call to Authenticate return 200
        .mockResolvedValueOnce({jsonCode: CONST.JSON_CODE.SUCCESS}); // Original command return 200

    // Given we have a request made while we're offline and we have credentials available to reauthenticate
    Onyx.merge(ONYXKEYS.CREDENTIALS, {autoGeneratedLogin: 'caca', autoGeneratedPassword: 'caca'});
    return waitForPromisesToResolve()
        .then(() => Onyx.set(ONYXKEYS.NETWORK, {isOffline: true}))
        .then(() => {
            Network.post('Mock', {param1: 'value1', persist: true});
            return waitForPromisesToResolve();
        })

        // When we resume connectivity
        .then(() => Onyx.set(ONYXKEYS.NETWORK, {isOffline: false}))
        .then(waitForPromisesToResolve)
        .then(() => {
            const nonLogCalls = _.filter(xhr.mock.calls, ([commandName]) => commandName !== 'Log');

            // The request should be retried once and reauthenticate should be called the second time
            expect(nonLogCalls.length).toBe(3);

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

    return Onyx.set(ONYXKEYS.NETWORK, {isOffline: true})
        .then(() => {
            // When we queue 6 persistable commands
            Network.post('MockCommand', {content: 'value1', persist: true});
            Network.post('MockCommand', {content: 'value2', persist: true});
            Network.post('MockCommand', {content: 'value3', persist: true});
            Network.post('MockCommand', {content: 'value4', persist: true});
            Network.post('MockCommand', {content: 'value5', persist: true});
            Network.post('MockCommand', {content: 'value6', persist: true});

            // And one non-persistable
            Network.post('MockCommand', {content: 'value7'});

            return waitForPromisesToResolve();
        })
        .then(() => Onyx.set(ONYXKEYS.NETWORK, {isOffline: false}))
        .then(waitForPromisesToResolve)
        .then(() => {
            // Then expect only 6 calls to have been made and for them to be made in the order that we made them and the non-persistable
            // request isn't one of them.
            expect(xhr.mock.calls.length).toBe(6);
            expect(xhr.mock.calls[0][1].content).toBe('value1');
            expect(xhr.mock.calls[1][1].content).toBe('value2');
            expect(xhr.mock.calls[2][1].content).toBe('value3');
            expect(xhr.mock.calls[3][1].content).toBe('value4');
            expect(xhr.mock.calls[4][1].content).toBe('value5');
            expect(xhr.mock.calls[5][1].content).toBe('value6');
        });
});
