"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FullScreenLoaderContext = void 0;
exports.useFullScreenLoader = useFullScreenLoader;
var react_1 = require("react");
var FullscreenLoadingIndicator_1 = require("./FullscreenLoadingIndicator");
var FullScreenLoaderContext = (0, react_1.createContext)({
    isLoaderVisible: false,
    setIsLoaderVisible: function () { },
});
exports.FullScreenLoaderContext = FullScreenLoaderContext;
function FullScreenLoaderContextProvider(_a) {
    var children = _a.children;
    var _b = (0, react_1.useState)(false), isLoaderVisible = _b[0], setIsLoaderVisible = _b[1];
    var loaderContext = (0, react_1.useMemo)(function () { return ({
        isLoaderVisible: isLoaderVisible,
        setIsLoaderVisible: setIsLoaderVisible,
    }); }, [isLoaderVisible]);
    return (<FullScreenLoaderContext.Provider value={loaderContext}>
            {children}
            {isLoaderVisible && <FullscreenLoadingIndicator_1.default />}
        </FullScreenLoaderContext.Provider>);
}
function useFullScreenLoader() {
    var context = (0, react_1.useContext)(FullScreenLoaderContext);
    if (!context) {
        throw new Error('useFullScreenLoader must be used within a FullScreenLoaderContextProvider');
    }
    return context;
}
FullScreenLoaderContextProvider.displayName = 'FullScreenLoaderContextProvider';
exports.default = FullScreenLoaderContextProvider;
