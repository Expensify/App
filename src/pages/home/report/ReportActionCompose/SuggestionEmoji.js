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
var react_1 = require("react");
var react_native_onyx_1 = require("react-native-onyx");
var EmojiSuggestions_1 = require("@components/EmojiSuggestions");
var useArrowKeyFocusManager_1 = require("@hooks/useArrowKeyFocusManager");
var useLocalize_1 = require("@hooks/useLocalize");
var EmojiUtils = require("@libs/EmojiUtils");
var SuggestionsUtils = require("@libs/SuggestionUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
/**
 * Check if this piece of string looks like an emoji
 */
var isEmojiCode = function (str, pos) {
    var _a;
    var leftWords = str.slice(0, pos).split(CONST_1.default.REGEX.SPECIAL_CHAR_OR_EMOJI);
    var leftWord = (_a = leftWords.at(-1)) !== null && _a !== void 0 ? _a : '';
    return CONST_1.default.REGEX.HAS_COLON_ONLY_AT_THE_BEGINNING.test(leftWord) && leftWord.length > 2;
};
var defaultSuggestionsValues = {
    suggestedEmojis: [],
    colonIndex: -1,
    shouldShowSuggestionMenu: false,
};
function SuggestionEmoji(_a, ref) {
    var _b = _a.preferredSkinTone, preferredSkinTone = _b === void 0 ? CONST_1.default.EMOJI_DEFAULT_SKIN_TONE : _b, value = _a.value, selection = _a.selection, setSelection = _a.setSelection, updateComment = _a.updateComment, isAutoSuggestionPickerLarge = _a.isAutoSuggestionPickerLarge, resetKeyboardInput = _a.resetKeyboardInput, measureParentContainerAndReportCursor = _a.measureParentContainerAndReportCursor, isComposerFocused = _a.isComposerFocused;
    var _c = (0, react_1.useState)(defaultSuggestionsValues), suggestionValues = _c[0], setSuggestionValues = _c[1];
    var suggestionValuesRef = (0, react_1.useRef)(suggestionValues);
    // eslint-disable-next-line react-compiler/react-compiler
    suggestionValuesRef.current = suggestionValues;
    var isEmojiSuggestionsMenuVisible = suggestionValues.suggestedEmojis.length > 0 && suggestionValues.shouldShowSuggestionMenu;
    var _d = (0, useArrowKeyFocusManager_1.default)({
        isActive: isEmojiSuggestionsMenuVisible,
        maxIndex: suggestionValues.suggestedEmojis.length - 1,
        shouldExcludeTextAreaNodes: false,
    }), highlightedEmojiIndex = _d[0], setHighlightedEmojiIndex = _d[1];
    var preferredLocale = (0, useLocalize_1.default)().preferredLocale;
    // Used to decide whether to block the suggestions list from showing to prevent flickering
    var shouldBlockCalc = (0, react_1.useRef)(false);
    /**
     * Replace the code of emoji and update selection
     * @param {Number} selectedEmoji
     */
    var insertSelectedEmoji = (0, react_1.useCallback)(function (highlightedEmojiIndexInner) {
        var _a, _b, _c;
        var commentBeforeColon = value.slice(0, suggestionValues.colonIndex);
        var emojiObject = highlightedEmojiIndexInner !== -1 ? suggestionValues.suggestedEmojis.at(highlightedEmojiIndexInner) : undefined;
        var emojiCode = ((_a = emojiObject === null || emojiObject === void 0 ? void 0 : emojiObject.types) === null || _a === void 0 ? void 0 : _a.at(preferredSkinTone)) && preferredSkinTone !== -1 ? emojiObject.types.at(preferredSkinTone) : emojiObject === null || emojiObject === void 0 ? void 0 : emojiObject.code;
        var commentAfterColonWithEmojiNameRemoved = value.slice(selection.end);
        updateComment("".concat(commentBeforeColon).concat(emojiCode, " ").concat(SuggestionsUtils.trimLeadingSpace(commentAfterColonWithEmojiNameRemoved)), true);
        // In some Android phones keyboard, the text to search for the emoji is not cleared
        // will be added after the user starts typing again on the keyboard. This package is
        // a workaround to reset the keyboard natively.
        resetKeyboardInput === null || resetKeyboardInput === void 0 ? void 0 : resetKeyboardInput();
        setSelection({
            start: suggestionValues.colonIndex + ((_b = emojiCode === null || emojiCode === void 0 ? void 0 : emojiCode.length) !== null && _b !== void 0 ? _b : 0) + CONST_1.default.SPACE_LENGTH,
            end: suggestionValues.colonIndex + ((_c = emojiCode === null || emojiCode === void 0 ? void 0 : emojiCode.length) !== null && _c !== void 0 ? _c : 0) + CONST_1.default.SPACE_LENGTH,
        });
        setSuggestionValues(function (prevState) { return (__assign(__assign({}, prevState), { suggestedEmojis: [] })); });
    }, [preferredSkinTone, resetKeyboardInput, selection.end, setSelection, suggestionValues.colonIndex, suggestionValues.suggestedEmojis, updateComment, value]);
    /**
     * Clean data related to suggestions
     */
    var resetSuggestions = (0, react_1.useCallback)(function () {
        setSuggestionValues(defaultSuggestionsValues);
    }, []);
    var updateShouldShowSuggestionMenuToFalse = (0, react_1.useCallback)(function () {
        setSuggestionValues(function (prevState) {
            if (prevState.shouldShowSuggestionMenu) {
                return __assign(__assign({}, prevState), { shouldShowSuggestionMenu: false });
            }
            return prevState;
        });
    }, []);
    /**
     * Listens for keyboard shortcuts and applies the action
     */
    var triggerHotkeyActions = (0, react_1.useCallback)(function (e) {
        var suggestionsExist = suggestionValues.suggestedEmojis.length > 0;
        if (((!e.shiftKey && e.key === CONST_1.default.KEYBOARD_SHORTCUTS.ENTER.shortcutKey) || e.key === CONST_1.default.KEYBOARD_SHORTCUTS.TAB.shortcutKey) && suggestionsExist) {
            e.preventDefault();
            if (suggestionValues.suggestedEmojis.length > 0) {
                insertSelectedEmoji(highlightedEmojiIndex);
            }
            return true;
        }
        if (e.key === CONST_1.default.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey) {
            e.preventDefault();
            if (suggestionsExist) {
                resetSuggestions();
            }
            return true;
        }
    }, [highlightedEmojiIndex, insertSelectedEmoji, resetSuggestions, suggestionValues.suggestedEmojis.length]);
    /**
     * Calculates and cares about the content of an Emoji Suggester
     */
    var calculateEmojiSuggestion = (0, react_1.useCallback)(function (newValue, selectionStart, selectionEnd) {
        if (selectionStart !== selectionEnd || !selectionEnd || shouldBlockCalc.current || !newValue || (selectionStart === 0 && selectionEnd === 0)) {
            shouldBlockCalc.current = false;
            resetSuggestions();
            return;
        }
        var leftString = newValue.substring(0, selectionEnd);
        var colonIndex = leftString.lastIndexOf(':');
        var isCurrentlyShowingEmojiSuggestion = isEmojiCode(newValue, selectionEnd);
        var nextState = {
            suggestedEmojis: [],
            colonIndex: colonIndex,
            shouldShowSuggestionMenu: false,
        };
        var newSuggestedEmojis = EmojiUtils.suggestEmojis(leftString, preferredLocale);
        if ((newSuggestedEmojis === null || newSuggestedEmojis === void 0 ? void 0 : newSuggestedEmojis.length) && isCurrentlyShowingEmojiSuggestion) {
            nextState.suggestedEmojis = newSuggestedEmojis;
            nextState.shouldShowSuggestionMenu = !(0, EmptyObject_1.isEmptyObject)(newSuggestedEmojis);
        }
        // Early return if there is no update
        var currentState = suggestionValuesRef.current;
        if (nextState.suggestedEmojis.length === 0 && currentState.suggestedEmojis.length === 0) {
            return;
        }
        setSuggestionValues(function (prevState) { return (__assign(__assign({}, prevState), nextState)); });
        setHighlightedEmojiIndex(0);
    }, [preferredLocale, setHighlightedEmojiIndex, resetSuggestions]);
    (0, react_1.useEffect)(function () {
        if (!isComposerFocused) {
            return;
        }
        calculateEmojiSuggestion(value, selection.start, selection.end);
    }, [value, selection, calculateEmojiSuggestion, isComposerFocused]);
    var setShouldBlockSuggestionCalc = (0, react_1.useCallback)(function (shouldBlockSuggestionCalc) {
        shouldBlockCalc.current = shouldBlockSuggestionCalc;
    }, [shouldBlockCalc]);
    var getSuggestions = (0, react_1.useCallback)(function () { return suggestionValues.suggestedEmojis; }, [suggestionValues]);
    var getIsSuggestionsMenuVisible = (0, react_1.useCallback)(function () { return isEmojiSuggestionsMenuVisible; }, [isEmojiSuggestionsMenuVisible]);
    (0, react_1.useImperativeHandle)(ref, function () { return ({
        resetSuggestions: resetSuggestions,
        triggerHotkeyActions: triggerHotkeyActions,
        setShouldBlockSuggestionCalc: setShouldBlockSuggestionCalc,
        updateShouldShowSuggestionMenuToFalse: updateShouldShowSuggestionMenuToFalse,
        getSuggestions: getSuggestions,
        getIsSuggestionsMenuVisible: getIsSuggestionsMenuVisible,
    }); }, [resetSuggestions, setShouldBlockSuggestionCalc, triggerHotkeyActions, updateShouldShowSuggestionMenuToFalse, getSuggestions, getIsSuggestionsMenuVisible]);
    if (!isEmojiSuggestionsMenuVisible) {
        return null;
    }
    return (<EmojiSuggestions_1.default highlightedEmojiIndex={highlightedEmojiIndex} emojis={suggestionValues.suggestedEmojis} prefix={value.slice(suggestionValues.colonIndex + 1, selection.end)} onSelect={insertSelectedEmoji} preferredSkinToneIndex={preferredSkinTone} isEmojiPickerLarge={!!isAutoSuggestionPickerLarge} measureParentContainerAndReportCursor={measureParentContainerAndReportCursor} resetSuggestions={resetSuggestions}/>);
}
SuggestionEmoji.displayName = 'SuggestionEmoji';
exports.default = (0, react_native_onyx_1.withOnyx)({
    preferredSkinTone: {
        key: ONYXKEYS_1.default.PREFERRED_EMOJI_SKIN_TONE,
        selector: EmojiUtils.getPreferredSkinToneIndex,
    },
})((0, react_1.forwardRef)(SuggestionEmoji));
