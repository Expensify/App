import React from 'react';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import ReportActionAvatars from '@components/ReportActionAvatars';
import TextWithTooltip from '@components/TextWithTooltip';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
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
            pendingAction={item.pendingAction}
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            hoverStyle={item.isSelected && styles.activeComponentBG}
            shouldUseDefaultRightHandSideCheckmark={shouldUseDefaultRightHandSideCheckmark}
            shouldShowRightCaret={shouldShowRightCaret}
            shouldAddErrorRowBottomMargin
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
                            style={[item.cursorStyle, styles.p5, styles.mln4, styles.mhv5, styles.mrn1]}
                            containerStyle={[StyleUtils.getMultiselectListStyles(!!item.isSelected, !!item.isDisabled), item.cursorStyle]}
                            testID={`TableListItemCheckbox-${item.text}`}
                        />
                    )}
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
                    <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch, titleContainerStyles]}>
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
                    {!!item.rightElement && item.rightElement}
                </>
            )}
        </BaseListItem>
    );
}

TableListItem.displayName = 'TableListItem';

export default TableListItem;
