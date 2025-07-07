"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useInputBlurContext = useInputBlurContext;
exports.InputBlurContextProvider = InputBlurContextProvider;
var react_1 = require("react");
var InputBlurContext = react_1.default.createContext({
    isBlurred: true,
    setIsBlurred: function () { },
});
function InputBlurContextProvider(_a) {
    var children = _a.children;
    var _b = (0, react_1.useState)(false), isBlurred = _b[0], setIsBlurred = _b[1];
    var contextValue = (0, react_1.useMemo)(function () { return ({
        isBlurred: isBlurred,
        setIsBlurred: setIsBlurred,
    }); }, [isBlurred]);
    return <InputBlurContext.Provider value={contextValue}>{children}</InputBlurContext.Provider>;
}
function useInputBlurContext() {
    return (0, react_1.useContext)(InputBlurContext);
}
