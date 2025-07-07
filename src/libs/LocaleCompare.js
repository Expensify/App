"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_onyx_1 = require("react-native-onyx");
var CONST_1 = require("@src/CONST");
var IntlStore_1 = require("@src/languages/IntlStore");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var COLLATOR_OPTIONS = { usage: 'sort', sensitivity: 'variant', numeric: true, caseFirst: 'upper' };
var collator = new Intl.Collator(CONST_1.default.LOCALES.DEFAULT, COLLATOR_OPTIONS);
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.ARE_TRANSLATIONS_LOADING,
    initWithStoredValues: false,
    callback: function (areTranslationsLoading) {
        if (areTranslationsLoading !== null && areTranslationsLoading !== void 0 ? areTranslationsLoading : true) {
            return;
        }
        var locale = IntlStore_1.default.getCurrentLocale();
        if (!locale) {
            return;
        }
        collator = new Intl.Collator(locale, COLLATOR_OPTIONS);
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
exports.default = localeCompare;
