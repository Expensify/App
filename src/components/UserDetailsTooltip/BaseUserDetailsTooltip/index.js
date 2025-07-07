"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Avatar_1 = require("@components/Avatar");
var OnyxProvider_1 = require("@components/OnyxProvider");
var Text_1 = require("@components/Text");
var Tooltip_1 = require("@components/Tooltip");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Session_1 = require("@libs/actions/Session");
var LocalePhoneNumber = require("@libs/LocalePhoneNumber");
var ReportUtils = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function BaseUserDetailsTooltip(_a) {
    var _b, _c, _d, _e, _f;
    var accountID = _a.accountID, fallbackUserDetails = _a.fallbackUserDetails, icon = _a.icon, delegateAccountID = _a.delegateAccountID, shiftHorizontal = _a.shiftHorizontal, children = _a.children;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var personalDetails = (0, OnyxProvider_1.usePersonalDetails)();
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION)[0];
    var isCurrentUserAnonymous = (session === null || session === void 0 ? void 0 : session.accountID) === accountID && (0, Session_1.isAnonymousUser)(session);
    var userDetails = (_c = (_b = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID]) !== null && _b !== void 0 ? _b : fallbackUserDetails) !== null && _c !== void 0 ? _c : {};
    var userDisplayName = ReportUtils.getUserDetailTooltipText(accountID, userDetails.displayName ? userDetails.displayName.trim() : '');
    var userLogin = !isCurrentUserAnonymous && ((_d = userDetails.login) === null || _d === void 0 ? void 0 : _d.trim()) && userDetails.login !== userDetails.displayName ? expensify_common_1.Str.removeSMSDomain(userDetails.login) : '';
    var userAvatar = userDetails.avatar;
    var userAccountID = accountID;
    // We replace the actor's email, name, and avatar with the Copilot manually for now. This will be improved upon when
    // the Copilot feature is implemented.
    if (delegateAccountID && delegateAccountID > 0) {
        var delegateUserDetails = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[delegateAccountID];
        var delegateUserDisplayName = ReportUtils.getUserDetailTooltipText(delegateAccountID);
        userDisplayName = "".concat(delegateUserDisplayName, " (").concat(translate('reportAction.asCopilot'), " ").concat(userDisplayName, ")");
        userLogin = (_e = delegateUserDetails === null || delegateUserDetails === void 0 ? void 0 : delegateUserDetails.login) !== null && _e !== void 0 ? _e : '';
        userAvatar = delegateUserDetails === null || delegateUserDetails === void 0 ? void 0 : delegateUserDetails.avatar;
        userAccountID = delegateAccountID;
    }
    var title = String(userDisplayName).trim() ? userDisplayName : '';
    var subtitle = userLogin.trim() && LocalePhoneNumber.formatPhoneNumber(userLogin) !== userDisplayName ? expensify_common_1.Str.removeSMSDomain(userLogin) : '';
    if (icon && (icon.type === CONST_1.default.ICON_TYPE_WORKSPACE || !title)) {
        title = (_f = icon.name) !== null && _f !== void 0 ? _f : '';
        // We need to clear the subtitle for workspaces so that we don't display any user details under the workspace name
        if (icon.type === CONST_1.default.ICON_TYPE_WORKSPACE) {
            subtitle = '';
        }
    }
    if (CONST_1.default.RESTRICTED_ACCOUNT_IDS.includes(userAccountID) || CONST_1.default.RESTRICTED_EMAILS.includes(userLogin.trim())) {
        subtitle = '';
    }
    var renderTooltipContent = (0, react_1.useCallback)(function () {
        var _a, _b, _c, _d;
        return (<react_native_1.View style={[styles.alignItemsCenter, styles.ph2, styles.pv2]}>
                <react_native_1.View style={styles.emptyAvatar}>
                    <Avatar_1.default containerStyles={[styles.actionAvatar]} source={(_a = icon === null || icon === void 0 ? void 0 : icon.source) !== null && _a !== void 0 ? _a : userAvatar} avatarID={(_b = icon === null || icon === void 0 ? void 0 : icon.id) !== null && _b !== void 0 ? _b : userAccountID} type={(_c = icon === null || icon === void 0 ? void 0 : icon.type) !== null && _c !== void 0 ? _c : CONST_1.default.ICON_TYPE_AVATAR} name={(_d = icon === null || icon === void 0 ? void 0 : icon.name) !== null && _d !== void 0 ? _d : userLogin} fallbackIcon={icon === null || icon === void 0 ? void 0 : icon.fallbackIcon}/>
                </react_native_1.View>
                <Text_1.default style={[styles.mt2, styles.textMicroBold, styles.textReactionSenders, styles.textAlignCenter]}>{title}</Text_1.default>
                <Text_1.default style={[styles.textMicro, styles.fontColorReactionLabel, styles.breakWord, styles.textAlignCenter]}>{subtitle}</Text_1.default>
            </react_native_1.View>);
    }, [
        styles.alignItemsCenter,
        styles.ph2,
        styles.pv2,
        styles.emptyAvatar,
        styles.actionAvatar,
        styles.mt2,
        styles.textMicroBold,
        styles.textReactionSenders,
        styles.textAlignCenter,
        styles.textMicro,
        styles.fontColorReactionLabel,
        styles.breakWord,
        icon,
        userAvatar,
        userAccountID,
        userLogin,
        title,
        subtitle,
    ]);
    if (!icon && !userDisplayName && !userLogin) {
        return children;
    }
    return (<Tooltip_1.default shiftHorizontal={shiftHorizontal} renderTooltipContent={renderTooltipContent} renderTooltipContentKey={[userDisplayName, userLogin]} shouldHandleScroll>
            {children}
        </Tooltip_1.default>);
}
BaseUserDetailsTooltip.displayName = 'BaseUserDetailsTooltip';
exports.default = BaseUserDetailsTooltip;
