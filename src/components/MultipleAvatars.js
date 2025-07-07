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
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ReportUtils_1 = require("@libs/ReportUtils");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var Avatar_1 = require("./Avatar");
var Text_1 = require("./Text");
var Tooltip_1 = require("./Tooltip");
var UserDetailsTooltip_1 = require("./UserDetailsTooltip");
function MultipleAvatars(_a) {
    var _b;
    var _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9;
    var fallbackIcon = _a.fallbackIcon, _10 = _a.icons, icons = _10 === void 0 ? [] : _10, _11 = _a.size, size = _11 === void 0 ? CONST_1.default.AVATAR_SIZE.DEFAULT : _11, secondAvatarStyleProp = _a.secondAvatarStyle, _12 = _a.shouldStackHorizontally, shouldStackHorizontally = _12 === void 0 ? false : _12, _13 = _a.shouldDisplayAvatarsInRows, shouldDisplayAvatarsInRows = _13 === void 0 ? false : _13, _14 = _a.isHovered, isHovered = _14 === void 0 ? false : _14, _15 = _a.isActive, isActive = _15 === void 0 ? false : _15, _16 = _a.isPressed, isPressed = _16 === void 0 ? false : _16, _17 = _a.isFocusMode, isFocusMode = _17 === void 0 ? false : _17, _18 = _a.isInReportAction, isInReportAction = _18 === void 0 ? false : _18, _19 = _a.shouldShowTooltip, shouldShowTooltip = _19 === void 0 ? true : _19, _20 = _a.shouldUseCardBackground, shouldUseCardBackground = _20 === void 0 ? false : _20, _21 = _a.maxAvatarsInRow, maxAvatarsInRow = _21 === void 0 ? CONST_1.default.AVATAR_ROW_SIZE.DEFAULT : _21, _22 = _a.overlapDivider, overlapDivider = _22 === void 0 ? 3 : _22;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var avatarSizeToStylesMap = (0, react_1.useMemo)(function () {
        var _a;
        return (_a = {},
            _a[CONST_1.default.AVATAR_SIZE.SMALL] = {
                singleAvatarStyle: styles.singleAvatarSmall,
                secondAvatarStyles: styles.secondAvatarSmall,
            },
            _a[CONST_1.default.AVATAR_SIZE.LARGE] = {
                singleAvatarStyle: styles.singleAvatarMedium,
                secondAvatarStyles: styles.secondAvatarMedium,
            },
            _a[CONST_1.default.AVATAR_SIZE.DEFAULT] = {
                singleAvatarStyle: styles.singleAvatar,
                secondAvatarStyles: styles.secondAvatar,
            },
            _a);
    }, [styles]);
    var secondAvatarStyle = secondAvatarStyleProp !== null && secondAvatarStyleProp !== void 0 ? secondAvatarStyleProp : [StyleUtils.getBackgroundAndBorderStyle(isHovered ? theme.activeComponentBG : theme.componentBG)];
    var avatarContainerStyles = StyleUtils.getContainerStyles(size, isInReportAction);
    var _23 = (0, react_1.useMemo)(function () { var _a; return (_a = avatarSizeToStylesMap[size]) !== null && _a !== void 0 ? _a : avatarSizeToStylesMap.default; }, [size, avatarSizeToStylesMap]), singleAvatarStyle = _23.singleAvatarStyle, secondAvatarStyles = _23.secondAvatarStyles;
    var tooltipTexts = (0, react_1.useMemo)(function () { return (shouldShowTooltip ? icons.map(function (icon) { return (0, ReportUtils_1.getUserDetailTooltipText)(Number(icon.id), icon.name); }) : ['']); }, [shouldShowTooltip, icons]);
    var avatarSize = (0, react_1.useMemo)(function () {
        if (isFocusMode) {
            return CONST_1.default.AVATAR_SIZE.MID_SUBSCRIPT;
        }
        if (size === CONST_1.default.AVATAR_SIZE.LARGE) {
            return CONST_1.default.AVATAR_SIZE.MEDIUM;
        }
        return CONST_1.default.AVATAR_SIZE.SMALLER;
    }, [isFocusMode, size]);
    var avatarRows = (0, react_1.useMemo)(function () {
        // If we're not displaying avatars in rows or the number of icons is less than or equal to the max avatars in a row, return a single row
        if (!shouldDisplayAvatarsInRows || icons.length <= maxAvatarsInRow) {
            return [icons];
        }
        // Calculate the size of each row
        var rowSize = Math.min(Math.ceil(icons.length / 2), maxAvatarsInRow);
        // Slice the icons array into two rows
        var firstRow = icons.slice(0, rowSize);
        var secondRow = icons.slice(rowSize);
        // Update the state with the two rows as an array
        return [firstRow, secondRow];
    }, [icons, maxAvatarsInRow, shouldDisplayAvatarsInRows]);
    if (!icons.length) {
        return null;
    }
    if (icons.length === 1 && !shouldStackHorizontally) {
        return (<UserDetailsTooltip_1.default accountID={Number((_c = icons.at(0)) === null || _c === void 0 ? void 0 : _c.id)} icon={icons.at(0)} fallbackUserDetails={{
                displayName: (_d = icons.at(0)) === null || _d === void 0 ? void 0 : _d.name,
            }} shouldRender={shouldShowTooltip}>
                <react_native_1.View style={avatarContainerStyles}>
                    <Avatar_1.default source={(_e = icons.at(0)) === null || _e === void 0 ? void 0 : _e.source} size={size} fill={(_f = icons.at(0)) === null || _f === void 0 ? void 0 : _f.fill} name={(_g = icons.at(0)) === null || _g === void 0 ? void 0 : _g.name} avatarID={(_h = icons.at(0)) === null || _h === void 0 ? void 0 : _h.id} type={(_k = (_j = icons.at(0)) === null || _j === void 0 ? void 0 : _j.type) !== null && _k !== void 0 ? _k : CONST_1.default.ICON_TYPE_AVATAR} fallbackIcon={(_l = icons.at(0)) === null || _l === void 0 ? void 0 : _l.fallbackIcon}/>
                </react_native_1.View>
            </UserDetailsTooltip_1.default>);
    }
    var oneAvatarSize = StyleUtils.getAvatarStyle(size);
    var oneAvatarBorderWidth = (_m = StyleUtils.getAvatarBorderWidth(size).borderWidth) !== null && _m !== void 0 ? _m : 0;
    var overlapSize = oneAvatarSize.width / overlapDivider;
    if (shouldStackHorizontally) {
        // Height of one avatar + border space
        var height = oneAvatarSize.height + 2 * oneAvatarBorderWidth;
        avatarContainerStyles = StyleUtils.combineStyles([styles.alignItemsCenter, styles.flexRow, StyleUtils.getHeight(height)]);
    }
    return shouldStackHorizontally ? (avatarRows.map(function (avatars, rowIndex) {
        var _a;
        var _b, _c;
        return (<react_native_1.View style={avatarContainerStyles} 
        /* eslint-disable-next-line react/no-array-index-key */
        key={"avatarRow-".concat(rowIndex)}>
                {__spreadArray([], avatars, true).splice(0, maxAvatarsInRow).map(function (icon, index) {
                var _a;
                return (<UserDetailsTooltip_1.default key={"stackedAvatars-".concat(icon.id)} accountID={Number(icon.id)} icon={icon} fallbackUserDetails={{
                        displayName: icon.name,
                    }} shouldRender={shouldShowTooltip}>
                        <react_native_1.View style={[StyleUtils.getHorizontalStackedAvatarStyle(index, overlapSize), StyleUtils.getAvatarBorderRadius(size, icon.type)]}>
                            <Avatar_1.default iconAdditionalStyles={[
                        StyleUtils.getHorizontalStackedAvatarBorderStyle({
                            theme: theme,
                            isHovered: isHovered,
                            isPressed: isPressed,
                            isInReportAction: isInReportAction,
                            shouldUseCardBackground: shouldUseCardBackground,
                            isActive: isActive,
                        }),
                        StyleUtils.getAvatarBorderWidth(size),
                    ]} source={(_a = icon.source) !== null && _a !== void 0 ? _a : fallbackIcon} size={size} name={icon.name} avatarID={icon.id} type={icon.type} fallbackIcon={icon.fallbackIcon}/>
                        </react_native_1.View>
                    </UserDetailsTooltip_1.default>);
            })}
                {avatars.length > maxAvatarsInRow && (<Tooltip_1.default 
            // We only want to cap tooltips to only 10 users or so since some reports have hundreds of users, causing performance to degrade.
            text={tooltipTexts.slice(avatarRows.length * maxAvatarsInRow - 1, avatarRows.length * maxAvatarsInRow + 9).join(', ')} shouldRender={shouldShowTooltip}>
                        <react_native_1.View style={[
                    styles.alignItemsCenter,
                    styles.justifyContentCenter,
                    StyleUtils.getHorizontalStackedAvatarBorderStyle({
                        theme: theme,
                        isHovered: isHovered,
                        isPressed: isPressed,
                        isInReportAction: isInReportAction,
                        shouldUseCardBackground: shouldUseCardBackground,
                    }),
                    // Set overlay background color with RGBA value so that the text will not inherit opacity
                    StyleUtils.getBackgroundColorWithOpacityStyle(theme.overlay, variables_1.default.overlayOpacity),
                    StyleUtils.getHorizontalStackedOverlayAvatarStyle(oneAvatarSize, oneAvatarBorderWidth),
                    ((_b = icons.at(3)) === null || _b === void 0 ? void 0 : _b.type) === CONST_1.default.ICON_TYPE_WORKSPACE && StyleUtils.getAvatarBorderRadius(size, (_c = icons.at(3)) === null || _c === void 0 ? void 0 : _c.type),
                ]}>
                            <react_native_1.View style={[styles.justifyContentCenter, styles.alignItemsCenter, StyleUtils.getHeight(oneAvatarSize.height), StyleUtils.getWidthStyle(oneAvatarSize.width)]}>
                                <Text_1.default style={[styles.avatarInnerTextSmall, StyleUtils.getAvatarExtraFontSizeStyle(size), styles.userSelectNone]} dataSet={_a = {}, _a[CONST_1.default.SELECTION_SCRAPER_HIDDEN_ELEMENT] = true, _a}>{"+".concat(avatars.length - maxAvatarsInRow)}</Text_1.default>
                            </react_native_1.View>
                        </react_native_1.View>
                    </Tooltip_1.default>)}
            </react_native_1.View>);
    })) : (<react_native_1.View style={avatarContainerStyles}>
            <react_native_1.View style={[singleAvatarStyle, ((_o = icons.at(0)) === null || _o === void 0 ? void 0 : _o.type) === CONST_1.default.ICON_TYPE_WORKSPACE && StyleUtils.getAvatarBorderRadius(size, (_p = icons.at(0)) === null || _p === void 0 ? void 0 : _p.type)]}>
                <UserDetailsTooltip_1.default accountID={Number((_q = icons.at(0)) === null || _q === void 0 ? void 0 : _q.id)} icon={icons.at(0)} fallbackUserDetails={{
            displayName: (_r = icons.at(0)) === null || _r === void 0 ? void 0 : _r.name,
        }} shouldRender={shouldShowTooltip}>
                    {/* View is necessary for tooltip to show for multiple avatars in LHN */}
                    <react_native_1.View>
                        <Avatar_1.default source={(_t = (_s = icons.at(0)) === null || _s === void 0 ? void 0 : _s.source) !== null && _t !== void 0 ? _t : fallbackIcon} size={avatarSize} imageStyles={[singleAvatarStyle]} name={(_u = icons.at(0)) === null || _u === void 0 ? void 0 : _u.name} type={(_w = (_v = icons.at(0)) === null || _v === void 0 ? void 0 : _v.type) !== null && _w !== void 0 ? _w : CONST_1.default.ICON_TYPE_AVATAR} avatarID={(_x = icons.at(0)) === null || _x === void 0 ? void 0 : _x.id} fallbackIcon={(_y = icons.at(0)) === null || _y === void 0 ? void 0 : _y.fallbackIcon}/>
                    </react_native_1.View>
                </UserDetailsTooltip_1.default>
                <react_native_1.View style={[secondAvatarStyles, secondAvatarStyle, ((_z = icons.at(1)) === null || _z === void 0 ? void 0 : _z.type) === CONST_1.default.ICON_TYPE_WORKSPACE ? StyleUtils.getAvatarBorderRadius(size, (_0 = icons.at(1)) === null || _0 === void 0 ? void 0 : _0.type) : {}]}>
                    {icons.length === 2 ? (<UserDetailsTooltip_1.default accountID={Number((_1 = icons.at(1)) === null || _1 === void 0 ? void 0 : _1.id)} icon={icons.at(1)} fallbackUserDetails={{
                displayName: (_2 = icons.at(1)) === null || _2 === void 0 ? void 0 : _2.name,
            }} shouldRender={shouldShowTooltip}>
                            <react_native_1.View>
                                <Avatar_1.default source={(_4 = (_3 = icons.at(1)) === null || _3 === void 0 ? void 0 : _3.source) !== null && _4 !== void 0 ? _4 : fallbackIcon} size={avatarSize} imageStyles={[singleAvatarStyle]} name={(_5 = icons.at(1)) === null || _5 === void 0 ? void 0 : _5.name} avatarID={(_6 = icons.at(1)) === null || _6 === void 0 ? void 0 : _6.id} type={(_8 = (_7 = icons.at(1)) === null || _7 === void 0 ? void 0 : _7.type) !== null && _8 !== void 0 ? _8 : CONST_1.default.ICON_TYPE_AVATAR} fallbackIcon={(_9 = icons.at(1)) === null || _9 === void 0 ? void 0 : _9.fallbackIcon}/>
                            </react_native_1.View>
                        </UserDetailsTooltip_1.default>) : (<Tooltip_1.default text={tooltipTexts.slice(1).join(', ')} shouldRender={shouldShowTooltip}>
                            <react_native_1.View style={[singleAvatarStyle, styles.alignItemsCenter, styles.justifyContentCenter]}>
                                <Text_1.default style={[styles.userSelectNone, size === CONST_1.default.AVATAR_SIZE.SMALL ? styles.avatarInnerTextSmall : styles.avatarInnerText]} dataSet={_b = {}, _b[CONST_1.default.SELECTION_SCRAPER_HIDDEN_ELEMENT] = true, _b}>
                                    {"+".concat(icons.length - 1)}
                                </Text_1.default>
                            </react_native_1.View>
                        </Tooltip_1.default>)}
                </react_native_1.View>
            </react_native_1.View>
        </react_native_1.View>);
}
MultipleAvatars.displayName = 'MultipleAvatars';
exports.default = (0, react_1.memo)(MultipleAvatars);
