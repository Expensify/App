import React from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import BaseSelectListItem from './BaseSelectListItem';
import type {ListItem, SingleSelectListItemProps} from './types';

/**
 * A standard row with an optional (but default) radio button, used in single-choice picker lists
 * (e.g. language, theme, timezone).
 * Use in place of the removed RadioListItem.
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
    shouldHighlightSelectedItem,
    isFocusVisible,
    rightHandSideComponent,
    selectionButtonPosition,
}: SingleSelectListItemProps<TItem>) {
    const styles = useThemeStyles();

    return (
        <BaseSelectListItem
            item={item}
            keyForList={item.keyForList}
            isFocused={isFocused}
            showTooltip={showTooltip}
            isDisabled={isDisabled}
            rightHandSideComponent={rightHandSideComponent}
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
            isFocusVisible={isFocusVisible}
            selectionButtonPosition={selectionButtonPosition}
        />
    );
}

export default SingleSelectListItem;
