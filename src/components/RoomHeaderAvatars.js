"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var Avatar_1 = require("./Avatar");
var Expensicons = require("./Icon/Expensicons");
var PressableWithoutFocus_1 = require("./Pressable/PressableWithoutFocus");
var Text_1 = require("./Text");
function RoomHeaderAvatars(_a) {
    var _b;
    var icons = _a.icons, reportID = _a.reportID;
    var navigateToAvatarPage = function (icon) {
        if (icon.type === CONST_1.default.ICON_TYPE_WORKSPACE && icon.id) {
            Navigation_1.default.navigate(ROUTES_1.default.REPORT_AVATAR.getRoute(reportID, icon.id.toString()));
            return;
        }
        if (icon.id) {
            Navigation_1.default.navigate(ROUTES_1.default.PROFILE_AVATAR.getRoute(Number(icon.id), Navigation_1.default.getActiveRoute()));
        }
    };
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    if (!icons.length) {
        return null;
    }
    if (icons.length === 1) {
        var icon_1 = icons.at(0);
        if (!icon_1) {
            return;
        }
        return (<PressableWithoutFocus_1.default style={styles.noOutline} onPress={function () { return navigateToAvatarPage(icon_1); }} accessibilityRole={CONST_1.default.ROLE.BUTTON} accessibilityLabel={(_b = icon_1.name) !== null && _b !== void 0 ? _b : ''} disabled={icon_1.source === Expensicons.FallbackAvatar}>
                <Avatar_1.default source={icon_1.source} imageStyles={styles.avatarXLarge} size={CONST_1.default.AVATAR_SIZE.X_LARGE} name={icon_1.name} avatarID={icon_1.id} type={icon_1.type} fallbackIcon={icon_1.fallbackIcon}/>
            </PressableWithoutFocus_1.default>);
    }
    var iconsToDisplay = icons.slice(0, CONST_1.default.REPORT.MAX_PREVIEW_AVATARS);
    var iconStyle = [
        styles.roomHeaderAvatar,
        // Due to border-box box-sizing, the Avatars have to be larger when bordered to visually match size with non-bordered Avatars
        StyleUtils.getAvatarStyle(CONST_1.default.AVATAR_SIZE.LARGE_BORDERED),
    ];
    return (<react_native_1.View style={styles.pointerEventsBoxNone}>
            <react_native_1.View style={[styles.flexRow, styles.wAuto, styles.ml3]}>
                {iconsToDisplay.map(function (icon, index) {
            var _a;
            return (<react_native_1.View 
            // eslint-disable-next-line react/no-array-index-key
            key={"".concat(icon.id).concat(index)} style={[styles.justifyContentCenter, styles.alignItemsCenter]}>
                        <PressableWithoutFocus_1.default style={[styles.mln4, StyleUtils.getAvatarBorderRadius(CONST_1.default.AVATAR_SIZE.LARGE_BORDERED, icon.type)]} onPress={function () { return navigateToAvatarPage(icon); }} accessibilityRole={CONST_1.default.ROLE.BUTTON} accessibilityLabel={(_a = icon.name) !== null && _a !== void 0 ? _a : ''} disabled={icon.source === Expensicons.FallbackAvatar}>
                            <Avatar_1.default source={icon.source} size={CONST_1.default.AVATAR_SIZE.LARGE} containerStyles={__spreadArray(__spreadArray([], iconStyle, true), [StyleUtils.getAvatarBorderRadius(CONST_1.default.AVATAR_SIZE.LARGE_BORDERED, icon.type)], false)} name={icon.name} avatarID={icon.id} type={icon.type} fallbackIcon={icon.fallbackIcon}/>
                        </PressableWithoutFocus_1.default>
                        {index === CONST_1.default.REPORT.MAX_PREVIEW_AVATARS - 1 && icons.length - CONST_1.default.REPORT.MAX_PREVIEW_AVATARS !== 0 && (<>
                                <react_native_1.View style={__spreadArray(__spreadArray([
                        styles.roomHeaderAvatarSize,
                        styles.roomHeaderAvatar,
                        styles.mln4
                    ], iconStyle, true), [
                        StyleUtils.getAvatarBorderRadius(CONST_1.default.AVATAR_SIZE.LARGE_BORDERED, icon.type),
                        styles.roomHeaderAvatarOverlay,
                    ], false)}/>
                                <Text_1.default style={styles.avatarInnerTextChat}>{"+".concat(icons.length - CONST_1.default.REPORT.MAX_PREVIEW_AVATARS)}</Text_1.default>
                            </>)}
                    </react_native_1.View>);
        })}
            </react_native_1.View>
        </react_native_1.View>);
}
RoomHeaderAvatars.displayName = 'RoomHeaderAvatars';
exports.default = (0, react_1.memo)(RoomHeaderAvatars);
