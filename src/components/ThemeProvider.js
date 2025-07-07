"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var useThemePreferenceWithStaticOverride_1 = require("@hooks/useThemePreferenceWithStaticOverride");
var DomUtils_1 = require("@libs/DomUtils");
// eslint-disable-next-line no-restricted-imports
var theme_1 = require("@styles/theme");
var ThemeContext_1 = require("@styles/theme/context/ThemeContext");
function ThemeProvider(_a) {
    var children = _a.children, staticThemePreference = _a.theme;
    var themePreference = (0, useThemePreferenceWithStaticOverride_1.default)(staticThemePreference);
    var _b = (0, useDebouncedState_1.default)(themePreference), debouncedTheme = _b[1], setDebouncedTheme = _b[2];
    (0, react_1.useEffect)(function () {
        setDebouncedTheme(themePreference);
    }, [setDebouncedTheme, themePreference]);
    var theme = (0, react_1.useMemo)(function () { return theme_1.default[debouncedTheme]; }, [debouncedTheme]);
    (0, react_1.useEffect)(function () {
        /*
         * For static themes we don't want to apply the autofill input style globally
         * SignInPageLayout uses static theme and handles this differently.
         */
        if (staticThemePreference) {
            return;
        }
        DomUtils_1.default.addCSS(DomUtils_1.default.getAutofilledInputStyle(theme.text), 'autofill-input');
        // staticThemePreference as it is a property that does not change we don't need it in the dependency array
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [theme.text]);
    return <ThemeContext_1.default.Provider value={theme}>{children}</ThemeContext_1.default.Provider>;
}
ThemeProvider.displayName = 'ThemeProvider';
exports.default = ThemeProvider;
