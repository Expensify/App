import type useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import type useSingleExecution from '@hooks/useSingleExecution';

import {isMobileChrome} from '@libs/Browser';

import type {NativeSyntheticEvent} from 'react-native';

import React from 'react';

import type {ExtendedTargetedEvent, ListItem, ListItemComponent, ListItemProps} from './types';

type ListItemRendererProps<TItem extends ListItem> = Omit<ListItemProps<TItem>, 'onSelectRow'> & {
    ListItem: ListItemComponent<TItem>;
    index: number;
    normalizedIndex?: number;
    shouldIgnoreFocus?: boolean;
    shouldSingleExecuteRowSelect?: boolean;
    selectRow: (item: TItem, indexToFocus?: number) => void;
    setFocusedIndex: ReturnType<typeof useArrowKeyFocusManager>[1];
    singleExecution: ReturnType<typeof useSingleExecution>['singleExecution'];
};

function ListItemRenderer<TItem extends ListItem>({
    ListItem,
    item,
    index,
    normalizedIndex,
    isFocused,
    isDisabled,
    showTooltip,
    canSelectMultiple,
    shouldSingleExecuteRowSelect,
    selectRow,
    onSelectionButtonPress,
    onDismissError,
    titleNumberOfLines,
    alternateTextNumberOfLines,
    shouldIgnoreFocus,
    setFocusedIndex,
    shouldSyncFocus,
    singleExecution,
    isFocusVisible,
    shouldDisableHoverStyle,
    selectionButtonPosition,
    isFirstItem,
    isLastItem,
    shouldPreventEnterKeySubmit = true,
}: ListItemRendererProps<TItem>) {
    return (
        <>
            <ListItem
                item={item}
                isFocused={isFocused}
                isDisabled={isDisabled}
                showTooltip={showTooltip}
                canSelectMultiple={canSelectMultiple}
                onSelectRow={() => {
                    if (shouldSingleExecuteRowSelect) {
                        singleExecution(() => selectRow(item, index))();
                    } else {
                        selectRow(item, index);
                    }
                }}
                onSelectionButtonPress={onSelectionButtonPress ? () => onSelectionButtonPress(item) : undefined}
                onDismissError={() => onDismissError?.(item)}
                shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit}
                titleNumberOfLines={titleNumberOfLines}
                alternateTextNumberOfLines={alternateTextNumberOfLines}
                onFocus={(event: NativeSyntheticEvent<ExtendedTargetedEvent>) => {
                    if (shouldIgnoreFocus || isDisabled) {
                        return;
                    }
                    // Prevent unexpected scrolling on mobile Chrome after the context menu closes by ignoring programmatic focus not triggered by direct user interaction.
                    if (isMobileChrome() && event.nativeEvent && !event.nativeEvent.sourceCapabilities) {
                        return;
                    }
                    setFocusedIndex(normalizedIndex ?? index);
                }}
                shouldSyncFocus={shouldSyncFocus}
                isFocusVisible={isFocusVisible}
                shouldDisableHoverStyle={shouldDisableHoverStyle}
                selectionButtonPosition={selectionButtonPosition}
                isFirstItem={isFirstItem}
                isLastItem={isLastItem}
            />
            {item.footerContent && item.footerContent}
        </>
    );
}

export default ListItemRenderer;
