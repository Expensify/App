import Onyx from 'react-native-onyx';
import BaseLocale, {LocaleListenerConnect} from './types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

let preferredLocale: BaseLocale = CONST.LOCALES.DEFAULT;

/**
 * Adds event listener for changes to the locale. Callbacks are executed when the locale changes in Onyx.
 */
const connect: LocaleListenerConnect = (callbackAfterChange = () => {}) => {
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

function getPreferredLocale(): BaseLocale {
    return preferredLocale;
}

const BaseLocaleListener = {
    connect,
    getPreferredLocale,
};

export default BaseLocaleListener;
