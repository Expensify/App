import {useIsFocused} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import type {FlashListRef, ListRenderItem, ListRenderItemInfo} from '@shopify/flash-list';
import lodashDebounce from 'lodash/debounce';
import React, {useCallback, useImperativeHandle, useMemo, useRef, useState} from 'react';
import type {TextInput as RNTextInput, ViewStyle} from 'react-native';
import {View} from 'react-native';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import BaseSelectionListItemRenderer from '@components/SelectionList/BaseSelectionListItemRenderer';
import ShowMoreButton from '@components/ShowMoreButton';
import Text from '@components/Text';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useLocalize from '@hooks/useLocalize';
import useScrollEnabled from '@hooks/useScrollEnabled';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import areSetsEqual from '@src/utils/setsEqual';
import Footer from './Footer';
import SelectionListHeader from './ListHeader';
import type {DataDetailsType, ListItem, SelectionListProps} from './types';

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

function SelectionListSingle<TItem extends ListItem>({
    data,
    ref,
    ListItem,
    onSelectRow,
    onSelectAll,
    onCheckboxPress,
    confirmButton,
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
    alternateNumberOfSupportedLines,
    listItemTitleStyles,
    headerMessage,
    initiallyFocusedItemKey,
    shouldScrollToFocusedIndex = true,
    shouldDebounceScrolling = false,
    isSmallScreenWidth,
    shouldClearInputOnSelect,
    shouldUpdateFocusedIndex = false,
    customListHeader,
    onScrollBeginDrag,
}: SelectionListProps<TItem>) {
    const styles = useThemeStyles();
    const initialFocusedIndex = useMemo(() => data.findIndex((i) => i.keyForList === initiallyFocusedItemKey), [data, initiallyFocusedItemKey]);

    const [currentPage, setCurrentPage] = useState(() => getStartingPage(initialFocusedIndex));
    const [itemsToHighlight, setItemsToHighlight] = useState<Set<string> | null>(null);
    const incrementPage = () => setCurrentPage((prev) => prev + 1);
    const scrollEnabled = useScrollEnabled();
    const {singleExecution} = useSingleExecution();
    const {translate} = useLocalize();
    const isFocused = useIsFocused();
    const innerTextInputRef = useRef<RNTextInput | null>(null);
    const hasKeyBeenPressed = useRef(false);
    const listRef = useRef<FlashListRef<TItem>>(null);
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

    function setHasKeyBeenPressed() {
        if (hasKeyBeenPressed.current) {
            return;
        }
        hasKeyBeenPressed.current = true;
    }

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

    const headerMessageContent = () =>
        (!isLoadingNewOptions || headerMessage !== translate('common.noResultsFound') || (data.length === 0 && !showLoadingPlaceholder)) &&
        !!headerMessage && (
            <View style={[styles.ph5, styles.pb5]}>
                <Text style={[styles.textLabel, styles.colorMuted, styles.minHeight5]}>{headerMessage}</Text>
            </View>
        );

    const renderItem: ListRenderItem<TItem> = ({item, index}: ListRenderItemInfo<TItem>) => {
        const isDisabled = item.isDisabled;
        const selected = isItemSelected(item);
        const isItemFocused = (!isDisabled || selected) && focusedIndex === index;
        const isItemHighlighted = !!itemsToHighlight?.has(item.keyForList ?? '');

        return (
            <BaseSelectionListItemRenderer
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
    const ShowMoreButtonInstance = useMemo(
        () =>
            data.length > PAGE_SIZE * currentPage ? (
                <ShowMoreButton
                    containerStyle={[styles.mt2, styles.mb5]}
                    currentCount={PAGE_SIZE * currentPage}
                    totalCount={data.length}
                    onPress={incrementPage}
                />
            ) : null,
        [currentPage, data.length, styles.mb5, styles.mt2],
    );

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

    useImperativeHandle(ref, () => ({scrollAndHighlightItem, scrollToIndex}), [scrollAndHighlightItem, scrollToIndex]);
    return (
        <View style={styles.flex1}>
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
                        keyExtractor={(item, index) => `${item.keyForList}-${index}`}
                        ListFooterComponent={listFooterContent ?? ShowMoreButtonInstance}
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
                confirmButton={confirmButton}
                addBottomSafeAreaPadding={addBottomSafeAreaPadding}
            />
        </View>
    );
}

SelectionListSingle.displayName = 'SelectionListSingle';

export default SelectionListSingle;
