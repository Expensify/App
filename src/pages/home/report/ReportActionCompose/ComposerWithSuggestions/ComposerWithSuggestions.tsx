import {useIsFocused, useNavigation} from '@react-navigation/native';
import lodashDebounce from 'lodash/debounce';
import type {ForwardedRef, MutableRefObject, RefAttributes, RefObject} from 'react';
import React, {forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import type {
    LayoutChangeEvent,
    MeasureInWindowOnSuccessCallback,
    NativeSyntheticEvent,
    TextInput,
    TextInputFocusEventData,
    TextInputKeyPressEventData,
    TextInputScrollEventData,
} from 'react-native';
import {DeviceEventEmitter, findNodeHandle, InteractionManager, NativeModules, View} from 'react-native';
import {useFocusedInputHandler} from 'react-native-keyboard-controller';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import {useAnimatedRef, useSharedValue} from 'react-native-reanimated';
import type {Emoji} from '@assets/emojis/types';
import type {FileObject} from '@components/AttachmentModal';
import type {MeasureParentContainerAndCursorCallback} from '@components/AutoCompleteSuggestions/types';
import Composer from '@components/Composer';
import type {CustomSelectionChangeEvent, TextSelection} from '@components/Composer/types';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Browser from '@libs/Browser';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import {forceClearInput} from '@libs/ComponentUtils';
import * as ComposerUtils from '@libs/ComposerUtils';
import convertToLTRForComposer from '@libs/convertToLTRForComposer';
import {getDraftComment} from '@libs/DraftCommentUtils';
import * as EmojiUtils from '@libs/EmojiUtils';
import focusComposerWithDelay from '@libs/focusComposerWithDelay';
import getPlatform from '@libs/getPlatform';
import * as KeyDownListener from '@libs/KeyboardShortcut/KeyDownPressListener';
import Parser from '@libs/Parser';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import updateMultilineInputRange from '@libs/updateMultilineInputRange';
import willBlurTextInputOnTapOutsideFunc from '@libs/willBlurTextInputOnTapOutside';
import getCursorPosition from '@pages/home/report/ReportActionCompose/getCursorPosition';
import getScrollPosition from '@pages/home/report/ReportActionCompose/getScrollPosition';
import type {ComposerRef, SuggestionsRef} from '@pages/home/report/ReportActionCompose/ReportActionCompose';
import SilentCommentUpdater from '@pages/home/report/ReportActionCompose/SilentCommentUpdater';
import Suggestions from '@pages/home/report/ReportActionCompose/Suggestions';
import * as EmojiPickerActions from '@userActions/EmojiPickerAction';
import * as InputFocus from '@userActions/InputFocus';
import * as Modal from '@userActions/Modal';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type SyncSelection = {
    position: number;
    value: string;
};

type NewlyAddedChars = {startIndex: number; endIndex: number; diff: string};

type ComposerWithSuggestionsOnyxProps = {
    /** The parent report actions for the report */
    parentReportActions: OnyxEntry<OnyxTypes.ReportActions>;

    /** The modal state */
    modal: OnyxEntry<OnyxTypes.Modal>;

    /** The preferred skin tone of the user */
    preferredSkinTone: number;

    /** Whether the input is focused */
    editFocused: OnyxEntry<boolean>;
};

type ComposerWithSuggestionsProps = ComposerWithSuggestionsOnyxProps &
    Partial<ChildrenProps> & {
        /** Report ID */
        reportID: string;

        /** Callback to focus composer */
        onFocus: () => void;

        /** Callback to blur composer */
        onBlur: (event: NativeSyntheticEvent<TextInputFocusEventData>) => void;

        /** Callback when layout of composer changes */
        onLayout?: (event: LayoutChangeEvent) => void;

        /** Callback to update the value of the composer */
        onValueChange: (value: string) => void;

        /** Callback when the composer got cleared on the UI thread */
        onCleared?: (text: string) => void;

        /** Whether the composer is full size */
        isComposerFullSize: boolean;

        /** Whether the menu is visible */
        isMenuVisible: boolean;

        /** The placeholder for the input */
        inputPlaceholder: string;

        /** Function to display a file in a modal */
        displayFileInModal: (file: FileObject) => void;

        /** Whether the user is blocked from concierge */
        isBlockedFromConcierge: boolean;

        /** Whether the input is disabled */
        disabled: boolean;

        /** Whether the full composer is available */
        isFullComposerAvailable: boolean;

        /** Function to set whether the full composer is available */
        setIsFullComposerAvailable: (isFullComposerAvailable: boolean) => void;

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
        suggestionsRef: React.RefObject<SuggestionsRef>;

        /** The ref to the next modal will open */
        isNextModalWillOpenRef: MutableRefObject<boolean | null>;

        /** Whether the edit is focused */
        editFocused: boolean;

        /** Wheater chat is empty */
        isEmptyChat?: boolean;

        /** The last report action */
        lastReportAction?: OnyxEntry<OnyxTypes.ReportAction>;

        /** Whether to include chronos */
        includeChronos?: boolean;

        /** The parent report action ID */
        parentReportActionID?: string;

        /** The parent report ID */
        // eslint-disable-next-line react/no-unused-prop-types -- its used in the withOnyx HOC
        parentReportID: string | undefined;

        /** Whether report is from group policy */
        isGroupPolicyReport: boolean;

        /** policy ID of the report */
        policyID: string;
    };

type SwitchToCurrentReportProps = {
    preexistingReportID: string;
    callback: () => void;
};

const {RNTextInputReset} = NativeModules;

const isIOSNative = getPlatform() === CONST.PLATFORM.IOS;

/**
 * Broadcast that the user is typing. Debounced to limit how often we publish client events.
 */
const debouncedBroadcastUserIsTyping = lodashDebounce(
    (reportID: string) => {
        Report.broadcastUserIsTyping(reportID);
    },
    1000,
    {
        maxWait: 1000,
        leading: true,
    },
);

const willBlurTextInputOnTapOutside = willBlurTextInputOnTapOutsideFunc();

// We want consistent auto focus behavior on input between native and mWeb so we have some auto focus management code that will
// prevent auto focus on existing chat for mobile device
const shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();

/**
 * This component holds the value and selection state.
 * If a component really needs access to these state values it should be put here.
 * However, double check if the component really needs access, as it will re-render
 * on every key press.
 */
function ComposerWithSuggestions(
    {
        // Onyx
        modal,
        preferredSkinTone = CONST.EMOJI_DEFAULT_SKIN_TONE,
        parentReportActions,

        // Props: Report
        reportID,
        includeChronos,
        isEmptyChat,
        lastReportAction,
        parentReportActionID,
        isGroupPolicyReport,
        policyID,

        // Focus
        onFocus,
        onBlur,
        onValueChange,

        // Composer
        isComposerFullSize,
        isMenuVisible,
        inputPlaceholder,
        displayFileInModal,
        isBlockedFromConcierge,
        disabled,
        isFullComposerAvailable,
        setIsFullComposerAvailable,
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
        editFocused,

        // For testing
        children,
    }: ComposerWithSuggestionsProps,
    ref: ForwardedRef<ComposerRef>,
) {
    const {isKeyboardShown} = useKeyboardState();
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {preferredLocale} = useLocalize();
    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const emojisPresentBefore = useRef<Emoji[]>([]);
    const mobileInputScrollPosition = useRef(0);
    const cursorPositionValue = useSharedValue({x: 0, y: 0});
    const tag = useSharedValue(-1);
    const draftComment = getDraftComment(reportID) ?? '';
    const [value, setValue] = useState(() => {
        if (draftComment) {
            emojisPresentBefore.current = EmojiUtils.extractEmojis(draftComment);
        }
        return draftComment;
    });
    const commentRef = useRef(value);

    const lastTextRef = useRef(value);
    useEffect(() => {
        lastTextRef.current = value;
    }, [value]);

    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const maxComposerLines = shouldUseNarrowLayout ? CONST.COMPOSER.MAX_LINES_SMALL_SCREEN : CONST.COMPOSER.MAX_LINES;

    const parentReportAction = parentReportActions?.[parentReportActionID ?? '-1'];
    const shouldAutoFocus =
        !modal?.isVisible &&
        Modal.areAllModalsHidden() &&
        isFocused &&
        (shouldFocusInputOnScreenFocus || (isEmptyChat && !ReportActionsUtils.isTransactionThread(parentReportAction))) &&
        shouldShowComposeInput;

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
        RNTextInputReset.resetKeyboardInput(findNodeHandle(textInputRef.current));
    }, [textInputRef]);

    const debouncedSaveReportComment = useMemo(
        () =>
            lodashDebounce((selectedReportID: string, newComment: string | null) => {
                Report.saveReportDraftComment(selectedReportID, newComment);
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
            Report.saveReportDraftComment(preexistingReportID, commentRef.current, callback);
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
                const commonSuffixLength = ComposerUtils.findCommonSuffixLength(prevText, newText, selection?.end ?? 0);
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
            const {startIndex, endIndex, diff} = findNewlyAddedChars(lastTextRef.current, commentValue);
            const isEmojiInserted = diff.length && endIndex > startIndex && diff.trim() === diff && EmojiUtils.containsOnlyEmojis(diff);
            const commentWithSpaceInserted = isEmojiInserted ? ComposerUtils.insertWhiteSpaceAtIndex(commentValue, endIndex) : commentValue;
            const {text: newComment, emojis, cursorPosition} = EmojiUtils.replaceAndExtractEmojis(commentWithSpaceInserted, preferredSkinTone, preferredLocale);
            if (emojis.length) {
                const newEmojis = EmojiUtils.getAddedEmojis(emojis, emojisPresentBefore.current);
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
                const position = Math.max((selection.end ?? 0) + (newComment.length - commentRef.current.length), cursorPosition ?? 0);

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
                Report.saveReportDraftComment(reportID, newCommentConverted);
            }
            if (newCommentConverted) {
                debouncedBroadcastUserIsTyping(reportID);
            }
        },
        [findNewlyAddedChars, preferredLocale, preferredSkinTone, reportID, setIsCommentEmpty, suggestionsRef, raiseIsScrollLikelyLayoutTriggered, debouncedSaveReportComment, selection.end],
    );

    /**
     * Callback to add whatever text is chosen into the main input (used f.e as callback for the emoji picker)
     */
    const replaceSelectionWithText = useCallback(
        (text: string) => {
            // selection replacement should be debounced to avoid conflicts with text typing
            // (f.e. when emoji is being picked and 1 second still did not pass after user finished typing)
            updateComment(ComposerUtils.insertText(commentRef.current, selection, text), true);
        },
        [selection, updateComment],
    );

    const triggerHotkeyActions = useCallback(
        (event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
            const webEvent = event as unknown as KeyboardEvent;
            if (!webEvent || ComposerUtils.canSkipTriggerHotkeys(shouldUseNarrowLayout, isKeyboardShown)) {
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
            const valueLength = valueRef.current.length;
            if (
                'key' in event &&
                event.key === CONST.KEYBOARD_SHORTCUTS.ARROW_UP.shortcutKey &&
                textInputRef.current &&
                'selectionStart' in textInputRef.current &&
                textInputRef.current?.selectionStart === 0 &&
                valueLength === 0 &&
                !includeChronos
            ) {
                event.preventDefault();
                if (lastReportAction) {
                    const message = Array.isArray(lastReportAction?.message) ? lastReportAction?.message?.at(-1) ?? null : lastReportAction?.message ?? null;
                    Report.saveReportActionDraft(reportID, lastReportAction, Parser.htmlToMarkdown(message?.html ?? ''));
                }
            }
        },
        [shouldUseNarrowLayout, isKeyboardShown, suggestionsRef, includeChronos, handleSendMessage, lastReportAction, reportID],
    );

    const onChangeText = useCallback(
        (commentValue: string) => {
            updateComment(commentValue, true);

            if (isIOSNative && syncSelectionWithOnChangeTextRef.current) {
                const positionSnapshot = syncSelectionWithOnChangeTextRef.current.position;
                syncSelectionWithOnChangeTextRef.current = null;

                // ensure that selection is set imperatively after all state changes are effective
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
            if (!textInputRef.current?.isFocused()) {
                return;
            }
            suggestionsRef.current?.onSelectionChange?.(e);

            setSelection(e.nativeEvent.selection);
        },
        [suggestionsRef],
    );

    const hideSuggestionMenu = useCallback(
        (e: NativeSyntheticEvent<TextInputScrollEventData>) => {
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
        InputFocus.inputFocusChange(false);
        return suggestionsRef.current.setShouldBlockSuggestionCalc(false);
    }, [suggestionsRef]);

    /**
     * Focus the composer text input
     * @param [shouldDelay=false] Impose delay before focusing the composer
     */
    const focus = useCallback((shouldDelay = false) => {
        focusComposerWithDelay(textInputRef.current)(shouldDelay);
    }, []);

    const setUpComposeFocusManager = useCallback(() => {
        // This callback is used in the contextMenuActions to manage giving focus back to the compose input.
        ReportActionComposeFocusManager.onComposerFocus((shouldFocusForNonBlurInputOnTapOutside = false) => {
            if ((!willBlurTextInputOnTapOutside && !shouldFocusForNonBlurInputOnTapOutside) || !isFocused) {
                return;
            }

            focus(true);
        }, true);
    }, [focus, isFocused]);

    /**
     * Check if the composer is visible. Returns true if the composer is not covered up by emoji picker or menu. False otherwise.
     * @returns {Boolean}
     */
    const checkComposerVisibility = useCallback(() => {
        // Checking whether the screen is focused or not, helps avoid `modal.isVisible` false when popups are closed, even if the modal is opened.
        const isComposerCoveredUp = !isFocused || EmojiPickerActions.isEmojiPickerVisible() || isMenuVisible || !!modal?.isVisible || modal?.willAlertModalBecomeVisible;
        return !isComposerCoveredUp;
    }, [isMenuVisible, modal, isFocused]);

    const focusComposerOnKeyPress = useCallback(
        (e: KeyboardEvent) => {
            const isComposerVisible = checkComposerVisibility();
            if (!isComposerVisible) {
                return;
            }

            if (!ReportUtils.shouldAutoFocusOnKeyPress(e)) {
                return;
            }

            // if we're typing on another input/text area, do not focus
            if (['INPUT', 'TEXTAREA'].includes((e.target as Element | null)?.nodeName ?? '')) {
                return;
            }

            focus();
        },
        [checkComposerVisibility, focus],
    );

    const blur = useCallback(() => {
        if (!textInputRef.current) {
            return;
        }
        textInputRef.current.blur();
    }, []);

    const clear = useCallback(() => {
        'worklet';

        forceClearInput(animatedRef, textInputRef);
    }, [animatedRef]);

    const getCurrentText = useCallback(() => {
        return commentRef.current;
    }, []);

    useEffect(() => {
        const unsubscribeNavigationBlur = navigation.addListener('blur', () => KeyDownListener.removeKeyDownPressListener(focusComposerOnKeyPress));
        const unsubscribeNavigationFocus = navigation.addListener('focus', () => {
            KeyDownListener.addKeyDownPressListener(focusComposerOnKeyPress);
            // The report isn't unmounted and can be focused again after going back from another report so we should update the composerRef again
            ReportActionComposeFocusManager.composerRef.current = textInputRef.current;
            setUpComposeFocusManager();
        });
        KeyDownListener.addKeyDownPressListener(focusComposerOnKeyPress);

        setUpComposeFocusManager();

        return () => {
            ReportActionComposeFocusManager.clear(true);

            KeyDownListener.removeKeyDownPressListener(focusComposerOnKeyPress);
            unsubscribeNavigationBlur();
            unsubscribeNavigationFocus();
        };
    }, [focusComposerOnKeyPress, navigation, setUpComposeFocusManager]);

    const prevIsModalVisible = usePrevious(modal?.isVisible);
    const prevIsFocused = usePrevious(isFocused);
    useEffect(() => {
        if (modal?.isVisible && !prevIsModalVisible) {
            // eslint-disable-next-line react-compiler/react-compiler, no-param-reassign
            isNextModalWillOpenRef.current = false;
        }

        // We want to blur the input immediately when a screen is out of focus.
        if (!isFocused) {
            textInputRef.current?.blur();
        }

        // We want to focus or refocus the input when a modal has been closed or the underlying screen is refocused.
        // We avoid doing this on native platforms since the software keyboard popping
        // open creates a jarring and broken UX.
        if (!((willBlurTextInputOnTapOutside || shouldAutoFocus) && !isNextModalWillOpenRef.current && !modal?.isVisible && isFocused && (!!prevIsModalVisible || !prevIsFocused))) {
            return;
        }

        if (editFocused) {
            InputFocus.inputFocusChange(false);
            return;
        }
        focus(true);
    }, [focus, prevIsFocused, editFocused, prevIsModalVisible, isFocused, modal?.isVisible, isNextModalWillOpenRef, shouldAutoFocus]);

    useEffect(() => {
        // Scrolls the composer to the bottom and sets the selection to the end, so that longer drafts are easier to edit
        updateMultilineInputRange(textInputRef.current, !!shouldAutoFocus);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
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

        tag.value = findNodeHandle(textInputRef.current) ?? -1;
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    useFocusedInputHandler(
        {
            onSelectionChange: (event) => {
                'worklet';

                if (event.target === tag.value) {
                    cursorPositionValue.value = {
                        x: event.selection.end.x,
                        y: event.selection.end.y,
                    };
                }
            },
        },
        [],
    );
    const measureParentContainerAndReportCursor = useCallback(
        (callback: MeasureParentContainerAndCursorCallback) => {
            const {scrollValue} = getScrollPosition({mobileInputScrollPosition, textInputRef});
            const {x: xPosition, y: yPosition} = getCursorPosition({positionOnMobile: cursorPositionValue.value, positionOnWeb: selection});
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

    return (
        <>
            <View style={[StyleUtils.getContainerComposeStyles(), styles.textInputComposeBorder]}>
                <Composer
                    checkComposerVisibility={checkComposerVisibility}
                    autoFocus={!!shouldAutoFocus}
                    multiline
                    ref={setTextInputRef}
                    placeholder={inputPlaceholder}
                    placeholderTextColor={theme.placeholderText}
                    onChangeText={onChangeText}
                    onKeyPress={triggerHotkeyActions}
                    textAlignVertical="top"
                    style={[styles.textInputCompose, isComposerFullSize ? styles.textInputFullCompose : styles.textInputCollapseCompose]}
                    maxLines={maxComposerLines}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onClick={setShouldBlockSuggestionCalcToFalse}
                    onPasteFile={(file) => {
                        textInputRef.current?.blur();
                        displayFileInModal(file);
                    }}
                    onClear={onClear}
                    isDisabled={isBlockedFromConcierge || disabled}
                    isReportActionCompose
                    selection={selection}
                    onSelectionChange={onSelectionChange}
                    isFullComposerAvailable={isFullComposerAvailable}
                    setIsFullComposerAvailable={setIsFullComposerAvailable}
                    isComposerFullSize={isComposerFullSize}
                    value={value}
                    testID="composer"
                    shouldCalculateCaretPosition
                    onLayout={onLayout}
                    onScroll={hideSuggestionMenu}
                    shouldContainScroll={Browser.isMobileSafari()}
                    isGroupPolicyReport={isGroupPolicyReport}
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
                setSelection={setSelection}
                resetKeyboardInput={resetKeyboardInput}
            />

            {ReportUtils.isValidReportIDFromPath(reportID) && (
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

ComposerWithSuggestions.displayName = 'ComposerWithSuggestions';

const ComposerWithSuggestionsWithRef = forwardRef(ComposerWithSuggestions);

export default withOnyx<ComposerWithSuggestionsProps & RefAttributes<ComposerRef>, ComposerWithSuggestionsOnyxProps>({
    modal: {
        key: ONYXKEYS.MODAL,
    },
    preferredSkinTone: {
        key: ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
        selector: EmojiUtils.getPreferredSkinToneIndex,
    },
    editFocused: {
        key: ONYXKEYS.INPUT_FOCUSED,
    },
    parentReportActions: {
        key: ({parentReportID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
        canEvict: false,
        initWithStoredValues: false,
    },
})(memo(ComposerWithSuggestionsWithRef));

export type {ComposerWithSuggestionsProps};
