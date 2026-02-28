import React, {useCallback} from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import SelectionCheckbox from '@components/SelectionList/components/SelectionCheckbox';
import RadioListItem from './RadioListItem';
import type {ListItem, SingleSelectListItemProps} from './types';

/**
 * SingleSelectListItem mirrors the behavior of a default RadioListItem, but adds support
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
    shouldHighlightSelectedItem = true,
    rightHandSideComponent = undefined,
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
        <RadioListItem
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
            wrapperStyle={[styles.optionRowCompact, wrapperStyle]}
            titleStyles={titleStyles}
            shouldHighlightSelectedItem={shouldHighlightSelectedItem}
            accessibilityState={accessibilityState}
        />
    );
}

export default SingleSelectListItem;
