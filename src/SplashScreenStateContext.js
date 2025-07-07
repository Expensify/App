"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplashScreenStateContextProvider = SplashScreenStateContextProvider;
exports.useSplashScreenStateContext = useSplashScreenStateContext;
var react_1 = require("react");
var CONST_1 = require("./CONST");
var SplashScreenStateContext = react_1.default.createContext({
    splashScreenState: CONST_1.default.BOOT_SPLASH_STATE.VISIBLE,
    setSplashScreenState: function () { },
});
function SplashScreenStateContextProvider(_a) {
    var children = _a.children;
    var _b = (0, react_1.useState)(CONST_1.default.BOOT_SPLASH_STATE.VISIBLE), splashScreenState = _b[0], setSplashScreenState = _b[1];
    var splashScreenStateContext = (0, react_1.useMemo)(function () { return ({
        splashScreenState: splashScreenState,
        setSplashScreenState: setSplashScreenState,
    }); }, [splashScreenState]);
    return <SplashScreenStateContext.Provider value={splashScreenStateContext}>{children}</SplashScreenStateContext.Provider>;
}
function useSplashScreenStateContext() {
    return (0, react_1.useContext)(SplashScreenStateContext);
}
exports.default = SplashScreenStateContext;
