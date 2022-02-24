import {AppState} from 'react-native';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import CONST from '../../CONST';
import Log from '../Log';
import Performance from '../Performance';
import Timing from './Timing';

let currentUserAccountID;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        currentUserAccountID = lodashGet(val, 'accountID', '');
    },
});

let isSidebarLoaded;
Onyx.connect({
    key: ONYXKEYS.IS_SIDEBAR_LOADED,
    callback: val => isSidebarLoaded = val,
    initWithStoredValues: false,
});

let currentPreferredLocale;
Onyx.connect({
    key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    callback: val => currentPreferredLocale = val || CONST.DEFAULT_LOCALE,
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

function getLocale() {
    API.Get({
        returnValueList: 'nameValuePairs',
        nvpNames: ONYXKEYS.NVP_PREFERRED_LOCALE,
    }).then((response) => {
        const preferredLocale = lodashGet(response, ['nameValuePairs', 'preferredLocale'], CONST.DEFAULT_LOCALE);
        if (preferredLocale === currentPreferredLocale) {
            return;
        }

        Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, preferredLocale);
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

function triggerUpdateAvailable() {
    Onyx.set(ONYXKEYS.UPDATE_AVAILABLE, true);
}

export {
    setCurrentURL,
    setLocale,
    setSidebarLoaded,
    getLocale,
    triggerUpdateAvailable,
};
