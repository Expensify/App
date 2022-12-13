import Onyx from 'react-native-onyx';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';

let preferredLocale = CONST.DEFAULT_LOCALE;

/**
 * Adds event listener for changes to the locale so Onyx gets updated accordingly
 *
 * @param {Function} callbackAfterChange
 */
const listenForLocaleChanges = (callbackAfterChange) => {
    Onyx.connect({
        key: ONYXKEYS.NVP_PREFERRED_LOCALE,
        callback: (val) => {
            if (!val) {
                return;
            }

            preferredLocale = val;

            // Update the system context menus with the localized options.
            callbackAfterChange(val);
        },
    });
};

/*
* @return {String}
*/
function getPreferredLocale() {
    return preferredLocale;
}

const BaseLocaleListener = {
    listenForLocaleChanges,
    getPreferredLocale,
};

export default BaseLocaleListener;
