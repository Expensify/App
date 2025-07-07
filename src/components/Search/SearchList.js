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
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_reanimated_1 = require("react-native-reanimated");
var Checkbox_1 = require("@components/Checkbox");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var Modal_1 = require("@components/Modal");
var Pressable_1 = require("@components/Pressable");
var Text_1 = require("@components/Text");
var useArrowKeyFocusManager_1 = require("@hooks/useArrowKeyFocusManager");
var useKeyboardShortcut_1 = require("@hooks/useKeyboardShortcut");
var useKeyboardState_1 = require("@hooks/useKeyboardState");
var useLocalize_1 = require("@hooks/useLocalize");
var useMobileSelectionMode_1 = require("@hooks/useMobileSelectionMode");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useSafeAreaPaddings_1 = require("@hooks/useSafeAreaPaddings");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var MobileSelectionMode_1 = require("@libs/actions/MobileSelectionMode");
var Browser_1 = require("@libs/Browser");
var KeyDownPressListener_1 = require("@libs/KeyboardShortcut/KeyDownPressListener");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var onScrollToIndexFailed = function () { };
function SearchList(_a, ref) {
    var _b;
    var data = _a.data, ListItem = _a.ListItem, SearchTableHeader = _a.SearchTableHeader, onSelectRow = _a.onSelectRow, onCheckboxPress = _a.onCheckboxPress, canSelectMultiple = _a.canSelectMultiple, onScroll = _a.onScroll, onAllCheckboxPress = _a.onAllCheckboxPress, contentContainerStyle = _a.contentContainerStyle, onEndReachedThreshold = _a.onEndReachedThreshold, onEndReached = _a.onEndReached, containerStyle = _a.containerStyle, ListFooterComponent = _a.ListFooterComponent, shouldPreventDefaultFocusOnSelectRow = _a.shouldPreventDefaultFocusOnSelectRow, shouldPreventLongPressRow = _a.shouldPreventLongPressRow, queryJSON = _a.queryJSON, onViewableItemsChanged = _a.onViewableItemsChanged, onLayout = _a.onLayout;
    var styles = (0, useThemeStyles_1.default)();
    var hash = queryJSON.hash, groupBy = queryJSON.groupBy;
    var flattenedTransactions = groupBy ? data.flatMap(function (item) { return item.transactions; }) : data;
    var flattenedTransactionWithoutPendingDelete = flattenedTransactions.filter(function (t) { return t.pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE; });
    var selectedItemsLength = flattenedTransactions.reduce(function (acc, item) {
        return (item === null || item === void 0 ? void 0 : item.isSelected) ? acc + 1 : acc;
    }, 0);
    var translate = (0, useLocalize_1.default)().translate;
    var isFocused = (0, native_1.useIsFocused)();
    var listRef = (0, react_1.useRef)(null);
    var hasKeyBeenPressed = (0, react_1.useRef)(false);
    var _c = (0, react_1.useState)(null), itemsToHighlight = _c[0], setItemsToHighlight = _c[1];
    var itemFocusTimeoutRef = (0, react_1.useRef)(null);
    var isKeyboardShown = (0, useKeyboardState_1.default)().isKeyboardShown;
    var safeAreaPaddingBottomStyle = (0, useSafeAreaPaddings_1.default)().safeAreaPaddingBottomStyle;
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout here because there is a race condition that causes shouldUseNarrowLayout to change indefinitely in this component
    // See https://github.com/Expensify/App/issues/48675 for more details
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var isSmallScreenWidth = (0, useResponsiveLayout_1.default)().isSmallScreenWidth;
    var _d = (0, react_1.useState)(false), isModalVisible = _d[0], setIsModalVisible = _d[1];
    var selectionMode = (0, useMobileSelectionMode_1.default)().selectionMode;
    var _e = (0, react_1.useState)(), longPressedItem = _e[0], setLongPressedItem = _e[1];
    // Check if selection should be on when the modal is opened
    var wasSelectionOnRef = (0, react_1.useRef)(false);
    // Keep track of the number of selected items to determine if we should turn off selection mode
    var selectionRef = (0, react_1.useRef)(0);
    var policies = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY, {
        canBeMissing: true,
    })[0];
    var allReports = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT, { canBeMissing: false })[0];
    (0, react_1.useEffect)(function () {
        selectionRef.current = selectedItemsLength;
        if (!isSmallScreenWidth) {
            if (selectedItemsLength === 0) {
                (0, MobileSelectionMode_1.turnOffMobileSelectionMode)();
            }
            return;
        }
        if (!isFocused) {
            return;
        }
        if (!wasSelectionOnRef.current && selectedItemsLength > 0) {
            wasSelectionOnRef.current = true;
        }
        if (selectedItemsLength > 0 && !(selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled)) {
            (0, MobileSelectionMode_1.turnOnMobileSelectionMode)();
        }
        else if (selectedItemsLength === 0 && (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) && !wasSelectionOnRef.current) {
            (0, MobileSelectionMode_1.turnOffMobileSelectionMode)();
        }
    }, [selectionMode, isSmallScreenWidth, isFocused, selectedItemsLength]);
    (0, react_1.useEffect)(function () { return function () {
        if (selectionRef.current !== 0) {
            return;
        }
        (0, MobileSelectionMode_1.turnOffMobileSelectionMode)();
    }; }, []);
    var handleLongPressRow = (0, react_1.useCallback)(function (item) {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (shouldPreventLongPressRow || !isSmallScreenWidth || (item === null || item === void 0 ? void 0 : item.isDisabled) || (item === null || item === void 0 ? void 0 : item.isDisabledCheckbox) || !isFocused) {
            return;
        }
        // disable long press for empty expense reports
        if ('transactions' in item && item.transactions.length === 0) {
            return;
        }
        if (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) {
            onCheckboxPress(item);
            return;
        }
        setLongPressedItem(item);
        setIsModalVisible(true);
    }, [isFocused, isSmallScreenWidth, onCheckboxPress, selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled, shouldPreventLongPressRow]);
    var turnOnSelectionMode = (0, react_1.useCallback)(function () {
        (0, MobileSelectionMode_1.turnOnMobileSelectionMode)();
        setIsModalVisible(false);
        if (onCheckboxPress && longPressedItem) {
            onCheckboxPress === null || onCheckboxPress === void 0 ? void 0 : onCheckboxPress(longPressedItem);
        }
    }, [longPressedItem, onCheckboxPress]);
    /**
     * Scrolls to the desired item index in the section list
     *
     * @param index - the index of the item to scroll to
     * @param animated - whether to animate the scroll
     */
    var scrollToIndex = (0, react_1.useCallback)(function (index, animated) {
        if (animated === void 0) { animated = true; }
        var item = data.at(index);
        if (!listRef.current || !item || index === -1) {
            return;
        }
        listRef.current.scrollToIndex({ index: index, animated: animated, viewOffset: variables_1.default.contentHeaderHeight });
    }, 
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    []);
    var setHasKeyBeenPressed = (0, react_1.useCallback)(function () {
        if (hasKeyBeenPressed.current) {
            return;
        }
        // We need to track whether a key has been pressed to enable focus syncing only if a key has been pressed.
        // This is to avoid the default behavior of web showing blue border on click of items after a page refresh.
        hasKeyBeenPressed.current = true;
    }, []);
    var _f = (0, useArrowKeyFocusManager_1.default)(__assign(__assign({ initialFocusedIndex: -1, maxIndex: flattenedTransactions.length - 1, isActive: isFocused, onFocusedIndexChange: function (index) {
            scrollToIndex(index);
        } }, (!hasKeyBeenPressed.current && { setHasKeyBeenPressed: setHasKeyBeenPressed })), { isFocused: isFocused })), focusedIndex = _f[0], setFocusedIndex = _f[1];
    var selectFocusedOption = (0, react_1.useCallback)(function () {
        var focusedItem = data.at(focusedIndex);
        if (!focusedItem) {
            return;
        }
        onSelectRow(focusedItem);
    }, [data, focusedIndex, onSelectRow]);
    (0, useKeyboardShortcut_1.default)(CONST_1.default.KEYBOARD_SHORTCUTS.ENTER, selectFocusedOption, {
        captureOnInputs: true,
        shouldBubble: false,
        shouldPreventDefault: false,
        isActive: isFocused,
        shouldStopPropagation: true,
    });
    (0, react_1.useEffect)(function () {
        (0, KeyDownPressListener_1.addKeyDownPressListener)(setHasKeyBeenPressed);
        return function () { return (0, KeyDownPressListener_1.removeKeyDownPressListener)(setHasKeyBeenPressed); };
    }, [setHasKeyBeenPressed]);
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
        var index = data.findIndex(function (option) { var _a; return newItemsToHighlight.has((_a = option.keyForList) !== null && _a !== void 0 ? _a : ''); });
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
    }, [data, scrollToIndex]);
    (0, react_1.useImperativeHandle)(ref, function () { return ({ scrollAndHighlightItem: scrollAndHighlightItem, scrollToIndex: scrollToIndex }); }, [scrollAndHighlightItem, scrollToIndex]);
    var renderItem = (0, react_1.useCallback)(function (_a) {
        var _b;
        var item = _a.item, index = _a.index;
        var isItemFocused = focusedIndex === index;
        var isItemHighlighted = !!(itemsToHighlight === null || itemsToHighlight === void 0 ? void 0 : itemsToHighlight.has((_b = item.keyForList) !== null && _b !== void 0 ? _b : ''));
        var isDisabled = item.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        return (<ListItem showTooltip isFocused={isItemFocused} onSelectRow={onSelectRow} onFocus={function (event) {
                // Prevent unexpected scrolling on mobile Chrome after the context menu closes by ignoring programmatic focus not triggered by direct user interaction.
                if ((0, Browser_1.isMobileChrome)() && event.nativeEvent) {
                    if (!event.nativeEvent.sourceCapabilities) {
                        return;
                    }
                    // Ignore the focus if it's caused by a touch event on mobile chrome.
                    // For example, a long press will trigger a focus event on mobile chrome
                    if (event.nativeEvent.sourceCapabilities.firesTouchEvents) {
                        return;
                    }
                }
                setFocusedIndex(index);
            }} onLongPressRow={handleLongPressRow} onCheckboxPress={onCheckboxPress} canSelectMultiple={canSelectMultiple} item={__assign({ shouldAnimateInHighlight: isItemHighlighted }, item)} shouldPreventDefaultFocusOnSelectRow={shouldPreventDefaultFocusOnSelectRow} queryJSONHash={hash} policies={policies} isDisabled={isDisabled} allReports={allReports} groupBy={groupBy}/>);
    }, [
        ListItem,
        canSelectMultiple,
        focusedIndex,
        handleLongPressRow,
        itemsToHighlight,
        onCheckboxPress,
        onSelectRow,
        policies,
        hash,
        groupBy,
        setFocusedIndex,
        shouldPreventDefaultFocusOnSelectRow,
        allReports,
    ]);
    var tableHeaderVisible = canSelectMultiple || !!SearchTableHeader;
    var selectAllButtonVisible = canSelectMultiple && !SearchTableHeader;
    var isSelectAllChecked = selectedItemsLength > 0 && selectedItemsLength === flattenedTransactionWithoutPendingDelete.length;
    return (<react_native_1.View style={[styles.flex1, !isKeyboardShown && safeAreaPaddingBottomStyle, containerStyle]}>
            {tableHeaderVisible && (<react_native_1.View style={[styles.searchListHeaderContainerStyle, styles.listTableHeader]}>
                    {canSelectMultiple && (<Checkbox_1.default accessibilityLabel={translate('workspace.people.selectAll')} isChecked={isSelectAllChecked} isIndeterminate={selectedItemsLength > 0 && selectedItemsLength !== flattenedTransactionWithoutPendingDelete.length} onPress={function () {
                    onAllCheckboxPress();
                }} disabled={flattenedTransactions.length === 0}/>)}

                    {SearchTableHeader}

                    {selectAllButtonVisible && (<Pressable_1.PressableWithFeedback style={[styles.userSelectNone, styles.alignItemsCenter]} onPress={onAllCheckboxPress} accessibilityLabel={translate('workspace.people.selectAll')} role="button" accessibilityState={{ checked: isSelectAllChecked }} dataSet={_b = {}, _b[CONST_1.default.SELECTION_SCRAPER_HIDDEN_ELEMENT] = true, _b}>
                            <Text_1.default style={[styles.textStrong, styles.ph3]}>{translate('workspace.people.selectAll')}</Text_1.default>
                        </Pressable_1.PressableWithFeedback>)}
                </react_native_1.View>)}

            <react_native_reanimated_1.default.FlatList data={data} renderItem={renderItem} keyExtractor={function (item, index) { var _a; return (_a = item.keyForList) !== null && _a !== void 0 ? _a : "".concat(index); }} onScroll={onScroll} contentContainerStyle={contentContainerStyle} showsVerticalScrollIndicator={false} ref={listRef} extraData={focusedIndex} onEndReached={onEndReached} onEndReachedThreshold={onEndReachedThreshold} ListFooterComponent={ListFooterComponent} removeClippedSubviews onViewableItemsChanged={onViewableItemsChanged} onScrollToIndexFailed={onScrollToIndexFailed} onLayout={onLayout}/>
            <Modal_1.default isVisible={isModalVisible} type={CONST_1.default.MODAL.MODAL_TYPE.BOTTOM_DOCKED} onClose={function () { return setIsModalVisible(false); }} shouldPreventScrollOnFocus>
                <MenuItem_1.default title={translate('common.select')} icon={Expensicons.CheckSquare} onPress={turnOnSelectionMode}/>
            </Modal_1.default>
        </react_native_1.View>);
}
exports.default = (0, react_1.forwardRef)(SearchList);
