import Str from 'expensify-common/lib/str';
import lodashSortBy from 'lodash/sortBy';
import type {ForwardedRef, RefAttributes} from 'react';
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import * as Expensicons from '@components/Icon/Expensicons';
import type {Mention} from '@components/MentionSuggestions';
import MentionSuggestions from '@components/MentionSuggestions';
import {usePersonalDetails} from '@components/OnyxProvider';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import * as LoginUtils from '@libs/LoginUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as SuggestionsUtils from '@libs/SuggestionUtils';
import * as UserUtils from '@libs/UserUtils';
import {isValidRoomName} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Report} from '@src/types/onyx';
import type {SuggestionsRef} from './ReportActionCompose';
import type {SuggestionProps} from './Suggestions';

type SuggestionValues = {
    suggestedMentions: Mention[];
    atSignIndex: number;
    shouldShowSuggestionMenu: boolean;
    mentionPrefix: string;
    prefixType: string;
};

type RoomMentionOnyxProps = {
    /** All reports shared with the user */
    reports: OnyxCollection<Report>;
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
    prefixType: '',
};

function SuggestionMention(
    {
        value,
        selection,
        setSelection,
        updateComment,
        isAutoSuggestionPickerLarge,
        measureParentContainer,
        isComposerFocused,
        reports,
        isGroupPolicyReport,
        policyID,
    }: SuggestionProps & RoomMentionOnyxProps,
    ref: ForwardedRef<SuggestionsRef>,
) {
    const personalDetails = usePersonalDetails() ?? CONST.EMPTY_OBJECT;
    const {translate, formatPhoneNumber} = useLocalize();
    const [suggestionValues, setSuggestionValues] = useState(defaultSuggestionsValues);

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const isMentionSuggestionsMenuVisible = !!suggestionValues.suggestedMentions.length && suggestionValues.shouldShowSuggestionMenu;

    const [highlightedMentionIndex, setHighlightedMentionIndex] = useArrowKeyFocusManager({
        isActive: isMentionSuggestionsMenuVisible,
        maxIndex: suggestionValues.suggestedMentions.length - 1,
        shouldExcludeTextAreaNodes: false,
    });

    // Used to store the selection index of the last inserted mention
    const suggestionInsertionIndexRef = useRef<number | null>(null);

    // Used to detect if the selection has changed since the last suggestion insertion
    // If so, we reset the suggestionInsertionIndexRef
    const hasSelectionChanged = !(selection.end === selection.start && selection.start === suggestionInsertionIndexRef.current);
    if (hasSelectionChanged) {
        suggestionInsertionIndexRef.current = null;
    }

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

    const getMentionCode = useCallback(
        (mention: Mention, mentionType: string): string => {
            if (mentionType === '#') {
                // room mention case
                return mention.handle ?? '';
            }
            return mention.text === CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT ? CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT : `@${formatLoginPrivateDomain(mention.handle, mention.handle)}`;
        },
        [formatLoginPrivateDomain],
    );

    /**
     * Replace the code of mention and update selection
     */
    const insertSelectedMention = useCallback(
        (highlightedMentionIndexInner: number) => {
            const commentBeforeAtSign = value.slice(0, suggestionValues.atSignIndex);
            const mentionObject = suggestionValues.suggestedMentions[highlightedMentionIndexInner];
            const mentionCode = getMentionCode(mentionObject, suggestionValues.prefixType);
            const commentAfterMention = value.slice(suggestionValues.atSignIndex + suggestionValues.mentionPrefix.length + 1);

            updateComment(`${commentBeforeAtSign}${mentionCode} ${SuggestionsUtils.trimLeadingSpace(commentAfterMention)}`, true);
            const selectionPosition = suggestionValues.atSignIndex + mentionCode.length + CONST.SPACE_LENGTH;
            setSelection({
                start: selectionPosition,
                end: selectionPosition,
            });
            suggestionInsertionIndexRef.current = selectionPosition;
            setSuggestionValues((prevState) => ({
                ...prevState,
                suggestedMentions: [],
            }));
        },
        [
            value,
            suggestionValues.atSignIndex,
            suggestionValues.suggestedMentions,
            suggestionValues.prefixType,
            suggestionValues.mentionPrefix.length,
            getMentionCode,
            updateComment,
            setSelection,
        ],
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

    const getUserMentionOptions = useCallback(
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

                // Given the mention is inserted by user, we don't want to show the mention options unless the
                // selection index changes. In that case, suggestionInsertionIndexRef.current will be null.
                // See https://github.com/Expensify/App/issues/38358 for more context
                if (suggestionInsertionIndexRef.current) {
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
                    handle: detail?.login,
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

    const getRoomMentionOptions = useCallback(
        (searchTerm: string, reportBatch: OnyxCollection<Report>): Mention[] => {
            const filteredRoomMentions: Mention[] = [];
            Object.values(reportBatch ?? {}).forEach((report) => {
                if (!ReportUtils.canReportBeMentionedWithinPolicy(report, policyID ?? '')) {
                    return;
                }
                if (report?.reportName?.toLowerCase().includes(searchTerm.toLowerCase())) {
                    filteredRoomMentions.push({
                        text: report.reportName,
                        handle: report.reportName,
                        alternateText: report.reportName,
                    });
                }
            });

            return lodashSortBy(filteredRoomMentions, 'handle').slice(0, CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_SUGGESTIONS);
        },
        [policyID],
    );

    const calculateMentionSuggestion = useCallback(
        (selectionEnd: number) => {
            if (shouldBlockCalc.current || selectionEnd < 1 || !isComposerFocused) {
                shouldBlockCalc.current = false;
                resetSuggestions();
                return;
            }

            const afterLastBreakLineIndex = value.lastIndexOf('\n', selectionEnd - 1) + 1;
            const leftString = value.substring(afterLastBreakLineIndex, selectionEnd);
            const words = leftString.split(CONST.REGEX.SPACE_OR_EMOJI);
            const lastWord: string = words.at(-1) ?? '';
            const secondToLastWord = words[words.length - 3];

            let atSignIndex: number | undefined;
            let suggestionWord = '';
            let prefix: string;
            let prefixType = '';

            // Detect if the last two words contain a mention (two words are needed to detect a mention with a space in it)
            if (lastWord.startsWith('@') || lastWord.startsWith('#')) {
                atSignIndex = leftString.lastIndexOf(lastWord) + afterLastBreakLineIndex;
                suggestionWord = lastWord;

                prefix = suggestionWord.substring(1);
                prefixType = suggestionWord.substring(0, 1);
            } else if (secondToLastWord && secondToLastWord.startsWith('@') && secondToLastWord.length > 1) {
                atSignIndex = leftString.lastIndexOf(secondToLastWord) + afterLastBreakLineIndex;
                suggestionWord = `${secondToLastWord} ${lastWord}`;

                prefix = suggestionWord.substring(1);
                prefixType = suggestionWord.substring(0, 1);
            } else {
                prefix = lastWord.substring(1);
            }

            const nextState: Partial<SuggestionValues> = {
                suggestedMentions: [],
                atSignIndex,
                mentionPrefix: prefix,
                prefixType,
            };

            if (isMentionCode(suggestionWord) && prefixType === '@') {
                const suggestions = getUserMentionOptions(personalDetails, prefix);
                nextState.suggestedMentions = suggestions;
                nextState.shouldShowSuggestionMenu = !!suggestions.length;
            }

            const shouldDisplayRoomMentionsSuggestions = isGroupPolicyReport && (isValidRoomName(suggestionWord.toLowerCase()) || prefix === '');
            if (prefixType === '#' && shouldDisplayRoomMentionsSuggestions) {
                // filter reports by room name and current policy
                const filteredRoomMentions = getRoomMentionOptions(prefix, reports);
                nextState.suggestedMentions = filteredRoomMentions;
                nextState.shouldShowSuggestionMenu = !!filteredRoomMentions.length;
            }

            setSuggestionValues((prevState) => ({
                ...prevState,
                ...nextState,
            }));
            setHighlightedMentionIndex(0);
        },
        [isComposerFocused, value, isGroupPolicyReport, setHighlightedMentionIndex, resetSuggestions, getUserMentionOptions, personalDetails, getRoomMentionOptions, reports],
    );

    useEffect(() => {
        calculateMentionSuggestion(selection.end);
    }, [selection, calculateMentionSuggestion]);

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

export default withOnyx<SuggestionProps & RoomMentionOnyxProps & RefAttributes<SuggestionsRef>, RoomMentionOnyxProps>({
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
    },
})(forwardRef(SuggestionMention));
