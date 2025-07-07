"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var CustomStatusBarAndBackgroundContext_1 = require("./CustomStatusBarAndBackgroundContext");
function CustomStatusBarAndBackgroundContextProvider(_a) {
    var children = _a.children;
    var _b = (0, react_1.useState)(true), isRootStatusBarEnabled = _b[0], setRootStatusBarEnabled = _b[1];
    var value = (0, react_1.useMemo)(function () { return ({
        isRootStatusBarEnabled: isRootStatusBarEnabled,
        setRootStatusBarEnabled: setRootStatusBarEnabled,
    }); }, [isRootStatusBarEnabled]);
    return <CustomStatusBarAndBackgroundContext_1.default.Provider value={value}>{children}</CustomStatusBarAndBackgroundContext_1.default.Provider>;
}
exports.default = CustomStatusBarAndBackgroundContextProvider;
