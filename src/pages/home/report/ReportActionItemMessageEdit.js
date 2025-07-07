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
var debounce_1 = require("lodash/debounce");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_keyboard_controller_1 = require("react-native-keyboard-controller");
var react_native_reanimated_1 = require("react-native-reanimated");
var Composer_1 = require("@components/Composer");
var EmojiPickerButton_1 = require("@components/EmojiPicker/EmojiPickerButton");
var ExceededCommentLength_1 = require("@components/ExceededCommentLength");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var PressableWithFeedback_1 = require("@components/Pressable/PressableWithFeedback");
var Tooltip_1 = require("@components/Tooltip");
var useHandleExceedMaxCommentLength_1 = require("@hooks/useHandleExceedMaxCommentLength");
var useKeyboardState_1 = require("@hooks/useKeyboardState");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePrevious_1 = require("@hooks/usePrevious");
var useReportScrollManager_1 = require("@hooks/useReportScrollManager");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Composer_2 = require("@libs/actions/Composer");
var EmojiPickerAction_1 = require("@libs/actions/EmojiPickerAction");
var InputFocus_1 = require("@libs/actions/InputFocus");
var Report_1 = require("@libs/actions/Report");
var index_website_1 = require("@libs/Browser/index.website");
var ComposerUtils_1 = require("@libs/ComposerUtils");
var DomUtils_1 = require("@libs/DomUtils");
var EmojiUtils_1 = require("@libs/EmojiUtils");
var focusComposerWithDelay_1 = require("@libs/focusComposerWithDelay");
var focusEditAfterCancelDelete_1 = require("@libs/focusEditAfterCancelDelete");
var Parser_1 = require("@libs/Parser");
var ReportActionComposeFocusManager_1 = require("@libs/ReportActionComposeFocusManager");
var ReportActionItemEventHandler_1 = require("@libs/ReportActionItemEventHandler");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var setShouldShowComposeInputKeyboardAware_1 = require("@libs/setShouldShowComposeInputKeyboardAware");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var keyboard_1 = require("@src/utils/keyboard");
var ReportActionContextMenu = require("./ContextMenu/ReportActionContextMenu");
var getCursorPosition_1 = require("./ReportActionCompose/getCursorPosition");
var getScrollPosition_1 = require("./ReportActionCompose/getScrollPosition");
var Suggestions_1 = require("./ReportActionCompose/Suggestions");
var shouldUseEmojiPickerSelection_1 = require("./shouldUseEmojiPickerSelection");
var shouldUseForcedSelectionRange = (0, shouldUseEmojiPickerSelection_1.default)();
// video source -> video attributes
var draftMessageVideoAttributeCache = new Map();
function ReportActionItemMessageEdit(_a, forwardedRef) {
    var _b;
    var action = _a.action, draftMessage = _a.draftMessage, reportID = _a.reportID, policyID = _a.policyID, index = _a.index, isGroupPolicyReport = _a.isGroupPolicyReport, _c = _a.shouldDisableEmojiPicker, shouldDisableEmojiPicker = _c === void 0 ? false : _c;
    var preferredSkinTone = (0, useOnyx_1.default)(ONYXKEYS_1.default.PREFERRED_EMOJI_SKIN_TONE, { initialValue: CONST_1.default.EMOJI_DEFAULT_SKIN_TONE, canBeMissing: true })[0];
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var containerRef = (0, react_1.useRef)(null);
    var reportScrollManager = (0, useReportScrollManager_1.default)();
    var _d = (0, useLocalize_1.default)(), translate = _d.translate, preferredLocale = _d.preferredLocale;
    var isKeyboardShown = (0, useKeyboardState_1.default)().isKeyboardShown;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var prevDraftMessage = (0, usePrevious_1.default)(draftMessage);
    var suggestionsRef = (0, react_1.useRef)(null);
    var mobileInputScrollPosition = (0, react_1.useRef)(0);
    var cursorPositionValue = (0, react_native_reanimated_1.useSharedValue)({ x: 0, y: 0 });
    var tag = (0, react_native_reanimated_1.useSharedValue)(-1);
    var emojisPresentBefore = (0, react_1.useRef)([]);
    var _e = (0, react_1.useState)(function () {
        if (draftMessage) {
            emojisPresentBefore.current = (0, EmojiUtils_1.extractEmojis)(draftMessage);
        }
        return draftMessage;
    }), draft = _e[0], setDraft = _e[1];
    var _f = (0, react_1.useState)({ start: draft.length, end: draft.length, positionX: 0, positionY: 0 }), selection = _f[0], setSelection = _f[1];
    var _g = (0, react_1.useState)(false), isFocused = _g[0], setIsFocused = _g[1];
    var _h = (0, useHandleExceedMaxCommentLength_1.default)(), hasExceededMaxCommentLength = _h.hasExceededMaxCommentLength, validateCommentMaxLength = _h.validateCommentMaxLength;
    var debouncedValidateCommentMaxLength = (0, react_1.useMemo)(function () { return (0, debounce_1.default)(validateCommentMaxLength, CONST_1.default.TIMING.COMMENT_LENGTH_DEBOUNCE_TIME); }, [validateCommentMaxLength]);
    var _j = (0, useOnyx_1.default)(ONYXKEYS_1.default.MODAL, { canBeMissing: true })[0], modal = _j === void 0 ? {
        willAlertModalBecomeVisible: false,
        isVisible: false,
    } : _j;
    var _k = (0, useOnyx_1.default)(ONYXKEYS_1.default.INPUT_FOCUSED, { canBeMissing: true })[0], onyxInputFocused = _k === void 0 ? false : _k;
    var textInputRef = (0, react_1.useRef)(null);
    var isFocusedRef = (0, react_1.useRef)(false);
    var draftRef = (0, react_1.useRef)(draft);
    var emojiPickerSelectionRef = (0, react_1.useRef)(undefined);
    // The ref to check whether the comment saving is in progress
    var isCommentPendingSaved = (0, react_1.useRef)(false);
    (0, react_1.useEffect)(function () {
        draftMessageVideoAttributeCache.clear();
        var originalMessage = Parser_1.default.htmlToMarkdown((0, ReportActionsUtils_1.getReportActionHtml)(action), {
            cacheVideoAttributes: function (videoSource, attrs) { return draftMessageVideoAttributeCache.set(videoSource, attrs); },
        });
        if ((0, ReportActionsUtils_1.isDeletedAction)(action) || !!(action.message && draftMessage === originalMessage) || !!(prevDraftMessage === draftMessage || isCommentPendingSaved.current)) {
            return;
        }
        setDraft(draftMessage);
    }, [draftMessage, action, prevDraftMessage]);
    (0, react_1.useEffect)(function () {
        (0, InputFocus_1.composerFocusKeepFocusOn)(textInputRef.current, isFocused, modal, onyxInputFocused);
    }, [isFocused, modal, onyxInputFocused]);
    (0, react_1.useEffect)(
    // Remove focus callback on unmount to avoid stale callbacks
    function () {
        if (textInputRef.current) {
            ReportActionComposeFocusManager_1.default.editComposerRef.current = textInputRef.current;
        }
        return function () {
            if (ReportActionComposeFocusManager_1.default.editComposerRef.current !== textInputRef.current) {
                return;
            }
            ReportActionComposeFocusManager_1.default.clear(true);
        };
    }, []);
    // We consider the report action active if it's focused, its emoji picker is open or its context menu is open
    var isActive = (0, react_1.useCallback)(function () { return isFocusedRef.current || (0, EmojiPickerAction_1.isActive)(action.reportActionID) || ReportActionContextMenu.isActiveReportAction(action.reportActionID); }, [action.reportActionID]);
    /**
     * Focus the composer text input
     * @param shouldDelay - Impose delay before focusing the composer
     */
    var focus = (0, react_1.useCallback)(function (shouldDelay, forcedSelectionRange) {
        if (shouldDelay === void 0) { shouldDelay = false; }
        (0, focusComposerWithDelay_1.default)(textInputRef.current)(shouldDelay, forcedSelectionRange);
    }, []);
    // Take over focus priority
    var setUpComposeFocusManager = (0, react_1.useCallback)(function () {
        ReportActionComposeFocusManager_1.default.onComposerFocus(function () {
            focus(true, emojiPickerSelectionRef.current ? __assign({}, emojiPickerSelectionRef.current) : undefined);
            emojiPickerSelectionRef.current = undefined;
        }, true);
    }, [focus]);
    // show the composer after editing is complete for devices that hide the composer during editing.
    (0, react_1.useEffect)(function () { return function () { return (0, Composer_2.setShouldShowComposeInput)(true); }; }, []);
    /**
     * Save the draft of the comment. This debounced so that we're not ceaselessly saving your edit. Saving the draft
     * allows one to navigate somewhere else and come back to the comment and still have it in edit mode.
     * @param {String} newDraft
     */
    var debouncedSaveDraft = (0, react_1.useMemo)(function () {
        // eslint-disable-next-line react-compiler/react-compiler
        return (0, debounce_1.default)(function (newDraft) {
            (0, Report_1.saveReportActionDraft)(reportID, action, newDraft);
            isCommentPendingSaved.current = false;
        }, 1000);
    }, [reportID, action]);
    (0, react_1.useEffect)(function () { return function () {
        debouncedSaveDraft.cancel();
        isCommentPendingSaved.current = false;
    }; }, [debouncedSaveDraft]);
    /**
     * Update the value of the draft in Onyx
     *
     * @param {String} newDraftInput
     */
    var updateDraft = (0, react_1.useCallback)(function (newDraftInput) {
        var _a;
        var _b = (0, EmojiUtils_1.replaceAndExtractEmojis)(newDraftInput, preferredSkinTone, preferredLocale), newDraft = _b.text, emojis = _b.emojis, cursorPosition = _b.cursorPosition;
        emojisPresentBefore.current = emojis;
        setDraft(newDraft);
        if (newDraftInput !== newDraft) {
            var position = Math.max(((_a = selection === null || selection === void 0 ? void 0 : selection.end) !== null && _a !== void 0 ? _a : 0) + (newDraft.length - draftRef.current.length), cursorPosition !== null && cursorPosition !== void 0 ? cursorPosition : 0);
            setSelection({
                start: position,
                end: position,
                positionX: 0,
                positionY: 0,
            });
        }
        draftRef.current = newDraft;
        // We want to escape the draft message to differentiate the HTML from the report action and the HTML the user drafted.
        debouncedSaveDraft(newDraft);
        isCommentPendingSaved.current = true;
    }, [debouncedSaveDraft, preferredSkinTone, preferredLocale, selection.end]);
    (0, react_1.useEffect)(function () {
        updateDraft(draft);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- run this only when language is changed
    }, [action.reportActionID, preferredLocale]);
    /**
     * Delete the draft of the comment being edited. This will take the comment out of "edit mode" with the old content.
     */
    var deleteDraft = (0, react_1.useCallback)(function () {
        (0, Report_1.deleteReportActionDraft)(reportID, action);
        if (isActive()) {
            ReportActionComposeFocusManager_1.default.clear(true);
            // Wait for report action compose re-mounting on mWeb
            react_native_1.InteractionManager.runAfterInteractions(function () { return ReportActionComposeFocusManager_1.default.focus(); });
        }
        // Scroll to the last comment after editing to make sure the whole comment is clearly visible in the report.
        if (index === 0) {
            keyboard_1.default.dismiss().then(function () {
                reportScrollManager.scrollToIndex(index, false);
            });
        }
    }, [action, index, reportID, reportScrollManager, isActive]);
    /**
     * Save the draft of the comment to be the new comment message. This will take the comment out of "edit mode" with
     * the new content.
     */
    var publishDraft = (0, react_1.useCallback)(function () {
        var _a;
        // Do nothing if draft exceed the character limit
        if ((0, ReportUtils_1.getCommentLength)(draft, { reportID: reportID }) > CONST_1.default.MAX_COMMENT_LENGTH) {
            return;
        }
        var trimmedNewDraft = draft.trim();
        // When user tries to save the empty message, it will delete it. Prompt the user to confirm deleting.
        if (!trimmedNewDraft) {
            (_a = textInputRef.current) === null || _a === void 0 ? void 0 : _a.blur();
            ReportActionContextMenu.showDeleteModal(reportID, action, true, deleteDraft, function () { return (0, focusEditAfterCancelDelete_1.default)(textInputRef.current); });
            return;
        }
        (0, Report_1.editReportComment)(reportID, action, trimmedNewDraft, Object.fromEntries(draftMessageVideoAttributeCache));
        deleteDraft();
    }, [action, deleteDraft, draft, reportID]);
    /**
     * @param emoji
     */
    var addEmojiToTextBox = function (emoji) {
        var newSelection = {
            start: selection.start + emoji.length + CONST_1.default.SPACE_LENGTH,
            end: selection.start + emoji.length + CONST_1.default.SPACE_LENGTH,
            positionX: 0,
            positionY: 0,
        };
        setSelection(newSelection);
        if (shouldUseForcedSelectionRange) {
            // On Android and Chrome mobile, focusing the input sets the cursor position back to the start.
            // To fix this, immediately set the selection again after focusing the input.
            emojiPickerSelectionRef.current = newSelection;
        }
        updateDraft((0, ComposerUtils_1.insertText)(draft, selection, "".concat(emoji, " ")));
    };
    var hideSuggestionMenu = (0, react_1.useCallback)(function () {
        if (!suggestionsRef.current) {
            return;
        }
        suggestionsRef.current.updateShouldShowSuggestionMenuToFalse(false);
    }, [suggestionsRef]);
    var onSaveScrollAndHideSuggestionMenu = (0, react_1.useCallback)(function (e) {
        var _a, _b, _c;
        mobileInputScrollPosition.current = (_c = (_b = (_a = e === null || e === void 0 ? void 0 : e.nativeEvent) === null || _a === void 0 ? void 0 : _a.contentOffset) === null || _b === void 0 ? void 0 : _b.y) !== null && _c !== void 0 ? _c : 0;
        hideSuggestionMenu();
    }, [hideSuggestionMenu]);
    /**
     * Key event handlers that short cut to saving/canceling.
     *
     * @param {Event} e
     */
    var triggerSaveOrCancel = (0, react_1.useCallback)(function (e) {
        var _a, _b;
        if (!e || (0, ComposerUtils_1.canSkipTriggerHotkeys)(shouldUseNarrowLayout, isKeyboardShown)) {
            return;
        }
        var keyEvent = e;
        var isSuggestionsMenuVisible = (_a = suggestionsRef.current) === null || _a === void 0 ? void 0 : _a.getIsSuggestionsMenuVisible();
        if (isSuggestionsMenuVisible) {
            (_b = suggestionsRef.current) === null || _b === void 0 ? void 0 : _b.triggerHotkeyActions(keyEvent);
            return;
        }
        if (keyEvent.key === CONST_1.default.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey && isSuggestionsMenuVisible) {
            e.preventDefault();
            hideSuggestionMenu();
            return;
        }
        if (keyEvent.key === CONST_1.default.KEYBOARD_SHORTCUTS.ENTER.shortcutKey && !keyEvent.shiftKey) {
            e.preventDefault();
            publishDraft();
        }
        else if (keyEvent.key === CONST_1.default.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey) {
            e.preventDefault();
            deleteDraft();
        }
    }, [deleteDraft, hideSuggestionMenu, isKeyboardShown, shouldUseNarrowLayout, publishDraft]);
    var measureContainer = (0, react_1.useCallback)(function (callback) {
        if (!containerRef.current) {
            return;
        }
        containerRef.current.measureInWindow(callback);
    }, []);
    var measureParentContainerAndReportCursor = (0, react_1.useCallback)(function (callback) {
        var scrollValue = (0, getScrollPosition_1.default)({ mobileInputScrollPosition: mobileInputScrollPosition, textInputRef: textInputRef }).scrollValue;
        var _a = (0, getCursorPosition_1.default)({ positionOnMobile: cursorPositionValue.get(), positionOnWeb: selection }), xPosition = _a.x, yPosition = _a.y;
        measureContainer(function (x, y, width, height) {
            callback({
                x: x,
                y: y,
                width: width,
                height: height,
                scrollValue: scrollValue,
                cursorCoordinates: { x: xPosition, y: yPosition },
            });
        });
    }, [cursorPositionValue, measureContainer, selection]);
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
    (0, react_1.useEffect)(function () {
        debouncedValidateCommentMaxLength(draft, { reportID: reportID });
    }, [draft, reportID, debouncedValidateCommentMaxLength]);
    (0, react_1.useEffect)(function () {
        // required for keeping last state of isFocused variable
        isFocusedRef.current = isFocused;
        if (!isFocused) {
            hideSuggestionMenu();
        }
    }, [isFocused, hideSuggestionMenu]);
    var closeButtonStyles = [styles.composerSizeButton, { marginVertical: styles.composerSizeButton.marginHorizontal }];
    return (<>
            <react_native_1.View style={[styles.chatItemMessage, styles.flexRow]} ref={containerRef}>
                <react_native_1.View style={[
            isFocused ? styles.chatItemComposeBoxFocusedColor : styles.chatItemComposeBoxColor,
            styles.flexRow,
            styles.flex1,
            styles.chatItemComposeBox,
            hasExceededMaxCommentLength && styles.borderColorDanger,
        ]}>
                    <react_native_1.View style={[styles.justifyContentEnd, styles.mb1]}>
                        <Tooltip_1.default text={translate('common.cancel')}>
                            <PressableWithFeedback_1.default onPress={deleteDraft} style={closeButtonStyles} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={translate('common.close')} 
    // disable dimming
    hoverDimmingValue={1} pressDimmingValue={1} 
    // Keep focus on the composer when cancel button is clicked.
    onMouseDown={function (e) { return e.preventDefault(); }}>
                                <Icon_1.default fill={theme.icon} src={Expensicons.Close}/>
                            </PressableWithFeedback_1.default>
                        </Tooltip_1.default>
                    </react_native_1.View>
                    <react_native_1.View style={[StyleUtils.getContainerComposeStyles(), styles.textInputComposeBorder]}>
                        <Composer_1.default multiline ref={function (el) {
            textInputRef.current = el;
            if (typeof forwardedRef === 'function') {
                forwardedRef(el);
            }
            else if (forwardedRef) {
                // eslint-disable-next-line no-param-reassign
                forwardedRef.current = el;
            }
        }} onChangeText={updateDraft} // Debounced saveDraftComment
     onKeyPress={triggerSaveOrCancel} value={draft} maxLines={shouldUseNarrowLayout ? CONST_1.default.COMPOSER.MAX_LINES_SMALL_SCREEN : CONST_1.default.COMPOSER.MAX_LINES} // This is the same that slack has
     style={[styles.textInputCompose, styles.flex1, styles.bgTransparent]} onFocus={function () {
            var _a;
            setIsFocused(true);
            if (textInputRef.current) {
                ReportActionComposeFocusManager_1.default.editComposerRef.current = textInputRef.current;
            }
            react_native_1.InteractionManager.runAfterInteractions(function () {
                requestAnimationFrame(function () {
                    reportScrollManager.scrollToIndex(index, true);
                });
            });
            if ((0, index_website_1.isMobileChrome)() && ((_a = reportScrollManager.ref) === null || _a === void 0 ? void 0 : _a.current)) {
                reportScrollManager.ref.current.scrollToIndex({ index: index, animated: false });
            }
            (0, setShouldShowComposeInputKeyboardAware_1.default)(false);
            // The last composer that had focus should re-gain focus
            setUpComposeFocusManager();
            // Clear active report action when another action gets focused
            if (!(0, EmojiPickerAction_1.isActive)(action.reportActionID)) {
                (0, EmojiPickerAction_1.clearActive)();
            }
            if (!ReportActionContextMenu.isActiveReportAction(action.reportActionID)) {
                ReportActionContextMenu.clearActiveReportAction();
            }
        }} onBlur={function (event) {
            var _a, _b;
            setIsFocused(false);
            var relatedTargetId = (_b = (_a = event.nativeEvent) === null || _a === void 0 ? void 0 : _a.relatedTarget) === null || _b === void 0 ? void 0 : _b.id;
            if (relatedTargetId === CONST_1.default.COMPOSER.NATIVE_ID || relatedTargetId === CONST_1.default.EMOJI_PICKER_BUTTON_NATIVE_ID || (0, EmojiPickerAction_1.isEmojiPickerVisible)()) {
                return;
            }
            (0, setShouldShowComposeInputKeyboardAware_1.default)(true);
        }} onLayout={ReportActionItemEventHandler_1.default.handleComposerLayoutChange(reportScrollManager, index)} selection={selection} onSelectionChange={function (e) { return setSelection(e.nativeEvent.selection); }} isGroupPolicyReport={isGroupPolicyReport} shouldCalculateCaretPosition onScroll={onSaveScrollAndHideSuggestionMenu}/>
                    </react_native_1.View>

                    <Suggestions_1.default ref={suggestionsRef} 
    // eslint-disable-next-line react-compiler/react-compiler
    isComposerFocused={(_b = textInputRef.current) === null || _b === void 0 ? void 0 : _b.isFocused()} updateComment={updateDraft} measureParentContainerAndReportCursor={measureParentContainerAndReportCursor} isGroupPolicyReport={isGroupPolicyReport} policyID={policyID} value={draft} selection={selection} setSelection={setSelection}/>

                    <react_native_1.View style={styles.editChatItemEmojiWrapper}>
                        <EmojiPickerButton_1.default isDisabled={shouldDisableEmojiPicker} onModalHide={function () {
            var _a;
            var activeElementId = (_a = DomUtils_1.default.getActiveElement()) === null || _a === void 0 ? void 0 : _a.id;
            if (activeElementId === CONST_1.default.COMPOSER.NATIVE_ID || activeElementId === CONST_1.default.EMOJI_PICKER_BUTTON_NATIVE_ID) {
                return;
            }
            ReportActionComposeFocusManager_1.default.focus();
        }} onEmojiSelected={addEmojiToTextBox} emojiPickerID={action.reportActionID} onPress={setUpComposeFocusManager}/>
                    </react_native_1.View>

                    <react_native_1.View style={styles.alignSelfEnd}>
                        <Tooltip_1.default text={translate('common.saveChanges')}>
                            <PressableWithFeedback_1.default style={[styles.chatItemSubmitButton, hasExceededMaxCommentLength ? {} : styles.buttonSuccess]} onPress={publishDraft} disabled={hasExceededMaxCommentLength} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={translate('common.saveChanges')} hoverDimmingValue={1} pressDimmingValue={0.2} 
    // Keep focus on the composer when send button is clicked.
    onMouseDown={function (e) { return e.preventDefault(); }}>
                                <Icon_1.default src={Expensicons.Checkmark} fill={hasExceededMaxCommentLength ? theme.icon : theme.textLight}/>
                            </PressableWithFeedback_1.default>
                        </Tooltip_1.default>
                    </react_native_1.View>
                </react_native_1.View>
            </react_native_1.View>
            {hasExceededMaxCommentLength && <ExceededCommentLength_1.default />}
        </>);
}
ReportActionItemMessageEdit.displayName = 'ReportActionItemMessageEdit';
exports.default = (0, react_1.forwardRef)(ReportActionItemMessageEdit);
