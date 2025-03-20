import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import lodashDebounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import type {LayoutChangeEvent, SectionList as RNSectionList, TextInput as RNTextInput, SectionListData, SectionListRenderItemInfo} from 'react-native';
import {View} from 'react-native';
import Button from '@components/Button';
import Checkbox from '@components/Checkbox';
import FixedFooter from '@components/FixedFooter';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import {PressableWithFeedback} from '@components/Pressable';
import SectionList from '@components/SectionList';
import ShowMoreButton from '@components/ShowMoreButton';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useActiveElementRole from '@hooks/useActiveElementRole';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useScrollEnabled from '@hooks/useScrollEnabled';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import getSectionsWithIndexOffset from '@libs/getSectionsWithIndexOffset';
import {addKeyDownPressListener, removeKeyDownPressListener} from '@libs/KeyboardShortcut/KeyDownPressListener';
import Log from '@libs/Log';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import arraysEqual from '@src/utils/arraysEqual';
import BaseSelectionListItemRenderer from './BaseSelectionListItemRenderer';
import FocusAwareCellRendererComponent from './FocusAwareCellRendererComponent';
import type {ButtonOrCheckBoxRoles, FlattenedSectionsReturn, ListItem, SectionListDataType, SectionWithIndexOffset, SelectionListHandle, SelectionListProps} from './types';

const getDefaultItemHeight = () => variables.optionRowHeight;

function BaseSelectionList<TItem extends ListItem>(
    {
        sections,
        ListItem,
        shouldUseUserSkeletonView,
        canSelectMultiple = false,
        onSelectRow,
        shouldSingleExecuteRowSelect = false,
        onCheckboxPress,
        onSelectAll,
        onDismissError,
        getItemHeight = getDefaultItemHeight,
        textInputLabel = '',
        textInputPlaceholder = '',
        textInputValue = '',
        textInputHint,
        textInputMaxLength,
        inputMode = CONST.INPUT_MODE.TEXT,
        onChangeText,
        initiallyFocusedOptionKey = '',
        onScroll,
        onScrollBeginDrag,
        headerMessage = '',
        confirmButtonText = '',
        onConfirm,
        headerContent,
        footerContent,
        listFooterContent,
        listEmptyContent,
        showScrollIndicator = true,
        showLoadingPlaceholder = false,
        showConfirmButton = false,
        isConfirmButtonDisabled = false,
        shouldUseDefaultTheme = false,
        shouldPreventDefaultFocusOnSelectRow = false,
        containerStyle,
        sectionListStyle,
        disableKeyboardShortcuts = false,
        children,
        shouldStopPropagation = false,
        shouldPreventDefault = true,
        shouldShowTooltips = true,
        shouldUseDynamicMaxToRenderPerBatch = false,
        rightHandSideComponent,
        isLoadingNewOptions = false,
        onLayout,
        customListHeader,
        customListHeaderHeight = 0,
        listHeaderWrapperStyle,
        isRowMultilineSupported = false,
        isAlternateTextMultilineSupported = false,
        alternateTextNumberOfLines = 2,
        textInputRef,
        headerMessageStyle,
        confirmButtonStyles,
        shouldHideListOnInitialRender = true,
        textInputIconLeft,
        sectionTitleStyles,
        textInputAutoFocus = true,
        shouldShowTextInputAfterHeader = false,
        shouldShowHeaderMessageAfterHeader = false,
        includeSafeAreaPaddingBottom = true,
        shouldTextInputInterceptSwipe = false,
        listHeaderContent,
        onEndReached = () => {},
        onEndReachedThreshold,
        windowSize = 5,
        updateCellsBatchingPeriod = 50,
        removeClippedSubviews = true,
        shouldDelayFocus = true,
        onArrowFocus = () => {},
        shouldUpdateFocusedIndex = false,
        onLongPressRow,
        shouldShowTextInput = !!textInputLabel || !!textInputIconLeft,
        shouldShowListEmptyContent = true,
        listItemWrapperStyle,
        shouldIgnoreFocus = false,
        scrollEventThrottle,
        contentContainerStyle,
        shouldHighlightSelectedItem = false,
        shouldKeepFocusedItemAtTopOfViewableArea = false,
        shouldDebounceScrolling = false,
        shouldPreventActiveCellVirtualization = false,
        shouldScrollToFocusedIndex = true,
        onContentSizeChange,
        listItemTitleStyles,
        initialNumToRender = 12,
        listItemTitleContainerStyles,
        isScreenFocused = false,
        shouldSubscribeToArrowKeyEvents = true,
        addBottomSafeAreaPadding = false,
        addOfflineIndicatorBottomSafeAreaPadding = addBottomSafeAreaPadding,
    }: SelectionListProps<TItem>,
    ref: ForwardedRef<SelectionListHandle>,
) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const listRef = useRef<RNSectionList<TItem, SectionWithIndexOffset<TItem>>>(null);
    const innerTextInputRef = useRef<RNTextInput | null>(null);
    const hasKeyBeenPressed = useRef(false);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const shouldShowSelectAll = !!onSelectAll;
    const activeElementRole = useActiveElementRole();
    const isFocused = useIsFocused();
    const scrollEnabled = useScrollEnabled();
    const [maxToRenderPerBatch, setMaxToRenderPerBatch] = useState(shouldUseDynamicMaxToRenderPerBatch ? 0 : CONST.MAX_TO_RENDER_PER_BATCH.DEFAULT);
    const [isInitialSectionListRender, setIsInitialSectionListRender] = useState(true);
    const {isKeyboardShown} = useKeyboardState();
    const [itemsToHighlight, setItemsToHighlight] = useState<Set<string> | null>(null);
    const itemFocusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const isTextInputFocusedRef = useRef<boolean>(false);
    const {singleExecution} = useSingleExecution();
    const [itemHeights, setItemHeights] = useState<Record<string, number>>({});

    const onItemLayout = (event: LayoutChangeEvent, itemKey: string | null | undefined) => {
        if (!itemKey) {
            return;
        }

        const {height} = event.nativeEvent.layout;

        setItemHeights((prevHeights) => ({
            ...prevHeights,
            [itemKey]: height,
        }));
    };

    const incrementPage = () => setCurrentPage((prev) => prev + 1);

    /**
     * Iterates through the sections and items inside each section, and builds 4 arrays along the way:
     * - `allOptions`: Contains all the items in the list, flattened, regardless of section
     * - `disabledOptionsIndexes`: Contains the indexes of all the unselectable and disabled items in the list
     * - `disabledArrowKeyOptionsIndexes`: Contains the indexes of item that is not navigatable by the arrow key. The list is separated from disabledOptionsIndexes because unselectable item is still navigatable by the arrow key.
     * - `itemLayouts`: Contains the layout information for each item, header and footer in the list,
     * so we can calculate the position of any given item when scrolling programmatically
     */
    const flattenedSections = useMemo<FlattenedSectionsReturn<TItem>>(() => {
        const allOptions: TItem[] = [];

        const disabledOptionsIndexes: number[] = [];
        const disabledArrowKeyOptionsIndexes: number[] = [];
        let disabledIndex = 0;

        // need to account that the list might have some extra content above it
        let offset = customListHeader ? customListHeaderHeight : 0;
        const itemLayouts = [{length: 0, offset}];

        const selectedOptions: TItem[] = [];

        sections.forEach((section, sectionIndex) => {
            const sectionHeaderHeight = !!section.title || !!section.CustomSectionHeader ? variables.optionsListSectionHeaderHeight : 0;
            itemLayouts.push({length: sectionHeaderHeight, offset});
            offset += sectionHeaderHeight;

            section.data?.forEach((item, optionIndex) => {
                // Add item to the general flattened array
                allOptions.push({
                    ...item,
                    sectionIndex,
                    index: optionIndex,
                });

                // If disabled, add to the disabled indexes array
                const isItemDisabled = !!section.isDisabled || (item.isDisabled && !item.isSelected);
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                if (isItemDisabled || item.isDisabledCheckbox) {
                    disabledOptionsIndexes.push(disabledIndex);
                    if (isItemDisabled) {
                        disabledArrowKeyOptionsIndexes.push(disabledIndex);
                    }
                }
                disabledIndex += 1;

                // Account for the height of the item in getItemLayout
                const fullItemHeight = item?.keyForList && itemHeights[item.keyForList] ? itemHeights[item.keyForList] : getItemHeight(item);
                itemLayouts.push({length: fullItemHeight, offset});
                offset += fullItemHeight;

                if (item.isSelected && !selectedOptions.find((option) => option.keyForList === item.keyForList)) {
                    selectedOptions.push(item);
                }
            });

            // We're not rendering any section footer, but we need to push to the array
            // because React Native accounts for it in getItemLayout
            itemLayouts.push({length: 0, offset});
        });

        // We're not rendering the list footer, but we need to push to the array
        // because React Native accounts for it in getItemLayout
        itemLayouts.push({length: 0, offset});

        if (selectedOptions.length > 1 && !canSelectMultiple) {
            Log.alert(
                'Dev error: SelectionList - multiple items are selected but prop `canSelectMultiple` is false. Please enable `canSelectMultiple` or make your list have only 1 item with `isSelected: true`.',
            );
        }

        return {
            allOptions,
            selectedOptions,
            disabledOptionsIndexes,
            disabledArrowKeyOptionsIndexes,
            itemLayouts,
            allSelected: selectedOptions.length > 0 && selectedOptions.length === allOptions.length - disabledOptionsIndexes.length,
        };
    }, [canSelectMultiple, sections, customListHeader, customListHeaderHeight, itemHeights, getItemHeight]);

    const [slicedSections, ShowMoreButtonInstance] = useMemo(() => {
        let remainingOptionsLimit = CONST.MAX_SELECTION_LIST_PAGE_LENGTH * currentPage;
        const processedSections = getSectionsWithIndexOffset(
            sections.map((section) => {
                const data = !isEmpty(section.data) && remainingOptionsLimit > 0 ? section.data.slice(0, remainingOptionsLimit) : [];
                remainingOptionsLimit -= data.length;

                return {
                    ...section,
                    data,
                };
            }),
        );

        const shouldShowMoreButton = flattenedSections.allOptions.length > CONST.MAX_SELECTION_LIST_PAGE_LENGTH * currentPage;
        const showMoreButton = shouldShowMoreButton ? (
            <ShowMoreButton
                containerStyle={[styles.mt2, styles.mb5]}
                currentCount={CONST.MAX_SELECTION_LIST_PAGE_LENGTH * currentPage}
                totalCount={flattenedSections.allOptions.length}
                onPress={incrementPage}
            />
        ) : null;
        return [processedSections, showMoreButton];
        // we don't need to add styles here as they change
        // we don't need to add flattendedSections here as they will change along with sections
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [sections, currentPage]);

    // Disable `Enter` shortcut if the active element is a button or checkbox
    const disableEnterShortcut = activeElementRole && [CONST.ROLE.BUTTON, CONST.ROLE.CHECKBOX].includes(activeElementRole as ButtonOrCheckBoxRoles);

    /**
     * Scrolls to the desired item index in the section list
     *
     * @param index - the index of the item to scroll to
     * @param animated - whether to animate the scroll
     */
    const scrollToIndex = useCallback(
        (index: number, animated = true) => {
            const item = flattenedSections.allOptions.at(index);

            if (!listRef.current || !item || index === -1) {
                return;
            }

            const itemIndex = item.index ?? -1;
            const sectionIndex = item.sectionIndex ?? -1;
            let viewOffsetToKeepFocusedItemAtTopOfViewableArea = 0;

            // Since there are always two items above the focused item in viewable area, and items can grow beyond the screen size
            // in searchType chat, the focused item may move out of view. To prevent this, we will ensure that the focused item remains at
            // the top of the viewable area at all times by adjusting the viewOffset.
            if (shouldKeepFocusedItemAtTopOfViewableArea) {
                const firstPreviousItem = index > 0 ? flattenedSections.allOptions.at(index - 1) : undefined;
                const firstPreviousItemHeight = firstPreviousItem && firstPreviousItem.keyForList ? itemHeights[firstPreviousItem.keyForList] : 0;
                const secondPreviousItem = index > 1 ? flattenedSections.allOptions.at(index - 2) : undefined;
                const secondPreviousItemHeight = secondPreviousItem && secondPreviousItem?.keyForList ? itemHeights[secondPreviousItem.keyForList] : 0;
                viewOffsetToKeepFocusedItemAtTopOfViewableArea = firstPreviousItemHeight + secondPreviousItemHeight;
            }

            listRef.current.scrollToLocation({sectionIndex, itemIndex, animated, viewOffset: variables.contentHeaderHeight - viewOffsetToKeepFocusedItemAtTopOfViewableArea});
        },

        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [flattenedSections.allOptions],
    );

    const [disabledArrowKeyIndexes, setDisabledArrowKeyIndexes] = useState(flattenedSections.disabledArrowKeyOptionsIndexes);
    useEffect(() => {
        if (arraysEqual(disabledArrowKeyIndexes, flattenedSections.disabledArrowKeyOptionsIndexes)) {
            return;
        }

        setDisabledArrowKeyIndexes(flattenedSections.disabledArrowKeyOptionsIndexes);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [flattenedSections.disabledArrowKeyOptionsIndexes]);

    const debouncedScrollToIndex = useMemo(() => lodashDebounce(scrollToIndex, CONST.TIMING.LIST_SCROLLING_DEBOUNCE_TIME, {leading: true, trailing: true}), [scrollToIndex]);

    const setHasKeyBeenPressed = useCallback(() => {
        if (hasKeyBeenPressed.current) {
            return;
        }

        // We need to track whether a key has been pressed to enable focus syncing only if a key has been pressed.
        // This is to avoid the default behavior of web showing blue border on click of items after a page refresh.
        hasKeyBeenPressed.current = true;
    }, []);

    // If `initiallyFocusedOptionKey` is not passed, we fall back to `-1`, to avoid showing the highlight on the first member
    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex: flattenedSections.allOptions.findIndex((option) => option.keyForList === initiallyFocusedOptionKey),
        maxIndex: Math.min(flattenedSections.allOptions.length - 1, CONST.MAX_SELECTION_LIST_PAGE_LENGTH * currentPage - 1),
        disabledIndexes: disabledArrowKeyIndexes,
        isActive: shouldSubscribeToArrowKeyEvents && isFocused,
        onFocusedIndexChange: (index: number) => {
            const focusedItem = flattenedSections.allOptions.at(index);
            if (focusedItem) {
                onArrowFocus(focusedItem);
            }
            if (shouldScrollToFocusedIndex) {
                (shouldDebounceScrolling ? debouncedScrollToIndex : scrollToIndex)(index, true);
            }
        },
        ...(!hasKeyBeenPressed.current && {setHasKeyBeenPressed}),
        isFocused,
    });

    useEffect(() => {
        addKeyDownPressListener(setHasKeyBeenPressed);

        return () => removeKeyDownPressListener(setHasKeyBeenPressed);
    }, [setHasKeyBeenPressed]);

    const selectedItemIndex = useMemo(
        () => (initiallyFocusedOptionKey ? flattenedSections.allOptions.findIndex((option) => option.isSelected) : -1),
        [flattenedSections.allOptions, initiallyFocusedOptionKey],
    );

    useEffect(() => {
        if (selectedItemIndex === -1 || selectedItemIndex === focusedIndex || textInputValue) {
            return;
        }
        setFocusedIndex(selectedItemIndex);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [selectedItemIndex]);

    const clearInputAfterSelect = useCallback(() => {
        onChangeText?.('');
    }, [onChangeText]);

    /**
     * Logic to run when a row is selected, either with click/press or keyboard hotkeys.
     *
     * @param item - the list item
     * @param indexToFocus - the list item index to focus
     */
    const selectRow = useCallback(
        (item: TItem, indexToFocus?: number) => {
            if (!isFocused && !isScreenFocused) {
                return;
            }
            // In single-selection lists we don't care about updating the focused index, because the list is closed after selecting an item
            if (canSelectMultiple) {
                if (sections.length > 1 && !item.isSelected) {
                    // If we're selecting an item, scroll to it's position at the top, so we can see it
                    scrollToIndex(0, true);
                }

                if (shouldShowTextInput) {
                    clearInputAfterSelect();
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
            canSelectMultiple,
            sections.length,
            scrollToIndex,
            shouldShowTextInput,
            clearInputAfterSelect,
            shouldUpdateFocusedIndex,
            setFocusedIndex,
            onSelectRow,
            shouldPreventDefaultFocusOnSelectRow,
            isFocused,
            isScreenFocused,
        ],
    );

    const selectAllRow = () => {
        onSelectAll?.();

        if (shouldShowTextInput && shouldPreventDefaultFocusOnSelectRow && innerTextInputRef.current) {
            innerTextInputRef.current.focus();
        }
    };

    const getFocusedOption = useCallback(() => {
        const focusedOption = focusedIndex !== -1 ? flattenedSections.allOptions.at(focusedIndex) : undefined;

        if (!focusedOption || (focusedOption.isDisabled && !focusedOption.isSelected)) {
            return;
        }

        return focusedOption;
    }, [flattenedSections.allOptions, focusedIndex]);

    const selectFocusedOption = () => {
        const focusedOption = getFocusedOption();

        if (!focusedOption) {
            return;
        }

        selectRow(focusedOption);
    };

    /**
     * This function is used to compute the layout of any given item in our list.
     * We need to implement it so that we can programmatically scroll to items outside the virtual render window of the SectionList.
     *
     * @param data - This is the same as the data we pass into the component
     * @param flatDataArrayIndex - This index is provided by React Native, and refers to a flat array with data from all the sections. This flat array has some quirks:
     *
     *     1. It ALWAYS includes a list header and a list footer, even if we don't provide/render those.
     *     2. Each section includes a header, even if we don't provide/render one.
     *
     *     For example, given a list with two sections, two items in each section, no header, no footer, and no section headers, the flat array might look something like this:
     *
     *     [{header}, {sectionHeader}, {item}, {item}, {sectionHeader}, {item}, {item}, {footer}]
     */
    const getItemLayout = (data: Array<SectionListData<TItem, SectionWithIndexOffset<TItem>>> | null, flatDataArrayIndex: number) => {
        const targetItem = flattenedSections.itemLayouts.at(flatDataArrayIndex);

        if (!targetItem || flatDataArrayIndex === -1) {
            return {
                length: 0,
                offset: 0,
                index: flatDataArrayIndex,
            };
        }

        return {
            length: targetItem.length,
            offset: targetItem.offset,
            index: flatDataArrayIndex,
        };
    };

    const renderSectionHeader = ({section}: {section: SectionListDataType<TItem>}) => {
        if (section.CustomSectionHeader) {
            return <section.CustomSectionHeader section={section} />;
        }

        if (!section.title || isEmptyObject(section.data) || listHeaderContent) {
            return null;
        }

        return (
            // Note: The `optionsListSectionHeader` style provides an explicit height to section headers.
            // We do this so that we can reference the height in `getItemLayout` –
            // we need to know the heights of all list items up-front in order to synchronously compute the layout of any given list item.
            // So be aware that if you adjust the content of the section header (for example, change the font size), you may need to adjust this explicit height as well.
            <View style={[styles.optionsListSectionHeader, styles.justifyContentCenter, sectionTitleStyles]}>
                <Text style={[styles.ph5, styles.textLabelSupporting]}>{section.title}</Text>
            </View>
        );
    };

    const header = () => (
        <>
            {!headerMessage && canSelectMultiple && shouldShowSelectAll && (
                <View style={[styles.userSelectNone, styles.peopleRow, styles.ph5, styles.pb3, listHeaderWrapperStyle, styles.selectionListStickyHeader]}>
                    <View style={[styles.flexRow, styles.alignItemsCenter]}>
                        <Checkbox
                            accessibilityLabel={translate('workspace.people.selectAll')}
                            isChecked={flattenedSections.allSelected}
                            onPress={selectAllRow}
                            disabled={flattenedSections.allOptions.length === flattenedSections.disabledOptionsIndexes.length}
                        />
                        {!customListHeader && (
                            <PressableWithFeedback
                                style={[styles.userSelectNone, styles.flexRow, styles.alignItemsCenter]}
                                onPress={selectAllRow}
                                accessibilityLabel={translate('workspace.people.selectAll')}
                                role="button"
                                accessibilityState={{checked: flattenedSections.allSelected}}
                                disabled={flattenedSections.allOptions.length === flattenedSections.disabledOptionsIndexes.length}
                                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                                onMouseDown={shouldPreventDefaultFocusOnSelectRow ? (e) => e.preventDefault() : undefined}
                            >
                                <Text style={[styles.textStrong, styles.ph3]}>{translate('workspace.people.selectAll')}</Text>
                            </PressableWithFeedback>
                        )}
                    </View>
                    {customListHeader}
                </View>
            )}
            {!headerMessage && !canSelectMultiple && customListHeader}
        </>
    );

    const renderItem = ({item, index, section}: SectionListRenderItemInfo<TItem, SectionWithIndexOffset<TItem>>) => {
        const normalizedIndex = index + (section?.indexOffset ?? 0);
        const isDisabled = !!section.isDisabled || item.isDisabled;
        const isItemFocused = (!isDisabled || item.isSelected) && focusedIndex === normalizedIndex;
        const isItemHighlighted = !!itemsToHighlight?.has(item.keyForList ?? '');

        return (
            <View onLayout={(event: LayoutChangeEvent) => onItemLayout(event, item?.keyForList)}>
                <BaseSelectionListItemRenderer
                    ListItem={ListItem}
                    item={{
                        shouldAnimateInHighlight: isItemHighlighted,
                        ...item,
                    }}
                    index={index}
                    isFocused={isItemFocused}
                    isDisabled={isDisabled}
                    showTooltip={shouldShowTooltips}
                    canSelectMultiple={canSelectMultiple}
                    onLongPressRow={onLongPressRow}
                    shouldSingleExecuteRowSelect={shouldSingleExecuteRowSelect}
                    selectRow={selectRow}
                    onCheckboxPress={onCheckboxPress}
                    onDismissError={onDismissError}
                    shouldPreventDefaultFocusOnSelectRow={shouldPreventDefaultFocusOnSelectRow}
                    rightHandSideComponent={rightHandSideComponent}
                    isMultilineSupported={isRowMultilineSupported}
                    isAlternateTextMultilineSupported={isAlternateTextMultilineSupported}
                    alternateTextNumberOfLines={alternateTextNumberOfLines}
                    shouldIgnoreFocus={shouldIgnoreFocus}
                    setFocusedIndex={setFocusedIndex}
                    normalizedIndex={normalizedIndex}
                    shouldSyncFocus={!isTextInputFocusedRef.current && hasKeyBeenPressed.current}
                    wrapperStyle={listItemWrapperStyle}
                    titleStyles={listItemTitleStyles}
                    shouldHighlightSelectedItem={shouldHighlightSelectedItem}
                    singleExecution={singleExecution}
                    titleContainerStyles={listItemTitleContainerStyles}
                />
            </View>
        );
    };

    const renderListEmptyContent = () => {
        if (showLoadingPlaceholder) {
            return <OptionsListSkeletonView shouldStyleAsTable={shouldUseUserSkeletonView} />;
        }
        if (shouldShowListEmptyContent) {
            return listEmptyContent;
        }
        return null;
    };

    const renderInput = () => {
        return (
            <View style={[styles.ph5, styles.pb3]}>
                <TextInput
                    ref={(element) => {
                        innerTextInputRef.current = element as RNTextInput;

                        if (!textInputRef) {
                            return;
                        }

                        if (typeof textInputRef === 'function') {
                            textInputRef(element as RNTextInput);
                        } else {
                            // eslint-disable-next-line no-param-reassign
                            textInputRef.current = element as RNTextInput;
                        }
                    }}
                    onFocus={() => (isTextInputFocusedRef.current = true)}
                    onBlur={() => (isTextInputFocusedRef.current = false)}
                    label={textInputLabel}
                    accessibilityLabel={textInputLabel}
                    hint={textInputHint}
                    role={CONST.ROLE.PRESENTATION}
                    value={textInputValue}
                    placeholder={textInputPlaceholder}
                    maxLength={textInputMaxLength}
                    onChangeText={onChangeText}
                    inputMode={inputMode}
                    selectTextOnFocus
                    spellCheck={false}
                    iconLeft={textInputIconLeft}
                    onSubmitEditing={selectFocusedOption}
                    blurOnSubmit={!!flattenedSections.allOptions.length}
                    isLoading={isLoadingNewOptions}
                    testID="selection-list-text-input"
                    shouldInterceptSwipe={shouldTextInputInterceptSwipe}
                />
            </View>
        );
    };

    const scrollToFocusedIndexOnFirstRender = useCallback(
        (nativeEvent: LayoutChangeEvent) => {
            if (shouldUseDynamicMaxToRenderPerBatch) {
                const listHeight = nativeEvent.nativeEvent.layout.height;
                const itemHeight = nativeEvent.nativeEvent.layout.y;
                setMaxToRenderPerBatch((Math.ceil(listHeight / itemHeight) || 0) + CONST.MAX_TO_RENDER_PER_BATCH.DEFAULT);
            }

            if (!isInitialSectionListRender) {
                return;
            }
            if (shouldScrollToFocusedIndex) {
                scrollToIndex(focusedIndex, false);
            }
            setIsInitialSectionListRender(false);
        },
        [focusedIndex, isInitialSectionListRender, scrollToIndex, shouldUseDynamicMaxToRenderPerBatch, shouldScrollToFocusedIndex],
    );

    const onSectionListLayout = useCallback(
        (nativeEvent: LayoutChangeEvent) => {
            onLayout?.(nativeEvent);
            scrollToFocusedIndexOnFirstRender(nativeEvent);
        },
        [onLayout, scrollToFocusedIndexOnFirstRender],
    );

    const updateAndScrollToFocusedIndex = useCallback(
        (newFocusedIndex: number) => {
            setFocusedIndex(newFocusedIndex);
            scrollToIndex(newFocusedIndex, true);
        },
        [scrollToIndex, setFocusedIndex],
    );

    /** Function to focus text input */
    const focusTextInput = useCallback(() => {
        if (!innerTextInputRef.current) {
            return;
        }

        innerTextInputRef.current.focus();
    }, []);

    /** Focuses the text input when the component comes into focus and after any navigation animations finish. */
    useFocusEffect(
        useCallback(() => {
            if (textInputAutoFocus && shouldShowTextInput) {
                if (shouldDelayFocus) {
                    focusTimeoutRef.current = setTimeout(focusTextInput, CONST.ANIMATED_TRANSITION);
                } else {
                    requestAnimationFrame(focusTextInput);
                }
            }

            return () => focusTimeoutRef.current && clearTimeout(focusTimeoutRef.current);
        }, [shouldShowTextInput, textInputAutoFocus, shouldDelayFocus, focusTextInput]),
    );

    const prevTextInputValue = usePrevious(textInputValue);
    const prevSelectedOptionsLength = usePrevious(flattenedSections.selectedOptions.length);
    const prevAllOptionsLength = usePrevious(flattenedSections.allOptions.length);

    useEffect(() => {
        // Avoid changing focus if the textInputValue remains unchanged.
        if (
            (prevTextInputValue === textInputValue && flattenedSections.selectedOptions.length === prevSelectedOptionsLength) ||
            flattenedSections.allOptions.length === 0 ||
            (flattenedSections.selectedOptions.length !== prevSelectedOptionsLength && shouldUpdateFocusedIndex)
        ) {
            return;
        }
        // Remove the focus if the search input is empty and prev search input not empty or selected options length is changed (and allOptions length remains the same)
        // else focus on the first non disabled item
        const newSelectedIndex =
            (isEmpty(prevTextInputValue) && textInputValue === '') ||
            (flattenedSections.selectedOptions.length !== prevSelectedOptionsLength && prevAllOptionsLength === flattenedSections.allOptions.length)
                ? -1
                : 0;

        // reseting the currrent page to 1 when the user types something
        setCurrentPage(1);

        updateAndScrollToFocusedIndex(newSelectedIndex);
    }, [
        canSelectMultiple,
        flattenedSections.allOptions.length,
        flattenedSections.selectedOptions.length,
        prevTextInputValue,
        textInputValue,
        updateAndScrollToFocusedIndex,
        prevSelectedOptionsLength,
        prevAllOptionsLength,
        shouldUpdateFocusedIndex,
    ]);

    useEffect(
        () => () => {
            if (!itemFocusTimeoutRef.current) {
                return;
            }
            clearTimeout(itemFocusTimeoutRef.current);
        },
        [],
    );

    /**
     * Highlights the items and scrolls to the first item present in the items list.
     *
     * @param items - The list of items to highlight.
     * @param timeout - The timeout in milliseconds before removing the highlight.
     */
    const scrollAndHighlightItem = useCallback(
        (items: string[]) => {
            const newItemsToHighlight = new Set<string>();
            items.forEach((item) => {
                newItemsToHighlight.add(item);
            });
            const index = flattenedSections.allOptions.findIndex((option) => newItemsToHighlight.has(option.keyForList ?? ''));
            scrollToIndex(index);
            setItemsToHighlight(newItemsToHighlight);

            if (itemFocusTimeoutRef.current) {
                clearTimeout(itemFocusTimeoutRef.current);
            }

            const duration =
                CONST.ANIMATED_HIGHLIGHT_ENTRY_DELAY +
                CONST.ANIMATED_HIGHLIGHT_ENTRY_DURATION +
                CONST.ANIMATED_HIGHLIGHT_START_DELAY +
                CONST.ANIMATED_HIGHLIGHT_START_DURATION +
                CONST.ANIMATED_HIGHLIGHT_END_DELAY +
                CONST.ANIMATED_HIGHLIGHT_END_DURATION;
            itemFocusTimeoutRef.current = setTimeout(() => {
                setItemsToHighlight(null);
            }, duration);
        },
        [flattenedSections.allOptions, scrollToIndex],
    );

    /**
     * Handles isTextInputFocusedRef value when using external TextInput, so external TextInput is not defocused when typing in it.
     *
     * @param isTextInputFocused - Is external TextInput focused.
     */
    const updateExternalTextInputFocus = useCallback((isTextInputFocused: boolean) => {
        isTextInputFocusedRef.current = isTextInputFocused;
    }, []);

    useImperativeHandle(
        ref,
        () => ({scrollAndHighlightItem, clearInputAfterSelect, updateAndScrollToFocusedIndex, updateExternalTextInputFocus, scrollToIndex, getFocusedOption, focusTextInput}),
        [scrollAndHighlightItem, clearInputAfterSelect, updateAndScrollToFocusedIndex, updateExternalTextInputFocus, scrollToIndex, getFocusedOption, focusTextInput],
    );

    /** Selects row when pressing Enter */
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER, selectFocusedOption, {
        captureOnInputs: true,
        shouldBubble: !flattenedSections.allOptions.at(focusedIndex) || focusedIndex === -1,
        shouldStopPropagation,
        shouldPreventDefault,
        isActive: !disableKeyboardShortcuts && !disableEnterShortcut && isFocused,
    });

    /** Calls confirm action when pressing CTRL (CMD) + Enter */
    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.CTRL_ENTER,
        (e) => {
            const focusedOption = focusedIndex !== -1 ? flattenedSections.allOptions.at(focusedIndex) : undefined;
            if (onConfirm) {
                onConfirm(e, focusedOption);
                return;
            }
            selectFocusedOption();
        },
        {
            captureOnInputs: true,
            shouldBubble: !flattenedSections.allOptions.at(focusedIndex) || focusedIndex === -1,
            isActive: !disableKeyboardShortcuts && isFocused && !isConfirmButtonDisabled,
        },
    );

    const headerMessageContent = () =>
        (!isLoadingNewOptions || headerMessage !== translate('common.noResultsFound') || (flattenedSections.allOptions.length === 0 && !showLoadingPlaceholder)) &&
        !!headerMessage && (
            <View style={headerMessageStyle ?? [styles.ph5, styles.pb5]}>
                <Text style={[styles.textLabel, styles.colorMuted, styles.minHeight5]}>{headerMessage}</Text>
            </View>
        );

    const {safeAreaPaddingBottomStyle} = useSafeAreaPaddings();
    const paddingBottomStyle = useMemo(
        () => (!isKeyboardShown || !!footerContent) && includeSafeAreaPaddingBottom && safeAreaPaddingBottomStyle,
        [footerContent, includeSafeAreaPaddingBottom, isKeyboardShown, safeAreaPaddingBottomStyle],
    );

    const shouldHideContentBottomSafeAreaPadding = showConfirmButton || !!footerContent;

    // TODO: test _every_ component that uses SelectionList
    return (
        <View style={[styles.flex1, !addBottomSafeAreaPadding && paddingBottomStyle, containerStyle]}>
            {shouldShowTextInput && !shouldShowTextInputAfterHeader && renderInput()}
            {/* If we are loading new options we will avoid showing any header message. This is mostly because one of the header messages says there are no options. */}
            {/* This is misleading because we might be in the process of loading fresh options from the server. */}
            {!shouldShowHeaderMessageAfterHeader && headerMessageContent()}
            {!!headerContent && headerContent}
            {flattenedSections.allOptions.length === 0 && (showLoadingPlaceholder || shouldShowListEmptyContent) ? (
                renderListEmptyContent()
            ) : (
                <>
                    {!listHeaderContent && header()}
                    <SectionList
                        removeClippedSubviews={removeClippedSubviews}
                        ref={listRef}
                        sections={slicedSections}
                        stickySectionHeadersEnabled={false}
                        renderSectionHeader={(arg) => (
                            <>
                                {renderSectionHeader(arg)}
                                {listHeaderContent && header()}
                            </>
                        )}
                        renderItem={renderItem}
                        getItemLayout={getItemLayout}
                        onScroll={onScroll}
                        onScrollBeginDrag={onScrollBeginDrag}
                        onContentSizeChange={onContentSizeChange}
                        keyExtractor={(item, index) => item.keyForList ?? `${index}`}
                        extraData={focusedIndex}
                        // the only valid values on the new arch are "white", "black", and "default", other values will cause a crash
                        indicatorStyle="white"
                        keyboardShouldPersistTaps="always"
                        showsVerticalScrollIndicator={showScrollIndicator}
                        initialNumToRender={initialNumToRender}
                        maxToRenderPerBatch={maxToRenderPerBatch}
                        windowSize={windowSize}
                        updateCellsBatchingPeriod={updateCellsBatchingPeriod}
                        viewabilityConfig={{viewAreaCoveragePercentThreshold: 95}}
                        testID="selection-list"
                        onLayout={onSectionListLayout}
                        style={[(!maxToRenderPerBatch || (shouldHideListOnInitialRender && isInitialSectionListRender)) && styles.opacity0, sectionListStyle]}
                        ListHeaderComponent={
                            shouldShowTextInput && shouldShowTextInputAfterHeader ? (
                                <>
                                    {listHeaderContent}
                                    {renderInput()}
                                    {shouldShowHeaderMessageAfterHeader && headerMessageContent()}
                                </>
                            ) : (
                                listHeaderContent
                            )
                        }
                        scrollEnabled={scrollEnabled}
                        ListFooterComponent={listFooterContent ?? ShowMoreButtonInstance}
                        onEndReached={onEndReached}
                        onEndReachedThreshold={onEndReachedThreshold}
                        scrollEventThrottle={scrollEventThrottle}
                        addBottomSafeAreaPadding={!shouldHideContentBottomSafeAreaPadding && addBottomSafeAreaPadding}
                        addOfflineIndicatorBottomSafeAreaPadding={!shouldHideContentBottomSafeAreaPadding && addOfflineIndicatorBottomSafeAreaPadding}
                        contentContainerStyle={contentContainerStyle}
                        CellRendererComponent={shouldPreventActiveCellVirtualization ? FocusAwareCellRendererComponent : undefined}
                    />
                    {children}
                </>
            )}
            {showConfirmButton && (
                <FixedFooter
                    style={styles.mtAuto}
                    addBottomSafeAreaPadding={addBottomSafeAreaPadding}
                    addOfflineIndicatorBottomSafeAreaPadding={addOfflineIndicatorBottomSafeAreaPadding}
                >
                    <Button
                        success={!shouldUseDefaultTheme}
                        large
                        style={[styles.w100, confirmButtonStyles]}
                        text={confirmButtonText || translate('common.confirm')}
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
                    addOfflineIndicatorBottomSafeAreaPadding={addOfflineIndicatorBottomSafeAreaPadding}
                >
                    {footerContent}
                </FixedFooter>
            )}
        </View>
    );
}

BaseSelectionList.displayName = 'BaseSelectionList';

export default forwardRef(BaseSelectionList);
