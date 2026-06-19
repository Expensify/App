import React from 'react';
import {View} from 'react-native';
import ReportActionAvatars from '@components/ReportActionAvatars';
import TextWithTooltip from '@components/TextWithTooltip';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import BaseListItem from './BaseListItem';
import SelectableListItem from './SelectableListItem';
import type {ListItem, TableListItemProps} from './types';

/**
 * A pressable row styled as a table entry with animated highlight, optional avatar, and
 * right caret. Used in workspace management lists (e.g. members, categories, tags, taxes).
 * Renders a left-side checkbox when canSelectMultiple is true (multi-select mode) and a
 * plain row with no selection button otherwise.
 */
function TableListItem<TItem extends ListItem>({
    item,
    isFocused,
    isFocusVisible,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onSelectRow,
    onSelectionButtonPress,
    onDismissError,
    rightHandSideComponent,
    onFocus,
    onLongPressRow,
    shouldSyncFocus,
    titleContainerStyles,
    selectionButtonPosition = CONST.SELECTION_BUTTON_POSITION.LEFT,
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

    const rowContent = (hovered: boolean) => (
        <>
            {!!item.accountID && (
                <ReportActionAvatars
                    accountIDs={[item.accountID]}
                    fallbackDisplayName={item.text ?? item.alternateText ?? undefined}
                    shouldShowTooltip={showTooltip}
                    secondaryAvatarContainerStyle={[
                        StyleUtils.getBackgroundAndBorderStyle(theme.sidebar),
                        isFocusVisible ? StyleUtils.getBackgroundAndBorderStyle(focusedBackgroundColor) : undefined,
                        hovered && !isFocusVisible ? StyleUtils.getBackgroundAndBorderStyle(hoveredBackgroundColor) : undefined,
                    ]}
                />
            )}
            <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch, titleContainerStyles]}>
                <TextWithTooltip
                    shouldShowTooltip={showTooltip}
                    text={item.text ?? ''}
                    style={[
                        styles.optionDisplayName,
                        isFocusVisible ? styles.sidebarLinkActiveText : styles.sidebarLinkText,
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
            {!!item.rightElement && item.rightElement}
        </>
    );

    if (canSelectMultiple) {
        return (
            <SelectableListItem
                item={item}
                pressableStyle={[
                    styles.selectionListPressableItemWrapper,
                    styles.mh0,
                    item.shouldAnimateInHighlight ? styles.bgTransparent : undefined,
                    item.isSelected && styles.activeComponentBG,
                    item.cursorStyle,
                ]}
                pressableWrapperStyle={[styles.mh5, animatedHighlightStyle]}
                wrapperStyle={[styles.flexRow, styles.flex1, styles.justifyContentBetween, styles.userSelectNone, styles.alignItemsCenter]}
                containerStyle={styles.mb2}
                isFocused={isFocused}
                isFocusVisible={isFocusVisible}
                isDisabled={isDisabled}
                showTooltip={showTooltip}
                canSelectMultiple={canSelectMultiple}
                onLongPressRow={onLongPressRow}
                onSelectRow={onSelectRow}
                onSelectionButtonPress={onSelectionButtonPress}
                onDismissError={onDismissError}
                rightHandSideComponent={rightHandSideComponent}
                errors={item.errors}
                errorRowStyles={[styles.mb2, errorRowStyles]}
                pendingAction={item.pendingAction}
                keyForList={item.keyForList}
                onFocus={onFocus}
                shouldSyncFocus={shouldSyncFocus}
                hoverStyle={item.isSelected && styles.activeComponentBG}
                shouldHighlightSelectedItem
                shouldShowRightCaret={shouldShowRightCaret}
                selectionButtonPosition={selectionButtonPosition}
            >
                {rowContent}
            </SelectableListItem>
        );
    }

    return (
        <BaseListItem
            item={item}
            pressableStyle={[
                styles.selectionListPressableItemWrapper,
                styles.mh0,
                item.shouldAnimateInHighlight ? styles.bgTransparent : undefined,
                item.isSelected && styles.activeComponentBG,
                item.cursorStyle,
            ]}
            pressableWrapperStyle={[styles.mh5, animatedHighlightStyle]}
            wrapperStyle={[styles.flexRow, styles.flex1, styles.justifyContentBetween, styles.userSelectNone, styles.alignItemsCenter]}
            containerStyle={styles.mb2}
            isFocused={isFocused}
            isFocusVisible={isFocusVisible}
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
            shouldHighlightSelectedItem
            shouldShowRightCaret={shouldShowRightCaret}
        >
            {rowContent}
        </BaseListItem>
    );
}

export default TableListItem;
