"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var debounce_1 = require("lodash/debounce");
var isEmpty_1 = require("lodash/isEmpty");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var Checkbox_1 = require("@components/Checkbox");
var FixedFooter_1 = require("@components/FixedFooter");
var OptionsListSkeletonView_1 = require("@components/OptionsListSkeletonView");
var Pressable_1 = require("@components/Pressable");
var SectionList_1 = require("@components/SectionList");
var ShowMoreButton_1 = require("@components/ShowMoreButton");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useActiveElementRole_1 = require("@hooks/useActiveElementRole");
var useArrowKeyFocusManager_1 = require("@hooks/useArrowKeyFocusManager");
var useKeyboardShortcut_1 = require("@hooks/useKeyboardShortcut");
var useKeyboardState_1 = require("@hooks/useKeyboardState");
var useLocalize_1 = require("@hooks/useLocalize");
var usePrevious_1 = require("@hooks/usePrevious");
var useSafeAreaPaddings_1 = require("@hooks/useSafeAreaPaddings");
var useScrollEnabled_1 = require("@hooks/useScrollEnabled");
var useSingleExecution_1 = require("@hooks/useSingleExecution");
var useSyncFocusImplementation_1 = require("@hooks/useSyncFocus/useSyncFocusImplementation");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var getSectionsWithIndexOffset_1 = require("@libs/getSectionsWithIndexOffset");
var KeyDownPressListener_1 = require("@libs/KeyboardShortcut/KeyDownPressListener");
var Log_1 = require("@libs/Log");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var arraysEqual_1 = require("@src/utils/arraysEqual");
var BaseSelectionListItemRenderer_1 = require("./BaseSelectionListItemRenderer");
var FocusAwareCellRendererComponent_1 = require("./FocusAwareCellRendererComponent");
var getDefaultItemHeight = function () { return variables_1.default.optionRowHeight; };
function BaseSelectionList(_a, ref) {
    var sections = _a.sections, ListItem = _a.ListItem, shouldUseUserSkeletonView = _a.shouldUseUserSkeletonView, _b = _a.canSelectMultiple, canSelectMultiple = _b === void 0 ? false : _b, onSelectRow = _a.onSelectRow, _c = _a.shouldSingleExecuteRowSelect, shouldSingleExecuteRowSelect = _c === void 0 ? false : _c, onCheckboxPress = _a.onCheckboxPress, onSelectAll = _a.onSelectAll, onDismissError = _a.onDismissError, _d = _a.getItemHeight, getItemHeight = _d === void 0 ? getDefaultItemHeight : _d, _e = _a.textInputLabel, textInputLabel = _e === void 0 ? '' : _e, _f = _a.textInputPlaceholder, textInputPlaceholder = _f === void 0 ? '' : _f, _g = _a.textInputValue, textInputValue = _g === void 0 ? '' : _g, textInputStyle = _a.textInputStyle, textInputHint = _a.textInputHint, textInputMaxLength = _a.textInputMaxLength, _h = _a.inputMode, inputMode = _h === void 0 ? CONST_1.default.INPUT_MODE.TEXT : _h, onChangeText = _a.onChangeText, _j = _a.initiallyFocusedOptionKey, initiallyFocusedOptionKey = _j === void 0 ? '' : _j, onScroll = _a.onScroll, onScrollBeginDrag = _a.onScrollBeginDrag, _k = _a.headerMessage, headerMessage = _k === void 0 ? '' : _k, _l = _a.confirmButtonText, confirmButtonText = _l === void 0 ? '' : _l, onConfirm = _a.onConfirm, headerContent = _a.headerContent, footerContent = _a.footerContent, listFooterContent = _a.listFooterContent, footerContentAbovePagination = _a.footerContentAbovePagination, listEmptyContent = _a.listEmptyContent, _m = _a.showScrollIndicator, showScrollIndicator = _m === void 0 ? true : _m, _o = _a.showLoadingPlaceholder, showLoadingPlaceholder = _o === void 0 ? false : _o, _p = _a.showConfirmButton, showConfirmButton = _p === void 0 ? false : _p, _q = _a.isConfirmButtonDisabled, isConfirmButtonDisabled = _q === void 0 ? false : _q, _r = _a.shouldUseDefaultTheme, shouldUseDefaultTheme = _r === void 0 ? false : _r, _s = _a.shouldPreventDefaultFocusOnSelectRow, shouldPreventDefaultFocusOnSelectRow = _s === void 0 ? false : _s, containerStyle = _a.containerStyle, sectionListStyle = _a.sectionListStyle, _t = _a.disableKeyboardShortcuts, disableKeyboardShortcuts = _t === void 0 ? false : _t, children = _a.children, _u = _a.shouldStopPropagation, shouldStopPropagation = _u === void 0 ? false : _u, _v = _a.shouldPreventDefault, shouldPreventDefault = _v === void 0 ? true : _v, _w = _a.shouldShowTooltips, shouldShowTooltips = _w === void 0 ? true : _w, _x = _a.shouldUseDynamicMaxToRenderPerBatch, shouldUseDynamicMaxToRenderPerBatch = _x === void 0 ? false : _x, rightHandSideComponent = _a.rightHandSideComponent, _y = _a.isLoadingNewOptions, isLoadingNewOptions = _y === void 0 ? false : _y, onLayout = _a.onLayout, customListHeader = _a.customListHeader, _z = _a.customListHeaderHeight, customListHeaderHeight = _z === void 0 ? 0 : _z, listHeaderWrapperStyle = _a.listHeaderWrapperStyle, _0 = _a.isRowMultilineSupported, isRowMultilineSupported = _0 === void 0 ? false : _0, _1 = _a.isAlternateTextMultilineSupported, isAlternateTextMultilineSupported = _1 === void 0 ? false : _1, _2 = _a.alternateTextNumberOfLines, alternateTextNumberOfLines = _2 === void 0 ? 2 : _2, textInputRef = _a.textInputRef, headerMessageStyle = _a.headerMessageStyle, confirmButtonStyles = _a.confirmButtonStyles, _3 = _a.shouldHideListOnInitialRender, shouldHideListOnInitialRender = _3 === void 0 ? true : _3, textInputIconLeft = _a.textInputIconLeft, sectionTitleStyles = _a.sectionTitleStyles, _4 = _a.textInputAutoFocus, textInputAutoFocus = _4 === void 0 ? true : _4, _5 = _a.shouldShowTextInputAfterHeader, shouldShowTextInputAfterHeader = _5 === void 0 ? false : _5, _6 = _a.shouldShowHeaderMessageAfterHeader, shouldShowHeaderMessageAfterHeader = _6 === void 0 ? false : _6, _7 = _a.includeSafeAreaPaddingBottom, includeSafeAreaPaddingBottom = _7 === void 0 ? true : _7, _8 = _a.shouldTextInputInterceptSwipe, shouldTextInputInterceptSwipe = _8 === void 0 ? false : _8, listHeaderContent = _a.listHeaderContent, _9 = _a.onEndReached, onEndReached = _9 === void 0 ? function () { } : _9, onEndReachedThreshold = _a.onEndReachedThreshold, _10 = _a.windowSize, windowSize = _10 === void 0 ? 5 : _10, _11 = _a.updateCellsBatchingPeriod, updateCellsBatchingPeriod = _11 === void 0 ? 50 : _11, _12 = _a.removeClippedSubviews, removeClippedSubviews = _12 === void 0 ? true : _12, _13 = _a.shouldDelayFocus, shouldDelayFocus = _13 === void 0 ? true : _13, _14 = _a.onArrowFocus, onArrowFocus = _14 === void 0 ? function () { } : _14, _15 = _a.shouldUpdateFocusedIndex, shouldUpdateFocusedIndex = _15 === void 0 ? false : _15, onLongPressRow = _a.onLongPressRow, _16 = _a.shouldShowTextInput, shouldShowTextInput = _16 === void 0 ? !!textInputLabel || !!textInputIconLeft : _16, _17 = _a.shouldShowListEmptyContent, shouldShowListEmptyContent = _17 === void 0 ? true : _17, listItemWrapperStyle = _a.listItemWrapperStyle, _18 = _a.shouldIgnoreFocus, shouldIgnoreFocus = _18 === void 0 ? false : _18, scrollEventThrottle = _a.scrollEventThrottle, contentContainerStyle = _a.contentContainerStyle, _19 = _a.shouldKeepFocusedItemAtTopOfViewableArea, shouldKeepFocusedItemAtTopOfViewableArea = _19 === void 0 ? false : _19, _20 = _a.shouldDebounceScrolling, shouldDebounceScrolling = _20 === void 0 ? false : _20, _21 = _a.shouldPreventActiveCellVirtualization, shouldPreventActiveCellVirtualization = _21 === void 0 ? false : _21, _22 = _a.shouldScrollToFocusedIndex, shouldScrollToFocusedIndex = _22 === void 0 ? true : _22, isSmallScreenWidth = _a.isSmallScreenWidth, onContentSizeChange = _a.onContentSizeChange, listItemTitleStyles = _a.listItemTitleStyles, _23 = _a.initialNumToRender, initialNumToRender = _23 === void 0 ? 12 : _23, listItemTitleContainerStyles = _a.listItemTitleContainerStyles, _24 = _a.isScreenFocused, isScreenFocused = _24 === void 0 ? false : _24, _25 = _a.shouldSubscribeToArrowKeyEvents, shouldSubscribeToArrowKeyEvents = _25 === void 0 ? true : _25, _26 = _a.shouldClearInputOnSelect, shouldClearInputOnSelect = _26 === void 0 ? true : _26, addBottomSafeAreaPadding = _a.addBottomSafeAreaPadding, addOfflineIndicatorBottomSafeAreaPadding = _a.addOfflineIndicatorBottomSafeAreaPadding, fixedNumItemsForLoader = _a.fixedNumItemsForLoader, loaderSpeed = _a.loaderSpeed, errorText = _a.errorText, shouldUseDefaultRightHandSideCheckmark = _a.shouldUseDefaultRightHandSideCheckmark, _27 = _a.selectedItems, selectedItems = _27 === void 0 ? [] : _27, isSelected = _a.isSelected;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var listRef = (0, react_1.useRef)(null);
    var innerTextInputRef = (0, react_1.useRef)(null);
    var hasKeyBeenPressed = (0, react_1.useRef)(false);
    var focusTimeoutRef = (0, react_1.useRef)(null);
    var shouldShowSelectAll = !!onSelectAll;
    var activeElementRole = (0, useActiveElementRole_1.default)();
    var isFocused = (0, native_1.useIsFocused)();
    var scrollEnabled = (0, useScrollEnabled_1.default)();
    var _28 = (0, react_1.useState)(shouldUseDynamicMaxToRenderPerBatch ? 0 : CONST_1.default.MAX_TO_RENDER_PER_BATCH.DEFAULT), maxToRenderPerBatch = _28[0], setMaxToRenderPerBatch = _28[1];
    var _29 = (0, react_1.useState)(true), isInitialSectionListRender = _29[0], setIsInitialSectionListRender = _29[1];
    var isKeyboardShown = (0, useKeyboardState_1.default)().isKeyboardShown;
    var _30 = (0, react_1.useState)(null), itemsToHighlight = _30[0], setItemsToHighlight = _30[1];
    var itemFocusTimeoutRef = (0, react_1.useRef)(null);
    var _31 = (0, react_1.useState)(1), currentPage = _31[0], setCurrentPage = _31[1];
    var isTextInputFocusedRef = (0, react_1.useRef)(false);
    var singleExecution = (0, useSingleExecution_1.default)().singleExecution;
    var _32 = (0, react_1.useState)({}), itemHeights = _32[0], setItemHeights = _32[1];
    var onItemLayout = function (event, itemKey) {
        if (!itemKey) {
            return;
        }
        var height = event.nativeEvent.layout.height;
        setItemHeights(function (prevHeights) {
            var _a;
            return (__assign(__assign({}, prevHeights), (_a = {}, _a[itemKey] = height, _a)));
        });
    };
    var incrementPage = function () { return setCurrentPage(function (prev) { return prev + 1; }); };
    var isItemSelected = (0, react_1.useCallback)(function (item) { var _a, _b, _c; return (_a = item.isSelected) !== null && _a !== void 0 ? _a : (((_b = isSelected === null || isSelected === void 0 ? void 0 : isSelected(item)) !== null && _b !== void 0 ? _b : selectedItems.includes((_c = item.keyForList) !== null && _c !== void 0 ? _c : '')) && canSelectMultiple); }, [isSelected, selectedItems, canSelectMultiple]);
    /**
     * Iterates through the sections and items inside each section, and builds 4 arrays along the way:
     * - `allOptions`: Contains all the items in the list, flattened, regardless of section
     * - `disabledOptionsIndexes`: Contains the indexes of all the unselectable and disabled items in the list
     * - `disabledArrowKeyOptionsIndexes`: Contains the indexes of item that is not navigable by the arrow key. The list is separated from disabledOptionsIndexes because unselectable item is still navigable by the arrow key.
     * - `itemLayouts`: Contains the layout information for each item, header and footer in the list,
     * so we can calculate the position of any given item when scrolling programmatically
     */
    var flattenedSections = (0, react_1.useMemo)(function () {
        var allOptions = [];
        var disabledOptionsIndexes = [];
        var disabledArrowKeyOptionsIndexes = [];
        var disabledIndex = 0;
        // need to account that the list might have some extra content above it
        var offset = customListHeader ? customListHeaderHeight : 0;
        var itemLayouts = [{ length: 0, offset: offset }];
        var selectedOptions = [];
        sections.forEach(function (section, sectionIndex) {
            var _a;
            var sectionHeaderHeight = !!section.title || !!section.CustomSectionHeader ? variables_1.default.optionsListSectionHeaderHeight : 0;
            itemLayouts.push({ length: sectionHeaderHeight, offset: offset });
            offset += sectionHeaderHeight;
            (_a = section.data) === null || _a === void 0 ? void 0 : _a.forEach(function (item, optionIndex) {
                // Add item to the general flattened array
                allOptions.push(__assign(__assign({}, item), { sectionIndex: sectionIndex, index: optionIndex }));
                // If disabled, add to the disabled indexes array
                var isItemDisabled = !!section.isDisabled || (item.isDisabled && !isItemSelected(item));
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                if (isItemDisabled || item.isDisabledCheckbox) {
                    disabledOptionsIndexes.push(disabledIndex);
                    if (isItemDisabled) {
                        disabledArrowKeyOptionsIndexes.push(disabledIndex);
                    }
                }
                disabledIndex += 1;
                // Account for the height of the item in getItemLayout
                var fullItemHeight = (item === null || item === void 0 ? void 0 : item.keyForList) && itemHeights[item.keyForList] ? itemHeights[item.keyForList] : getItemHeight(item);
                itemLayouts.push({ length: fullItemHeight, offset: offset });
                offset += fullItemHeight;
                if (isItemSelected(item) && !selectedOptions.find(function (option) { return option.keyForList === item.keyForList; })) {
                    selectedOptions.push(item);
                }
            });
            // We're not rendering any section footer, but we need to push to the array
            // because React Native accounts for it in getItemLayout
            itemLayouts.push({ length: 0, offset: offset });
        });
        // We're not rendering the list footer, but we need to push to the array
        // because React Native accounts for it in getItemLayout
        itemLayouts.push({ length: 0, offset: offset });
        if (selectedOptions.length > 1 && !canSelectMultiple) {
            Log_1.default.alert('Dev error: SelectionList - multiple items are selected but prop `canSelectMultiple` is false. Please enable `canSelectMultiple` or make your list have only 1 item with `isSelected: true`.');
        }
        var totalSelectable = allOptions.length - disabledOptionsIndexes.length;
        return {
            allOptions: allOptions,
            selectedOptions: selectedOptions,
            disabledOptionsIndexes: disabledOptionsIndexes,
            disabledArrowKeyOptionsIndexes: disabledArrowKeyOptionsIndexes,
            itemLayouts: itemLayouts,
            allSelected: selectedOptions.length > 0 && selectedOptions.length === totalSelectable,
            someSelected: selectedOptions.length > 0 && selectedOptions.length < totalSelectable,
        };
    }, [customListHeader, customListHeaderHeight, sections, canSelectMultiple, isItemSelected, itemHeights, getItemHeight]);
    var _33 = (0, react_1.useMemo)(function () {
        var remainingOptionsLimit = CONST_1.default.MAX_SELECTION_LIST_PAGE_LENGTH * currentPage;
        var processedSections = (0, getSectionsWithIndexOffset_1.default)(sections.map(function (section) {
            var data = !(0, isEmpty_1.default)(section.data) && remainingOptionsLimit > 0 ? section.data.slice(0, remainingOptionsLimit) : [];
            remainingOptionsLimit -= data.length;
            return __assign(__assign({}, section), { data: data });
        }));
        var shouldShowMoreButton = flattenedSections.allOptions.length > CONST_1.default.MAX_SELECTION_LIST_PAGE_LENGTH * currentPage;
        var showMoreButton = shouldShowMoreButton ? (<ShowMoreButton_1.default containerStyle={[styles.mt2, styles.mb5]} currentCount={CONST_1.default.MAX_SELECTION_LIST_PAGE_LENGTH * currentPage} totalCount={flattenedSections.allOptions.length} onPress={incrementPage}/>) : null;
        return [processedSections, showMoreButton];
        // we don't need to add styles here as they change
        // we don't need to add flattenedSections here as they will change along with sections
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [sections, currentPage]), slicedSections = _33[0], ShowMoreButtonInstance = _33[1];
    // Disable `Enter` shortcut if the active element is a button or checkbox
    var disableEnterShortcut = activeElementRole && [CONST_1.default.ROLE.BUTTON, CONST_1.default.ROLE.CHECKBOX].includes(activeElementRole);
    /**
     * Scrolls to the desired item index in the section list
     *
     * @param index - the index of the item to scroll to
     * @param animated - whether to animate the scroll
     */
    var scrollToIndex = (0, react_1.useCallback)(function (index, animated) {
        var _a, _b;
        if (animated === void 0) { animated = true; }
        var item = flattenedSections.allOptions.at(index);
        if (!listRef.current || !item || index === -1) {
            return;
        }
        var itemIndex = (_a = item.index) !== null && _a !== void 0 ? _a : -1;
        var sectionIndex = (_b = item.sectionIndex) !== null && _b !== void 0 ? _b : -1;
        var viewOffsetToKeepFocusedItemAtTopOfViewableArea = 0;
        // Since there are always two items above the focused item in viewable area, and items can grow beyond the screen size
        // in searchType chat, the focused item may move out of view. To prevent this, we will ensure that the focused item remains at
        // the top of the viewable area at all times by adjusting the viewOffset.
        if (shouldKeepFocusedItemAtTopOfViewableArea) {
            var firstPreviousItem = index > 0 ? flattenedSections.allOptions.at(index - 1) : undefined;
            var firstPreviousItemHeight = firstPreviousItem && firstPreviousItem.keyForList ? itemHeights[firstPreviousItem.keyForList] : 0;
            var secondPreviousItem = index > 1 ? flattenedSections.allOptions.at(index - 2) : undefined;
            var secondPreviousItemHeight = secondPreviousItem && (secondPreviousItem === null || secondPreviousItem === void 0 ? void 0 : secondPreviousItem.keyForList) ? itemHeights[secondPreviousItem.keyForList] : 0;
            viewOffsetToKeepFocusedItemAtTopOfViewableArea = firstPreviousItemHeight + secondPreviousItemHeight;
        }
        listRef.current.scrollToLocation({ sectionIndex: sectionIndex, itemIndex: itemIndex, animated: animated, viewOffset: variables_1.default.contentHeaderHeight - viewOffsetToKeepFocusedItemAtTopOfViewableArea });
    }, 
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    [flattenedSections.allOptions]);
    var _34 = (0, react_1.useState)(flattenedSections.disabledArrowKeyOptionsIndexes), disabledArrowKeyIndexes = _34[0], setDisabledArrowKeyIndexes = _34[1];
    (0, react_1.useEffect)(function () {
        if ((0, arraysEqual_1.default)(disabledArrowKeyIndexes, flattenedSections.disabledArrowKeyOptionsIndexes)) {
            return;
        }
        setDisabledArrowKeyIndexes(flattenedSections.disabledArrowKeyOptionsIndexes);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [flattenedSections.disabledArrowKeyOptionsIndexes]);
    var debouncedScrollToIndex = (0, react_1.useMemo)(function () { return (0, debounce_1.default)(scrollToIndex, CONST_1.default.TIMING.LIST_SCROLLING_DEBOUNCE_TIME, { leading: true, trailing: true }); }, [scrollToIndex]);
    var setHasKeyBeenPressed = (0, react_1.useCallback)(function () {
        if (hasKeyBeenPressed.current) {
            return;
        }
        // We need to track whether a key has been pressed to enable focus syncing only if a key has been pressed.
        // This is to avoid the default behavior of web showing blue border on click of items after a page refresh.
        hasKeyBeenPressed.current = true;
    }, []);
    // If `initiallyFocusedOptionKey` is not passed, we fall back to `-1`, to avoid showing the highlight on the first member
    var _35 = (0, useArrowKeyFocusManager_1.default)(__assign(__assign({ initialFocusedIndex: flattenedSections.allOptions.findIndex(function (option) { return option.keyForList === initiallyFocusedOptionKey; }), maxIndex: Math.min(flattenedSections.allOptions.length - 1, CONST_1.default.MAX_SELECTION_LIST_PAGE_LENGTH * currentPage - 1), disabledIndexes: disabledArrowKeyIndexes, isActive: shouldSubscribeToArrowKeyEvents && isFocused, onFocusedIndexChange: function (index) {
            var focusedItem = flattenedSections.allOptions.at(index);
            if (focusedItem) {
                onArrowFocus(focusedItem);
            }
            if (shouldScrollToFocusedIndex) {
                (shouldDebounceScrolling ? debouncedScrollToIndex : scrollToIndex)(index, true);
            }
        } }, (!hasKeyBeenPressed.current && { setHasKeyBeenPressed: setHasKeyBeenPressed })), { isFocused: isFocused })), focusedIndex = _35[0], setFocusedIndex = _35[1];
    (0, react_1.useEffect)(function () {
        (0, KeyDownPressListener_1.addKeyDownPressListener)(setHasKeyBeenPressed);
        return function () { return (0, KeyDownPressListener_1.removeKeyDownPressListener)(setHasKeyBeenPressed); };
    }, [setHasKeyBeenPressed]);
    var selectedItemIndex = (0, react_1.useMemo)(function () { return (initiallyFocusedOptionKey ? flattenedSections.allOptions.findIndex(isItemSelected) : -1); }, [flattenedSections.allOptions, initiallyFocusedOptionKey, isItemSelected]);
    (0, react_1.useEffect)(function () {
        if (selectedItemIndex === -1 || selectedItemIndex === focusedIndex || textInputValue) {
            return;
        }
        setFocusedIndex(selectedItemIndex);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [selectedItemIndex]);
    var clearInputAfterSelect = (0, react_1.useCallback)(function () {
        if (!shouldClearInputOnSelect) {
            return;
        }
        onChangeText === null || onChangeText === void 0 ? void 0 : onChangeText('');
    }, [onChangeText, shouldClearInputOnSelect]);
    /**
     * Logic to run when a row is selected, either with click/press or keyboard hotkeys.
     *
     * @param item - the list item
     * @param indexToFocus - the list item index to focus
     */
    var selectRow = (0, react_1.useCallback)(function (item, indexToFocus) {
        if (!isFocused && !isScreenFocused) {
            return;
        }
        // In single-selection lists we don't care about updating the focused index, because the list is closed after selecting an item
        if (canSelectMultiple) {
            if (sections.length > 1 && !isItemSelected(item)) {
                // If we're selecting an item, scroll to it's position at the top, so we can see it
                scrollToIndex(0, true);
            }
            if (shouldShowTextInput) {
                clearInputAfterSelect();
            }
            else if (isSmallScreenWidth) {
                if (!item.isDisabledCheckbox) {
                    onCheckboxPress === null || onCheckboxPress === void 0 ? void 0 : onCheckboxPress(item);
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
    }, [
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
    ]);
    var selectAllRow = function () {
        onSelectAll === null || onSelectAll === void 0 ? void 0 : onSelectAll();
        if (shouldShowTextInput && shouldPreventDefaultFocusOnSelectRow && innerTextInputRef.current) {
            innerTextInputRef.current.focus();
        }
    };
    var getFocusedOption = (0, react_1.useCallback)(function () {
        var focusedOption = focusedIndex !== -1 ? flattenedSections.allOptions.at(focusedIndex) : undefined;
        if (!focusedOption || (focusedOption.isDisabled && !isItemSelected(focusedOption))) {
            return;
        }
        return focusedOption;
    }, [flattenedSections.allOptions, focusedIndex, isItemSelected]);
    var selectFocusedOption = function () {
        var focusedOption = getFocusedOption();
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
    var getItemLayout = function (data, flatDataArrayIndex) {
        var targetItem = flattenedSections.itemLayouts.at(flatDataArrayIndex);
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
    var renderSectionHeader = function (_a) {
        var section = _a.section;
        if (section.CustomSectionHeader) {
            return <section.CustomSectionHeader section={section}/>;
        }
        if (!section.title || (0, EmptyObject_1.isEmptyObject)(section.data) || listHeaderContent) {
            return null;
        }
        return (
        // Note: The `optionsListSectionHeader` style provides an explicit height to section headers.
        // We do this so that we can reference the height in `getItemLayout` –
        // we need to know the heights of all list items up-front in order to synchronously compute the layout of any given list item.
        // So be aware that if you adjust the content of the section header (for example, change the font size), you may need to adjust this explicit height as well.
        <react_native_1.View style={[styles.optionsListSectionHeader, styles.justifyContentCenter, sectionTitleStyles]}>
                <Text_1.default style={[styles.ph5, styles.textLabelSupporting]}>{section.title}</Text_1.default>
            </react_native_1.View>);
    };
    var header = function () {
        var _a;
        return (<>
            {!headerMessage && canSelectMultiple && shouldShowSelectAll && (<react_native_1.View style={[styles.userSelectNone, styles.peopleRow, styles.ph5, styles.pb3, listHeaderWrapperStyle, styles.selectionListStickyHeader]}>
                    <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter]}>
                        <Checkbox_1.default accessibilityLabel={translate('workspace.people.selectAll')} isChecked={flattenedSections.allSelected} isIndeterminate={flattenedSections.someSelected} onPress={selectAllRow} disabled={flattenedSections.allOptions.length === flattenedSections.disabledOptionsIndexes.length}/>
                        {!customListHeader && (<Pressable_1.PressableWithFeedback style={[styles.userSelectNone, styles.flexRow, styles.alignItemsCenter]} onPress={selectAllRow} accessibilityLabel={translate('workspace.people.selectAll')} role="button" accessibilityState={{ checked: flattenedSections.allSelected }} disabled={flattenedSections.allOptions.length === flattenedSections.disabledOptionsIndexes.length} dataSet={_a = {}, _a[CONST_1.default.SELECTION_SCRAPER_HIDDEN_ELEMENT] = true, _a} onMouseDown={shouldPreventDefaultFocusOnSelectRow ? function (e) { return e.preventDefault(); } : undefined}>
                                <Text_1.default style={[styles.textStrong, styles.ph3]}>{translate('workspace.people.selectAll')}</Text_1.default>
                            </Pressable_1.PressableWithFeedback>)}
                    </react_native_1.View>
                    {customListHeader}
                </react_native_1.View>)}
            {!headerMessage && !canSelectMultiple && customListHeader}
        </>);
    };
    var renderItem = function (_a) {
        var _b, _c;
        var item = _a.item, index = _a.index, section = _a.section;
        var normalizedIndex = index + ((_b = section === null || section === void 0 ? void 0 : section.indexOffset) !== null && _b !== void 0 ? _b : 0);
        var isDisabled = !!section.isDisabled || item.isDisabled;
        var selected = isItemSelected(item);
        var isItemFocused = (!isDisabled || selected) && focusedIndex === normalizedIndex;
        var isItemHighlighted = !!(itemsToHighlight === null || itemsToHighlight === void 0 ? void 0 : itemsToHighlight.has((_c = item.keyForList) !== null && _c !== void 0 ? _c : ''));
        return (<react_native_1.View onLayout={function (event) { return onItemLayout(event, item === null || item === void 0 ? void 0 : item.keyForList); }}>
                <BaseSelectionListItemRenderer_1.default ListItem={ListItem} item={__assign({ shouldAnimateInHighlight: isItemHighlighted, isSelected: selected }, item)} shouldUseDefaultRightHandSideCheckmark={shouldUseDefaultRightHandSideCheckmark} index={index} isFocused={isItemFocused} isDisabled={isDisabled} showTooltip={shouldShowTooltips} canSelectMultiple={canSelectMultiple} onLongPressRow={onLongPressRow} shouldSingleExecuteRowSelect={shouldSingleExecuteRowSelect} selectRow={selectRow} onCheckboxPress={onCheckboxPress} onDismissError={onDismissError} shouldPreventDefaultFocusOnSelectRow={shouldPreventDefaultFocusOnSelectRow} rightHandSideComponent={rightHandSideComponent} isMultilineSupported={isRowMultilineSupported} isAlternateTextMultilineSupported={isAlternateTextMultilineSupported} alternateTextNumberOfLines={alternateTextNumberOfLines} shouldIgnoreFocus={shouldIgnoreFocus} setFocusedIndex={setFocusedIndex} normalizedIndex={normalizedIndex} shouldSyncFocus={!isTextInputFocusedRef.current && hasKeyBeenPressed.current} wrapperStyle={listItemWrapperStyle} titleStyles={listItemTitleStyles} singleExecution={singleExecution} titleContainerStyles={listItemTitleContainerStyles}/>
            </react_native_1.View>);
    };
    var renderListEmptyContent = function () {
        if (showLoadingPlaceholder) {
            return (<OptionsListSkeletonView_1.default fixedNumItems={fixedNumItemsForLoader} shouldStyleAsTable={shouldUseUserSkeletonView} speed={loaderSpeed}/>);
        }
        if (shouldShowListEmptyContent) {
            return listEmptyContent;
        }
        return null;
    };
    var textInputKeyPress = (0, react_1.useCallback)(function (event) {
        var key = event.nativeEvent.key;
        if (key === CONST_1.default.KEYBOARD_SHORTCUTS.TAB.shortcutKey) {
            useSyncFocusImplementation_1.focusedItemRef === null || useSyncFocusImplementation_1.focusedItemRef === void 0 ? void 0 : useSyncFocusImplementation_1.focusedItemRef.focus();
        }
    }, []);
    var renderInput = function () {
        return (<react_native_1.View style={[styles.ph5, styles.pb3, textInputStyle]}>
                <TextInput_1.default onKeyPress={textInputKeyPress} ref={function (element) {
                innerTextInputRef.current = element;
                if (!textInputRef) {
                    return;
                }
                if (typeof textInputRef === 'function') {
                    textInputRef(element);
                }
                else {
                    // eslint-disable-next-line no-param-reassign
                    textInputRef.current = element;
                }
            }} onFocus={function () { return (isTextInputFocusedRef.current = true); }} onBlur={function () { return (isTextInputFocusedRef.current = false); }} label={textInputLabel} accessibilityLabel={textInputLabel} hint={textInputHint} role={CONST_1.default.ROLE.PRESENTATION} value={textInputValue} placeholder={textInputPlaceholder} maxLength={textInputMaxLength} onChangeText={onChangeText} inputMode={inputMode} selectTextOnFocus spellCheck={false} iconLeft={textInputIconLeft} onSubmitEditing={selectFocusedOption} blurOnSubmit={!!flattenedSections.allOptions.length} isLoading={isLoadingNewOptions} testID="selection-list-text-input" shouldInterceptSwipe={shouldTextInputInterceptSwipe} errorText={errorText}/>
            </react_native_1.View>);
    };
    var scrollToFocusedIndexOnFirstRender = (0, react_1.useCallback)(function (nativeEvent) {
        if (shouldUseDynamicMaxToRenderPerBatch) {
            var listHeight = nativeEvent.nativeEvent.layout.height;
            var itemHeight = nativeEvent.nativeEvent.layout.y;
            setMaxToRenderPerBatch((Math.ceil(listHeight / itemHeight) || 0) + CONST_1.default.MAX_TO_RENDER_PER_BATCH.DEFAULT);
        }
        if (!isInitialSectionListRender) {
            return;
        }
        if (shouldScrollToFocusedIndex) {
            scrollToIndex(focusedIndex, false);
        }
        setIsInitialSectionListRender(false);
    }, [focusedIndex, isInitialSectionListRender, scrollToIndex, shouldUseDynamicMaxToRenderPerBatch, shouldScrollToFocusedIndex]);
    var onSectionListLayout = (0, react_1.useCallback)(function (nativeEvent) {
        onLayout === null || onLayout === void 0 ? void 0 : onLayout(nativeEvent);
        scrollToFocusedIndexOnFirstRender(nativeEvent);
    }, [onLayout, scrollToFocusedIndexOnFirstRender]);
    var updateAndScrollToFocusedIndex = (0, react_1.useCallback)(function (newFocusedIndex) {
        setFocusedIndex(newFocusedIndex);
        scrollToIndex(newFocusedIndex, true);
    }, [scrollToIndex, setFocusedIndex]);
    /** Function to focus text input */
    var focusTextInput = (0, react_1.useCallback)(function () {
        if (!innerTextInputRef.current) {
            return;
        }
        innerTextInputRef.current.focus();
    }, []);
    /** Focuses the text input when the component comes into focus and after any navigation animations finish. */
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        if (textInputAutoFocus && shouldShowTextInput) {
            if (shouldDelayFocus) {
                focusTimeoutRef.current = setTimeout(focusTextInput, CONST_1.default.ANIMATED_TRANSITION);
            }
            else {
                requestAnimationFrame(focusTextInput);
            }
        }
        return function () { return focusTimeoutRef.current && clearTimeout(focusTimeoutRef.current); };
    }, [shouldShowTextInput, textInputAutoFocus, shouldDelayFocus, focusTextInput]));
    var prevTextInputValue = (0, usePrevious_1.default)(textInputValue);
    var prevSelectedOptionsLength = (0, usePrevious_1.default)(flattenedSections.selectedOptions.length);
    var prevAllOptionsLength = (0, usePrevious_1.default)(flattenedSections.allOptions.length);
    (0, react_1.useEffect)(function () {
        // Avoid changing focus if the textInputValue remains unchanged.
        if ((prevTextInputValue === textInputValue && flattenedSections.selectedOptions.length === prevSelectedOptionsLength) ||
            flattenedSections.allOptions.length === 0 ||
            (flattenedSections.selectedOptions.length !== prevSelectedOptionsLength && shouldUpdateFocusedIndex)) {
            return;
        }
        // Remove the focus if the search input is empty and prev search input not empty or selected options length is changed (and allOptions length remains the same)
        // else focus on the first non disabled item
        var newSelectedIndex = ((0, isEmpty_1.default)(prevTextInputValue) && textInputValue === '') ||
            (flattenedSections.selectedOptions.length !== prevSelectedOptionsLength && prevAllOptionsLength === flattenedSections.allOptions.length)
            ? -1
            : 0;
        // Reset the current page to 1 when the user types something
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
    (0, react_1.useEffect)(function () { return function () {
        if (!itemFocusTimeoutRef.current) {
            return;
        }
        clearTimeout(itemFocusTimeoutRef.current);
    }; }, []);
    /**
     * Highlights the items and scrolls to the first item present in the items list.
     *
     * @param items - The list of items to highlight.
     * @param timeout - The timeout in milliseconds before removing the highlight.
     */
    var scrollAndHighlightItem = (0, react_1.useCallback)(function (items) {
        var newItemsToHighlight = new Set();
        items.forEach(function (item) {
            newItemsToHighlight.add(item);
        });
        var index = flattenedSections.allOptions.findIndex(function (option) { var _a; return newItemsToHighlight.has((_a = option.keyForList) !== null && _a !== void 0 ? _a : ''); });
        scrollToIndex(index);
        setItemsToHighlight(newItemsToHighlight);
        if (itemFocusTimeoutRef.current) {
            clearTimeout(itemFocusTimeoutRef.current);
        }
        var duration = CONST_1.default.ANIMATED_HIGHLIGHT_ENTRY_DELAY +
            CONST_1.default.ANIMATED_HIGHLIGHT_ENTRY_DURATION +
            CONST_1.default.ANIMATED_HIGHLIGHT_START_DELAY +
            CONST_1.default.ANIMATED_HIGHLIGHT_START_DURATION +
            CONST_1.default.ANIMATED_HIGHLIGHT_END_DELAY +
            CONST_1.default.ANIMATED_HIGHLIGHT_END_DURATION;
        itemFocusTimeoutRef.current = setTimeout(function () {
            setItemsToHighlight(null);
        }, duration);
    }, [flattenedSections.allOptions, scrollToIndex]);
    /**
     * Handles isTextInputFocusedRef value when using external TextInput, so external TextInput does not lose focus when typing in it.
     *
     * @param isTextInputFocused - Is external TextInput focused.
     */
    var updateExternalTextInputFocus = (0, react_1.useCallback)(function (isTextInputFocused) {
        isTextInputFocusedRef.current = isTextInputFocused;
    }, []);
    (0, react_1.useImperativeHandle)(ref, function () { return ({ scrollAndHighlightItem: scrollAndHighlightItem, clearInputAfterSelect: clearInputAfterSelect, updateAndScrollToFocusedIndex: updateAndScrollToFocusedIndex, updateExternalTextInputFocus: updateExternalTextInputFocus, scrollToIndex: scrollToIndex, getFocusedOption: getFocusedOption, focusTextInput: focusTextInput }); }, [scrollAndHighlightItem, clearInputAfterSelect, updateAndScrollToFocusedIndex, updateExternalTextInputFocus, scrollToIndex, getFocusedOption, focusTextInput]);
    /** Selects row when pressing Enter */
    (0, useKeyboardShortcut_1.default)(CONST_1.default.KEYBOARD_SHORTCUTS.ENTER, selectFocusedOption, {
        captureOnInputs: true,
        shouldBubble: !flattenedSections.allOptions.at(focusedIndex) || focusedIndex === -1,
        shouldStopPropagation: shouldStopPropagation,
        shouldPreventDefault: shouldPreventDefault,
        isActive: !disableKeyboardShortcuts && !disableEnterShortcut && isFocused && focusedIndex >= 0,
    });
    /** Calls confirm action when pressing CTRL (CMD) + Enter */
    (0, useKeyboardShortcut_1.default)(CONST_1.default.KEYBOARD_SHORTCUTS.CTRL_ENTER, function (e) {
        var focusedOption = focusedIndex !== -1 ? flattenedSections.allOptions.at(focusedIndex) : undefined;
        if (onConfirm) {
            onConfirm(e, focusedOption);
            return;
        }
        selectFocusedOption();
    }, {
        captureOnInputs: true,
        shouldBubble: !flattenedSections.allOptions.at(focusedIndex) || focusedIndex === -1,
        isActive: !disableKeyboardShortcuts && isFocused && !isConfirmButtonDisabled,
    });
    var headerMessageContent = function () {
        return (!isLoadingNewOptions || headerMessage !== translate('common.noResultsFound') || (flattenedSections.allOptions.length === 0 && !showLoadingPlaceholder)) &&
            !!headerMessage && (<react_native_1.View style={headerMessageStyle !== null && headerMessageStyle !== void 0 ? headerMessageStyle : [styles.ph5, styles.pb5]}>
                <Text_1.default style={[styles.textLabel, styles.colorMuted, styles.minHeight5]}>{headerMessage}</Text_1.default>
            </react_native_1.View>);
    };
    var safeAreaPaddingBottomStyle = (0, useSafeAreaPaddings_1.default)().safeAreaPaddingBottomStyle;
    var paddingBottomStyle = (0, react_1.useMemo)(function () { return (!isKeyboardShown || !!footerContent) && includeSafeAreaPaddingBottom && safeAreaPaddingBottomStyle; }, [footerContent, includeSafeAreaPaddingBottom, isKeyboardShown, safeAreaPaddingBottomStyle]);
    var shouldHideContentBottomSafeAreaPadding = showConfirmButton || !!footerContent;
    // TODO: test _every_ component that uses SelectionList
    return (<react_native_1.View style={[styles.flex1, !addBottomSafeAreaPadding && paddingBottomStyle, containerStyle]}>
            {shouldShowTextInput && !shouldShowTextInputAfterHeader && renderInput()}
            {/* If we are loading new options we will avoid showing any header message. This is mostly because one of the header messages says there are no options. */}
            {/* This is misleading because we might be in the process of loading fresh options from the server. */}
            {!shouldShowHeaderMessageAfterHeader && headerMessageContent()}
            {!!headerContent && headerContent}
            {flattenedSections.allOptions.length === 0 && (showLoadingPlaceholder || shouldShowListEmptyContent) ? (renderListEmptyContent()) : (<>
                    {!listHeaderContent && header()}
                    <SectionList_1.default removeClippedSubviews={removeClippedSubviews} ref={listRef} sections={slicedSections} stickySectionHeadersEnabled={false} renderSectionHeader={function (arg) { return (<>
                                {renderSectionHeader(arg)}
                                {listHeaderContent && header()}
                            </>); }} renderItem={renderItem} getItemLayout={getItemLayout} onScroll={onScroll} onScrollBeginDrag={onScrollBeginDrag} onContentSizeChange={onContentSizeChange} keyExtractor={function (item, index) { var _a; return (_a = item.keyForList) !== null && _a !== void 0 ? _a : "".concat(index); }} extraData={focusedIndex} 
        // the only valid values on the new arch are "white", "black", and "default", other values will cause a crash
        indicatorStyle="white" keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={showScrollIndicator} initialNumToRender={initialNumToRender} maxToRenderPerBatch={maxToRenderPerBatch} windowSize={windowSize} updateCellsBatchingPeriod={updateCellsBatchingPeriod} viewabilityConfig={{ viewAreaCoveragePercentThreshold: 95 }} testID="selection-list" onLayout={onSectionListLayout} style={[(!maxToRenderPerBatch || (shouldHideListOnInitialRender && isInitialSectionListRender)) && styles.opacity0, sectionListStyle]} ListHeaderComponent={shouldShowTextInput && shouldShowTextInputAfterHeader ? (<>
                                    {listHeaderContent}
                                    {renderInput()}
                                    {shouldShowHeaderMessageAfterHeader && headerMessageContent()}
                                </>) : (listHeaderContent)} scrollEnabled={scrollEnabled} ListFooterComponent={<>
                                {footerContentAbovePagination}
                                {listFooterContent !== null && listFooterContent !== void 0 ? listFooterContent : ShowMoreButtonInstance}
                            </>} onEndReached={onEndReached} onEndReachedThreshold={onEndReachedThreshold} scrollEventThrottle={scrollEventThrottle} addBottomSafeAreaPadding={!shouldHideContentBottomSafeAreaPadding && addBottomSafeAreaPadding} addOfflineIndicatorBottomSafeAreaPadding={!shouldHideContentBottomSafeAreaPadding && addOfflineIndicatorBottomSafeAreaPadding} contentContainerStyle={contentContainerStyle} CellRendererComponent={shouldPreventActiveCellVirtualization ? FocusAwareCellRendererComponent_1.default : undefined}/>
                    {children}
                </>)}
            {showConfirmButton && (<FixedFooter_1.default style={styles.mtAuto} addBottomSafeAreaPadding={addBottomSafeAreaPadding} addOfflineIndicatorBottomSafeAreaPadding={addOfflineIndicatorBottomSafeAreaPadding}>
                    <Button_1.default success={!shouldUseDefaultTheme} large style={[styles.w100, confirmButtonStyles]} text={confirmButtonText || translate('common.confirm')} onPress={onConfirm} pressOnEnter enterKeyEventListenerPriority={1} isDisabled={isConfirmButtonDisabled}/>
                </FixedFooter_1.default>)}
            {!!footerContent && (<FixedFooter_1.default style={styles.mtAuto} addBottomSafeAreaPadding={addBottomSafeAreaPadding} addOfflineIndicatorBottomSafeAreaPadding={addOfflineIndicatorBottomSafeAreaPadding}>
                    {footerContent}
                </FixedFooter_1.default>)}
        </react_native_1.View>);
}
BaseSelectionList.displayName = 'BaseSelectionList';
exports.default = (0, react_1.forwardRef)(BaseSelectionList);
