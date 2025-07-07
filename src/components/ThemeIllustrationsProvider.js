"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useThemePreference_1 = require("@hooks/useThemePreference");
var ThemeIllustrationsContext_1 = require("@styles/theme/context/ThemeIllustrationsContext");
// eslint-disable-next-line no-restricted-imports
var illustrations_1 = require("@styles/theme/illustrations");
function ThemeIllustrationsProvider(_a) {
    var children = _a.children;
    var themePreference = (0, useThemePreference_1.default)();
    var themeIllustrations = (0, react_1.useMemo)(function () { return illustrations_1.default[themePreference]; }, [themePreference]);
    return <ThemeIllustrationsContext_1.default.Provider value={themeIllustrations}>{children}</ThemeIllustrationsContext_1.default.Provider>;
}
ThemeIllustrationsProvider.displayName = 'ThemeIllustrationsProvider';
exports.default = ThemeIllustrationsProvider;
