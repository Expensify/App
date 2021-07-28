import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import Firebase from '../Firebase';
import CONST from '../../CONST';

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
    API.PreferredLocale_Update({name: 'preferredLocale', value: locale});
    Onyx.merge(ONYXKEYS.NVP_PREFERRED_LOCALE, locale);
}

function setSidebarLoaded() {
    if (isSidebarLoaded) {
        return;
    }

    Onyx.set(ONYXKEYS.IS_SIDEBAR_LOADED, true);
    Firebase.stopTrace(CONST.TIMING.SIDEBAR_LOADED);
}

export {
    setCurrentURL,
    setLocale,
    setSidebarLoaded,
};
