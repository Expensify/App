"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useNetwork_1 = require("@hooks/useNetwork");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var Browser = require("@libs/Browser");
var FixedFooter_1 = require("./FixedFooter");
var HeaderWithBackButton_1 = require("./HeaderWithBackButton");
var ScreenWrapper_1 = require("./ScreenWrapper");
var ScrollView_1 = require("./ScrollView");
function HeaderPageLayout(_a) {
    var backgroundColor = _a.backgroundColor, children = _a.children, footer = _a.footer, headerContainerStyles = _a.headerContainerStyles, scrollViewContainerStyles = _a.scrollViewContainerStyles, childrenContainerStyles = _a.childrenContainerStyles, style = _a.style, headerContent = _a.headerContent, _b = _a.shouldShowOfflineIndicatorInWideScreen, shouldShowOfflineIndicatorInWideScreen = _b === void 0 ? false : _b, testID = _a.testID, keyboardShouldPersistTaps = _a.keyboardShouldPersistTaps, rest = __rest(_a, ["backgroundColor", "children", "footer", "headerContainerStyles", "scrollViewContainerStyles", "childrenContainerStyles", "style", "headerContent", "shouldShowOfflineIndicatorInWideScreen", "testID", "keyboardShouldPersistTaps"]);
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var windowHeight = (0, useWindowDimensions_1.default)().windowHeight;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var appBGColor = StyleUtils.getBackgroundColorStyle(theme.appBG);
    var _c = (0, react_1.useMemo)(function () {
        var isColorfulBackground = (backgroundColor !== null && backgroundColor !== void 0 ? backgroundColor : theme.appBG) !== theme.appBG && (backgroundColor !== null && backgroundColor !== void 0 ? backgroundColor : theme.highlightBG) !== theme.highlightBG;
        return {
            titleColor: isColorfulBackground ? theme.textColorfulBackground : undefined,
            iconFill: isColorfulBackground ? theme.iconColorfulBackground : undefined,
        };
    }, [backgroundColor, theme.appBG, theme.highlightBG, theme.iconColorfulBackground, theme.textColorfulBackground]), titleColor = _c.titleColor, iconFill = _c.iconFill;
    return (<ScreenWrapper_1.default style={[StyleUtils.getBackgroundColorStyle(backgroundColor !== null && backgroundColor !== void 0 ? backgroundColor : theme.appBG)]} shouldEnablePickerAvoiding={false} includeSafeAreaPaddingBottom={false} offlineIndicatorStyle={[appBGColor]} testID={testID} shouldShowOfflineIndicatorInWideScreen={shouldShowOfflineIndicatorInWideScreen}>
            {function (_a) {
            var safeAreaPaddingBottomStyle = _a.safeAreaPaddingBottomStyle;
            return (<>
                    <HeaderWithBackButton_1.default 
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest} titleColor={titleColor} iconFill={iconFill}/>
                    <react_native_1.View style={[styles.flex1, appBGColor, !isOffline && footer ? safeAreaPaddingBottomStyle : {}]}>
                        {/** Safari on ios/mac has a bug where over scrolling the page ScrollView shows green background color. This is a workaround to fix that. https://github.com/Expensify/App/issues/23422 */}
                        {Browser.isSafari() && (<react_native_1.View style={styles.dualColorOverscrollSpacer}>
                                <react_native_1.View style={[styles.flex1, StyleUtils.getBackgroundColorStyle(backgroundColor !== null && backgroundColor !== void 0 ? backgroundColor : theme.appBG)]}/>
                                <react_native_1.View style={[shouldUseNarrowLayout ? styles.flex1 : styles.flex3, appBGColor]}/>
                            </react_native_1.View>)}
                        <ScrollView_1.default contentContainerStyle={[safeAreaPaddingBottomStyle, style, scrollViewContainerStyles]} keyboardShouldPersistTaps={keyboardShouldPersistTaps}>
                            {!Browser.isSafari() && <react_native_1.View style={styles.overscrollSpacer(backgroundColor !== null && backgroundColor !== void 0 ? backgroundColor : theme.appBG, windowHeight)}/>}
                            <react_native_1.View style={[styles.alignItemsCenter, styles.justifyContentEnd, StyleUtils.getBackgroundColorStyle(backgroundColor !== null && backgroundColor !== void 0 ? backgroundColor : theme.appBG), headerContainerStyles]}>
                                {headerContent}
                            </react_native_1.View>
                            <react_native_1.View style={[styles.pt5, appBGColor, childrenContainerStyles]}>{children}</react_native_1.View>
                        </ScrollView_1.default>
                        {!!footer && <FixedFooter_1.default>{footer}</FixedFooter_1.default>}
                    </react_native_1.View>
                </>);
        }}
        </ScreenWrapper_1.default>);
}
HeaderPageLayout.displayName = 'HeaderPageLayout';
exports.default = HeaderPageLayout;
