import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

let preferredLocale = CONST.LOCALES.DEFAULT;

/**
 * Adds event listener for changes to the locale. Callbacks are executed when the locale changes in Onyx.
 *
 * @param {Function} [callbackAfterChange]
 */
const connect = (callbackAfterChange = () => {}) => {
    Onyx.connect({
        key: ONYXKEYS.NVP_PREFERRED_LOCALE,
        callback: (val) => {
            if (!val || val === preferredLocale) {
                return;
            }

            preferredLocale = val;
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
    connect,
    getPreferredLocale,
};

export default BaseLocaleListener;
