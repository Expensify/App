"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_svg_1 = require("react-native-svg");
var SkeletonViewContentLoader_1 = require("@components/SkeletonViewContentLoader");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function AccountSwitcherSkeletonView(_a) {
    var _b = _a.shouldAnimate, shouldAnimate = _b === void 0 ? true : _b, _c = _a.avatarSize, avatarSize = _c === void 0 ? CONST_1.default.AVATAR_SIZE.DEFAULT : _c;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var avatarPlaceholderSize = StyleUtils.getAvatarSize(avatarSize);
    var avatarPlaceholderRadius = avatarPlaceholderSize / 2;
    var startPositionX = avatarPlaceholderRadius;
    return (<react_native_1.View style={styles.avatarSectionWrapperSkeleton}>
            <SkeletonViewContentLoader_1.default animate={shouldAnimate} backgroundColor={theme.skeletonLHNIn} foregroundColor={theme.skeletonLHNOut} height={avatarPlaceholderSize}>
                <react_native_svg_1.Circle cx={startPositionX} cy={avatarPlaceholderRadius} r={avatarPlaceholderRadius}/>
                <react_native_svg_1.Rect x={startPositionX + avatarPlaceholderRadius + styles.gap3.gap} y="6" width="45%" height="8"/>
                <react_native_svg_1.Rect x={startPositionX + avatarPlaceholderRadius + styles.gap3.gap} y="26" width="55%" height="8"/>
            </SkeletonViewContentLoader_1.default>
        </react_native_1.View>);
}
AccountSwitcherSkeletonView.displayName = 'AccountSwitcherSkeletonView';
exports.default = AccountSwitcherSkeletonView;
