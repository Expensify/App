import {useIsFocused} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import type {FlashListRef, ListRenderItem, ListRenderItemInfo} from '@shopify/flash-list';
import {deepEqual} from 'fast-equals';
import React, {useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import type {TextInput as RNTextInput, ViewStyle} from 'react-native';
import {View} from 'react-native';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import ShowMoreButton from '@components/ShowMoreButton';
import Text from '@components/Text';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useDebounce from '@hooks/useDebounce';
import useLocalize from '@hooks/useLocalize';
import useScrollEnabled from '@hooks/useScrollEnabled';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import Footer from './components/Footer';
import SelectionListHeader from './components/ListHeader';
import ListItemRenderer from './ListItem/ListItemRenderer';
import type {ListItem} from './ListItem/types';
import type {DataDetailsType, SelectionListProps} from './types';

const ANIMATED_HIGHLIGHT_DURATION =
    CONST.ANIMATED_HIGHLIGHT_ENTRY_DELAY +
    CONST.ANIMATED_HIGHLIGHT_ENTRY_DURATION +
    CONST.ANIMATED_HIGHLIGHT_START_DELAY +
    CONST.ANIMATED_HIGHLIGHT_START_DURATION +
    CONST.ANIMATED_HIGHLIGHT_END_DELAY +
    CONST.ANIMATED_HIGHLIGHT_END_DURATION;

const PAGE_SIZE = CONST.MAX_SELECTION_LIST_PAGE_LENGTH;

function getStartingPage(index: number) {
    return index >= 0 ? Math.ceil((index + 1) / PAGE_SIZE) : 1;
}

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
    confirmButtonConfig,
    aboveListHeaderMessage,
    customListHeader,
    footerContent,
    listEmptyContent,
    listFooterContent,
    rightHandSideComponent,
    alternateNumberOfSupportedLines,
    selectedItems = CONST.EMPTY_ARRAY,
    listStyle,
    listItemTitleStyles,
    listItemWrapperStyle,
    isSelected,
    isSmallScreenWidth,
    isLoadingNewOptions,
    isRowMultilineSupported = false,
    addBottomSafeAreaPadding,
    showListEmptyContent,
    showLoadingPlaceholder,
    showScrollIndicator = true,
    canSelectMultiple = false,
    shouldUseUserSkeletonView,
    shouldClearInputOnSelect,
    shouldShowTooltips = true,
    shouldIgnoreFocus = false,
    shouldScrollToFocusedIndex = true,
    shouldDebounceScrolling = false,
    shouldUpdateFocusedIndex = false,
    shouldSingleExecuteRowSelect = false,
    shouldPreventDefaultFocusOnSelectRow = false,
    shouldShowTextInput = !!textInputOptions,
}: SelectionListProps<TItem>) {
    const styles = useThemeStyles();
    const scrollEnabled = useScrollEnabled();
    const {singleExecution} = useSingleExecution();
    const {translate} = useLocalize();
    const isFocused = useIsFocused();

    const innerTextInputRef = useRef<RNTextInput | null>(null);
    const hasKeyBeenPressed = useRef(false);
    const listRef = useRef<FlashListRef<TItem> | null>(null);
    const itemFocusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const initialFocusedIndex = useMemo(() => data.findIndex((i) => i.keyForList === initiallyFocusedItemKey), [data, initiallyFocusedItemKey]);
    const [currentPage, setCurrentPage] = useState(() => getStartingPage(initialFocusedIndex));
    const [itemsToHighlight, setItemsToHighlight] = useState<Set<string> | null>(null);
    const incrementPage = () => setCurrentPage((prev) => prev + 1);
    const hasMoreDataToShow = data.length > PAGE_SIZE * currentPage;

    const isItemSelected = useCallback(
        (item: TItem) => item.isSelected ?? ((isSelected?.(item) ?? selectedItems.includes(item.keyForList ?? '')) && canSelectMultiple),
        [isSelected, selectedItems, canSelectMultiple],
    );

    const dataDetails = useMemo<DataDetailsType<TItem>>(() => {
        const {disabledIndexes, disabledArrowKeyIndexes, selectedOptions} = data.reduce(
            (acc: {disabledIndexes: number[]; disabledArrowKeyIndexes: number[]; selectedOptions: TItem[]}, item: TItem) => {
                const idx = item.index;
                const isDisabled = !!item?.isDisabled && !isItemSelected(item);

                if (isItemSelected(item)) {
                    acc.selectedOptions.push(item);
                } else if (isDisabled && idx != null) {
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
    }, [data, isItemSelected]);

    function setHasKeyBeenPressed() {
        if (hasKeyBeenPressed.current) {
            return;
        }
        hasKeyBeenPressed.current = true;
    }

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

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex: data.findIndex((item) => item.keyForList === initiallyFocusedItemKey),
        maxIndex: Math.min(data.length - 1, CONST.MAX_SELECTION_LIST_PAGE_LENGTH * currentPage - 1),
        disabledIndexes: dataDetails.disabledArrowKeyIndexes,
        isActive: isFocused,
        onFocusedIndexChange: (index: number) => {
            if (!shouldScrollToFocusedIndex) {
                return;
            }

            (shouldDebounceScrolling ? debouncedScrollToIndex : scrollToIndex)(index);
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

    const aboveListHeader = () => {
        const noResultsFound = aboveListHeaderMessage !== translate('common.noResultsFound');
        const noData = data.length === 0 && !showLoadingPlaceholder;

        if (!aboveListHeaderMessage || !isLoadingNewOptions || noResultsFound || noData) {
            return null;
        }

        return (
            <View style={[styles.ph5, styles.pb5]}>
                <Text style={[styles.textLabel, styles.colorMuted, styles.minHeight5]}>{aboveListHeaderMessage}</Text>
            </View>
        );
    };

    const renderItem: ListRenderItem<TItem> = ({item, index}: ListRenderItemInfo<TItem>) => {
        const isDisabled = item.isDisabled;
        const selected = isItemSelected(item);
        const isItemFocused = (!isDisabled || selected) && focusedIndex === index;

        return (
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
                isDisabled={isDisabled}
                canSelectMultiple={canSelectMultiple}
                shouldSingleExecuteRowSelect={shouldSingleExecuteRowSelect}
                shouldPreventDefaultFocusOnSelectRow={shouldPreventDefaultFocusOnSelectRow}
                rightHandSideComponent={rightHandSideComponent}
                isMultilineSupported={isRowMultilineSupported}
                isAlternateTextMultilineSupported={!!alternateNumberOfSupportedLines}
                alternateTextNumberOfLines={alternateNumberOfSupportedLines}
                shouldIgnoreFocus={shouldIgnoreFocus}
                wrapperStyle={listItemWrapperStyle}
                titleStyles={listItemTitleStyles}
                singleExecution={singleExecution}
            />
        );
    };

    const slicedData = useMemo(() => data.slice(0, PAGE_SIZE * currentPage), [data, currentPage]);

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

    useEffect(() => {
        if (!itemFocusTimeoutRef.current) {
            return;
        }
        clearTimeout(itemFocusTimeoutRef.current);
    }, []);

    const ListFooterComponent = useMemo(() => {
        if (listFooterContent) {
            return listFooterContent;
        }
        if (hasMoreDataToShow) {
            return (
                <ShowMoreButton
                    containerStyle={[styles.mt2, styles.mb5]}
                    currentCount={PAGE_SIZE * currentPage}
                    totalCount={data.length}
                    onPress={incrementPage}
                />
            );
        }
        return null;
    }, [listFooterContent, hasMoreDataToShow, styles.mt2, styles.mb5, currentPage, data.length]);

    const handleSelectAll = useCallback(() => {
        onSelectAll?.();
        if (shouldShowTextInput && shouldPreventDefaultFocusOnSelectRow && innerTextInputRef.current) {
            innerTextInputRef.current.focus();
        }
    }, [onSelectAll, shouldShowTextInput, shouldPreventDefaultFocusOnSelectRow]);

    useImperativeHandle(ref, () => ({scrollAndHighlightItem, scrollToIndex}), [scrollAndHighlightItem, scrollToIndex]);
    return (
        <View style={styles.flex1}>
            {aboveListHeader()}
            {data.length === 0 ? (
                renderListEmptyContent()
            ) : (
                <>
                    <SelectionListHeader
                        dataDetails={dataDetails}
                        aboveListHeaderMessage={aboveListHeaderMessage}
                        customListHeader={customListHeader}
                        canSelectMultiple={canSelectMultiple}
                        onSelectAll={handleSelectAll}
                        shouldPreventDefaultFocusOnSelectRow={shouldPreventDefaultFocusOnSelectRow}
                    />
                    <FlashList
                        data={slicedData}
                        renderItem={renderItem}
                        ref={listRef}
                        keyExtractor={(item) => item.keyForList}
                        ListFooterComponent={ListFooterComponent}
                        scrollEnabled={scrollEnabled}
                        indicatorStyle="white"
                        keyboardShouldPersistTaps="always"
                        showsVerticalScrollIndicator={showScrollIndicator}
                        onEndReached={onEndReached}
                        onEndReachedThreshold={onEndReachedThreshold}
                        style={listStyle as ViewStyle}
                        initialScrollIndex={initialFocusedIndex}
                        onScrollBeginDrag={onScrollBeginDrag}
                    />
                </>
            )}

            <Footer
                footerContent={footerContent}
                confirmButtonConfig={confirmButtonConfig}
                addBottomSafeAreaPadding={addBottomSafeAreaPadding}
            />
        </View>
    );
}

BaseSelectionList.displayName = 'BaseSelectionList';

export default BaseSelectionList;
