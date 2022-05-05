import * as Session from '../../src/libs/actions/Session';
import * as PersonalDetails from '../../src/libs/actions/PersonalDetails';
import HttpUtils from '../../src/libs/HttpUtils';
import waitForPromisesToResolve from './waitForPromisesToResolve';

/**
 * Simulate signing in and make sure all API calls in this flow succeed. Every time we add
 * a mockImplementationOnce() we are altering what Network.post() will return.
 *
 * @param {Number} accountID
 * @param {String} login
 * @param {String} password
 * @param {String} authToken
 * @return {Promise}
 */
function signInWithTestUser(accountID = 1, login = 'test@user.com', password = 'Password1', authToken = 'asdfqwerty') {
    const originalXhr = HttpUtils.xhr;
    HttpUtils.xhr = jest.fn();
    HttpUtils.xhr.mockImplementation(() => Promise.resolve({
        jsonCode: 200,
        accountExists: true,
        requiresTwoFactorAuth: false,
        normalizedLogin: login,
    }));

    // Simulate user entering their login and populating the credentials.login
    Session.fetchAccountDetails(login);
    return waitForPromisesToResolve()
        .then(() => {
            // First call to Authenticate
            HttpUtils.xhr
                .mockImplementationOnce(() => Promise.resolve({
                    jsonCode: 200,
                    accountID,
                    authToken,
                    email: login,
                }))

                // Next call to CreateLogin
                .mockImplementationOnce(() => Promise.resolve({
                    jsonCode: 200,
                    accountID,
                    authToken,
                    email: login,
                }));
            Session.signIn(password);
            return waitForPromisesToResolve()
                .then(() => {
                    HttpUtils.xhr = originalXhr;
                });
        });
}

/**
 * Fetch and set personal details with provided personalDetailsList
 *
 * @param {Number} accountID
 * @param {String} email
 * @param {Object} personalDetailsList
 * @returns {Promise}
 */
function fetchPersonalDetailsForTestUser(accountID, email, personalDetailsList) {
    const originalXHR = HttpUtils.xhr;
    HttpUtils.xhr = jest.fn();

    HttpUtils.xhr
        .mockImplementationOnce(() => Promise.resolve({
            accountID,
            email,
            personalDetailsList,
        }));

    PersonalDetails.fetchPersonalDetails();
    return waitForPromisesToResolve()
        .then(() => {
            HttpUtils.xhr = originalXHR;
        });
}

/**
 * Use for situations where fetch() is required.
 *
 * @example
 *
 *     beforeAll(() => {
 *         global.fetch = TestHelper.getGlobalFetchMock();
 *     });
 *
 * @returns {Function}
 */
function getGlobalFetchMock() {
    return jest.fn()
        .mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                jsonCode: 200,
            }),
        });
}

export {
    getGlobalFetchMock,
    signInWithTestUser,
    fetchPersonalDetailsForTestUser,
};
