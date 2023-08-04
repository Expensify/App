import React, {useState, useCallback, useRef, useImperativeHandle} from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import CONST from '../../../../CONST';
import useArrowKeyFocusManager from '../../../../hooks/useArrowKeyFocusManager';
import EmojiSuggestions from '../../../../components/EmojiSuggestions';
import MentionSuggestions from '../../../../components/MentionSuggestions';
import * as EmojiUtils from '../../../../libs/EmojiUtils';
import * as UserUtils from '../../../../libs/UserUtils';
import * as Expensicons from '../../../../components/Icon/Expensicons';

/**
 * Return the max available index for arrow manager.
 * @param {Number} numRows
 * @param {Boolean} isAutoSuggestionPickerLarge
 * @returns {Number}
 */
const getMaxArrowIndex = (numRows, isAutoSuggestionPickerLarge) => {
    // rowCount is number of emoji/mention suggestions. For small screen we can fit 3 items
    // and for large we show up to 20 items for mentions/emojis
    const rowCount = isAutoSuggestionPickerLarge
        ? Math.min(numRows, CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_SUGGESTIONS)
        : Math.min(numRows, CONST.AUTO_COMPLETE_SUGGESTER.MIN_AMOUNT_OF_SUGGESTIONS);

    // -1 because we start at 0
    return rowCount - 1;
};

/**
 * Trims first character of the string if it is a space
 * @param {String} str
 * @returns {String}
 */
const trimLeadingSpace = (str) => (str.slice(0, 1) === ' ' ? str.slice(1) : str);

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

/**
 * Check if this piece of string looks like a mention
 * @param {String} str
 * @returns {Boolean}
 */
const isMentionCode = (str) => CONST.REGEX.HAS_AT_MOST_TWO_AT_SIGNS.test(str);

const defaultSuggestionsValues = {
    suggestedEmojis: [],
    suggestedMentions: [],
    colonIndex: -1,
    atSignIndex: -1,
    shouldShowEmojiSuggestionMenu: false,
    shouldShowMentionSuggestionMenu: false,
    mentionPrefix: '',
    isAutoSuggestionPickerLarge: false,
};

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
}) {
    // TODO: rewrite suggestion logic to some hook or state machine or util or something to not make it depend on ReportActionComposer
    const [suggestionValues, setSuggestionValues] = useState(defaultSuggestionsValues);

    const isEmojiSuggestionsMenuVisible = !_.isEmpty(suggestionValues.suggestedEmojis) && suggestionValues.shouldShowEmojiSuggestionMenu;
    const isMentionSuggestionsMenuVisible = !_.isEmpty(suggestionValues.suggestedMentions) && suggestionValues.shouldShowMentionSuggestionMenu;

    const [highlightedEmojiIndex] = useArrowKeyFocusManager({
        isActive: isEmojiSuggestionsMenuVisible,
        maxIndex: getMaxArrowIndex(suggestionValues.suggestedEmojis.length, suggestionValues.isAutoSuggestionPickerLarge),
        shouldExcludeTextAreaNodes: false,
    });
    const [highlightedMentionIndex] = useArrowKeyFocusManager({
        isActive: isMentionSuggestionsMenuVisible,
        maxIndex: getMaxArrowIndex(suggestionValues.suggestedMentions.length, suggestionValues.isAutoSuggestionPickerLarge),
        shouldExcludeTextAreaNodes: false,
    });

    // These variables are used to decide whether to block the suggestions list from showing to prevent flickering
    const shouldBlockEmojiCalc = useRef(false);
    const shouldBlockMentionCalc = useRef(false);

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

            updateComment(`${commentBeforeColon}${emojiCode} ${trimLeadingSpace(commentAfterColonWithEmojiNameRemoved)}`, true);

            // TODO: i think this should come from the outside
            // In some Android phones keyboard, the text to search for the emoji is not cleared
            // will be added after the user starts typing again on the keyboard. This package is
            // a workaround to reset the keyboard natively.
            // if (RNTextInputReset) {
            //     RNTextInputReset.resetKeyboardInput(findNodeHandle(textInput));
            // }

            setSelection({
                start: suggestionValues.colonIndex + emojiCode.length + CONST.SPACE_LENGTH,
                end: suggestionValues.colonIndex + emojiCode.length + CONST.SPACE_LENGTH,
            });
            setSuggestionValues((prevState) => ({...prevState, suggestedEmojis: []}));

            // TODO: function from the outside
            // insertedEmojis.current = [...insertedEmojis.current, emojiObject];
            // debouncedUpdateFrequentlyUsedEmojis(emojiObject);
        },
        [preferredSkinTone, selection.end, setSelection, suggestionValues.colonIndex, suggestionValues.suggestedEmojis, updateComment, value],
    );

    /**
     * Replace the code of mention and update selection
     * @param {Number} highlightedMentionIndex
     */
    const insertSelectedMention = useCallback(
        (highlightedMentionIndexInner) => {
            const commentBeforeAtSign = value.slice(0, suggestionValues.atSignIndex);
            const mentionObject = suggestionValues.suggestedMentions[highlightedMentionIndexInner];
            const mentionCode = mentionObject.text === CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT ? CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT : `@${mentionObject.alternateText}`;
            const commentAfterAtSignWithMentionRemoved = value.slice(suggestionValues.atSignIndex).replace(CONST.REGEX.MENTION_REPLACER, '');

            updateComment(`${commentBeforeAtSign}${mentionCode} ${trimLeadingSpace(commentAfterAtSignWithMentionRemoved)}`, true);
            setSelection({
                start: suggestionValues.atSignIndex + mentionCode.length + CONST.SPACE_LENGTH,
                end: suggestionValues.atSignIndex + mentionCode.length + CONST.SPACE_LENGTH,
            });
            setSuggestionValues((prevState) => ({
                ...prevState,
                suggestedMentions: [],
            }));
        },
        [value, suggestionValues.atSignIndex, suggestionValues.suggestedMentions, updateComment, setSelection],
    );

    /**
     * Clean data related to EmojiSuggestions
     */
    const resetSuggestions = useCallback(() => {
        setSuggestionValues(defaultSuggestionsValues);
    }, []);

    /**
     * Listens for keyboard shortcuts and applies the action
     *
     * @param {Object} e
     */
    const triggerHotkeyActions = useCallback(
        (e) => {
            const suggestionsExist = suggestionValues.suggestedEmojis.length > 0 || suggestionValues.suggestedMentions.length > 0;

            if (((!e.shiftKey && e.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey) || e.key === CONST.KEYBOARD_SHORTCUTS.TAB.shortcutKey) && suggestionsExist) {
                e.preventDefault();
                if (suggestionValues.suggestedEmojis.length > 0) {
                    insertSelectedEmoji(highlightedEmojiIndex);
                }
                if (suggestionValues.suggestedMentions.length > 0) {
                    insertSelectedMention(highlightedMentionIndex);
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
        [
            highlightedEmojiIndex,
            highlightedMentionIndex,
            insertSelectedEmoji,
            insertSelectedMention,
            resetSuggestions,
            suggestionValues.suggestedEmojis.length,
            suggestionValues.suggestedMentions.length,
        ],
    );

    /**
     * Calculates and cares about the content of an Emoji Suggester
     */
    const calculateEmojiSuggestion = useCallback(
        (selectionEnd) => {
            if (shouldBlockEmojiCalc.current) {
                shouldBlockEmojiCalc.current = false;
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

    const getMentionOptions = useCallback(
        (personalDetailsParam, searchValue = '') => {
            const suggestions = [];

            if (CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT.includes(searchValue.toLowerCase())) {
                suggestions.push({
                    text: CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT,
                    alternateText: translate('mentionSuggestions.hereAlternateText'),
                    icons: [
                        {
                            source: Expensicons.Megaphone,
                            type: 'avatar',
                        },
                    ],
                });
            }

            const filteredPersonalDetails = _.filter(_.values(personalDetailsParam), (detail) => {
                // If we don't have user's primary login, that member is not known to the current user and hence we do not allow them to be mentioned
                if (!detail.login) {
                    return false;
                }
                if (searchValue && !`${detail.displayName} ${detail.login}`.toLowerCase().includes(searchValue.toLowerCase())) {
                    return false;
                }
                return true;
            });

            const sortedPersonalDetails = _.sortBy(filteredPersonalDetails, (detail) => detail.displayName || detail.login);
            _.each(_.first(sortedPersonalDetails, CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_SUGGESTIONS - suggestions.length), (detail) => {
                suggestions.push({
                    text: detail.displayName,
                    alternateText: detail.login,
                    icons: [
                        {
                            name: detail.login,
                            source: UserUtils.getAvatar(detail.avatar, detail.accountID),
                            type: 'avatar',
                        },
                    ],
                });
            });

            return suggestions;
        },
        [translate],
    );

    const calculateMentionSuggestion = useCallback(
        (selectionEnd) => {
            if (shouldBlockMentionCalc.current) {
                shouldBlockMentionCalc.current = false;
                return;
            }

            const valueAfterTheCursor = value.substring(selectionEnd);
            const indexOfFirstWhitespaceCharOrEmojiAfterTheCursor = valueAfterTheCursor.search(CONST.REGEX.NEW_LINE_OR_WHITE_SPACE_OR_EMOJI);

            let indexOfLastNonWhitespaceCharAfterTheCursor;
            if (indexOfFirstWhitespaceCharOrEmojiAfterTheCursor === -1) {
                // we didn't find a whitespace/emoji after the cursor, so we will use the entire string
                indexOfLastNonWhitespaceCharAfterTheCursor = value.length;
            } else {
                indexOfLastNonWhitespaceCharAfterTheCursor = indexOfFirstWhitespaceCharOrEmojiAfterTheCursor + selectionEnd;
            }

            const leftString = value.substring(0, indexOfLastNonWhitespaceCharAfterTheCursor);
            const words = leftString.split(CONST.REGEX.SPECIAL_CHAR_OR_EMOJI);
            const lastWord = _.last(words);

            let atSignIndex;
            if (lastWord.startsWith('@')) {
                atSignIndex = leftString.lastIndexOf(lastWord);
            }

            const prefix = lastWord.substring(1);

            const nextState = {
                suggestedMentions: [],
                atSignIndex,
                mentionPrefix: prefix,
            };

            const isCursorBeforeTheMention = valueAfterTheCursor.startsWith(lastWord);

            if (!isCursorBeforeTheMention && isMentionCode(lastWord)) {
                const suggestions = getMentionOptions(personalDetails, prefix);
                nextState.suggestedMentions = suggestions;
                nextState.shouldShowMentionSuggestionMenu = !_.isEmpty(suggestions);
            }

            setSuggestionValues((prevState) => ({
                ...prevState,
                ...nextState,
            }));
        },
        [getMentionOptions, personalDetails, value],
    );

    const onSelectionChange = useCallback(
        (e) => {
            if (!value || e.nativeEvent.selection.end < 1) {
                resetSuggestions();
                shouldBlockEmojiCalc.current = false;
                shouldBlockMentionCalc.current = false;
                return true;
            }

            /**
             * we pass here e.nativeEvent.selection.end directly to calculateEmojiSuggestion
             * because in other case calculateEmojiSuggestion will have an old calculation value
             * of suggestion instead of current one
             */
            calculateEmojiSuggestion(e.nativeEvent.selection.end);
            calculateMentionSuggestion(e.nativeEvent.selection.end);
        },
        [calculateEmojiSuggestion, calculateMentionSuggestion, resetSuggestions, value],
    );

    // eslint-disable-next-line rulesdir/prefer-early-return
    const updateShouldShowSuggestionMenuToFalse = useCallback(() => {
        if (suggestionValues.shouldShowEmojiSuggestionMenu) {
            setSuggestionValues((prevState) => ({...prevState, shouldShowEmojiSuggestionMenu: false}));
        }
        if (suggestionValues.shouldShowMentionSuggestionMenu) {
            setSuggestionValues((prevState) => ({...prevState, shouldShowMentionSuggestionMenu: false}));
        }
    }, [suggestionValues.shouldShowEmojiSuggestionMenu, suggestionValues.shouldShowMentionSuggestionMenu]);

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
            {isEmojiSuggestionsMenuVisible && (
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
                    composerHeight={composerHeight}
                    shouldIncludeReportRecipientLocalTimeHeight={shouldShowReportRecipientLocalTime}
                />
            )}
            {isMentionSuggestionsMenuVisible && (
                <MentionSuggestions
                    onClose={() => setSuggestionValues((prevState) => ({...prevState, suggestedMentions: []}))}
                    highlightedMentionIndex={highlightedMentionIndex}
                    mentions={suggestionValues.suggestedMentions}
                    comment={value}
                    updateComment={(newComment) => setValue(newComment)}
                    colonIndex={suggestionValues.colonIndex}
                    prefix={suggestionValues.mentionPrefix}
                    onSelect={insertSelectedMention}
                    isComposerFullSize={isComposerFullSize}
                    isMentionPickerLarge={suggestionValues.isAutoSuggestionPickerLarge}
                    composerHeight={composerHeight}
                    shouldIncludeReportRecipientLocalTimeHeight={shouldShowReportRecipientLocalTime}
                />
            )}
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
