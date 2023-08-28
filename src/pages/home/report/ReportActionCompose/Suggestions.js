import React, {useRef, useCallback, useImperativeHandle} from 'react';
import PropTypes from 'prop-types';
import SuggestionMention from './SuggestionMention';
import SuggestionEmoji from './SuggestionEmoji';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import * as SuggestionProps from './suggestionProps';

const propTypes = {
    /** A ref to this component */
    forwardedRef: PropTypes.shape({current: PropTypes.shape({})}),

    /** Callback when a emoji was inserted */
    onInsertedEmoji: PropTypes.func.isRequired,

    /** Function to clear the input */
    resetKeyboardInput: PropTypes.func.isRequired,

    ...SuggestionProps.baseProps,
};

const defaultProps = {
    forwardedRef: null,
};

/**
 * This component contains the individual suggestion components.
 * If you want to add a new suggestion type, add it here.
 *
 * @returns {React.Component}
 */
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
    measureParentContainer,
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

    const baseProps = {
        value,
        setValue,
        setSelection,
        isComposerFullSize,
        updateComment,
        composerHeight,
        shouldShowReportRecipientLocalTime,
        isAutoSuggestionPickerLarge,
        measureParentContainer,
    };

    return (
        <>
            <SuggestionEmoji
                ref={suggestionEmojiRef}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...baseProps}
                selection={selection}
                onInsertedEmoji={onInsertedEmoji}
                resetKeyboardInput={resetKeyboardInput}
            />
            <SuggestionMention
                ref={suggestionMentionRef}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...baseProps}
            />
        </>
    );
}

Suggestions.propTypes = propTypes;
Suggestions.defaultProps = defaultProps;
Suggestions.displayName = 'Suggestions';

export default React.forwardRef((props, ref) => (
    <Suggestions
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));
