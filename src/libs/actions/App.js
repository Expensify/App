import {AppState, Linking} from 'react-native';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import CONST from '../../CONST';
import Log from '../Log';
import CONFIG from '../../CONFIG';
import Performance from '../Performance';
import Timing from './Timing';

let currentUserAccountID;
let currentUserEmail;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        currentUserAccountID = lodashGet(val, 'accountID', '');
        currentUserEmail = lodashGet(val, 'email', '');
    },
});

let isSidebarLoaded;
Onyx.connect({
    key: ONYXKEYS.IS_SIDEBAR_LOADED,
    callback: val => isSidebarLoaded = val,
    initWithStoredValues: false,
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
    if (currentUserAccountID) {
        API.PreferredLocale_Update({name: 'preferredLocale', value: locale});
    }
    Onyx.merge(ONYXKEYS.NVP_PREFERRED_LOCALE, locale);
}

/**
 * This links to a page in e.com ensuring the user is logged in.
 * It does so by getting a validate code and redirecting to the validate URL with exitTo set to the URL
 * we want to visit
 * @param {string} url relative URL starting with `/` to open in expensify.com
 */
function openSignedInLink(url = '') {
    API.GetShortLivedAuthToken().then(({shortLivedAuthToken}) => {
        Linking.openURL(`${CONFIG.EXPENSIFY.URL_EXPENSIFY_COM}${url}${url.indexOf('?') === -1 ? '?' : '&'}authToken=${shortLivedAuthToken}&email=${encodeURIComponent(currentUserEmail)}`);
    });
}

function setSidebarLoaded() {
    if (isSidebarLoaded) {
        return;
    }

    Onyx.set(ONYXKEYS.IS_SIDEBAR_LOADED, true);
    Timing.end(CONST.TIMING.SIDEBAR_LOADED);
    Performance.markEnd(CONST.TIMING.SIDEBAR_LOADED);
    Performance.markStart(CONST.TIMING.REPORT_INITIAL_RENDER);
}

let appState;
AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState.match(/inactive|background/) && appState === 'active') {
        Log.info('Flushing logs as app is going inactive', true, {}, true);
    }
    appState = nextAppState;
});

export {
    setCurrentURL,
    setLocale,
    openSignedInLink,
    setSidebarLoaded,
};
