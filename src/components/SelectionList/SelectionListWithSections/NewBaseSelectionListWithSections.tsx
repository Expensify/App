import {useIsFocused} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import type {FlashListRef, ListRenderItemInfo} from '@shopify/flash-list';
import React, {useCallback, useImperativeHandle, useMemo, useRef} from 'react';
import type {TextInputKeyPressEvent} from 'react-native';
import {View} from 'react-native';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import Footer from '@components/SelectionList/components/Footer';
import TextInput from '@components/SelectionList/components/TextInput';
import ListItemRenderer from '@components/SelectionList/ListItem/ListItemRenderer';
import type {ButtonOrCheckBoxRoles} from '@components/SelectionList/types';
import Text from '@components/Text';
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
import type {FlattenedItem, ListItem, SectionHeader, SectionListItem, SelectionListWithSectionsProps} from './types';
import useSelectedItemFocusSync from '../hooks/useSelectedItemFocusSync';
import useSearchFocusSync from '../hooks/useSearchFocusSync';

function getItemType<TItem extends ListItem>(item: FlattenedItem<TItem>): 'header' | 'row' {
    return item?.type ?? 'row';
}

function isItemSelected<TItem extends ListItem>(item: TItem): boolean {
    return item?.isSelected ?? false;
}

function NewBaseSelectionListWithSections<TItem extends ListItem>({
    sections,
    ListItem,
    onSelectRow,
    ref,
    canSelectMultiple = false,
    initiallyFocusedOptionKey,
    customHeaderContent,
    footerContent,
    showLoadingPlaceholder = false,
    rightHandSideComponent,
    shouldShowTooltips = true,
    onDismissError,
    shouldPreventDefaultFocusOnSelectRow = false,
    shouldSingleExecuteRowSelect = false,
    textInputOptions,
    isLoadingNewOptions,
    shouldShowTextInput,
    listEmptyContent,
    showListEmptyContent = true,
    shouldScrollToFocusedIndex = true,
    shouldDebounceScrolling = false,
    style,
    onScrollBeginDrag,
    addBottomSafeAreaPadding,
    disableKeyboardShortcuts = false,
    shouldStopPropagation = false,
    onEndReached,
    onEndReachedThreshold,
    disableMaintainingScrollPosition = false,
    shouldUpdateFocusedIndex = false,
    shouldIgnoreFocus = false,
}: SelectionListWithSectionsProps<TItem>) {
    const styles = useThemeStyles();
    const isFocused = useIsFocused();
    const scrollEnabled = useScrollEnabled();
    const {singleExecution} = useSingleExecution();
    const listRef = useRef<FlashListRef<FlattenedItem<TItem>> | null>(null);
    const innerTextInputRef = useRef<BaseTextInputRef | null>(null);
    const isTextInputFocusedRef = useRef<boolean>(false);
    const hasKeyBeenPressed = useRef(false);
    const activeElementRole = useActiveElementRole();
    const {isKeyboardShown} = useKeyboardState();
    const {safeAreaPaddingBottomStyle} = useSafeAreaPaddings();

    const paddingBottomStyle = useMemo(() => !isKeyboardShown && safeAreaPaddingBottomStyle, [isKeyboardShown, safeAreaPaddingBottomStyle]);
    const hasFooter = !!footerContent;

    const {flattenedData, headerIndices, itemsOnly, selectedItems} = useMemo(() => {
        const data: Array<FlattenedItem<TItem>> = [];
        const selectedOptions: TItem[] = [];
        const disabledArrowKeyIndexes: number[] = [];
        const headers: number[] = [];
        const items: Array<FlattenedItem<TItem>> = [];
        let itemIndex = 0;

        for (const section of sections) {
            if (section.title) {
                headers.push(data.length);
                data.push({
                    type: 'header',
                    title: section.title,
                    keyForList: `header-${section.title}`,
                    isDisabled: true,
                });
            }

            for (const item of section.data ?? []) {
                const itemWithIndex = {
                    ...item,
                    type: 'row',
                    flatIndex: itemIndex,
                } as SectionListItem<TItem>;
                data.push(itemWithIndex);
                items.push(itemWithIndex);

                if (itemWithIndex.isSelected) {
                    selectedOptions.push(itemWithIndex);
                }

                const isItemDisabled = section.isDisabled === true || (!!item?.isDisabled && !isItemSelected(item));
                if (isItemDisabled) {
                    disabledArrowKeyIndexes.push(itemIndex);
                }

                itemIndex++;
            }
        }

        return {flattenedData: data, headerIndices: headers, itemsOnly: items, selectedItems: selectedOptions};
    }, [sections]);

    const initialFocusedIndex = useMemo(() => itemsOnly.findIndex((item) => item.keyForList === initiallyFocusedOptionKey), [itemsOnly, initiallyFocusedOptionKey]);

    const setHasKeyBeenPressed = useCallback(() => {
        if (hasKeyBeenPressed.current) {
            return;
        }
        hasKeyBeenPressed.current = true;
    }, []);

    const scrollToIndex = useCallback(
        (index: number) => {
            // Bounds check: ensure index is valid for current data
            if (index < 0 || index >= itemsOnly.length) {
                return;
            }
            const item = itemsOnly.at(index);
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
        [itemsOnly],
    );

    const debouncedScrollToIndex = useDebounce(scrollToIndex, CONST.TIMING.LIST_SCROLLING_DEBOUNCE_TIME, {leading: true, trailing: true});

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex,
        maxIndex: itemsOnly.length - 1,
        disabledIndexes: headerIndices,
        isActive: isFocused,
        onFocusedIndexChange: (index: number) => {
            if (!shouldScrollToFocusedIndex) {
                return;
            }

            (shouldDebounceScrolling ? debouncedScrollToIndex : scrollToIndex)(index);
        },
        // eslint-disable-next-line react-hooks/refs
        ...(!hasKeyBeenPressed.current && {setHasKeyBeenPressed}),
        isFocused,
    });

    const focusedItem = useMemo(() => {
        if (focusedIndex < 0 || focusedIndex >= flattenedData.length) {
            return;
        }
        const item = flattenedData.at(focusedIndex);
        if (!item || (item.isDisabled && !isItemSelected(item))) {
            return;
        }
        return item as TItem;
    }, [flattenedData, focusedIndex]);

    const selectRow = useCallback(
        (item: TItem, indexToFocus?: number) => {
            if (!isFocused) {
                return;
            }
            if (canSelectMultiple) {
                if (shouldShowTextInput) {
                    textInputOptions?.onChangeText?.('');
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
        [isFocused, canSelectMultiple, shouldUpdateFocusedIndex, onSelectRow, shouldShowTextInput, shouldPreventDefaultFocusOnSelectRow, textInputOptions, setFocusedIndex],
    );

    const selectFocusedItem = () => {
        if (!focusedItem) {
            return;
        }
        selectRow(focusedItem);
    };

    const focusTextInput = useCallback(() => {
        innerTextInputRef.current?.focus();
    }, []);

    useImperativeHandle(
        ref,
        () => ({
            focusTextInput,
        }),
        [focusTextInput],
    );

    // Disable `Enter` shortcut if the active element is a button or checkbox
    const disableEnterShortcut = activeElementRole && [CONST.ROLE.BUTTON, CONST.ROLE.CHECKBOX].includes(activeElementRole as ButtonOrCheckBoxRoles);

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER || CONST.KEYBOARD_SHORTCUTS.CTRL_ENTER, selectFocusedItem, {
        captureOnInputs: true,
        shouldBubble: !focusedItem,
        shouldStopPropagation,
        isActive: !disableKeyboardShortcuts && isFocused && focusedIndex >= 0 && !disableEnterShortcut,
    });

    const textInputKeyPress = useCallback((event: TextInputKeyPressEvent) => {
        const key = event.nativeEvent.key;
        if (key === CONST.KEYBOARD_SHORTCUTS.TAB.shortcutKey) {
            focusedItemRef?.focus();
        }
    }, []);

    useSelectedItemFocusSync({
        items: itemsOnly,
        initiallyFocusedItemKey: initiallyFocusedOptionKey,
        isItemSelected,
        focusedIndex,
        searchValue: textInputOptions?.value,
        setFocusedIndex,
    });

    useSearchFocusSync({
        searchValue: textInputOptions?.value,
        items: itemsOnly,
        selectedOptionsCount: selectedItems.length,
        isItemSelected,
        canSelectMultiple,
        shouldUpdateFocusedIndex,
        scrollToIndex,
        setFocusedIndex,
    });

    const textInputComponent = () => {
        return (
            <TextInput
                ref={innerTextInputRef}
                focusTextInput={focusTextInput}
                shouldShowTextInput={shouldShowTextInput}
                onKeyPress={textInputKeyPress}
                accessibilityLabel={textInputOptions?.label}
                options={textInputOptions}
                onSubmit={selectFocusedItem}
                dataLength={flattenedData.length}
                isLoading={isLoadingNewOptions}
                onFocusChange={(v: boolean) => (isTextInputFocusedRef.current = v)}
                showLoadingPlaceholder={showLoadingPlaceholder}
                isLoadingNewOptions={isLoadingNewOptions}
            />
        );
    };

    const renderListEmptyContent = () => {
        if (showLoadingPlaceholder) {
            return <OptionsListSkeletonView />;
        }
        if (showListEmptyContent) {
            return listEmptyContent;
        }
    };

    const renderItem = useCallback(
        ({item, index}: ListRenderItemInfo<FlattenedItem<TItem>>) => {
            if (!item) {
                return null;
            }
            if (getItemType(item) === 'header') {
                return (
                    <View style={[styles.optionsListSectionHeader, styles.justifyContentCenter]}>
                        <Text style={[styles.ph5, styles.textLabelSupporting]}>{(item as SectionHeader).title}</Text>
                    </View>
                );
            }

            const flatIndex = (item as SectionListItem<TItem>).flatIndex ?? index;
            const isItemFocused = flatIndex === focusedIndex;
            const isDisabled = !!item.isDisabled;

            return (
                <ListItemRenderer
                    ListItem={ListItem}
                    selectRow={selectRow}
                    showTooltip={shouldShowTooltips}
                    item={item as TItem}
                    index={index}
                    normalizedIndex={flatIndex}
                    isFocused={isItemFocused}
                    isDisabled={isDisabled}
                    canSelectMultiple={canSelectMultiple}
                    shouldSingleExecuteRowSelect={shouldSingleExecuteRowSelect}
                    onDismissError={onDismissError}
                    shouldPreventDefaultFocusOnSelectRow={shouldPreventDefaultFocusOnSelectRow}
                    rightHandSideComponent={rightHandSideComponent}
                    setFocusedIndex={setFocusedIndex}
                    singleExecution={singleExecution}
                    shouldSyncFocus={!isTextInputFocusedRef.current && hasKeyBeenPressed.current}
                    shouldHighlightSelectedItem
                    shouldIgnoreFocus={shouldIgnoreFocus}
                    wrapperStyle={style?.listItemWrapperStyle}
                    titleStyles={style?.listItemTitleStyles}
                />
            );
        },
        [
            focusedIndex,
            ListItem,
            selectRow,
            shouldShowTooltips,
            canSelectMultiple,
            shouldSingleExecuteRowSelect,
            onDismissError,
            shouldPreventDefaultFocusOnSelectRow,
            rightHandSideComponent,
            setFocusedIndex,
            singleExecution,
            shouldIgnoreFocus,
            style?.listItemWrapperStyle,
            style?.listItemTitleStyles,
            styles.optionsListSectionHeader,
            styles.justifyContentCenter,
            styles.ph5,
            styles.textLabelSupporting,
        ],
    );

    return (
        <View style={[styles.flex1, addBottomSafeAreaPadding && !hasFooter && paddingBottomStyle, style?.containerStyle]}>
            {textInputComponent()}
            {itemsOnly.length === 0 && (showLoadingPlaceholder || showListEmptyContent) ? (
                renderListEmptyContent()
            ) : (
                <>
                    {customHeaderContent}
                    <FlashList
                        data={flattenedData}
                        renderItem={renderItem}
                        ref={listRef}
                        extraData={itemsOnly.length}
                        getItemType={getItemType}
                        initialScrollIndex={initialFocusedIndex}
                        keyExtractor={(item) => item.keyForList}
                        onEndReached={onEndReached}
                        onEndReachedThreshold={onEndReachedThreshold}
                        onScrollBeginDrag={onScrollBeginDrag}
                        scrollEnabled={scrollEnabled}
                        indicatorStyle="white"
                        showsVerticalScrollIndicator
                        keyboardShouldPersistTaps="always"
                        style={style?.listStyle}
                        maintainVisibleContentPosition={{disabled: disableMaintainingScrollPosition}}
                    />
                </>
            )}
            <Footer<TItem>
                footerContent={footerContent}
                addBottomSafeAreaPadding={addBottomSafeAreaPadding}
            />
        </View>
    );
}

export default NewBaseSelectionListWithSections;
