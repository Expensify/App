"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Avatar_1 = require("@components/Avatar");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var UserUtils = require("@libs/UserUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ProfileAvatarWithIndicator_1 = require("./ProfileAvatarWithIndicator");
function AvatarWithDelegateAvatar(_a) {
    var _b;
    var delegateEmail = _a.delegateEmail, _c = _a.isSelected, isSelected = _c === void 0 ? false : _c, containerStyle = _a.containerStyle;
    var styles = (0, useThemeStyles_1.default)();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use correct avatar size
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var isSmallScreenWidth = (0, useResponsiveLayout_1.default)().isSmallScreenWidth;
    var personalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST);
    var delegatePersonalDetail = Object.values((_b = personalDetails[0]) !== null && _b !== void 0 ? _b : {}).find(function (personalDetail) { var _a; return ((_a = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === delegateEmail; });
    return (<react_native_1.View style={[styles.sidebarStatusAvatarContainer, containerStyle]}>
            <ProfileAvatarWithIndicator_1.default isSelected={isSelected}/>
            <react_native_1.View style={[styles.sidebarStatusAvatar]}>
                <react_native_1.View style={styles.emojiStatusLHN}>
                    <Avatar_1.default size={isSmallScreenWidth ? CONST_1.default.AVATAR_SIZE.MID_SUBSCRIPT : CONST_1.default.AVATAR_SIZE.SMALL} source={UserUtils.getSmallSizeAvatar(delegatePersonalDetail === null || delegatePersonalDetail === void 0 ? void 0 : delegatePersonalDetail.avatar, delegatePersonalDetail === null || delegatePersonalDetail === void 0 ? void 0 : delegatePersonalDetail.accountID)} fallbackIcon={delegatePersonalDetail === null || delegatePersonalDetail === void 0 ? void 0 : delegatePersonalDetail.fallbackIcon} type={CONST_1.default.ICON_TYPE_AVATAR}/>
                </react_native_1.View>
            </react_native_1.View>
        </react_native_1.View>);
}
AvatarWithDelegateAvatar.displayName = 'AvatarWithDelegateAvatar';
exports.default = AvatarWithDelegateAvatar;
