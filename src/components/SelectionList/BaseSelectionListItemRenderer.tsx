import React from 'react';
import type {NativeSyntheticEvent, StyleProp, TextStyle, ViewStyle} from 'react-native';
import type useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import type useSingleExecution from '@hooks/useSingleExecution';
import {isMobileChrome} from '@libs/Browser';
import {isReportListItemType} from '@libs/SearchUIUtils';
import type {BaseListItemProps, ExtendedTargetedEvent, ListItem, SelectionListProps} from './types';

type BaseSelectionListItemRendererProps<TItem extends ListItem> = Omit<BaseListItemProps<TItem>, 'onSelectRow'> &
    Pick<SelectionListProps<TItem>, 'ListItem' | 'shouldHighlightSelectedItem' | 'shouldIgnoreFocus' | 'shouldSingleExecuteRowSelect'> & {
        index: number;
        selectRow: (item: TItem, indexToFocus?: number) => void;
        setFocusedIndex: ReturnType<typeof useArrowKeyFocusManager>[1];
        normalizedIndex: number;
        singleExecution: ReturnType<typeof useSingleExecution>['singleExecution'];
        titleStyles?: StyleProp<TextStyle>;
        titleContainerStyles?: StyleProp<ViewStyle>;
    };

function BaseSelectionListItemRenderer<TItem extends ListItem>({
    ListItem,
    item,
    index,
    isFocused,
    isDisabled,
    showTooltip,
    canSelectMultiple,
    onLongPressRow,
    shouldSingleExecuteRowSelect,
    selectRow,
    onCheckboxPress,
    onDismissError,
    shouldPreventDefaultFocusOnSelectRow,
    rightHandSideComponent,
    isMultilineSupported,
    isAlternateTextMultilineSupported,
    alternateTextNumberOfLines,
    shouldIgnoreFocus,
    setFocusedIndex,
    normalizedIndex,
    shouldSyncFocus,
    shouldHighlightSelectedItem,
    wrapperStyle,
    titleStyles,
    singleExecution,
    titleContainerStyles,
}: BaseSelectionListItemRendererProps<TItem>) {
    const handleOnCheckboxPress = () => {
        if (isReportListItemType(item)) {
            return onCheckboxPress;
        }
        return onCheckboxPress ? () => onCheckboxPress(item) : undefined;
    };

    return (
        <>
            <ListItem
                item={item}
                isFocused={isFocused}
                isDisabled={isDisabled}
                showTooltip={showTooltip}
                canSelectMultiple={canSelectMultiple}
                onLongPressRow={onLongPressRow}
                onSelectRow={() => {
                    if (shouldSingleExecuteRowSelect) {
                        singleExecution(() => selectRow(item, index))();
                    } else {
                        selectRow(item, index);
                    }
                }}
                onCheckboxPress={handleOnCheckboxPress()}
                onDismissError={() => onDismissError?.(item)}
                shouldPreventDefaultFocusOnSelectRow={shouldPreventDefaultFocusOnSelectRow}
                // We're already handling the Enter key press in the useKeyboardShortcut hook, so we don't want the list item to submit the form
                shouldPreventEnterKeySubmit
                rightHandSideComponent={rightHandSideComponent}
                keyForList={item.keyForList ?? ''}
                isMultilineSupported={isMultilineSupported}
                isAlternateTextMultilineSupported={isAlternateTextMultilineSupported}
                alternateTextNumberOfLines={alternateTextNumberOfLines}
                onFocus={(event: NativeSyntheticEvent<ExtendedTargetedEvent>) => {
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    if (shouldIgnoreFocus || isDisabled) {
                        return;
                    }
                    // Prevent unexpected scrolling on mobile Chrome after the context menu closes by ignoring programmatic focus not triggered by direct user interaction.
                    if (isMobileChrome() && event.nativeEvent && !event.nativeEvent.sourceCapabilities) {
                        return;
                    }
                    setFocusedIndex(normalizedIndex);
                }}
                shouldSyncFocus={shouldSyncFocus}
                shouldHighlightSelectedItem={shouldHighlightSelectedItem}
                wrapperStyle={wrapperStyle}
                titleStyles={titleStyles}
                titleContainerStyles={titleContainerStyles}
            />
            {item.footerContent && item.footerContent}
        </>
    );
}

BaseSelectionListItemRenderer.displayName = 'BaseSelectionListItemRenderer';

export default BaseSelectionListItemRenderer;
