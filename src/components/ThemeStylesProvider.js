"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useTheme_1 = require("@hooks/useTheme");
// eslint-disable-next-line no-restricted-imports
var index_1 = require("@styles/index");
var ThemeStylesContext_1 = require("@styles/theme/context/ThemeStylesContext");
// eslint-disable-next-line no-restricted-imports
var utils_1 = require("@styles/utils");
function ThemeStylesProvider(_a) {
    var children = _a.children;
    var theme = (0, useTheme_1.default)();
    var themeStyles = (0, react_1.useMemo)(function () { return (0, index_1.default)(theme); }, [theme]);
    var StyleUtils = (0, react_1.useMemo)(function () { return (0, utils_1.default)(theme, themeStyles); }, [theme, themeStyles]);
    var contextValue = (0, react_1.useMemo)(function () { return ({ styles: themeStyles, StyleUtils: StyleUtils }); }, [themeStyles, StyleUtils]);
    return <ThemeStylesContext_1.default.Provider value={contextValue}>{children}</ThemeStylesContext_1.default.Provider>;
}
ThemeStylesProvider.displayName = 'ThemeStylesProvider';
exports.default = ThemeStylesProvider;
