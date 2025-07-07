"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ThemeIllustrationsContext_1 = require("@styles/theme/context/ThemeIllustrationsContext");
function useThemeIllustrations() {
    var illustrations = (0, react_1.useContext)(ThemeIllustrationsContext_1.default);
    if (!illustrations) {
        throw new Error('ThemeIllustrationsContext was null! Are you sure that you wrapped the component under a <ThemeIllustrationsProvider>?');
    }
    return illustrations;
}
exports.default = useThemeIllustrations;
