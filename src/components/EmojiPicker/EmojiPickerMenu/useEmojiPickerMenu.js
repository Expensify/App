"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var emojis_1 = require("@assets/emojis");
var OnyxProvider_1 = require("@components/OnyxProvider");
var useKeyboardState_1 = require("@hooks/useKeyboardState");
var useLocalize_1 = require("@hooks/useLocalize");
var usePreferredEmojiSkinTone_1 = require("@hooks/usePreferredEmojiSkinTone");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var EmojiUtils = require("@libs/EmojiUtils");
var useEmojiPickerMenu = function () {
    var emojiListRef = (0, react_1.useRef)(null);
    var frequentlyUsedEmojis = (0, OnyxProvider_1.useFrequentlyUsedEmojis)();
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    var allEmojis = (0, react_1.useMemo)(function () { return EmojiUtils.mergeEmojisWithFrequentlyUsedEmojis(emojis_1.default); }, [frequentlyUsedEmojis]);
    var headerEmojis = (0, react_1.useMemo)(function () { return EmojiUtils.getHeaderEmojis(allEmojis); }, [allEmojis]);
    var headerRowIndices = (0, react_1.useMemo)(function () { return headerEmojis.map(function (headerEmoji) { return headerEmoji.index; }); }, [headerEmojis]);
    var spacersIndexes = (0, react_1.useMemo)(function () { return EmojiUtils.getSpacersIndexes(allEmojis); }, [allEmojis]);
    var _a = (0, react_1.useState)(allEmojis), filteredEmojis = _a[0], setFilteredEmojis = _a[1];
    var _b = (0, react_1.useState)(headerRowIndices), headerIndices = _b[0], setHeaderIndices = _b[1];
    var isListFiltered = allEmojis.length !== filteredEmojis.length;
    var preferredLocale = (0, useLocalize_1.default)().preferredLocale;
    var preferredSkinTone = (0, usePreferredEmojiSkinTone_1.default)()[0];
    var windowHeight = (0, useWindowDimensions_1.default)().windowHeight;
    var StyleUtils = (0, useStyleUtils_1.default)();
    var keyboardHeight = (0, useKeyboardState_1.default)().keyboardHeight;
    /**
     * The EmojiPicker sets the `innerContainerStyle` with `maxHeight: '95%'` in `styles.popoverInnerContainer`
     * to prevent the list from being cut off when the list height exceeds the container's height.
     * To calculate the available list height, we subtract the keyboard height from the `windowHeight`
     * to ensure the list is properly adjusted when the keyboard is visible.
     */
    var listStyle = StyleUtils.getEmojiPickerListHeight(isListFiltered, windowHeight * 0.95 - keyboardHeight);
    (0, react_1.useEffect)(function () {
        setFilteredEmojis(allEmojis);
    }, [allEmojis]);
    (0, react_1.useEffect)(function () {
        setHeaderIndices(headerRowIndices);
    }, [headerRowIndices]);
    /**
     * Suggest emojis based on the search term
     */
    var suggestEmojis = (0, react_1.useCallback)(function (searchTerm) {
        var normalizedSearchTerm = searchTerm.toLowerCase().trim().replaceAll(':', '');
        var emojisSuggestions = EmojiUtils.suggestEmojis(":".concat(normalizedSearchTerm), preferredLocale, allEmojis.length);
        return [normalizedSearchTerm, emojisSuggestions];
    }, [allEmojis, preferredLocale]);
    return {
        allEmojis: allEmojis,
        headerEmojis: headerEmojis,
        headerRowIndices: headerRowIndices,
        filteredEmojis: filteredEmojis,
        headerIndices: headerIndices,
        setFilteredEmojis: setFilteredEmojis,
        setHeaderIndices: setHeaderIndices,
        isListFiltered: isListFiltered,
        suggestEmojis: suggestEmojis,
        preferredSkinTone: preferredSkinTone,
        listStyle: listStyle,
        emojiListRef: emojiListRef,
        spacersIndexes: spacersIndexes,
    };
};
exports.default = useEmojiPickerMenu;
