import {useFocusEffect, useIsFocused} from '@react-navigation/native';
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
import SafeAreaConsumer from '@components/SafeAreaConsumer';
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
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import getSectionsWithIndexOffset from '@libs/getSectionsWithIndexOffset';
import Log from '@libs/Log';
import * as SearchUtils from '@libs/SearchUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import arraysEqual from '@src/utils/arraysEqual';
import type {BaseSelectionListProps, ButtonOrCheckBoxRoles, FlattenedSectionsReturn, ListItem, SectionListDataType, SectionWithIndexOffset, SelectionListHandle} from './types';

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
        shouldHideListOnInitialRender = true,
        textInputIconLeft,
        sectionTitleStyles,
        textInputAutoFocus = true,
        shouldTextInputInterceptSwipe = false,
        listHeaderContent,
        onEndReached = () => {},
        onEndReachedThreshold,
        windowSize = 5,
        updateCellsBatchingPeriod = 50,
        removeClippedSubviews = true,
        shouldDelayFocus = true,
        shouldUpdateFocusedIndex = false,
        onLongPressRow,
        shouldShowTextInput = !!textInputLabel || !!textInputIconLeft,
        shouldShowListEmptyContent = true,
        shouldIgnoreFocus,
        scrollEventThrottle,
        contentContainerStyle,
    }: BaseSelectionListProps<TItem>,
    ref: ForwardedRef<SelectionListHandle>,
) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const listRef = useRef<RNSectionList<TItem, SectionWithIndexOffset<TItem>>>(null);
    const innerTextInputRef = useRef<RNTextInput | null>(null);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const shouldShowSelectAll = !!onSelectAll;
    const activeElementRole = useActiveElementRole();
    const isFocused = useIsFocused();
    const [maxToRenderPerBatch, setMaxToRenderPerBatch] = useState(shouldUseDynamicMaxToRenderPerBatch ? 0 : CONST.MAX_TO_RENDER_PER_BATCH.DEFAULT);
    const [isInitialSectionListRender, setIsInitialSectionListRender] = useState(true);
    const {isKeyboardShown} = useKeyboardState();
    const [itemsToHighlight, setItemsToHighlight] = useState<Set<string> | null>(null);
    const itemFocusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const isTextInputFocusedRef = useRef<boolean>(false);
    const {singleExecution} = useSingleExecution();

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
            const sectionHeaderHeight = variables.optionsListSectionHeaderHeight;
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
                const fullItemHeight = getItemHeight(item);
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
    }, [canSelectMultiple, sections, customListHeader, customListHeaderHeight, getItemHeight]);

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

            listRef.current.scrollToLocation({sectionIndex, itemIndex, animated, viewOffset: variables.contentHeaderHeight});
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

    // If `initiallyFocusedOptionKey` is not passed, we fall back to `-1`, to avoid showing the highlight on the first member
    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex: flattenedSections.allOptions.findIndex((option) => option.keyForList === initiallyFocusedOptionKey),
        maxIndex: Math.min(flattenedSections.allOptions.length - 1, CONST.MAX_SELECTION_LIST_PAGE_LENGTH * currentPage - 1),
        disabledIndexes: disabledArrowKeyIndexes,
        isActive: isFocused,
        onFocusedIndexChange: (index: number) => {
            scrollToIndex(index, true);
        },
        isFocused,
    });

    const clearInputAfterSelect = useCallback(() => {
        onChangeText?.('');
    }, [onChangeText]);

    /**
     * Logic to run when a row is selected, either with click/press or keyboard hotkeys.
     *
     * @param item - the list item
     * @param indexToFocus - the list item index to focus
     */
    const selectRow = (item: TItem, indexToFocus?: number) => {
        // In single-selection lists we don't care about updating the focused index, because the list is closed after selecting an item
        if (canSelectMultiple) {
            if (sections.length > 1) {
                // If the list has only 1 section (e.g. Workspace Members list), we do nothing.
                // If the list has multiple sections (e.g. Workspace Invite list), and `shouldUnfocusRow` is false,
                // we focus the first one after all the selected (selected items are always at the top).
                const selectedOptionsCount = item.isSelected ? flattenedSections.selectedOptions.length - 1 : flattenedSections.selectedOptions.length + 1;

                if (!item.isSelected) {
                    // If we're selecting an item, scroll to it's position at the top, so we can see it
                    scrollToIndex(Math.max(selectedOptionsCount - 1, 0), true);
                }
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
    };

    const selectAllRow = () => {
        onSelectAll?.();

        if (shouldShowTextInput && shouldPreventDefaultFocusOnSelectRow && innerTextInputRef.current) {
            innerTextInputRef.current.focus();
        }
    };

    const selectFocusedOption = () => {
        const focusedOption = focusedIndex !== -1 ? flattenedSections.allOptions.at(focusedIndex) : undefined;

        if (!focusedOption || (focusedOption.isDisabled && !focusedOption.isSelected)) {
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
        const isItemFocused = (!isDisabled || item.isSelected) && (focusedIndex === normalizedIndex || itemsToHighlight?.has(item.keyForList ?? ''));
        // We only create tooltips for the first 10 users or so since some reports have hundreds of users, causing performance to degrade.
        const showTooltip = shouldShowTooltips && normalizedIndex < 10;

        const handleOnCheckboxPress = () => {
            if (SearchUtils.isReportListItemType(item)) {
                return onCheckboxPress;
            }
            return onCheckboxPress ? () => onCheckboxPress(item) : undefined;
        };

        return (
            <>
                <ListItem
                    item={item}
                    isFocused={isItemFocused}
                    isDisabled={isDisabled}
                    showTooltip={showTooltip}
                    canSelectMultiple={canSelectMultiple}
                    onLongPressRow={onLongPressRow}
                    onSelectRow={() => {
                        if (shouldSingleExecuteRowSelect) {
                            singleExecution(() => selectRow(item, index))();
                        } else {
                            selectRow(item, index);
                        }
                    }}
                    onCheckboxPress={handleOnCheckboxPress()}
                    onDismissError={() => onDismissError?.(item)}
                    shouldPreventDefaultFocusOnSelectRow={shouldPreventDefaultFocusOnSelectRow}
                    // We're already handling the Enter key press in the useKeyboardShortcut hook, so we don't want the list item to submit the form
                    shouldPreventEnterKeySubmit
                    rightHandSideComponent={rightHandSideComponent}
                    keyForList={item.keyForList ?? ''}
                    isMultilineSupported={isRowMultilineSupported}
                    isAlternateTextMultilineSupported={isAlternateTextMultilineSupported}
                    alternateTextNumberOfLines={alternateTextNumberOfLines}
                    onFocus={() => {
                        if (!!shouldIgnoreFocus || isDisabled) {
                            return;
                        }
                        setFocusedIndex(normalizedIndex);
                    }}
                    shouldSyncFocus={!isTextInputFocusedRef.current}
                />
                {item.footerContent && item.footerContent}
            </>
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
            scrollToIndex(focusedIndex, false);
            setIsInitialSectionListRender(false);
        },
        [focusedIndex, isInitialSectionListRender, scrollToIndex, shouldUseDynamicMaxToRenderPerBatch],
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
                    focusTextInput();
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
            shouldUpdateFocusedIndex
        ) {
            return;
        }
        // Remove the focus if the search input is empty or selected options length is changed (and allOptions length remains the same)
        // else focus on the first non disabled item
        const newSelectedIndex =
            textInputValue === '' || (flattenedSections.selectedOptions.length !== prevSelectedOptionsLength && prevAllOptionsLength === flattenedSections.allOptions.length) ? -1 : 0;

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
        (items: string[], timeout: number) => {
            const newItemsToHighlight = new Set<string>();
            items.forEach((item) => {
                newItemsToHighlight.add(item);
            });
            const index = flattenedSections.allOptions.findIndex((option) => newItemsToHighlight.has(option.keyForList ?? ''));
            updateAndScrollToFocusedIndex(index);
            setItemsToHighlight(newItemsToHighlight);

            if (itemFocusTimeoutRef.current) {
                clearTimeout(itemFocusTimeoutRef.current);
            }

            itemFocusTimeoutRef.current = setTimeout(() => {
                setFocusedIndex(-1);
                setItemsToHighlight(null);
            }, timeout);
        },
        [flattenedSections.allOptions, setFocusedIndex, updateAndScrollToFocusedIndex],
    );

    useImperativeHandle(ref, () => ({scrollAndHighlightItem, clearInputAfterSelect, scrollToIndex}), [scrollAndHighlightItem, clearInputAfterSelect, scrollToIndex]);

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
            isActive: !disableKeyboardShortcuts && isFocused,
        },
    );

    return (
        <SafeAreaConsumer>
            {({safeAreaPaddingBottomStyle}) => (
                <View style={[styles.flex1, (!isKeyboardShown || !!footerContent || showConfirmButton) && safeAreaPaddingBottomStyle, containerStyle]}>
                    {shouldShowTextInput && (
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
                    )}
                    {/* If we are loading new options we will avoid showing any header message. This is mostly because one of the header messages says there are no options. */}
                    {/* This is misleading because we might be in the process of loading fresh options from the server. */}
                    {(!isLoadingNewOptions || headerMessage !== translate('common.noResultsFound') || (flattenedSections.allOptions.length === 0 && !showLoadingPlaceholder)) &&
                        !!headerMessage && (
                            <View style={headerMessageStyle ?? [styles.ph5, styles.pb5]}>
                                <Text style={[styles.textLabel, styles.colorMuted, styles.minHeight5]}>{headerMessage}</Text>
                            </View>
                        )}
                    {!!headerContent && headerContent}
                    {flattenedSections.allOptions.length === 0 ? (
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
                                keyExtractor={(item, index) => item.keyForList ?? `${index}`}
                                extraData={focusedIndex}
                                // the only valid values on the new arch are "white", "black", and "default", other values will cause a crash
                                indicatorStyle="white"
                                keyboardShouldPersistTaps="always"
                                showsVerticalScrollIndicator={showScrollIndicator}
                                initialNumToRender={12}
                                maxToRenderPerBatch={maxToRenderPerBatch}
                                windowSize={windowSize}
                                updateCellsBatchingPeriod={updateCellsBatchingPeriod}
                                viewabilityConfig={{viewAreaCoveragePercentThreshold: 95}}
                                testID="selection-list"
                                onLayout={onSectionListLayout}
                                style={[(!maxToRenderPerBatch || (shouldHideListOnInitialRender && isInitialSectionListRender)) && styles.opacity0, sectionListStyle]}
                                ListHeaderComponent={listHeaderContent}
                                ListFooterComponent={listFooterContent ?? ShowMoreButtonInstance}
                                onEndReached={onEndReached}
                                onEndReachedThreshold={onEndReachedThreshold}
                                scrollEventThrottle={scrollEventThrottle}
                                contentContainerStyle={contentContainerStyle}
                            />
                            {children}
                        </>
                    )}
                    {showConfirmButton && (
                        <FixedFooter style={[styles.mtAuto]}>
                            <Button
                                success
                                large
                                style={[styles.w100]}
                                text={confirmButtonText || translate('common.confirm')}
                                onPress={onConfirm}
                                pressOnEnter
                                enterKeyEventListenerPriority={1}
                            />
                        </FixedFooter>
                    )}
                    {!!footerContent && <FixedFooter style={[styles.mtAuto]}>{footerContent}</FixedFooter>}
                </View>
            )}
        </SafeAreaConsumer>
    );
}

BaseSelectionList.displayName = 'BaseSelectionList';

export default forwardRef(BaseSelectionList);
