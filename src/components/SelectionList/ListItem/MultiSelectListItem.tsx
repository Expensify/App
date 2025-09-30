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

    const checkboxComponent = useCallback(() => {
        return (
            <Checkbox
                shouldSelectOnPressEnter
                isChecked={item.isSelected}
                accessibilityLabel={item.text ?? ''}
                onPress={() => onSelectRow(item)}
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
            rightHandSideComponent={checkboxComponent}
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
        />
    );
}

MultiSelectListItem.displayName = 'MultiSelectListItem';

export default MultiSelectListItem;
