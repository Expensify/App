"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var stack_1 = require("@react-navigation/stack");
var react_1 = require("react");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var hideKeyboardOnSwipe_1 = require("@libs/Navigation/AppNavigator/hideKeyboardOnSwipe");
var variables_1 = require("@styles/variables");
function useModalStackScreenOptions(getScreenOptions) {
    var styles = (0, useThemeStyles_1.default)();
    // We have to use isSmallScreenWidth, otherwise the content of RHP 'jumps' on Safari - its width is set to size of screen and only after rerender it is set to the correct value
    // It works as intended on other browsers
    // https://github.com/Expensify/App/issues/63747
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var isSmallScreenWidth = (0, useResponsiveLayout_1.default)().isSmallScreenWidth;
    var cardStyleInterpolator = stack_1.CardStyleInterpolators.forHorizontalIOS;
    var defaultSubRouteOptions = (0, react_1.useMemo)(function () { return (__assign(__assign({}, hideKeyboardOnSwipe_1.default), { headerShown: false, animationTypeForReplace: 'pop', native: {
            contentStyle: styles.navigationScreenCardStyle,
        }, web: {
            cardStyle: __assign(__assign({}, styles.navigationScreenCardStyle), { width: isSmallScreenWidth ? '100%' : variables_1.default.sideBarWidth }),
            cardStyleInterpolator: cardStyleInterpolator,
        } })); }, [cardStyleInterpolator, isSmallScreenWidth, styles.navigationScreenCardStyle]);
    if (!getScreenOptions) {
        return defaultSubRouteOptions;
    }
    return __assign(__assign({}, defaultSubRouteOptions), getScreenOptions(styles));
}
exports.default = useModalStackScreenOptions;
