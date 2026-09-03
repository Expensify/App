import ListItemComposed from '@components/SelectionList/ListItemComposed';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {ListItem, SelectableListItemProps} from './types';

/**
 * Extends the composed ListItem pressable with a selection button (checkbox for multi-select, radio for
 * single-select). This is the layer used by all SelectionList items that show a visual selection
 * indicator. Items that never need a selection button (e.g. search result rows) compose ListItem directly.
 */
function SelectableListItem<TItem extends ListItem>({
    item,
    canSelectMultiple = false,
    selectionButtonPosition = CONST.SELECTION_BUTTON_POSITION.RIGHT,
    onSelectionButtonPress,
    onSelectRow,
    isDisabled = false,
    children,
    rightHandSideComponent,
    isFocused,
    isSelected,
    showTooltip,
    wrapperStyle,
    testID,
    forwardedFSClass,
    pressableStyle,
    pressableWrapperStyle,
    shouldPreventEnterKeySubmit,
    onDismissError,
    errorRowStyles,
    isFocusVisible,
    shouldSyncFocus,
    onFocus,
    hoverStyle,
    onLongPressRow,
    shouldHighlightSelectedItem,
    shouldDisableHoverStyle,
    accessible,
    accessibilityLabel,
    accessibilityRole,
    shouldUseOptionRole,
}: Omit<SelectableListItemProps<TItem>, 'shouldShowRightCaret'>) {
    const styles = useThemeStyles();

    const selectionButton = !item.shouldHideSelectionButton && (
        <ListItemComposed.SelectionButton
            item={item}
            onPress={onSelectionButtonPress ?? onSelectRow}
            canSelectMultiple={canSelectMultiple}
            style={selectionButtonPosition === CONST.SELECTION_BUTTON_POSITION.RIGHT ? styles.ml3 : styles.mr3}
        />
    );

    return (
        <ListItemComposed
            item={item}
            shouldShowTooltip={showTooltip}
            onSelectRow={onSelectRow}
            isDisabled={isDisabled}
            canSelectMultiple={canSelectMultiple}
            isFocused={isFocused}
            isSelected={isSelected}
            pressableStyle={pressableStyle}
            pressableWrapperStyle={pressableWrapperStyle}
            shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit}
            onDismissError={onDismissError}
            errorRowStyles={errorRowStyles}
            isFocusVisible={isFocusVisible}
            shouldSyncFocus={shouldSyncFocus}
            onFocus={onFocus}
            hoverStyle={hoverStyle}
            onLongPressRow={onLongPressRow}
            shouldHighlightSelectedItem={shouldHighlightSelectedItem}
            shouldDisableHoverStyle={shouldDisableHoverStyle}
            accessible={accessible}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole={accessibilityRole}
            shouldUseOptionRole={shouldUseOptionRole}
        >
            <View
                testID={testID}
                style={wrapperStyle}
                fsClass={forwardedFSClass}
            >
                {selectionButtonPosition === CONST.SELECTION_BUTTON_POSITION.LEFT && selectionButton}
                {children}
                <ListItemComposed.RBRIndicator
                    item={item}
                    isSelected={isSelected}
                />
                {selectionButtonPosition === CONST.SELECTION_BUTTON_POSITION.RIGHT && selectionButton}
                {typeof rightHandSideComponent === 'function' ? rightHandSideComponent(item, isFocused) : rightHandSideComponent}
            </View>
        </ListItemComposed>
    );
}

export default SelectableListItem;
