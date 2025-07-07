"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var debounce_1 = require("lodash/debounce");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_keyboard_controller_1 = require("react-native-keyboard-controller");
var react_native_reanimated_1 = require("react-native-reanimated");
var Composer_1 = require("@components/Composer");
var useKeyboardState_1 = require("@hooks/useKeyboardState");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePrevious_1 = require("@hooks/usePrevious");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useSidePanel_1 = require("@hooks/useSidePanel");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Browser_1 = require("@libs/Browser");
var canFocusInputOnScreenFocus_1 = require("@libs/canFocusInputOnScreenFocus");
var ComponentUtils_1 = require("@libs/ComponentUtils");
var ComposerUtils_1 = require("@libs/ComposerUtils");
var convertToLTRForComposer_1 = require("@libs/convertToLTRForComposer");
var DraftCommentUtils_1 = require("@libs/DraftCommentUtils");
var EmojiUtils_1 = require("@libs/EmojiUtils");
var focusComposerWithDelay_1 = require("@libs/focusComposerWithDelay");
var getPlatform_1 = require("@libs/getPlatform");
var KeyDownPressListener_1 = require("@libs/KeyboardShortcut/KeyDownPressListener");
var Parser_1 = require("@libs/Parser");
var ReportActionComposeFocusManager_1 = require("@libs/ReportActionComposeFocusManager");
var ReportUtils_1 = require("@libs/ReportUtils");
var updateMultilineInputRange_1 = require("@libs/updateMultilineInputRange");
var willBlurTextInputOnTapOutside_1 = require("@libs/willBlurTextInputOnTapOutside");
var getCursorPosition_1 = require("@pages/home/report/ReportActionCompose/getCursorPosition");
var getScrollPosition_1 = require("@pages/home/report/ReportActionCompose/getScrollPosition");
var SilentCommentUpdater_1 = require("@pages/home/report/ReportActionCompose/SilentCommentUpdater");
var Suggestions_1 = require("@pages/home/report/ReportActionCompose/Suggestions");
var EmojiPickerAction_1 = require("@userActions/EmojiPickerAction");
var InputFocus_1 = require("@userActions/InputFocus");
var Modal_1 = require("@userActions/Modal");
var Report_1 = require("@userActions/Report");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var RNTextInputReset = react_native_1.NativeModules.RNTextInputReset;
var isIOSNative = (0, getPlatform_1.default)() === CONST_1.default.PLATFORM.IOS;
/**
 * Broadcast that the user is typing. Debounced to limit how often we publish client events.
 */
var debouncedBroadcastUserIsTyping = (0, debounce_1.default)(function (reportID) {
    (0, Report_1.broadcastUserIsTyping)(reportID);
}, 1000, {
    maxWait: 1000,
    leading: true,
});
var willBlurTextInputOnTapOutside = (0, willBlurTextInputOnTapOutside_1.default)();
// We want consistent auto focus behavior on input between native and mWeb so we have some auto focus management code that will
// prevent auto focus for mobile device
var shouldFocusInputOnScreenFocus = (0, canFocusInputOnScreenFocus_1.default)();
/**
 * This component holds the value and selection state.
 * If a component really needs access to these state values it should be put here.
 * However, double check if the component really needs access, as it will re-render
 * on every key press.
 */
function ComposerWithSuggestions(_a, ref) {
    var _b, _c;
    var 
    // Props: Report
    reportID = _a.reportID, includeChronos = _a.includeChronos, lastReportAction = _a.lastReportAction, isGroupPolicyReport = _a.isGroupPolicyReport, policyID = _a.policyID, 
    // Focus
    onFocus = _a.onFocus, onBlur = _a.onBlur, onValueChange = _a.onValueChange, 
    // Composer
    isComposerFullSize = _a.isComposerFullSize, setIsFullComposerAvailable = _a.setIsFullComposerAvailable, isMenuVisible = _a.isMenuVisible, inputPlaceholder = _a.inputPlaceholder, displayFileInModal = _a.displayFileInModal, isBlockedFromConcierge = _a.isBlockedFromConcierge, disabled = _a.disabled, setIsCommentEmpty = _a.setIsCommentEmpty, handleSendMessage = _a.handleSendMessage, shouldShowComposeInput = _a.shouldShowComposeInput, _d = _a.measureParentContainer, measureParentContainer = _d === void 0 ? function () { } : _d, isScrollLikelyLayoutTriggered = _a.isScrollLikelyLayoutTriggered, raiseIsScrollLikelyLayoutTriggered = _a.raiseIsScrollLikelyLayoutTriggered, _e = _a.onCleared, onCleared = _e === void 0 ? function () { } : _e, onLayoutProps = _a.onLayout, 
    // Refs
    suggestionsRef = _a.suggestionsRef, isNextModalWillOpenRef = _a.isNextModalWillOpenRef, 
    // For testing
    children = _a.children, didHideComposerInput = _a.didHideComposerInput;
    var isKeyboardShown = (0, useKeyboardState_1.default)().isKeyboardShown;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var preferredLocale = (0, useLocalize_1.default)().preferredLocale;
    var isSidePanelHiddenOrLargeScreen = (0, useSidePanel_1.useSidePanelDisplayStatus)().isSidePanelHiddenOrLargeScreen;
    var isFocused = (0, native_1.useIsFocused)();
    var navigation = (0, native_1.useNavigation)();
    var emojisPresentBefore = (0, react_1.useRef)([]);
    var mobileInputScrollPosition = (0, react_1.useRef)(0);
    var cursorPositionValue = (0, react_native_reanimated_1.useSharedValue)({ x: 0, y: 0 });
    var tag = (0, react_native_reanimated_1.useSharedValue)(-1);
    var draftComment = (_b = (0, DraftCommentUtils_1.getDraftComment)(reportID)) !== null && _b !== void 0 ? _b : '';
    var _f = (0, react_1.useState)(function () {
        if (draftComment) {
            emojisPresentBefore.current = (0, EmojiUtils_1.extractEmojis)(draftComment);
        }
        return draftComment;
    }), value = _f[0], setValue = _f[1];
    var commentRef = (0, react_1.useRef)(value);
    var modal = (0, useOnyx_1.default)(ONYXKEYS_1.default.MODAL, { canBeMissing: true })[0];
    var _g = (0, useOnyx_1.default)(ONYXKEYS_1.default.PREFERRED_EMOJI_SKIN_TONE, { selector: EmojiUtils_1.getPreferredSkinToneIndex, canBeMissing: true })[0], preferredSkinTone = _g === void 0 ? CONST_1.default.EMOJI_DEFAULT_SKIN_TONE : _g;
    var editFocused = (0, useOnyx_1.default)(ONYXKEYS_1.default.INPUT_FOCUSED, { canBeMissing: true })[0];
    var lastTextRef = (0, react_1.useRef)(value);
    (0, react_1.useEffect)(function () {
        lastTextRef.current = value;
    }, [value]);
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var maxComposerLines = shouldUseNarrowLayout ? CONST_1.default.COMPOSER.MAX_LINES_SMALL_SCREEN : CONST_1.default.COMPOSER.MAX_LINES;
    var shouldAutoFocus = shouldFocusInputOnScreenFocus && !(modal === null || modal === void 0 ? void 0 : modal.isVisible) && shouldShowComposeInput && (0, Modal_1.areAllModalsHidden)() && isFocused && !didHideComposerInput;
    var valueRef = (0, react_1.useRef)(value);
    valueRef.current = value;
    var _h = (0, react_1.useState)(function () { return ({ start: value.length, end: value.length, positionX: 0, positionY: 0 }); }), selection = _h[0], setSelection = _h[1];
    var _j = (0, react_1.useState)(0), composerHeight = _j[0], setComposerHeight = _j[1];
    var textInputRef = (0, react_1.useRef)(null);
    var syncSelectionWithOnChangeTextRef = (0, react_1.useRef)(null);
    // The ref to check whether the comment saving is in progress
    var isCommentPendingSaved = (0, react_1.useRef)(false);
    var animatedRef = (0, react_native_reanimated_1.useAnimatedRef)();
    /**
     * Set the TextInput Ref
     */
    var setTextInputRef = (0, react_1.useCallback)(function (el) {
        ReportActionComposeFocusManager_1.default.composerRef.current = el;
        textInputRef.current = el;
        if (typeof animatedRef === 'function') {
            animatedRef(el);
        }
    }, [animatedRef]);
    var resetKeyboardInput = (0, react_1.useCallback)(function () {
        if (!RNTextInputReset) {
            return;
        }
        RNTextInputReset.resetKeyboardInput((0, react_native_1.findNodeHandle)(textInputRef.current));
    }, [textInputRef]);
    var debouncedSaveReportComment = (0, react_1.useMemo)(function () {
        return (0, debounce_1.default)(function (selectedReportID, newComment) {
            (0, Report_1.saveReportDraftComment)(selectedReportID, newComment);
            isCommentPendingSaved.current = false;
        }, 1000);
    }, []);
    (0, react_1.useEffect)(function () {
        var switchToCurrentReport = react_native_1.DeviceEventEmitter.addListener("switchToPreExistingReport_".concat(reportID), function (_a) {
            var preexistingReportID = _a.preexistingReportID, callback = _a.callback;
            if (!commentRef.current) {
                callback();
                return;
            }
            (0, Report_1.saveReportDraftComment)(preexistingReportID, commentRef.current, callback);
        });
        return function () {
            switchToCurrentReport.remove();
        };
    }, [reportID]);
    /**
     * Find the newly added characters between the previous text and the new text based on the selection.
     *
     * @param prevText - The previous text.
     * @param newText - The new text.
     * @returns An object containing information about the newly added characters.
     * @property startIndex - The start index of the newly added characters in the new text.
     * @property endIndex - The end index of the newly added characters in the new text.
     * @property diff - The newly added characters.
     */
    var findNewlyAddedChars = (0, react_1.useCallback)(function (prevText, newText) {
        var _a, _b;
        var startIndex = -1;
        var endIndex = -1;
        var currentIndex = 0;
        // Find the first character mismatch with newText
        while (currentIndex < newText.length && prevText.charAt(currentIndex) === newText.charAt(currentIndex) && selection.start > currentIndex) {
            currentIndex++;
        }
        if (currentIndex < newText.length) {
            startIndex = currentIndex;
            var commonSuffixLength = (0, ComposerUtils_1.findCommonSuffixLength)(prevText, newText, (_a = selection === null || selection === void 0 ? void 0 : selection.end) !== null && _a !== void 0 ? _a : 0);
            // if text is getting pasted over find length of common suffix and subtract it from new text length
            if (commonSuffixLength > 0 || ((_b = selection === null || selection === void 0 ? void 0 : selection.end) !== null && _b !== void 0 ? _b : 0) - selection.start > 0) {
                endIndex = newText.length - commonSuffixLength;
            }
            else {
                endIndex = currentIndex + newText.length;
            }
        }
        return {
            startIndex: startIndex,
            endIndex: endIndex,
            diff: newText.substring(startIndex, endIndex),
        };
    }, [selection.start, selection.end]);
    /**
     * Update the value of the comment in Onyx
     */
    var updateComment = (0, react_1.useCallback)(function (commentValue, shouldDebounceSaveComment) {
        var _a;
        raiseIsScrollLikelyLayoutTriggered();
        var _b = findNewlyAddedChars(lastTextRef.current, commentValue), startIndex = _b.startIndex, endIndex = _b.endIndex, diff = _b.diff;
        var isEmojiInserted = diff.length && endIndex > startIndex && diff.trim() === diff && (0, EmojiUtils_1.containsOnlyEmojis)(diff);
        var commentWithSpaceInserted = isEmojiInserted ? (0, ComposerUtils_1.insertWhiteSpaceAtIndex)(commentValue, endIndex) : commentValue;
        var _c = (0, EmojiUtils_1.replaceAndExtractEmojis)(commentWithSpaceInserted, preferredSkinTone, preferredLocale), newComment = _c.text, emojis = _c.emojis, cursorPosition = _c.cursorPosition;
        if (emojis.length) {
            var newEmojis = (0, EmojiUtils_1.getAddedEmojis)(emojis, emojisPresentBefore.current);
            if (newEmojis.length) {
                // Ensure emoji suggestions are hidden after inserting emoji even when the selection is not changed
                if (suggestionsRef.current) {
                    suggestionsRef.current.resetSuggestions();
                }
            }
        }
        var newCommentConverted = (0, convertToLTRForComposer_1.default)(newComment);
        var isNewCommentEmpty = !!newCommentConverted.match(/^(\s)*$/);
        var isPrevCommentEmpty = !!commentRef.current.match(/^(\s)*$/);
        /** Only update isCommentEmpty state if it's different from previous one */
        if (isNewCommentEmpty !== isPrevCommentEmpty) {
            setIsCommentEmpty(isNewCommentEmpty);
        }
        emojisPresentBefore.current = emojis;
        setValue(newCommentConverted);
        if (commentValue !== newComment) {
            var position_1 = Math.max(((_a = selection.end) !== null && _a !== void 0 ? _a : 0) + (newComment.length - commentRef.current.length), cursorPosition !== null && cursorPosition !== void 0 ? cursorPosition : 0);
            if (commentWithSpaceInserted !== newComment && isIOSNative) {
                syncSelectionWithOnChangeTextRef.current = { position: position_1, value: newComment };
            }
            setSelection(function (prevSelection) { return ({
                start: position_1,
                end: position_1,
                positionX: prevSelection.positionX,
                positionY: prevSelection.positionY,
            }); });
        }
        commentRef.current = newCommentConverted;
        if (shouldDebounceSaveComment) {
            isCommentPendingSaved.current = true;
            debouncedSaveReportComment(reportID, newCommentConverted);
        }
        else {
            (0, Report_1.saveReportDraftComment)(reportID, newCommentConverted);
        }
        if (newCommentConverted) {
            debouncedBroadcastUserIsTyping(reportID);
        }
    }, [findNewlyAddedChars, preferredLocale, preferredSkinTone, reportID, setIsCommentEmpty, suggestionsRef, raiseIsScrollLikelyLayoutTriggered, debouncedSaveReportComment, selection.end]);
    /**
     * Callback to add whatever text is chosen into the main input (used f.e as callback for the emoji picker)
     */
    var replaceSelectionWithText = (0, react_1.useCallback)(function (text) {
        // selection replacement should be debounced to avoid conflicts with text typing
        // (f.e. when emoji is being picked and 1 second still did not pass after user finished typing)
        updateComment((0, ComposerUtils_1.insertText)(commentRef.current, selection, text), true);
    }, [selection, updateComment]);
    var handleKeyPress = (0, react_1.useCallback)(function (event) {
        var _a, _b, _c, _d, _e, _f;
        var webEvent = event;
        if (!webEvent || (0, ComposerUtils_1.canSkipTriggerHotkeys)(shouldUseNarrowLayout, isKeyboardShown)) {
            return;
        }
        if ((_a = suggestionsRef.current) === null || _a === void 0 ? void 0 : _a.triggerHotkeyActions(webEvent)) {
            return;
        }
        // Submit the form when Enter is pressed
        if (webEvent.key === CONST_1.default.KEYBOARD_SHORTCUTS.ENTER.shortcutKey && !webEvent.shiftKey) {
            webEvent.preventDefault();
            handleSendMessage();
        }
        // Trigger the edit box for last sent message if ArrowUp is pressed and the comment is empty and Chronos is not in the participants
        var isEmptyComment = !valueRef.current || !!valueRef.current.match(CONST_1.default.REGEX.EMPTY_COMMENT);
        if (webEvent.key === CONST_1.default.KEYBOARD_SHORTCUTS.ARROW_UP.shortcutKey && selection.start <= 0 && isEmptyComment && !includeChronos) {
            webEvent.preventDefault();
            if (lastReportAction) {
                var message = Array.isArray(lastReportAction === null || lastReportAction === void 0 ? void 0 : lastReportAction.message) ? ((_c = (_b = lastReportAction === null || lastReportAction === void 0 ? void 0 : lastReportAction.message) === null || _b === void 0 ? void 0 : _b.at(-1)) !== null && _c !== void 0 ? _c : null) : ((_d = lastReportAction === null || lastReportAction === void 0 ? void 0 : lastReportAction.message) !== null && _d !== void 0 ? _d : null);
                (0, Report_1.saveReportActionDraft)(reportID, lastReportAction, Parser_1.default.htmlToMarkdown((_e = message === null || message === void 0 ? void 0 : message.html) !== null && _e !== void 0 ? _e : ''));
            }
        }
        // Flag emojis like "Wales" have several code points. Default backspace key action does not remove such flag emojis completely.
        // so we need to handle backspace key action differently with grapheme segmentation.
        if (webEvent.key === CONST_1.default.KEYBOARD_SHORTCUTS.BACKSPACE.shortcutKey) {
            if (selection.start === 0) {
                return;
            }
            if (selection.start !== selection.end) {
                return;
            }
            // Grapheme segmentation is same for English and Spanish.
            var splitter = new Intl.Segmenter(CONST_1.default.LOCALES.EN, { granularity: 'grapheme' });
            // Wales flag has 14 UTF-16 code units. This is the emoji with the largest number of UTF-16 code units we use.
            var start = Math.max(0, selection.start - 14);
            var graphemes = Array.from(splitter.segment(lastTextRef.current.substring(start, selection.start)));
            var lastGrapheme = graphemes.at(graphemes.length - 1);
            var lastGraphemeLength_1 = (_f = lastGrapheme === null || lastGrapheme === void 0 ? void 0 : lastGrapheme.segment.length) !== null && _f !== void 0 ? _f : 0;
            if (lastGraphemeLength_1 > 1) {
                event.preventDefault();
                var newText = lastTextRef.current.slice(0, selection.start - lastGraphemeLength_1) + lastTextRef.current.slice(selection.start);
                setSelection(function (prevSelection) { return ({
                    start: selection.start - lastGraphemeLength_1,
                    end: selection.start - lastGraphemeLength_1,
                    positionX: prevSelection.positionX,
                    positionY: prevSelection.positionY,
                }); });
                updateComment(newText, true);
            }
        }
    }, [shouldUseNarrowLayout, isKeyboardShown, suggestionsRef, selection.start, includeChronos, handleSendMessage, lastReportAction, reportID, updateComment, selection.end]);
    var onChangeText = (0, react_1.useCallback)(function (commentValue) {
        updateComment(commentValue, true);
        if (isIOSNative && syncSelectionWithOnChangeTextRef.current) {
            var positionSnapshot_1 = syncSelectionWithOnChangeTextRef.current.position;
            syncSelectionWithOnChangeTextRef.current = null;
            // ensure that selection is set imperatively after all state changes are effective
            react_native_1.InteractionManager.runAfterInteractions(function () {
                var _a;
                // note: this implementation is only available on non-web RN, thus the wrapping
                // 'if' block contains a redundant (since the ref is only used on iOS) platform check
                (_a = textInputRef.current) === null || _a === void 0 ? void 0 : _a.setSelection(positionSnapshot_1, positionSnapshot_1);
            });
        }
    }, [updateComment]);
    var onSelectionChange = (0, react_1.useCallback)(function (e) {
        var _a, _b, _c;
        setSelection(e.nativeEvent.selection);
        if (!((_a = textInputRef.current) === null || _a === void 0 ? void 0 : _a.isFocused())) {
            return;
        }
        (_c = (_b = suggestionsRef.current) === null || _b === void 0 ? void 0 : _b.onSelectionChange) === null || _c === void 0 ? void 0 : _c.call(_b, e);
    }, [suggestionsRef]);
    var hideSuggestionMenu = (0, react_1.useCallback)(function (e) {
        var _a, _b, _c;
        mobileInputScrollPosition.current = (_c = (_b = (_a = e === null || e === void 0 ? void 0 : e.nativeEvent) === null || _a === void 0 ? void 0 : _a.contentOffset) === null || _b === void 0 ? void 0 : _b.y) !== null && _c !== void 0 ? _c : 0;
        if (!suggestionsRef.current || isScrollLikelyLayoutTriggered.current) {
            return;
        }
        suggestionsRef.current.updateShouldShowSuggestionMenuToFalse(false);
    }, [suggestionsRef, isScrollLikelyLayoutTriggered]);
    var setShouldBlockSuggestionCalcToFalse = (0, react_1.useCallback)(function () {
        if (!suggestionsRef.current) {
            return false;
        }
        (0, InputFocus_1.inputFocusChange)(false);
        return suggestionsRef.current.setShouldBlockSuggestionCalc(false);
    }, [suggestionsRef]);
    /**
     * Focus the composer text input
     * @param [shouldDelay=false] Impose delay before focusing the composer
     */
    var focus = (0, react_1.useCallback)(function (shouldDelay) {
        if (shouldDelay === void 0) { shouldDelay = false; }
        (0, focusComposerWithDelay_1.default)(textInputRef.current)(shouldDelay);
    }, []);
    /**
     * Set focus callback
     * @param shouldTakeOverFocus - Whether this composer should gain focus priority
     */
    var setUpComposeFocusManager = (0, react_1.useCallback)(function (shouldTakeOverFocus) {
        if (shouldTakeOverFocus === void 0) { shouldTakeOverFocus = false; }
        ReportActionComposeFocusManager_1.default.onComposerFocus(function (shouldFocusForNonBlurInputOnTapOutside) {
            if (shouldFocusForNonBlurInputOnTapOutside === void 0) { shouldFocusForNonBlurInputOnTapOutside = false; }
            if ((!willBlurTextInputOnTapOutside && !shouldFocusForNonBlurInputOnTapOutside) || !isFocused || !isSidePanelHiddenOrLargeScreen) {
                return;
            }
            focus(true);
        }, shouldTakeOverFocus);
    }, [focus, isFocused, isSidePanelHiddenOrLargeScreen]);
    /**
     * Check if the composer is visible. Returns true if the composer is not covered up by emoji picker or menu. False otherwise.
     * @returns {Boolean}
     */
    var checkComposerVisibility = (0, react_1.useCallback)(function () {
        // Checking whether the screen is focused or not, helps avoid `modal.isVisible` false when popups are closed, even if the modal is opened.
        var isComposerCoveredUp = !isFocused || (0, EmojiPickerAction_1.isEmojiPickerVisible)() || isMenuVisible || !!(modal === null || modal === void 0 ? void 0 : modal.isVisible) || (modal === null || modal === void 0 ? void 0 : modal.willAlertModalBecomeVisible);
        return !isComposerCoveredUp;
    }, [isMenuVisible, modal, isFocused]);
    var focusComposerOnKeyPress = (0, react_1.useCallback)(function (e) {
        var _a, _b;
        var isComposerVisible = checkComposerVisibility();
        if (!isComposerVisible) {
            return;
        }
        // Do not focus the composer if the Side Panel is visible
        if (!isSidePanelHiddenOrLargeScreen) {
            return;
        }
        if (!(0, ReportUtils_1.shouldAutoFocusOnKeyPress)(e)) {
            return;
        }
        // if we're typing on another input/text area, do not focus
        if ([CONST_1.default.ELEMENT_NAME.INPUT, CONST_1.default.ELEMENT_NAME.TEXTAREA].includes((_b = (_a = e.target) === null || _a === void 0 ? void 0 : _a.nodeName) !== null && _b !== void 0 ? _b : '')) {
            return;
        }
        focus();
    }, [checkComposerVisibility, focus, isSidePanelHiddenOrLargeScreen]);
    var blur = (0, react_1.useCallback)(function () {
        if (!textInputRef.current) {
            return;
        }
        textInputRef.current.blur();
    }, []);
    var clear = (0, react_1.useCallback)(function () {
        'worklet';
        (0, ComponentUtils_1.forceClearInput)(animatedRef);
    }, [animatedRef]);
    var getCurrentText = (0, react_1.useCallback)(function () {
        return commentRef.current;
    }, []);
    (0, react_1.useEffect)(function () {
        var unsubscribeNavigationBlur = navigation.addListener('blur', function () { return (0, KeyDownPressListener_1.removeKeyDownPressListener)(focusComposerOnKeyPress); });
        var unsubscribeNavigationFocus = navigation.addListener('focus', function () {
            (0, KeyDownPressListener_1.addKeyDownPressListener)(focusComposerOnKeyPress);
            // The report isn't unmounted and can be focused again after going back from another report so we should update the composerRef again
            ReportActionComposeFocusManager_1.default.composerRef.current = textInputRef.current;
            setUpComposeFocusManager();
        });
        (0, KeyDownPressListener_1.addKeyDownPressListener)(focusComposerOnKeyPress);
        setUpComposeFocusManager();
        return function () {
            ReportActionComposeFocusManager_1.default.clear();
            (0, KeyDownPressListener_1.removeKeyDownPressListener)(focusComposerOnKeyPress);
            unsubscribeNavigationBlur();
            unsubscribeNavigationFocus();
        };
    }, [focusComposerOnKeyPress, navigation, setUpComposeFocusManager, isSidePanelHiddenOrLargeScreen]);
    var prevIsModalVisible = (0, usePrevious_1.default)(modal === null || modal === void 0 ? void 0 : modal.isVisible);
    var prevIsFocused = (0, usePrevious_1.default)(isFocused);
    (0, react_1.useEffect)(function () {
        var _a;
        var isModalVisible = modal === null || modal === void 0 ? void 0 : modal.isVisible;
        if (isModalVisible && !prevIsModalVisible) {
            // eslint-disable-next-line react-compiler/react-compiler, no-param-reassign
            isNextModalWillOpenRef.current = false;
        }
        // We want to blur the input immediately when a screen is out of focus.
        if (!isFocused) {
            (_a = textInputRef.current) === null || _a === void 0 ? void 0 : _a.blur();
            return;
        }
        // Do not focus the composer if the Side Panel is visible
        if (!isSidePanelHiddenOrLargeScreen) {
            return;
        }
        // We want to focus or refocus the input when a modal has been closed or the underlying screen is refocused.
        // We avoid doing this on native platforms since the software keyboard popping
        // open creates a jarring and broken UX.
        if (!((willBlurTextInputOnTapOutside || shouldAutoFocus) && !isNextModalWillOpenRef.current && !isModalVisible && (!!prevIsModalVisible || !prevIsFocused))) {
            return;
        }
        if (editFocused) {
            (0, InputFocus_1.inputFocusChange)(false);
            return;
        }
        focus(true);
    }, [focus, prevIsFocused, editFocused, prevIsModalVisible, isFocused, modal === null || modal === void 0 ? void 0 : modal.isVisible, isNextModalWillOpenRef, shouldAutoFocus, isSidePanelHiddenOrLargeScreen]);
    (0, react_1.useEffect)(function () {
        // Scrolls the composer to the bottom and sets the selection to the end, so that longer drafts are easier to edit
        (0, updateMultilineInputRange_1.default)(textInputRef.current, !!shouldAutoFocus);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    (0, react_1.useImperativeHandle)(ref, function () { return ({
        blur: blur,
        focus: focus,
        replaceSelectionWithText: replaceSelectionWithText,
        isFocused: function () { var _a; return !!((_a = textInputRef.current) === null || _a === void 0 ? void 0 : _a.isFocused()); },
        clear: clear,
        getCurrentText: getCurrentText,
    }); }, [blur, clear, focus, replaceSelectionWithText, getCurrentText]);
    (0, react_1.useEffect)(function () {
        onValueChange(value);
    }, [onValueChange, value]);
    var onLayout = (0, react_1.useCallback)(function (e) {
        onLayoutProps === null || onLayoutProps === void 0 ? void 0 : onLayoutProps(e);
        var composerLayoutHeight = e.nativeEvent.layout.height;
        if (composerHeight === composerLayoutHeight) {
            return;
        }
        setComposerHeight(composerLayoutHeight);
    }, [composerHeight, onLayoutProps]);
    var onClear = (0, react_1.useCallback)(function (text) {
        mobileInputScrollPosition.current = 0;
        // Note: use the value when the clear happened, not the current value which might have changed already
        onCleared(text);
        updateComment('', true);
    }, [onCleared, updateComment]);
    (0, react_1.useEffect)(function () {
        var _a;
        // We use the tag to store the native ID of the text input. Later, we use it in onSelectionChange to pick up the proper text input data.
        tag.set((_a = (0, react_native_1.findNodeHandle)(textInputRef.current)) !== null && _a !== void 0 ? _a : -1);
    }, [tag]);
    (0, react_native_keyboard_controller_1.useFocusedInputHandler)({
        onSelectionChange: function (event) {
            'worklet';
            if (event.target === tag.get()) {
                cursorPositionValue.set({
                    x: event.selection.end.x,
                    y: event.selection.end.y,
                });
            }
        },
    }, []);
    var measureParentContainerAndReportCursor = (0, react_1.useCallback)(function (callback) {
        var scrollValue = (0, getScrollPosition_1.default)({ mobileInputScrollPosition: mobileInputScrollPosition, textInputRef: textInputRef }).scrollValue;
        var _a = (0, getCursorPosition_1.default)({ positionOnMobile: cursorPositionValue.get(), positionOnWeb: selection }), xPosition = _a.x, yPosition = _a.y;
        measureParentContainer(function (x, y, width, height) {
            callback({
                x: x,
                y: y,
                width: width,
                height: height,
                scrollValue: scrollValue,
                cursorCoordinates: { x: xPosition, y: yPosition },
            });
        });
    }, [measureParentContainer, cursorPositionValue, selection]);
    var isTouchEndedRef = (0, react_1.useRef)(false);
    var containerComposeStyles = react_native_1.StyleSheet.flatten(StyleUtils.getContainerComposeStyles());
    var updateIsFullComposerAvailable = (0, react_1.useCallback)(function (e) {
        var paddingTopAndBottom = containerComposeStyles.paddingVertical * 2;
        var inputHeight = e.nativeEvent.contentSize.height;
        var totalHeight = inputHeight + paddingTopAndBottom;
        var isFullComposerAvailable = totalHeight >= CONST_1.default.COMPOSER.FULL_COMPOSER_MIN_HEIGHT;
        setIsFullComposerAvailable === null || setIsFullComposerAvailable === void 0 ? void 0 : setIsFullComposerAvailable(isFullComposerAvailable);
    }, [setIsFullComposerAvailable, containerComposeStyles]);
    return (<>
            <react_native_1.View style={[containerComposeStyles, styles.textInputComposeBorder]} onTouchEndCapture={function () {
            isTouchEndedRef.current = true;
        }}>
                <Composer_1.default checkComposerVisibility={checkComposerVisibility} autoFocus={!!shouldAutoFocus} multiline ref={setTextInputRef} placeholder={inputPlaceholder} placeholderTextColor={theme.placeholderText} onChangeText={onChangeText} onKeyPress={handleKeyPress} textAlignVertical="top" style={[styles.textInputCompose, isComposerFullSize ? styles.textInputFullCompose : styles.textInputCollapseCompose]} maxLines={maxComposerLines} onFocus={function () {
            // The last composer that had focus should re-gain focus
            setUpComposeFocusManager(true);
            onFocus();
        }} onBlur={onBlur} onClick={setShouldBlockSuggestionCalcToFalse} onPasteFile={function (file) {
            var _a;
            (_a = textInputRef.current) === null || _a === void 0 ? void 0 : _a.blur();
            displayFileInModal(file);
        }} onClear={onClear} isDisabled={isBlockedFromConcierge || disabled} selection={selection} onSelectionChange={onSelectionChange} isComposerFullSize={isComposerFullSize} onContentSizeChange={updateIsFullComposerAvailable} value={value} testID="composer" shouldCalculateCaretPosition onLayout={onLayout} onScroll={hideSuggestionMenu} shouldContainScroll={(0, Browser_1.isMobileSafari)()} isGroupPolicyReport={isGroupPolicyReport}/>
            </react_native_1.View>

            <Suggestions_1.default ref={suggestionsRef} isComposerFocused={(_c = textInputRef.current) === null || _c === void 0 ? void 0 : _c.isFocused()} updateComment={updateComment} measureParentContainerAndReportCursor={measureParentContainerAndReportCursor} isGroupPolicyReport={isGroupPolicyReport} policyID={policyID} 
    // Input
    value={value} selection={selection} setSelection={setSelection} resetKeyboardInput={resetKeyboardInput}/>

            {(0, ReportUtils_1.isValidReportIDFromPath)(reportID) && (<SilentCommentUpdater_1.default reportID={reportID} value={value} updateComment={updateComment} commentRef={commentRef} isCommentPendingSaved={isCommentPendingSaved}/>)}

            {/* Only used for testing so far */}
            {children}
        </>);
}
ComposerWithSuggestions.displayName = 'ComposerWithSuggestions';
exports.default = (0, react_1.memo)((0, react_1.forwardRef)(ComposerWithSuggestions));
