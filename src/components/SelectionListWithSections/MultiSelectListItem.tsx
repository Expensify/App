import React, {useCallback} from 'react';
import Checkbox from '@components/Checkbox';
import useThemeStyles from '@hooks/useThemeStyles';
import RadioListItem from './RadioListItem';
import type {ListItem, MultiSelectListItemProps} from './types';

/**
 * MultiSelectListItem mirrors the behavior of a default RadioListItem, but adds support
 * for the new style of multi selection lists.
 */
function MultiSelectListItem<TItem extends ListItem>({
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
}: MultiSelectListItemProps<TItem>) {
    const styles = useThemeStyles();
    const isSelected = item.isSelected;

    const checkboxComponent = useCallback(() => {
        return (
            <Checkbox
                shouldSelectOnPressEnter
                isChecked={isSelected}
                accessibilityLabel={item.text ?? ''}
                onPress={() => onSelectRow(item)}
                isIndeterminate={item.isIndeterminate}
                style={[isMultilineSupported ? styles.ml3 : null]}
                disabled={isDisabled ?? false}
            />
        );
    }, [isDisabled, isMultilineSupported, isSelected, item, onSelectRow, styles.ml3]);

    return (
        <RadioListItem
            item={item}
            isFocused={isFocused}
            showTooltip={showTooltip}
            isDisabled={isDisabled}
            rightHandSideComponent={checkboxComponent}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit}
            isMultilineSupported={isMultilineSupported}
            isAlternateTextMultilineSupported={isAlternateTextMultilineSupported}
            alternateTextNumberOfLines={alternateTextNumberOfLines}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            wrapperStyle={[wrapperStyle, isAlternateTextMultilineSupported ? styles.optionRowWithPadding : styles.optionRowCompact]}
            titleStyles={titleStyles}
        />
    );
}

export default MultiSelectListItem;
