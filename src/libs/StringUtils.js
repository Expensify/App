import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';

let formatter = new Intl.ListFormat(CONST.LOCALES.DEFAULT, {style: 'long', type: 'conjunction'});
Onyx.connect({
    key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    callback: (locale) => {
        if (!locale) {
            return;
        }
        formatter = new Intl.ListFormat(locale, {style: 'long', type: 'conjunction'});
    },
});

/**
 * Converts an array of strings to a spoken list, like:
 *
 * ['rory', 'vit', 'jules'] => 'rory, vit, and jules'
 *
 * @param {Array} arr
 * @returns {String}
 */
function arrayToSpokenList(arr) {
    return formatter.format(arr);
}

export default {
    arrayToSpokenList,
};
