"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var Delegate_1 = require("@libs/actions/Delegate");
var Modal_1 = require("@libs/actions/Modal");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var LocalePhoneNumber_1 = require("@libs/LocalePhoneNumber");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var TextWithEmojiFragment_1 = require("@pages/home/report/comment/TextWithEmojiFragment");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var Avatar_1 = require("./Avatar");
var ConfirmModal_1 = require("./ConfirmModal");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
var PopoverMenu_1 = require("./PopoverMenu");
var Pressable_1 = require("./Pressable");
var ProductTrainingContext_1 = require("./ProductTrainingContext");
var Text_1 = require("./Text");
var Tooltip_1 = require("./Tooltip");
var EducationalTooltip_1 = require("./Tooltip/EducationalTooltip");
function AccountSwitcher(_a) {
    var _b, _c, _d, _e, _f;
    var isScreenFocused = _a.isScreenFocused;
    var currentUserPersonalDetails = (0, useCurrentUserPersonalDetails_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: true })[0];
    var accountID = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: false, selector: function (onyxSession) { return onyxSession === null || onyxSession === void 0 ? void 0 : onyxSession.accountID; } })[0];
    var buttonRef = (0, react_1.useRef)(null);
    var windowHeight = (0, useWindowDimensions_1.default)().windowHeight;
    var _g = (0, react_1.useState)(false), shouldShowDelegatorMenu = _g[0], setShouldShowDelegatorMenu = _g[1];
    var _h = (0, react_1.useState)(false), shouldShowOfflineModal = _h[0], setShouldShowOfflineModal = _h[1];
    var delegators = (_c = (_b = account === null || account === void 0 ? void 0 : account.delegatedAccess) === null || _b === void 0 ? void 0 : _b.delegators) !== null && _c !== void 0 ? _c : [];
    var isActingAsDelegate = !!((_d = account === null || account === void 0 ? void 0 : account.delegatedAccess) === null || _d === void 0 ? void 0 : _d.delegate);
    var canSwitchAccounts = delegators.length > 0 || isActingAsDelegate;
    var displayName = (_e = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.displayName) !== null && _e !== void 0 ? _e : '';
    var doesDisplayNameContainEmojis = new RegExp(CONST_1.default.REGEX.EMOJIS, CONST_1.default.REGEX.EMOJIS.flags.concat('g')).test(displayName);
    var _j = (0, ProductTrainingContext_1.useProductTrainingContext)(CONST_1.default.PRODUCT_TRAINING_TOOLTIP_NAMES.ACCOUNT_SWITCHER, isScreenFocused && canSwitchAccounts), shouldShowProductTrainingTooltip = _j.shouldShowProductTrainingTooltip, renderProductTrainingTooltip = _j.renderProductTrainingTooltip, hideProductTrainingTooltip = _j.hideProductTrainingTooltip;
    var onPressSwitcher = function () {
        hideProductTrainingTooltip();
        setShouldShowDelegatorMenu(!shouldShowDelegatorMenu);
    };
    var TooltipToRender = shouldShowProductTrainingTooltip ? EducationalTooltip_1.default : Tooltip_1.default;
    var tooltipProps = shouldShowProductTrainingTooltip
        ? {
            shouldRender: shouldShowProductTrainingTooltip,
            renderTooltipContent: renderProductTrainingTooltip,
            anchorAlignment: {
                horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
            },
            shiftVertical: variables_1.default.accountSwitcherTooltipShiftVertical,
            shiftHorizontal: variables_1.default.accountSwitcherTooltipShiftHorizontal,
            wrapperStyle: styles.productTrainingTooltipWrapper,
            onTooltipPress: onPressSwitcher,
        }
        : {
            text: translate('delegate.copilotAccess'),
            shiftVertical: 8,
            shiftHorizontal: 8,
            anchorAlignment: { horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM },
            shouldRender: canSwitchAccounts,
        };
    var createBaseMenuItem = function (personalDetails, errors, additionalProps) {
        var _a, _b, _c, _d, _e, _f;
        if (additionalProps === void 0) { additionalProps = {}; }
        var error = (_a = Object.values(errors !== null && errors !== void 0 ? errors : {}).at(0)) !== null && _a !== void 0 ? _a : '';
        return __assign({ text: (_c = (_b = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.displayName) !== null && _b !== void 0 ? _b : personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.login) !== null && _c !== void 0 ? _c : '', description: expensify_common_1.Str.removeSMSDomain((_d = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.login) !== null && _d !== void 0 ? _d : ''), avatarID: (_e = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.accountID) !== null && _e !== void 0 ? _e : CONST_1.default.DEFAULT_NUMBER_ID, icon: (_f = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.avatar) !== null && _f !== void 0 ? _f : '', iconType: CONST_1.default.ICON_TYPE_AVATAR, outerWrapperStyle: shouldUseNarrowLayout ? {} : styles.accountSwitcherPopover, numberOfLinesDescription: 1, errorText: error !== null && error !== void 0 ? error : '', shouldShowRedDotIndicator: !!error, errorTextStyle: styles.mt2 }, additionalProps);
    };
    var menuItems = function () {
        var _a, _b, _c, _d;
        var currentUserMenuItem = createBaseMenuItem(currentUserPersonalDetails, undefined, {
            shouldShowRightIcon: true,
            iconRight: Expensicons.Checkmark,
            success: true,
            isSelected: true,
        });
        if (isActingAsDelegate) {
            var delegateEmail = (_b = (_a = account === null || account === void 0 ? void 0 : account.delegatedAccess) === null || _a === void 0 ? void 0 : _a.delegate) !== null && _b !== void 0 ? _b : '';
            // Avoid duplicating the current user in the list when switching accounts
            if (delegateEmail === currentUserPersonalDetails.login) {
                return [currentUserMenuItem];
            }
            var delegatePersonalDetails = (0, PersonalDetailsUtils_1.getPersonalDetailByEmail)(delegateEmail);
            var error = (0, ErrorUtils_1.getLatestError)((_d = (_c = account === null || account === void 0 ? void 0 : account.delegatedAccess) === null || _c === void 0 ? void 0 : _c.errorFields) === null || _d === void 0 ? void 0 : _d.disconnect);
            return [
                createBaseMenuItem(delegatePersonalDetails, error, {
                    onSelected: function () {
                        if (isOffline) {
                            (0, Modal_1.close)(function () { return setShouldShowOfflineModal(true); });
                            return;
                        }
                        (0, Delegate_1.disconnect)();
                    },
                }),
                currentUserMenuItem,
            ];
        }
        var delegatorMenuItems = delegators
            .filter(function (_a) {
            var email = _a.email;
            return email !== currentUserPersonalDetails.login;
        })
            .map(function (_a) {
            var _b, _c, _d;
            var email = _a.email, role = _a.role;
            var errorFields = (_c = (_b = account === null || account === void 0 ? void 0 : account.delegatedAccess) === null || _b === void 0 ? void 0 : _b.errorFields) !== null && _c !== void 0 ? _c : {};
            var error = (0, ErrorUtils_1.getLatestError)((_d = errorFields === null || errorFields === void 0 ? void 0 : errorFields.connect) === null || _d === void 0 ? void 0 : _d[email]);
            var personalDetails = (0, PersonalDetailsUtils_1.getPersonalDetailByEmail)(email);
            return createBaseMenuItem(personalDetails, error, {
                badgeText: translate('delegate.role', { role: role }),
                onSelected: function () {
                    if (isOffline) {
                        (0, Modal_1.close)(function () { return setShouldShowOfflineModal(true); });
                        return;
                    }
                    (0, Delegate_1.connect)(email);
                },
            });
        });
        return __spreadArray([currentUserMenuItem], delegatorMenuItems, true);
    };
    var hideDelegatorMenu = function () {
        setShouldShowDelegatorMenu(false);
        (0, Delegate_1.clearDelegatorErrors)();
    };
    return (<>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <TooltipToRender {...tooltipProps}>
                <Pressable_1.PressableWithFeedback accessible accessibilityLabel={translate('common.profile')} onPress={onPressSwitcher} ref={buttonRef} interactive={canSwitchAccounts} pressDimmingValue={canSwitchAccounts ? undefined : 1} wrapperStyle={[styles.flexGrow1, styles.flex1, styles.mnw0, styles.justifyContentCenter]}>
                    <react_native_1.View style={[styles.flexRow, styles.gap3, styles.alignItemsCenter]}>
                        <Avatar_1.default type={CONST_1.default.ICON_TYPE_AVATAR} size={CONST_1.default.AVATAR_SIZE.DEFAULT} avatarID={currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.accountID} source={currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.avatar} fallbackIcon={currentUserPersonalDetails.fallbackIcon}/>
                        <react_native_1.View style={[styles.flex1, styles.flexShrink1, styles.flexBasis0, styles.justifyContentCenter, styles.gap1]}>
                            <react_native_1.View style={[styles.flexRow, styles.gap1]}>
                                {doesDisplayNameContainEmojis ? (<Text_1.default numberOfLines={1}>
                                        <TextWithEmojiFragment_1.default message={displayName} style={[styles.textBold, styles.textLarge, styles.flexShrink1, styles.lineHeightXLarge]}/>
                                    </Text_1.default>) : (<Text_1.default numberOfLines={1} style={[styles.textBold, styles.textLarge, styles.flexShrink1, styles.lineHeightXLarge]}>
                                        {(0, LocalePhoneNumber_1.formatPhoneNumber)(displayName)}
                                    </Text_1.default>)}
                                {!!canSwitchAccounts && (<react_native_1.View style={styles.justifyContentCenter}>
                                        <Icon_1.default fill={theme.icon} src={Expensicons.CaretUpDown} height={variables_1.default.iconSizeSmall} width={variables_1.default.iconSizeSmall}/>
                                    </react_native_1.View>)}
                            </react_native_1.View>
                            <Text_1.default numberOfLines={1} style={[styles.colorMuted, styles.fontSizeLabel]}>
                                {expensify_common_1.Str.removeSMSDomain((_f = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.login) !== null && _f !== void 0 ? _f : '')}
                            </Text_1.default>
                            {!!(account === null || account === void 0 ? void 0 : account.isDebugModeEnabled) && (<Text_1.default style={[styles.textLabelSupporting, styles.mt1, styles.w100]} numberOfLines={1}>
                                    AccountID: {accountID}
                                </Text_1.default>)}
                        </react_native_1.View>
                    </react_native_1.View>
                </Pressable_1.PressableWithFeedback>
            </TooltipToRender>

            {!!canSwitchAccounts && (<PopoverMenu_1.default isVisible={shouldShowDelegatorMenu} onClose={hideDelegatorMenu} onItemSelected={hideDelegatorMenu} anchorRef={buttonRef} anchorPosition={CONST_1.default.POPOVER_ACCOUNT_SWITCHER_POSITION} anchorAlignment={{
                horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
            }} menuItems={menuItems()} headerText={translate('delegate.switchAccount')} containerStyles={[{ maxHeight: windowHeight / 2 }, styles.pb0, styles.mw100, shouldUseNarrowLayout ? {} : styles.wFitContent]} headerStyles={styles.pt0} innerContainerStyle={styles.pb0} scrollContainerStyle={styles.pb4} shouldUseScrollView shouldUpdateFocusedIndex={false}/>)}
            <ConfirmModal_1.default title={translate('common.youAppearToBeOffline')} isVisible={shouldShowOfflineModal} onConfirm={function () { return setShouldShowOfflineModal(false); }} onCancel={function () { return setShouldShowOfflineModal(false); }} confirmText={translate('common.buttonConfirm')} prompt={translate('common.offlinePrompt')} shouldShowCancelButton={false}/>
        </>);
}
AccountSwitcher.displayName = 'AccountSwitcher';
exports.default = AccountSwitcher;
