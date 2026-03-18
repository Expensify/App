import React from 'react';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import ReportActionAvatars from '@components/ReportActionAvatars';
import TextWithTooltip from '@components/TextWithTooltip';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Browser from '@libs/Browser';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';
import BaseListItem from './BaseListItem';
import type {ListItem, TableListItemProps} from './types';

function TableListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onSelectRow,
    onCheckboxPress,
    onDismissError,
    rightHandSideComponent,
    onFocus,
    onLongPressRow,
    shouldSyncFocus,
    titleContainerStyles,
    shouldUseDefaultRightHandSideCheckmark,
    shouldShowRightCaret,
    errorRowStyles,
}: TableListItemProps<TItem>) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        borderRadius: styles.selectionListPressableItemWrapper.borderRadius,
        shouldHighlight: !!item.shouldAnimateInHighlight,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
    });

    const focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;
    const hoveredBackgroundColor = styles.sidebarLinkHover?.backgroundColor ? styles.sidebarLinkHover.backgroundColor : theme.sidebar;

    const handleCheckboxPress = () => {
        if (onCheckboxPress) {
            onCheckboxPress(item);
        } else {
            onSelectRow(item);
        }
    };

    const fallbackAccessibilityLabel = item.accessibilityLabel ?? [item.text, item.text !== item.alternateText ? item.alternateText : undefined].filter(Boolean).join(', ');
    const isIOSSplitAccessibilityMode = !!item.shouldSplitAccessibilityOnIOS && (getPlatform() === CONST.PLATFORM.IOS || Browser.isMobileIOS());
    const shouldHideTextContainerFromAccessibility = !!item.accessibilityLabel && !isIOSSplitAccessibilityMode;

    return (
        <BaseListItem
            item={item}
            pressableStyle={[
                styles.selectionListPressableItemWrapper,
                styles.mh0,
                // Removing background style because they are added to the parent OpacityView via animatedHighlightStyle
                item.shouldAnimateInHighlight ? styles.bgTransparent : undefined,
                item.isSelected && styles.activeComponentBG,
                item.cursorStyle,
            ]}
            pressableWrapperStyle={[styles.mh5, animatedHighlightStyle]}
            wrapperStyle={[styles.flexRow, styles.flex1, styles.justifyContentBetween, styles.userSelectNone, styles.alignItemsCenter]}
            containerStyle={styles.mb2}
            isFocused={isFocused}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onLongPressRow={onLongPressRow}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            rightHandSideComponent={rightHandSideComponent}
            errors={item.errors}
            errorRowStyles={[styles.mb2, errorRowStyles]}
            pendingAction={item.pendingAction}
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            hoverStyle={item.isSelected && styles.activeComponentBG}
            accessible={isIOSSplitAccessibilityMode ? false : undefined}
            accessibilityRole={item.accessibilityRole}
            shouldUseDefaultRightHandSideCheckmark={shouldUseDefaultRightHandSideCheckmark}
            shouldShowRightCaret={shouldShowRightCaret}
        >
            {(hovered) => (
                <>
                    {!!canSelectMultiple && (
                        <Checkbox
                            accessibilityLabel={item.text ?? ''}
                            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                            disabled={isDisabled || item.isDisabledCheckbox}
                            isChecked={!!item.isSelected}
                            onPress={handleCheckboxPress}
                            shouldStopMouseDownPropagation
                            style={[item.cursorStyle, styles.p5, styles.mln5, styles.mhv5, styles.mrn2]}
                            containerStyle={[StyleUtils.getMultiselectListStyles(!!item.isSelected, !!item.isDisabled), item.cursorStyle]}
                            testID={`TableListItemCheckbox-${item.text}`}
                        />
                    )}
                    {isIOSSplitAccessibilityMode ? (
                        <PressableWithFeedback
                            accessibilityLabel={fallbackAccessibilityLabel}
                            role={item.accessibilityRole}
                            accessibilityLanguage={item.lang}
                            lang={item.lang}
                            disabled={!!isDisabled && !item.isSelected}
                            interactive={item.isInteractive}
                            isNested
                            hoverDimmingValue={1}
                            pressDimmingValue={1}
                            testID={`${CONST.BASE_LIST_ITEM_TEST_ID}${item.keyForList}-summary`}
                            wrapperStyle={styles.flex1}
                            style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}
                            onLongPress={() => onLongPressRow?.(item)}
                            onPress={(event) => {
                                event?.stopPropagation?.();
                                onSelectRow(item);
                            }}
                        >
                            <>
                                {!!item.accountID && (
                                    <ReportActionAvatars
                                        accountIDs={[item.accountID]}
                                        fallbackDisplayName={item.text ?? item.alternateText ?? undefined}
                                        shouldShowTooltip={showTooltip}
                                        secondaryAvatarContainerStyle={[
                                            StyleUtils.getBackgroundAndBorderStyle(theme.sidebar),
                                            isFocused ? StyleUtils.getBackgroundAndBorderStyle(focusedBackgroundColor) : undefined,
                                            hovered && !isFocused ? StyleUtils.getBackgroundAndBorderStyle(hoveredBackgroundColor) : undefined,
                                        ]}
                                    />
                                )}
                                <View
                                    style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch, titleContainerStyles]}
                                    accessible={false}
                                    aria-hidden
                                >
                                    <TextWithTooltip
                                        shouldShowTooltip={showTooltip}
                                        text={item.text ?? ''}
                                        style={[
                                            styles.optionDisplayName,
                                            isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText,
                                            styles.sidebarLinkTextBold,
                                            styles.pre,
                                            !item.shouldHideAlternateText && item.alternateText ? styles.mb1 : null,
                                            styles.justifyContentCenter,
                                        ]}
                                    />
                                    {!item.shouldHideAlternateText && !!item.alternateText && (
                                        <TextWithTooltip
                                            shouldShowTooltip={showTooltip}
                                            text={item.alternateText}
                                            style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                                        />
                                    )}
                                </View>
                            </>
                        </PressableWithFeedback>
                    ) : (
                        <>
                            {!!item.accountID && (
                                <ReportActionAvatars
                                    accountIDs={[item.accountID]}
                                    fallbackDisplayName={item.text ?? item.alternateText ?? undefined}
                                    shouldShowTooltip={showTooltip}
                                    secondaryAvatarContainerStyle={[
                                        StyleUtils.getBackgroundAndBorderStyle(theme.sidebar),
                                        isFocused ? StyleUtils.getBackgroundAndBorderStyle(focusedBackgroundColor) : undefined,
                                        hovered && !isFocused ? StyleUtils.getBackgroundAndBorderStyle(hoveredBackgroundColor) : undefined,
                                    ]}
                                />
                            )}
                            <View
                                style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch, titleContainerStyles]}
                                accessible={shouldHideTextContainerFromAccessibility ? false : undefined}
                                aria-hidden={shouldHideTextContainerFromAccessibility ? true : undefined}
                            >
                                <TextWithTooltip
                                    shouldShowTooltip={showTooltip}
                                    text={item.text ?? ''}
                                    style={[
                                        styles.optionDisplayName,
                                        isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText,
                                        styles.sidebarLinkTextBold,
                                        styles.pre,
                                        !item.shouldHideAlternateText && item.alternateText ? styles.mb1 : null,
                                        styles.justifyContentCenter,
                                    ]}
                                />
                                {!item.shouldHideAlternateText && !!item.alternateText && (
                                    <TextWithTooltip
                                        shouldShowTooltip={showTooltip}
                                        text={item.alternateText}
                                        style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                                    />
                                )}
                            </View>
                        </>
                    )}
                    {!!item.rightElement && item.rightElement}
                </>
            )}
        </BaseListItem>
    );
}

TableListItem.displayName = 'TableListItem';

export default TableListItem;
