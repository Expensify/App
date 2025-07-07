"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomStylesForChildrenContext = void 0;
var react_1 = require("react");
var CustomStylesForChildrenContext = react_1.default.createContext(null);
exports.CustomStylesForChildrenContext = CustomStylesForChildrenContext;
function CustomStylesForChildrenProvider(_a) {
    var children = _a.children, style = _a.style;
    var value = (0, react_1.useMemo)(function () { return style; }, [style]);
    return <CustomStylesForChildrenContext.Provider value={value}>{children}</CustomStylesForChildrenContext.Provider>;
}
CustomStylesForChildrenProvider.displayName = 'CustomStylesForChildrenProvider';
exports.default = CustomStylesForChildrenProvider;
