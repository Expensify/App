import {useIsFocused} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import type {FlashListRef, ListRenderItemInfo} from '@shopify/flash-list';
import React, {useCallback, useImperativeHandle, useRef} from 'react';
import type {TextInputKeyPressEvent} from 'react-native';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import Footer from '@components/SelectionList/components/Footer';
import TextInput from '@components/SelectionList/components/TextInput';
import useFlattenedSections, {isItemSelected, shouldTreatItemAsDisabled} from '@components/SelectionList/hooks/useFlattenedSections';
import useSearchFocusSync from '@components/SelectionList/hooks/useSearchFocusSync';
import useSelectedItemFocusSync from '@components/SelectionList/hooks/useSelectedItemFocusSync';
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
import Log from '@libs/Log';
import CONST from '@src/CONST';
import type {FlattenedItem, ListItem, SectionHeader, SelectionListWithSectionsProps} from './types';

function getItemType<TItem extends ListItem>(item: FlattenedItem<TItem>): ValueOf<typeof CONST.SECTION_LIST_ITEM_TYPE> {
    return item?.type ?? CONST.SECTION_LIST_ITEM_TYPE.ROW;
}

function BaseSelectionListWithSections<TItem extends ListItem>({
    sections,
    ref,
    ListItem,
    textInputOptions,
    initiallyFocusedItemKey,
    onSelectRow,
    onDismissError,
    onScrollBeginDrag,
    onEndReached,
    onEndReachedThreshold,
    customHeaderContent,
    rightHandSideComponent,
    listEmptyContent,
    footerContent,
    style,
    addBottomSafeAreaPadding,
    isLoadingNewOptions,
    canSelectMultiple = false,
    showLoadingPlaceholder = false,
    showListEmptyContent = true,
    shouldShowTooltips = true,
    disableKeyboardShortcuts = false,
    disableMaintainingScrollPosition = false,
    shouldShowTextInput,
    shouldIgnoreFocus = false,
    shouldStopPropagation = false,
    shouldDebounceScrolling = false,
    shouldUpdateFocusedIndex = false,
    shouldScrollToFocusedIndex = true,
    shouldSingleExecuteRowSelect = false,
    shouldPreventDefaultFocusOnSelectRow = false,
}: SelectionListWithSectionsProps<TItem>) {
    const styles = useThemeStyles();
    const isScreenFocused = useIsFocused();
    const scrollEnabled = useScrollEnabled();
    const {singleExecution} = useSingleExecution();
    const listRef = useRef<FlashListRef<FlattenedItem<TItem>> | null>(null);
    const innerTextInputRef = useRef<BaseTextInputRef | null>(null);
    const isTextInputFocusedRef = useRef<boolean>(false);
    const hasKeyBeenPressed = useRef(false);
    const activeElementRole = useActiveElementRole();
    const {isKeyboardShown} = useKeyboardState();
    const {safeAreaPaddingBottomStyle} = useSafeAreaPaddings();

    const paddingBottomStyle = !isKeyboardShown && !footerContent && safeAreaPaddingBottomStyle;

    const {flattenedData, disabledIndexes, itemsCount, selectedItems, initialFocusedIndex, firstFocusableIndex} = useFlattenedSections(sections, initiallyFocusedItemKey);

    const setHasKeyBeenPressed = () => {
        if (hasKeyBeenPressed.current) {
            return;
        }
        hasKeyBeenPressed.current = true;
    };

    const scrollToIndex = (index: number) => {
        if (index < 0 || index >= flattenedData.length || !listRef.current) {
            return;
        }
        const item = flattenedData.at(index);
        if (!item) {
            return;
        }
        try {
            listRef.current.scrollToIndex({index});
        } catch (error) {
            // FlashList may throw if layout for this index doesn't exist yet
            // This can happen when data changes rapidly (e.g., during search filtering)
            // The layout will be computed on next render, so we can safely ignore this
            Log.warn('SelectionListWithSections: error scrolling to index', {error});
        }
    };

    const debouncedScrollToIndex = useDebounce(scrollToIndex, CONST.TIMING.LIST_SCROLLING_DEBOUNCE_TIME, {leading: true, trailing: true});

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex,
        maxIndex: flattenedData.length - 1,
        disabledIndexes,
        isActive: isScreenFocused && itemsCount > 0,
        onFocusedIndexChange: (index: number) => {
            if (!shouldScrollToFocusedIndex) {
                return;
            }

            (shouldDebounceScrolling ? debouncedScrollToIndex : scrollToIndex)(index);
        },
        setHasKeyBeenPressed,
        isFocused: isScreenFocused,
    });

    const getFocusedItem = (): TItem | undefined => {
        if (focusedIndex < 0 || focusedIndex >= flattenedData.length) {
            return;
        }
        const item = flattenedData.at(focusedIndex);
        if (!item || shouldTreatItemAsDisabled(item)) {
            return;
        }
        return item as TItem;
    };

    const selectRow = (item: TItem, indexToFocus?: number) => {
        if (!isScreenFocused) {
            return;
        }
        if (canSelectMultiple) {
            if (sections.length > 1 && !isItemSelected(item)) {
                scrollToIndex(0);
            }

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
    };

    const selectFocusedItem = () => {
        const focusedItem = getFocusedItem();
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
        shouldBubble: !getFocusedItem(),
        shouldStopPropagation,
        isActive: !disableKeyboardShortcuts && isScreenFocused && focusedIndex >= 0 && !disableEnterShortcut,
    });

    const textInputKeyPress = (event: TextInputKeyPressEvent) => {
        const key = event.nativeEvent.key;
        if (key === CONST.KEYBOARD_SHORTCUTS.TAB.shortcutKey) {
            focusedItemRef?.focus();
        }
    };

    useSelectedItemFocusSync({
        data: flattenedData,
        initiallyFocusedItemKey,
        isItemSelected,
        focusedIndex,
        searchValue: textInputOptions?.value,
        setFocusedIndex,
    });

    useSearchFocusSync({
        searchValue: textInputOptions?.value,
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

    const renderItem = ({item, index}: ListRenderItemInfo<FlattenedItem<TItem>>) => {
        if (!item) {
            return null;
        }

        switch (getItemType(item)) {
            case CONST.SECTION_LIST_ITEM_TYPE.HEADER:
                return (
                    <View style={[styles.optionsListSectionHeader, styles.justifyContentCenter]}>
                        <Text style={[styles.ph5, styles.textLabelSupporting]}>{(item as SectionHeader).title}</Text>
                    </View>
                );
            case CONST.SECTION_LIST_ITEM_TYPE.ROW: {
                const isItemFocused = index === focusedIndex;
                const isDisabled = !!item.isDisabled;

                return (
                    <ListItemRenderer
                        ListItem={ListItem}
                        selectRow={selectRow}
                        showTooltip={shouldShowTooltips}
                        item={item as TItem}
                        index={index}
                        normalizedIndex={index}
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
            }
            default:
                return null;
        }
    };

    return (
        <View style={[styles.flex1, addBottomSafeAreaPadding && paddingBottomStyle, style?.containerStyle]}>
            {textInputComponent()}
            {itemsCount === 0 && (showLoadingPlaceholder || showListEmptyContent) ? (
                renderListEmptyContent()
            ) : (
                <>
                    {customHeaderContent}
                    <FlashList
                        data={flattenedData}
                        renderItem={renderItem}
                        ref={listRef}
                        extraData={flattenedData.length}
                        getItemType={getItemType}
                        initialScrollIndex={initialFocusedIndex}
                        keyExtractor={(item) => ('flatListKey' in item ? item.flatListKey : item.keyForList)}
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
            {!!footerContent && (
                <Footer<TItem>
                    footerContent={footerContent}
                    addBottomSafeAreaPadding={addBottomSafeAreaPadding}
                />
            )}
        </View>
    );
}

export default BaseSelectionListWithSections;
