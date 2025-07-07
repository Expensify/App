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
var native_1 = require("@react-navigation/native");
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var PressableWithSecondaryInteraction_1 = require("@components/PressableWithSecondaryInteraction");
var Text_1 = require("@components/Text");
var Tooltip_1 = require("@components/Tooltip");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var ReportActionContextMenu_1 = require("@pages/home/report/ContextMenu/ReportActionContextMenu");
var CONST_1 = require("@src/CONST");
/*
 * This is a default anchor component for regular links.
 */
function BaseAnchorForCommentsOnly(_a) {
    var onPressIn = _a.onPressIn, onPressOut = _a.onPressOut, _b = _a.href, href = _b === void 0 ? '' : _b, _c = _a.rel, rel = _c === void 0 ? '' : _c, _d = _a.target, target = _d === void 0 ? '' : _d, _e = _a.children, children = _e === void 0 ? null : _e, style = _a.style, onPress = _a.onPress, linkHasImage = _a.linkHasImage, wrapperStyle = _a.wrapperStyle, rest = __rest(_a, ["onPressIn", "onPressOut", "href", "rel", "target", "children", "style", "onPress", "linkHasImage", "wrapperStyle"]);
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var linkRef = (0, react_1.useRef)(null);
    var flattenStyle = react_native_1.StyleSheet.flatten(style);
    var _f = (0, react_1.useState)(false), isHovered = _f[0], setIsHovered = _f[1];
    (0, react_1.useEffect)(function () { return function () {
        (0, ReportActionContextMenu_1.hideContextMenu)();
    }; }, []);
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var linkProps = {};
    if (onPress) {
        linkProps.onPress = onPress;
    }
    else {
        linkProps.href = href;
    }
    var defaultTextStyle = (0, DeviceCapabilities_1.canUseTouchScreen)() || shouldUseNarrowLayout ? {} : __assign(__assign({}, styles.userSelectText), styles.cursorPointer);
    var hoverStyle = isHovered ? StyleUtils.getColorStyle(theme.linkHover) : {};
    var isEmail = expensify_common_1.Str.isValidEmail(href.replace(/mailto:/i, ''));
    var linkHref = !linkHasImage ? href : undefined;
    var isFocused = (0, native_1.useIsFocused)();
    return (<PressableWithSecondaryInteraction_1.default inline suppressHighlighting style={[styles.cursorDefault, !!flattenStyle.fontSize && StyleUtils.getFontSizeStyle(flattenStyle.fontSize)]} onSecondaryInteraction={function (event) {
            (0, ReportActionContextMenu_1.showContextMenu)({
                type: isEmail ? CONST_1.default.CONTEXT_MENU_TYPES.EMAIL : CONST_1.default.CONTEXT_MENU_TYPES.LINK,
                event: event,
                selection: href,
                contextMenuAnchor: linkRef.current,
            });
        }} onPress={function (event) {
            if (!linkProps.onPress) {
                return;
            }
            event === null || event === void 0 ? void 0 : event.preventDefault();
            linkProps.onPress();
        }} onPressIn={onPressIn} onPressOut={onPressOut} onHoverIn={function () { return setIsHovered(true); }} onHoverOut={function () { return setIsHovered(false); }} role={CONST_1.default.ROLE.LINK} accessibilityLabel={href} wrapperStyle={wrapperStyle}>
            <Tooltip_1.default text={linkHref} isFocused={isFocused}>
                <Text_1.default ref={linkRef} style={react_native_1.StyleSheet.flatten([style, defaultTextStyle, hoverStyle])} role={CONST_1.default.ROLE.LINK} hrefAttrs={{
            rel: rel,
            target: isEmail || !linkProps.href ? '_self' : target,
        }} href={linkHref} suppressHighlighting 
    // Add testID so it gets selected as an anchor tag by SelectionScraper
    testID="a" 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest}>
                    {children}
                </Text_1.default>
            </Tooltip_1.default>
        </PressableWithSecondaryInteraction_1.default>);
}
BaseAnchorForCommentsOnly.displayName = 'BaseAnchorForCommentsOnly';
exports.default = BaseAnchorForCommentsOnly;
