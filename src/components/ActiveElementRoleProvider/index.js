"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveElementRoleContext = void 0;
var react_1 = require("react");
var ActiveElementRoleContext = react_1.default.createContext({
    role: null,
});
exports.ActiveElementRoleContext = ActiveElementRoleContext;
function ActiveElementRoleProvider(_a) {
    var _b, _c;
    var children = _a.children;
    var _d = (0, react_1.useState)((_c = (_b = document === null || document === void 0 ? void 0 : document.activeElement) === null || _b === void 0 ? void 0 : _b.role) !== null && _c !== void 0 ? _c : null), activeRoleRef = _d[0], setRole = _d[1];
    var handleFocusIn = function () {
        var _a, _b;
        setRole((_b = (_a = document === null || document === void 0 ? void 0 : document.activeElement) === null || _a === void 0 ? void 0 : _a.role) !== null && _b !== void 0 ? _b : null);
    };
    var handleFocusOut = function () {
        setRole(null);
    };
    (0, react_1.useEffect)(function () {
        document.addEventListener('focusin', handleFocusIn);
        document.addEventListener('focusout', handleFocusOut);
        return function () {
            document.removeEventListener('focusin', handleFocusIn);
            document.removeEventListener('focusout', handleFocusOut);
        };
    }, []);
    var value = react_1.default.useMemo(function () { return ({
        role: activeRoleRef,
    }); }, [activeRoleRef]);
    return <ActiveElementRoleContext.Provider value={value}>{children}</ActiveElementRoleContext.Provider>;
}
exports.default = ActiveElementRoleProvider;
