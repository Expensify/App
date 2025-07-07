"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_svg_1 = require("react-native-svg");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
var PressableWithFeedback_1 = require("./Pressable/PressableWithFeedback");
var SkeletonViewContentLoader_1 = require("./SkeletonViewContentLoader");
function ReportHeaderSkeletonView(_a) {
    var _b = _a.shouldAnimate, shouldAnimate = _b === void 0 ? true : _b, _c = _a.onBackButtonPress, onBackButtonPress = _c === void 0 ? function () { } : _c;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var height = styles.headerBarHeight.height;
    var radius = 20;
    var circleY = height / 2;
    var circleTopY = circleY - radius;
    var circleBottomY = circleY + radius;
    return (<react_native_1.View style={[styles.appContentHeader, shouldUseNarrowLayout && styles.pl2, styles.h100]}>
            <react_native_1.View style={[styles.appContentHeaderTitle, !shouldUseNarrowLayout && styles.pl5]}>
                {shouldUseNarrowLayout && (<PressableWithFeedback_1.default onPress={onBackButtonPress} style={[styles.touchableButtonImage]} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={translate('common.back')}>
                        <Icon_1.default fill={theme.icon} src={Expensicons.BackArrow}/>
                    </PressableWithFeedback_1.default>)}
                <SkeletonViewContentLoader_1.default animate={shouldAnimate} width={styles.w100.width} height={height} backgroundColor={theme.skeletonLHNIn} foregroundColor={theme.skeletonLHNOut}>
                    <react_native_svg_1.Circle cx="20" cy={height / 2} r={radius}/>
                    <react_native_svg_1.Rect x="55" y={circleTopY + 8} width="30%" height="8"/>
                    <react_native_svg_1.Rect x="55" y={circleBottomY - 12} width="40%" height="8"/>
                </SkeletonViewContentLoader_1.default>
            </react_native_1.View>
        </react_native_1.View>);
}
ReportHeaderSkeletonView.displayName = 'ReportHeaderSkeletonView';
exports.default = ReportHeaderSkeletonView;
