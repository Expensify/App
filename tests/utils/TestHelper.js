import Onyx from 'react-native-onyx';
import CONST from '../../src/CONST';
import * as Session from '../../src/libs/actions/Session';
import HttpUtils from '../../src/libs/HttpUtils';
import ONYXKEYS from '../../src/ONYXKEYS';
import waitForPromisesToResolve from './waitForPromisesToResolve';
import * as ReportUtils from '../../src/libs/ReportUtils';

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

/**
 * @param {String} login
 * @param {Number} accountID
 * @returns {Promise}
 */
function setPersonalDetails(login, accountID) {
    const avatar = ReportUtils.getDefaultAvatar(login);
    const details = {
        accountID,
        login,
        avatar,
        displayName: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        pronouns: '',
        timezone: CONST.DEFAULT_TIME_ZONE,
        payPalMeAddress: '',
        phoneNumber: '',
        avatarThumbnail: avatar,
    };
    Onyx.merge(ONYXKEYS.PERSONAL_DETAILS, {
        [login]: details,
    });
    return waitForPromisesToResolve();
}

export {
    getGlobalFetchMock,
    signInWithTestUser,
    setPersonalDetails,
};
