
exports.__esModule = true;
const react_native_onyx_1 = require('react-native-onyx');
const CONST_1 = require('@src/CONST');
const ONYXKEYS_1 = require('@src/ONYXKEYS');

let preferredLocale = CONST_1['default'].LOCALES.DEFAULT;
/**
 * Adds event listener for changes to the locale. Callbacks are executed when the locale changes in Onyx.
 */
const connect = function (callbackAfterChange) {
    if (callbackAfterChange === void 0) {
        callbackAfterChange = function () {};
    }
    react_native_onyx_1['default'].connect({
        key: ONYXKEYS_1['default'].NVP_PREFERRED_LOCALE,
        callback (val) {
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
exports['default'] = BaseLocaleListener;
