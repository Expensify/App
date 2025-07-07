"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var OnyxProvider_1 = require("@components/OnyxProvider");
var CONST_1 = require("@src/CONST");
function useThemePreference() {
    var preferredThemeFromStorage = (0, react_1.useContext)(OnyxProvider_1.PreferredThemeContext);
    var systemTheme = (0, react_native_1.useColorScheme)();
    var themePreference = (0, react_1.useMemo)(function () {
        var theme = preferredThemeFromStorage !== null && preferredThemeFromStorage !== void 0 ? preferredThemeFromStorage : CONST_1.default.THEME.DEFAULT;
        // If the user chooses to use the device theme settings, set the theme preference to the system theme
        return theme === CONST_1.default.THEME.SYSTEM ? (systemTheme !== null && systemTheme !== void 0 ? systemTheme : CONST_1.default.THEME.FALLBACK) : theme;
    }, [preferredThemeFromStorage, systemTheme]);
    return themePreference;
}
exports.default = useThemePreference;
