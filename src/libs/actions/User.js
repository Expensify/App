/* eslint-disable  import/prefer-default-export  */

import Onyx from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import CONST from '../../CONST';

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
 * Modifies a given login so that it matches a valid email format.
 *
 * @param {String} login
 *
 * @return {String}
 */
function normalizeLogin(login) {
    if (Str.isValidEmail(login)) {
        return login;
    }

    return login.charAt(0) === '+' ? `${login}@${CONST.SMS_DOMAIN}` : `+${login}@${CONST.SMS_DOMAIN}`;
}

export {
    getBetas,
    normalizeLogin,
};
