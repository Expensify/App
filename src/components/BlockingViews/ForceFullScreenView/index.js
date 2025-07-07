"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullScreenBlockingViewContextProvider_1 = require("@components/FullScreenBlockingViewContextProvider");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function ForceFullScreenView(_a) {
    var children = _a.children, _b = _a.shouldForceFullScreen, shouldForceFullScreen = _b === void 0 ? false : _b;
    var route = (0, native_1.useRoute)();
    var styles = (0, useThemeStyles_1.default)();
    var _c = (0, react_1.useContext)(FullScreenBlockingViewContextProvider_1.FullScreenBlockingViewContext), addRouteKey = _c.addRouteKey, removeRouteKey = _c.removeRouteKey;
    (0, react_1.useEffect)(function () {
        if (!shouldForceFullScreen) {
            return;
        }
        addRouteKey(route.key);
        return function () { return removeRouteKey(route.key); };
    }, [addRouteKey, removeRouteKey, route, shouldForceFullScreen]);
    if (shouldForceFullScreen) {
        return <react_native_1.View style={styles.forcedBlockingViewContainer}>{children}</react_native_1.View>;
    }
    return children;
}
ForceFullScreenView.displayName = 'ForceFullScreenView';
exports.default = ForceFullScreenView;
