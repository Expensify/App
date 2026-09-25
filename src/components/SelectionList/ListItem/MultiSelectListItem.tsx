import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';

import type {ListItem, ListItemProps} from './types';

import SingleSelectListItem from './SingleSelectListItem';

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
    onFocus,
    shouldSyncFocus,
    wrapperStyle,
    titleNumberOfLines,
    alternateTextNumberOfLines,
}: ListItemProps<TItem>) {
    const styles = useThemeStyles();
    const icon = item.icons?.at(0);

    return (
        <SingleSelectListItem
            item={item}
            isFocused={isFocused}
            isFocusVisible={isFocusVisible}
            showTooltip={showTooltip}
            isDisabled={isDisabled}
            canSelectMultiple
            accessibilityRole={CONST.ROLE.CHECKBOX}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            wrapperStyle={[icon ? [styles.pv0, styles.mnh13] : styles.optionRowCompact, wrapperStyle]}
            titleNumberOfLines={titleNumberOfLines}
            alternateTextNumberOfLines={alternateTextNumberOfLines}
        />
    );
}

export default MultiSelectListItem;
