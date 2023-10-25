import React, {useState, useCallback, useRef, useImperativeHandle} from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import CONST from '../../../../CONST';
import useArrowKeyFocusManager from '../../../../hooks/useArrowKeyFocusManager';
import * as SuggestionsUtils from '../../../../libs/SuggestionUtils';
import * as EmojiUtils from '../../../../libs/EmojiUtils';
import EmojiSuggestions from '../../../../components/EmojiSuggestions';
import ONYXKEYS from '../../../../ONYXKEYS';
import useLocalize from '../../../../hooks/useLocalize';
import * as SuggestionProps from './suggestionProps';

/**
 * Check if this piece of string looks like an emoji
 * @param {String} str
 * @param {Number} pos
 * @returns {Boolean}
 */
const isEmojiCode = (str, pos) => {
    const leftWords = str.slice(0, pos).split(CONST.REGEX.SPECIAL_CHAR_OR_EMOJI);
    const leftWord = _.last(leftWords);
    return CONST.REGEX.HAS_COLON_ONLY_AT_THE_BEGINNING.test(leftWord) && leftWord.length > 2;
};

const defaultSuggestionsValues = {
    suggestedEmojis: [],
    colonSignIndex: -1,
    shouldShowSuggestionMenu: false,
};

const propTypes = {
    /** Preferred skin tone */
    preferredSkinTone: PropTypes.number,

    /** A ref to this component */
    forwardedRef: PropTypes.shape({current: PropTypes.shape({})}),

    /** Function to clear the input */
    resetKeyboardInput: PropTypes.func.isRequired,

    ...SuggestionProps.baseProps,
};

const defaultProps = {
    preferredSkinTone: CONST.EMOJI_DEFAULT_SKIN_TONE,
    forwardedRef: null,
};

function SuggestionEmoji({
    preferredSkinTone,
    value,
    setValue,
    selection,
    setSelection,
    updateComment,
    isComposerFullSize,
    isAutoSuggestionPickerLarge,
    forwardedRef,
    resetKeyboardInput,
    measureParentContainer,
}) {
    const [suggestionValues, setSuggestionValues] = useState(defaultSuggestionsValues);

    const isEmojiSuggestionsMenuVisible = !_.isEmpty(suggestionValues.suggestedEmojis) && suggestionValues.shouldShowEmojiSuggestionMenu;

    const [highlightedEmojiIndex, setHighlightedEmojiIndex] = useArrowKeyFocusManager({
        isActive: isEmojiSuggestionsMenuVisible,
        maxIndex: SuggestionsUtils.getMaxArrowIndex(suggestionValues.suggestedEmojis.length, isAutoSuggestionPickerLarge),
        shouldExcludeTextAreaNodes: false,
    });

    const {preferredLocale} = useLocalize();

    // Used to decide whether to block the suggestions list from showing to prevent flickering
    const shouldBlockCalc = useRef(false);

    /**
     * Replace the code of emoji and update selection
     * @param {Number} selectedEmoji
     */
    const insertSelectedEmoji = useCallback(
        (highlightedEmojiIndexInner) => {
            const commentBeforeColon = value.slice(0, suggestionValues.colonIndex);
            const emojiObject = suggestionValues.suggestedEmojis[highlightedEmojiIndexInner];
            const emojiCode = emojiObject.types && emojiObject.types[preferredSkinTone] ? emojiObject.types[preferredSkinTone] : emojiObject.code;
            const commentAfterColonWithEmojiNameRemoved = value.slice(selection.end);

            updateComment(`${commentBeforeColon}${emojiCode} ${SuggestionsUtils.trimLeadingSpace(commentAfterColonWithEmojiNameRemoved)}`, true);

            // In some Android phones keyboard, the text to search for the emoji is not cleared
            // will be added after the user starts typing again on the keyboard. This package is
            // a workaround to reset the keyboard natively.
            resetKeyboardInput();

            setSelection({
                start: suggestionValues.colonIndex + emojiCode.length + CONST.SPACE_LENGTH,
                end: suggestionValues.colonIndex + emojiCode.length + CONST.SPACE_LENGTH,
            });
            setSuggestionValues((prevState) => ({...prevState, suggestedEmojis: []}));
        },
        [preferredSkinTone, resetKeyboardInput, selection.end, setSelection, suggestionValues.colonIndex, suggestionValues.suggestedEmojis, updateComment, value],
    );

    /**
     * Clean data related to suggestions
     */
    const resetSuggestions = useCallback(() => {
        setSuggestionValues(defaultSuggestionsValues);
    }, []);

    const updateShouldShowSuggestionMenuToFalse = useCallback(() => {
        setSuggestionValues((prevState) => {
            if (prevState.shouldShowSuggestionMenu) {
                return {...prevState, shouldShowSuggestionMenu: false};
            }
            return prevState;
        });
    }, []);

    /**
     * Listens for keyboard shortcuts and applies the action
     *
     * @param {Object} e
     */
    const triggerHotkeyActions = useCallback(
        (e) => {
            const suggestionsExist = suggestionValues.suggestedEmojis.length > 0;

            if (((!e.shiftKey && e.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey) || e.key === CONST.KEYBOARD_SHORTCUTS.TAB.shortcutKey) && suggestionsExist) {
                e.preventDefault();
                if (suggestionValues.suggestedEmojis.length > 0) {
                    insertSelectedEmoji(highlightedEmojiIndex);
                }
                return true;
            }

            if (e.key === CONST.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey) {
                e.preventDefault();

                if (suggestionsExist) {
                    resetSuggestions();
                }

                return true;
            }
        },
        [highlightedEmojiIndex, insertSelectedEmoji, resetSuggestions, suggestionValues.suggestedEmojis.length],
    );

    /**
     * Calculates and cares about the content of an Emoji Suggester
     */
    const calculateEmojiSuggestion = useCallback(
        (selectionEnd) => {
            if (shouldBlockCalc.current || !value) {
                shouldBlockCalc.current = false;
                resetSuggestions();
                return;
            }
            const leftString = value.substring(0, selectionEnd);
            const colonIndex = leftString.lastIndexOf(':');
            const isCurrentlyShowingEmojiSuggestion = isEmojiCode(value, selectionEnd);

            const nextState = {
                suggestedEmojis: [],
                colonIndex,
                shouldShowEmojiSuggestionMenu: false,
            };
            const newSuggestedEmojis = EmojiUtils.suggestEmojis(leftString, preferredLocale);

            if (newSuggestedEmojis.length && isCurrentlyShowingEmojiSuggestion) {
                nextState.suggestedEmojis = newSuggestedEmojis;
                nextState.shouldShowEmojiSuggestionMenu = !_.isEmpty(newSuggestedEmojis);
            }

            setSuggestionValues((prevState) => ({...prevState, ...nextState}));
            setHighlightedEmojiIndex(0);
        },
        [value, preferredLocale, setHighlightedEmojiIndex, resetSuggestions],
    );

    const onSelectionChange = useCallback(
        (e) => {
            /**
             * we pass here e.nativeEvent.selection.end directly to calculateEmojiSuggestion
             * because in other case calculateEmojiSuggestion will have an old calculation value
             * of suggestion instead of current one
             */
            calculateEmojiSuggestion(e.nativeEvent.selection.end);
        },
        [calculateEmojiSuggestion],
    );

    const setShouldBlockSuggestionCalc = useCallback(
        (shouldBlockSuggestionCalc) => {
            shouldBlockCalc.current = shouldBlockSuggestionCalc;
        },
        [shouldBlockCalc],
    );

    const getSuggestions = useCallback(() => suggestionValues.suggestedEmojis, [suggestionValues]);

    useImperativeHandle(
        forwardedRef,
        () => ({
            resetSuggestions,
            onSelectionChange,
            triggerHotkeyActions,
            setShouldBlockSuggestionCalc,
            updateShouldShowSuggestionMenuToFalse,
            getSuggestions,
        }),
        [onSelectionChange, resetSuggestions, setShouldBlockSuggestionCalc, triggerHotkeyActions, updateShouldShowSuggestionMenuToFalse, getSuggestions],
    );

    if (!isEmojiSuggestionsMenuVisible) {
        return null;
    }

    return (
        <EmojiSuggestions
            onClose={() => setSuggestionValues((prevState) => ({...prevState, suggestedEmojis: []}))}
            highlightedEmojiIndex={highlightedEmojiIndex}
            emojis={suggestionValues.suggestedEmojis}
            comment={value}
            updateComment={(newComment) => setValue(newComment)}
            colonIndex={suggestionValues.colonIndex}
            prefix={value.slice(suggestionValues.colonIndex + 1, selection.start)}
            onSelect={insertSelectedEmoji}
            isComposerFullSize={isComposerFullSize}
            preferredSkinToneIndex={preferredSkinTone}
            isEmojiPickerLarge={isAutoSuggestionPickerLarge}
            measureParentContainer={measureParentContainer}
        />
    );
}

SuggestionEmoji.propTypes = propTypes;
SuggestionEmoji.defaultProps = defaultProps;
SuggestionEmoji.displayName = 'SuggestionEmoji';

const SuggestionEmojiWithRef = React.forwardRef((props, ref) => (
    <SuggestionEmoji
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

SuggestionEmojiWithRef.displayName = 'SuggestionEmojiWithRef';

export default withOnyx({
    preferredSkinTone: {
        key: ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
        selector: EmojiUtils.getPreferredSkinToneIndex,
    },
})(SuggestionEmojiWithRef);
