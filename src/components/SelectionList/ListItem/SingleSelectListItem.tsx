import React from 'react';
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
    shouldShowSelectionButton = true,
    selectionButtonPosition,
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
            shouldShowSelectionButton={shouldShowSelectionButton}
            selectionButtonPosition={selectionButtonPosition}
            accessibilityState={accessibilityState}
        />
    );
}

export default SingleSelectListItem;
