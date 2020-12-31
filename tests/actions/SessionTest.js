import {fetchAccountDetails, signIn} from '../../src/libs/actions/Session';
import * as API from '../../src/libs/API';
import HttpUtils from '../../src/libs/HttpUtils';

const waitForPromisesToResolve = () => new Promise(setImmediate);

jest.mock('../../src/libs/Notification/PushNotification', () => ({
    register: () => {},
}));

jest.mock('../../src/libs/HttpUtils', () => ({
    xhr: jest.fn(),
}));

test('Authenticate is called with saved credentials when a session expires', async () => {
    const TEST_USER_LOGIN = 'test@testguy.com';

    // Set up mock responses for all APIs that will be called
    API.setMockResponse('GetAccountStatus', {
        jsonCode: 200,
        accountExists: true,
        canAccessExpensifyCash: true,
        requiresTwoFactorAuth: false,
    });

    fetchAccountDetails(TEST_USER_LOGIN);
    await waitForPromisesToResolve();

    API.setMockResponse('Authenticate', {
        jsonCode: 200,
        accountID: 1,
        authToken: '12345',
        email: TEST_USER_LOGIN,
    });
    API.setMockResponse('CreateLogin', {
        jsonCode: 200,
        accountID: 1,
        authToken: '12345',
        email: TEST_USER_LOGIN,
    });
    signIn('Password1');
    await waitForPromisesToResolve();

    // At this point we have an authToken. To simulate it expiring we'll make another request and mock the response
    // so it returns 407. Once this happens we should attempt to Re-Authenticate with the stored credentials.
    API.setMockResponse('Get', {
        jsonCode: 407,
    });
    API.Get({returnValueList: 'chatList'});
    await waitForPromisesToResolve();

    // Verify we made this request and the command is Authenticate
    expect(HttpUtils.xhr.mock.calls.length).toBe(1);
    expect(HttpUtils.xhr.mock.calls[0][0]).toBe('Authenticate');
});
