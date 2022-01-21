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
import * as Network from '../../src/libs/Network';
import * as Session from '../../src/libs/actions/Session';

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

beforeEach(() => Onyx.clear().then(waitForPromisesToResolve));

afterEach(() => {
    Network.setIsReady(false);
    Onyx.addDelayToConnectCallback(0);
    jest.clearAllMocks();
});

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
            global.fetch = jest.fn(() => new Promise((_resolve, reject) => reject(new TypeError('Failed to fetch'))));

            const actualXhr = HttpUtils.xhr;
            HttpUtils.xhr = jest.fn();
            HttpUtils.xhr
                .mockImplementationOnce(() => Promise.resolve({
                    jsonCode: 407,
                }))

                // Fail the call to re-authenticate
                .mockImplementationOnce(actualXhr)

                // The next call should still be using the old authToken
                .mockImplementationOnce(() => Promise.resolve({
                    jsonCode: 407,
                }))

                // Succeed the call to set a new authToken
                .mockImplementationOnce(() => Promise.resolve({
                    jsonCode: 200,
                    authToken: 'qwerty12345',
                }))

                // All remaining requests should succeed
                .mockImplementation(() => Promise.resolve({
                    jsonCode: 200,
                }));

            // This should first trigger re-authentication and then an API is offline error
            API.Get({returnValueList: 'chatList'});
            return waitForPromisesToResolve()
                .then(() => Onyx.set(ONYXKEYS.NETWORK, {isOffline: false}))
                .then(() => {
                    expect(isOffline).toBe(false);

                    // Advance the network request queue by 1 second so that it can realize it's back online
                    jest.advanceTimersByTime(1000);
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

                // This will make the first call to API.Get() return with an expired session code
                .mockImplementationOnce(() => Promise.resolve({
                    jsonCode: 407,
                }))

                // The next 2 API calls will also fire and also return a 407
                .mockImplementationOnce(() => Promise.resolve({
                    jsonCode: 407,
                }))

                .mockImplementationOnce(() => Promise.resolve({
                    jsonCode: 407,
                }))

                // The request to Authenticate should succeed and we mock the responses for the remaining calls
                .mockImplementationOnce(() => Promise.resolve({
                    jsonCode: 200,
                    authToken: 'qwerty12345',
                }))

                // Get&returnValueList=personalDetailsList
                .mockImplementationOnce(() => Promise.resolve({
                    jsonCode: 200,
                    personalDetailsList: TEST_PERSONAL_DETAILS,
                }))

                // Get&returnValueList=account
                .mockImplementationOnce(() => Promise.resolve({
                    jsonCode: 200,
                    account: TEST_ACCOUNT_DATA,
                }))

                // Get&returnValueList=chatList
                .mockImplementationOnce(() => Promise.resolve({
                    jsonCode: 200,
                    chatList: TEST_CHAT_LIST,
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

test('retry network request if auth and credentials are not read from Onyx yet', () => {
    // For this test we're having difficulty creating a situation where Onyx.connect() has not yet run
    // because some Onyx.connect callbacks are already registered in API.js (which happens before this
    // unit test is setup), so in order to test an scenario where the auth token and credentials hasn't
    // been read from storage we set Network.setIsReady(false) and trigger an update in the Onyx.connect
    // callbacks registered in API.js merging an empty object.

    // Given a test user login and account ID
    const TEST_USER_LOGIN = 'test@testguy.com';

    // Given a delay to the Onyx.connect callbacks
    const ONYX_DELAY_MS = 3000;
    Onyx.addDelayToConnectCallback(ONYX_DELAY_MS);

    // Given initial state to Network
    Network.setIsReady(false);

    // Given any initial value to trigger an update
    Onyx.merge(ONYXKEYS.CREDENTIALS, {});
    Onyx.merge(ONYXKEYS.SESSION, {});

    // Given some mock functions to track the isReady
    // flag in Network and the http requests made
    const spyNetworkSetIsReady = jest.spyOn(Network, 'setIsReady');
    const spyHttpUtilsXhr = jest.spyOn(HttpUtils, 'xhr').mockImplementation(() => Promise.resolve({}));

    // When we make an arbitrary request that can be retried
    // And we wait for the Onyx.callbacks to be set
    Session.fetchAccountDetails(TEST_USER_LOGIN);
    return waitForPromisesToResolve().then(() => {
        // Then we expect not having the Network ready and not making an http request
        expect(spyNetworkSetIsReady).not.toHaveBeenCalled();
        expect(spyHttpUtilsXhr).not.toHaveBeenCalled();

        // When we resolve Onyx.connect callbacks
        jest.advanceTimersByTime(ONYX_DELAY_MS);

        // Then we should expect call Network.setIsReady(true)
        // And We should expect not making an http request yet
        expect(spyNetworkSetIsReady).toHaveBeenLastCalledWith(true);
        expect(spyHttpUtilsXhr).not.toHaveBeenCalled();

        // When we run processNetworkRequestQueue in the setInterval of Network.js
        jest.advanceTimersByTime(Network.PROCESS_REQUEST_DELAY_MS);

        // Then we should expect a retry of the network request
        expect(spyHttpUtilsXhr).toHaveBeenCalled();
    });
});

test('retry network request if connection is lost while request is running', () => {
    // Given a xhr mock that will fail as if network connection dropped
    const xhr = jest.spyOn(HttpUtils, 'xhr')
        .mockImplementationOnce(() => {
            Onyx.merge(ONYXKEYS.NETWORK, {isOffline: true});
            return Promise.reject(new Error('Network request failed'));
        })
        .mockResolvedValue({jsonCode: 200, fromRetriedResult: true});

    // Given a regular "retriable" request (that is bound to fail)
    const promise = Network.post('Get');

    return waitForPromisesToResolve()
        .then(() => {
            // When network connection is recovered
            Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
            return waitForPromisesToResolve();
        })
        .then(() => {
            // Advance the network request queue by 1 second so that it can realize it's back online
            jest.advanceTimersByTime(1000);
            return waitForPromisesToResolve();
        })
        .then(() => {
            // Then the request should be attempted again
            expect(xhr).toHaveBeenCalledTimes(2);

            // And the promise should be resolved with the 2nd call that succeeded
            return expect(promise).resolves.toEqual({jsonCode: 200, fromRetriedResult: true});
        });
});
