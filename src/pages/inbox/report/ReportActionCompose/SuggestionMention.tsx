import {Str} from 'expensify-common';
import lodashMapValues from 'lodash/mapValues';
import lodashSortBy from 'lodash/sortBy';
import React, {useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import type {Mention} from '@components/MentionSuggestions';
import MentionSuggestions from '@components/MentionSuggestions';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebounce from '@hooks/useDebounce';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import {areEmailsFromSamePrivateDomain} from '@libs/LoginUtils';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getPolicyEmployeeAccountIDs} from '@libs/PolicyUtils';
import {canReportBeMentionedWithinPolicy, doesReportBelongToWorkspace, isGroupChat, isReportParticipant} from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';
import {getSortedPersonalDetails, trimLeadingSpace} from '@libs/SuggestionUtils';
import {isValidRoomName} from '@libs/ValidationUtils';
import {searchInServer} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, PersonalDetailsList, Report} from '@src/types/onyx';
import type {SuggestionProps} from './Suggestions';

type SuggestionValues = {
    suggestedMentions: Mention[];
    atSignIndex: number;
    shouldShowSuggestionMenu: boolean;
    mentionPrefix: string;
    prefixType: string;
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

type SuggestionPersonalDetailsList = Record<
    string,
    | (PersonalDetails & {
          weight: number;
      })
    | null
>;

function SuggestionMention({
    value,
    selection,
    setSelection,
    updateComment,
    isAutoSuggestionPickerLarge,
    measureParentContainerAndReportCursor,
    isComposerFocused,
    isGroupPolicyReport,
    policyID,
    ref,
}: SuggestionProps) {
    const personalDetails = usePersonalDetails();
    const {translate, formatPhoneNumber, localeCompare} = useLocalize();
    const [suggestionValues, setSuggestionValues] = useState(defaultSuggestionsValues);
    const suggestionValuesRef = useRef(suggestionValues);
    const policy = usePolicy(policyID);
    suggestionValuesRef.current = suggestionValues;

    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [conciergeReportID = ''] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID, {canBeMissing: true});

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const isMentionSuggestionsMenuVisible = !!suggestionValues.suggestedMentions.length && suggestionValues.shouldShowSuggestionMenu;

    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Megaphone', 'FallbackAvatar']);

    const {currentReportID} = useCurrentReportIDState();
    const currentReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${currentReportID}`];
    // Smaller weight means higher order in suggestion list
    const getPersonalDetailsWeight = useCallback(
        (detail: PersonalDetails, policyEmployeeAccountIDs: number[]): number => {
            if (isReportParticipant(detail.accountID, currentReport)) {
                return 0;
            }
            if (policyEmployeeAccountIDs.includes(detail.accountID)) {
                return 1;
            }
            return 2;
        },
        [currentReport],
    );
    const weightedPersonalDetails: PersonalDetailsList | SuggestionPersonalDetailsList | undefined = useMemo(() => {
        const policyEmployeeAccountIDs = getPolicyEmployeeAccountIDs(policy, currentUserPersonalDetails.accountID);
        if (!isGroupChat(currentReport) && !doesReportBelongToWorkspace(currentReport, policyEmployeeAccountIDs, policyID, conciergeReportID)) {
            return personalDetails;
        }
        return lodashMapValues(personalDetails, (detail) =>
            detail
                ? {
                      ...detail,
                      weight: getPersonalDetailsWeight(detail, policyEmployeeAccountIDs),
                  }
                : null,
        );
    }, [policyID, policy, currentReport, personalDetails, getPersonalDetailsWeight, currentUserPersonalDetails.accountID, conciergeReportID]);

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

    /**
     * Search for reports suggestions in server.
     *
     * The function is debounced to not perform requests on every keystroke.
     */
    const debouncedSearchInServer = useDebounce(
        useCallback(() => {
            const foundSuggestionsCount = suggestionValues.suggestedMentions.length;
            if (suggestionValues.prefixType === '#' && foundSuggestionsCount < 5 && isGroupPolicyReport) {
                searchInServer(suggestionValues.mentionPrefix, policyID);
            }
        }, [suggestionValues.suggestedMentions.length, suggestionValues.prefixType, suggestionValues.mentionPrefix, policyID, isGroupPolicyReport]),
        CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME,
    );

    const formatLoginPrivateDomain = useCallback(
        (displayText = '', userLogin = '') => {
            if (userLogin !== displayText) {
                return displayText;
            }
            // If the emails are not in the same private domain, we also return the displayText
            if (!areEmailsFromSamePrivateDomain(displayText, currentUserPersonalDetails.login ?? '')) {
                return Str.removeSMSDomain(displayText);
            }

            // Otherwise, the emails must be of the same private domain, so we should remove the domain part
            return displayText.split('@').at(0);
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

    function getOriginalMentionText(inputValue: string, atSignIndex: number, whiteSpacesLength = 0) {
        const rest = inputValue.slice(atSignIndex);

        // If the search string contains spaces, it's not a simple login/email mention.
        // In that case, we need to replace all the words the user typed that are part of the mention.
        // For example, if `rest` is "@Adam Chr and" and "@Adam Chris" is a valid mention,
        // then `whiteSpacesLength` will be 1, and we should return "@Adam Chr".
        // The length of this substring will then be used to replace the user's input with the full mention.
        if (whiteSpacesLength) {
            const str = rest.split(' ', whiteSpacesLength + 1).join(' ');
            return rest.slice(0, str.length);
        }

        const breakerIndex = rest.search(CONST.REGEX.MENTION_BREAKER);
        return breakerIndex === -1 ? rest : rest.slice(0, breakerIndex);
    }

    /**
     * Replace the code of mention and update selection
     */
    const insertSelectedMention = useCallback(
        (highlightedMentionIndexInner: number) => {
            const commentBeforeAtSign = value.slice(0, suggestionValues.atSignIndex);
            const mentionObject = suggestionValues.suggestedMentions.at(highlightedMentionIndexInner);
            if (!mentionObject || highlightedMentionIndexInner === -1) {
                return;
            }

            const mentionCode = getMentionCode(mentionObject, suggestionValues.prefixType);
            const originalMention = getOriginalMentionText(value, suggestionValues.atSignIndex, StringUtils.countWhiteSpaces(suggestionValues.mentionPrefix));

            const commentAfterMention = value.slice(
                suggestionValues.atSignIndex + Math.max(originalMention.length, suggestionValues.mentionPrefix.length + suggestionValues.prefixType.length),
            );

            updateComment(`${commentBeforeAtSign}${mentionCode} ${trimLeadingSpace(commentAfterMention)}`, true);
            const selectionPosition = suggestionValues.atSignIndex + mentionCode.length + CONST.SPACE_LENGTH;
            setSelection({
                start: selectionPosition,
                end: selectionPosition,
            });
            suggestionInsertionIndexRef.current = selectionPosition;
            setSuggestionValues((prevState) => ({
                ...prevState,
                suggestedMentions: [],
                shouldShowSuggestionMenu: false,
            }));
        },
        [value, suggestionValues.atSignIndex, suggestionValues.suggestedMentions, suggestionValues.prefixType, getMentionCode, updateComment, setSelection, suggestionValues.mentionPrefix],
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
        (personalDetailsParam: PersonalDetailsList | SuggestionPersonalDetailsList | undefined, searchValue = ''): Mention[] => {
            const suggestions: Mention[] = [];

            if (CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT.includes(searchValue.toLowerCase())) {
                suggestions.push({
                    text: CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT,
                    alternateText: translate('mentionSuggestions.hereAlternateText'),
                    icons: [
                        {
                            source: expensifyIcons.Megaphone,
                            type: CONST.ICON_TYPE_AVATAR,
                        },
                    ],
                });
            }

            // Create a set to track logins that have already been seen
            const seenLogins = new Set<string>();
            const filteredPersonalDetails = Object.values(personalDetailsParam ?? {}).filter((detail) => {
                // If we don't have user's primary login, that member is not known to the current user and hence we do not allow them to be mentioned
                if (!detail?.login || detail.isOptimisticPersonalDetail) {
                    return false;
                }
                // We don't want to mention system emails like notifications@expensify.com
                if (CONST.RESTRICTED_EMAILS.includes(detail.login) || CONST.RESTRICTED_ACCOUNT_IDS.includes(detail.accountID)) {
                    return false;
                }
                const displayName = getDisplayNameOrDefault(detail);
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

                // on staging server, in specific cases (see issue) BE returns duplicated personalDetails
                // entries with the same `login` which we need to filter out
                if (seenLogins.has(detail.login)) {
                    return false;
                }
                seenLogins.add(detail.login);
                return true;
            }) as Array<PersonalDetails & {weight: number}>;

            // At this point we are sure that the details are not null, since empty user details have been filtered in the previous step
            const sortedPersonalDetails = getSortedPersonalDetails(filteredPersonalDetails, localeCompare);

            for (const detail of sortedPersonalDetails.slice(0, CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_SUGGESTIONS - suggestions.length)) {
                suggestions.push({
                    text: `${formatLoginPrivateDomain(getDisplayNameOrDefault(detail), detail?.login)}`,
                    alternateText: `@${formatLoginPrivateDomain(detail?.login, detail?.login)}`,
                    handle: detail?.login,
                    icons: [
                        {
                            name: detail?.login,
                            source: detail?.avatar ?? expensifyIcons.FallbackAvatar,
                            type: CONST.ICON_TYPE_AVATAR,
                            fallbackIcon: detail?.fallbackIcon,
                            id: detail?.accountID,
                        },
                    ],
                });
            }

            return suggestions;
        },
        [localeCompare, translate, expensifyIcons.Megaphone, expensifyIcons.FallbackAvatar, formatPhoneNumber, formatLoginPrivateDomain],
    );

    const getRoomMentionOptions = useCallback(
        (searchTerm: string, reportBatch: OnyxCollection<Report>): Mention[] => {
            const filteredRoomMentions: Mention[] = [];
            for (const report of Object.values(reportBatch ?? {})) {
                if (!canReportBeMentionedWithinPolicy(report, policyID)) {
                    continue;
                }
                if (report?.reportName?.toLowerCase().includes(searchTerm.toLowerCase())) {
                    filteredRoomMentions.push({
                        text: report.reportName,
                        handle: report.reportName,
                        alternateText: report.reportName,
                    });
                }
            }

            return lodashSortBy(filteredRoomMentions, 'handle').slice(0, CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_SUGGESTIONS);
        },
        [policyID],
    );

    const calculateMentionSuggestion = useCallback(
        (newValue: string, selectionStart?: number, selectionEnd?: number) => {
            if (selectionEnd !== selectionStart || !selectionEnd || shouldBlockCalc.current || selectionEnd < 1 || !isComposerFocused) {
                shouldBlockCalc.current = false;
                resetSuggestions();
                return;
            }

            const afterLastBreakLineIndex = newValue.lastIndexOf('\n', selectionEnd - 1) + 1;
            const leftString = newValue.substring(afterLastBreakLineIndex, selectionEnd);
            const words = leftString.split(CONST.REGEX.SPACE_OR_EMOJI);
            const lastWord: string = words.at(-1) ?? '';
            const secondToLastWord = words.at(-3);

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
                const suggestions = getUserMentionOptions(weightedPersonalDetails, prefix);
                nextState.suggestedMentions = suggestions;
                nextState.shouldShowSuggestionMenu = !!suggestions.length;
            }

            const shouldDisplayRoomMentionsSuggestions = isGroupPolicyReport && (isValidRoomName(suggestionWord.toLowerCase()) || prefix === '');
            if (prefixType === '#' && shouldDisplayRoomMentionsSuggestions) {
                // Filter reports by room name and current policy
                nextState.suggestedMentions = getRoomMentionOptions(prefix, reports);

                // Even if there are no reports, we should show the suggestion menu - to perform live search
                nextState.shouldShowSuggestionMenu = true;
            }

            // Early return if there is no update
            const currentState = suggestionValuesRef.current;
            if (currentState.suggestedMentions.length === 0 && nextState.suggestedMentions?.length === 0) {
                return;
            }

            setSuggestionValues((prevState) => ({
                ...prevState,
                ...nextState,
            }));
            setHighlightedMentionIndex(0);
        },
        [isComposerFocused, isGroupPolicyReport, setHighlightedMentionIndex, resetSuggestions, getUserMentionOptions, weightedPersonalDetails, getRoomMentionOptions, reports],
    );

    const debouncedCalculateMentionSuggestion = useDebounce(
        useCallback(
            (newValue: string, selectionStart?: number, selectionEnd?: number) => {
                calculateMentionSuggestion(newValue, selectionStart, selectionEnd);
            },
            [calculateMentionSuggestion],
        ),
        CONST.TIMING.SUGGESTION_DEBOUNCE_TIME,
    );

    useEffect(() => {
        debouncedCalculateMentionSuggestion(value, selection.start, selection.end);
    }, [value, selection.start, selection.end, debouncedCalculateMentionSuggestion]);

    useEffect(() => {
        debouncedSearchInServer();
    }, [suggestionValues.suggestedMentions.length, suggestionValues.prefixType, policyID, value, debouncedSearchInServer]);

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

    const getSuggestions = useCallback(() => suggestionValues.suggestedMentions, [suggestionValues.suggestedMentions]);
    const getIsSuggestionsMenuVisible = useCallback(() => isMentionSuggestionsMenuVisible, [isMentionSuggestionsMenuVisible]);

    useImperativeHandle(
        ref,
        () => ({
            resetSuggestions,
            triggerHotkeyActions,
            setShouldBlockSuggestionCalc,
            updateShouldShowSuggestionMenuToFalse,
            getSuggestions,
            getIsSuggestionsMenuVisible,
        }),
        [resetSuggestions, setShouldBlockSuggestionCalc, triggerHotkeyActions, updateShouldShowSuggestionMenuToFalse, getSuggestions, getIsSuggestionsMenuVisible],
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
            measureParentContainerAndReportCursor={measureParentContainerAndReportCursor}
            resetSuggestions={resetSuggestions}
        />
    );
}

export default SuggestionMention;
