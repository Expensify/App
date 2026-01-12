import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import lodashDebounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import React, {useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import type {LayoutChangeEvent, SectionList as RNSectionList, TextInput as RNTextInput, SectionListData, SectionListRenderItemInfo, TextInputKeyPressEvent} from 'react-native';
import {View} from 'react-native';
import Button from '@components/Button';
import Checkbox from '@components/Checkbox';
import FixedFooter from '@components/FixedFooter';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import {PressableWithFeedback} from '@components/Pressable';
import SectionList from '@components/SectionList';
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
import {focusedItemRef} from '@hooks/useSyncFocus/useSyncFocusImplementation';
import useThemeStyles from '@hooks/useThemeStyles';
import getSectionsWithIndexOffset from '@libs/getSectionsWithIndexOffset';
import Log from '@libs/Log';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import arraysEqual from '@src/utils/arraysEqual';
import BaseSelectionListItemRenderer from './BaseSelectionListItemRenderer';
import FocusAwareCellRendererComponent from './FocusAwareCellRendererComponent';
import type {ButtonOrCheckBoxRoles, FlattenedSectionsReturn, ListItem, SectionListDataType, SectionWithIndexOffset, SelectionListProps} from './types';

const getDefaultItemHeight = () => variables.optionRowHeight;

function BaseSelectionListWithSections<TItem extends ListItem>({
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
    textInputStyle,
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
    footerContentAbovePagination,
    listEmptyContent,
    showScrollIndicator = true,
    showLoadingPlaceholder = false,
    LoadingPlaceholderComponent = OptionsListSkeletonView,
    showConfirmButton = false,
    isConfirmButtonDisabled = false,
    shouldUseDefaultTheme = false,
    shouldPreventDefaultFocusOnSelectRow = false,
    containerStyle,
    sectionListStyle,
    disableKeyboardShortcuts = false,
    children,
    autoCorrect,
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
    selectAllStyle,
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
    onEndReached,
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
    shouldKeepFocusedItemAtTopOfViewableArea = false,
    shouldDebounceScrolling = false,
    shouldPreventActiveCellVirtualization = false,
    shouldScrollToFocusedIndex = true,
    isSmallScreenWidth,
    onContentSizeChange,
    listItemTitleStyles,
    initialNumToRender = 12,
    listItemTitleContainerStyles,
    isScreenFocused = false,
    shouldSubscribeToArrowKeyEvents = true,
    shouldClearInputOnSelect = true,
    addBottomSafeAreaPadding,
    addOfflineIndicatorBottomSafeAreaPadding,
    fixedNumItemsForLoader,
    loaderSpeed,
    errorText,
    shouldUseDefaultRightHandSideCheckmark,
    selectedItems = getEmptyArray<string>(),
    isSelected,
    canShowProductTrainingTooltip,
    renderScrollComponent,
    shouldShowRightCaret,
    shouldHighlightSelectedItem = true,
    shouldDisableHoverStyle = false,
    setShouldDisableHoverStyle = () => {},
    shouldSkipContentHeaderHeightOffset,
    ref,
}: SelectionListProps<TItem>) {
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
    const isItemSelected = useCallback(
        (item: TItem) => item.isSelected ?? ((isSelected?.(item) ?? selectedItems.includes(item.keyForList ?? '')) && canSelectMultiple),
        [isSelected, selectedItems, canSelectMultiple],
    );
    /** Calculates on which page is selected item so we can scroll to it on first render  */
    const calculateInitialCurrentPage = useCallback(() => {
        if (canSelectMultiple || sections.length === 0) {
            return 1;
        }

        let currentIndex = 0;
        for (const section of sections) {
            if (section.data) {
                for (const item of section.data) {
                    if (isItemSelected(item)) {
                        return Math.floor(currentIndex / CONST.MAX_SELECTION_LIST_PAGE_LENGTH) + 1;
                    }
                    currentIndex++;
                }
            }
        }
        return 1;
    }, [canSelectMultiple, isItemSelected, sections]);
    const [currentPage, setCurrentPage] = useState(() => calculateInitialCurrentPage());
    const isTextInputFocusedRef = useRef<boolean>(false);
    const {singleExecution} = useSingleExecution();
    const itemHeights = useRef<Record<string, number>>({});
    const pendingScrollIndexRef = useRef<number | null>(null);

    const onItemLayout = (event: LayoutChangeEvent, itemKey: string | null | undefined) => {
        if (!itemKey) {
            return;
        }

        const {height} = event.nativeEvent.layout;
        itemHeights.current = {
            ...itemHeights.current,
            [itemKey]: height,
        };
    };

    const canShowProductTrainingTooltipMemo = useMemo(() => {
        return canShowProductTrainingTooltip && isFocused;
    }, [canShowProductTrainingTooltip, isFocused]);

    /**
     * Iterates through the sections and items inside each section, and builds 4 arrays along the way:
     * - `allOptions`: Contains all the items in the list, flattened, regardless of section
     * - `disabledOptionsIndexes`: Contains the indexes of all the unselectable and disabled items in the list
     * - `disabledArrowKeyOptionsIndexes`: Contains the indexes of item that is not navigable by the arrow key. The list is separated from disabledOptionsIndexes because unselectable item is still navigable by the arrow key.
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

        for (const [sectionIndex, section] of sections.entries()) {
            const sectionHeaderHeight = !!section.title || !!section.CustomSectionHeader ? variables.optionsListSectionHeaderHeight : 0;
            itemLayouts.push({length: sectionHeaderHeight, offset});
            offset += sectionHeaderHeight;

            if (section.data) {
                for (const [optionIndex, item] of section.data.entries()) {
                    // Add item to the general flattened array
                    allOptions.push({
                        ...item,
                        sectionIndex,
                        index: optionIndex,
                    });

                    // If disabled, add to the disabled indexes array
                    const isItemDisabled = !!section.isDisabled || (item.isDisabled && !isItemSelected(item));
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    if (isItemDisabled || item.isDisabledCheckbox) {
                        disabledOptionsIndexes.push(disabledIndex);
                        if (isItemDisabled) {
                            disabledArrowKeyOptionsIndexes.push(disabledIndex);
                        }
                    }
                    disabledIndex += 1;

                    // Account for the height of the item in getItemLayout
                    const fullItemHeight = item?.keyForList && itemHeights.current[item.keyForList] ? itemHeights.current[item.keyForList] : getItemHeight(item);
                    itemLayouts.push({length: fullItemHeight, offset});
                    offset += fullItemHeight;

                    if (isItemSelected(item) && !selectedOptions.find((option) => option.keyForList === item.keyForList)) {
                        selectedOptions.push(item);
                    }
                }
            }

            // We're not rendering any section footer, but we need to push to the array
            // because React Native accounts for it in getItemLayout
            itemLayouts.push({length: 0, offset});
        }

        // We're not rendering the list footer, but we need to push to the array
        // because React Native accounts for it in getItemLayout
        itemLayouts.push({length: 0, offset});

        if (selectedOptions.length > 1 && !canSelectMultiple) {
            Log.alert(
                'Dev error: SelectionList - multiple items are selected but prop `canSelectMultiple` is false. Please enable `canSelectMultiple` or make your list have only 1 item with `isSelected: true`.',
            );
        }
        const totalSelectable = allOptions.length - disabledOptionsIndexes.length;
        return {
            allOptions,
            selectedOptions,
            disabledOptionsIndexes,
            disabledArrowKeyOptionsIndexes,
            itemLayouts,
            allSelected: selectedOptions.length > 0 && selectedOptions.length === totalSelectable,
            someSelected: selectedOptions.length > 0 && selectedOptions.length < totalSelectable,
        };
    }, [customListHeader, customListHeaderHeight, sections, canSelectMultiple, isItemSelected, getItemHeight]);

    const incrementPage = useCallback(() => {
        if (flattenedSections.allOptions.length <= CONST.MAX_SELECTION_LIST_PAGE_LENGTH * currentPage) {
            return;
        }
        setCurrentPage((prev) => prev + 1);
    }, [flattenedSections.allOptions.length, currentPage]);

    const slicedSections = useMemo(() => {
        let remainingOptionsLimit = CONST.MAX_SELECTION_LIST_PAGE_LENGTH * currentPage;
        return getSectionsWithIndexOffset(
            sections.map((section) => {
                const data = !isEmpty(section.data) && remainingOptionsLimit > 0 ? section.data.slice(0, remainingOptionsLimit) : [];
                remainingOptionsLimit -= data.length;

                return {
                    ...section,
                    data,
                };
            }),
        );
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

            // Calculate which page is needed to show this index
            const requiredPage = Math.ceil((index + 1) / CONST.MAX_SELECTION_LIST_PAGE_LENGTH);

            // If the required page is beyond the current page, load all pages up to it,
            // then return early and let the scroll happen after the page update
            if (requiredPage > currentPage) {
                pendingScrollIndexRef.current = index;
                setCurrentPage(requiredPage);
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
                const firstPreviousItemHeight = firstPreviousItem && firstPreviousItem.keyForList ? itemHeights.current[firstPreviousItem.keyForList] : 0;
                const secondPreviousItem = index > 1 ? flattenedSections.allOptions.at(index - 2) : undefined;
                const secondPreviousItemHeight = secondPreviousItem && secondPreviousItem?.keyForList ? itemHeights.current[secondPreviousItem.keyForList] : 0;
                viewOffsetToKeepFocusedItemAtTopOfViewableArea = firstPreviousItemHeight + secondPreviousItemHeight;
            }

            let viewOffset = variables.contentHeaderHeight - viewOffsetToKeepFocusedItemAtTopOfViewableArea;
            // Skip contentHeaderHeight for native split expense tabs scroll correction
            if (shouldSkipContentHeaderHeightOffset) {
                viewOffset = viewOffsetToKeepFocusedItemAtTopOfViewableArea;
            }
            listRef.current.scrollToLocation({sectionIndex, itemIndex, animated, viewOffset});
            pendingScrollIndexRef.current = null;
        },

        // eslint-disable-next-line react-hooks/exhaustive-deps
        [flattenedSections.allOptions, currentPage],
    );

    // this function is used specifically for scrolling to the focused input to prevent it from appearing below opened keyboard
    // and ensures the entire list item element is visible, not just the input field inside it
    const scrollToFocusedInput = useCallback((index: number) => {
        if (!listRef.current) {
            return;
        }

        if (index < 0) {
            return;
        }

        // Perform scroll to specific position in SectionList to show entire item
        listRef.current.scrollToLocation({
            sectionIndex: 0, // Scroll to first section (index 0) as this function is designed for specific SplitExpenseItem.tsx list
            itemIndex: index + 2, // Scroll to item at index + 2 (because first two items is reserved for optional header and content above the selectionList)
            animated: true,
            viewOffset: 4, // scrollToLocation scrolls 4 pixels more than the specified list item, so we need to subtract this using viewOffset
            viewPosition: 1.0, // Item position: 1.0 = bottom of screen
        });
    }, []);

    const [disabledArrowKeyIndexes, setDisabledArrowKeyIndexes] = useState(flattenedSections.disabledArrowKeyOptionsIndexes);
    useEffect(() => {
        if (arraysEqual(disabledArrowKeyIndexes, flattenedSections.disabledArrowKeyOptionsIndexes)) {
            return;
        }

        setDisabledArrowKeyIndexes(flattenedSections.disabledArrowKeyOptionsIndexes);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flattenedSections.disabledArrowKeyOptionsIndexes]);

    /** Check whether there is a need to scroll to an item and if all items are loaded */
    useEffect(() => {
        if (pendingScrollIndexRef.current === null) {
            return;
        }

        const indexToScroll = pendingScrollIndexRef.current;
        const targetItem = flattenedSections.allOptions.at(indexToScroll);

        if (targetItem && indexToScroll < CONST.MAX_SELECTION_LIST_PAGE_LENGTH * currentPage) {
            pendingScrollIndexRef.current = null;
            scrollToIndex(indexToScroll, true);
        }
    }, [currentPage, scrollToIndex, flattenedSections.allOptions]);

    const debouncedScrollToIndex = useMemo(() => lodashDebounce(scrollToIndex, CONST.TIMING.LIST_SCROLLING_DEBOUNCE_TIME, {leading: true, trailing: true}), [scrollToIndex]);

    const setHasKeyBeenPressed = useCallback(() => {
        if (hasKeyBeenPressed.current) {
            return;
        }

        // We need to track whether a key has been pressed to enable focus syncing only if a key has been pressed.
        // This is to avoid the default behavior of web showing blue border on click of items after a page refresh.
        hasKeyBeenPressed.current = true;
    }, []);

    const onArrowUpDownCallback = useCallback(() => {
        setShouldDisableHoverStyle(true);
    }, [setShouldDisableHoverStyle]);

    // If `initiallyFocusedOptionKey` is not passed, we fall back to `-1`, to avoid showing the highlight on the first member
    const [focusedIndex, setFocusedIndex, currentHoverIndexRef] = useArrowKeyFocusManager({
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
        setHasKeyBeenPressed,
        isFocused,
        onArrowUpDownCallback,
    });

    const selectedItemIndex = useMemo(
        () => (initiallyFocusedOptionKey ? flattenedSections.allOptions.findIndex(isItemSelected) : -1),
        [flattenedSections.allOptions, initiallyFocusedOptionKey, isItemSelected],
    );

    useEffect(() => {
        if (selectedItemIndex === -1 || selectedItemIndex === focusedIndex || textInputValue) {
            return;
        }
        setFocusedIndex(selectedItemIndex);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedItemIndex]);

    const clearInputAfterSelect = useCallback(() => {
        if (!shouldClearInputOnSelect) {
            return;
        }

        onChangeText?.('');
    }, [onChangeText, shouldClearInputOnSelect]);

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
                if (sections.length > 1 && !isItemSelected(item)) {
                    // If we're selecting an item, scroll to its position at the top, so we can see it
                    scrollToIndex(0, true);
                }

                if (shouldShowTextInput) {
                    clearInputAfterSelect();
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
            isScreenFocused,
            canSelectMultiple,
            shouldUpdateFocusedIndex,
            onSelectRow,
            shouldShowTextInput,
            shouldPreventDefaultFocusOnSelectRow,
            sections.length,
            isItemSelected,
            isSmallScreenWidth,
            scrollToIndex,
            clearInputAfterSelect,
            onCheckboxPress,
            setFocusedIndex,
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

        if (!focusedOption || (focusedOption.isDisabled && !isItemSelected(focusedOption))) {
            return;
        }

        return focusedOption;
    }, [flattenedSections.allOptions, focusedIndex, isItemSelected]);

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
                            testID="selection-list-select-all-checkbox"
                            accessibilityLabel={translate('workspace.people.selectAll')}
                            isChecked={flattenedSections.allSelected}
                            isIndeterminate={flattenedSections.someSelected}
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
                                <Text style={[styles.textStrong, styles.ph3, selectAllStyle]}>{translate('workspace.people.selectAll')}</Text>
                            </PressableWithFeedback>
                        )}
                    </View>
                    {customListHeader}
                </View>
            )}
            {!headerMessage && !canSelectMultiple && customListHeader}
        </>
    );

    const setCurrentHoverIndex = useCallback(
        (hoverIndex: number | null) => {
            if (shouldDisableHoverStyle) {
                return;
            }
            currentHoverIndexRef.current = hoverIndex;
        },
        [currentHoverIndexRef, shouldDisableHoverStyle],
    );

    const renderItem = ({item, index, section}: SectionListRenderItemInfo<TItem, SectionWithIndexOffset<TItem>>) => {
        const normalizedIndex = index + (section?.indexOffset ?? 0);
        const isDisabled = !!section.isDisabled || item.isDisabled;
        const selected = isItemSelected(item);
        const isItemFocused = (!isDisabled || selected) && focusedIndex === normalizedIndex;
        const isItemHighlighted = !!itemsToHighlight?.has(item.keyForList ?? '');

        return (
            <View
                onLayout={(event: LayoutChangeEvent) => onItemLayout(event, item?.keyForList)}
                onMouseMove={() => setCurrentHoverIndex(normalizedIndex)}
                onMouseEnter={() => setCurrentHoverIndex(normalizedIndex)}
                onMouseLeave={(e) => {
                    e.stopPropagation();
                    setCurrentHoverIndex(null);
                }}
            >
                <BaseSelectionListItemRenderer
                    ListItem={ListItem}
                    item={{
                        shouldAnimateInHighlight: isItemHighlighted,
                        isSelected: selected,
                        ...item,
                    }}
                    shouldHighlightSelectedItem={shouldHighlightSelectedItem}
                    shouldUseDefaultRightHandSideCheckmark={shouldUseDefaultRightHandSideCheckmark}
                    index={index}
                    sectionIndex={section?.indexOffset}
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
                    singleExecution={singleExecution}
                    titleContainerStyles={listItemTitleContainerStyles}
                    canShowProductTrainingTooltip={canShowProductTrainingTooltipMemo}
                    shouldShowRightCaret={shouldShowRightCaret}
                    shouldDisableHoverStyle={shouldDisableHoverStyle}
                    shouldStopMouseLeavePropagation={false}
                />
            </View>
        );
    };

    const renderListEmptyContent = () => {
        if (showLoadingPlaceholder) {
            return (
                <LoadingPlaceholderComponent
                    fixedNumItems={fixedNumItemsForLoader}
                    shouldStyleAsTable={shouldUseUserSkeletonView}
                    speed={loaderSpeed}
                />
            );
        }
        if (shouldShowListEmptyContent) {
            return listEmptyContent;
        }
        return null;
    };

    const textInputKeyPress = useCallback((event: TextInputKeyPressEvent) => {
        const key = event.nativeEvent.key;
        if (key === CONST.KEYBOARD_SHORTCUTS.TAB.shortcutKey) {
            focusedItemRef?.focus();
        }
    }, []);

    const renderInput = () => {
        return (
            <View style={[styles.ph5, styles.pb3, textInputStyle]}>
                <TextInput
                    onKeyPress={textInputKeyPress}
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
                    autoCorrect={autoCorrect}
                    maxLength={textInputMaxLength}
                    onChangeText={onChangeText}
                    inputMode={inputMode}
                    selectTextOnFocus
                    spellCheck={false}
                    iconLeft={textInputIconLeft}
                    onSubmitEditing={selectFocusedOption}
                    submitBehavior={flattenedSections.allOptions.length ? 'blurAndSubmit' : 'submit'}
                    isLoading={isLoadingNewOptions}
                    testID="selection-list-text-input"
                    shouldInterceptSwipe={shouldTextInputInterceptSwipe}
                    errorText={errorText}
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
        (newFocusedIndex: number, shouldSkipWhenIndexNonZero = false) => {
            if (shouldSkipWhenIndexNonZero && focusedIndex > 0) {
                return;
            }
            setFocusedIndex(newFocusedIndex);
            scrollToIndex(newFocusedIndex, true);
        },
        [focusedIndex, scrollToIndex, setFocusedIndex],
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
        if (prevTextInputValue === textInputValue) {
            return;
        }
        // Reset the current page to 1 when the user types something
        setCurrentPage(1);
    }, [textInputValue, prevTextInputValue]);

    useEffect(() => {
        // Avoid changing focus if the textInputValue remains unchanged.
        if (
            (prevTextInputValue === textInputValue && flattenedSections.selectedOptions.length === prevSelectedOptionsLength) ||
            flattenedSections.allOptions.length === 0 ||
            (flattenedSections.selectedOptions.length !== prevSelectedOptionsLength && shouldUpdateFocusedIndex)
        ) {
            return;
        }

        // Handle clearing search
        if (prevTextInputValue !== '' && textInputValue === '') {
            const foundSelectedItemIndex = flattenedSections.allOptions.findIndex(isItemSelected);
            const singleSectionList = slicedSections.length < 2;
            if (foundSelectedItemIndex !== -1 && singleSectionList && !canSelectMultiple) {
                const requiredPage = Math.ceil((foundSelectedItemIndex + 1) / CONST.MAX_SELECTION_LIST_PAGE_LENGTH);
                setCurrentPage(requiredPage);
                updateAndScrollToFocusedIndex(foundSelectedItemIndex);
                return;
            }
        }

        // Remove the focus if the search input is empty and prev search input not empty or selected options length is changed (and allOptions length remains the same)
        // else focus on the first non disabled item
        const newSelectedIndex =
            (isEmpty(prevTextInputValue) && textInputValue === '') ||
            (flattenedSections.selectedOptions.length !== prevSelectedOptionsLength && prevAllOptionsLength === flattenedSections.allOptions.length)
                ? -1
                : 0;

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
        flattenedSections.allOptions,
        isItemSelected,
        slicedSections.length,
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
            for (const item of items) {
                newItemsToHighlight.add(item);
            }
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
     * Handles isTextInputFocusedRef value when using external TextInput, so external TextInput does not lose focus when typing in it.
     *
     * @param isTextInputFocused - Is external TextInput focused.
     */
    const updateExternalTextInputFocus = useCallback((isTextInputFocused: boolean) => {
        isTextInputFocusedRef.current = isTextInputFocused;
    }, []);

    useImperativeHandle(
        ref,
        () => ({
            scrollAndHighlightItem,
            clearInputAfterSelect,
            updateAndScrollToFocusedIndex,
            updateExternalTextInputFocus,
            scrollToIndex,
            getFocusedOption,
            focusTextInput,
            scrollToFocusedInput,
        }),
        [scrollAndHighlightItem, clearInputAfterSelect, updateAndScrollToFocusedIndex, updateExternalTextInputFocus, scrollToIndex, getFocusedOption, focusTextInput, scrollToFocusedInput],
    );

    /** Selects row when pressing Enter */
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER, selectFocusedOption, {
        captureOnInputs: true,
        shouldBubble: (flattenedSections.allOptions.length > 0 && !flattenedSections.allOptions.at(focusedIndex)) || focusedIndex === -1,
        shouldStopPropagation,
        shouldPreventDefault,
        isActive: !disableKeyboardShortcuts && !disableEnterShortcut && isFocused && focusedIndex >= 0,
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

    const handleOnEndReached = useCallback(() => {
        onEndReached?.();
        incrementPage();
    }, [onEndReached, incrementPage]);

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
                        renderScrollComponent={renderScrollComponent}
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
                        ListFooterComponent={
                            <>
                                {footerContentAbovePagination}
                                {listFooterContent}
                            </>
                        }
                        onEndReached={handleOnEndReached}
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

export default BaseSelectionListWithSections;
