import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import _ from 'underscore';
import * as Expensicons from '@components/Icon/Expensicons';
import MentionSuggestions from '@components/MentionSuggestions';
import {usePersonalDetails} from '@components/OnyxProvider';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as SuggestionsUtils from '@libs/SuggestionUtils';
import * as UserUtils from '@libs/UserUtils';
import CONST from '@src/CONST';
import * as SuggestionProps from './suggestionProps';

/**
 * Check if this piece of string looks like a mention
 * @param {String} str
 * @returns {Boolean}
 */
const isMentionCode = (str) => CONST.REGEX.HAS_AT_MOST_TWO_AT_SIGNS.test(str);

const defaultSuggestionsValues = {
    suggestedMentions: [],
    atSignIndex: -1,
    shouldShowSuggestionMenu: false,
    mentionPrefix: '',
};

const propTypes = {
    /** A ref to this component */
    forwardedRef: PropTypes.shape({current: PropTypes.shape({})}),

    ...SuggestionProps.implementationBaseProps,
};

const defaultProps = {
    forwardedRef: null,
};

function SuggestionMention({
    value,
    setValue,
    selection,
    setSelection,
    isComposerFullSize,
    updateComment,
    composerHeight,
    forwardedRef,
    isAutoSuggestionPickerLarge,
    measureParentContainer,
    isComposerFocused,
}) {
    const personalDetails = usePersonalDetails() || CONST.EMPTY_OBJECT;
    const {translate, formatPhoneNumber} = useLocalize();
    const previousValue = usePrevious(value);
    const [suggestionValues, setSuggestionValues] = useState(defaultSuggestionsValues);

    const isMentionSuggestionsMenuVisible = !_.isEmpty(suggestionValues.suggestedMentions) && suggestionValues.shouldShowSuggestionMenu;

    const [highlightedMentionIndex, setHighlightedMentionIndex] = useArrowKeyFocusManager({
        isActive: isMentionSuggestionsMenuVisible,
        maxIndex: suggestionValues.suggestedMentions.length - 1,
        shouldExcludeTextAreaNodes: false,
    });

    // Used to decide whether to block the suggestions list from showing to prevent flickering
    const shouldBlockCalc = useRef(false);

    /**
     * Replace the code of mention and update selection
     * @param {Number} highlightedMentionIndex
     */
    const insertSelectedMention = useCallback(
        (highlightedMentionIndexInner) => {
            const commentBeforeAtSign = value.slice(0, suggestionValues.atSignIndex);
            const mentionObject = suggestionValues.suggestedMentions[highlightedMentionIndexInner];
            const mentionCode = mentionObject.text === CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT ? CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT : `@${mentionObject.login}`;
            const commentAfterMention = value.slice(suggestionValues.atSignIndex + suggestionValues.mentionPrefix.length + 1);

            updateComment(`${commentBeforeAtSign}${mentionCode} ${SuggestionsUtils.trimLeadingSpace(commentAfterMention)}`, true);
            setSelection({
                start: suggestionValues.atSignIndex + mentionCode.length + CONST.SPACE_LENGTH,
                end: suggestionValues.atSignIndex + mentionCode.length + CONST.SPACE_LENGTH,
            });
            setSuggestionValues((prevState) => ({
                ...prevState,
                suggestedMentions: [],
            }));
        },
        [value, suggestionValues.atSignIndex, suggestionValues.suggestedMentions, suggestionValues.mentionPrefix, updateComment, setSelection],
    );

    /**
     * Clean data related to suggestions
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
            const suggestionsExist = suggestionValues.suggestedMentions.length > 0;

            if (((!e.shiftKey && e.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey) || e.key === CONST.KEYBOARD_SHORTCUTS.TAB.shortcutKey) && suggestionsExist) {
                e.preventDefault();
                if (suggestionValues.suggestedMentions.length > 0) {
                    insertSelectedMention(highlightedMentionIndex);
                    return true;
                }
            }

            if (e.key === CONST.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey) {
                e.preventDefault();

                if (suggestionsExist) {
                    resetSuggestions();
                }

                return true;
            }
        },
        [highlightedMentionIndex, insertSelectedMention, resetSuggestions, suggestionValues.suggestedMentions.length],
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
                if (!detail.login || detail.isOptimisticPersonalDetail) {
                    return false;
                }
                // We don't want to mention system emails like notifications@expensify.com
                if (CONST.RESTRICTED_EMAILS.includes(detail.login) || CONST.RESTRICTED_ACCOUNT_IDS.includes(detail.accountID)) {
                    return false;
                }
                const displayName = PersonalDetailsUtils.getDisplayNameOrDefault(detail);
                const displayText = displayName === formatPhoneNumber(detail.login) ? displayName : `${displayName} ${detail.login}`;
                if (searchValue && !displayText.toLowerCase().includes(searchValue.toLowerCase())) {
                    return false;
                }
                return true;
            });

            const sortedPersonalDetails = _.sortBy(filteredPersonalDetails, (detail) => detail.displayName || detail.login);
            _.each(_.first(sortedPersonalDetails, CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_SUGGESTIONS - suggestions.length), (detail) => {
                suggestions.push({
                    text: PersonalDetailsUtils.getDisplayNameOrDefault(detail),
                    alternateText: formatPhoneNumber(detail.login),
                    login: detail.login,
                    icons: [
                        {
                            name: detail.login,
                            source: UserUtils.getAvatar(detail.avatar, detail.accountID),
                            type: 'avatar',
                            fallbackIcon: detail.fallbackIcon,
                        },
                    ],
                });
            });

            return suggestions;
        },
        [translate, formatPhoneNumber],
    );

    const calculateMentionSuggestion = useCallback(
        (selectionEnd) => {
            if (shouldBlockCalc.current || selectionEnd < 1 || !isComposerFocused) {
                shouldBlockCalc.current = false;
                resetSuggestions();
                return;
            }

            const valueAfterTheCursor = value.substring(selectionEnd);
            const indexOfFirstSpecialCharOrEmojiAfterTheCursor = valueAfterTheCursor.search(CONST.REGEX.MENTION_BREAKER);

            let suggestionEndIndex;
            if (indexOfFirstSpecialCharOrEmojiAfterTheCursor === -1) {
                // We didn't find a special char/whitespace/emoji after the cursor, so we will use the entire string
                suggestionEndIndex = value.length;
            } else {
                suggestionEndIndex = indexOfFirstSpecialCharOrEmojiAfterTheCursor + selectionEnd;
            }

            const newLineIndex = value.lastIndexOf('\n', selectionEnd - 1);
            const leftString = value.substring(newLineIndex + 1, suggestionEndIndex);
            const words = leftString.split(CONST.REGEX.SPACE_OR_EMOJI);
            const lastWord = _.last(words);
            const secondToLastWord = words[words.length - 3];

            let atSignIndex;
            let suggestionWord;
            let prefix;

            // Detect if the last two words contain a mention (two words are needed to detect a mention with a space in it)
            if (lastWord.startsWith('@')) {
                atSignIndex = leftString.lastIndexOf(lastWord);
                suggestionWord = lastWord;

                prefix = suggestionWord.substring(1);
            } else if (secondToLastWord && secondToLastWord.startsWith('@') && secondToLastWord.length > 1) {
                atSignIndex = leftString.lastIndexOf(secondToLastWord);
                suggestionWord = `${secondToLastWord} ${lastWord}`;

                prefix = suggestionWord.substring(1);
            } else {
                prefix = lastWord.substring(1);
            }

            const nextState = {
                suggestedMentions: [],
                atSignIndex,
                mentionPrefix: prefix,
            };

            const isCursorBeforeTheMention = valueAfterTheCursor.startsWith(suggestionWord);

            if (!isCursorBeforeTheMention && isMentionCode(suggestionWord)) {
                const suggestions = getMentionOptions(personalDetails, prefix);

                nextState.suggestedMentions = suggestions;
                nextState.shouldShowSuggestionMenu = !_.isEmpty(suggestions);
            }

            setSuggestionValues((prevState) => ({
                ...prevState,
                ...nextState,
            }));
            setHighlightedMentionIndex(0);
        },
        [getMentionOptions, personalDetails, resetSuggestions, setHighlightedMentionIndex, value, isComposerFocused],
    );

    useEffect(() => {
        if (value.length < previousValue.length) {
            // A workaround to not show the suggestions list when the user deletes a character before the mention.
            // It is caused by a buggy behavior of the TextInput on iOS. Should be fixed after migration to Fabric.
            // See: https://github.com/facebook/react-native/pull/36930#issuecomment-1593028467
            return;
        }

        calculateMentionSuggestion(selection.end);
    }, [selection, value, previousValue, calculateMentionSuggestion]);

    const updateShouldShowSuggestionMenuToFalse = useCallback(() => {
        setSuggestionValues((prevState) => {
            if (prevState.shouldShowSuggestionMenu) {
                return {...prevState, shouldShowSuggestionMenu: false};
            }
            return prevState;
        });
    }, []);

    const setShouldBlockSuggestionCalc = useCallback(
        (shouldBlockSuggestionCalc) => {
            shouldBlockCalc.current = shouldBlockSuggestionCalc;
        },
        [shouldBlockCalc],
    );

    const onClose = useCallback(() => {
        setSuggestionValues((prevState) => ({...prevState, suggestedMentions: []}));
    }, []);

    const getSuggestions = useCallback(() => suggestionValues.suggestedMentions, [suggestionValues]);

    useImperativeHandle(
        forwardedRef,
        () => ({
            resetSuggestions,
            triggerHotkeyActions,
            setShouldBlockSuggestionCalc,
            updateShouldShowSuggestionMenuToFalse,
            getSuggestions,
        }),
        [resetSuggestions, setShouldBlockSuggestionCalc, triggerHotkeyActions, updateShouldShowSuggestionMenuToFalse, getSuggestions],
    );

    if (!isMentionSuggestionsMenuVisible) {
        return null;
    }

    return (
        <MentionSuggestions
            onClose={onClose}
            highlightedMentionIndex={highlightedMentionIndex}
            mentions={suggestionValues.suggestedMentions}
            comment={value}
            updateComment={setValue}
            colonIndex={suggestionValues.colonIndex}
            prefix={suggestionValues.mentionPrefix}
            onSelect={insertSelectedMention}
            isComposerFullSize={isComposerFullSize}
            isMentionPickerLarge={isAutoSuggestionPickerLarge}
            composerHeight={composerHeight}
            measureParentContainer={measureParentContainer}
        />
    );
}

SuggestionMention.propTypes = propTypes;
SuggestionMention.defaultProps = defaultProps;
SuggestionMention.displayName = 'SuggestionMention';

const SuggestionMentionWithRef = React.forwardRef((props, ref) => (
    <SuggestionMention
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

SuggestionMentionWithRef.displayName = 'SuggestionMentionWithRef';

export default SuggestionMentionWithRef;
