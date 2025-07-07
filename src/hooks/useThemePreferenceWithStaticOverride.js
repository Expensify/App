"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var useThemePreference_1 = require("./useThemePreference");
var useThemePreferenceWithStaticOverride = function (staticThemePreference) {
    var dynamicThemePreference = (0, useThemePreference_1.default)();
    // If the "theme" prop is provided, we'll want to use a hardcoded/static theme instead of the currently selected dynamic theme
    // This is used for example on the "SignInPage", because it should always display in dark mode.
    var themePreference = staticThemePreference !== null && staticThemePreference !== void 0 ? staticThemePreference : dynamicThemePreference;
    return themePreference;
};
exports.default = useThemePreferenceWithStaticOverride;
