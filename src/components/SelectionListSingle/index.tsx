import {useIsFocused} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import type {ListRenderItem, ListRenderItemInfo} from '@shopify/flash-list';
import lodashDebounce from 'lodash/debounce';
import React, {useCallback, useImperativeHandle, useMemo, useRef, useState} from 'react';
import type {NativeSyntheticEvent, TextInput as RNTextInput, TextInputKeyPressEventData} from 'react-native';
import {View} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import BaseSelectionListItemRenderer from '@components/SelectionList/BaseSelectionListItemRenderer';
import ShowMoreButton from '@components/ShowMoreButton';
import Text from '@components/Text';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useLocalize from '@hooks/useLocalize';
import useScrollEnabled from '@hooks/useScrollEnabled';
import useSingleExecution from '@hooks/useSingleExecution';
import {focusedItemRef} from '@hooks/useSyncFocus/useSyncFocusImplementation';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import areSetsEqual from '@src/utils/setsEqual';
import SelectionListHeader from './ListHeader';
import SelectionListTextInput from './SelectionListInput';
import type {DataDetailsType, ListItem, SelectionListProps} from './types';

const ANIMATED_HIGHLIGHT_DURATION =
    CONST.ANIMATED_HIGHLIGHT_ENTRY_DELAY +
    CONST.ANIMATED_HIGHLIGHT_ENTRY_DURATION +
    CONST.ANIMATED_HIGHLIGHT_START_DELAY +
    CONST.ANIMATED_HIGHLIGHT_START_DURATION +
    CONST.ANIMATED_HIGHLIGHT_END_DELAY +
    CONST.ANIMATED_HIGHLIGHT_END_DURATION;

function SelectionListSingle<TItem extends ListItem>({
    data,
    ref,
    ListItem,
    onConfirm,
    onSelectAll,
    onCheckboxPress,
    confirmButtonText,
    confirmButtonStyle,
    isConfirmButtonDisabled,
    footerContent,
    shouldUseUserSkeletonView,
    showLoadingPlaceholder,
    showListEmptyContent,
    listEmptyContent,
    addBottomSafeAreaPadding,
    listFooterContent,
    showScrollIndicator = true,
    onEndReached,
    onEndReachedThreshold,
    listStyle,
    isLoadingNewOptions,
    textInputOptions,
    shouldShowTextInput = !!textInputOptions?.textInputLabel,
    listHeaderContent,
    onSelectRow,
    canSelectMultiple = false,
    shouldShowTooltips = true,
    selectedItems = [],
    isSelected,
    shouldSingleExecuteRowSelect = false,
    shouldPreventDefaultFocusOnSelectRow = false,
    rightHandSideComponent,
    shouldIgnoreFocus = false,
    listItemWrapperStyle,
    isRowMultilineSupported = false,
    alternateTextNumberOfSupportedLines,
    listItemTitleStyles,
    headerMessage,
    initiallyFocusedItemKey,
    shouldScrollToFocusedIndex = true,
    shouldDebounceScrolling = false,
    isSmallScreenWidth,
    shouldClearInputOnSelect,
    shouldUpdateFocusedIndex = false,
    customListHeader,
}: SelectionListProps<TItem>) {
    const styles = useThemeStyles();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsToHighlight, setItemsToHighlight] = useState<Set<string> | null>(null);
    const incrementPage = () => setCurrentPage((prev) => prev + 1);
    const scrollEnabled = useScrollEnabled();
    const {singleExecution} = useSingleExecution();
    const {translate} = useLocalize();
    const isFocused = useIsFocused();
    // REF
    const innerTextInputRef = useRef<RNTextInput | null>(null);
    const isTextInputFocusedRef = useRef<boolean>(false);
    const hasKeyBeenPressed = useRef(false);
    const listRef = useRef<FlashList<TItem>>(null);
    const itemFocusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const isItemSelected = useCallback(
        (item: TItem) => item.isSelected ?? ((isSelected?.(item) ?? selectedItems.includes(item.keyForList ?? '')) && canSelectMultiple),
        [isSelected, selectedItems, canSelectMultiple],
    );

    const dataDetails = useMemo<DataDetailsType<TItem>>(() => {
        const disabledIndexes = data
            .filter((item) => item?.isDisabled && !isItemSelected(item))
            .map((item) => item.index)
            .filter((i): i is number => i !== undefined);

        const disabledArrowKeyIndexes = data
            .filter((item) => !!item?.isDisabled && !isItemSelected(item) && !item?.isDisabledCheckbox)
            .map((item) => item.index)
            .filter((i): i is number => i !== undefined);

        const allOptions = data;
        const totalSelectable = allOptions.length - disabledIndexes.length;
        const selectedOptions = data.filter(isItemSelected);
        const allSelected = selectedOptions.length > 0 && selectedOptions.length === totalSelectable;
        const someSelected = selectedOptions.length > 0 && selectedOptions.length < totalSelectable;

        return {allOptions, allSelected, someSelected, selectedOptions, disabledIndexes, disabledArrowKeyIndexes};
    }, [data, isItemSelected]);

    const showConfirmButton = useMemo(() => !!confirmButtonText, [confirmButtonText]);

    const textInputKeyPress = useCallback((event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
        const key = event.nativeEvent.key;
        if (key === CONST.KEYBOARD_SHORTCUTS.TAB.shortcutKey) {
            focusedItemRef?.focus();
        }
    }, []);

    const scrollToIndex = useCallback(
        (index: number, animated = true) => {
            const item = data.at(index);
            if (!listRef.current || !item || index === -1) {
                return;
            }
            listRef.current.scrollToIndex({index, animated});
        },
        [data],
    );

    function setHasKeyBeenPressed() {
        if (hasKeyBeenPressed.current) {
            return;
        }
        hasKeyBeenPressed.current = true;
    }

    // eslint-disable-next-line react-compiler/react-compiler
    const debouncedScrollToIndex = useMemo(() => lodashDebounce(scrollToIndex, CONST.TIMING.LIST_SCROLLING_DEBOUNCE_TIME, {leading: true, trailing: true}), [scrollToIndex]);

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex: data.findIndex((item) => item.keyForList === initiallyFocusedItemKey),
        maxIndex: Math.min(data.length - 1, CONST.MAX_SELECTION_LIST_PAGE_LENGTH * currentPage - 1),
        disabledIndexes: dataDetails.disabledArrowKeyIndexes,
        isActive: isFocused,
        onFocusedIndexChange: (index: number) => {
            if (!shouldScrollToFocusedIndex) {
                return;
            }

            (shouldDebounceScrolling ? debouncedScrollToIndex : scrollToIndex)(index, true);
        },
        // eslint-disable-next-line react-compiler/react-compiler
        ...(!hasKeyBeenPressed.current && {setHasKeyBeenPressed}),
        isFocused,
    });

    const selectRow = useCallback(
        (item: TItem, indexToFocus?: number) => {
            if (!isFocused) {
                return;
            }
            if (canSelectMultiple) {
                if (shouldShowTextInput && shouldClearInputOnSelect) {
                    textInputOptions?.onChangeText?.('');
                } else if (isSmallScreenWidth) {
                    if (!item.isDisabledCheckbox) {
                        onCheckboxPress?.(item);
                    }
                    return;
                }
            }
            if (shouldUpdateFocusedIndex && typeof indexToFocus === 'number') {
                setFocusedIndex(indexToFocus);
            }
            onSelectRow(item);

            if (shouldShowTextInput && shouldPreventDefaultFocusOnSelectRow && innerTextInputRef.current) {
                innerTextInputRef.current.focus();
            }
        },
        [
            isFocused,
            canSelectMultiple,
            shouldUpdateFocusedIndex,
            onSelectRow,
            shouldShowTextInput,
            shouldPreventDefaultFocusOnSelectRow,
            shouldClearInputOnSelect,
            isSmallScreenWidth,
            textInputOptions,
            onCheckboxPress,
            setFocusedIndex,
        ],
    );

    const selectFocusedOption = useCallback(() => {
        const focusedOption = focusedIndex !== -1 ? data.at(focusedIndex) : undefined;

        if (!focusedOption || (focusedOption.isDisabled && !isItemSelected(focusedOption))) {
            return;
        }

        selectRow(focusedOption);
    }, [data, focusedIndex, isItemSelected, selectRow]);

    const headerMessageContent = () =>
        (!isLoadingNewOptions || headerMessage !== translate('common.noResultsFound') || (data.length === 0 && !showLoadingPlaceholder)) &&
        !!headerMessage && (
            <View style={[styles.ph5, styles.pb5]}>
                <Text style={[styles.textLabel, styles.colorMuted, styles.minHeight5]}>{headerMessage}</Text>
            </View>
        );

    const renderItem: ListRenderItem<TItem> = useCallback(
        ({item, index}: ListRenderItemInfo<TItem>) => {
            const isDisabled = item.isDisabled;
            const selected = isItemSelected(item);
            const isItemFocused = (!isDisabled || selected) && focusedIndex === index;
            const isItemHighlighted = !!itemsToHighlight?.has(item.keyForList ?? '');

            return (
                <View>
                    <BaseSelectionListItemRenderer
                        ListItem={ListItem}
                        item={{
                            shouldAnimateInHighlight: isItemHighlighted,
                            isSelected: selected,
                            ...item,
                        }}
                        setFocusedIndex={setFocusedIndex}
                        index={index}
                        normalizedIndex={index}
                        isFocused={isItemFocused}
                        isDisabled={isDisabled}
                        showTooltip={shouldShowTooltips}
                        canSelectMultiple={canSelectMultiple}
                        shouldSingleExecuteRowSelect={shouldSingleExecuteRowSelect}
                        selectRow={selectRow}
                        shouldPreventDefaultFocusOnSelectRow={shouldPreventDefaultFocusOnSelectRow}
                        rightHandSideComponent={rightHandSideComponent}
                        isMultilineSupported={isRowMultilineSupported}
                        isAlternateTextMultilineSupported={!!alternateTextNumberOfSupportedLines}
                        alternateTextNumberOfLines={alternateTextNumberOfSupportedLines}
                        shouldIgnoreFocus={shouldIgnoreFocus}
                        wrapperStyle={listItemWrapperStyle}
                        titleStyles={listItemTitleStyles}
                        singleExecution={singleExecution}
                    />
                </View>
            );
        },
        [
            ListItem,
            alternateTextNumberOfSupportedLines,
            canSelectMultiple,
            focusedIndex,
            isItemSelected,
            isRowMultilineSupported,
            itemsToHighlight,
            listItemTitleStyles,
            listItemWrapperStyle,
            rightHandSideComponent,
            selectRow,
            setFocusedIndex,
            shouldIgnoreFocus,
            shouldPreventDefaultFocusOnSelectRow,
            shouldShowTooltips,
            shouldSingleExecuteRowSelect,
            singleExecution,
        ],
    );

    const [slicedData, ShowMoreButtonInstance] = useMemo(() => {
        const pageSize = CONST.MAX_SELECTION_LIST_PAGE_LENGTH * currentPage;
        const partData = data.slice(0, pageSize);

        const shouldShowMoreButton = data.length > pageSize;
        const showMoreButton = shouldShowMoreButton ? (
            <ShowMoreButton
                containerStyle={[styles.mt2, styles.mb5]}
                currentCount={pageSize}
                totalCount={data.length}
                onPress={incrementPage}
            />
        ) : null;

        return [partData, showMoreButton];
    }, [currentPage, data, styles.mb5, styles.mt2]);

    const renderListEmptyContent = () => {
        if (showLoadingPlaceholder) {
            return <OptionsListSkeletonView shouldStyleAsTable={shouldUseUserSkeletonView} />;
        }
        if (showListEmptyContent) {
            return listEmptyContent;
        }
        return null;
    };

    const scrollAndHighlightItem = useCallback(
        (items: string[]) => {
            const newItemsToHighlight = new Set<string>(items);
            if (areSetsEqual(itemsToHighlight, newItemsToHighlight)) {
                return;
            }
            const index = data.findIndex((option) => newItemsToHighlight.has(option.keyForList ?? ''));
            scrollToIndex(index);
            setItemsToHighlight(newItemsToHighlight);

            if (itemFocusTimeoutRef.current) {
                clearTimeout(itemFocusTimeoutRef.current);
            }
            itemFocusTimeoutRef.current = setTimeout(() => {
                setItemsToHighlight(null);
            }, ANIMATED_HIGHLIGHT_DURATION);
        },
        [data, itemsToHighlight, scrollToIndex],
    );

    const focusTextInput = useCallback(() => {
        if (!innerTextInputRef.current) {
            return;
        }

        innerTextInputRef.current.focus();
    }, []);

    useImperativeHandle(ref, () => ({scrollAndHighlightItem, scrollToIndex, focusTextInput}), [focusTextInput, scrollAndHighlightItem, scrollToIndex]);

    return (
        <View style={styles.flex1}>
            {shouldShowTextInput && (
                <SelectionListTextInput
                    onKeyPress={textInputKeyPress}
                    ref={(el) => {
                        innerTextInputRef.current = el as RNTextInput;
                        if (!textInputOptions?.textInputRef) {
                            return;
                        }
                        if (typeof textInputOptions.textInputRef === 'function') {
                            textInputOptions.textInputRef(el as RNTextInput);
                        } else {
                            // eslint-disable-next-line no-param-reassign
                            textInputOptions.textInputRef.current = el as RNTextInput;
                        }
                    }}
                    options={textInputOptions}
                    isLoading={isLoadingNewOptions}
                    dataLength={data.length}
                    onSubmit={selectFocusedOption}
                    onFocusChange={(focused) => (isTextInputFocusedRef.current = focused)}
                />
            )}

            {headerMessageContent()}
            {data.length === 0 ? (
                renderListEmptyContent()
            ) : (
                <>
                    {!listHeaderContent && (
                        <SelectionListHeader
                            dataDetails={dataDetails}
                            headerMessage={headerMessage}
                            customListHeader={customListHeader}
                            canSelectMultiple={canSelectMultiple}
                            onSelectAll={() => {
                                onSelectAll?.();
                                if (shouldShowTextInput && shouldPreventDefaultFocusOnSelectRow && innerTextInputRef.current) {
                                    innerTextInputRef.current.focus();
                                }
                            }}
                            shouldPreventDefaultFocusOnSelectRow={shouldPreventDefaultFocusOnSelectRow}
                        />
                    )}
                    <FlashList
                        data={slicedData}
                        renderItem={renderItem}
                        ref={listRef}
                        keyExtractor={(item, index) => item.keyForList ?? `${index}`}
                        estimatedItemSize={64}
                        ListFooterComponent={listFooterContent ?? ShowMoreButtonInstance}
                        scrollEnabled={scrollEnabled}
                        indicatorStyle="white"
                        keyboardShouldPersistTaps="always"
                        showsVerticalScrollIndicator={showScrollIndicator}
                        onEndReached={onEndReached}
                        onEndReachedThreshold={onEndReachedThreshold}
                        style={[listStyle]}
                        initialScrollIndex={focusedIndex}
                    />
                </>
            )}

            {showConfirmButton && (
                <FixedFooter
                    style={styles.mtAuto}
                    addBottomSafeAreaPadding={addBottomSafeAreaPadding}
                >
                    <Button
                        success
                        large
                        style={[styles.w100, confirmButtonStyle]}
                        text={confirmButtonText}
                        onPress={onConfirm}
                        pressOnEnter
                        enterKeyEventListenerPriority={1}
                        isDisabled={isConfirmButtonDisabled}
                    />
                </FixedFooter>
            )}
            {!!footerContent && (
                <FixedFooter
                    style={styles.mtAuto}
                    addBottomSafeAreaPadding={addBottomSafeAreaPadding}
                >
                    {footerContent}
                </FixedFooter>
            )}
        </View>
    );
}

SelectionListSingle.displayName = 'SelectionListSingle';

export default SelectionListSingle;
