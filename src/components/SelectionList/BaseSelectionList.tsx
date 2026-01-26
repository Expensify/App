import {useIsFocused} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import type {FlashListRef, ListRenderItem, ListRenderItemInfo} from '@shopify/flash-list';
import {deepEqual} from 'fast-equals';
import React, {useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import type {GestureResponderEvent, TextInputKeyPressEvent} from 'react-native';
import {View} from 'react-native';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useActiveElementRole from '@hooks/useActiveElementRole';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useDebounce from '@hooks/useDebounce';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useKeyboardState from '@hooks/useKeyboardState';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useScrollEnabled from '@hooks/useScrollEnabled';
import useSingleExecution from '@hooks/useSingleExecution';
import {focusedItemRef} from '@hooks/useSyncFocus/useSyncFocusImplementation';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import Footer from './components/Footer';
import ListHeader from './components/ListHeader';
import TextInput from './components/TextInput';
import useSearchFocusSync from './hooks/useSearchFocusSync';
import useSelectedItemFocusSync from './hooks/useSelectedItemFocusSync';
import ListItemRenderer from './ListItem/ListItemRenderer';
import type {ButtonOrCheckBoxRoles, DataDetailsType, ListItem, SelectionListProps} from './types';

const ANIMATED_HIGHLIGHT_DURATION =
    CONST.ANIMATED_HIGHLIGHT_ENTRY_DELAY +
    CONST.ANIMATED_HIGHLIGHT_ENTRY_DURATION +
    CONST.ANIMATED_HIGHLIGHT_START_DELAY +
    CONST.ANIMATED_HIGHLIGHT_START_DURATION +
    CONST.ANIMATED_HIGHLIGHT_END_DELAY +
    CONST.ANIMATED_HIGHLIGHT_END_DURATION;

function BaseSelectionList<TItem extends ListItem>({
    data,
    ref,
    ListItem,
    textInputOptions,
    initiallyFocusedItemKey,
    onSelectRow,
    onSelectAll,
    onLongPressRow,
    onCheckboxPress,
    onScrollBeginDrag,
    onDismissError,
    onEndReached,
    onEndReachedThreshold,
    confirmButtonOptions,
    children,
    customListHeader,
    customListHeaderContent,
    customLoadingPlaceholder,
    footerContent,
    listEmptyContent,
    listFooterContent,
    rightHandSideComponent,
    alternateNumberOfSupportedLines,
    selectedItems = getEmptyArray<string>(),
    style,
    isSelected,
    isDisabled = false,
    isSmallScreenWidth,
    isLoadingNewOptions,
    isRowMultilineSupported = false,
    addBottomSafeAreaPadding,
    showListEmptyContent = true,
    showLoadingPlaceholder,
    showScrollIndicator = true,
    canSelectMultiple = false,
    disableKeyboardShortcuts = false,
    disableMaintainingScrollPosition = false,
    shouldUseUserSkeletonView,
    shouldShowTooltips = true,
    shouldIgnoreFocus = false,
    shouldShowRightCaret = false,
    shouldStopPropagation = false,
    shouldHeaderBeInsideList = false,
    shouldScrollToFocusedIndex = true,
    shouldDebounceScrolling = false,
    shouldUpdateFocusedIndex = false,
    shouldSingleExecuteRowSelect = false,
    shouldPreventDefaultFocusOnSelectRow = false,
    shouldShowTextInput = !!textInputOptions?.label,
    shouldClearInputOnSelect = false,
    shouldHighlightSelectedItem = true,
    shouldUseDefaultRightHandSideCheckmark,
    shouldDisableHoverStyle = false,
    setShouldDisableHoverStyle = () => {},
}: SelectionListProps<TItem>) {
    const styles = useThemeStyles();
    const isFocused = useIsFocused();
    const scrollEnabled = useScrollEnabled();
    const {singleExecution} = useSingleExecution();
    const activeElementRole = useActiveElementRole();
    const {isKeyboardShown} = useKeyboardState();
    const {safeAreaPaddingBottomStyle} = useSafeAreaPaddings();

    const innerTextInputRef = useRef<BaseTextInputRef | null>(null);
    const isTextInputFocusedRef = useRef<boolean>(false);
    const hasKeyBeenPressed = useRef(false);
    const listRef = useRef<FlashListRef<TItem> | null>(null);
    const itemFocusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const initialFocusedIndex = useMemo(() => data.findIndex((i) => i.keyForList === initiallyFocusedItemKey), [data, initiallyFocusedItemKey]);
    const [itemsToHighlight, setItemsToHighlight] = useState<Set<string> | null>(null);

    const isItemSelected = useCallback(
        (item: TItem) => item.isSelected ?? ((isSelected?.(item) ?? selectedItems.includes(item.keyForList)) && canSelectMultiple),
        [isSelected, selectedItems, canSelectMultiple],
    );

    const paddingBottomStyle = useMemo(() => !isKeyboardShown && safeAreaPaddingBottomStyle, [isKeyboardShown, safeAreaPaddingBottomStyle]);

    const hasFooter = !!footerContent || confirmButtonOptions?.showButton;

    const dataDetails = useMemo<DataDetailsType<TItem>>(() => {
        const {disabledIndexes, disabledArrowKeyIndexes, selectedOptions} = data.reduce(
            (acc: {disabledIndexes: number[]; disabledArrowKeyIndexes: number[]; selectedOptions: TItem[]}, item: TItem, index: number) => {
                const idx = item.index ?? index;
                const isItemDisabled = isDisabled || (!!item?.isDisabled && !isItemSelected(item));

                if (isItemSelected(item) && (canSelectMultiple || acc.selectedOptions.length === 0)) {
                    acc.selectedOptions.push(item);
                }
                if (isItemDisabled || item?.isDisabledCheckbox) {
                    acc.disabledIndexes.push(idx);

                    if (isItemDisabled) {
                        acc.disabledArrowKeyIndexes.push(idx);
                    }
                }

                return acc;
            },
            {disabledIndexes: [], disabledArrowKeyIndexes: [], selectedOptions: []},
        );

        const totalSelectable = data.length - disabledIndexes.length;
        const allSelected = selectedOptions.length > 0 && selectedOptions.length === totalSelectable;
        const someSelected = selectedOptions.length > 0 && selectedOptions.length < totalSelectable;

        return {data, allSelected, someSelected, selectedOptions, disabledIndexes, disabledArrowKeyIndexes};
    }, [canSelectMultiple, data, isDisabled, isItemSelected]);

    const setHasKeyBeenPressed = useCallback(() => {
        if (hasKeyBeenPressed.current) {
            return;
        }
        hasKeyBeenPressed.current = true;
    }, []);

    const scrollToIndex = useCallback(
        (index: number) => {
            // Bounds check: ensure index is valid for current data
            if (index < 0 || index >= data.length) {
                return;
            }
            const item = data.at(index);
            if (!listRef.current || !item) {
                return;
            }
            try {
                listRef.current.scrollToIndex({index});
            } catch (error) {
                // FlashList may throw if layout for this index doesn't exist yet
                // This can happen when data changes rapidly (e.g., during search filtering)
                // The layout will be computed on next render, so we can safely ignore this
            }
        },
        [data],
    );

    const debouncedScrollToIndex = useDebounce(scrollToIndex, CONST.TIMING.LIST_SCROLLING_DEBOUNCE_TIME, {leading: true, trailing: true});

    const onArrowUpDownCallback = useCallback(() => {
        setShouldDisableHoverStyle(true);
    }, [setShouldDisableHoverStyle]);

    const [focusedIndex, setFocusedIndex, currentHoverIndexRef] = useArrowKeyFocusManager({
        initialFocusedIndex,
        maxIndex: data.length - 1,
        disabledIndexes: dataDetails.disabledArrowKeyIndexes,
        isActive: isFocused,
        onFocusedIndexChange: (index: number) => {
            if (!shouldScrollToFocusedIndex) {
                return;
            }

            (shouldDebounceScrolling ? debouncedScrollToIndex : scrollToIndex)(index);
        },
        setHasKeyBeenPressed,
        isFocused,
        onArrowUpDownCallback,
    });

    // extraData helps FlashList detect when data changes significantly (e.g., during filtering)
    // Including data.length ensures FlashList resets its layout cache when the list size changes
    // This prevents "index out of bounds" errors when filtering reduces the list size
    const extraData = useMemo(() => [data.length], [data.length]);

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
            shouldClearInputOnSelect,
            shouldPreventDefaultFocusOnSelectRow,
            isSmallScreenWidth,
            textInputOptions,
            onCheckboxPress,
            setFocusedIndex,
        ],
    );

    const focusedOption = useMemo(() => {
        if (focusedIndex < 0 || focusedIndex >= data.length) {
            return;
        }
        const option = data.at(focusedIndex);
        if (!option || (option.isDisabled && !isItemSelected(option))) {
            return;
        }
        return option;
    }, [data, focusedIndex, isItemSelected]);

    const selectFocusedOption = () => {
        if (!focusedOption) {
            return;
        }
        selectRow(focusedOption);
    };

    // Disable `Enter` shortcut if the active element is a button or checkbox
    const disableEnterShortcut = activeElementRole && [CONST.ROLE.BUTTON, CONST.ROLE.CHECKBOX].includes(activeElementRole as ButtonOrCheckBoxRoles);

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER, selectFocusedOption, {
        captureOnInputs: true,
        shouldBubble: !focusedOption,
        shouldStopPropagation,
        isActive: !disableKeyboardShortcuts && isFocused && !disableEnterShortcut && focusedIndex >= 0,
    });

    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.CTRL_ENTER,
        (e) => {
            if (confirmButtonOptions?.onConfirm) {
                confirmButtonOptions?.onConfirm(e, focusedOption);
                return;
            }
            selectFocusedOption();
        },
        {
            captureOnInputs: true,
            shouldBubble: !focusedOption,
            isActive: !disableKeyboardShortcuts && isFocused && !confirmButtonOptions?.isDisabled,
        },
    );

    const indexByKeyForList = useMemo(() => {
        const map = new Map<string, number>();
        for (const [index, item] of data.entries()) {
            map.set(item.keyForList, index);
        }
        return map;
    }, [data]);

    const selectedItemIndex = useMemo(() => (initiallyFocusedItemKey ? data.findIndex(isItemSelected) : -1), [data, initiallyFocusedItemKey, isItemSelected]);

    const getNextFocusableIndex = useCallback(
        (currentIndex: number) => {
            for (let nextIndex = currentIndex + 1; nextIndex < data.length; nextIndex++) {
                const item = data.at(nextIndex);
                if (!item) {
                    continue;
                }

                const isItemDisabled = isDisabled || (!!item.isDisabled && !isItemSelected(item));
                if (!isItemDisabled) {
                    return nextIndex;
                }
            }
            return -1;
        },
        [data, isDisabled, isItemSelected],
    );

    const focusItemByIndex = useCallback(
        (index: number) => {
            if (typeof document === 'undefined') {
                return;
            }

            const item = data.at(index);
            if (!item) {
                return;
            }

            setHasKeyBeenPressed();
            setFocusedIndex(index);
            scrollToIndex(index);

            // FlashList virtualization means the next item might not be in the DOM immediately.
            // Delay focusing to give the list a chance to render/measure the row.
            const MAX_FOCUS_RETRIES = 5;
            const FOCUS_RETRY_DELAY_MS = 50;
            let attempt = 0;
            const tryFocus = () => {
                const element = document.getElementById(item.keyForList);
                if (element instanceof HTMLElement) {
                    element.focus({preventScroll: true});
                    return;
                }

                attempt++;
                if (attempt <= MAX_FOCUS_RETRIES) {
                    setTimeout(tryFocus, FOCUS_RETRY_DELAY_MS);
                }
            };

            setTimeout(tryFocus, 0);
        },
        [data, scrollToIndex, setFocusedIndex, setHasKeyBeenPressed],
    );

    const handleTabKeyPress = useCallback(
        (event?: GestureResponderEvent | KeyboardEvent) => {
            if (!(event instanceof KeyboardEvent) || event.shiftKey || typeof document === 'undefined') {
                return;
            }

            const activeElement = document.activeElement;
            const activeElementID = activeElement instanceof HTMLElement ? activeElement.id : '';

            // If tabbing within the list, move focus to the next option in data order (not DOM order),
            // to avoid unpredictable jumps caused by virtualization/recycling.
            if (activeElementID && indexByKeyForList.has(activeElementID)) {
                const currentIndex = indexByKeyForList.get(activeElementID) ?? -1;
                const nextIndex = getNextFocusableIndex(currentIndex);
                if (nextIndex === -1) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();
                focusItemByIndex(nextIndex);
                return;
            }

            // If tabbing into the list (e.g., from the header back button), move focus directly to
            // the selected option when available.
            if (!initiallyFocusedItemKey) {
                return;
            }

            const targetIndex = selectedItemIndex !== -1 ? selectedItemIndex : initialFocusedIndex;
            if (targetIndex < 0) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            focusItemByIndex(targetIndex);
        },
        [focusItemByIndex, getNextFocusableIndex, indexByKeyForList, initialFocusedIndex, initiallyFocusedItemKey, selectedItemIndex],
    );

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.TAB, handleTabKeyPress, {
        // Let TextInput handle Tab -> list focus itself.
        captureOnInputs: false,
        // We conditionally call preventDefault() only when we handle the event.
        shouldPreventDefault: false,
        // Avoid interfering with other Tab handlers higher up the stack.
        shouldBubble: true,
        isActive: isFocused && !disableKeyboardShortcuts,
    });
    const textInputKeyPress = useCallback((event: TextInputKeyPressEvent) => {
        const key = event.nativeEvent.key;
        if (key === CONST.KEYBOARD_SHORTCUTS.TAB.shortcutKey) {
            focusedItemRef?.focus();
        }
    }, []);

    const focusTextInput = useCallback(() => {
        innerTextInputRef.current?.focus();
    }, []);

    const textInputComponent = ({shouldBeInsideList}: {shouldBeInsideList?: boolean}) => {
        if (shouldBeInsideList !== (textInputOptions?.shouldBeInsideList ?? false)) {
            return null;
        }

        return (
            <TextInput
                ref={innerTextInputRef}
                focusTextInput={focusTextInput}
                shouldShowTextInput={shouldShowTextInput}
                onKeyPress={textInputKeyPress}
                accessibilityLabel={textInputOptions?.label}
                options={textInputOptions}
                onSubmit={selectFocusedOption}
                dataLength={data.length}
                isLoading={isLoadingNewOptions}
                onFocusChange={(v: boolean) => (isTextInputFocusedRef.current = v)}
                showLoadingPlaceholder={showLoadingPlaceholder}
                isLoadingNewOptions={isLoadingNewOptions}
            />
        );
    };

    const setCurrentHoverIndex = useCallback(
        (hoverIndex: number | null) => {
            if (shouldDisableHoverStyle) {
                return;
            }
            currentHoverIndexRef.current = hoverIndex;
        },
        [currentHoverIndexRef, shouldDisableHoverStyle],
    );

    const renderItem: ListRenderItem<TItem> = ({item, index}: ListRenderItemInfo<TItem>) => {
        const isItemDisabled = isDisabled || item.isDisabled;
        const selected = isItemSelected(item);
        const isItemFocused = (!isDisabled || selected) && focusedIndex === index;
        const isItemHighlighted = !!itemsToHighlight?.has(item.keyForList);

        return (
            <View
                onMouseMove={() => setCurrentHoverIndex(index)}
                onMouseEnter={() => setCurrentHoverIndex(index)}
                onMouseLeave={(e) => {
                    e.stopPropagation();
                    setCurrentHoverIndex(null);
                }}
            >
                <ListItemRenderer
                    ListItem={ListItem}
                    selectRow={selectRow}
                    showTooltip={shouldShowTooltips}
                    item={{
                        shouldAnimateInHighlight: isItemHighlighted,
                        isSelected: selected,
                        ...item,
                    }}
                    setFocusedIndex={setFocusedIndex}
                    index={index}
                    isFocused={isItemFocused}
                    isDisabled={isItemDisabled}
                    canSelectMultiple={canSelectMultiple}
                    onDismissError={onDismissError}
                    onLongPressRow={onLongPressRow}
                    onCheckboxPress={onCheckboxPress}
                    shouldSingleExecuteRowSelect={shouldSingleExecuteRowSelect}
                    shouldUseDefaultRightHandSideCheckmark={shouldUseDefaultRightHandSideCheckmark}
                    shouldPreventDefaultFocusOnSelectRow={shouldPreventDefaultFocusOnSelectRow}
                    rightHandSideComponent={rightHandSideComponent}
                    isMultilineSupported={isRowMultilineSupported}
                    isAlternateTextMultilineSupported={(alternateNumberOfSupportedLines ?? 0) > 1}
                    alternateTextNumberOfLines={alternateNumberOfSupportedLines}
                    shouldIgnoreFocus={shouldIgnoreFocus}
                    titleStyles={style?.listItemTitleStyles}
                    wrapperStyle={style?.listItemWrapperStyle}
                    titleContainerStyles={style?.listItemTitleContainerStyles}
                    singleExecution={singleExecution}
                    shouldHighlightSelectedItem={shouldHighlightSelectedItem}
                    shouldSyncFocus={!isTextInputFocusedRef.current && hasKeyBeenPressed.current}
                    shouldDisableHoverStyle={shouldDisableHoverStyle}
                    shouldStopMouseLeavePropagation={false}
                    shouldShowRightCaret={shouldShowRightCaret}
                />
            </View>
        );
    };

    const renderListEmptyContent = () => {
        if (showLoadingPlaceholder) {
            return customLoadingPlaceholder ?? <OptionsListSkeletonView shouldStyleAsTable={shouldUseUserSkeletonView} />;
        }
        if (showListEmptyContent) {
            return listEmptyContent;
        }
    };

    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // The function scrolls to the focused input to prevent keyboard occlusion.
    // It ensures the entire list item is visible, not just the input field.
    // Added specifically for SplitExpensePage
    const scrollToFocusedInput = useCallback((item: TItem) => {
        if (!listRef.current) {
            return;
        }

        // Clear any existing timer before starting a new one
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        // Delay scrolling by 300ms to allow the keyboard to open.
        // This ensures FlashList calculates the correct window size.
        setTimeout(() => {
            listRef.current?.scrollToItem({item, viewPosition: 1, animated: true, viewOffset: 4});
        }, CONST.ANIMATED_TRANSITION);
    }, []);

    const scrollAndHighlightItem = useCallback(
        (items: string[]) => {
            const newItemsToHighlight = new Set<string>(items);

            if (deepEqual(itemsToHighlight, newItemsToHighlight)) {
                return;
            }

            const index = data.findIndex((option) => newItemsToHighlight.has(option.keyForList));
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

    const updateFocusedIndex = useCallback(
        (newFocusedIndex: number, shouldScroll = false) => {
            if (newFocusedIndex < 0 || newFocusedIndex >= data.length) {
                return;
            }
            setFocusedIndex(newFocusedIndex);
            if (shouldScroll) {
                scrollToIndex(newFocusedIndex);
            }
        },
        [data.length, scrollToIndex, setFocusedIndex],
    );

<<<<<<< HEAD
    useEffect(() => {
        if (selectedItemIndex === -1 || selectedItemIndex === focusedIndex || textInputOptions?.value) {
            return;
        }
        setFocusedIndex(selectedItemIndex);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedItemIndex]);

    const prevSearchValue = usePrevious(textInputOptions?.value);
    const prevSelectedOptionsLength = usePrevious(dataDetails.selectedOptions.length);
    const prevAllOptionsLength = usePrevious(data.length);

    useEffect(() => {
        const currentSearchValue = textInputOptions?.value;
        const searchChanged = prevSearchValue !== currentSearchValue;
        const selectedOptionsChanged = dataDetails.selectedOptions.length !== prevSelectedOptionsLength;
        const selectionChangedByClicking = !searchChanged && selectedOptionsChanged && shouldUpdateFocusedIndex;
        // Do not change focus if:
        // 1. Input value is the same or
        // 2. Data length is 0 or
        // 3. Selection changed via user interaction (not filtering), so focus is handled externally
        if ((!searchChanged && !selectedOptionsChanged) || data.length === 0 || selectionChangedByClicking) {
            return;
        }

        const hasSearchBeenCleared = prevSearchValue && !currentSearchValue;
        if (hasSearchBeenCleared) {
            const foundSelectedItemIndex = data.findIndex(isItemSelected);

            if (foundSelectedItemIndex !== -1 && !canSelectMultiple) {
                scrollToIndex(foundSelectedItemIndex);
                setFocusedIndex(foundSelectedItemIndex);
                return;
            }
        }

        // Remove focus (set focused index to -1) if:
        // 1. If the search is idle or
        // 2. If the user is just toggling options without changing the list content
        // Otherwise (e.g. when filtering/typing), focus on the first item (0)
        const isSearchIdle = !prevSearchValue && !currentSearchValue;
        const newSelectedIndex = isSearchIdle || (selectedOptionsChanged && prevAllOptionsLength === data.length) ? -1 : 0;

        scrollToIndex(newSelectedIndex);
        setFocusedIndex(newSelectedIndex);
    }, [
        canSelectMultiple,
=======
    useSelectedItemFocusSync({
>>>>>>> 87e6d666b4e4ecd51eaee9ef21a9eee4d4f470ff
        data,
        initiallyFocusedItemKey,
        isItemSelected,
        focusedIndex,
        searchValue: textInputOptions?.value,
        setFocusedIndex,
    });

    useSearchFocusSync({
        searchValue: textInputOptions?.value,
        data,
        selectedOptionsCount: dataDetails.selectedOptions.length,
        isItemSelected,
        canSelectMultiple,
        shouldUpdateFocusedIndex,
        scrollToIndex,
        setFocusedIndex,
    });

    useEffect(() => {
        if (!itemFocusTimeoutRef.current) {
            return;
        }
        clearTimeout(itemFocusTimeoutRef.current);
    }, []);

    const handleSelectAll = useCallback(() => {
        onSelectAll?.();
        if (shouldShowTextInput && shouldPreventDefaultFocusOnSelectRow && innerTextInputRef.current) {
            innerTextInputRef.current.focus();
        }
    }, [onSelectAll, shouldShowTextInput, shouldPreventDefaultFocusOnSelectRow]);

    useImperativeHandle(ref, () => ({scrollAndHighlightItem, scrollToIndex, updateFocusedIndex, scrollToFocusedInput, focusTextInput}), [
        focusTextInput,
        scrollAndHighlightItem,
        scrollToIndex,
        scrollToFocusedInput,
        updateFocusedIndex,
    ]);

    const header = (
        <ListHeader
            dataDetails={dataDetails}
            customListHeader={customListHeader}
            canSelectMultiple={canSelectMultiple}
            onSelectAll={handleSelectAll}
            headerStyle={style?.listHeaderWrapperStyle}
            shouldShowSelectAllButton={!!onSelectAll}
            shouldPreventDefaultFocusOnSelectRow={shouldPreventDefaultFocusOnSelectRow}
        />
    );

    return (
        <View style={[styles.flex1, addBottomSafeAreaPadding && !hasFooter && paddingBottomStyle, style?.containerStyle]}>
            {textInputComponent({shouldBeInsideList: false})}
            {data.length === 0 && (showLoadingPlaceholder || showListEmptyContent) ? (
                renderListEmptyContent()
            ) : (
                <>
                    {!shouldHeaderBeInsideList && header}
                    <FlashList
                        data={data}
                        renderItem={renderItem}
                        ref={listRef}
                        keyExtractor={(item) => item.keyForList}
                        extraData={extraData}
                        ListFooterComponent={listFooterContent}
                        scrollEnabled={scrollEnabled}
                        indicatorStyle="white"
                        keyboardShouldPersistTaps="always"
                        showsVerticalScrollIndicator={showScrollIndicator}
                        onEndReached={onEndReached}
                        onEndReachedThreshold={onEndReachedThreshold}
                        style={style?.listStyle}
                        initialScrollIndex={initialFocusedIndex}
                        onScrollBeginDrag={onScrollBeginDrag}
                        maintainVisibleContentPosition={{disabled: disableMaintainingScrollPosition}}
                        ListHeaderComponent={
                            <>
                                {customListHeaderContent}
                                {textInputComponent({shouldBeInsideList: true})}
                                {shouldHeaderBeInsideList && header}
                            </>
                        }
                    />
                    {children}
                </>
            )}

            <Footer<TItem>
                footerContent={footerContent}
                confirmButtonOptions={confirmButtonOptions}
                addBottomSafeAreaPadding={addBottomSafeAreaPadding}
            />
        </View>
    );
}

export default BaseSelectionList;
