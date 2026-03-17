import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import lodashDebounce from 'lodash/debounce';
import type {Ref, RefObject} from 'react';
import React, {memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import type {BlurEvent, LayoutChangeEvent, MeasureInWindowOnSuccessCallback, TextInputContentSizeChangeEvent, TextInputKeyPressEvent, TextInputScrollEvent} from 'react-native';
import {DeviceEventEmitter, InteractionManager, NativeModules, StyleSheet, View} from 'react-native';
import {useFocusedInputHandler} from 'react-native-keyboard-controller';
import type {OnyxEntry} from 'react-native-onyx';
import {useAnimatedRef, useSharedValue} from 'react-native-reanimated';
import type {Emoji} from '@assets/emojis/types';
import type {MeasureParentContainerAndCursorCallback} from '@components/AutoCompleteSuggestions/types';
import Composer from '@components/Composer';
import type {ComposerRef, CustomSelectionChangeEvent, TextSelection} from '@components/Composer/types';
import {useWideRHPState} from '@components/WideRHPContextProvider';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelState from '@hooks/useSidePanelState';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {isMobileSafari} from '@libs/Browser';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import {forceClearInput} from '@libs/ComponentUtils';
import {canSkipTriggerHotkeys, findCommonSuffixLength, insertText, insertWhiteSpaceAtIndex} from '@libs/ComposerUtils';
import convertToLTRForComposer from '@libs/convertToLTRForComposer';
import {containsOnlyEmojis, extractEmojis, getAddedEmojis, getTextVSCursorOffset, insertTextVSBetweenDigitAndEmoji, replaceAndExtractEmojis} from '@libs/EmojiUtils';
import focusComposerWithDelay from '@libs/focusComposerWithDelay';
import type {ForwardedFSClassProps} from '@libs/Fullstory/types';
import getPlatform from '@libs/getPlatform';
import {addKeyDownPressListener, removeKeyDownPressListener} from '@libs/KeyboardShortcut/KeyDownPressListener';
import {detectAndRewritePaste} from '@libs/MarkdownLinkHelpers';
import Parser from '@libs/Parser';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {isValidReportIDFromPath, shouldAutoFocusOnKeyPress} from '@libs/ReportUtils';
import updateMultilineInputRange from '@libs/updateMultilineInputRange';
import willBlurTextInputOnTapOutsideFunc from '@libs/willBlurTextInputOnTapOutside';
import {useReportActionActiveEdit, useReportActionActiveEditActions} from '@pages/inbox/report/ReportActionEditMessageContext';
import useDraftMessageVideoAttributeCache from '@pages/inbox/report/useDraftMessageVideoAttributeCache';
import {isEmojiPickerVisible} from '@userActions/EmojiPickerAction';
import type {OnEmojiSelected} from '@userActions/EmojiPickerAction';
import {inputFocusChange} from '@userActions/InputFocus';
import {areAllModalsHidden} from '@userActions/Modal';
import {broadcastUserIsTyping, saveReportActionDraft, saveReportDraftComment} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
// eslint-disable-next-line no-restricted-imports
import findNodeHandle from '@src/utils/findNodeHandle';
import getCursorPosition from './getCursorPosition';
import getScrollPosition from './getScrollPosition';
import type {SuggestionsRef} from './ReportActionCompose';
import SilentCommentUpdater from './SilentCommentUpdater';
import Suggestions from './Suggestions';

type SyncSelection = {
    position: number;
    value: string;
};

type NewlyAddedChars = {startIndex: number; endIndex: number; diff: string};

type ComposerWithSuggestionsRef = ComposerRef & {
    /** Focus the composer */
    focus: (shouldDelay?: boolean) => void;

    /** Replace the selection with text */
    replaceSelectionWithText: OnEmojiSelected;

    /** Get the current text of the composer */
    getCurrentText: () => string;

    /**
     * Calling clear will immediately clear the input on the UI thread (its a worklet).
     * Once the composer ahs cleared onCleared will be called with the value that was cleared.
     */
    clearWorklet: () => void;

    /** Reset the height of the composer */
    resetHeight: () => void;
};

type ComposerWithSuggestionsProps = Partial<ChildrenProps> &
    ForwardedFSClassProps & {
        /** Report ID */
        reportID: string;

        /** Callback to focus composer */
        onFocus: () => void;

        /** Callback to blur composer */
        onBlur: (event: BlurEvent) => void;

        /** Callback when layout of composer changes */
        onLayout?: (event: LayoutChangeEvent) => void;

        /** Callback to update the value of the composer */
        onValueChange: (value: string) => void;

        /** Callback when the composer got cleared on the UI thread */
        onClear?: (text: string) => void;

        /** Whether the composer is full size */
        isComposerFullSize: boolean;

        /** Function to set whether the full composer is available */
        setIsFullComposerAvailable: (isFullComposerAvailable: boolean) => void;

        /** Whether the menu is visible */
        isMenuVisible: boolean;

        /** The placeholder for the input */
        inputPlaceholder: string;

        /** Callback when a file is pasted */
        onPasteFile: (file: FileObject | FileObject[]) => void;

        /** Whether the input is disabled, defaults to false */
        disabled?: boolean;

        /** Function to set whether the comment is empty */
        setIsCommentEmpty: (isCommentEmpty: boolean) => void;

        /** Function to handle sending a message */
        onEnterKeyPress: () => void;

        /** Function to measure the parent container */
        measureParentContainer: (callback: MeasureInWindowOnSuccessCallback) => void;

        /** Whether the scroll is likely to trigger a layout */
        isScrollLikelyLayoutTriggered: RefObject<boolean>;

        /** Function to raise the scroll is likely layout triggered */
        raiseIsScrollLikelyLayoutTriggered: () => void;

        /** The ref to the suggestions */
        suggestionsRef: React.RefObject<SuggestionsRef | null>;

        /** The ref to the next modal will open */
        isNextModalWillOpenRef: RefObject<boolean | null>;

        /** The last report action */
        lastReportAction?: OnyxEntry<OnyxTypes.ReportAction>;

        /** Whether to include chronos */
        includeChronos?: boolean;

        /** Whether report is from group policy */
        isGroupPolicyReport: boolean;

        /** policy ID of the report */
        policyID?: string;

        /** Reference to the outer element */
        ref?: Ref<ComposerWithSuggestionsRef | null>;
    };

type SwitchToCurrentReportProps = {
    preexistingReportID: string;
    reportToCopyDraftTo: string;
    callback: () => void;
};
const {RNTextInputReset} = NativeModules;

const isIOSNative = getPlatform() === CONST.PLATFORM.IOS;

/**
 * Broadcast that the user is typing. Debounced to limit how often we publish client events.
 */
const debouncedBroadcastUserIsTyping = lodashDebounce(
    (reportID: string, currentUserAccountID: number) => {
        broadcastUserIsTyping(reportID, currentUserAccountID);
    },
    1000,
    {
        maxWait: 1000,
        leading: true,
    },
);

const willBlurTextInputOnTapOutside = willBlurTextInputOnTapOutsideFunc();

// We want consistent auto focus behavior on input between native and mWeb so we have some auto focus management code that will
// prevent auto focus for mobile device
const shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();

/**
 * This component holds the value and selection state.
 * If a component really needs access to these state values it should be put here.
 * However, double check if the component really needs access, as it will re-render
 * on every key press.
 */
function ComposerWithSuggestions({
    // Props: Report
    reportID,
    includeChronos,
    lastReportAction,
    isGroupPolicyReport,
    policyID,

    // Focus
    onFocus,
    onBlur,
    onValueChange,

    // Composer
    isComposerFullSize,
    setIsFullComposerAvailable,
    isMenuVisible,
    inputPlaceholder,
    onPasteFile,
    disabled,
    setIsCommentEmpty,
    onEnterKeyPress,
    measureParentContainer = () => {},
    isScrollLikelyLayoutTriggered,
    raiseIsScrollLikelyLayoutTriggered,
    onClear: onClearProp = () => {},
    onLayout,

    // Refs
    suggestionsRef,
    isNextModalWillOpenRef,
    ref,

    // For testing
    children,

    // Fullstory
    forwardedFSClass,
}: ComposerWithSuggestionsProps) {
    const route = useRoute();
    const {isKeyboardShown} = useKeyboardState();
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {preferredLocale} = useLocalize();
    const {isSidePanelHiddenOrLargeScreen} = useSidePanelState();
    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const emojisPresentBefore = useRef<Emoji[]>([]);
    const mobileInputScrollPosition = useRef(0);
    const cursorPositionValue = useSharedValue({x: 0, y: 0});
    const tag = useSharedValue(-1);
    const [draftComment = ''] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`);
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const composerRef = useRef<ComposerRef | null>(null);

    const {editingState, editingReportActionID, editingReportAction, editingMessage, currentEditMessageSelection} = useReportActionActiveEdit();
    const {setEditingMessage, setCurrentEditMessageSelection} = useReportActionActiveEditActions();

    const [value, setValue] = useState(() => {
        const initialValue = shouldUseNarrowLayout ? (editingMessage ?? draftComment) : draftComment;

        if (initialValue) {
            emojisPresentBefore.current = extractEmojis(initialValue);
        }
        return initialValue;
    });

    // The ref to check whether the comment saving is in progress
    const isDraftPendingSaved = useRef(false);

    useDraftMessageVideoAttributeCache({
        draftMessage: value,
        isEditing: !!editingReportActionID,
        editingReportAction,
        updateDraftMessage: setValue,
        isEditInProgressRef: isDraftPendingSaved,
    });

    const [selection, setSelection] = useState<TextSelection>(() => currentEditMessageSelection ?? {start: value.length, end: value.length});

    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const commentRef = useRef(value);

    const updateSelectionImperatively = useCallback((start: number, end: number) => {
        if (!isIOSNative) {
            return;
        }

        // ensure that selection is set imperatively after all state changes are effective
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            // note: this implementation is only available on non-web RN, thus the wrapping
            // 'if' block contains a redundant (since the ref is only used on iOS) platform check
            composerRef.current?.setSelection(start, end);
        });
    }, []);

    type ApplyComposerValueOptions = {
        isEditingInComposer?: boolean;
        shouldMoveSelectionToEnd?: boolean;
        selection?: TextSelection | null;
    };

    const applyComposerValue = useCallback(
        (nextValue: string, options?: ApplyComposerValueOptions) => {
            const defaultSelection: TextSelection = {start: nextValue.length, end: nextValue.length};
            const shouldUseEditingSelection = options?.isEditingInComposer ?? false;
            const shouldForceSelectionToEnd = options?.shouldMoveSelectionToEnd ?? false;
            const explicitSelection = options?.selection ?? null;

            const selectionToApply = explicitSelection ?? (shouldUseEditingSelection && !shouldForceSelectionToEnd ? (currentEditMessageSelection ?? defaultSelection) : defaultSelection);

            commentRef.current = nextValue;
            emojisPresentBefore.current = extractEmojis(nextValue);

            setValue(nextValue);
            setSelection(selectionToApply);
            updateSelectionImperatively(selectionToApply.start, selectionToApply.end ?? selectionToApply.start);

            if (options?.isEditingInComposer) {
                composerRef.current?.focus();
            }
        },
        [currentEditMessageSelection, updateSelectionImperatively],
    );

    const wasEditing = useRef(!!editingReportActionID);
    const wasEditingInComposerRef = useRef(shouldUseNarrowLayout);
    const previousDraftSelectionRef = useRef<TextSelection | null>(null);

    useEffect(() => {
        if (editingState === 'submitted') {
            return;
        }

        const isEditing = editingState === 'editing';

        if (!isEditing) {
            if (wasEditing.current && wasEditingInComposerRef.current) {
                // Editing just ended in the composer – restore the draft comment and its previous selection.
                applyComposerValue(draftComment ?? '', {selection: previousDraftSelectionRef.current});
            }

            wasEditing.current = false;
            wasEditingInComposerRef.current = shouldUseNarrowLayout;
            previousDraftSelectionRef.current = null;
            return;
        }

        // Editing just started.
        if (!wasEditing.current) {
            // Store the draft selection before switching into edit mode so we can restore it later.
            previousDraftSelectionRef.current = selection;

            wasEditing.current = true;
            wasEditingInComposerRef.current = shouldUseNarrowLayout;

            if (!shouldUseNarrowLayout) {
                // Wide layout – another editor handles the edit, keep composer draft as-is.
                return;
            }
            // In narrow layout we always show the message being edited.
            // When starting to edit in the composer, always place the cursor at the end of the message.
            applyComposerValue(editingMessage ?? '', {isEditingInComposer: true, shouldMoveSelectionToEnd: true});
            return;
        }

        // Editing is ongoing and layout toggled from wide to narrow.
        if (shouldUseNarrowLayout && !wasEditingInComposerRef.current) {
            wasEditingInComposerRef.current = true;
            // We just moved from wide to narrow while editing – start editing in the composer.
            applyComposerValue(editingMessage ?? '', {isEditingInComposer: true});
            return;
        }

        // Editing is ongoing and layout toggled from narrow to wide.
        if (!shouldUseNarrowLayout && wasEditingInComposerRef.current) {
            wasEditingInComposerRef.current = false;
            applyComposerValue(draftComment ?? '');
        }

        if (shouldUseNarrowLayout) {
            applyComposerValue(editingMessage ?? '', {isEditingInComposer: true});
        }
    }, [applyComposerValue, draftComment, editingMessage, editingReportActionID, editingState, selection, shouldUseNarrowLayout, updateSelectionImperatively]);

    const {superWideRHPRouteKeys} = useWideRHPState();
    // When SearchReport is stacked above another RHP, delay autofocus until after the transition completes to avoid animation jank
    const shouldDelayAutoFocus = superWideRHPRouteKeys.length > 0 && route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT;
    const shouldDelayAutoFocusRef = useRef(shouldDelayAutoFocus);
    shouldDelayAutoFocusRef.current = shouldDelayAutoFocus;

    const [modal] = useOnyx(ONYXKEYS.MODAL);
    const [preferredSkinTone = CONST.EMOJI_DEFAULT_SKIN_TONE] = useOnyx(ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE);
    const [editFocused] = useOnyx(ONYXKEYS.INPUT_FOCUSED);

    const lastTextRef = useRef(value);
    useEffect(() => {
        lastTextRef.current = value;
    }, [value]);

    const maxComposerLines = shouldUseNarrowLayout ? CONST.COMPOSER.MAX_LINES_SMALL_SCREEN : CONST.COMPOSER.MAX_LINES;
    const shouldAutoFocus = (shouldFocusInputOnScreenFocus || !!draftComment) && areAllModalsHidden() && isFocused;
    const delayedAutoFocusRouteKeyRef = useRef<string | null>(null);

    const valueRef = useRef(value);
    valueRef.current = value;

    const [composerHeightAfterClear, setComposerHeightAfterClear] = useState<number | null>(null);
    const emptyComposerHeightRef = useRef<number | null>(null);

    const syncSelectionWithOnChangeTextRef = useRef<SyncSelection | null>(null);

    // Tracks transition state to prevent SilentCommentUpdater from overwriting the just-saved draft during report ID changes
    const isTransitioningToPreExistingReport = useRef(false);

    // Callback to clear the transitioning flag - passed to SilentCommentUpdater to avoid prop mutation
    const handleTransitionToPreExistingReportComplete = useCallback(() => {
        isTransitioningToPreExistingReport.current = false;
    }, []);

    const animatedRef = useAnimatedRef();
    /**
     * Set the TextInput Ref
     */
    const setComposerRef = useCallback(
        (el: ComposerRef) => {
            if (isFocused) {
                ReportActionComposeFocusManager.composerRef.current = el;
            }
            composerRef.current = el;
            if (typeof animatedRef === 'function') {
                animatedRef(el);
            }
        },
        [animatedRef, isFocused],
    );

    const resetKeyboardInput = useCallback(() => {
        if (!RNTextInputReset) {
            return;
        }
        RNTextInputReset.resetKeyboardInput(CONST.COMPOSER.NATIVE_ID);
    }, []);

    /**
     * Save the draft of the comment. This debounced so that we're not ceaselessly saving your edit. Saving the draft
     * allows one to navigate somewhere else and come back to the comment and still have it in edit mode.
     * @param {String} newDraft
     */
    const debouncedSaveDraft = useMemo(
        () =>
            lodashDebounce((newDraft: string) => {
                saveReportActionDraft(reportID, editingReportAction, newDraft);
                isDraftPendingSaved.current = false;
            }, 1000),
        [reportID, editingReportAction],
    );

    useEffect(
        () => () => {
            debouncedSaveDraft.cancel();
            isDraftPendingSaved.current = false;
        },
        [debouncedSaveDraft],
    );

    // The ref to check whether the comment saving is in progress
    const isCommentPendingSaved = useRef(false);

    const debouncedSaveReportComment = useMemo(
        () =>
            lodashDebounce((selectedReportID: string, newComment: string | null) => {
                saveReportDraftComment(selectedReportID, newComment);
                isCommentPendingSaved.current = false;
            }, 1000),
        [],
    );

    useEffect(() => {
        const switchToCurrentReport = DeviceEventEmitter.addListener(`switchToPreExistingReport_${reportID}`, ({reportToCopyDraftTo, callback}: SwitchToCurrentReportProps) => {
            if (!commentRef.current) {
                callback();
                return;
            }

            // Mark that we're transitioning to a preexisting report
            // This prevents SilentCommentUpdater from overwriting the draft
            isTransitioningToPreExistingReport.current = true;
            saveReportDraftComment(reportToCopyDraftTo, commentRef.current, callback);
        });

        return () => {
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
    const findNewlyAddedChars = useCallback(
        (prevText: string, newText: string): NewlyAddedChars => {
            let startIndex = -1;
            let endIndex = -1;
            let currentIndex = 0;

            // Find the first character mismatch with newText
            while (currentIndex < newText.length && prevText.charAt(currentIndex) === newText.charAt(currentIndex) && selection.start > currentIndex) {
                currentIndex++;
            }

            if (currentIndex < newText.length) {
                startIndex = currentIndex;
                const commonSuffixLength = findCommonSuffixLength(prevText, newText, selection?.end ?? 0);
                // if text is getting pasted over find length of common suffix and subtract it from new text length
                if (commonSuffixLength > 0 || (selection?.end ?? 0) - selection.start > 0) {
                    endIndex = newText.length - commonSuffixLength;
                } else {
                    endIndex = currentIndex + newText.length;
                }
            }
            return {
                startIndex,
                endIndex,
                diff: newText.substring(startIndex, endIndex),
            };
        },
        [selection.start, selection.end],
    );

    /**
     * Update the value of the comment in Onyx
     */
    const updateComment = useCallback(
        (commentValue: string, shouldDebounceSaveComment?: boolean) => {
            raiseIsScrollLikelyLayoutTriggered();

            // previous text before change
            const prevText = lastTextRef.current;
            // snapshot selection (should be the selection that was active just before the paste/change)
            const prevSelectionStart = selection?.start ?? 0;
            const prevSelectionEnd = selection?.end ?? 0;

            // detect newly added text (existing helper)
            const {startIndex, endIndex, diff} = findNewlyAddedChars(prevText, commentValue);

            // Try to rewrite if this looks like "selected text replaced with a single URL"
            const {text: rewritten, didReplace} = detectAndRewritePaste(prevText, prevSelectionStart, prevSelectionEnd, diff);

            // Use the rewritten text when we replaced; otherwise fall back to the original commentValue pipeline
            const effectiveCommentValue = didReplace ? (rewritten ?? commentValue) : commentValue;

            // Emoji handling: skip the "emoji inserted" special-case when we performed the markdown rewrite.
            const isEmojiInserted =
                !didReplace && // <-- use the didReplace flag instead of searching for '['
                diff.length &&
                endIndex > startIndex &&
                diff.trim() === diff &&
                containsOnlyEmojis(diff);
            const commentWithSpaceInserted = isEmojiInserted ? insertWhiteSpaceAtIndex(effectiveCommentValue, endIndex) : effectiveCommentValue;
            const {text: emojiConvertedText, emojis, cursorPosition} = replaceAndExtractEmojis(commentWithSpaceInserted, preferredSkinTone, preferredLocale);

            const newComment = insertTextVSBetweenDigitAndEmoji(emojiConvertedText);
            const textVSOffset = getTextVSCursorOffset(emojiConvertedText, cursorPosition);

            if (emojis.length) {
                const newEmojis = getAddedEmojis(emojis, emojisPresentBefore.current);
                if (newEmojis.length) {
                    // Ensure emoji suggestions are hidden after inserting emoji even when the selection is not changed
                    if (suggestionsRef.current) {
                        suggestionsRef.current.resetSuggestions();
                    }
                }
            }
            const newCommentConverted = convertToLTRForComposer(newComment);
            const isNewCommentEmpty = !!newCommentConverted.match(/^(\s)*$/);
            const isPrevCommentEmpty = !!commentRef.current.match(/^(\s)*$/);

            /** Only update isCommentEmpty state if it's different from previous one */
            if (isNewCommentEmpty !== isPrevCommentEmpty) {
                setIsCommentEmpty(isNewCommentEmpty);
            }
            emojisPresentBefore.current = emojis;

            setValue(newCommentConverted);
            if (commentValue !== newComment) {
                const adjustedCursorPosition = cursorPosition !== undefined && cursorPosition !== null ? cursorPosition + textVSOffset : undefined;
                const position = Math.max((selection.end ?? 0) + (newComment.length - commentRef.current.length), adjustedCursorPosition ?? 0);

                if (commentWithSpaceInserted !== newComment && isIOSNative) {
                    syncSelectionWithOnChangeTextRef.current = {position, value: newComment};
                }

                setSelection((prevSelection) => ({
                    ...prevSelection,
                    start: position,
                    end: position,
                }));

                setCurrentEditMessageSelection((prevSelection) => ({...prevSelection, start: position, end: position}));
            }

            commentRef.current = newCommentConverted;
            if (editingState === 'editing' && shouldUseNarrowLayout) {
                setEditingMessage(newCommentConverted);
                if (shouldDebounceSaveComment) {
                    isDraftPendingSaved.current = true;
                    debouncedSaveDraft(newCommentConverted);
                    return;
                }

                saveReportActionDraft(reportID, {reportActionID: editingReportActionID} as OnyxTypes.ReportAction, newCommentConverted);
                return;
            }

            if (shouldDebounceSaveComment) {
                isCommentPendingSaved.current = true;
                debouncedSaveReportComment(reportID, newCommentConverted);
            } else {
                saveReportDraftComment(reportID, newCommentConverted);
            }

            if (newCommentConverted) {
                debouncedBroadcastUserIsTyping(reportID, currentUserAccountID);
            }
        },
        [
            currentUserAccountID,
            debouncedSaveDraft,
            debouncedSaveReportComment,
            editingReportActionID,
            editingState,
            findNewlyAddedChars,
            preferredLocale,
            preferredSkinTone,
            raiseIsScrollLikelyLayoutTriggered,
            reportID,
            selection.end,
            selection?.start,
            setCurrentEditMessageSelection,
            setEditingMessage,
            setIsCommentEmpty,
            shouldUseNarrowLayout,
            suggestionsRef,
        ],
    );

    /**
     * Callback to add whatever text is chosen into the main input (used f.e as callback for the emoji picker)
     */
    const replaceSelectionWithText = useCallback(
        (text: string) => {
            // selection replacement should be debounced to avoid conflicts with text typing
            // (f.e. when emoji is being picked and 1 second still did not pass after user finished typing)
            updateComment(insertText(commentRef.current, selection, text), true);
        },
        [selection, updateComment],
    );

    const handleKeyPress = useCallback(
        (event: TextInputKeyPressEvent) => {
            const webEvent = event as unknown as KeyboardEvent;
            if (!webEvent || canSkipTriggerHotkeys(shouldUseNarrowLayout, isKeyboardShown)) {
                return;
            }

            if (suggestionsRef.current?.triggerHotkeyActions(webEvent)) {
                return;
            }

            // Submit the form when Enter is pressed
            if (webEvent.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey && !webEvent.shiftKey) {
                webEvent.preventDefault();
                onEnterKeyPress();
            }

            // Trigger the edit box for last sent message if ArrowUp is pressed and the comment is empty and Chronos is not in the participants
            const isEmptyComment = !valueRef.current || !!valueRef.current.match(CONST.REGEX.EMPTY_COMMENT);
            if (webEvent.key === CONST.KEYBOARD_SHORTCUTS.ARROW_UP.shortcutKey && selection.start <= 0 && isEmptyComment && !includeChronos) {
                webEvent.preventDefault();
                if (lastReportAction) {
                    const message = Array.isArray(lastReportAction?.message) ? (lastReportAction?.message?.at(-1) ?? null) : (lastReportAction?.message ?? null);
                    saveReportActionDraft(reportID, lastReportAction, Parser.htmlToMarkdown(message?.html ?? ''));
                }
            }
            // Flag emojis like "Wales" have several code points. Default backspace key action does not remove such flag emojis completely.
            // so we need to handle backspace key action differently with grapheme segmentation.
            if (webEvent.key === CONST.KEYBOARD_SHORTCUTS.BACKSPACE.shortcutKey) {
                if (selection.start === 0) {
                    return;
                }
                if (selection.start !== selection.end) {
                    return;
                }

                // Grapheme segmentation is same for English and Spanish.
                const splitter = new Intl.Segmenter(CONST.LOCALES.EN, {granularity: 'grapheme'});

                // Wales flag has 14 UTF-16 code units. This is the emoji with the largest number of UTF-16 code units we use.
                const start = Math.max(0, selection.start - 14);
                const graphemes = Array.from(splitter.segment(lastTextRef.current.substring(start, selection.start)));
                const lastGrapheme = graphemes.at(graphemes.length - 1);
                const lastGraphemeLength = lastGrapheme?.segment.length ?? 0;
                if (lastGraphemeLength > 1) {
                    event.preventDefault();
                    const newText = lastTextRef.current.slice(0, selection.start - lastGraphemeLength) + lastTextRef.current.slice(selection.start);
                    const newStart = selection.start - lastGraphemeLength;
                    const newEnd = selection.start - lastGraphemeLength;

                    setSelection((prevSelection) => ({
                        ...prevSelection,
                        start: newStart,
                        end: newEnd,
                    }));

                    setCurrentEditMessageSelection((prevSelection) => ({...prevSelection, start: newStart, end: newEnd}));

                    updateComment(newText, true);
                }
            }
        },
        [
            shouldUseNarrowLayout,
            isKeyboardShown,
            suggestionsRef,
            selection.start,
            selection.end,
            includeChronos,
            onEnterKeyPress,
            lastReportAction,
            reportID,
            updateComment,
            setCurrentEditMessageSelection,
        ],
    );

    /**
     * Once we cleared the input and the composer finished rendering, we need to reset the manual height value.
     * After that, the composer will adjust it's height based on it's parent flex layout.
     */
    const clearComposerHeight = useCallback(() => {
        if (composerHeightAfterClear == null) {
            return;
        }
        setComposerHeightAfterClear(null);
    }, [composerHeightAfterClear]);

    const onChangeText = useCallback(
        (commentValue: string) => {
            // When we clear the input, we set the composer height to a specific value.
            // Upon text change, we can reset the height to allow flex layout to adjust the height.
            clearComposerHeight();

            updateComment(commentValue, true);

            if (!syncSelectionWithOnChangeTextRef.current) {
                return;
            }

            const positionSnapshot = syncSelectionWithOnChangeTextRef.current.position;
            syncSelectionWithOnChangeTextRef.current = null;
            updateSelectionImperatively(positionSnapshot, positionSnapshot);
        },
        [clearComposerHeight, updateComment, updateSelectionImperatively],
    );

    const onSelectionChange = useCallback(
        (e: CustomSelectionChangeEvent) => {
            const newSelection = {...e.nativeEvent.selection};
            setSelection(newSelection);
            setCurrentEditMessageSelection((prevSelection) => ({
                ...prevSelection,
                ...newSelection,
            }));

            if (!composerRef.current?.isFocused()) {
                return;
            }
            suggestionsRef.current?.onSelectionChange?.(e);
        },
        [setCurrentEditMessageSelection, suggestionsRef],
    );

    const hideSuggestionMenu = useCallback(
        (e: TextInputScrollEvent) => {
            mobileInputScrollPosition.current = e?.nativeEvent?.contentOffset?.y ?? 0;
            if (!suggestionsRef.current || isScrollLikelyLayoutTriggered.current) {
                return;
            }
            suggestionsRef.current.updateShouldShowSuggestionMenuToFalse(false);
        },
        [suggestionsRef, isScrollLikelyLayoutTriggered],
    );

    const setShouldBlockSuggestionCalcToFalse = useCallback(() => {
        if (!suggestionsRef.current) {
            return false;
        }
        inputFocusChange(false);
        return suggestionsRef.current.setShouldBlockSuggestionCalc(false);
    }, [suggestionsRef]);

    /**
     * Focus the composer text input
     * @param [shouldDelay=false] Impose delay before focusing the composer
     */
    const focus = useCallback((shouldDelay = false) => {
        // If we're stacked above another RHP, wait for the transition to complete before focusing.
        const delay = shouldDelayAutoFocusRef.current ? CONST.ANIMATED_TRANSITION : CONST.COMPOSER_FOCUS_DELAY;
        focusComposerWithDelay(composerRef.current, delay)(shouldDelay);
    }, []);

    /**
     * In the stacked-RHP SearchReport case we disable the TextInput's immediate `autoFocus` to avoid jank.
     * Make sure we still trigger a (delayed) manual focus on first render for that route.
     */
    useEffect(() => {
        if (!shouldDelayAutoFocus) {
            delayedAutoFocusRouteKeyRef.current = null;
            return;
        }

        if (!shouldAutoFocus) {
            return;
        }

        // Only attempt once per route key to avoid repeated focusing during state updates.
        if (delayedAutoFocusRouteKeyRef.current === route.key) {
            return;
        }
        delayedAutoFocusRouteKeyRef.current = route.key;

        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const task = InteractionManager.runAfterInteractions(() => {
            focus(true);
        });

        return () => {
            task?.cancel?.();
        };
    }, [focus, route.key, shouldAutoFocus, shouldDelayAutoFocus]);

    /**
     * Set focus callback
     * @param shouldTakeOverFocus - Whether this composer should gain focus priority
     */
    const setUpComposeFocusManager = useCallback(
        (shouldTakeOverFocus = false) => {
            ReportActionComposeFocusManager.onComposerFocus((shouldFocusForNonBlurInputOnTapOutside = false) => {
                if ((!willBlurTextInputOnTapOutside && !shouldFocusForNonBlurInputOnTapOutside) || !isFocused || !isSidePanelHiddenOrLargeScreen) {
                    return;
                }

                focus(true);
            }, shouldTakeOverFocus);
        },
        [focus, isFocused, isSidePanelHiddenOrLargeScreen],
    );

    /**
     * Check if the composer is visible. Returns true if the composer is not covered up by emoji picker or menu. False otherwise.
     * @returns {Boolean}
     */
    const checkComposerVisibility = useCallback(() => {
        // Checking whether the screen is focused or not, helps avoid `modal.isVisible` false when popups are closed, even if the modal is opened.
        const isComposerCoveredUp = !isFocused || isEmojiPickerVisible() || isMenuVisible || !!modal?.isVisible || modal?.willAlertModalBecomeVisible;
        return !isComposerCoveredUp;
    }, [isMenuVisible, modal?.isVisible, modal?.willAlertModalBecomeVisible, isFocused]);

    const focusComposerOnKeyPress = useCallback(
        (e: KeyboardEvent) => {
            const isComposerVisible = checkComposerVisibility();
            if (!isComposerVisible) {
                return;
            }

            // Do not focus the composer if the Side Panel is visible
            if (!isSidePanelHiddenOrLargeScreen) {
                return;
            }

            if (!shouldAutoFocusOnKeyPress(e)) {
                return;
            }

            // if we're typing on another input/text area, do not focus
            if (([CONST.ELEMENT_NAME.INPUT, CONST.ELEMENT_NAME.TEXTAREA] as string[]).includes((e.target as Element | null)?.nodeName ?? '')) {
                return;
            }

            focus();
        },
        [checkComposerVisibility, focus, isSidePanelHiddenOrLargeScreen],
    );

    const clearWorklet = useCallback(() => {
        'worklet';

        forceClearInput(animatedRef);
    }, [animatedRef]);

    const resetHeight = useCallback(() => {
        if (!emptyComposerHeightRef.current) {
            return;
        }
        setComposerHeightAfterClear(emptyComposerHeightRef.current);
    }, []);

    const getCurrentText = useCallback(() => {
        return commentRef.current;
    }, []);

    useEffect(() => {
        const unsubscribeNavigationBlur = navigation.addListener('blur', () => removeKeyDownPressListener(focusComposerOnKeyPress));
        const unsubscribeNavigationFocus = navigation.addListener('focus', () => {
            addKeyDownPressListener(focusComposerOnKeyPress);
            // The report isn't unmounted and can be focused again after going back from another report so we should update the composerRef again
            ReportActionComposeFocusManager.composerRef.current = composerRef.current;
            setUpComposeFocusManager();
        });
        addKeyDownPressListener(focusComposerOnKeyPress);

        setUpComposeFocusManager();

        return () => {
            ReportActionComposeFocusManager.clear();

            removeKeyDownPressListener(focusComposerOnKeyPress);
            unsubscribeNavigationBlur();
            unsubscribeNavigationFocus();
        };
    }, [focusComposerOnKeyPress, navigation, setUpComposeFocusManager, isSidePanelHiddenOrLargeScreen]);

    const prevIsModalVisible = usePrevious(modal?.isVisible);
    const prevIsFocused = usePrevious(isFocused);

    useEffect(() => {
        const isModalVisible = modal?.isVisible;
        if (isModalVisible && !prevIsModalVisible) {
            // eslint-disable-next-line no-param-reassign
            isNextModalWillOpenRef.current = false;
        }

        // We want to blur the input immediately when a screen is out of focus.
        if (!isFocused) {
            composerRef.current?.blur();
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
            inputFocusChange(false);
            return;
        }
        focus(true);
    }, [focus, prevIsFocused, editFocused, prevIsModalVisible, isFocused, modal?.isVisible, isNextModalWillOpenRef, shouldAutoFocus, isSidePanelHiddenOrLargeScreen]);

    useEffect(() => {
        // Scrolls the composer to the bottom and sets the selection to the end, so that longer drafts are easier to edit
        updateMultilineInputRange(composerRef.current, !!shouldAutoFocus);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useImperativeHandle(
        ref,
        () =>
            new Proxy(
                {},
                {
                    get: (_target, prop) => {
                        if (prop === 'focus') {
                            return focus;
                        }
                        if (prop === 'replaceSelectionWithText') {
                            return replaceSelectionWithText;
                        }
                        if (prop === 'getCurrentText') {
                            return getCurrentText;
                        }
                        if (prop === 'clearWorklet') {
                            return clearWorklet;
                        }
                        if (prop === 'resetHeight') {
                            return resetHeight;
                        }

                        return composerRef.current?.[prop as keyof ComposerRef];
                    },
                },
            ) as ComposerWithSuggestionsRef,
    );

    useEffect(() => {
        onValueChange(value);
    }, [onValueChange, value]);

    const onClear = useCallback(
        (text: string) => {
            mobileInputScrollPosition.current = 0;
            // Note: use the value when the clear happened, not the current value which might have changed already
            onClearProp(text);
            updateComment('', true);
        },
        [onClearProp, updateComment],
    );

    useEffect(() => {
        // We use the tag to store the native ID of the text input. Later, we use it in onSelectionChange to pick up the proper text input data.
        tag.set(findNodeHandle(composerRef.current) ?? -1);
    }, [tag]);

    useFocusedInputHandler(
        {
            onSelectionChange: (event) => {
                'worklet';

                if (event.target === tag.get()) {
                    cursorPositionValue.set({
                        x: event.selection.end.x,
                        y: event.selection.end.y,
                    });
                }
            },
        },
        [],
    );
    const measureParentContainerAndReportCursor = useCallback(
        (callback: MeasureParentContainerAndCursorCallback) => {
            const {scrollValue} = getScrollPosition({mobileInputScrollPosition, textInputRef: composerRef});
            const {x: xPosition, y: yPosition} = getCursorPosition({positionOnMobile: cursorPositionValue.get(), positionOnWeb: selection});
            measureParentContainer((x, y, width, height) => {
                callback({
                    x,
                    y,
                    width,
                    height,
                    scrollValue,
                    cursorCoordinates: {x: xPosition, y: yPosition},
                });
            });
        },
        [measureParentContainer, cursorPositionValue, selection],
    );

    const isTouchEndedRef = useRef(false);
    const containerComposeStyles = StyleSheet.flatten(StyleUtils.getContainerComposeStyles());

    const handleContentSizeChange = useCallback(
        (e: TextInputContentSizeChangeEvent) => {
            const paddingTopAndBottom = (containerComposeStyles.paddingVertical as number) * 2;
            const inputHeight = e.nativeEvent.contentSize.height;
            const totalHeight = inputHeight + paddingTopAndBottom;

            // When we clear the input, we set the composer height to a specific value.
            // Upon any content size change, we can reset the height to allow flex layout to adjust the height.
            clearComposerHeight();

            // Store the default collapsed composer height, so we can later reset the height when we clear the input.
            if (emptyComposerHeightRef.current === null && inputHeight > 0 && !valueRef.current.includes('\n')) {
                emptyComposerHeightRef.current = inputHeight;
            }

            const isFullComposerAvailable = totalHeight >= CONST.COMPOSER.FULL_COMPOSER_MIN_HEIGHT;
            setIsFullComposerAvailable?.(isFullComposerAvailable);
        },
        [containerComposeStyles.paddingVertical, clearComposerHeight, setIsFullComposerAvailable],
    );

    const handleFocus = useCallback(() => {
        // The last composer that had focus should re-gain focus
        setUpComposeFocusManager(true);
        onFocus();
    }, [onFocus, setUpComposeFocusManager]);

    // When using the suggestions box (Suggestions) we need to imperatively
    // set the cursor to the end of the suggestion/mention after it's selected.
    const onSuggestionSelected = useCallback(
        (suggestionSelection: TextSelection) => {
            const endOfSuggestionSelection = suggestionSelection.end;
            setSelection(suggestionSelection);
            setCurrentEditMessageSelection((prevSelection) => ({
                ...prevSelection,
                start: suggestionSelection.start,
                end: suggestionSelection.end,
            }));

            if (endOfSuggestionSelection === undefined) {
                return;
            }

            queueMicrotask(() => {
                composerRef.current?.setSelection?.(endOfSuggestionSelection, endOfSuggestionSelection);
            });
        },
        [setCurrentEditMessageSelection],
    );

    return (
        <>
            <View
                style={[containerComposeStyles, styles.textInputComposeBorder]}
                onTouchEndCapture={() => {
                    isTouchEndedRef.current = true;
                }}
            >
                <Composer
                    checkComposerVisibility={checkComposerVisibility}
                    // In the stacked-RHP SearchReport case, we delay focus to avoid animation/layout jank.
                    // So we must also prevent the TextInput's immediate `autoFocus` and rely on our delayed manual focus instead.
                    autoFocus={!!shouldAutoFocus && !shouldDelayAutoFocus}
                    multiline
                    ref={setComposerRef}
                    placeholder={inputPlaceholder}
                    placeholderTextColor={theme.placeholderText}
                    onChangeText={onChangeText}
                    onKeyPress={handleKeyPress}
                    textAlignVertical="top"
                    style={[
                        styles.textInputCompose,
                        isComposerFullSize ? styles.textInputFullCompose : styles.textInputCollapseCompose,
                        composerHeightAfterClear != null && {height: composerHeightAfterClear},
                    ]}
                    maxLines={maxComposerLines}
                    onFocus={handleFocus}
                    onBlur={onBlur}
                    onClick={setShouldBlockSuggestionCalcToFalse}
                    onPasteFile={(files) => {
                        composerRef.current?.blur();
                        onPasteFile(files);
                    }}
                    onClear={onClear}
                    isDisabled={disabled}
                    selection={selection}
                    onSelectionChange={onSelectionChange}
                    isComposerFullSize={isComposerFullSize}
                    onContentSizeChange={handleContentSizeChange}
                    value={value}
                    testID={CONST.COMPOSER.NATIVE_ID}
                    shouldCalculateCaretPosition
                    onLayout={onLayout}
                    onScroll={hideSuggestionMenu}
                    shouldContainScroll={isMobileSafari()}
                    isGroupPolicyReport={isGroupPolicyReport}
                    forwardedFSClass={forwardedFSClass}
                />
            </View>

            <Suggestions
                ref={suggestionsRef}
                isComposerFocused={composerRef.current?.isFocused()}
                updateComment={updateComment}
                measureParentContainerAndReportCursor={measureParentContainerAndReportCursor}
                isGroupPolicyReport={isGroupPolicyReport}
                policyID={policyID}
                // Input
                value={value}
                selection={selection}
                setSelection={onSuggestionSelected}
                resetKeyboardInput={resetKeyboardInput}
            />

            {isValidReportIDFromPath(reportID) && !shouldUseNarrowLayout && (
                <SilentCommentUpdater
                    reportID={reportID}
                    value={value}
                    updateComment={updateComment}
                    commentRef={commentRef}
                    isCommentPendingSaved={isCommentPendingSaved}
                    isTransitioningToPreExistingReport={isTransitioningToPreExistingReport}
                    onTransitionToPreExistingReportComplete={handleTransitionToPreExistingReportComplete}
                />
            )}

            {/* Only used for testing so far */}
            {children}
        </>
    );
}

export default memo(ComposerWithSuggestions);

export type {ComposerWithSuggestionsProps, ComposerWithSuggestionsRef};
