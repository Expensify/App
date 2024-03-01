import Str from 'expensify-common/lib/str';
import lodashSortBy from 'lodash/sortBy';
import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import type {Mention} from '@components/MentionSuggestions';
import MentionSuggestions from '@components/MentionSuggestions';
import {usePersonalDetails} from '@components/OnyxProvider';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import * as LoginUtils from '@libs/LoginUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as SuggestionsUtils from '@libs/SuggestionUtils';
import * as UserUtils from '@libs/UserUtils';
import CONST from '@src/CONST';
import type {PersonalDetailsList} from '@src/types/onyx';
import type {SuggestionsRef} from './ReportActionCompose';
import type {SuggestionProps} from './Suggestions';

type SuggestionValues = {
    suggestedMentions: Mention[];
    atSignIndex: number;
    shouldShowSuggestionMenu: boolean;
    mentionPrefix: string;
};

/**
 * Check if this piece of string looks like a mention
 */
const isMentionCode = (str: string): boolean => CONST.REGEX.HAS_AT_MOST_TWO_AT_SIGNS.test(str);

const defaultSuggestionsValues: SuggestionValues = {
    suggestedMentions: [],
    atSignIndex: -1,
    shouldShowSuggestionMenu: false,
    mentionPrefix: '',
};

function SuggestionMention(
    {value, selection, setSelection, updateComment, isAutoSuggestionPickerLarge, measureParentContainer, isComposerFocused}: SuggestionProps,
    ref: ForwardedRef<SuggestionsRef>,
) {
    const personalDetails = usePersonalDetails() ?? CONST.EMPTY_OBJECT;
    const {translate, formatPhoneNumber} = useLocalize();
    const previousValue = usePrevious(value);
    const [suggestionValues, setSuggestionValues] = useState(defaultSuggestionsValues);

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const isMentionSuggestionsMenuVisible = !!suggestionValues.suggestedMentions.length && suggestionValues.shouldShowSuggestionMenu;

    const [highlightedMentionIndex, setHighlightedMentionIndex] = useArrowKeyFocusManager({
        isActive: isMentionSuggestionsMenuVisible,
        maxIndex: suggestionValues.suggestedMentions.length - 1,
        shouldExcludeTextAreaNodes: false,
    });

    // Used to decide whether to block the suggestions list from showing to prevent flickering
    const shouldBlockCalc = useRef(false);

    const formatLoginPrivateDomain = useCallback(
        (displayText = '', userLogin = '') => {
            if (userLogin !== displayText) {
                return displayText;
            }
            // If the emails are not in the same private domain, we also return the displayText
            if (!LoginUtils.areEmailsFromSamePrivateDomain(displayText, currentUserPersonalDetails.login ?? '')) {
                return Str.removeSMSDomain(displayText);
            }

            // Otherwise, the emails must be of the same private domain, so we should remove the domain part
            return displayText.split('@')[0];
        },
        [currentUserPersonalDetails.login],
    );

    /**
     * Replace the code of mention and update selection
     */
    const insertSelectedMention = useCallback(
        (highlightedMentionIndexInner: number) => {
            const commentBeforeAtSign = value.slice(0, suggestionValues.atSignIndex);
            const mentionObject = suggestionValues.suggestedMentions[highlightedMentionIndexInner];
            const mentionCode =
                mentionObject.text === CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT
                    ? CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT
                    : `@${formatLoginPrivateDomain(mentionObject.login, mentionObject.login)}`;
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
        [value, suggestionValues.atSignIndex, suggestionValues.suggestedMentions, suggestionValues.mentionPrefix, updateComment, setSelection, formatLoginPrivateDomain],
    );

    /**
     * Clean data related to suggestions
     */
    const resetSuggestions = useCallback(() => {
        setSuggestionValues(defaultSuggestionsValues);
    }, []);

    /**
     * Listens for keyboard shortcuts and applies the action
     */
    const triggerHotkeyActions = useCallback(
        (event: KeyboardEvent) => {
            const suggestionsExist = suggestionValues.suggestedMentions.length > 0;

            if (((!event.shiftKey && event.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey) || event.key === CONST.KEYBOARD_SHORTCUTS.TAB.shortcutKey) && suggestionsExist) {
                event.preventDefault();
                if (suggestionValues.suggestedMentions.length > 0) {
                    insertSelectedMention(highlightedMentionIndex);
                    return true;
                }
            }

            if (event.key === CONST.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey) {
                event.preventDefault();

                if (suggestionsExist) {
                    resetSuggestions();
                }

                return true;
            }
        },
        [highlightedMentionIndex, insertSelectedMention, resetSuggestions, suggestionValues.suggestedMentions.length],
    );

    const getMentionOptions = useCallback(
        (personalDetailsParam: PersonalDetailsList, searchValue = ''): Mention[] => {
            const suggestions = [];

            if (CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT.includes(searchValue.toLowerCase())) {
                suggestions.push({
                    text: CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT,
                    alternateText: translate('mentionSuggestions.hereAlternateText'),
                    icons: [
                        {
                            source: Expensicons.Megaphone,
                            type: CONST.ICON_TYPE_AVATAR,
                        },
                    ],
                });
            }

            const filteredPersonalDetails = Object.values(personalDetailsParam ?? {}).filter((detail) => {
                // If we don't have user's primary login, that member is not known to the current user and hence we do not allow them to be mentioned
                if (!detail?.login || detail.isOptimisticPersonalDetail) {
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

            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- nullish coalescing cannot be used if left side can be empty string
            const sortedPersonalDetails = lodashSortBy(filteredPersonalDetails, (detail) => detail?.displayName || detail?.login);
            sortedPersonalDetails.slice(0, CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_SUGGESTIONS - suggestions.length).forEach((detail) => {
                suggestions.push({
                    text: formatLoginPrivateDomain(PersonalDetailsUtils.getDisplayNameOrDefault(detail), detail?.login),
                    alternateText: `@${formatLoginPrivateDomain(detail?.login, detail?.login)}`,
                    login: detail?.login,
                    icons: [
                        {
                            name: detail?.login,
                            source: UserUtils.getAvatar(detail?.avatar, detail?.accountID),
                            type: CONST.ICON_TYPE_AVATAR,
                            fallbackIcon: detail?.fallbackIcon,
                        },
                    ],
                });
            });

            return suggestions;
        },
        [translate, formatPhoneNumber, formatLoginPrivateDomain],
    );

    const calculateMentionSuggestion = useCallback(
        (selectionEnd: number) => {
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

            const afterLastBreakLineIndex = value.lastIndexOf('\n', selectionEnd - 1) + 1;
            const leftString = value.substring(afterLastBreakLineIndex, suggestionEndIndex);
            const words = leftString.split(CONST.REGEX.SPACE_OR_EMOJI);
            const lastWord: string = words.at(-1) ?? '';
            const secondToLastWord = words[words.length - 3];

            let atSignIndex: number | undefined;
            let suggestionWord = '';
            let prefix: string;

            // Detect if the last two words contain a mention (two words are needed to detect a mention with a space in it)
            if (lastWord.startsWith('@')) {
                atSignIndex = leftString.lastIndexOf(lastWord) + afterLastBreakLineIndex;
                suggestionWord = lastWord;

                prefix = suggestionWord.substring(1);
            } else if (secondToLastWord && secondToLastWord.startsWith('@') && secondToLastWord.length > 1) {
                atSignIndex = leftString.lastIndexOf(secondToLastWord) + afterLastBreakLineIndex;
                suggestionWord = `${secondToLastWord} ${lastWord}`;

                prefix = suggestionWord.substring(1);
            } else {
                prefix = lastWord.substring(1);
            }

            const nextState: Partial<SuggestionValues> = {
                suggestedMentions: [],
                atSignIndex,
                mentionPrefix: prefix,
            };

            const isCursorBeforeTheMention = valueAfterTheCursor.startsWith(suggestionWord);

            if (!isCursorBeforeTheMention && isMentionCode(suggestionWord)) {
                const suggestions = getMentionOptions(personalDetails, prefix);

                nextState.suggestedMentions = suggestions;
                nextState.shouldShowSuggestionMenu = !!suggestions.length;
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
        (shouldBlockSuggestionCalc: boolean) => {
            shouldBlockCalc.current = shouldBlockSuggestionCalc;
        },
        [shouldBlockCalc],
    );

    const getSuggestions = useCallback(() => suggestionValues.suggestedMentions, [suggestionValues]);

    useImperativeHandle(
        ref,
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
            highlightedMentionIndex={highlightedMentionIndex}
            mentions={suggestionValues.suggestedMentions}
            prefix={suggestionValues.mentionPrefix}
            onSelect={insertSelectedMention}
            isMentionPickerLarge={!!isAutoSuggestionPickerLarge}
            measureParentContainer={measureParentContainer}
        />
    );
}

SuggestionMention.displayName = 'SuggestionMention';

export default forwardRef(SuggestionMention);
