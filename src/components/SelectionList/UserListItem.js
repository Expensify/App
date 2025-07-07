"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Expensicons_1 = require("@components/Icon/Expensicons");
var MultipleAvatars_1 = require("@components/MultipleAvatars");
var PressableWithFeedback_1 = require("@components/Pressable/PressableWithFeedback");
var SubscriptAvatar_1 = require("@components/SubscriptAvatar");
var Text_1 = require("@components/Text");
var TextWithTooltip_1 = require("@components/TextWithTooltip");
var useLocalize_1 = require("@hooks/useLocalize");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var getButtonState_1 = require("@libs/getButtonState");
var CONST_1 = require("@src/CONST");
var BaseListItem_1 = require("./BaseListItem");
var fallbackIcon = {
    source: Expensicons_1.FallbackAvatar,
    type: CONST_1.default.ICON_TYPE_AVATAR,
    name: '',
    id: -1,
};
function UserListItem(_a) {
    var item = _a.item, isFocused = _a.isFocused, showTooltip = _a.showTooltip, isDisabled = _a.isDisabled, canSelectMultiple = _a.canSelectMultiple, onSelectRow = _a.onSelectRow, onCheckboxPress = _a.onCheckboxPress, onDismissError = _a.onDismissError, shouldPreventEnterKeySubmit = _a.shouldPreventEnterKeySubmit, rightHandSideComponent = _a.rightHandSideComponent, onFocus = _a.onFocus, shouldSyncFocus = _a.shouldSyncFocus, wrapperStyle = _a.wrapperStyle, pressableStyle = _a.pressableStyle;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;
    var subscriptAvatarBorderColor = isFocused ? focusedBackgroundColor : theme.sidebar;
    var hoveredBackgroundColor = !!styles.sidebarLinkHover && 'backgroundColor' in styles.sidebarLinkHover ? styles.sidebarLinkHover.backgroundColor : theme.sidebar;
    var handleCheckboxPress = (0, react_1.useCallback)(function () {
        if (onCheckboxPress) {
            onCheckboxPress(item);
        }
        else {
            onSelectRow(item);
        }
    }, [item, onCheckboxPress, onSelectRow]);
    return (<BaseListItem_1.default item={item} wrapperStyle={[styles.flex1, styles.justifyContentBetween, styles.sidebarLinkInner, styles.userSelectNone, styles.peopleRow, wrapperStyle]} isFocused={isFocused} isDisabled={isDisabled} showTooltip={showTooltip} canSelectMultiple={canSelectMultiple} onSelectRow={onSelectRow} onDismissError={onDismissError} shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit} rightHandSideComponent={rightHandSideComponent} errors={item.errors} pendingAction={item.pendingAction} pressableStyle={pressableStyle} FooterComponent={item.invitedSecondaryLogin ? (<Text_1.default style={[styles.ml9, styles.ph5, styles.pb3, styles.textLabelSupporting]}>
                        {translate('workspace.people.invitedBySecondaryLogin', { secondaryLogin: item.invitedSecondaryLogin })}
                    </Text_1.default>) : undefined} keyForList={item.keyForList} onFocus={onFocus} shouldSyncFocus={shouldSyncFocus}>
            {function (hovered) {
            var _a, _b, _c, _d;
            return (<>
                    {!!canSelectMultiple && (<PressableWithFeedback_1.default accessibilityLabel={(_a = item.text) !== null && _a !== void 0 ? _a : ''} role={CONST_1.default.ROLE.BUTTON} 
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                disabled={isDisabled || item.isDisabledCheckbox} onPress={handleCheckboxPress} style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), item.isDisabledCheckbox && styles.cursorDisabled, styles.mr3]}>
                            <react_native_1.View style={[StyleUtils.getCheckboxContainerStyle(20), StyleUtils.getMultiselectListStyles(!!item.isSelected, !!item.isDisabled)]}>
                                {!!item.isSelected && (<Icon_1.default src={Expensicons.Checkmark} fill={theme.textLight} height={14} width={14}/>)}
                            </react_native_1.View>
                        </PressableWithFeedback_1.default>)}
                    {!!item.icons &&
                    (item.shouldShowSubscript ? (<SubscriptAvatar_1.default mainAvatar={(_b = item.icons.at(0)) !== null && _b !== void 0 ? _b : fallbackIcon} secondaryAvatar={item.icons.at(1)} showTooltip={showTooltip} backgroundColor={hovered && !isFocused ? hoveredBackgroundColor : subscriptAvatarBorderColor}/>) : (<MultipleAvatars_1.default icons={item.icons} shouldShowTooltip={showTooltip} secondAvatarStyle={[
                            StyleUtils.getBackgroundAndBorderStyle(theme.sidebar),
                            isFocused ? StyleUtils.getBackgroundAndBorderStyle(focusedBackgroundColor) : undefined,
                            hovered && !isFocused ? StyleUtils.getBackgroundAndBorderStyle(hoveredBackgroundColor) : undefined,
                        ]}/>))}
                    <react_native_1.View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch, styles.optionRow]}>
                        <TextWithTooltip_1.default shouldShowTooltip={showTooltip} text={expensify_common_1.Str.removeSMSDomain((_c = item.text) !== null && _c !== void 0 ? _c : '')} style={[
                    styles.optionDisplayName,
                    isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText,
                    item.isBold !== false && styles.sidebarLinkTextBold,
                    styles.pre,
                    item.alternateText ? styles.mb1 : null,
                ]}/>
                        {!!item.alternateText && (<TextWithTooltip_1.default shouldShowTooltip={showTooltip} text={expensify_common_1.Str.removeSMSDomain((_d = item.alternateText) !== null && _d !== void 0 ? _d : '')} style={[styles.textLabelSupporting, styles.lh16, styles.pre]}/>)}
                    </react_native_1.View>
                    {!!item.rightElement && item.rightElement}
                    {!!item.shouldShowRightIcon && (<react_native_1.View style={[styles.popoverMenuIcon, styles.pointerEventsAuto, isDisabled && styles.cursorDisabled]}>
                            <Icon_1.default src={Expensicons.ArrowRight} fill={StyleUtils.getIconFillColor((0, getButtonState_1.default)(hovered, false, false, !!isDisabled, item.isInteractive !== false))}/>
                        </react_native_1.View>)}
                </>);
        }}
        </BaseListItem_1.default>);
}
UserListItem.displayName = 'UserListItem';
exports.default = UserListItem;
