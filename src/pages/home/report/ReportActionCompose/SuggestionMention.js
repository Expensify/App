import React, {useState, useCallback, useRef, useImperativeHandle} from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import CONST from '../../../../CONST';
import useArrowKeyFocusManager from '../../../../hooks/useArrowKeyFocusManager';
import MentionSuggestions from '../../../../components/MentionSuggestions';
import * as UserUtils from '../../../../libs/UserUtils';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import * as SuggestionsUtils from '../../../../libs/SuggestionUtils';
import useLocalize from '../../../../hooks/useLocalize';
import ONYXKEYS from '../../../../ONYXKEYS';
import personalDetailsPropType from '../../../personalDetailsPropType';
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
    /** Personal details of all users */
    personalDetails: PropTypes.objectOf(personalDetailsPropType),

    /** A ref to this component */
    forwardedRef: PropTypes.shape({current: PropTypes.shape({})}),

    ...SuggestionProps.implementationBaseProps,
};

const defaultProps = {
    personalDetails: {},
    forwardedRef: null,
};

function SuggestionMention({
    value,
    setValue,
    setSelection,
    isComposerFullSize,
    personalDetails,
    updateComment,
    composerHeight,
    shouldShowReportRecipientLocalTime,
    forwardedRef,
    isAutoSuggestionPickerLarge,
    measureParentContainer,
}) {
    const {translate} = useLocalize();
    const [suggestionValues, setSuggestionValues] = useState(defaultSuggestionsValues);

    const isMentionSuggestionsMenuVisible = !_.isEmpty(suggestionValues.suggestedMentions) && suggestionValues.shouldShowSuggestionMenu;

    const [highlightedMentionIndex, setHighlightedMentionIndex] = useArrowKeyFocusManager({
        isActive: isMentionSuggestionsMenuVisible,
        maxIndex: SuggestionsUtils.getMaxArrowIndex(suggestionValues.suggestedMentions.length, isAutoSuggestionPickerLarge),
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
            const mentionCode = mentionObject.text === CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT ? CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT : `@${mentionObject.alternateText}`;
            const commentAfterAtSignWithMentionRemoved = value.slice(suggestionValues.atSignIndex).replace(CONST.REGEX.MENTION_REPLACER, '');

            updateComment(`${commentBeforeAtSign}${mentionCode} ${SuggestionsUtils.trimLeadingSpace(commentAfterAtSignWithMentionRemoved)}`, true);
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
            if (shouldBlockCalc.current || selectionEnd < 1) {
                shouldBlockCalc.current = false;
                resetSuggestions();
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
                nextState.shouldShowSuggestionMenu = !_.isEmpty(suggestions);
            }

            setSuggestionValues((prevState) => ({
                ...prevState,
                ...nextState,
            }));
            setHighlightedMentionIndex(0);
        },
        [getMentionOptions, personalDetails, resetSuggestions, setHighlightedMentionIndex, value],
    );

    const onSelectionChange = useCallback(
        (e) => {
            calculateMentionSuggestion(e.nativeEvent.selection.end);
        },
        [calculateMentionSuggestion],
    );

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

    if (!isMentionSuggestionsMenuVisible) {
        return null;
    }

    return (
        <MentionSuggestions
            onClose={onClose}
            highlightedMentionIndex={highlightedMentionIndex}
            mentions={suggestionValues.suggestedMentions}
            comment={value}
            updateComment={(newComment) => setValue(newComment)}
            colonIndex={suggestionValues.colonIndex}
            prefix={suggestionValues.mentionPrefix}
            onSelect={insertSelectedMention}
            isComposerFullSize={isComposerFullSize}
            isMentionPickerLarge={isAutoSuggestionPickerLarge}
            composerHeight={composerHeight}
            shouldIncludeReportRecipientLocalTimeHeight={shouldShowReportRecipientLocalTime}
            measureParentContainer={measureParentContainer}
        />
    );
}

SuggestionMention.propTypes = propTypes;
SuggestionMention.defaultProps = defaultProps;
SuggestionMention.displayName = 'SuggestionMention';

export default withOnyx({
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    },
})(
    React.forwardRef((props, ref) => (
        <SuggestionMention
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    )),
);
