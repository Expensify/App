import {useIsFocused} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import type {ListRenderItem, ListRenderItemInfo} from '@shopify/flash-list';
import lodashDebounce from 'lodash/debounce';
import React, {forwardRef, useCallback, useMemo, useRef, useState} from 'react';
import type {ReactElement} from 'react';
import type {GestureResponderEvent, InputModeOptions, NativeSyntheticEvent, TextInput as RNTextInput, StyleProp, TextInputKeyPressEventData, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import BaseSelectionListItemRenderer from '@components/SelectionList/BaseSelectionListItemRenderer';
import ShowMoreButton from '@components/ShowMoreButton';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useLocalize from '@hooks/useLocalize';
import useScrollEnabled from '@hooks/useScrollEnabled';
import useSingleExecution from '@hooks/useSingleExecution';
import {focusedItemRef} from '@hooks/useSyncFocus/useSyncFocusImplementation';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {ListItem, ValidListItem} from './types';

type SelectionListSingleProps<TItem extends ListItem> = {
    data: TItem[] | typeof CONST.EMPTY_ARRAY;
    ListItem: ValidListItem;
    onSelectRow: (item: TItem) => void;
    onCheckboxPress?: (item: TItem) => void;
    showLoadingPlaceholder?: boolean;
    showListEmptyContent?: boolean;
    shouldUseUserSkeletonView?: boolean;
    listEmptyContent?: React.JSX.Element | null | undefined;
    addBottomSafeAreaPadding?: boolean;
    footerContent?: React.ReactNode;
    onConfirm?: ((e?: GestureResponderEvent | KeyboardEvent | undefined, option?: TItem | undefined) => void) | undefined;
    confirmButtonStyle?: StyleProp<ViewStyle>;
    confirmButtonText?: string;
    isConfirmButtonDisabled?: boolean;
    listFooterContent?: React.JSX.Element | null | undefined;
    showScrollIndicator?: boolean;
    onEndReached?: () => void;
    onEndReachedThreshold?: number;
    listStyle?: StyleProp<ViewStyle>;
    isLoadingNewOptions?: boolean;
    textInputLabel?: string;
    textInputValue?: string;
    onChangeText?: (text: string) => void;
    shouldShowTextInput?: boolean;
    textInputOptions?: {
        textInputHint?: string;
        textInputPlaceholder?: string;
        textInputMaxLength?: number;
        inputMode?: InputModeOptions;
        textInputErrorText?: string;
    };
    canSelectMultiple?: boolean;
    shouldShowTooltips?: boolean;
    selectedItems?: string[];
    isSelected?: (item: TItem) => boolean;
    shouldSingleExecuteRowSelect?: boolean;
    shouldPreventDefaultFocusOnSelectRow?: boolean;
    rightHandSideComponent?: ((item: TItem, isFocused?: boolean) => ReactElement | null | undefined) | ReactElement | null;
    shouldIgnoreFocus?: boolean;
    listItemWrapperStyle?: StyleProp<ViewStyle>;
    isRowMultilineSupported?: boolean;
    alternateTextNumberOfSupportedLines?: number;
    listItemTitleStyles?: StyleProp<TextStyle>;
    headerMessage?: string;
    initiallyFocusedItemKey?: string;
    shouldScrollToFocusedIndex?: boolean;
    shouldDebounceScrolling?: boolean;
    isSmallScreenWidth?: boolean;
    shouldClearInputOnSelect?: boolean;
    shouldUpdateFocusedIndex?: boolean;
};

function SelectionListSingle<TItem extends ListItem>({
    data,
    ListItem,
    onConfirm,
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
    textInputLabel,
    textInputValue,
    textInputOptions,
    onChangeText,
    shouldShowTextInput = !!textInputLabel,
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
}: SelectionListSingleProps<TItem>) {
    const styles = useThemeStyles();
    const [currentPage, setCurrentPage] = useState(1);
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

    const isItemSelected = useCallback(
        (item: TItem) => item.isSelected ?? ((isSelected?.(item) ?? selectedItems.includes(item.keyForList ?? '')) && canSelectMultiple),
        [isSelected, selectedItems, canSelectMultiple],
    );

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

    const setHasKeyBeenPressed = useCallback(() => {
        if (hasKeyBeenPressed.current) {
            return;
        }
        hasKeyBeenPressed.current = true;
    }, []);

    // eslint-disable-next-line react-compiler/react-compiler
    const debouncedScrollToIndex = useMemo(() => lodashDebounce(scrollToIndex, CONST.TIMING.LIST_SCROLLING_DEBOUNCE_TIME, {leading: true, trailing: true}), [scrollToIndex]);

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex: data.findIndex((item) => item.keyForList === initiallyFocusedItemKey),
        maxIndex: Math.min(data.length - 1, CONST.MAX_SELECTION_LIST_PAGE_LENGTH * currentPage - 1),
        disabledIndexes: data
            .filter((item) => !!item)
            .filter((item) => !!item.isDisabledCheckbox || (item?.isDisabled && !isItemSelected(item)))
            .map((item) => item.index)
            .filter((index) => index !== undefined),
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
            // In single-selection lists we don't care about updating the focused index, because the list is closed after selecting an item
            if (canSelectMultiple) {
                if (shouldShowTextInput && shouldClearInputOnSelect) {
                    onChangeText?.('');
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
            onChangeText,
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

    const renderItem: ListRenderItem<TItem> = useCallback(
        ({item, index}: ListRenderItemInfo<TItem>) => {
            const isDisabled = item.isDisabled;
            const selected = isItemSelected(item);
            const isItemFocused = (!isDisabled || selected) && focusedIndex === index;

            return (
                <View>
                    <BaseSelectionListItemRenderer
                        ListItem={ListItem}
                        item={{
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

    const renderInput = useCallback(() => {
        return (
            <View style={[styles.ph5, styles.pb3]}>
                <TextInput
                    onKeyPress={textInputKeyPress}
                    ref={(element) => {
                        innerTextInputRef.current = element as RNTextInput;
                    }}
                    onFocus={() => (isTextInputFocusedRef.current = true)}
                    onBlur={() => (isTextInputFocusedRef.current = false)}
                    label={textInputLabel}
                    accessibilityLabel={textInputLabel}
                    hint={textInputOptions?.textInputHint}
                    role={CONST.ROLE.PRESENTATION}
                    value={textInputValue}
                    placeholder={textInputOptions?.textInputPlaceholder}
                    maxLength={textInputOptions?.textInputMaxLength}
                    onChangeText={onChangeText}
                    inputMode={textInputOptions?.inputMode}
                    selectTextOnFocus
                    spellCheck={false}
                    // onSubmitEditing={selectFocusedOption}
                    submitBehavior={data.length ? 'blurAndSubmit' : 'submit'}
                    isLoading={isLoadingNewOptions}
                    testID="selection-list-text-input"
                    errorText={textInputOptions?.textInputErrorText}
                    shouldInterceptSwipe={false}
                />
            </View>
        );
    }, [
        styles.ph5,
        styles.pb3,
        textInputKeyPress,
        textInputLabel,
        textInputOptions?.textInputHint,
        textInputOptions?.textInputPlaceholder,
        textInputOptions?.textInputMaxLength,
        textInputOptions?.inputMode,
        textInputOptions?.textInputErrorText,
        textInputValue,
        onChangeText,
        data.length,
        isLoadingNewOptions,
    ]);

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

    return (
        <View style={styles.flex1}>
            {shouldShowTextInput && renderInput()}
            {headerMessageContent()}
            {data.length === 0 ? (
                renderListEmptyContent()
            ) : (
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

export default forwardRef(SelectionListSingle);
