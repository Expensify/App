import * as API from '../../src/libs/API';
import {signInWithTestUser} from '../utils/TestHelper';
import HttpUtils from '../../src/libs/HttpUtils';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';

// Set up manual mocks for methods used in the actions so our test does not fail.
jest.mock('../../src/libs/Notification/PushNotification', () => ({
    // There is no need for a jest.fn() since we don't need to make assertions against it.
    register: () => {},
    deregister: () => {},
}));

test('consecutive API calls eventually succeed when authToken is expired', () => {
    // Given a test user and set of authToken with subscriptions to session and credentials
    const TEST_USER_LOGIN = 'test@testguy.com';
    const TEST_USER_ACCOUNT_ID = 1;

    // When we sign in
    return signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN)
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

                // The remaining requests should succeed
                .mockImplementationOnce(() => Promise.resolve({
                    jsonCode: 200,
                    authToken: 'qwerty12345',
                }))

                .mockImplementation(() => Promise.resolve({
                    jsonCode: 200,
                }));

            // And then make 3 API requests in quick succession with an expired authToken
            API.Get({returnValueList: 'chatList'});
            API.Get({returnValueList: 'personalDetailsList'});
            API.Get({returnValueList: 'account'});
            return waitForPromisesToResolve();
        })
        .then(() => {
            // We should expect to see seven request be made in total. 3 Get requests that initially fail. Then the call
            // to Authenticate. Followed by 3 requests to Get again.
            expect(HttpUtils.xhr.mock.calls.length).toBe(7);
        });
});
