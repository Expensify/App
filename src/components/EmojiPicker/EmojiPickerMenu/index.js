"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var throttle_1 = require("lodash/throttle");
var react_1 = require("react");
var react_native_1 = require("react-native");
var EmojiPickerMenuItem_1 = require("@components/EmojiPicker/EmojiPickerMenuItem");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var isTextInputFocused_1 = require("@components/TextInput/BaseTextInput/isTextInputFocused");
var useArrowKeyFocusManager_1 = require("@hooks/useArrowKeyFocusManager");
var useKeyboardShortcut_1 = require("@hooks/useKeyboardShortcut");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useSingleExecution_1 = require("@hooks/useSingleExecution");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var Browser_1 = require("@libs/Browser");
var canFocusInputOnScreenFocus_1 = require("@libs/canFocusInputOnScreenFocus");
var EmojiUtils_1 = require("@libs/EmojiUtils");
var isEnterWhileComposition_1 = require("@libs/KeyboardShortcut/isEnterWhileComposition");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var BaseEmojiPickerMenu_1 = require("./BaseEmojiPickerMenu");
var useEmojiPickerMenu_1 = require("./useEmojiPickerMenu");
var throttleTime = (0, Browser_1.isMobile)() ? 200 : 50;
function EmojiPickerMenu(_a, ref) {
    var onEmojiSelected = _a.onEmojiSelected, activeEmoji = _a.activeEmoji;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var windowWidth = (0, useWindowDimensions_1.default)().windowWidth;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var translate = (0, useLocalize_1.default)().translate;
    var singleExecution = (0, useSingleExecution_1.default)().singleExecution;
    var _b = (0, useEmojiPickerMenu_1.default)(), allEmojis = _b.allEmojis, headerEmojis = _b.headerEmojis, headerRowIndices = _b.headerRowIndices, filteredEmojis = _b.filteredEmojis, headerIndices = _b.headerIndices, setFilteredEmojis = _b.setFilteredEmojis, setHeaderIndices = _b.setHeaderIndices, isListFiltered = _b.isListFiltered, suggestEmojis = _b.suggestEmojis, preferredSkinTone = _b.preferredSkinTone, listStyle = _b.listStyle, emojiListRef = _b.emojiListRef, spacersIndexes = _b.spacersIndexes;
    // Ref for the emoji search input
    var searchInputRef = (0, react_1.useRef)(null);
    // We want consistent auto focus behavior on input between native and mWeb so we have some auto focus management code that will
    // prevent auto focus when open picker for mobile device
    var shouldFocusInputOnScreenFocus = (0, canFocusInputOnScreenFocus_1.default)();
    var _c = (0, react_1.useState)(false), arePointerEventsDisabled = _c[0], setArePointerEventsDisabled = _c[1];
    var _d = (0, react_1.useState)(false), isFocused = _d[0], setIsFocused = _d[1];
    var _e = (0, react_1.useState)(false), isUsingKeyboardMovement = _e[0], setIsUsingKeyboardMovement = _e[1];
    var _f = (0, react_1.useState)(false), highlightEmoji = _f[0], setHighlightEmoji = _f[1];
    var _g = (0, react_1.useState)(false), highlightFirstEmoji = _g[0], setHighlightFirstEmoji = _g[1];
    var mouseMoveHandler = (0, react_1.useCallback)(function () {
        if (!arePointerEventsDisabled) {
            return;
        }
        setArePointerEventsDisabled(false);
    }, [arePointerEventsDisabled]);
    var onFocusedIndexChange = (0, react_1.useCallback)(function (newIndex) {
        var _a;
        if (filteredEmojis.length === 0) {
            return;
        }
        if (highlightFirstEmoji) {
            setHighlightFirstEmoji(false);
        }
        if (!isUsingKeyboardMovement) {
            setIsUsingKeyboardMovement(true);
        }
        // If the input is not focused and the new index is out of range, focus the input
        if (newIndex < 0 && !(0, isTextInputFocused_1.default)(searchInputRef) && shouldFocusInputOnScreenFocus) {
            (_a = searchInputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        }
    }, [filteredEmojis.length, highlightFirstEmoji, isUsingKeyboardMovement, shouldFocusInputOnScreenFocus]);
    var disabledIndexes = (0, react_1.useMemo)(function () { return (isListFiltered ? [] : __spreadArray(__spreadArray([], headerIndices, true), spacersIndexes, true)); }, [headerIndices, isListFiltered, spacersIndexes]);
    var _h = (0, useArrowKeyFocusManager_1.default)({
        maxIndex: filteredEmojis.length - 1,
        // Spacers indexes need to be disabled so that the arrow keys don't focus them. All headers are hidden when list is filtered
        disabledIndexes: disabledIndexes,
        itemsPerRow: CONST_1.default.EMOJI_NUM_PER_ROW,
        initialFocusedIndex: -1,
        disableCyclicTraversal: true,
        onFocusedIndexChange: onFocusedIndexChange,
        allowHorizontalArrowKeys: !isFocused,
        // We pass true without checking visibility of the component because if the popover is not visible this picker won't be mounted
        isActive: true,
        allowNegativeIndexes: true,
    }), focusedIndex = _h[0], setFocusedIndex = _h[1];
    var filterEmojis = (0, throttle_1.default)(function (searchTerm) {
        var _a;
        var _b = suggestEmojis(searchTerm), normalizedSearchTerm = _b[0], newFilteredEmojiList = _b[1];
        (_a = emojiListRef.current) === null || _a === void 0 ? void 0 : _a.scrollToOffset({ offset: 0, animated: false });
        if (normalizedSearchTerm === '') {
            // There are no headers when searching, so we need to re-make them sticky when there is no search term
            setFilteredEmojis(allEmojis);
            setHeaderIndices(headerRowIndices);
            setFocusedIndex(-1);
            setHighlightFirstEmoji(false);
            setHighlightEmoji(false);
            return;
        }
        // Remove sticky header indices. There are no headers while searching and we don't want to make emojis sticky
        setFilteredEmojis(newFilteredEmojiList !== null && newFilteredEmojiList !== void 0 ? newFilteredEmojiList : []);
        setHeaderIndices([]);
        setHighlightFirstEmoji(true);
        setIsUsingKeyboardMovement(false);
    }, throttleTime);
    var keyDownHandler = (0, react_1.useCallback)(function (keyBoardEvent) {
        if (keyBoardEvent.key.startsWith('Arrow')) {
            if (!isFocused || keyBoardEvent.key === 'ArrowUp' || keyBoardEvent.key === 'ArrowDown') {
                keyBoardEvent.preventDefault();
            }
            return;
        }
        // Enable keyboard movement if tab or enter is pressed or if shift is pressed while the input
        // is not focused, so that the navigation and tab cycling can be done using the keyboard without
        // interfering with the input behaviour.
        if (keyBoardEvent.key === 'Tab' || keyBoardEvent.key === 'Enter' || (keyBoardEvent.key === 'Shift' && searchInputRef.current && !(0, isTextInputFocused_1.default)(searchInputRef))) {
            setIsUsingKeyboardMovement(true);
        }
        // We allow typing in the search box if any key is pressed apart from Arrow keys.
        if (searchInputRef.current && !(0, isTextInputFocused_1.default)(searchInputRef) && (0, ReportUtils_1.shouldAutoFocusOnKeyPress)(keyBoardEvent)) {
            searchInputRef.current.focus();
        }
    }, [isFocused]);
    (0, useKeyboardShortcut_1.default)(CONST_1.default.KEYBOARD_SHORTCUTS.ENTER, function (keyBoardEvent) {
        var _a;
        if (!(keyBoardEvent instanceof KeyboardEvent) || (0, isEnterWhileComposition_1.default)(keyBoardEvent) || keyBoardEvent.key !== CONST_1.default.KEYBOARD_SHORTCUTS.ENTER.shortcutKey) {
            return;
        }
        // Select the currently highlighted emoji if enter is pressed
        var indexToSelect = focusedIndex;
        if (highlightFirstEmoji) {
            indexToSelect = 0;
        }
        var item = filteredEmojis.at(indexToSelect);
        if (indexToSelect === -1 || !item) {
            return;
        }
        if ('types' in item || 'name' in item) {
            var emoji = typeof preferredSkinTone === 'number' && preferredSkinTone !== -1 && ((_a = item === null || item === void 0 ? void 0 : item.types) === null || _a === void 0 ? void 0 : _a.at(preferredSkinTone)) ? item.types.at(preferredSkinTone) : item.code;
            onEmojiSelected(emoji !== null && emoji !== void 0 ? emoji : '', item);
            // On web, avoid this Enter default input action; otherwise, it will add a new line in the subsequently focused composer.
            keyBoardEvent.preventDefault();
            // On mWeb, avoid propagating this Enter keystroke to Pressable child component; otherwise, it will trigger the onEmojiSelected callback again.
            keyBoardEvent.stopPropagation();
        }
    }, { shouldPreventDefault: false });
    /**
     * Setup and attach keypress/mouse handlers for highlight navigation.
     */
    var setupEventHandlers = (0, react_1.useCallback)(function () {
        if (!document) {
            return;
        }
        // Keyboard events are not bubbling on TextInput in RN-Web, Bubbling was needed for this event to trigger
        // event handler attached to document root. To fix this, trigger event handler in Capture phase.
        document.addEventListener('keydown', keyDownHandler, true);
        // Re-enable pointer events and hovering over EmojiPickerItems when the mouse moves
        document.addEventListener('mousemove', mouseMoveHandler);
    }, [keyDownHandler, mouseMoveHandler]);
    /**
     * Cleanup all mouse/keydown event listeners that we've set up
     */
    var cleanupEventHandlers = (0, react_1.useCallback)(function () {
        if (!document) {
            return;
        }
        document.removeEventListener('keydown', keyDownHandler, true);
        document.removeEventListener('mousemove', mouseMoveHandler);
    }, [keyDownHandler, mouseMoveHandler]);
    (0, react_1.useEffect)(function () {
        // This callback prop is used by the parent component using the constructor to
        // get a ref to the inner textInput element e.g. if we do
        // <constructor ref={el => this.textInput = el} /> this will not
        // return a ref to the component, but rather the HTML element by default
        if (shouldFocusInputOnScreenFocus && ref && typeof ref === 'function') {
            ref(searchInputRef.current);
        }
        setupEventHandlers();
        return function () {
            cleanupEventHandlers();
        };
    }, [ref, shouldFocusInputOnScreenFocus, cleanupEventHandlers, setupEventHandlers]);
    var scrollToHeader = (0, react_1.useCallback)(function (headerIndex) {
        var _a;
        if (!emojiListRef.current) {
            return;
        }
        var calculatedOffset = Math.floor(headerIndex / CONST_1.default.EMOJI_NUM_PER_ROW) * CONST_1.default.EMOJI_PICKER_HEADER_HEIGHT;
        (_a = emojiListRef.current) === null || _a === void 0 ? void 0 : _a.scrollToOffset({ offset: calculatedOffset, animated: true });
        setFocusedIndex(headerIndex);
    }, [emojiListRef, setFocusedIndex]);
    /**
     * Given an emoji item object, render a component based on its type.
     * Items with the code "SPACER" return nothing and are used to fill rows up to 8
     * so that the sticky headers function properly.
     *
     */
    var renderItem = (0, react_1.useCallback)(function (_a) {
        var item = _a.item, index = _a.index, target = _a.target;
        var code = item.code;
        var types = 'types' in item ? item.types : undefined;
        if ('spacer' in item && item.spacer) {
            return null;
        }
        if ('header' in item && item.header) {
            return (<react_native_1.View style={[styles.emojiHeaderContainer, target === 'StickyHeader' ? styles.stickyHeaderEmoji(shouldUseNarrowLayout, windowWidth) : undefined]}>
                        <Text_1.default style={styles.textLabelSupporting}>{translate("emojiPicker.headers.".concat(code))}</Text_1.default>
                    </react_native_1.View>);
        }
        var emojiCode = typeof preferredSkinTone === 'number' && (types === null || types === void 0 ? void 0 : types.at(preferredSkinTone)) && preferredSkinTone !== -1 ? types.at(preferredSkinTone) : code;
        var isEmojiFocused = index === focusedIndex && isUsingKeyboardMovement;
        var shouldEmojiBeHighlighted = (index === focusedIndex && highlightEmoji) || (!!activeEmoji && (0, EmojiUtils_1.getRemovedSkinToneEmoji)(emojiCode) === (0, EmojiUtils_1.getRemovedSkinToneEmoji)(activeEmoji));
        var shouldFirstEmojiBeHighlighted = index === 0 && highlightFirstEmoji;
        return (<EmojiPickerMenuItem_1.default onPress={singleExecution(function (emoji) {
                if (!('name' in item)) {
                    return;
                }
                onEmojiSelected(emoji, item);
            })} onHoverIn={function () {
                setHighlightEmoji(false);
                setHighlightFirstEmoji(false);
                if (!isUsingKeyboardMovement) {
                    return;
                }
                setIsUsingKeyboardMovement(false);
            }} emoji={emojiCode !== null && emojiCode !== void 0 ? emojiCode : ''} onFocus={function () { return setFocusedIndex(index); }} isFocused={isEmojiFocused} isHighlighted={shouldFirstEmojiBeHighlighted || shouldEmojiBeHighlighted}/>);
    }, [
        preferredSkinTone,
        focusedIndex,
        isUsingKeyboardMovement,
        highlightEmoji,
        highlightFirstEmoji,
        singleExecution,
        styles,
        shouldUseNarrowLayout,
        windowWidth,
        translate,
        onEmojiSelected,
        setFocusedIndex,
        activeEmoji,
    ]);
    return (<react_native_1.View style={[
            styles.emojiPickerContainer,
            StyleUtils.getEmojiPickerStyle(shouldUseNarrowLayout),
            // Disable pointer events so that onHover doesn't get triggered when the items move while we're scrolling
            arePointerEventsDisabled ? styles.pointerEventsNone : styles.pointerEventsAuto,
        ]}>
            <react_native_1.View style={[styles.p4, styles.pb3]}>
                <TextInput_1.default label={translate('common.search')} accessibilityLabel={translate('common.search')} role={CONST_1.default.ROLE.PRESENTATION} onChangeText={filterEmojis} defaultValue="" ref={searchInputRef} autoFocus={shouldFocusInputOnScreenFocus} onFocus={function () {
            setFocusedIndex(-1);
            setIsFocused(true);
            setIsUsingKeyboardMovement(false);
        }} onBlur={function () { return setIsFocused(false); }} autoCorrect={false} blurOnSubmit={filteredEmojis.length > 0}/>
            </react_native_1.View>
            <BaseEmojiPickerMenu_1.default isFiltered={isListFiltered} headerEmojis={headerEmojis} scrollToHeader={scrollToHeader} listWrapperStyle={[listStyle, styles.flexShrink1]} ref={emojiListRef} data={filteredEmojis} renderItem={renderItem} extraData={[focusedIndex, preferredSkinTone]} stickyHeaderIndices={headerIndices}/>
        </react_native_1.View>);
}
EmojiPickerMenu.displayName = 'EmojiPickerMenu';
exports.default = react_1.default.forwardRef(EmojiPickerMenu);
