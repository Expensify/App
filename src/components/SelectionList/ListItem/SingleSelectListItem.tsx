import React, {useCallback} from 'react';
import SelectionCheckbox from '@components/SelectionList/components/SelectionCheckbox';
import useThemeStyles from '@hooks/useThemeStyles';
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

    const radioCheckboxComponent = useCallback(() => {
        return (
            <SelectionCheckbox
                item={item}
                onSelectRow={onSelectRow}
                accessibilityLabel="SingleSelectListItem"
                isCircular
            />
        );
    }, [item, onSelectRow]);

    return (
        <BaseSelectListItem
            item={item}
            keyForList={item.keyForList}
            isFocused={isFocused}
            showTooltip={showTooltip}
            isDisabled={isDisabled}
            rightHandSideComponent={rightHandSideComponent ?? radioCheckboxComponent}
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
