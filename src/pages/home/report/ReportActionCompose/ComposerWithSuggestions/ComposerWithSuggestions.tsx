import {useIsFocused, useNavigation} from '@react-navigation/native';
import lodashDebounce from 'lodash/debounce';
import type {ForwardedRef, MutableRefObject, RefAttributes, RefObject} from 'react';
import React, {forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import type {
    LayoutChangeEvent,
    MeasureInWindowOnSuccessCallback,
    NativeSyntheticEvent,
    TextInput,
    TextInputChangeEventData,
    TextInputFocusEventData,
    TextInputKeyPressEventData,
    TextInputScrollEventData,
} from 'react-native';
import {DeviceEventEmitter, findNodeHandle, InteractionManager, NativeModules, View} from 'react-native';
import {useFocusedInputHandler} from 'react-native-keyboard-controller';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import {useSharedValue} from 'react-native-reanimated';
import type {useAnimatedRef} from 'react-native-reanimated';
import type {Emoji} from '@assets/emojis/types';
import type {FileObject} from '@components/AttachmentModal';
import type {MeasureParentContainerAndCursorCallback} from '@components/AutoCompleteSuggestions/types';
import Composer from '@components/Composer';
import type {CustomSelectionChangeEvent, TextSelection} from '@components/Composer/types';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as Browser from '@libs/Browser';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
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
import type {HandleComposerUpdateCallback} from './types';

type AnimatedRef = ReturnType<typeof useAnimatedRef>;

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

        /** Callback to update the value of the composer */
        onValueChange: (value: string) => void;

        /** Whether the composer is full size */
        isComposerFullSize: boolean;

        /** Whether the menu is visible */
        isMenuVisible: boolean;

        /** The placeholder for the input */
        inputPlaceholder: string;

        /** Function to display a file in a modal */
        displayFileInModal: (file: FileObject) => void;

        /** Whether the text input should clear */
        textInputShouldClear: boolean;

        /** Function to set the text input should clear */
        setTextInputShouldClear: (shouldClear: boolean) => void;

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

        /** The ref to the animated input */
        animatedRef: AnimatedRef;

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
        textInputShouldClear,
        setTextInputShouldClear,
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

        // Refs
        suggestionsRef,
        animatedRef,
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
    const [value, setValueInternal] = useState(() => {
        const draftComment = getDraftComment(reportID) ?? '';
        if (draftComment) {
            emojisPresentBefore.current = EmojiUtils.extractEmojis(draftComment);
        }
        return draftComment;
    });
    const valueRef = useRef(value);
    const setValue = useCallback((newValue: string) => {
        valueRef.current = newValue;
        setValueInternal(newValue);
    }, []);

    const {isSmallScreenWidth} = useWindowDimensions();
    const maxComposerLines = isSmallScreenWidth ? CONST.COMPOSER.MAX_LINES_SMALL_SCREEN : CONST.COMPOSER.MAX_LINES;

    const parentReportAction = parentReportActions?.[parentReportActionID ?? '-1'];
    const shouldAutoFocus =
        !modal?.isVisible &&
        Modal.areAllModalsHidden() &&
        isFocused &&
        (shouldFocusInputOnScreenFocus || (isEmptyChat && !ReportActionsUtils.isTransactionThread(parentReportAction))) &&
        shouldShowComposeInput;

    const [selection, setSelection] = useState<TextSelection>(() => ({start: 0, end: 0, positionX: 0, positionY: 0}));

    const [composerHeight, setComposerHeight] = useState(0);

    const textInputRef = useRef<TextInput | null>(null);

    // The ref to check whether the comment saving is in progress
    const isCommentPendingSaved = useRef(false);

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
            if (!valueRef.current) {
                callback();
                return;
            }
            Report.saveReportDraftComment(preexistingReportID, valueRef.current, callback);
        });

        return () => {
            switchToCurrentReport.remove();
        };
    }, [reportID]);

    useEffect(() => {
        const isCommentEmpty = !!value.match(/^(\s)*$/);
        setIsCommentEmpty(isCommentEmpty);
    }, [setIsCommentEmpty, value]);

    const prepareCommentAndResetComposer = useCallback((): string => {
        const trimmedComment = valueRef.current.trim();
        const commentLength = ReportUtils.getCommentLength(trimmedComment, {reportID});

        // Don't submit empty comments or comments that exceed the character limit
        if (!commentLength || commentLength > CONST.MAX_COMMENT_LENGTH) {
            return '';
        }

        // Since we're submitting the form here which should clear the composer
        // We don't really care about saving the draft the user was typing
        // We need to make sure an empty draft gets saved instead
        debouncedSaveReportComment.cancel();
        isCommentPendingSaved.current = false;

        setSelection({start: 0, end: 0, positionX: 0, positionY: 0});
        setValue('');
        setTextInputShouldClear(true);
        if (isComposerFullSize) {
            Report.setIsComposerFullSize(reportID, false);
        }
        setIsFullComposerAvailable(false);
        Report.saveReportDraftComment(reportID, '');

        return trimmedComment;
    }, [reportID, debouncedSaveReportComment, setValue, setTextInputShouldClear, isComposerFullSize, setIsFullComposerAvailable]);

    const triggerHotkeyActions = useCallback(
        (event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
            const webEvent = event as unknown as KeyboardEvent;
            if (!webEvent || ComposerUtils.canSkipTriggerHotkeys(isSmallScreenWidth, isKeyboardShown)) {
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
        [isSmallScreenWidth, isKeyboardShown, suggestionsRef, includeChronos, handleSendMessage, lastReportAction, reportID],
    );

    /**
     * Composer updates are partial text updates. Meaning if a event occurs (such as inserting an emoji, or the user pressing a character on their keyboard),
     * we only append/insert the text that has changed. This is to avoid descynchronization issues where text updates are coming from another thread (RN), see issue #37896.
     */
    const handleComposerUpdate: HandleComposerUpdateCallback = useCallback(
        ({fullNewText, diffText, endPositionOfNewAddedText, shouldDebounceSaveComment}) => {
            raiseIsScrollLikelyLayoutTriggered();
            // Check for emojis:
            // - Either add a whitespace if the user typed an emoji
            // - Or insert an emoji when the user types :emojiCode:
            // - Extract all emojis from the updated text and update the frequently used emojis
            const isEmojiInserted = diffText.trim() === diffText && EmojiUtils.containsOnlyEmojis(diffText);
            const commentWithSpaceInserted = isEmojiInserted ? ComposerUtils.insertWhiteSpaceAtIndex(fullNewText, endPositionOfNewAddedText) : fullNewText;
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
            emojisPresentBefore.current = emojis;

            // Make LTR compatible if needed
            const newCommentConverted = convertToLTRForComposer(newComment);

            // Update state
            setValue(newCommentConverted);

            // Update selection eventually
            if (newComment !== fullNewText) {
                const position = Math.max((endPositionOfNewAddedText ?? 0) + (newComment.length - fullNewText.length), cursorPosition ?? 0);
                setSelection((prevSelection) => ({
                    start: position,
                    end: position,
                    positionX: prevSelection.positionX,
                    positionY: prevSelection.positionY,
                }));
                if (isIOSNative) {
                    // ensure that selection is set imperatively after all state changes are effective
                    InteractionManager.runAfterInteractions(() => {
                        // note: this implementation is only available on non-web RN, thus the wrapping
                        // 'if' block contains a redundant (since the ref is only used on iOS) platform check
                        textInputRef.current?.setSelection(position, position);
                    });
                }
            }

            // Update onyx related state:
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
        [debouncedSaveReportComment, preferredLocale, preferredSkinTone, raiseIsScrollLikelyLayoutTriggered, reportID, setValue, suggestionsRef],
    );

    // This contains the previous value that we receive directly from the native text input (not our formatted value)
    const prevNativeTextRef = useRef(value);
    /**
     * This is called by the input when the input value changes. It prepares the diff update for calling handleComposerUpdate.
     */
    const handleInputChange = useCallback(
        ({nativeEvent, target}: NativeSyntheticEvent<TextInputChangeEventData>) => {
            const {count, start, before} = nativeEvent;
            let nativeText = nativeEvent.text;
            if (nativeText === undefined) {
                // Assume we are on a platform where the text is stored in another field called value (e.g. web)
                // @ts-expect-error Not properly typed
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                nativeText = target.value;
            }

            const previousNativeText = prevNativeTextRef.current;
            prevNativeTextRef.current = nativeText;

            if (nativeText === valueRef.current || nativeText === previousNativeText) {
                // The text hasn't changed (note: the handler gets called for selection changes as well)
                return;
            }

            // Within "nativeText", the "count" characters beginning at "start" have just replaced old text (valueRef.current) that had length "before".
            const endPosition = start + count;
            const diffText = nativeText.substring(start, endPosition);
            // Replace newText in the original text:
            const currentText = valueRef.current;
            const fullNewText = currentText.substring(0, start) + diffText + currentText.substring(start + before);

            handleComposerUpdate({
                fullNewText,
                diffText,
                endPositionOfNewAddedText: endPosition,
                shouldDebounceSaveComment: true,
            });
        },
        [handleComposerUpdate],
    );

    /**
     * Callback to add whatever text is chosen into the main input (used f.e as callback for the emoji picker)
     */
    const replaceSelectionWithText = useCallback(
        (text: string) => {
            const newFullText = ComposerUtils.insertText(valueRef.current, selection, text);
            const endPositionOfNewAddedText = selection.start + text.length;
            handleComposerUpdate({
                fullNewText: newFullText,
                diffText: text,
                endPositionOfNewAddedText,
                // selection replacement should be debounced to avoid conflicts with text typing
                // (f.e. when emoji is being picked and 1 second still did not pass after user finished typing)
                shouldDebounceSaveComment: true,
            });
        },
        [selection, handleComposerUpdate],
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

            focus(false);
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
            prepareCommentAndResetComposer,
            isFocused: () => !!textInputRef.current?.isFocused(),
        }),
        [blur, focus, prepareCommentAndResetComposer, replaceSelectionWithText],
    );
    useEffect(() => {
        onValueChange(value);
    }, [onValueChange, value]);

    const onLayout = useCallback(
        (e: LayoutChangeEvent) => {
            const composerLayoutHeight = e.nativeEvent.layout.height;
            if (composerHeight === composerLayoutHeight) {
                return;
            }
            setComposerHeight(composerLayoutHeight);
        },
        [composerHeight],
    );

    const onClear = useCallback(() => {
        mobileInputScrollPosition.current = 0;
        setTextInputShouldClear(false);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

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
                    onChange={handleInputChange}
                    onKeyPress={triggerHotkeyActions}
                    textAlignVertical="top"
                    style={[styles.textInputCompose, isComposerFullSize ? styles.textInputFullCompose : styles.textInputCollapseCompose]}
                    maxLines={maxComposerLines}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onClick={setShouldBlockSuggestionCalcToFalse}
                    onPasteFile={displayFileInModal}
                    shouldClear={textInputShouldClear}
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
                updateComposer={handleComposerUpdate}
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
                    isCommentPendingSaved={isCommentPendingSaved}
                    // Update comment is called for example when the comment value has changed from another tab.
                    // In this case we only want to update the text displayed for this active composer instance,
                    // thus we just directly update the state:
                    updateComment={setValue}
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
