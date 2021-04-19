import _ from 'underscore';
import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import CONST from '../../CONST';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';

let sessionAuthToken = '';
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: val => sessionAuthToken = val ? val.authToken : '',
});

let currentlyViewedReportID = '';
Onyx.connect({
    key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
    callback: val => currentlyViewedReportID = val || '',
});

/**
 * Changes a password for a given account
 *
 * @param {String} oldPassword
 * @param {String} password
 * @returns {Promise}
 */
function changePassword(oldPassword, password) {
    Onyx.merge(ONYXKEYS.ACCOUNT, {...CONST.DEFAULT_ACCOUNT_DATA, loading: true});

    return API.ChangePassword({oldPassword, password})
        .then((response) => {
            if (response.jsonCode !== 200) {
                const error = lodashGet(response, 'message', 'Unable to change password. Please try again.');
                Onyx.merge(ONYXKEYS.ACCOUNT, {error});
            }
            return response;
        })
        .finally((response) => {
            Onyx.merge(ONYXKEYS.ACCOUNT, {loading: false});
            return response;
        });
}

function getBetas() {
    API.User_GetBetas().then((response) => {
        if (response.jsonCode === 200) {
            Onyx.set(ONYXKEYS.BETAS, response.betas);
        }
    });
}

/**
 * Fetches the data needed for user settings
 */
function getUserDetails() {
    API.Get({
        returnValueList: 'account, loginList, nameValuePairs',
        name: CONST.NVP.PAYPAL_ME_ADDRESS,
    })
        .then((response) => {
            // Update the User onyx key
            const loginList = _.where(response.loginList, {partnerName: 'expensify.com'});
            const expensifyNewsStatus = lodashGet(response, 'account.subscribed', true);
            Onyx.merge(ONYXKEYS.USER, {loginList, expensifyNewsStatus});

            // Update the nvp_payPalMeAddress NVP
            const payPalMeAddress = lodashGet(response, `nameValuePairs.${CONST.NVP.PAYPAL_ME_ADDRESS}`, '');
            Onyx.merge(ONYXKEYS.NVP_PAYPAL_ME_ADDRESS, payPalMeAddress);
        });
}

/**
 * Resends a validation link to a given login
 *
 * @param {String} login
 */
function resendValidateCode(login) {
    API.ResendValidateCode({email: login});
}

/**
 * Sets whether or not the user is subscribed to Expensify news
 *
 * @param {Boolean} subscribed
 */
function setExpensifyNewsStatus(subscribed) {
    Onyx.merge(ONYXKEYS.USER, {expensifyNewsStatus: subscribed});

    API.UpdateAccount({subscribed})
        .then((response) => {
            if (response.jsonCode !== 200) {
                Onyx.merge(ONYXKEYS.USER, {expensifyNewsStatus: !subscribed});
            }
        })
        .catch(() => {
            Onyx.merge(ONYXKEYS.USER, {expensifyNewsStatus: !subscribed});
        });
}

/**
 * Adds a secondary login to a user's account
 *
 * @param {String} login
 * @param {String} password
 * @returns {Promise}
 */
function setSecondaryLogin(login, password) {
    Onyx.merge(ONYXKEYS.ACCOUNT, {...CONST.DEFAULT_ACCOUNT_DATA, loading: true});

    return API.User_SecondaryLogin_Send({
        email: login,
        password,
    }).then((response) => {
        if (response.jsonCode === 200) {
            const loginList = _.where(response.loginList, {partnerName: 'expensify.com'});
            Onyx.merge(ONYXKEYS.USER, {loginList});
        } else {
            let error = lodashGet(response, 'message', 'Unable to add secondary login. Please try again.');

            // Replace error with a friendlier message
            if (error.includes('already belongs to an existing Expensify account.')) {
                error = 'This login already belongs to an existing Expensify account.';
            }

            Onyx.merge(ONYXKEYS.USER, {error});
        }
        return response;
    }).finally((response) => {
        Onyx.merge(ONYXKEYS.ACCOUNT, {loading: false});
        return response;
    });
}

/**
 * Validates a login given an accountID and validation code
 *
 * @param {Number} accountID
 * @param {String} validateCode
 */
function validateLogin(accountID, validateCode) {
    const isLoggedIn = !_.isEmpty(sessionAuthToken);
    const redirectRoute = isLoggedIn ? ROUTES.getReportRoute(currentlyViewedReportID) : ROUTES.SIGNIN;
    Onyx.merge(ONYXKEYS.ACCOUNT, {...CONST.DEFAULT_ACCOUNT_DATA, loading: true});

    API.ValidateEmail({
        accountID,
        validateCode,
    }).then((response) => {
        if (response.jsonCode === 200) {
            const {email} = response;

            if (isLoggedIn) {
                getUserDetails();
            } else {
                // Let the user know we've successfully validated their login
                const success = lodashGet(response, 'message', `Your secondary login ${email} has been validated.`);
                Onyx.merge(ONYXKEYS.ACCOUNT, {success});
            }
        } else {
            const error = lodashGet(response, 'message', 'Unable to validate login.');
            Onyx.merge(ONYXKEYS.ACCOUNT, {error});
        }
    }).finally(() => {
        Onyx.merge(ONYXKEYS.ACCOUNT, {loading: false});
        Navigation.navigate(redirectRoute);
    });
}

export {
    changePassword,
    getBetas,
    getUserDetails,
    resendValidateCode,
    setExpensifyNewsStatus,
    setSecondaryLogin,
    validateLogin,
};
