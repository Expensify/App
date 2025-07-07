"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var AppStateMonitor_1 = require("@libs/AppStateMonitor");
var BaseLoginForm_1 = require("./BaseLoginForm");
function LoginForm(_a, ref) {
    var scrollPageToTop = _a.scrollPageToTop, rest = __rest(_a, ["scrollPageToTop"]);
    var loginFormRef = (0, react_1.useRef)(null);
    (0, react_1.useImperativeHandle)(ref, function () {
        var _a;
        return ({
            isInputFocused: loginFormRef.current ? loginFormRef.current.isInputFocused : function () { return false; },
            clearDataAndFocus: loginFormRef.current ? (_a = loginFormRef.current) === null || _a === void 0 ? void 0 : _a.clearDataAndFocus : function () { return null; },
        });
    });
    (0, react_1.useEffect)(function () {
        if (!scrollPageToTop) {
            return;
        }
        return AppStateMonitor_1.default.addBecameActiveListener(function () {
            var _a;
            var isInputFocused = (_a = loginFormRef.current) === null || _a === void 0 ? void 0 : _a.isInputFocused();
            if (!isInputFocused) {
                return;
            }
            scrollPageToTop();
        });
    }, [scrollPageToTop]);
    return (<BaseLoginForm_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest} scrollPageToTop={scrollPageToTop} ref={loginFormRef}/>);
}
LoginForm.displayName = 'LoginForm';
exports.default = (0, react_1.forwardRef)(LoginForm);
