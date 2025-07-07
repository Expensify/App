"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveElementRoleContext = void 0;
var react_1 = require("react");
var ActiveElementRoleContext = react_1.default.createContext({
    role: null,
});
exports.ActiveElementRoleContext = ActiveElementRoleContext;
function ActiveElementRoleProvider(_a) {
    var children = _a.children;
    var value = react_1.default.useMemo(function () { return ({
        role: null,
    }); }, []);
    return <ActiveElementRoleContext.Provider value={value}>{children}</ActiveElementRoleContext.Provider>;
}
exports.default = ActiveElementRoleProvider;
