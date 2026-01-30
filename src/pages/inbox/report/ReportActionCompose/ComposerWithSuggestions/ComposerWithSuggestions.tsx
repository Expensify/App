import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import lodashDebounce from 'lodash/debounce';
import type {ForwardedRef, RefObject} from 'react';
import React, {memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import type {BlurEvent, LayoutChangeEvent, MeasureInWindowOnSuccessCallback, TextInput, TextInputContentSizeChangeEvent, TextInputKeyPressEvent, TextInputScrollEvent} from 'react-native';
import {DeviceEventEmitter, InteractionManager, NativeModules, StyleSheet, View} from 'react-native';
import {useFocusedInputHandler} from 'react-native-keyboard-controller';
import type {OnyxEntry} from 'react-native-onyx';
import {useAnimatedRef, useSharedValue} from 'react-native-reanimated';
import type {Emoji} from '@assets/emojis/types';
import type {MeasureParentContainerAndCursorCallback} from '@components/AutoCompleteSuggestions/types';
import Composer from '@components/Composer';
import type {CustomSelectionChangeEvent, TextSelection} from '@components/Composer/types';
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
import {containsOnlyEmojis, extractEmojis, getAddedEmojis, getZWNJCursorOffset, insertZWNJBetweenDigitAndEmoji, replaceAndExtractEmojis} from '@libs/EmojiUtils';
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
import getCursorPosition from '@pages/inbox/report/ReportActionCompose/getCursorPosition';
import getScrollPosition from '@pages/inbox/report/ReportActionCompose/getScrollPosition';
import type {SuggestionsRef} from '@pages/inbox/report/ReportActionCompose/ReportActionCompose';
import SilentCommentUpdater from '@pages/inbox/report/ReportActionCompose/SilentCommentUpdater';
import Suggestions from '@pages/inbox/report/ReportActionCompose/Suggestions';
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

type SyncSelection = {
    position: number;
    value: string;
};

type NewlyAddedChars = {startIndex: number; endIndex: number; diff: string};

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
        onCleared?: (text: string) => void;

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
        handleSendMessage: () => void;

        /** Whether the compose input should show */
        shouldShowComposeInput: OnyxEntry<boolean>;

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

        /** Whether the main composer was hidden */
        didHideComposerInput?: boolean;

        /** Reference to the outer element */
        ref?: ForwardedRef<ComposerRef>;
    };

type SwitchToCurrentReportProps = {
    preexistingReportID: string;
    callback: () => void;
};

type ComposerRef = {
    blur: () => void;
    focus: (shouldDelay?: boolean) => void;
    replaceSelectionWithText: OnEmojiSelected;
    getCurrentText: () => string;
    isFocused: () => boolean;
    /**
     * Calling clear will immediately clear the input on the UI thread (its a worklet).
     * Once the composer ahs cleared onCleared will be called with the value that was cleared.
     */
    clear: () => void;
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
    handleSendMessage,
    shouldShowComposeInput,
    measureParentContainer = () => {},
    isScrollLikelyLayoutTriggered,
    raiseIsScrollLikelyLayoutTriggered,
    onCleared = () => {},
    onLayout: onLayoutProps,

    // Refs
    suggestionsRef,
    isNextModalWillOpenRef,
    ref,

    // For testing
    children,
    didHideComposerInput,

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
    const [draftComment = ''] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`, {canBeMissing: true});
    const [value, setValue] = useState(() => {
        if (draftComment) {
            emojisPresentBefore.current = extractEmojis(draftComment);
        }
        return draftComment;
    });
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const commentRef = useRef(value);

    const {superWideRHPRouteKeys} = useWideRHPState();
    // Autofocus is disabled on SearchReport when another RHP is displayed below as it causes animation issues
    const shouldDisableAutoFocus = superWideRHPRouteKeys.length > 0 && route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT;

    const [modal] = useOnyx(ONYXKEYS.MODAL, {canBeMissing: true});
    const [preferredSkinTone = CONST.EMOJI_DEFAULT_SKIN_TONE] = useOnyx(ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE, {canBeMissing: true});
    const [editFocused] = useOnyx(ONYXKEYS.INPUT_FOCUSED, {canBeMissing: true});

    const lastTextRef = useRef(value);
    useEffect(() => {
        lastTextRef.current = value;
    }, [value]);

    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const maxComposerLines = shouldUseNarrowLayout ? CONST.COMPOSER.MAX_LINES_SMALL_SCREEN : CONST.COMPOSER.MAX_LINES;
    const shouldAutoFocus =
        (shouldFocusInputOnScreenFocus || !!draftComment) && shouldShowComposeInput && areAllModalsHidden() && isFocused && !didHideComposerInput && !shouldDisableAutoFocus;

    const valueRef = useRef(value);
    valueRef.current = value;

    const [selection, setSelection] = useState<TextSelection>(() => ({start: value.length, end: value.length, positionX: 0, positionY: 0}));

    const [composerHeight, setComposerHeight] = useState(0);

    const textInputRef = useRef<TextInput | null>(null);

    const syncSelectionWithOnChangeTextRef = useRef<SyncSelection | null>(null);

    // The ref to check whether the comment saving is in progress
    const isCommentPendingSaved = useRef(false);

    const animatedRef = useAnimatedRef();
    /**
     * Set the TextInput Ref
     */
    const setTextInputRef = useCallback(
        (el: TextInput) => {
            ReportActionComposeFocusManager.composerRef.current = el;
            textInputRef.current = el;
            if (typeof animatedRef === 'function') {
                animatedRef(el);
            }
        },
        [animatedRef],
    );

    const resetKeyboardInput = useCallback(() => {
        if (!RNTextInputReset) {
            return;
        }
        RNTextInputReset.resetKeyboardInput(CONST.COMPOSER.NATIVE_ID);
    }, []);

    const debouncedSaveReportComment = useMemo(
        () =>
            lodashDebounce((selectedReportID: string, newComment: string | null) => {
                saveReportDraftComment(selectedReportID, newComment);
                isCommentPendingSaved.current = false;
            }, 1000),
        [],
    );

    useEffect(() => {
        const switchToCurrentReport = DeviceEventEmitter.addListener(`switchToPreExistingReport_${reportID}`, ({preexistingReportID, callback}: SwitchToCurrentReportProps) => {
            if (!commentRef.current) {
                callback();
                return;
            }
            saveReportDraftComment(preexistingReportID, commentRef.current, callback);
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

            const newComment = insertZWNJBetweenDigitAndEmoji(emojiConvertedText);
            const zwnjOffset = getZWNJCursorOffset(emojiConvertedText, cursorPosition);

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
                const adjustedCursorPosition = cursorPosition !== undefined && cursorPosition !== null ? cursorPosition + zwnjOffset : undefined;
                const position = Math.max((selection.end ?? 0) + (newComment.length - commentRef.current.length), adjustedCursorPosition ?? 0);

                if (commentWithSpaceInserted !== newComment && isIOSNative) {
                    syncSelectionWithOnChangeTextRef.current = {position, value: newComment};
                }

                setSelection((prevSelection) => ({
                    start: position,
                    end: position,
                    positionX: prevSelection.positionX,
                    positionY: prevSelection.positionY,
                }));
            }

            commentRef.current = newCommentConverted;
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
            findNewlyAddedChars,
            preferredLocale,
            preferredSkinTone,
            reportID,
            setIsCommentEmpty,
            suggestionsRef,
            raiseIsScrollLikelyLayoutTriggered,
            debouncedSaveReportComment,
            selection?.end,
            selection?.start,
            currentUserAccountID,
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
                handleSendMessage();
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
                    setSelection((prevSelection) => ({
                        start: selection.start - lastGraphemeLength,
                        end: selection.start - lastGraphemeLength,
                        positionX: prevSelection.positionX,
                        positionY: prevSelection.positionY,
                    }));
                    updateComment(newText, true);
                }
            }
        },
        [shouldUseNarrowLayout, isKeyboardShown, suggestionsRef, selection.start, includeChronos, handleSendMessage, lastReportAction, reportID, updateComment, selection.end],
    );

    const onChangeText = useCallback(
        (commentValue: string) => {
            updateComment(commentValue, true);

            if (isIOSNative && syncSelectionWithOnChangeTextRef.current) {
                const positionSnapshot = syncSelectionWithOnChangeTextRef.current.position;
                syncSelectionWithOnChangeTextRef.current = null;

                // ensure that selection is set imperatively after all state changes are effective
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                InteractionManager.runAfterInteractions(() => {
                    // note: this implementation is only available on non-web RN, thus the wrapping
                    // 'if' block contains a redundant (since the ref is only used on iOS) platform check
                    textInputRef.current?.setSelection(positionSnapshot, positionSnapshot);
                });
            }
        },
        [updateComment],
    );

    const onSelectionChange = useCallback(
        (e: CustomSelectionChangeEvent) => {
            setSelection(e.nativeEvent.selection);

            if (!textInputRef.current?.isFocused()) {
                return;
            }
            suggestionsRef.current?.onSelectionChange?.(e);
        },
        [suggestionsRef],
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
        focusComposerWithDelay(textInputRef.current)(shouldDelay);
    }, []);

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

    const blur = useCallback(() => {
        if (!textInputRef.current) {
            return;
        }
        textInputRef.current.blur();
    }, []);

    const clear = useCallback(() => {
        'worklet';

        forceClearInput(animatedRef);
    }, [animatedRef]);

    const getCurrentText = useCallback(() => {
        return commentRef.current;
    }, []);

    useEffect(() => {
        const unsubscribeNavigationBlur = navigation.addListener('blur', () => removeKeyDownPressListener(focusComposerOnKeyPress));
        const unsubscribeNavigationFocus = navigation.addListener('focus', () => {
            addKeyDownPressListener(focusComposerOnKeyPress);
            // The report isn't unmounted and can be focused again after going back from another report so we should update the composerRef again
            ReportActionComposeFocusManager.composerRef.current = textInputRef.current;
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
            textInputRef.current?.blur();
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
        updateMultilineInputRange(textInputRef.current, !!shouldAutoFocus);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useImperativeHandle(
        ref,
        () => ({
            blur,
            focus,
            replaceSelectionWithText,
            isFocused: () => !!textInputRef.current?.isFocused(),
            clear,
            getCurrentText,
        }),
        [blur, clear, focus, replaceSelectionWithText, getCurrentText],
    );

    useEffect(() => {
        onValueChange(value);
    }, [onValueChange, value]);

    const onLayout = useCallback(
        (e: LayoutChangeEvent) => {
            onLayoutProps?.(e);
            const composerLayoutHeight = e.nativeEvent.layout.height;
            if (composerHeight === composerLayoutHeight) {
                return;
            }
            setComposerHeight(composerLayoutHeight);
        },
        [composerHeight, onLayoutProps],
    );

    const onClear = useCallback(
        (text: string) => {
            mobileInputScrollPosition.current = 0;
            // Note: use the value when the clear happened, not the current value which might have changed already
            onCleared(text);
            updateComment('', true);
        },
        [onCleared, updateComment],
    );

    useEffect(() => {
        // We use the tag to store the native ID of the text input. Later, we use it in onSelectionChange to pick up the proper text input data.
        tag.set(findNodeHandle(textInputRef.current) ?? -1);
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
            const {scrollValue} = getScrollPosition({mobileInputScrollPosition, textInputRef});
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

    const updateIsFullComposerAvailable = useCallback(
        (e: TextInputContentSizeChangeEvent) => {
            const paddingTopAndBottom = (containerComposeStyles.paddingVertical as number) * 2;
            const inputHeight = e.nativeEvent.contentSize.height;
            const totalHeight = inputHeight + paddingTopAndBottom;
            const isFullComposerAvailable = totalHeight >= CONST.COMPOSER.FULL_COMPOSER_MIN_HEIGHT;
            setIsFullComposerAvailable?.(isFullComposerAvailable);
        },
        [setIsFullComposerAvailable, containerComposeStyles],
    );

    const handleFocus = useCallback(() => {
        // The last composer that had focus should re-gain focus
        setUpComposeFocusManager(true);
        onFocus();
    }, [onFocus, setUpComposeFocusManager]);

    // When using the suggestions box (Suggestions) we need to imperatively
    // set the cursor to the end of the suggestion/mention after it's selected.
    const onSuggestionSelected = useCallback((suggestionSelection: TextSelection) => {
        const endOfSuggestionSelection = suggestionSelection.end;
        setSelection(suggestionSelection);

        if (endOfSuggestionSelection === undefined) {
            return;
        }

        queueMicrotask(() => {
            textInputRef.current?.setSelection?.(endOfSuggestionSelection, endOfSuggestionSelection);
        });
    }, []);

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
                    autoFocus={!!shouldAutoFocus}
                    multiline
                    ref={setTextInputRef}
                    placeholder={inputPlaceholder}
                    placeholderTextColor={theme.placeholderText}
                    onChangeText={onChangeText}
                    onKeyPress={handleKeyPress}
                    textAlignVertical="top"
                    style={[styles.textInputCompose, isComposerFullSize ? styles.textInputFullCompose : styles.textInputCollapseCompose]}
                    maxLines={maxComposerLines}
                    onFocus={handleFocus}
                    onBlur={onBlur}
                    onClick={setShouldBlockSuggestionCalcToFalse}
                    onPasteFile={(files) => {
                        textInputRef.current?.blur();
                        onPasteFile(files);
                    }}
                    onClear={onClear}
                    isDisabled={disabled}
                    selection={selection}
                    onSelectionChange={onSelectionChange}
                    isComposerFullSize={isComposerFullSize}
                    onContentSizeChange={updateIsFullComposerAvailable}
                    value={value}
                    testID="composer"
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
                isComposerFocused={textInputRef.current?.isFocused()}
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

            {isValidReportIDFromPath(reportID) && (
                <SilentCommentUpdater
                    reportID={reportID}
                    value={value}
                    updateComment={updateComment}
                    commentRef={commentRef}
                    isCommentPendingSaved={isCommentPendingSaved}
                />
            )}

            {/* Only used for testing so far */}
            {children}
        </>
    );
}

export default memo(ComposerWithSuggestions);

export type {ComposerWithSuggestionsProps, ComposerRef};
