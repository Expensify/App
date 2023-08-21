import React, {useRef, useCallback, useImperativeHandle} from 'react';
import PropTypes from 'prop-types';
import SuggestionMention from './SuggestionMention';
import SuggestionEmoji from './SuggestionEmoji';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';

const propTypes = {
    // Input
    value: PropTypes.string.isRequired,
    setValue: PropTypes.func.isRequired,
    selection: PropTypes.shape({
        start: PropTypes.number.isRequired,
        end: PropTypes.number.isRequired,
    }).isRequired,
    setSelection: PropTypes.func.isRequired,
    // Esoteric props
    isComposerFullSize: PropTypes.bool.isRequired,
    updateComment: PropTypes.func.isRequired,
    composerHeight: PropTypes.number.isRequired,
    shouldShowReportRecipientLocalTime: PropTypes.bool.isRequired,
    // Custom added
    forwardedRef: PropTypes.func.isRequired,
    onInsertedEmoji: PropTypes.func.isRequired,
    resetKeyboardInput: PropTypes.func.isRequired,
};

function Suggestions({
    isComposerFullSize,
    value,
    setValue,
    selection,
    setSelection,
    updateComment,
    composerHeight,
    shouldShowReportRecipientLocalTime,
    forwardedRef,
    onInsertedEmoji,
    resetKeyboardInput,
}) {
    const suggestionEmojiRef = useRef(null);
    const suggestionMentionRef = useRef(null);

    /**
     * Clean data related to EmojiSuggestions
     */
    const resetSuggestions = useCallback(() => {
        suggestionEmojiRef.current.resetSuggestions();
        suggestionMentionRef.current.resetSuggestions();
    }, []);

    /**
     * Listens for keyboard shortcuts and applies the action
     *
     * @param {Object} e
     */
    const triggerHotkeyActions = useCallback((e) => {
        const emojiHandler = suggestionEmojiRef.current.triggerHotkeyActions(e);
        const mentionHandler = suggestionMentionRef.current.triggerHotkeyActions(e);
        return emojiHandler || mentionHandler;
    }, []);

    const onSelectionChange = useCallback((e) => {
        const emojiHandler = suggestionEmojiRef.current.onSelectionChange(e);
        const mentionHandler = suggestionMentionRef.current.onSelectionChange(e);
        return emojiHandler || mentionHandler;
    }, []);

    const updateShouldShowSuggestionMenuToFalse = useCallback(() => {
        suggestionEmojiRef.current.updateShouldShowSuggestionMenuToFalse();
        suggestionMentionRef.current.updateShouldShowSuggestionMenuToFalse();
    }, []);

    const setShouldBlockSuggestionCalc = useCallback((shouldBlock) => {
        suggestionEmojiRef.current.setShouldBlockSuggestionCalc(shouldBlock);
        suggestionMentionRef.current.setShouldBlockSuggestionCalc(shouldBlock);
    }, []);

    useImperativeHandle(
        forwardedRef,
        () => ({
            resetSuggestions,
            onSelectionChange,
            triggerHotkeyActions,
            updateShouldShowSuggestionMenuToFalse,
            setShouldBlockSuggestionCalc,
        }),
        [onSelectionChange, resetSuggestions, setShouldBlockSuggestionCalc, triggerHotkeyActions, updateShouldShowSuggestionMenuToFalse],
    );

    const {windowHeight, isSmallScreenWidth} = useWindowDimensions();

    // the larger composerHeight the less space for EmojiPicker, Pixel 2 has pretty small screen and this value equal 5.3
    const hasEnoughSpaceForLargeSuggestion = windowHeight / composerHeight >= 6.8;
    const isAutoSuggestionPickerLarge = !isSmallScreenWidth || (isSmallScreenWidth && hasEnoughSpaceForLargeSuggestion);

    return (
        <>
            <SuggestionEmoji
                // Input
                value={value}
                setValue={setValue}
                selection={selection}
                setSelection={setSelection}
                // Esoteric props
                isComposerFullSize={isComposerFullSize}
                updateComment={updateComment}
                composerHeight={composerHeight}
                shouldShowReportRecipientLocalTime={shouldShowReportRecipientLocalTime}
                // Custom added
                ref={suggestionEmojiRef}
                onInsertedEmoji={onInsertedEmoji}
                resetKeyboardInput={resetKeyboardInput}
                isAutoSuggestionPickerLarge={isAutoSuggestionPickerLarge}
            />
            <SuggestionMention
                // Input
                value={value}
                setValue={setValue}
                selection={selection}
                setSelection={setSelection}
                // Esoteric props
                isComposerFullSize={isComposerFullSize}
                updateComment={updateComment}
                composerHeight={composerHeight}
                shouldShowReportRecipientLocalTime={shouldShowReportRecipientLocalTime}
                // Custom added
                ref={suggestionMentionRef}
                isAutoSuggestionPickerLarge={isAutoSuggestionPickerLarge}
            />
        </>
    );
}

Suggestions.propTypes = propTypes;

export default React.forwardRef((props, ref) => (
    <Suggestions
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));
