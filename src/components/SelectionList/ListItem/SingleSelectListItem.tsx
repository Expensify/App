import React from 'react';
import SelectionButton from '@components/SelectionList/components/SelectionButton';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import BaseSelectListItem from './BaseSelectListItem';
import type {ListItem, SingleSelectListItemProps} from './types';

/**
 * SingleSelectListItem mirrors the behavior of a default BaseSelectListItem, but adds support
 * for the new style of single selection lists.
 */
function SingleSelectListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    onSelectRow,
    onDismissError,
    shouldPreventEnterKeySubmit,
    isMultilineSupported = false,
    isAlternateTextMultilineSupported = false,
    alternateTextNumberOfLines = 2,
    onFocus,
    shouldSyncFocus,
    wrapperStyle,
    titleStyles,
    shouldHighlightSelectedItem = false,
    rightHandSideComponent = undefined,
    shouldShowRadioButton = true,
    accessibilityState,
}: SingleSelectListItemProps<TItem>) {
    const styles = useThemeStyles();

    return (
        <BaseSelectListItem
            item={item}
            keyForList={item.keyForList}
            isFocused={isFocused}
            showTooltip={showTooltip}
            isDisabled={isDisabled}
            rightHandSideComponent={
                rightHandSideComponent ?? (
                    <SelectionButton
                        role={CONST.ROLE.RADIO}
                        item={item}
                        onSelectRow={onSelectRow}
                        accessibilityLabel="SingleSelectListItem"
                    />
                )
            }
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit}
            isMultilineSupported={isMultilineSupported}
            isAlternateTextMultilineSupported={isAlternateTextMultilineSupported}
            alternateTextNumberOfLines={alternateTextNumberOfLines}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            wrapperStyle={[styles.optionRow, wrapperStyle]}
            titleStyles={titleStyles}
            shouldHighlightSelectedItem={shouldHighlightSelectedItem}
            shouldShowRadioButton={shouldShowRadioButton}
            accessibilityState={accessibilityState}
        />
    );
}

export default SingleSelectListItem;
