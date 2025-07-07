"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NarrowPaneContextProvider = NarrowPaneContextProvider;
var react_1 = require("react");
var NarrowPaneContext = (0, react_1.createContext)({ isInNarrowPane: false });
var IS_IN_NARROW_PANE_CONTEXT_VALUE = {
    isInNarrowPane: true,
};
function NarrowPaneContextProvider(_a) {
    var children = _a.children;
    return <NarrowPaneContext.Provider value={IS_IN_NARROW_PANE_CONTEXT_VALUE}>{children}</NarrowPaneContext.Provider>;
}
exports.default = NarrowPaneContext;
