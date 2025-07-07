"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FullScreenContext = void 0;
exports.FullScreenContextProvider = FullScreenContextProvider;
exports.useFullScreenContext = useFullScreenContext;
var react_1 = require("react");
var Context = react_1.default.createContext(null);
exports.FullScreenContext = Context;
function FullScreenContextProvider(_a) {
    var children = _a.children;
    var isFullScreenRef = (0, react_1.useRef)(false);
    var lockedWindowDimensionsRef = (0, react_1.useRef)(null);
    var lockWindowDimensions = (0, react_1.useCallback)(function (newResponsiveLayoutProperties) {
        lockedWindowDimensionsRef.current = newResponsiveLayoutProperties;
    }, []);
    var unlockWindowDimensions = (0, react_1.useCallback)(function () {
        lockedWindowDimensionsRef.current = null;
    }, []);
    var contextValue = (0, react_1.useMemo)(function () { return ({ isFullScreenRef: isFullScreenRef, lockedWindowDimensionsRef: lockedWindowDimensionsRef, lockWindowDimensions: lockWindowDimensions, unlockWindowDimensions: unlockWindowDimensions }); }, [lockWindowDimensions, unlockWindowDimensions]);
    return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}
function useFullScreenContext() {
    var fullscreenContext = (0, react_1.useContext)(Context);
    if (!fullscreenContext) {
        throw new Error('useFullScreenContext must be used within a FullScreenContextProvider');
    }
    return fullscreenContext;
}
FullScreenContextProvider.displayName = 'FullScreenContextProvider';
