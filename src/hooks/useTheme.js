"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ThemeContext_1 = require("@styles/theme/context/ThemeContext");
function useTheme() {
    var theme = (0, react_1.useContext)(ThemeContext_1.default);
    if (!theme) {
        throw new Error('ThemeContext was null! Are you sure that you wrapped the component under a <ThemeProvider>?');
    }
    return theme;
}
exports.default = useTheme;
