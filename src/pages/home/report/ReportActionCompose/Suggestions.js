"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Provider_1 = require("@components/DragAndDrop/Provider");
var usePrevious_1 = require("@hooks/usePrevious");
var SuggestionEmoji_1 = require("./SuggestionEmoji");
var SuggestionMention_1 = require("./SuggestionMention");
/**
 * This component contains the individual suggestion components.
 * If you want to add a new suggestion type, add it here.
 *
 */
function Suggestions(_a, ref) {
    var value = _a.value, selection = _a.selection, setSelection = _a.setSelection, updateComment = _a.updateComment, resetKeyboardInput = _a.resetKeyboardInput, measureParentContainerAndReportCursor = _a.measureParentContainerAndReportCursor, _b = _a.isAutoSuggestionPickerLarge, isAutoSuggestionPickerLarge = _b === void 0 ? true : _b, isComposerFocused = _a.isComposerFocused, isGroupPolicyReport = _a.isGroupPolicyReport, policyID = _a.policyID;
    var suggestionEmojiRef = (0, react_1.useRef)(null);
    var suggestionMentionRef = (0, react_1.useRef)(null);
    var isDraggingOver = (0, react_1.useContext)(Provider_1.DragAndDropContext).isDraggingOver;
    var prevIsDraggingOver = (0, usePrevious_1.default)(isDraggingOver);
    var getSuggestions = (0, react_1.useCallback)(function () {
        var _a, _b;
        if ((_a = suggestionEmojiRef.current) === null || _a === void 0 ? void 0 : _a.getSuggestions) {
            var emojiSuggestions = suggestionEmojiRef.current.getSuggestions();
            if (emojiSuggestions.length > 0) {
                return emojiSuggestions;
            }
        }
        if ((_b = suggestionMentionRef.current) === null || _b === void 0 ? void 0 : _b.getSuggestions) {
            var mentionSuggestions = suggestionMentionRef.current.getSuggestions();
            if (mentionSuggestions.length > 0) {
                return mentionSuggestions;
            }
        }
        return [];
    }, []);
    /**
     * Clean data related to EmojiSuggestions
     */
    var resetSuggestions = (0, react_1.useCallback)(function () {
        var _a, _b;
        (_a = suggestionEmojiRef.current) === null || _a === void 0 ? void 0 : _a.resetSuggestions();
        (_b = suggestionMentionRef.current) === null || _b === void 0 ? void 0 : _b.resetSuggestions();
    }, []);
    /**
     * Listens for keyboard shortcuts and applies the action
     */
    var triggerHotkeyActions = (0, react_1.useCallback)(function (e) {
        var _a, _b;
        var emojiHandler = (_a = suggestionEmojiRef.current) === null || _a === void 0 ? void 0 : _a.triggerHotkeyActions(e);
        var mentionHandler = (_b = suggestionMentionRef.current) === null || _b === void 0 ? void 0 : _b.triggerHotkeyActions(e);
        return emojiHandler !== null && emojiHandler !== void 0 ? emojiHandler : mentionHandler;
    }, []);
    var onSelectionChange = (0, react_1.useCallback)(function (e) {
        var _a, _b, _c, _d;
        var emojiHandler = (_b = (_a = suggestionEmojiRef.current) === null || _a === void 0 ? void 0 : _a.onSelectionChange) === null || _b === void 0 ? void 0 : _b.call(_a, e);
        (_d = (_c = suggestionMentionRef.current) === null || _c === void 0 ? void 0 : _c.onSelectionChange) === null || _d === void 0 ? void 0 : _d.call(_c, e);
        return emojiHandler;
    }, []);
    var updateShouldShowSuggestionMenuToFalse = (0, react_1.useCallback)(function () {
        var _a, _b;
        (_a = suggestionEmojiRef.current) === null || _a === void 0 ? void 0 : _a.updateShouldShowSuggestionMenuToFalse();
        (_b = suggestionMentionRef.current) === null || _b === void 0 ? void 0 : _b.updateShouldShowSuggestionMenuToFalse();
    }, []);
    var setShouldBlockSuggestionCalc = (0, react_1.useCallback)(function (shouldBlock) {
        var _a, _b;
        (_a = suggestionEmojiRef.current) === null || _a === void 0 ? void 0 : _a.setShouldBlockSuggestionCalc(shouldBlock);
        (_b = suggestionMentionRef.current) === null || _b === void 0 ? void 0 : _b.setShouldBlockSuggestionCalc(shouldBlock);
    }, []);
    var getIsSuggestionsMenuVisible = (0, react_1.useCallback)(function () {
        var _a, _b, _c, _d;
        var isEmojiVisible = (_b = (_a = suggestionEmojiRef.current) === null || _a === void 0 ? void 0 : _a.getIsSuggestionsMenuVisible()) !== null && _b !== void 0 ? _b : false;
        var isSuggestionVisible = (_d = (_c = suggestionMentionRef.current) === null || _c === void 0 ? void 0 : _c.getIsSuggestionsMenuVisible()) !== null && _d !== void 0 ? _d : false;
        return isEmojiVisible || isSuggestionVisible;
    }, []);
    (0, react_1.useImperativeHandle)(ref, function () { return ({
        resetSuggestions: resetSuggestions,
        onSelectionChange: onSelectionChange,
        triggerHotkeyActions: triggerHotkeyActions,
        updateShouldShowSuggestionMenuToFalse: updateShouldShowSuggestionMenuToFalse,
        setShouldBlockSuggestionCalc: setShouldBlockSuggestionCalc,
        getSuggestions: getSuggestions,
        getIsSuggestionsMenuVisible: getIsSuggestionsMenuVisible,
    }); }, [onSelectionChange, resetSuggestions, setShouldBlockSuggestionCalc, triggerHotkeyActions, updateShouldShowSuggestionMenuToFalse, getSuggestions, getIsSuggestionsMenuVisible]);
    (0, react_1.useEffect)(function () {
        if (!(!prevIsDraggingOver && isDraggingOver)) {
            return;
        }
        updateShouldShowSuggestionMenuToFalse();
    }, [isDraggingOver, prevIsDraggingOver, updateShouldShowSuggestionMenuToFalse]);
    var baseProps = {
        value: value,
        setSelection: setSelection,
        selection: selection,
        updateComment: updateComment,
        isAutoSuggestionPickerLarge: isAutoSuggestionPickerLarge,
        measureParentContainerAndReportCursor: measureParentContainerAndReportCursor,
        isComposerFocused: isComposerFocused,
        isGroupPolicyReport: isGroupPolicyReport,
        policyID: policyID,
    };
    return (<react_native_1.View testID="suggestions">
            <SuggestionEmoji_1.default ref={suggestionEmojiRef} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...baseProps} resetKeyboardInput={resetKeyboardInput}/>
            <SuggestionMention_1.default ref={suggestionMentionRef} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...baseProps}/>
        </react_native_1.View>);
}
Suggestions.displayName = 'Suggestions';
exports.default = (0, react_1.forwardRef)(Suggestions);
