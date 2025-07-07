"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Avatar_1 = require("@components/Avatar");
var Text_1 = require("@components/Text");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function AvatarWithTextCell(_a) {
    var reportName = _a.reportName, icon = _a.icon;
    var styles = (0, useThemeStyles_1.default)();
    var isLargeScreenWidth = (0, useResponsiveLayout_1.default)().isLargeScreenWidth;
    if (!reportName || !icon) {
        return null;
    }
    return (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter]}>
            {!!icon && (<Avatar_1.default source={icon.source} name={icon.name} avatarID={icon.id} type={icon.type} fallbackIcon={icon.fallbackIcon} size={CONST_1.default.AVATAR_SIZE.MID_SUBSCRIPT} containerStyles={[styles.pr2]}/>)}

            {!!reportName && (<Text_1.default numberOfLines={1} style={[isLargeScreenWidth ? styles.themeTextColor : styles.textMicroBold, styles.flexShrink1]}>
                    {reportName}
                </Text_1.default>)}
        </react_native_1.View>);
}
AvatarWithTextCell.displayName = 'ReportInfoCell';
exports.default = AvatarWithTextCell;
