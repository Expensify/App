"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FullScreenBlockingViewContext = void 0;
var react_1 = require("react");
var defaultValue = {
    addRouteKey: function () { },
    removeRouteKey: function () { },
    isBlockingViewVisible: false,
};
var FullScreenBlockingViewContext = (0, react_1.createContext)(defaultValue);
exports.FullScreenBlockingViewContext = FullScreenBlockingViewContext;
/**
 * Provides a context for getting information about the visibility of a full-screen blocking view.
 * This context allows the blocking view to add or remove route keys, which determine
 * whether the blocking view is displayed on a screen. If there are any route keys present,
 * the blocking view is considered visible.
 * This information is necessary because we don't want to show the TopLevelNavigationTabBar when the blocking view is visible.
 */
function FullScreenBlockingViewContextProvider(_a) {
    var children = _a.children;
    var _b = (0, react_1.useState)(new Set()), routeKeys = _b[0], setRouteKeys = _b[1];
    var addRouteKey = (0, react_1.useCallback)(function (key) {
        setRouteKeys(function (prevKeys) { return new Set(prevKeys).add(key); });
    }, []);
    var removeRouteKey = (0, react_1.useCallback)(function (key) {
        setRouteKeys(function (prevKeys) {
            var newKeys = new Set(prevKeys);
            newKeys.delete(key);
            return newKeys;
        });
    }, []);
    var isBlockingViewVisible = (0, react_1.useMemo)(function () { return routeKeys.size > 0; }, [routeKeys]);
    var contextValue = (0, react_1.useMemo)(function () { return ({
        addRouteKey: addRouteKey,
        removeRouteKey: removeRouteKey,
        isBlockingViewVisible: isBlockingViewVisible,
    }); }, [addRouteKey, removeRouteKey, isBlockingViewVisible]);
    return <FullScreenBlockingViewContext.Provider value={contextValue}>{children}</FullScreenBlockingViewContext.Provider>;
}
exports.default = FullScreenBlockingViewContextProvider;
