import React from 'react';
import {View} from 'react-native';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import BaseListItem from './BaseListItem';
import type {ListItem, RadioListItemProps} from './types';

function RadioListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    onSelectRow,
    onDismissError,
    shouldPreventEnterKeySubmit,
    rightHandSideComponent,
    isMultilineSupported = false,
    isAlternateTextMultilineSupported = false,
    alternateTextNumberOfLines = 2,
    onFocus,
    shouldSyncFocus,
    wrapperStyle,
    titleStyles,
    shouldHighlightSelectedItem = true,
    shouldDisableHoverStyle,
    shouldStopMouseLeavePropagation,
    canSelectMultiple,
}: RadioListItemProps<TItem>) {
    const styles = useThemeStyles();
    const fullTitle = isMultilineSupported ? item.text?.trimStart() : item.text;
    const indentsLength = (item.text?.length ?? 0) - (fullTitle?.length ?? 0);
    const paddingLeft = Math.floor(indentsLength / CONST.INDENTS.length) * styles.ml3.marginLeft;
    const alternateTextMaxWidth = variables.sideBarWidth - styles.ph5.paddingHorizontal * 2 - styles.ml3.marginLeft - variables.iconSizeNormal;

    return (
        <BaseListItem
            item={item}
            wrapperStyle={[styles.flex1, styles.justifyContentBetween, styles.sidebarLinkInner, styles.userSelectNone, styles.optionRow, wrapperStyle]}
            isFocused={isFocused}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit}
            rightHandSideComponent={rightHandSideComponent}
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            pendingAction={item.pendingAction}
            shouldHighlightSelectedItem={shouldHighlightSelectedItem}
            shouldDisableHoverStyle={shouldDisableHoverStyle}
            shouldStopMouseLeavePropagation={shouldStopMouseLeavePropagation}
            shouldUseDefaultRightHandSideCheckmark={!canSelectMultiple || !rightHandSideComponent}
        >
            <>
                {!!item.leftElement && item.leftElement}
                <View style={[styles.flex1, styles.alignItemsStart]}>
                    <TextWithTooltip
                        shouldShowTooltip={showTooltip}
                        text={fullTitle ?? ''}
                        style={[
                            styles.optionDisplayName,
                            isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText,
                            styles.sidebarLinkTextBold,
                            isMultilineSupported ? styles.preWrap : styles.pre,
                            item.alternateText ? styles.mb1 : null,
                            isDisabled && styles.colorMuted,
                            isMultilineSupported ? {paddingLeft} : null,
                            titleStyles,
                        ]}
                        numberOfLines={isMultilineSupported ? 2 : 1}
                    />

                    {!!item.alternateText && (
                        <TextWithTooltip
                            shouldShowTooltip={showTooltip}
                            text={item.alternateText}
                            style={[
                                styles.textLabelSupporting,
                                styles.lh16,
                                isAlternateTextMultilineSupported ? styles.preWrap : styles.pre,
                                isAlternateTextMultilineSupported ? {maxWidth: alternateTextMaxWidth} : null,
                            ]}
                            numberOfLines={isAlternateTextMultilineSupported ? alternateTextNumberOfLines : 1}
                        />
                    )}
                </View>
                {!!item.rightElement && item.rightElement}
            </>
        </BaseListItem>
    );
}

export default RadioListItem;
