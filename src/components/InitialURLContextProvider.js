"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialURLContext = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
/** Initial url that will be opened when NewDot is embedded into Hybrid App. */
var InitialURLContext = (0, react_1.createContext)({
    initialURL: undefined,
    setInitialURL: function () { },
});
exports.InitialURLContext = InitialURLContext;
function InitialURLContextProvider(_a) {
    var children = _a.children, url = _a.url;
    var _b = (0, react_1.useState)(), initialURL = _b[0], setInitialURL = _b[1];
    (0, react_1.useEffect)(function () {
        if (url) {
            setInitialURL(url);
            return;
        }
        react_native_1.Linking.getInitialURL().then(function (initURL) {
            setInitialURL(initURL);
        });
    }, [url]);
    var initialUrlContext = (0, react_1.useMemo)(function () { return ({
        initialURL: initialURL,
        setInitialURL: setInitialURL,
    }); }, [initialURL]);
    return <InitialURLContext.Provider value={initialUrlContext}>{children}</InitialURLContext.Provider>;
}
InitialURLContextProvider.displayName = 'InitialURLContextProvider';
exports.default = InitialURLContextProvider;
