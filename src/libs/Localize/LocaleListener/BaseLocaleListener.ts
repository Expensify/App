import Onyx from 'react-native-onyx';
import CONST from '../../../CONST';
import ONYXKEYS from '../../../ONYXKEYS';
import BaseLocale from './types';

let preferredLocale: BaseLocale = CONST.LOCALES.DEFAULT;

/**
 * Adds event listener for changes to the locale. Callbacks are executed when the locale changes in Onyx.
 */
const connect = (callbackAfterChange: (locale?: BaseLocale) => void = () => {}) => {
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

function getPreferredLocale() {
    return preferredLocale;
}

const BaseLocaleListener = {
    connect,
    getPreferredLocale,
};

export default BaseLocaleListener;
