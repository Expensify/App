"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var MultipleAvatars_1 = require("@components/MultipleAvatars");
var PressableWithFeedback_1 = require("@components/Pressable/PressableWithFeedback");
var TextWithTooltip_1 = require("@components/TextWithTooltip");
var useAnimatedHighlightStyle_1 = require("@hooks/useAnimatedHighlightStyle");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var BaseListItem_1 = require("./BaseListItem");
function TableListItem(_a) {
    var _b;
    var item = _a.item, isFocused = _a.isFocused, showTooltip = _a.showTooltip, isDisabled = _a.isDisabled, canSelectMultiple = _a.canSelectMultiple, onSelectRow = _a.onSelectRow, onCheckboxPress = _a.onCheckboxPress, onDismissError = _a.onDismissError, rightHandSideComponent = _a.rightHandSideComponent, onFocus = _a.onFocus, onLongPressRow = _a.onLongPressRow, shouldSyncFocus = _a.shouldSyncFocus, titleContainerStyles = _a.titleContainerStyles, shouldUseDefaultRightHandSideCheckmark = _a.shouldUseDefaultRightHandSideCheckmark;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var animatedHighlightStyle = (0, useAnimatedHighlightStyle_1.default)({
        borderRadius: styles.selectionListPressableItemWrapper.borderRadius,
        shouldHighlight: !!item.shouldAnimateInHighlight,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
    });
    var focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;
    var hoveredBackgroundColor = ((_b = styles.sidebarLinkHover) === null || _b === void 0 ? void 0 : _b.backgroundColor) ? styles.sidebarLinkHover.backgroundColor : theme.sidebar;
    var handleCheckboxPress = (0, react_1.useCallback)(function () {
        if (onCheckboxPress) {
            onCheckboxPress(item);
        }
        else {
            onSelectRow(item);
        }
    }, [item, onCheckboxPress, onSelectRow]);
    return (<BaseListItem_1.default item={item} pressableStyle={[
            [
                styles.selectionListPressableItemWrapper,
                styles.mh0,
                // Removing background style because they are added to the parent OpacityView via animatedHighlightStyle
                item.shouldAnimateInHighlight ? styles.bgTransparent : undefined,
                item.isSelected && styles.activeComponentBG,
                item.cursorStyle,
            ],
        ]} pressableWrapperStyle={[styles.mh5, animatedHighlightStyle]} wrapperStyle={[styles.flexRow, styles.flex1, styles.justifyContentBetween, styles.userSelectNone, styles.alignItemsCenter]} containerStyle={styles.mb2} isFocused={isFocused} isDisabled={isDisabled} showTooltip={showTooltip} canSelectMultiple={canSelectMultiple} onLongPressRow={onLongPressRow} onSelectRow={onSelectRow} onDismissError={onDismissError} rightHandSideComponent={rightHandSideComponent} errors={item.errors} pendingAction={item.pendingAction} keyForList={item.keyForList} onFocus={onFocus} shouldSyncFocus={shouldSyncFocus} hoverStyle={item.isSelected && styles.activeComponentBG} shouldUseDefaultRightHandSideCheckmark={shouldUseDefaultRightHandSideCheckmark}>
            {function (hovered) {
            var _a, _b, _c;
            return (<>
                    {!!canSelectMultiple && (<PressableWithFeedback_1.default accessibilityLabel={(_a = item.text) !== null && _a !== void 0 ? _a : ''} role={CONST_1.default.ROLE.BUTTON} 
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                disabled={isDisabled || item.isDisabledCheckbox} onPress={handleCheckboxPress} testID={"TableListItemCheckbox-".concat(item.text)} style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), item.isDisabledCheckbox && styles.cursorDisabled, styles.mr3, item.cursorStyle]}>
                            <react_native_1.View style={[StyleUtils.getCheckboxContainerStyle(20), StyleUtils.getMultiselectListStyles(!!item.isSelected, !!item.isDisabled), item.cursorStyle]}>
                                {!!item.isSelected && (<Icon_1.default src={Expensicons.Checkmark} fill={theme.textLight} height={14} width={14}/>)}
                            </react_native_1.View>
                        </PressableWithFeedback_1.default>)}
                    {!!item.icons && (<MultipleAvatars_1.default icons={(_b = item.icons) !== null && _b !== void 0 ? _b : []} shouldShowTooltip={showTooltip} secondAvatarStyle={[
                        StyleUtils.getBackgroundAndBorderStyle(theme.sidebar),
                        isFocused ? StyleUtils.getBackgroundAndBorderStyle(focusedBackgroundColor) : undefined,
                        hovered && !isFocused ? StyleUtils.getBackgroundAndBorderStyle(hoveredBackgroundColor) : undefined,
                    ]}/>)}
                    <react_native_1.View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch, titleContainerStyles]}>
                        <TextWithTooltip_1.default shouldShowTooltip={showTooltip} text={(_c = item.text) !== null && _c !== void 0 ? _c : ''} style={[
                    styles.optionDisplayName,
                    isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText,
                    styles.sidebarLinkTextBold,
                    styles.pre,
                    item.alternateText ? styles.mb1 : null,
                    styles.justifyContentCenter,
                ]}/>
                        {!!item.alternateText && (<TextWithTooltip_1.default shouldShowTooltip={showTooltip} text={item.alternateText} style={[styles.textLabelSupporting, styles.lh16, styles.pre]}/>)}
                    </react_native_1.View>
                    {!!item.rightElement && item.rightElement}
                </>);
        }}
        </BaseListItem_1.default>);
}
TableListItem.displayName = 'TableListItem';
exports.default = TableListItem;
