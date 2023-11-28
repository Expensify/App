import {useIsFocused, useNavigation} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import React, {useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {findNodeHandle, NativeModules, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Composer from '@components/Composer';
import withKeyboardState from '@components/withKeyboardState';
import useDebounce from '@hooks/useDebounce';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as Browser from '@libs/Browser';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import compose from '@libs/compose';
import * as ComposerUtils from '@libs/ComposerUtils';
import getDraftComment from '@libs/ComposerUtils/getDraftComment';
import convertToLTRForComposer from '@libs/convertToLTRForComposer';
import * as EmojiUtils from '@libs/EmojiUtils';
import focusComposerWithDelay from '@libs/focusComposerWithDelay';
import * as KeyDownListener from '@libs/KeyboardShortcut/KeyDownPressListener';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as SuggestionUtils from '@libs/SuggestionUtils';
import updateMultilineInputRange from '@libs/UpdateMultilineInputRange';
import willBlurTextInputOnTapOutsideFunc from '@libs/willBlurTextInputOnTapOutside';
import SilentCommentUpdater from '@pages/home/report/ReportActionCompose/SilentCommentUpdater';
import Suggestions from '@pages/home/report/ReportActionCompose/Suggestions';
import containerComposeStyles from '@styles/containerComposeStyles';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import * as EmojiPickerActions from '@userActions/EmojiPickerAction';
import * as InputFocus from '@userActions/InputFocus';
import * as Report from '@userActions/Report';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {defaultProps, propTypes} from './composerWithSuggestionsProps';

const {RNTextInputReset} = NativeModules;

// For mobile Safari, updating the selection prop on an unfocused input will cause it to automatically gain focus
// and subsequent programmatic focus shifts (e.g., modal focus trap) to show the blue frame (:focus-visible style),
// so we need to ensure that it is only updated after focus.
const isMobileSafari = Browser.isMobileSafari();

/**
 * Broadcast that the user is typing. Debounced to limit how often we publish client events.
 * @param {String} reportID
 */
const debouncedBroadcastUserIsTyping = _.debounce((reportID) => {
    Report.broadcastUserIsTyping(reportID);
}, 100);

const willBlurTextInputOnTapOutside = willBlurTextInputOnTapOutsideFunc();

// We want consistent auto focus behavior on input between native and mWeb so we have some auto focus management code that will
// prevent auto focus on existing chat for mobile device
const shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();

/**
 * This component holds the value and selection state.
 * If a component really needs access to these state values it should be put here.
 * However, double check if the component really needs access, as it will re-render
 * on every key press.
 * @param {Object} props
 * @returns {React.Component}
 */
function ComposerWithSuggestions({
    // Onyx
    modal,
    preferredSkinTone,
    parentReportActions,
    numberOfLines,
    // HOCs
    isKeyboardShown,
    // Props: Report
    reportID,
    report,
    reportActions,
    // Focus
    onFocus,
    onBlur,
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
    measureParentContainer,
    listHeight,
    // Refs
    suggestionsRef,
    animatedRef,
    forwardedRef,
    isNextModalWillOpenRef,
    editFocused,
    // For testing
    children,
}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {preferredLocale} = useLocalize();
    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const emojisPresentBefore = useRef([]);
    const [value, setValue] = useState(() => {
        const draft = getDraftComment(reportID) || '';
        if (draft) {
            emojisPresentBefore.current = EmojiUtils.extractEmojis(draft);
        }
        return draft;
    });
    const commentRef = useRef(value);

    const {isSmallScreenWidth} = useWindowDimensions();
    const maxComposerLines = isSmallScreenWidth ? CONST.COMPOSER.MAX_LINES_SMALL_SCREEN : CONST.COMPOSER.MAX_LINES;

    const isEmptyChat = useMemo(() => _.size(reportActions) === 1, [reportActions]);
    const parentAction = ReportActionsUtils.getParentReportAction(report);
    const shouldAutoFocus = !modal.isVisible && (shouldFocusInputOnScreenFocus || (isEmptyChat && !ReportActionsUtils.isTransactionThread(parentAction))) && shouldShowComposeInput;

    const valueRef = useRef(value);
    valueRef.current = value;

    const [selection, setSelection] = useState(() => ({
        start: isMobileSafari && !shouldAutoFocus ? 0 : value.length,
        end: isMobileSafari && !shouldAutoFocus ? 0 : value.length,
    }));

    const [composerHeight, setComposerHeight] = useState(0);

    const textInputRef = useRef(null);
    const insertedEmojisRef = useRef([]);

    // A flag to indicate whether the onScroll callback is likely triggered by a layout change (caused by text change) or not
    const isScrollLikelyLayoutTriggered = useRef(false);
    const suggestions = lodashGet(suggestionsRef, 'current.getSuggestions', () => [])();

    const hasEnoughSpaceForLargeSuggestion = SuggestionUtils.hasEnoughSpaceForLargeSuggestionMenu(listHeight, composerHeight, suggestions.length);

    const isAutoSuggestionPickerLarge = !isSmallScreenWidth || (isSmallScreenWidth && hasEnoughSpaceForLargeSuggestion);

    /**
     * Update frequently used emojis list. We debounce this method in the constructor so that UpdateFrequentlyUsedEmojis
     * API is not called too often.
     */
    const debouncedUpdateFrequentlyUsedEmojis = useCallback(() => {
        User.updateFrequentlyUsedEmojis(EmojiUtils.getFrequentlyUsedEmojis(insertedEmojisRef.current));
        insertedEmojisRef.current = [];
    }, []);

    /**
     * Reset isScrollLikelyLayoutTriggered to false.
     *
     * The function is debounced with a handpicked wait time to address 2 issues:
     * 1. There is a slight delay between onChangeText and onScroll
     * 2. Layout change will trigger onScroll multiple times
     */
    const debouncedLowerIsScrollLikelyLayoutTriggered = useDebounce(
        useCallback(() => (isScrollLikelyLayoutTriggered.current = false), []),
        500,
    );

    const raiseIsScrollLikelyLayoutTriggered = useCallback(() => {
        isScrollLikelyLayoutTriggered.current = true;
        debouncedLowerIsScrollLikelyLayoutTriggered();
    }, [debouncedLowerIsScrollLikelyLayoutTriggered]);

    /**
     * Set the TextInput Ref
     *
     * @param {Element} el
     * @memberof ReportActionCompose
     */
    const setTextInputRef = useCallback(
        (el) => {
            ReportActionComposeFocusManager.composerRef.current = el;
            textInputRef.current = el;
            if (_.isFunction(animatedRef)) {
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
            _.debounce((selectedReportID, newComment) => {
                Report.saveReportComment(selectedReportID, newComment || '');
            }, 1000),
        [],
    );

    /**
     * Update the value of the comment in Onyx
     *
     * @param {String} comment
     * @param {Boolean} shouldDebounceSaveComment
     */
    const updateComment = useCallback(
        (commentValue, shouldDebounceSaveComment) => {
            raiseIsScrollLikelyLayoutTriggered();
            const {text: newComment, emojis, cursorPosition} = EmojiUtils.replaceAndExtractEmojis(commentValue, preferredSkinTone, preferredLocale);
            if (!_.isEmpty(emojis)) {
                const newEmojis = EmojiUtils.getAddedEmojis(emojis, emojisPresentBefore.current);
                if (!_.isEmpty(newEmojis)) {
                    // Ensure emoji suggestions are hidden after inserting emoji even when the selection is not changed
                    if (suggestionsRef.current) {
                        suggestionsRef.current.resetSuggestions();
                    }
                    insertedEmojisRef.current = [...insertedEmojisRef.current, ...newEmojis];
                    debouncedUpdateFrequentlyUsedEmojis();
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
                const position = Math.max(selection.end + (newComment.length - commentRef.current.length), cursorPosition || 0);
                setSelection({
                    start: position,
                    end: position,
                });
            }

            // Indicate that draft has been created.
            if (commentRef.current.length === 0 && newCommentConverted.length !== 0) {
                Report.setReportWithDraft(reportID, true);
            }

            // The draft has been deleted.
            if (newCommentConverted.length === 0) {
                Report.setReportWithDraft(reportID, false);
            }

            commentRef.current = newCommentConverted;
            if (shouldDebounceSaveComment) {
                debouncedSaveReportComment(reportID, newCommentConverted);
            } else {
                Report.saveReportComment(reportID, newCommentConverted || '');
            }
            if (newCommentConverted) {
                debouncedBroadcastUserIsTyping(reportID);
            }
        },
        [
            debouncedUpdateFrequentlyUsedEmojis,
            preferredLocale,
            preferredSkinTone,
            reportID,
            setIsCommentEmpty,
            suggestionsRef,
            raiseIsScrollLikelyLayoutTriggered,
            debouncedSaveReportComment,
            selection.end,
        ],
    );

    /**
     * Update the number of lines for a comment in Onyx
     * @param {Number} numberOfLines
     */
    const updateNumberOfLines = useCallback(
        (newNumberOfLines) => {
            if (newNumberOfLines === numberOfLines) {
                return;
            }
            Report.saveReportCommentNumberOfLines(reportID, newNumberOfLines);
        },
        [reportID, numberOfLines],
    );

    /**
     * @returns {String}
     */
    const prepareCommentAndResetComposer = useCallback(() => {
        const trimmedComment = commentRef.current.trim();
        const commentLength = ReportUtils.getCommentLength(trimmedComment);

        // Don't submit empty comments or comments that exceed the character limit
        if (!commentLength || commentLength > CONST.MAX_COMMENT_LENGTH) {
            return '';
        }

        // Since we're submitting the form here which should clear the composer
        // We don't really care about saving the draft the user was typing
        // We need to make sure an empty draft gets saved instead
        debouncedSaveReportComment.cancel();

        updateComment('');
        setTextInputShouldClear(true);
        if (isComposerFullSize) {
            Report.setIsComposerFullSize(reportID, false);
        }
        setIsFullComposerAvailable(false);
        return trimmedComment;
    }, [updateComment, setTextInputShouldClear, isComposerFullSize, setIsFullComposerAvailable, reportID, debouncedSaveReportComment]);

    /**
     * Callback to add whatever text is chosen into the main input (used f.e as callback for the emoji picker)
     * @param {String} text
     * @param {Boolean} shouldAddTrailSpace
     */
    const replaceSelectionWithText = useCallback(
        (text, shouldAddTrailSpace = true) => {
            const updatedText = shouldAddTrailSpace ? `${text} ` : text;
            const selectionSpaceLength = shouldAddTrailSpace ? CONST.SPACE_LENGTH : 0;
            updateComment(ComposerUtils.insertText(commentRef.current, selection, updatedText));
            setSelection((prevSelection) => ({
                start: prevSelection.start + text.length + selectionSpaceLength,
                end: prevSelection.start + text.length + selectionSpaceLength,
            }));
        },
        [selection, updateComment],
    );

    const triggerHotkeyActions = useCallback(
        (e) => {
            if (!e || ComposerUtils.canSkipTriggerHotkeys(isSmallScreenWidth, isKeyboardShown)) {
                return;
            }

            if (suggestionsRef.current.triggerHotkeyActions(e)) {
                return;
            }

            // Submit the form when Enter is pressed
            if (e.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }

            // Trigger the edit box for last sent message if ArrowUp is pressed and the comment is empty and Chronos is not in the participants
            const valueLength = valueRef.current.length;
            if (e.key === CONST.KEYBOARD_SHORTCUTS.ARROW_UP.shortcutKey && textInputRef.current.selectionStart === 0 && valueLength === 0 && !ReportUtils.chatIncludesChronos(report)) {
                e.preventDefault();

                const parentReportActionID = lodashGet(report, 'parentReportActionID', '');
                const parentReportAction = lodashGet(parentReportActions, [parentReportActionID], {});
                const lastReportAction = _.find(
                    [...reportActions, parentReportAction],
                    (action) => ReportUtils.canEditReportAction(action) && !ReportActionsUtils.isMoneyRequestAction(action),
                );
                if (lastReportAction) {
                    Report.saveReportActionDraft(reportID, lastReportAction, _.last(lastReportAction.message).html);
                }
            }
        },
        [isKeyboardShown, isSmallScreenWidth, parentReportActions, report, reportActions, reportID, handleSendMessage, suggestionsRef, valueRef],
    );

    const onSelectionChange = useCallback(
        (e) => {
            if (textInputRef.current && textInputRef.current.isFocused() && suggestionsRef.current.onSelectionChange(e)) {
                return;
            }

            setSelection(e.nativeEvent.selection);
        },
        [suggestionsRef],
    );

    const hideSuggestionMenu = useCallback(() => {
        if (!suggestionsRef.current || isScrollLikelyLayoutTriggered.current) {
            return;
        }
        suggestionsRef.current.updateShouldShowSuggestionMenuToFalse(false);
    }, [suggestionsRef]);

    const setShouldBlockSuggestionCalcToFalse = useCallback(() => {
        if (!suggestionsRef.current) {
            return false;
        }
        InputFocus.inputFocusChange(false);
        return suggestionsRef.current.setShouldBlockSuggestionCalc(false);
    }, [suggestionsRef]);

    /**
     * Focus the composer text input
     * @param {Boolean} [shouldDelay=false] Impose delay before focusing the composer
     * @memberof ReportActionCompose
     */
    const focus = useCallback((shouldDelay = false) => {
        focusComposerWithDelay(textInputRef.current)(shouldDelay);
    }, []);

    const setUpComposeFocusManager = useCallback(() => {
        // This callback is used in the contextMenuActions to manage giving focus back to the compose input.
        ReportActionComposeFocusManager.onComposerFocus(() => {
            if (!willBlurTextInputOnTapOutside || !isFocused) {
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
        const isComposerCoveredUp = !isFocused || EmojiPickerActions.isEmojiPickerVisible() || isMenuVisible || modal.isVisible || modal.willAlertModalBecomeVisible;
        return !isComposerCoveredUp;
    }, [isMenuVisible, modal, isFocused]);

    const focusComposerOnKeyPress = useCallback(
        (e) => {
            const isComposerVisible = checkComposerVisibility();
            if (!isComposerVisible) {
                return;
            }

            // If the key pressed is non-character keys like Enter, Shift, ... do not focus
            if (e.key.length > 1) {
                return;
            }

            // If a key is pressed in combination with Meta, Control or Alt do not focus
            if (e.metaKey || e.ctrlKey || e.altKey) {
                return;
            }

            // If the space key is pressed, do not focus
            if (e.code === 'Space') {
                return;
            }

            // if we're typing on another input/text area, do not focus
            if (['INPUT', 'TEXTAREA'].includes(e.target.nodeName)) {
                return;
            }

            focus();
            replaceSelectionWithText(e.key, false);
        },
        [checkComposerVisibility, focus, replaceSelectionWithText],
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

    const prevIsModalVisible = usePrevious(modal.isVisible);
    const prevIsFocused = usePrevious(isFocused);
    useEffect(() => {
        if (modal.isVisible && !prevIsModalVisible) {
            // eslint-disable-next-line no-param-reassign
            isNextModalWillOpenRef.current = false;
        }
        // We want to focus or refocus the input when a modal has been closed or the underlying screen is refocused.
        // We avoid doing this on native platforms since the software keyboard popping
        // open creates a jarring and broken UX.
        if (!(willBlurTextInputOnTapOutside && !isNextModalWillOpenRef.current && !modal.isVisible && isFocused && (prevIsModalVisible || !prevIsFocused))) {
            return;
        }

        if (editFocused) {
            InputFocus.inputFocusChange(false);
            return;
        }
        focus(true);
    }, [focus, prevIsFocused, editFocused, prevIsModalVisible, isFocused, modal.isVisible, isNextModalWillOpenRef]);
    useEffect(() => {
        // Scrolls the composer to the bottom and sets the selection to the end, so that longer drafts are easier to edit
        updateMultilineInputRange(textInputRef.current, shouldAutoFocus);

        if (value.length === 0) {
            return;
        }

        Report.setReportWithDraft(reportID, true);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useImperativeHandle(
        forwardedRef,
        () => ({
            blur,
            focus,
            replaceSelectionWithText,
            prepareCommentAndResetComposer,
            isFocused: () => textInputRef.current.isFocused(),
        }),
        [blur, focus, prepareCommentAndResetComposer, replaceSelectionWithText],
    );

    return (
        <>
            <View style={[containerComposeStyles, styles.textInputComposeBorder]}>
                <Composer
                    checkComposerVisibility={checkComposerVisibility}
                    autoFocus={shouldAutoFocus}
                    multiline
                    ref={setTextInputRef}
                    placeholder={inputPlaceholder}
                    placeholderTextColor={theme.placeholderText}
                    onChangeText={(commentValue) => updateComment(commentValue, true)}
                    onKeyPress={triggerHotkeyActions}
                    textAlignVertical="top"
                    style={[styles.textInputCompose, isComposerFullSize ? styles.textInputFullCompose : styles.flex4]}
                    maxLines={maxComposerLines}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onClick={setShouldBlockSuggestionCalcToFalse}
                    onPasteFile={displayFileInModal}
                    shouldClear={textInputShouldClear}
                    onClear={() => setTextInputShouldClear(false)}
                    isDisabled={isBlockedFromConcierge || disabled}
                    isReportActionCompose
                    selection={selection}
                    onSelectionChange={onSelectionChange}
                    isFullComposerAvailable={isFullComposerAvailable}
                    setIsFullComposerAvailable={setIsFullComposerAvailable}
                    isComposerFullSize={isComposerFullSize}
                    value={value}
                    testID="composer"
                    numberOfLines={numberOfLines}
                    onNumberOfLinesChange={updateNumberOfLines}
                    shouldCalculateCaretPosition
                    onLayout={(e) => {
                        const composerLayoutHeight = e.nativeEvent.layout.height;
                        if (composerHeight === composerLayoutHeight) {
                            return;
                        }
                        setComposerHeight(composerLayoutHeight);
                    }}
                    onScroll={hideSuggestionMenu}
                />
            </View>

            <Suggestions
                ref={suggestionsRef}
                isComposerFullSize={isComposerFullSize}
                isComposerFocused={textInputRef.current && textInputRef.current.isFocused()}
                updateComment={updateComment}
                composerHeight={composerHeight}
                measureParentContainer={measureParentContainer}
                isAutoSuggestionPickerLarge={isAutoSuggestionPickerLarge}
                // Input
                value={value}
                setValue={setValue}
                selection={selection}
                setSelection={setSelection}
                resetKeyboardInput={resetKeyboardInput}
            />

            <SilentCommentUpdater
                reportID={reportID}
                report={report}
                value={value}
                updateComment={updateComment}
                commentRef={commentRef}
            />

            {/* Only used for testing so far */}
            {children}
        </>
    );
}

ComposerWithSuggestions.propTypes = propTypes;
ComposerWithSuggestions.defaultProps = defaultProps;
ComposerWithSuggestions.displayName = 'ComposerWithSuggestions';

const ComposerWithSuggestionsWithRef = React.forwardRef((props, ref) => (
    <ComposerWithSuggestions
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

ComposerWithSuggestionsWithRef.displayName = 'ComposerWithSuggestionsWithRef';

export default compose(
    withKeyboardState,
    withOnyx({
        numberOfLines: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT_NUMBER_OF_LINES}${reportID}`,
            // We might not have number of lines in onyx yet, for which the composer would be rendered as null
            // during the first render, which we want to avoid:
            initWithStoredValues: false,
        },
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
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`,
            canEvict: false,
            initWithStoredValues: false,
        },
    }),
)(ComposerWithSuggestionsWithRef);
