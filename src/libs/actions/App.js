import Onyx from 'react-native-onyx';
import {Linking} from 'react-native';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import CONFIG from '../../CONFIG';
import ROUTES from '../../ROUTES';

let currentUserAccountID;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        currentUserAccountID = lodashGet(val, 'accountID', '');
    },
});

/**
 * @param {String} url
 */
function setCurrentURL(url) {
    Onyx.set(ONYXKEYS.CURRENT_URL, url);
}

/**
* @param {String} locale
*/
function setLocale(locale) {
    API.PreferredLocale_Update({name: 'preferredLocale', value: locale});
    Onyx.merge(ONYXKEYS.NVP_PREFERRED_LOCALE, locale);
}

/**
 * This links to a page in e.com ensuring the user is logged in.
 * It does so by getting a validate code and redirecting to the validate URL with exitTo set to the URL
 * we want to visit
 * @param {string} url relative URL starting with `/` to open in expensify.com
 */
function openSignedInLink(url) {
    API.GetAccountValidateCode().then((response) => {
        Linking.openURL(CONFIG.EXPENSIFY.URL_EXPENSIFY_COM
            + ROUTES.VALIDATE_CODE_URL(currentUserAccountID, response.validateCode, url));
    });
}

export {
    setCurrentURL,
    setLocale,
    openSignedInLink,
};
