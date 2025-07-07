"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var Avatar_1 = require("./Avatar");
var Icon_1 = require("./Icon");
var UserDetailsTooltip_1 = require("./UserDetailsTooltip");
function SubscriptAvatar(_a) {
    var _b, _c;
    var mainAvatar = _a.mainAvatar, secondaryAvatar = _a.secondaryAvatar, subscriptIcon = _a.subscriptIcon, _d = _a.size, size = _d === void 0 ? CONST_1.default.AVATAR_SIZE.DEFAULT : _d, backgroundColor = _a.backgroundColor, _e = _a.noMargin, noMargin = _e === void 0 ? false : _e, _f = _a.showTooltip, showTooltip = _f === void 0 ? true : _f;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var isSmall = size === CONST_1.default.AVATAR_SIZE.SMALL;
    var subscriptStyle = size === CONST_1.default.AVATAR_SIZE.SMALL_NORMAL ? styles.secondAvatarSubscriptSmallNormal : styles.secondAvatarSubscript;
    var containerStyle = StyleUtils.getContainerStyles(size);
    return (<react_native_1.View style={[containerStyle, noMargin ? styles.mr0 : {}]}>
            <UserDetailsTooltip_1.default shouldRender={showTooltip} accountID={Number((_b = mainAvatar === null || mainAvatar === void 0 ? void 0 : mainAvatar.id) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID)} icon={mainAvatar} fallbackUserDetails={{
            displayName: mainAvatar === null || mainAvatar === void 0 ? void 0 : mainAvatar.name,
        }}>
                <react_native_1.View>
                    <Avatar_1.default containerStyles={StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(size || CONST_1.default.AVATAR_SIZE.DEFAULT))} source={mainAvatar === null || mainAvatar === void 0 ? void 0 : mainAvatar.source} size={size} name={mainAvatar === null || mainAvatar === void 0 ? void 0 : mainAvatar.name} avatarID={mainAvatar === null || mainAvatar === void 0 ? void 0 : mainAvatar.id} type={mainAvatar === null || mainAvatar === void 0 ? void 0 : mainAvatar.type} fallbackIcon={mainAvatar === null || mainAvatar === void 0 ? void 0 : mainAvatar.fallbackIcon}/>
                </react_native_1.View>
            </UserDetailsTooltip_1.default>
            {!!secondaryAvatar && (<UserDetailsTooltip_1.default shouldRender={showTooltip} accountID={Number((_c = secondaryAvatar.id) !== null && _c !== void 0 ? _c : CONST_1.default.DEFAULT_NUMBER_ID)} icon={secondaryAvatar}>
                    <react_native_1.View style={[size === CONST_1.default.AVATAR_SIZE.SMALL_NORMAL ? styles.flex1 : {}, isSmall ? styles.secondAvatarSubscriptCompact : subscriptStyle]} 
        // Hover on overflowed part of icon will not work on Electron if dragArea is true
        // https://stackoverflow.com/questions/56338939/hover-in-css-is-not-working-with-electron
        dataSet={{ dragArea: false }}>
                        <Avatar_1.default iconAdditionalStyles={[
                StyleUtils.getAvatarBorderWidth(isSmall ? CONST_1.default.AVATAR_SIZE.SMALL_SUBSCRIPT : CONST_1.default.AVATAR_SIZE.SUBSCRIPT),
                StyleUtils.getBorderColorStyle(backgroundColor !== null && backgroundColor !== void 0 ? backgroundColor : theme.componentBG),
            ]} source={secondaryAvatar.source} size={isSmall ? CONST_1.default.AVATAR_SIZE.SMALL_SUBSCRIPT : CONST_1.default.AVATAR_SIZE.SUBSCRIPT} fill={secondaryAvatar.fill} name={secondaryAvatar.name} avatarID={secondaryAvatar.id} type={secondaryAvatar.type} fallbackIcon={secondaryAvatar.fallbackIcon}/>
                    </react_native_1.View>
                </UserDetailsTooltip_1.default>)}
            {!!subscriptIcon && (<react_native_1.View style={[
                size === CONST_1.default.AVATAR_SIZE.SMALL_NORMAL ? styles.flex1 : {},
                // Nullish coalescing thinks that empty strings are truthy, thus I'm using OR operator
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                StyleUtils.getBorderColorStyle(backgroundColor || theme.sidebar),
                StyleUtils.getAvatarSubscriptIconContainerStyle(subscriptIcon.width, subscriptIcon.height),
                styles.dFlex,
                styles.justifyContentCenter,
            ]} 
        // Hover on overflowed part of icon will not work on Electron if dragArea is true
        // https://stackoverflow.com/questions/56338939/hover-in-css-is-not-working-with-electron
        dataSet={{ dragArea: false }}>
                    <Icon_1.default src={subscriptIcon.source} width={subscriptIcon.width} height={subscriptIcon.height} additionalStyles={styles.alignSelfCenter} fill={subscriptIcon.fill}/>
                </react_native_1.View>)}
        </react_native_1.View>);
}
SubscriptAvatar.displayName = 'SubscriptAvatar';
exports.default = (0, react_1.memo)(SubscriptAvatar);
