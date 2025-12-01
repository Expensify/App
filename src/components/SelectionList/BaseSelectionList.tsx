import {useIsFocused} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import type {FlashListRef, ListRenderItem, ListRenderItemInfo} from '@shopify/flash-list';
import {deepEqual} from 'fast-equals';
import React, {useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import type {TextInputKeyPressEvent, ViewStyle} from 'react-native';
import {View} from 'react-native';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useActiveElementRole from '@hooks/useActiveElementRole';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useDebounce from '@hooks/useDebounce';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useKeyboardState from '@hooks/useKeyboardState';
import usePrevious from '@hooks/usePrevious';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useScrollEnabled from '@hooks/useScrollEnabled';
import useSingleExecution from '@hooks/useSingleExecution';
import {focusedItemRef} from '@hooks/useSyncFocus/useSyncFocusImplementation';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import Footer from './components/Footer';
import ListHeader from './components/ListHeader';
import TextInput from './components/TextInput';
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
    onCheckboxPress,
    onScrollBeginDrag,
    onEndReached,
    onEndReachedThreshold,
    confirmButtonOptions,
    children,
    customListHeader,
    customListHeaderContent,
    footerContent,
    listEmptyContent,
    listFooterContent,
    rightHandSideComponent,
    alternateNumberOfSupportedLines,
    selectedItems = CONST.EMPTY_ARRAY,
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
    shouldStopPropagation = false,
    shouldScrollToFocusedIndex = true,
    shouldDebounceScrolling = false,
    shouldUpdateFocusedIndex = false,
    shouldSingleExecuteRowSelect = false,
    shouldPreventDefaultFocusOnSelectRow = false,
    shouldShowTextInput = !!textInputOptions?.label,
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
        (item: TItem) => item.isSelected ?? ((isSelected?.(item) ?? selectedItems.includes(item.keyForList ?? '')) && canSelectMultiple),
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
                if (isItemDisabled) {
                    acc.disabledIndexes.push(idx);

                    if (!item?.isDisabledCheckbox) {
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
            const item = data.at(index);
            if (!listRef.current || !item || index === -1) {
                return;
            }
            listRef.current.scrollToIndex({index});
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
        ...(!hasKeyBeenPressed.current && {setHasKeyBeenPressed}),
        isFocused,
        onArrowUpDownCallback,
    });

    const selectRow = useCallback(
        (item: TItem, indexToFocus?: number) => {
            if (!isFocused) {
                return;
            }
            if (canSelectMultiple) {
                if (shouldShowTextInput) {
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
                    keyForList={item.keyForList}
                    showTooltip={shouldShowTooltips}
                    item={item}
                    setFocusedIndex={setFocusedIndex}
                    index={index}
                    normalizedIndex={index}
                    isFocused={isItemFocused}
                    isDisabled={isItemDisabled}
                    canSelectMultiple={canSelectMultiple}
                    shouldSingleExecuteRowSelect={shouldSingleExecuteRowSelect}
                    shouldUseDefaultRightHandSideCheckmark={shouldUseDefaultRightHandSideCheckmark}
                    shouldPreventDefaultFocusOnSelectRow={shouldPreventDefaultFocusOnSelectRow}
                    rightHandSideComponent={rightHandSideComponent}
                    isMultilineSupported={isRowMultilineSupported}
                    isAlternateTextMultilineSupported={(alternateNumberOfSupportedLines ?? 0) > 1}
                    alternateTextNumberOfLines={alternateNumberOfSupportedLines}
                    shouldIgnoreFocus={shouldIgnoreFocus}
                    wrapperStyle={style?.listItemWrapperStyle}
                    titleStyles={style?.listItemTitleStyles}
                    singleExecution={singleExecution}
                    shouldHighlightSelectedItem={shouldHighlightSelectedItem}
                    shouldSyncFocus={!isTextInputFocusedRef.current && hasKeyBeenPressed.current}
                    shouldDisableHoverStyle={shouldDisableHoverStyle}
                    shouldStopMouseLeavePropagation={false}
                />
            </View>
        );
    };

    const renderListEmptyContent = () => {
        if (showLoadingPlaceholder) {
            return <OptionsListSkeletonView shouldStyleAsTable={shouldUseUserSkeletonView} />;
        }
        if (showListEmptyContent) {
            return listEmptyContent;
        }
    };

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

    const prevSearchValue = usePrevious(textInputOptions?.value);
    const prevSelectedOptionsLength = usePrevious(dataDetails.selectedOptions.length);
    const prevAllOptionsLength = usePrevious(data.length);

    useEffect(() => {
        const currentSearchValue = textInputOptions?.value;
        const searchChanged = prevSearchValue !== currentSearchValue;
        const selectedOptionsChanged = dataDetails.selectedOptions.length !== prevSelectedOptionsLength;
        // Do not change focus if:
        // 1. Input value is the same or
        // 2. Data length is 0 or
        // 3. shouldUpdateFocusedIndex is true => other function handles the focus
        if ((!searchChanged && !selectedOptionsChanged) || data.length === 0 || shouldUpdateFocusedIndex) {
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
        data,
        dataDetails.selectedOptions.length,
        isItemSelected,
        prevAllOptionsLength,
        prevSelectedOptionsLength,
        prevSearchValue,
        scrollToIndex,
        setFocusedIndex,
        shouldUpdateFocusedIndex,
        textInputOptions?.value,
    ]);

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

    useImperativeHandle(ref, () => ({scrollAndHighlightItem, scrollToIndex, updateFocusedIndex}), [scrollAndHighlightItem, scrollToIndex, updateFocusedIndex]);
    return (
        <View style={[styles.flex1, addBottomSafeAreaPadding && !hasFooter && paddingBottomStyle, style?.containerStyle]}>
            {textInputComponent({shouldBeInsideList: false})}
            {data.length === 0 ? (
                renderListEmptyContent()
            ) : (
                <>
                    <ListHeader
                        dataDetails={dataDetails}
                        aboveListHeaderMessage={textInputOptions?.headerMessage}
                        customListHeader={customListHeader}
                        canSelectMultiple={canSelectMultiple}
                        onSelectAll={handleSelectAll}
                        shouldShowSelectAllButton={!!onSelectAll}
                        shouldPreventDefaultFocusOnSelectRow={shouldPreventDefaultFocusOnSelectRow}
                    />
                    <FlashList
                        data={data}
                        renderItem={renderItem}
                        ref={listRef}
                        keyExtractor={(item) => item.keyForList}
                        ListFooterComponent={listFooterContent}
                        scrollEnabled={scrollEnabled}
                        indicatorStyle="white"
                        keyboardShouldPersistTaps="always"
                        showsVerticalScrollIndicator={showScrollIndicator}
                        onEndReached={onEndReached}
                        onEndReachedThreshold={onEndReachedThreshold}
                        style={style?.listStyle as ViewStyle}
                        initialScrollIndex={initialFocusedIndex}
                        onScrollBeginDrag={onScrollBeginDrag}
                        maintainVisibleContentPosition={{disabled: disableMaintainingScrollPosition}}
                        ListHeaderComponent={
                            <>
                                {customListHeaderContent}
                                {textInputComponent({shouldBeInsideList: true})}
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

BaseSelectionList.displayName = 'BaseSelectionList';

export default BaseSelectionList;
