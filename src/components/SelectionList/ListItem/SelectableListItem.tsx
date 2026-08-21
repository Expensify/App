import ListSelectionButton from '@components/SelectionList/components/ListSelectionButton';
import ListItemComposed from '@components/SelectionList/ListItemComposed';
import {useListItemHovered} from '@components/SelectionList/ListItemContext';
import isListItemSelected from '@components/SelectionList/utils/isListItemSelected';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {ReactElement} from 'react';

import React from 'react';
import {View} from 'react-native';

import type {ListItem, ListItemProps, SelectableListItemProps} from './types';

/**
 * Resolves BaseListItem-style render-prop children against the hover state provided by ListItemPressable
 * through ListItemContext, so legacy callers keep receiving the hovered flag.
 */
function RowChildren<TItem extends ListItem>({children}: {children?: ReactElement<ListItemProps<TItem>> | ((hovered: boolean) => ReactElement<ListItemProps<TItem>>)}) {
    const isHovered = useListItemHovered();
    return typeof children === 'function' ? children(isHovered) : (children ?? null);
}

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
    FooterComponent,
    shouldDisplayRBR = true,
    shouldShowRightCaret = false,
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
}: SelectableListItemProps<TItem>) {
    const styles = useThemeStyles();

    const isRowSelected = isListItemSelected(item, isSelected);
    const shouldShowRBRIndicator = (!isRowSelected || !!item.canShowSeveralIndicators) && !!item.brickRoadIndicator && shouldDisplayRBR;

    const selectionButton = !item.shouldHideSelectionButton && (
        <ListSelectionButton
            role={canSelectMultiple ? CONST.ROLE.CHECKBOX : CONST.ROLE.RADIO}
            item={item}
            onSelectRow={onSelectionButtonPress ?? onSelectRow}
            disabled={!!isDisabled || !!item.isDisabledCheckbox}
            // Radio buttons are removed from the tab order - the row itself is the single-select tab stop.
            tabIndex={canSelectMultiple ? undefined : -1}
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
                <RowChildren<TItem>>{children}</RowChildren>
                {shouldShowRBRIndicator && !!item.brickRoadIndicator && <ListItemComposed.RBRIndicator brickRoadIndicator={item.brickRoadIndicator} />}
                {selectionButtonPosition === CONST.SELECTION_BUTTON_POSITION.RIGHT && selectionButton}
                {typeof rightHandSideComponent === 'function' ? rightHandSideComponent(item, isFocused) : rightHandSideComponent}
                {shouldShowRightCaret && <ListItemComposed.RightCaret />}
            </View>
            {FooterComponent}
        </ListItemComposed>
    );
}

export default SelectableListItem;
