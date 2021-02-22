/* eslint-disable  import/prefer-default-export  */

import _ from 'underscore';
import lodashGet from 'lodash.get';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import {signIn} from './Session';

/**
 * Changes a password for a given account
 *
 * @param {String} oldPassword
 * @param {String} password
 * @param {String} [twoFactorAuthCode]
 */
function changePassword(oldPassword, password, twoFactorAuthCode) {
    API.ChangePassword({oldPassword, password}).then((response) => {
        // If we've successfully authenticated the user, ensure sign them in so they don't get booted out
        if (response.jsonCode === 200) {
            signIn(password, twoFactorAuthCode);
        } else {
            console.error('Could not change password', response);
        }
    });
}

function getBetas() {
    API.User_GetBetas().then((response) => {
        if (response.jsonCode === 200) {
            Onyx.set(ONYXKEYS.BETAS, response.betas);
        } else {
            console.error('Could not get betas', response);
        }
    });
}

/**
 * Fetches the data needed for user settings
 */
function fetch() {
    const payPalNVP = 'expensify_payPalMeAddress';
    API.Get({
        returnValueList: ['account', 'loginList', 'nameValuePairs'],
        name: payPalNVP,
    })
        .then((response) => {
            // Update the User onyx key
            const loginList = _.where(response.loginList, {partnerName: 'expensify.com'});
            const expensifyNewsStatus = lodashGet(response, 'account.subscribed', true);
            Onyx.merge(ONYXKEYS.USER, {loginList, expensifyNewsStatus});

            // Update the nvp_payPalMeAddress NVP
            const payPalMeAddress = lodashGet(response, `nameValuePairs.${payPalNVP}`, '');
            Onyx.merge(`${ONYXKEYS.COLLECTION.NVP}payPalMeAddress`, payPalMeAddress);
        })
        .catch(error => console.debug('Error fetching user settings', error));
}

/**
 * Resends a validation link to a given login
 *
 * @param {String} email
 */
function resendValidateCode(email) {
    API.ResendValidateCode({email}).then((response) => {
        if (response.jsonCode !== 200) {
            console.error('Could not resend validate code', response);
        }
    });
}

/**
 * Sets whether or not the user is subscribed to Expensify news
 *
 * @param {Boolean} subscribed
 */
function setExpensifyNewsStatus(subscribed) {
    API.UpdateAccount({subscribed}).then((response) => {
        if (response.jsonCode === 200) {
            Onyx.merge(ONYXKEYS.USER, {expensifyNewsStatus: subscribed});
        } else {
            console.error('Could not set Expensify news subscription status', response);
        }
    });
}

/**
 * Adds a secondary login to a user's account
 *
 * @param {String} login
 * @param {String} password
 */
function setSecondaryLogin(login, password) {
    API.User_SecondaryLogin_Send({
        email: login,
        password,
    }).then((response) => {
        if (response.jsonCode === 200) {
            const loginList = _.where(response.loginList, {partnerName: 'expensify.com'});
            Onyx.merge(ONYXKEYS.USER, {loginList});
        } else {
            console.error('Could not set secondary login', response);
        }
    });
}

export {
    changePassword,
    getBetas,
    fetch,
    resendValidateCode,
    setExpensifyNewsStatus,
    setSecondaryLogin,
};
