import ListItemComposed from '@components/SelectionList/ListItemComposed';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';

import type {ListItem, MultiSelectListItemProps} from './types';

import BaseSelectListItem from './BaseSelectListItem';

/**
 * A compact row with a checkbox and optional avatar, used in multi-choice picker lists
 * (e.g. search filters, feature toggles, category selection).
 */
function MultiSelectListItem<TItem extends ListItem>({
    item,
    isFocused,
    isFocusVisible,
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
    titleNumberOfLines,
}: MultiSelectListItemProps<TItem>) {
    const styles = useThemeStyles();
    const icon = item.icons?.at(0);

    const computedWrapperStyle = [icon ? [styles.pv0, styles.mnh13] : styles.optionRowCompact, wrapperStyle];

    return (
        <BaseSelectListItem
            item={item}
            leftElement={
                icon ? (
                    <ListItemComposed.CompactAvatar
                        icon={icon}
                        style={styles.mr3}
                    />
                ) : undefined
            }
            isFocused={isFocused}
            isFocusVisible={isFocusVisible}
            showTooltip={showTooltip}
            isDisabled={isDisabled}
            canSelectMultiple
            onSelectRow={onSelectRow}
            accessibilityRole={CONST.ROLE.CHECKBOX}
            onDismissError={onDismissError}
            shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit}
            isMultilineSupported={isMultilineSupported}
            isAlternateTextMultilineSupported={isAlternateTextMultilineSupported}
            alternateTextNumberOfLines={alternateTextNumberOfLines}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            wrapperStyle={computedWrapperStyle}
            titleStyles={titleStyles}
            shouldHighlightSelectedItem={shouldHighlightSelectedItem}
            titleNumberOfLines={titleNumberOfLines}
        />
    );
}

export default MultiSelectListItem;
