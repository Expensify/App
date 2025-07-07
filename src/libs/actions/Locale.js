"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_onyx_1 = require("react-native-onyx");
var Localize_1 = require("@libs/Localize");
var IntlStore_1 = require("@src/languages/IntlStore");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
/* There are scenarios where locale is not loaded and we start to render UI which results in rendering translations keys instead of real translations.
 * E.g. when we transition from OldDot to NewDot during sign-out.
 * This function is used to ensure that the locale is loaded before we start to render UI. Once we load initial locale we can remove listener.
 */
function init() {
    var connection = react_native_onyx_1.default.connect({
        key: ONYXKEYS_1.default.NVP_PREFERRED_LOCALE,
        initWithStoredValues: true,
        callback: function (locale) {
            react_native_onyx_1.default.disconnect(connection);
            IntlStore_1.default.load(locale !== null && locale !== void 0 ? locale : (0, Localize_1.getDevicePreferredLocale)());
        },
    });
}
exports.default = init;
