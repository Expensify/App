import React, {useCallback} from 'react';
import Checkbox from '@components/Checkbox';
import useThemeStyles from '@hooks/useThemeStyles';
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
}: SingleSelectListItemProps<TItem>) {
    const styles = useThemeStyles();
    const isSelected = item.isSelected;

    const radioCheckboxComponent = useCallback(() => {
        return (
            <Checkbox
                shouldSelectOnPressEnter
                containerBorderRadius={999}
                accessibilityLabel="SingleSelectListItem"
                isChecked={isSelected}
                onPress={() => onSelectRow(item)}
            />
        );
    }, [isSelected, item, onSelectRow]);

    return (
        <RadioListItem
            item={item}
            isFocused={isFocused}
            showTooltip={showTooltip}
            isDisabled={isDisabled}
            rightHandSideComponent={radioCheckboxComponent}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit}
            isMultilineSupported={isMultilineSupported}
            isAlternateTextMultilineSupported={isAlternateTextMultilineSupported}
            alternateTextNumberOfLines={alternateTextNumberOfLines}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            wrapperStyle={[wrapperStyle, styles.optionRowCompact]}
            titleStyles={titleStyles}
            shouldHighlightSelectedItem={shouldHighlightSelectedItem}
        />
    );
}

export default SingleSelectListItem;
