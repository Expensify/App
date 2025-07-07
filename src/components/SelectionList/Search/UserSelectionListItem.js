"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Avatar_1 = require("@components/Avatar");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var PressableWithFeedback_1 = require("@components/Pressable/PressableWithFeedback");
var BaseListItem_1 = require("@components/SelectionList/BaseListItem");
var TextWithTooltip_1 = require("@components/TextWithTooltip");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var LoginUtils_1 = require("@libs/LoginUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
function UserSelectionListItem(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j;
    var item = _a.item, isFocused = _a.isFocused, showTooltip = _a.showTooltip, isDisabled = _a.isDisabled, canSelectMultiple = _a.canSelectMultiple, onSelectRow = _a.onSelectRow, onCheckboxPress = _a.onCheckboxPress, onDismissError = _a.onDismissError, shouldPreventEnterKeySubmit = _a.shouldPreventEnterKeySubmit, rightHandSideComponent = _a.rightHandSideComponent, onFocus = _a.onFocus, shouldSyncFocus = _a.shouldSyncFocus, wrapperStyle = _a.wrapperStyle, pressableStyle = _a.pressableStyle;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var currentUserPersonalDetails = (0, useCurrentUserPersonalDetails_1.default)();
    var handleCheckboxPress = (0, react_1.useCallback)(function () {
        if (onCheckboxPress) {
            onCheckboxPress(item);
        }
        else {
            onSelectRow(item);
        }
    }, [item, onCheckboxPress, onSelectRow]);
    var userHandle = (0, react_1.useMemo)(function () {
        var _a, _b;
        var login = (_a = item.login) !== null && _a !== void 0 ? _a : '';
        // If the emails are not in the same private domain, we just return the users email
        if (!(0, LoginUtils_1.areEmailsFromSamePrivateDomain)(login, (_b = currentUserPersonalDetails.login) !== null && _b !== void 0 ? _b : '')) {
            return expensify_common_1.Str.removeSMSDomain(login);
        }
        // Otherwise, the emails are a part of the same private domain, so we can remove the domain and just show username
        return login.split('@').at(0);
    }, [currentUserPersonalDetails.login, item.login]);
    var userDisplayName = (0, react_1.useMemo)(function () {
        var _a;
        return (0, ReportUtils_1.getDisplayNameForParticipant)({
            accountID: (_a = item.accountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID,
            shouldAddCurrentUserPostfix: true,
        });
    }, [item.accountID]);
    return (<BaseListItem_1.default item={item} wrapperStyle={[styles.flex1, styles.sidebarLinkInner, styles.userSelectNone, wrapperStyle]} isFocused={isFocused} isDisabled={isDisabled} showTooltip={showTooltip} canSelectMultiple={canSelectMultiple} onSelectRow={onSelectRow} onDismissError={onDismissError} shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit} rightHandSideComponent={rightHandSideComponent} errors={item.errors} pendingAction={item.pendingAction} pressableStyle={pressableStyle} keyForList={item.keyForList} onFocus={onFocus} shouldSyncFocus={shouldSyncFocus}>
            <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.h13, styles.gap3, styles.w100]}>
                {!!((_b = item.icons) === null || _b === void 0 ? void 0 : _b.length) && (<react_native_1.View style={styles.mentionSuggestionsAvatarContainer}>
                        <Avatar_1.default source={(_c = item.icons.at(0)) === null || _c === void 0 ? void 0 : _c.source} size={CONST_1.default.AVATAR_SIZE.SMALL} name={(_d = item.icons.at(0)) === null || _d === void 0 ? void 0 : _d.name} avatarID={(_e = item.icons.at(0)) === null || _e === void 0 ? void 0 : _e.id} type={(_g = (_f = item.icons.at(0)) === null || _f === void 0 ? void 0 : _f.type) !== null && _g !== void 0 ? _g : CONST_1.default.ICON_TYPE_AVATAR} fallbackIcon={(_h = item.icons.at(0)) === null || _h === void 0 ? void 0 : _h.fallbackIcon}/>
                    </react_native_1.View>)}

                <react_native_1.View style={[styles.flex1, styles.flexRow, styles.gap2, styles.flexShrink1, styles.alignItemsCenter]}>
                    <TextWithTooltip_1.default shouldShowTooltip={showTooltip} text={userDisplayName} style={[styles.flexShrink0, styles.optionDisplayName, isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText, styles.sidebarLinkTextBold, styles.pre]}/>
                    {!!userHandle && (<TextWithTooltip_1.default text={"@".concat(userHandle)} shouldShowTooltip={showTooltip} style={[styles.textLabelSupporting, styles.lh16, styles.pre, styles.flexShrink1]}/>)}
                </react_native_1.View>

                <PressableWithFeedback_1.default accessibilityLabel={(_j = item.text) !== null && _j !== void 0 ? _j : ''} role={CONST_1.default.ROLE.BUTTON} 
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    disabled={isDisabled || item.isDisabledCheckbox} onPress={handleCheckboxPress} style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), item.isDisabledCheckbox && styles.cursorDisabled, styles.mr3]}>
                    <react_native_1.View style={[StyleUtils.getCheckboxContainerStyle(20), StyleUtils.getMultiselectListStyles(!!item.isSelected, !!item.isDisabled)]}>
                        {!!item.isSelected && (<Icon_1.default src={Expensicons.Checkmark} fill={theme.textLight} height={14} width={14}/>)}
                    </react_native_1.View>
                </PressableWithFeedback_1.default>

                {!!item.rightElement && item.rightElement}
            </react_native_1.View>
        </BaseListItem_1.default>);
}
UserSelectionListItem.displayName = 'UserSelectionListItem';
exports.default = UserSelectionListItem;
