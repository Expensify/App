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
import compose from '../../../../libs/compose';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../../components/withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';

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
    mentionPrefix: '',
    isAutoSuggestionPickerLarge: false,
};

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
    forwardedRef: PropTypes.object.isRequired,
    resetKeyboardInput: PropTypes.func.isRequired,
    onInsertedEmoji: PropTypes.func.isRequired,

    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

function SuggestionEmoji({
    isComposerFullSize,
    windowHeight,
    preferredLocale,
    isSmallScreenWidth,
    preferredSkinTone,
    value,
    setValue,
    selection,
    setSelection,
    updateComment,
    composerHeight,
    shouldShowReportRecipientLocalTime,
    forwardedRef,
    resetKeyboardInput,
    onInsertedEmoji,
}) {
    const [suggestionValues, setSuggestionValues] = useState(defaultSuggestionsValues);

    const isEmojiSuggestionsMenuVisible = !_.isEmpty(suggestionValues.suggestedEmojis) && suggestionValues.shouldShowEmojiSuggestionMenu;

    const [highlightedEmojiIndex] = useArrowKeyFocusManager({
        isActive: isEmojiSuggestionsMenuVisible,
        maxIndex: SuggestionsUtils.getMaxArrowIndex(suggestionValues.suggestedEmojis.length, suggestionValues.isAutoSuggestionPickerLarge),
        shouldExcludeTextAreaNodes: false,
    });

    // Used to decide whether to block the suggestions list from showing to prevent flickering
    const shouldBlockCalc = useRef(false);

    /**
     * Replace the code of emoji and update selection
     * @param {Number} selectedEmoji
     */
    const insertSelectedEmoji = useCallback(
        (selectedEmoji) => {
            const commentBeforeColon = value.slice(0, suggestionValues.colonIndex);
            const emojiObject = suggestionValues.suggestedEmojis[selectedEmoji];
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

            onInsertedEmoji(emojiObject);
        },
        [onInsertedEmoji, preferredSkinTone, resetKeyboardInput, selection.end, setSelection, suggestionValues.colonIndex, suggestionValues.suggestedEmojis, updateComment, value],
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
            if (shouldBlockCalc.current) {
                shouldBlockCalc.current = false;
                return;
            }
            const leftString = value.substring(0, selectionEnd);
            const colonIndex = leftString.lastIndexOf(':');
            const isCurrentlyShowingEmojiSuggestion = isEmojiCode(value, selectionEnd);

            // the larger composerHeight the less space for EmojiPicker, Pixel 2 has pretty small screen and this value equal 5.3
            const hasEnoughSpaceForLargeSuggestion = windowHeight / composerHeight >= 6.8;
            const isAutoSuggestionPickerLarge = !isSmallScreenWidth || (isSmallScreenWidth && hasEnoughSpaceForLargeSuggestion);

            const nextState = {
                suggestedEmojis: [],
                colonIndex,
                shouldShowEmojiSuggestionMenu: false,
                isAutoSuggestionPickerLarge,
            };
            const newSuggestedEmojis = EmojiUtils.suggestEmojis(leftString, preferredLocale);

            if (newSuggestedEmojis.length && isCurrentlyShowingEmojiSuggestion) {
                nextState.suggestedEmojis = newSuggestedEmojis;
                nextState.shouldShowEmojiSuggestionMenu = !_.isEmpty(newSuggestedEmojis);
            }

            setSuggestionValues((prevState) => ({...prevState, ...nextState}));
        },
        [value, windowHeight, composerHeight, isSmallScreenWidth, preferredLocale],
    );

    const onSelectionChange = useCallback(
        (e) => {
            if (!value || e.nativeEvent.selection.end < 1) {
                resetSuggestions();
                shouldBlockCalc.current = false;
                return true;
            }

            /**
             * we pass here e.nativeEvent.selection.end directly to calculateEmojiSuggestion
             * because in other case calculateEmojiSuggestion will have an old calculation value
             * of suggestion instead of current one
             */
            calculateEmojiSuggestion(e.nativeEvent.selection.end);
        },
        [calculateEmojiSuggestion, resetSuggestions, value],
    );

    const setShouldBlockSuggestionCalc = useCallback(
        (shouldBlockSuggestionCalc) => {
            shouldBlockCalc.current = shouldBlockSuggestionCalc;
        },
        [shouldBlockCalc],
    );

    useImperativeHandle(
        forwardedRef,
        () => ({
            resetSuggestions,
            onSelectionChange,
            triggerHotkeyActions,
            setShouldBlockSuggestionCalc,
            updateShouldShowSuggestionMenuToFalse,
        }),
        [onSelectionChange, resetSuggestions, setShouldBlockSuggestionCalc, triggerHotkeyActions, updateShouldShowSuggestionMenuToFalse],
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
            isEmojiPickerLarge={suggestionValues.isAutoSuggestionPickerLarge}
            shouldIncludeReportRecipientLocalTimeHeight={shouldShowReportRecipientLocalTime}
        />
    );
}

SuggestionEmoji.propTypes = propTypes;

const SuggestionEmojiWithRef = React.forwardRef((props, ref) => (
    <SuggestionEmoji
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

export default compose(
    withLocalize,
    withWindowDimensions,
    withOnyx({
        preferredSkinTone: {
            key: ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
            selector: EmojiUtils.getPreferredSkinToneIndex,
        },
    }),
)(SuggestionEmojiWithRef);
