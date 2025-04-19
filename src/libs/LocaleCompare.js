
exports.__esModule = true;
const react_native_onyx_1 = require('react-native-onyx');
const CONST_1 = require('@src/CONST');
const ONYXKEYS_1 = require('@src/ONYXKEYS');

const COLLATOR_OPTIONS = {usage: 'sort', sensitivity: 'base'};
let collator = new Intl.Collator(CONST_1['default'].LOCALES.DEFAULT, COLLATOR_OPTIONS);
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].NVP_PREFERRED_LOCALE,
    callback (locale) {
        collator = new Intl.Collator(locale !== null && locale !== void 0 ? locale : CONST_1['default'].LOCALES.DEFAULT, COLLATOR_OPTIONS);
    },
});
/**
 * This is a wrapper around the localeCompare function that uses the preferred locale from the user's settings.
 *
 * It re-uses Intl.Collator with static options for performance reasons. See https://github.com/facebook/hermes/issues/867 for more details.
 * @param a
 * @param b
 * @returns -1 if a < b, 1 if a > b, 0 if a === b
 */
function localeCompare(a, b) {
    return collator.compare(a, b);
}
exports['default'] = localeCompare;
