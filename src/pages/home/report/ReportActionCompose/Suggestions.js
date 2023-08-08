import React, {useRef, useCallback, useImperativeHandle} from 'react';
import PropTypes from 'prop-types';
import SuggestionMention from './SuggestionMention';
import SuggestionEmoji from './SuggestionEmoji';

const propTypes = {
    // Onyx/Hooks
    preferredSkinTone: PropTypes.number.isRequired,
    windowHeight: PropTypes.number.isRequired,
    isSmallScreenWidth: PropTypes.bool.isRequired,
    preferredLocale: PropTypes.string.isRequired,
    personalDetails: PropTypes.object.isRequired,
    translate: PropTypes.func.isRequired,
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
    forwardedRef: PropTypes.object.isRequired,
    onInsertedEmoji: PropTypes.func.isRequired,
    resetKeyboardInput: PropTypes.func.isRequired,
};

// TODO: split between emoji and mention suggestions
function Suggestions({
    isComposerFullSize,
    windowHeight,
    preferredLocale,
    isSmallScreenWidth,
    preferredSkinTone,
    personalDetails,
    translate,
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

    useImperativeHandle(
        forwardedRef,
        () => ({
            resetSuggestions,
            onSelectionChange,
            triggerHotkeyActions,
            updateShouldShowSuggestionMenuToFalse,
        }),
        [onSelectionChange, resetSuggestions, triggerHotkeyActions, updateShouldShowSuggestionMenuToFalse],
    );

    return (
        <>
            <SuggestionEmoji
                // Onyx
                preferredSkinTone={preferredSkinTone}
                windowHeight={windowHeight}
                isSmallScreenWidth={isSmallScreenWidth}
                preferredLocale={preferredLocale}
                personalDetails={personalDetails}
                translate={translate}
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
            />
            <SuggestionMention
                // Onyx
                preferredSkinTone={preferredSkinTone}
                windowHeight={windowHeight}
                isSmallScreenWidth={isSmallScreenWidth}
                preferredLocale={preferredLocale}
                personalDetails={personalDetails}
                translate={translate}
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
            />
        </>
    );
}

Suggestions.propTypes = propTypes;

const SuggestionsWithRef = React.forwardRef((props, ref) => (
    <Suggestions
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

export default SuggestionsWithRef;
