import Footer from '@components/SelectionList/components/Footer';
import SelectionListEmptyState from '@components/SelectionList/components/SelectionListEmptyState';
import TextInput from '@components/SelectionList/components/TextInput';
import useFlattenedSections, {isItemSelected, shouldTreatItemAsDisabled} from '@components/SelectionList/hooks/useFlattenedSections';
import useScrollToFocusedInput from '@components/SelectionList/hooks/useScrollToFocusedInput';
import useSearchFocusSync from '@components/SelectionList/hooks/useSearchFocusSync';
import useSelectedItemFocusSync from '@components/SelectionList/hooks/useSelectedItemFocusSync';
import useSelectionListKeyboardFocus from '@components/SelectionList/hooks/useSelectionListKeyboardFocus';
import useSelectionListScroll from '@components/SelectionList/hooks/useSelectionListScroll';
import useSelectionListShortcuts from '@components/SelectionList/hooks/useSelectionListShortcuts';
import useSelectionListTextInput from '@components/SelectionList/hooks/useSelectionListTextInput';
import ListItemRenderer from '@components/SelectionList/ListItem/ListItemRenderer';
import {getListboxRole} from '@components/SelectionList/utils/getListboxRole';
import Text from '@components/Text';

import useKeyboardState from '@hooks/useKeyboardState';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useScrollEnabled from '@hooks/useScrollEnabled';
import useScrollEventEmitter from '@hooks/useScrollEventEmitter';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';

import genericMemo from '@libs/genericMemo';

import CONST from '@src/CONST';

import type {FlashListRef, ListRenderItemInfo} from '@shopify/flash-list';
import type {ValueOf} from 'type-fest';

import {useIsFocused} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import React, {useCallback, useImperativeHandle, useRef} from 'react';
import {View} from 'react-native';

import type {FlattenedItem, ListItem, SelectionListWithSectionsProps} from './types';

function getItemType<TItem extends ListItem>(item: FlattenedItem<TItem>): ValueOf<typeof CONST.SECTION_LIST_ITEM_TYPE> {
    return item?.type ?? CONST.SECTION_LIST_ITEM_TYPE.ROW;
}

function BaseSelectionListWithSections<TItem extends ListItem>({
    sections,
    ref,
    ListItem,
    textInputOptions,
    searchValueForFocusSync,
    initiallyFocusedItemKey,
    confirmButtonOptions,
    initialScrollIndex,
    onLayout,
    onSelectRow,
    onDismissError,
    onScroll,
    onScrollBeginDrag,
    onEndReached,
    onEndReachedThreshold,
    customListHeaderContent,
    customHeaderContent,
    rightHandSideComponent,
    listEmptyContent,
    footerContent,
    listFooterContent,
    style,
    addBottomSafeAreaPadding,
    isLoadingNewOptions,
    canSelectMultiple = false,
    shouldShowLoadingPlaceholder = false,
    shouldShowListEmptyContent = true,
    shouldShowTooltips = true,
    disableKeyboardShortcuts = false,
    shouldShowTextInput,
    shouldIgnoreFocus = false,
    shouldStopPropagation = false,
    shouldDebounceScrolling = false,
    shouldUpdateFocusedIndex = false,
    shouldScrollToFocusedIndex = true,
    shouldHighlightInitiallyFocusedItem = false,
    shouldClearInputOnSelect = true,
    shouldSingleExecuteRowSelect = false,
    shouldPreventDefaultFocusOnSelectRow = false,
    shouldPreventAutoScrollOnSelect = false,
    isRowMultilineSupported = false,
    titleNumberOfLines,
    shouldHighlightSelectedItem,
    shouldDisableHoverStyle,
    selectionButtonPosition,
    setShouldDisableHoverStyle = () => {},
}: SelectionListWithSectionsProps<TItem>) {
    const styles = useThemeStyles();
    const isScreenFocused = useIsFocused();
    const scrollEnabled = useScrollEnabled();
    const {singleExecution} = useSingleExecution();
    const {isKeyboardShown} = useKeyboardState();
    const {safeAreaPaddingBottomStyle} = useSafeAreaPaddings();
    const triggerScrollEvent = useScrollEventEmitter();
    const paddingBottomStyle = !isKeyboardShown && !footerContent && safeAreaPaddingBottomStyle;

    const {flattenedData, disabledIndexes, itemsCount, selectedItems, initialFocusedIndex, firstFocusableIndex} = useFlattenedSections(sections, initiallyFocusedItemKey);
    const listRef = useRef<FlashListRef<FlattenedItem<TItem>> | null>(null);
    const {scrollToIndex, debouncedScrollToIndex} = useSelectionListScroll(listRef, flattenedData);
    const {containerRef, trackScrollOffset, scrollInputIntoView} = useScrollToFocusedInput(listRef, isKeyboardShown);

    const {focusedIndex, setFocusedIndex, isKeyboardNavigating, setHasKeyBeenPressed} = useSelectionListKeyboardFocus({
        initialFocusedIndex,
        maxIndex: flattenedData.length - 1,
        disabledIndexes,
        isActive: isScreenFocused && itemsCount > 0,
        isFocused: isScreenFocused,
        shouldScrollToFocusedIndex,
        shouldDebounceScrolling,
        scrollToIndex,
        debouncedScrollToIndex,
        announceProgrammaticScroll: () => listRef.current?.announceProgrammaticScroll(),
        setShouldDisableHoverStyle,
    });

    const {innerTextInputRef, isTextInputFocusedRef, focusTextInput, textInputKeyPress} = useSelectionListTextInput(setHasKeyBeenPressed);

    const getFocusedItem = useCallback((): TItem | undefined => {
        if (focusedIndex < 0 || focusedIndex >= flattenedData.length) {
            return;
        }
        const item = flattenedData.at(focusedIndex);
        if (!item || shouldTreatItemAsDisabled(item)) {
            return;
        }
        return item as TItem;
    }, [flattenedData, focusedIndex]);

    const selectRow = (item: TItem, indexToFocus?: number) => {
        if (!isScreenFocused) {
            return;
        }
        if (canSelectMultiple) {
            if (!shouldPreventAutoScrollOnSelect && sections.length > 1 && !isItemSelected(item)) {
                scrollToIndex(0);
            }

            if (shouldShowTextInput && shouldClearInputOnSelect) {
                textInputOptions?.onChangeText?.('');
            }
        }
        if (shouldUpdateFocusedIndex && typeof indexToFocus === 'number') {
            setFocusedIndex(indexToFocus);
        }
        onSelectRow(item);

        if (shouldShowTextInput && shouldPreventDefaultFocusOnSelectRow) {
            focusTextInput();
        }
    };

    const selectFocusedItem = () => {
        const focusedItem = getFocusedItem();
        if (!focusedItem || focusedItem.isInteractive === false) {
            return;
        }
        selectRow(focusedItem);
    };

    const clearInputAfterSelect = useCallback(() => {
        textInputOptions?.onChangeText?.('');
    }, [textInputOptions]);

    const updateAndScrollToFocusedIndex = useCallback(
        (index: number, shouldScroll = true) => {
            setFocusedIndex(index);
            if (shouldScroll) {
                scrollToIndex(index);
            }
        },
        [scrollToIndex, setFocusedIndex],
    );

    /**
     * Handles isTextInputFocusedRef value when using external TextInput, so external TextInput does not lose focus when typing in it.
     */
    const updateExternalTextInputFocus = useCallback(
        (isTextInputFocused: boolean) => {
            isTextInputFocusedRef.current = isTextInputFocused;
        },
        [isTextInputFocusedRef],
    );

    useImperativeHandle(
        ref,
        () => ({
            focusTextInput,
            scrollToIndex,
            clearInputAfterSelect,
            updateAndScrollToFocusedIndex,
            updateExternalTextInputFocus,
            getFocusedOption: getFocusedItem,
            scrollInputIntoView,
        }),
        [focusTextInput, scrollToIndex, clearInputAfterSelect, updateAndScrollToFocusedIndex, updateExternalTextInputFocus, getFocusedItem, scrollInputIntoView],
    );

    const syncedSearchValue = searchValueForFocusSync ?? textInputOptions?.value;

    useSelectionListShortcuts({
        selectFocusedItem,
        getFocusedOption: getFocusedItem,
        confirmButtonOptions,
        isActive: isScreenFocused,
        focusedIndex,
        disableKeyboardShortcuts,
        shouldStopPropagation,
        shouldBubble: itemsCount > 0 && !getFocusedItem(),
    });

    useSelectedItemFocusSync({
        data: flattenedData,
        initiallyFocusedItemKey,
        isItemSelected,
        focusedIndex,
        searchValue: syncedSearchValue,
        setFocusedIndex,
    });

    useSearchFocusSync({
        searchValue: syncedSearchValue,
        data: flattenedData,
        selectedOptionsCount: selectedItems.length,
        isItemSelected,
        canSelectMultiple,
        shouldUpdateFocusedIndex,
        scrollToIndex,
        setFocusedIndex,
        firstFocusableIndex,
    });

    const textInputComponent = () => {
        if (!shouldShowTextInput) {
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
                onSubmit={selectFocusedItem}
                dataLength={itemsCount}
                isLoading={isLoadingNewOptions}
                onFocusChange={(v: boolean) => (isTextInputFocusedRef.current = v)}
                shouldShowLoadingPlaceholder={shouldShowLoadingPlaceholder}
                isLoadingNewOptions={isLoadingNewOptions}
            />
        );
    };

    const renderItem = ({item, index}: ListRenderItemInfo<FlattenedItem<TItem>>) => {
        if (!item) {
            return null;
        }

        switch (item.type) {
            case CONST.SECTION_LIST_ITEM_TYPE.HEADER: {
                if (item.customHeader) {
                    return item.customHeader;
                }

                return (
                    <View style={[styles.optionsListSectionHeader, styles.justifyContentCenter]}>
                        <Text style={[styles.ph5, styles.textLabelSupporting, style?.sectionTitleStyles]}>{item.title}</Text>
                    </View>
                );
            }
            case CONST.SECTION_LIST_ITEM_TYPE.ROW: {
                const isItemFocused = index === focusedIndex;
                const isItemVisuallyFocused = isItemFocused && (shouldHighlightInitiallyFocusedItem || isKeyboardNavigating);
                const isDisabled = !!item.isDisabled && !item.isSelected;

                return (
                    <ListItemRenderer
                        ListItem={ListItem}
                        selectRow={selectRow}
                        showTooltip={shouldShowTooltips}
                        item={item}
                        index={index}
                        normalizedIndex={index}
                        isFocused={isItemFocused}
                        isFocusVisible={isItemVisuallyFocused}
                        isDisabled={isDisabled}
                        canSelectMultiple={canSelectMultiple}
                        shouldSingleExecuteRowSelect={shouldSingleExecuteRowSelect}
                        onDismissError={onDismissError}
                        rightHandSideComponent={rightHandSideComponent}
                        setFocusedIndex={setFocusedIndex}
                        singleExecution={singleExecution}
                        shouldSyncFocus={!isTextInputFocusedRef.current && isKeyboardNavigating}
                        shouldIgnoreFocus={shouldIgnoreFocus}
                        wrapperStyle={style?.listItemWrapperStyle}
                        titleStyles={style?.listItemTitleStyles}
                        isMultilineSupported={isRowMultilineSupported}
                        titleNumberOfLines={titleNumberOfLines}
                        shouldHighlightSelectedItem={shouldHighlightSelectedItem}
                        shouldDisableHoverStyle={shouldDisableHoverStyle}
                        selectionButtonPosition={selectionButtonPosition}
                        shouldPreventEnterKeySubmit={!disableKeyboardShortcuts}
                    />
                );
            }
            default:
                return null;
        }
    };

    return (
        <View
            ref={containerRef}
            style={[styles.flex1, addBottomSafeAreaPadding && paddingBottomStyle, style?.containerStyle]}
            onLayout={onLayout}
        >
            {textInputComponent()}
            {customHeaderContent}
            {itemsCount === 0 && (shouldShowLoadingPlaceholder || shouldShowListEmptyContent) ? (
                <SelectionListEmptyState
                    shouldShowLoadingPlaceholder={shouldShowLoadingPlaceholder}
                    shouldShowListEmptyContent={shouldShowListEmptyContent}
                    listEmptyContent={listEmptyContent}
                    context="BaseSelectionListWithSections"
                />
            ) : (
                <FlashList
                    role={getListboxRole(canSelectMultiple)}
                    data={flattenedData}
                    renderItem={renderItem}
                    ref={listRef}
                    extraData={flattenedData.length}
                    getItemType={getItemType}
                    initialScrollIndex={initialScrollIndex ?? initialFocusedIndex}
                    keyExtractor={(item) => ('flatListKey' in item ? item.flatListKey : item.keyForList)}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={onEndReachedThreshold}
                    onScrollBeginDrag={onScrollBeginDrag}
                    scrollEnabled={scrollEnabled}
                    onScroll={(event) => {
                        trackScrollOffset(event);
                        onScroll?.();
                        triggerScrollEvent();
                    }}
                    indicatorStyle="white"
                    showsVerticalScrollIndicator
                    keyboardShouldPersistTaps="always"
                    ListHeaderComponent={customListHeaderContent}
                    ListFooterComponent={listFooterContent}
                    ListFooterComponentStyle={style?.listFooterContentStyle}
                    style={style?.listStyle}
                    contentContainerStyle={style?.contentContainerStyle}
                    maintainVisibleContentPosition={{disabled: true}}
                />
            )}
            {!!footerContent && (
                <Footer<TItem>
                    footerContent={footerContent}
                    addBottomSafeAreaPadding={addBottomSafeAreaPadding}
                />
            )}
        </View>
    );
}

export default genericMemo(BaseSelectionListWithSections);
