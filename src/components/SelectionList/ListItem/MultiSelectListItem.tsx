import {ListItemTooltipAnchorContext} from '@components/SelectionList/ListItemContext';
import Tooltip from '@components/Tooltip';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {LayoutRectangle} from 'react-native';

import React, {useRef} from 'react';
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
    const tooltipAnchorRef = useRef<View>(null);

    const computedWrapperStyle = [icon ? [styles.pv0, styles.mnh13] : styles.optionRowCompact, wrapperStyle];

    const getCheckboxTooltipBounds = (): LayoutRectangle | undefined => {
        return tooltipAnchorRef.current?.getBoundingClientRect?.();
    };

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
    // Position against the checkbox so hovering the row still anchors the tooltip there.
    return (
        <ListItemTooltipAnchorContext.Provider value={tooltipAnchorRef}>
            <Tooltip
                text={item.tooltipText}
                shouldHandleScroll
                shouldUseNativeHoverEvents
                getTargetBounds={getCheckboxTooltipBounds}
            >
                <View>{row}</View>
            </Tooltip>
        </ListItemTooltipAnchorContext.Provider>
    );
}

export default MultiSelectListItem;
