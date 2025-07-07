"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
exports.LoginProvider = LoginProvider;
exports.useLogin = useLogin;
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var useOnyx_1 = require("@hooks/useOnyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var defaultLoginContext = {
    login: '',
    setLogin: function () { },
};
var Context = react_1.default.createContext(defaultLoginContext);
exports.Context = Context;
function LoginProvider(_a) {
    var children = _a.children;
    var credentials = (0, useOnyx_1.default)(ONYXKEYS_1.default.CREDENTIALS, { canBeMissing: true })[0];
    var _b = (0, react_1.useState)(function () { var _a; return expensify_common_1.Str.removeSMSDomain((_a = credentials === null || credentials === void 0 ? void 0 : credentials.login) !== null && _a !== void 0 ? _a : ''); }), login = _b[0], setLoginState = _b[1];
    var setLogin = (0, react_1.useCallback)(function (newLogin) {
        setLoginState(newLogin);
    }, []);
    var loginContext = (0, react_1.useMemo)(function () { return ({
        login: login,
        setLogin: setLogin,
    }); }, [login, setLogin]);
    return <Context.Provider value={loginContext}>{children}</Context.Provider>;
}
function useLogin() {
    return (0, react_1.useContext)(Context);
}
LoginProvider.displayName = 'LoginProvider';
