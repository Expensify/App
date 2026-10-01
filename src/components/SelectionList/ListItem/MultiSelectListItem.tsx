import Tooltip from '@components/Tooltip';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {ListItem, ListItemProps} from './types';

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
}: ListItemProps<TItem>) {
    const styles = useThemeStyles();
    const icon = item.icons?.at(0);

    const computedWrapperStyle = [icon ? [styles.pv0, styles.mnh13] : styles.optionRowCompact, wrapperStyle];

    const row = (
        <BaseSelectListItem
            item={item}
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

    if (!item.tooltipText) {
        return row;
    }

    // Wrap a host View so BoundsObserver can attach to this composite list row.
    // Native hover events are required because the Has filter lives in a portalled popover;
    // React's synthetic mouseleave can get stranded and leave the tooltip stuck open.
    return (
        <Tooltip
            text={item.tooltipText}
            shouldHandleScroll
            shouldUseNativeHoverEvents
        >
            <View>{row}</View>
        </Tooltip>
    );
}

export default MultiSelectListItem;
