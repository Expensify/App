import {useIsFocused} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import type {FlashListRef, ListRenderItem, ListRenderItemInfo} from '@shopify/flash-list';
import {deepEqual} from 'fast-equals';
import React, {useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import type {NativeSyntheticEvent, TextInputKeyPressEventData, ViewStyle} from 'react-native';
import {View} from 'react-native';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useActiveElementRole from '@hooks/useActiveElementRole';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useDebounce from '@hooks/useDebounce';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
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
    confirmButtonConfig,
    customListHeader,
    customListHeaderContent,
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
    disableKeyboardShortcuts = false,
    shouldUseUserSkeletonView,
    shouldShowTooltips = true,
    shouldIgnoreFocus = false,
    shouldStopPropagation = false,
    shouldScrollToFocusedIndex = true,
    shouldDebounceScrolling = false,
    shouldUpdateFocusedIndex = false,
    shouldSingleExecuteRowSelect = false,
    shouldPreventDefaultFocusOnSelectRow = false,
    shouldShowTextInput = !!textInputOptions,
}: SelectionListProps<TItem>) {
    const styles = useThemeStyles();
    const isFocused = useIsFocused();
    const scrollEnabled = useScrollEnabled();
    const {singleExecution} = useSingleExecution();
    const activeElementRole = useActiveElementRole();

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

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
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
            if (confirmButtonConfig?.onConfirm) {
                confirmButtonConfig?.onConfirm(e, focusedOption);
                return;
            }
            selectFocusedOption();
        },
        {
            captureOnInputs: true,
            shouldBubble: !focusedOption,
            isActive: !disableKeyboardShortcuts && isFocused && !confirmButtonConfig?.isDisabled,
        },
    );

    const textInputKeyPress = useCallback((event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
        const key = event.nativeEvent.key;
        if (key === CONST.KEYBOARD_SHORTCUTS.TAB.shortcutKey) {
            focusedItemRef?.focus();
        }
    }, []);

    const handleTextInputRef = (element: BaseTextInputRef | null) => {
        innerTextInputRef.current = element;

        const textInputRef = textInputOptions?.ref;
        if (!textInputRef) {
            return;
        }

        if (typeof textInputRef === 'function') {
            textInputRef(element);
        } else {
            // eslint-disable-next-line react-compiler/react-compiler
            textInputRef.current = element;
        }
    };

    const textInputComponent = ({shouldBeInsideList}: {shouldBeInsideList?: boolean}) => {
        if (shouldBeInsideList !== (textInputOptions?.shouldBeInsideList ?? false)) {
            return null;
        }

        return (
            <TextInput
                shouldShowTextInput={shouldShowTextInput}
                onKeyPress={textInputKeyPress}
                accessibilityLabel={textInputOptions?.label}
                ref={handleTextInputRef}
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

    useImperativeHandle(ref, () => ({scrollAndHighlightItem, scrollToIndex}), [scrollAndHighlightItem, scrollToIndex]);
    return (
        <View style={styles.flex1}>
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
                        style={listStyle as ViewStyle}
                        initialScrollIndex={initialFocusedIndex}
                        onScrollBeginDrag={onScrollBeginDrag}
                        ListHeaderComponent={
                            <>
                                {customListHeaderContent}
                                {textInputComponent({shouldBeInsideList: true})}
                            </>
                        }
                    />
                </>
            )}

            <Footer<TItem>
                footerContent={footerContent}
                confirmButtonConfig={confirmButtonConfig}
                addBottomSafeAreaPadding={addBottomSafeAreaPadding}
            />
        </View>
    );
}

BaseSelectionList.displayName = 'BaseSelectionList';

export default BaseSelectionList;
