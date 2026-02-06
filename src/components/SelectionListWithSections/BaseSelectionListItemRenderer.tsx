import React from 'react';
import type {NativeSyntheticEvent, StyleProp, TextStyle, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import type useSingleExecution from '@hooks/useSingleExecution';
import {isMobileChrome} from '@libs/Browser';
import {isTransactionGroupListItemType} from '@libs/SearchUIUtils';
import type {PersonalDetailsList} from '@src/types/onyx';
import type {BaseListItemProps, ExtendedTargetedEvent, ListItem, SelectionListProps} from './types';

type BaseSelectionListItemRendererProps<TItem extends ListItem> = Omit<BaseListItemProps<TItem>, 'onSelectRow'> &
    Pick<SelectionListProps<TItem>, 'ListItem' | 'shouldIgnoreFocus' | 'shouldSingleExecuteRowSelect' | 'canShowProductTrainingTooltip'> & {
        index: number;
        sectionIndex?: number;
        selectRow: (item: TItem, indexToFocus?: number) => void;
        setFocusedIndex: ReturnType<typeof useArrowKeyFocusManager>[1];
        normalizedIndex: number;
        singleExecution: ReturnType<typeof useSingleExecution>['singleExecution'];
        titleStyles?: StyleProp<TextStyle>;
        titleContainerStyles?: StyleProp<ViewStyle>;
        userWalletTierName?: string | undefined;
        isUserValidated?: boolean | undefined;
        personalDetails?: OnyxEntry<PersonalDetailsList>;
        userBillingFundID?: number | undefined;
    };

function BaseSelectionListItemRenderer<TItem extends ListItem>({
    ListItem,
    item,
    index,
    sectionIndex,
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
    wrapperStyle,
    titleStyles,
    singleExecution,
    titleContainerStyles,
    shouldUseDefaultRightHandSideCheckmark,
    canShowProductTrainingTooltip = true,
    userWalletTierName,
    isUserValidated,
    personalDetails,
    userBillingFundID,
    shouldShowRightCaret,
    shouldHighlightSelectedItem = true,
    shouldDisableHoverStyle,
    shouldStopMouseLeavePropagation,
}: BaseSelectionListItemRendererProps<TItem>) {
    const handleOnCheckboxPress = () => {
        if (isTransactionGroupListItemType(item)) {
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
                wrapperStyle={wrapperStyle}
                titleStyles={titleStyles}
                titleContainerStyles={titleContainerStyles}
                shouldUseDefaultRightHandSideCheckmark={shouldUseDefaultRightHandSideCheckmark}
                canShowProductTrainingTooltip={canShowProductTrainingTooltip}
                userWalletTierName={userWalletTierName}
                isUserValidated={isUserValidated}
                personalDetails={personalDetails}
                userBillingFundID={userBillingFundID}
                index={index}
                shouldShowRightCaret={shouldShowRightCaret}
                shouldHighlightSelectedItem={shouldHighlightSelectedItem}
                sectionIndex={sectionIndex}
                shouldDisableHoverStyle={shouldDisableHoverStyle}
                shouldStopMouseLeavePropagation={shouldStopMouseLeavePropagation}
            />
            {item.footerContent && item.footerContent}
        </>
    );
}

export default BaseSelectionListItemRenderer;
