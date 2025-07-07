"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useNetwork_1 = require("@hooks/useNetwork");
var useSafeAreaPaddings_1 = require("@hooks/useSafeAreaPaddings");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
/** NavigationBar renders a semi-translucent background behind the three-button navigation bar on Android. */
function NavigationBar() {
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var _a = (0, useSafeAreaPaddings_1.default)(), insets = _a.insets, paddingBottom = _a.paddingBottom;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var navigationBarType = (0, react_1.useMemo)(function () { return StyleUtils.getNavigationBarType(insets); }, [StyleUtils, insets]);
    var isSoftKeyNavigation = navigationBarType === CONST_1.default.NAVIGATION_BAR_TYPE.SOFT_KEYS;
    return isSoftKeyNavigation ? <react_native_1.View style={[isOffline ? styles.appBG : styles.translucentNavigationBarBG, styles.stickToBottom, { height: paddingBottom }]}/> : null;
}
NavigationBar.displayName = 'NavigationBar';
exports.default = NavigationBar;
