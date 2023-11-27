import PropTypes from 'prop-types';
import React, {useCallback, useImperativeHandle, useRef} from 'react';
import {View} from 'react-native';
import SuggestionEmoji from './SuggestionEmoji';
import SuggestionMention from './SuggestionMention';
import * as SuggestionProps from './suggestionProps';

const propTypes = {
    /** A ref to this component */
    forwardedRef: PropTypes.shape({current: PropTypes.shape({})}),

    /** Function to clear the input */
    resetKeyboardInput: PropTypes.func.isRequired,

    /** Is auto suggestion picker large */
    isAutoSuggestionPickerLarge: PropTypes.bool,

    ...SuggestionProps.baseProps,
};

const defaultProps = {
    forwardedRef: null,
    isAutoSuggestionPickerLarge: true,
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
    forwardedRef,
    resetKeyboardInput,
    measureParentContainer,
    isAutoSuggestionPickerLarge,
    isComposerFocused,
}) {
    const suggestionEmojiRef = useRef(null);
    const suggestionMentionRef = useRef(null);

    const getSuggestions = useCallback(() => {
        if (suggestionEmojiRef.current && suggestionEmojiRef.current.getSuggestions) {
            const emojiSuggestions = suggestionEmojiRef.current.getSuggestions();
            if (emojiSuggestions.length > 0) {
                return emojiSuggestions;
            }
        }

        if (suggestionMentionRef.current && suggestionMentionRef.current.getSuggestions) {
            const mentionSuggestions = suggestionMentionRef.current.getSuggestions();
            if (mentionSuggestions.length > 0) {
                return mentionSuggestions;
            }
        }

        return [];
    }, []);

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
        return emojiHandler;
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
            getSuggestions,
        }),
        [onSelectionChange, resetSuggestions, setShouldBlockSuggestionCalc, triggerHotkeyActions, updateShouldShowSuggestionMenuToFalse, getSuggestions],
    );

    const baseProps = {
        value,
        setValue,
        setSelection,
        selection,
        isComposerFullSize,
        updateComment,
        composerHeight,
        isAutoSuggestionPickerLarge,
        measureParentContainer,
        isComposerFocused,
    };

    return (
        <View testID="suggestions">
            <SuggestionEmoji
                ref={suggestionEmojiRef}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...baseProps}
                resetKeyboardInput={resetKeyboardInput}
            />
            <SuggestionMention
                ref={suggestionMentionRef}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...baseProps}
            />
        </View>
    );
}

Suggestions.propTypes = propTypes;
Suggestions.defaultProps = defaultProps;
Suggestions.displayName = 'Suggestions';

const SuggestionsWithRef = React.forwardRef((props, ref) => (
    <Suggestions
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

SuggestionsWithRef.displayName = 'SuggestionsWithRef';

export default SuggestionsWithRef;
