"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Avatar_1 = require("@components/Avatar");
var Text_1 = require("@components/Text");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var SearchUIUtils_1 = require("@libs/SearchUIUtils");
var CONST_1 = require("@src/CONST");
function UserInfoCell(_a) {
    var avatar = _a.avatar, accountID = _a.accountID, displayName = _a.displayName, avatarSize = _a.avatarSize, textStyle = _a.textStyle, avatarStyle = _a.avatarStyle;
    var styles = (0, useThemeStyles_1.default)();
    var isLargeScreenWidth = (0, useResponsiveLayout_1.default)().isLargeScreenWidth;
    if (!(0, SearchUIUtils_1.isCorrectSearchUserName)(displayName) || !accountID) {
        return null;
    }
    return (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter]}>
            <Avatar_1.default imageStyles={[styles.alignSelfCenter]} size={avatarSize !== null && avatarSize !== void 0 ? avatarSize : CONST_1.default.AVATAR_SIZE.MID_SUBSCRIPT} source={avatar} name={displayName} type={CONST_1.default.ICON_TYPE_AVATAR} avatarID={accountID} containerStyles={[styles.pr2, avatarStyle]}/>
            <Text_1.default numberOfLines={1} style={[isLargeScreenWidth ? styles.themeTextColor : styles.textMicroBold, styles.flexShrink1, textStyle]}>
                {displayName}
            </Text_1.default>
        </react_native_1.View>);
}
UserInfoCell.displayName = 'UserInfoCell';
exports.default = UserInfoCell;
