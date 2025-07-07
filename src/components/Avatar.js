"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useNetwork_1 = require("@hooks/useNetwork");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ReportUtils_1 = require("@libs/ReportUtils");
var UserUtils_1 = require("@libs/UserUtils");
var CONST_1 = require("@src/CONST");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
var Image_1 = require("./Image");
function Avatar(_a) {
    var _b, _c, _d;
    var originalSource = _a.source, imageStyles = _a.imageStyles, iconAdditionalStyles = _a.iconAdditionalStyles, containerStyles = _a.containerStyles, _e = _a.size, size = _e === void 0 ? CONST_1.default.AVATAR_SIZE.DEFAULT : _e, fill = _a.fill, _f = _a.fallbackIcon, fallbackIcon = _f === void 0 ? Expensicons.FallbackAvatar : _f, _g = _a.fallbackIconTestID, fallbackIconTestID = _g === void 0 ? '' : _g, type = _a.type, _h = _a.name, name = _h === void 0 ? '' : _h, avatarID = _a.avatarID;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var _j = (0, react_1.useState)(false), imageError = _j[0], setImageError = _j[1];
    (0, useNetwork_1.default)({ onReconnect: function () { return setImageError(false); } });
    (0, react_1.useEffect)(function () {
        setImageError(false);
    }, [originalSource]);
    var isWorkspace = type === CONST_1.default.ICON_TYPE_WORKSPACE;
    var userAccountID = isWorkspace ? undefined : avatarID;
    var source = isWorkspace ? originalSource : (0, UserUtils_1.getAvatar)(originalSource, userAccountID);
    var useFallBackAvatar = imageError || !source || source === Expensicons.FallbackAvatar;
    var fallbackAvatar = isWorkspace ? (0, ReportUtils_1.getDefaultWorkspaceAvatar)(name) : fallbackIcon || Expensicons.FallbackAvatar;
    var fallbackAvatarTestID = isWorkspace ? (0, ReportUtils_1.getDefaultWorkspaceAvatarTestID)(name) : fallbackIconTestID || 'SvgFallbackAvatar Icon';
    var avatarSource = useFallBackAvatar ? fallbackAvatar : source;
    // We pass the color styles down to the SVG for the workspace and fallback avatar.
    var iconSize = StyleUtils.getAvatarSize(size);
    var imageStyle = [StyleUtils.getAvatarStyle(size), imageStyles, styles.noBorderRadius];
    var iconStyle = imageStyles ? [StyleUtils.getAvatarStyle(size), styles.bgTransparent, imageStyles] : undefined;
    var iconColors;
    if (isWorkspace) {
        iconColors = StyleUtils.getDefaultWorkspaceAvatarColor((_b = avatarID === null || avatarID === void 0 ? void 0 : avatarID.toString()) !== null && _b !== void 0 ? _b : '');
    }
    else if (useFallBackAvatar) {
        iconColors = StyleUtils.getBackgroundColorAndFill(theme.buttonHoveredBG, theme.icon);
    }
    else {
        iconColors = null;
    }
    return (<react_native_1.View style={[containerStyles, styles.pointerEventsNone]}>
            {typeof avatarSource === 'string' ? (<react_native_1.View style={[iconStyle, StyleUtils.getAvatarBorderStyle(size, type), iconAdditionalStyles]}>
                    <Image_1.default source={{ uri: avatarSource }} style={imageStyle} onError={function () { return setImageError(true); }} cachePolicy="memory-disk"/>
                </react_native_1.View>) : (<react_native_1.View style={iconStyle}>
                    <Icon_1.default testID={fallbackAvatarTestID} src={avatarSource} height={iconSize} width={iconSize} fill={imageError ? ((_c = iconColors === null || iconColors === void 0 ? void 0 : iconColors.fill) !== null && _c !== void 0 ? _c : theme.offline) : ((_d = iconColors === null || iconColors === void 0 ? void 0 : iconColors.fill) !== null && _d !== void 0 ? _d : fill)} additionalStyles={[StyleUtils.getAvatarBorderStyle(size, type), iconColors, iconAdditionalStyles]}/>
                </react_native_1.View>)}
        </react_native_1.View>);
}
Avatar.displayName = 'Avatar';
exports.default = Avatar;
