import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import UserSelectionListItem from '@components/SelectionList/ListItem/UserSelectionListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useFrozenPreSelection from '@hooks/useFrozenPreSelection';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useSearchSelector from '@hooks/useSearchSelector';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {getFilteredRecentAttendees, getParticipantsOption} from '@libs/OptionsListUtils';
import {doesPersonalDetailMatchSearchTerm} from '@libs/OptionsListUtils/searchMatchUtils';
import type {OptionData} from '@libs/ReportUtils';
import {getDisplayNameForParticipant} from '@libs/ReportUtils';
import {buildFrozenSection, excludeFrozenItems} from '@libs/SelectionListOrderUtils';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Attendee} from '@src/types/onyx/IOU';
import SearchFilterPageFooterButtons from './SearchFilterPageFooterButtons';

/**
 * Creates an OptionData object from a name-only attendee (attendee without a real accountID in personalDetails)
 */
function getOptionDataFromAttendee(attendee: Attendee): OptionData {
    return {
        text: attendee.displayName,
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- need || to handle empty string email
        alternateText: attendee.email || attendee.displayName,
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- need || to handle empty string email
        login: attendee.email || attendee.displayName,
        displayName: attendee.displayName,
        accountID: attendee.accountID ?? CONST.DEFAULT_NUMBER_ID,

        reportID: '-1',
        keyForList: `${attendee.accountID ?? attendee.email}`,
        selected: true,
        icons: attendee.avatarUrl
            ? [
                  {
                      source: attendee.avatarUrl,
                      type: CONST.ICON_TYPE_AVATAR,
                      name: attendee.displayName,
                  },
              ]
            : [],
        searchText: attendee.searchText ?? attendee.displayName,
    };
}

type SearchFiltersParticipantsSelectorProps = {
    initialAccountIDs: string[];
    onFiltersUpdate: (accountIDs: string[]) => void;

    /** Whether to allow name-only options (for attendee filter only) */
    shouldAllowNameOnlyOptions?: boolean;
};

function SearchFiltersParticipantsSelector({initialAccountIDs, onFiltersUpdate, shouldAllowNameOnlyOptions = false}: SearchFiltersParticipantsSelectorProps) {
    const {translate, formatPhoneNumber} = useLocalize();
    const personalDetails = usePersonalDetails();
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_REPORTS);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserPersonalDetails.accountID;
    const currentUserEmail = currentUserPersonalDetails.email ?? '';
    const [recentAttendees] = useOnyx(ONYXKEYS.NVP_RECENT_ATTENDEES);

    // Transform raw recentAttendees into Option[] format for use with getValidOptions (only for attendee filter)
    const recentAttendeeLists = useMemo(
        () => (shouldAllowNameOnlyOptions ? getFilteredRecentAttendees(personalDetails, [], recentAttendees ?? [], currentUserEmail, currentUserAccountID) : []),
        [personalDetails, recentAttendees, currentUserEmail, currentUserAccountID, shouldAllowNameOnlyOptions],
    );

    const {searchTerm, debouncedSearchTerm, setSearchTerm, availableOptions, selectedOptions, setSelectedOptions, toggleSelection, areOptionsInitialized, onListEndReached} =
        useSearchSelector({
            selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
            searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
            includeUserToInvite: true,
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            includeRecentReports: true,
            shouldInitialize: didScreenTransitionEnd,
            includeCurrentUser: true,
            recentAttendees: recentAttendeeLists,
            shouldAllowNameOnlyOptions,
            shouldKeepSelectedInAvailableOptions: true,
        });

    // Flips true after the hydration effect at L259 has run at least once. Used to gate snapshot
    // capture so we don't mistake "still hydrating" for "user has no pre-selection" — important when
    // every initialAccountID is stale / paged out and the hydration effect yields an empty list
    // (otherwise canCapture would stay false until the user toggles a row, then snapshot that row).
    const [hasAttemptedHydration, setHasAttemptedHydration] = useState(initialAccountIDs.length === 0);

    const {frozen: frozenSelectedOptions, isFrozen: isOptionFrozen} = useFrozenPreSelection<OptionData>({
        selectedOptions,
        isReady: areOptionsInitialized,
        // Gate on hydration (so stale-filter cases don't pin the first toggled row) AND on an empty
        // search term (so visibleCount below reflects the unfiltered list, matching the chats selector).
        canCapture: hasAttemptedHydration && debouncedSearchTerm.trim() === '',
        visibleCount: availableOptions.recentReports.length + availableOptions.personalDetails.length,
        getKeys: (option) => [option.accountID, option.login],
    });

    const {sections, headerMessage} = useMemo(() => {
        const newSections = [];
        if (!areOptionsInitialized) {
            return {sections: [], headerMessage: undefined};
        }

        const chatOptions = {...availableOptions};
        const currentUserOption = chatOptions.currentUserOption;

        // Drop the current user from Recents / Contacts; we render them in their own section below.
        if (currentUserOption?.accountID) {
            chatOptions.personalDetails = chatOptions.personalDetails.filter((detail) => detail.accountID !== currentUserOption.accountID);
            chatOptions.recentReports = chatOptions.recentReports.filter((report) => report.accountID !== currentUserOption.accountID);
        }

        const trimmedSearchTerm = debouncedSearchTerm.trim().toLowerCase();
        const matchesSearchTerm = (option: OptionData) => !trimmedSearchTerm || doesPersonalDetailMatchSearchTerm(option, option.accountID ?? CONST.DEFAULT_NUMBER_ID, trimmedSearchTerm);

        // Pre-selected items pinned at the top. Row order is frozen; the checkmark updates on toggle.
        // Search-filtered rows are hidden from view but stay in the snapshot so they still dedupe Recents / Contacts below.
        const isOptionCurrentlySelected = (option: OptionData) =>
            selectedOptions.some(
                (selected) =>
                    (!!selected.accountID && selected.accountID !== CONST.DEFAULT_NUMBER_ID && selected.accountID === option.accountID) ||
                    (!!selected.login && selected.login === option.login),
            );
        const frozenSection = buildFrozenSection(frozenSelectedOptions.filter(matchesSearchTerm), isOptionCurrentlySelected);
        if (frozenSection.length > 0) {
            newSections.push({
                title: '',
                data: frozenSection,
                sectionIndex: 0,
            });
        }

        // Selected items that don't show up anywhere else (e.g. name-only attendees). Surface them so they stay visible, but still respect the search term.
        const visibleLogins = new Set([...chatOptions.personalDetails.map((detail) => detail.login), ...chatOptions.recentReports.map((report) => report.login)].filter(Boolean));
        const extraSelectedOptions = selectedOptions.filter(
            (option) => option.accountID !== currentUserAccountID && !visibleLogins.has(option.login) && !isOptionFrozen(option) && matchesSearchTerm(option),
        );
        if (extraSelectedOptions.length > 0) {
            newSections.push({
                title: '',
                data: extraSelectedOptions,
                sectionIndex: 1,
            });
        }

        const isCurrentUserSelected = !!currentUserAccountID && selectedOptions.some((option) => option.accountID === currentUserAccountID);

        // Current user goes above Recents / Contacts. Fall back to personalDetails if pagination dropped them,
        // and skip if they're already pinned in the frozen section above.
        let currentUserOptionToShow = currentUserOption;
        const currentUserDetails = currentUserAccountID ? personalDetails?.[currentUserAccountID] : undefined;
        if (!currentUserOptionToShow && currentUserAccountID && currentUserDetails) {
            const candidateOption = getParticipantsOption(currentUserDetails, personalDetails) as OptionData;
            if (!trimmedSearchTerm || doesPersonalDetailMatchSearchTerm(candidateOption, currentUserAccountID, trimmedSearchTerm)) {
                currentUserOptionToShow = candidateOption;
            }
        }

        if (currentUserOptionToShow && !isOptionFrozen(currentUserOptionToShow)) {
            const formattedName = getDisplayNameForParticipant({
                accountID: currentUserOptionToShow.accountID,
                shouldAddCurrentUserPostfix: true,
                personalDetailsData: personalDetails,
                formatPhoneNumber,
            });
            currentUserOptionToShow = {...currentUserOptionToShow, text: formattedName, isSelected: isCurrentUserSelected};

            newSections.push({
                title: '',
                data: [currentUserOptionToShow],
                sectionIndex: 2,
            });
        } else {
            currentUserOptionToShow = undefined;
        }

        // Avoid showing frozen items twice in Recents and Contacts.
        const recentReports = frozenSection.length > 0 ? excludeFrozenItems(chatOptions.recentReports, isOptionFrozen) : chatOptions.recentReports;
        const contacts = frozenSection.length > 0 ? excludeFrozenItems(chatOptions.personalDetails, isOptionFrozen) : chatOptions.personalDetails;

        newSections.push({
            title: '',
            data: recentReports,
            sectionIndex: 3,
        });

        newSections.push({
            title: '',
            data: contacts,
            sectionIndex: 4,
        });

        const noResultsFound = contacts.length === 0 && recentReports.length === 0 && !currentUserOptionToShow && extraSelectedOptions.length === 0 && frozenSection.length === 0;
        const message = noResultsFound ? translate('common.noResultsFound') : undefined;

        return {
            sections: newSections,
            headerMessage: message,
        };
    }, [
        areOptionsInitialized,
        availableOptions,
        debouncedSearchTerm,
        selectedOptions,
        frozenSelectedOptions,
        isOptionFrozen,
        currentUserAccountID,
        personalDetails,
        translate,
        formatPhoneNumber,
    ]);

    const resetChanges = useCallback(() => {
        setSelectedOptions([]);
    }, [setSelectedOptions]);

    const applyChanges = useCallback(() => {
        let selectedIdentifiers: string[];

        if (shouldAllowNameOnlyOptions) {
            selectedIdentifiers = selectedOptions
                .map((option) => {
                    // For real users (with valid accountID in personalDetails), use accountID
                    if (option.accountID && option.accountID !== CONST.DEFAULT_NUMBER_ID && personalDetails?.[option.accountID]) {
                        return option.accountID.toString();
                    }

                    // For name-only attendees, use displayName or login as identifier
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- need || to handle empty string
                    return option.displayName || option.login;
                })
                .filter(Boolean) as string[];
        } else {
            selectedIdentifiers = selectedOptions.map((option) => (option.accountID ? option.accountID.toString() : undefined)).filter(Boolean) as string[];
        }

        onFiltersUpdate(selectedIdentifiers);
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    }, [onFiltersUpdate, selectedOptions, personalDetails, shouldAllowNameOnlyOptions]);

    // This effect handles setting initial selectedOptions based on accountIDs (or displayNames for attendee filter)
    useEffect(() => {
        if (!initialAccountIDs || initialAccountIDs.length === 0 || !personalDetails) {
            return;
        }

        let preSelectedOptions: OptionData[];

        if (shouldAllowNameOnlyOptions) {
            preSelectedOptions = initialAccountIDs
                .map((identifier) => {
                    // First, try to look up as accountID in personalDetails
                    const participant = personalDetails[identifier];
                    if (participant) {
                        const optionData = {
                            ...getParticipantsOption(participant, personalDetails),
                            isSelected: true,
                        };
                        return optionData as OptionData;
                    }

                    // If not found in personalDetails, this might be a name-only attendee
                    // Search in recentAttendees by displayName or email
                    const attendee = recentAttendees?.find((recentAttendee) => recentAttendee.displayName === identifier || recentAttendee.email === identifier);
                    if (attendee) {
                        return getOptionDataFromAttendee(attendee);
                    }

                    // Fallback: construct a minimal option from the identifier string to preserve
                    // name-only filters across sessions (e.g., after cache clear or on another device)
                    return {
                        text: identifier,
                        alternateText: identifier,
                        login: identifier,
                        displayName: identifier,
                        accountID: CONST.DEFAULT_NUMBER_ID,

                        reportID: '-1',
                        selected: true,
                        icons: [],
                        searchText: identifier,
                    };
                })
                .filter((option): option is NonNullable<OptionData> => !!option);
        } else {
            preSelectedOptions = initialAccountIDs
                .map((accountID) => {
                    const participant = personalDetails[accountID];
                    if (!participant) {
                        return undefined;
                    }
                    const optionData = {
                        ...getParticipantsOption(participant, personalDetails),
                        isSelected: true,
                    };
                    return optionData as OptionData;
                })
                .filter((option): option is NonNullable<OptionData> => !!option);
        }

        setSelectedOptions(preSelectedOptions);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot flag so the snapshot in useFrozenPreSelection doesn't fire before the hydration effect has run; derivable state isn't enough because the effect can resolve to an empty array.
        setHasAttemptedHydration(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- this should react only to changes in form data
    }, [initialAccountIDs, personalDetails, recentAttendees, shouldAllowNameOnlyOptions]);

    const handleParticipantSelection = useCallback(
        (option: OptionData) => {
            toggleSelection(option);
        },
        [toggleSelection],
    );

    const footerContent = useMemo(
        () => (
            <SearchFilterPageFooterButtons
                applyChanges={applyChanges}
                resetChanges={resetChanges}
            />
        ),
        [applyChanges, resetChanges],
    );

    const isLoadingNewOptions = !!isSearchingForReports;
    const shouldShowLoadingPlaceholder = !didScreenTransitionEnd || !areOptionsInitialized || !initialAccountIDs || !personalDetails;

    const textInputOptions = useMemo(
        () => ({
            value: searchTerm,
            label: translate('selectionList.nameEmailOrPhoneNumber'),
            onChangeText: setSearchTerm,
            headerMessage,
        }),
        [searchTerm, translate, setSearchTerm, headerMessage],
    );

    return (
        <SelectionListWithSections
            sections={sections}
            ListItem={UserSelectionListItem}
            textInputOptions={textInputOptions}
            shouldShowTextInput
            footerContent={footerContent}
            shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
            shouldUpdateFocusedIndex
            shouldPreventAutoScrollOnSelect
            onSelectRow={handleParticipantSelection}
            isLoadingNewOptions={isLoadingNewOptions}
            shouldShowLoadingPlaceholder={shouldShowLoadingPlaceholder}
            canSelectMultiple
            onEndReached={onListEndReached}
        />
    );
}

export default SearchFiltersParticipantsSelector;
