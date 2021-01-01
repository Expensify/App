import {fetchAccountDetails, signIn} from '../../src/libs/actions/Session';
import * as API from '../../src/libs/API';
import HttpUtils from '../../src/libs/HttpUtils';

/**
 * Method which waits for all asynchronous JS to stop executing before proceeding. This helps test things like actions
 * that expect some Onyx value to be available. This way we do not have to explicitly wait for an action to finish
 * (e.g. by making it a promise and waiting for it to resolve).
 *
 * @returns {Promise}
 */
const waitForPromisesToResolve = () => new Promise(setImmediate);

// Set up manual mocks for methods used in the actions so our test does not fail.
jest.mock('../../src/libs/Notification/PushNotification', () => ({
    register: () => {},
}));

// We are mocking this method so that we can later test to see if it was called and what arguments it was called with.
// We test HttpUtils.xhr() since this means that our API command turned into a network request and isn't only queued.
jest.mock('../../src/libs/HttpUtils', () => ({
    xhr: jest.fn(),
}));

test('Authenticate is called with saved credentials when a session expires', () => {
    const TEST_USER_LOGIN = 'test@testguy.com';

    // Set up mock responses for all APIs that will be called. The next time this command is called it will return
    // jsonCode: 200 and the response here.
    API.setMockCommand('GetAccountStatus', jest.fn(() => Promise.resolve({
        jsonCode: 200,
        accountExists: true,
        canAccessExpensifyCash: true,
        requiresTwoFactorAuth: false,
    })));

    // Simulate user entering their login and populating the credentials.login
    fetchAccountDetails(TEST_USER_LOGIN);

    // Note: In order for this test to work we must return a promise! It will pass even with
    // failing assertions if we remove the return keyword.
    return waitForPromisesToResolve()
        .then(() => {
            // Next we will simulate signing in and make sure all API calls in this flow succeed
            const authenticateMock = jest.fn(() => Promise.resolve({
                jsonCode: 200,
                accountID: 1,
                authToken: '12345',
                email: TEST_USER_LOGIN,
            }));
            API.setMockCommand('Authenticate', authenticateMock);
            API.setMockCommand('CreateLogin', () => Promise.resolve({
                jsonCode: 200,
                accountID: 1,
                authToken: '12345',
                email: TEST_USER_LOGIN,
            }));
            signIn('Password1');
            expect(authenticateMock.mock.calls.length).toBe(1);
            return waitForPromisesToResolve();
        })
        .then(() => {
            // At this point we have an authToken. To simulate it expiring we'll just make another
            // request and mock the response so it returns 407. Once this happens we should attempt
            // to Re-Authenticate with the stored credentials. We will also reset all the mocks we've set
            // so that we can test that Authenticate is getting called via HttpUtils.xhr() and not just
            // being put into the queue.
            API.resetMockCommands();
            API.setMockCommand('Get', () => Promise.resolve({
                jsonCode: 407,
            }));
            return API.Get({returnValueList: 'chatList'});
        })
        .then(() => {
            // Finally, we verify we made this request and the command is Authenticate. If this assertion
            // fails in the future it doesn't necessarily mean that Authenticate wasn't called e.g. maybe
            // another API call has been added and needs to be mocked. But if that is not the case...
            // then it's possible we are about to break the re-authentication flow.
            expect(HttpUtils.xhr.mock.calls.length).toBe(1);
            expect(HttpUtils.xhr.mock.calls[0][0]).toBe('Authenticate');
        });
});
