import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';

let isSidebarLoaded;
let sidebarLoadedCallback;

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

function onSidebarLoaded(callback) {
    sidebarLoadedCallback = callback;
}

function setSidebarLoaded() {
    if (isSidebarLoaded) {
        return;
    }

    sidebarLoadedCallback();
    Onyx.set(ONYXKEYS.IS_SIDEBAR_LOADED, true);
}

export {
    setCurrentURL,
    setLocale,
    setSidebarLoaded,
    onSidebarLoaded,
};
