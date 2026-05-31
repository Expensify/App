import React, {useEffect, useState} from 'react';
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

// accountID is preferred; falls back to login for name-only attendees and partial rows.
function getParticipantKey(option: OptionData): string | undefined {
    if (option.accountID && option.accountID !== CONST.DEFAULT_NUMBER_ID) {
        return `acct:${option.accountID}`;
    }
    return option.login ? `login:${option.login}` : undefined;
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
    const recentAttendeeLists = shouldAllowNameOnlyOptions ? getFilteredRecentAttendees(personalDetails, [], recentAttendees ?? [], currentUserEmail, currentUserAccountID) : [];

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

    // Set once the hydration effect runs, so the snapshot waits for it. Without this, a fully stale
    // initialAccountIDs list would let the snapshot fire on the first toggled row and pin it.
    const [hasAttemptedHydration, setHasAttemptedHydration] = useState(initialAccountIDs.length === 0);

    const currentUserOption = areOptionsInitialized ? availableOptions.currentUserOption : null;
    // Drop the current user from Recents / Contacts so they only show in either the frozen section (if pre-selected) or their dedicated section below.
    const recentReportsWithoutCurrentUser =
        areOptionsInitialized && currentUserOption?.accountID
            ? availableOptions.recentReports.filter((report) => report.accountID !== currentUserOption.accountID)
            : (availableOptions.recentReports ?? []);
    const personalDetailsWithoutCurrentUser =
        areOptionsInitialized && currentUserOption?.accountID
            ? availableOptions.personalDetails.filter((detail) => detail.accountID !== currentUserOption.accountID)
            : (availableOptions.personalDetails ?? []);

    const listSectionsInput = [
        {data: recentReportsWithoutCurrentUser, sectionIndex: 3},
        {data: personalDetailsWithoutCurrentUser, sectionIndex: 4},
    ];

    const {frozenSections, listSections, isFrozen} = useFrozenPreSelection<OptionData>({
        sections: listSectionsInput,
        snapshotSource: selectedOptions,
        getKey: getParticipantKey,
        isReady: areOptionsInitialized,
        // Wait for hydration (so a toggled row isn't mistaken for pre-selection) and an empty search
        // term (so visibleCount reflects the full list).
        canCapture: hasAttemptedHydration && debouncedSearchTerm.trim() === '',
        visibleCount: recentReportsWithoutCurrentUser.length + personalDetailsWithoutCurrentUser.length,
    });

    const sections: Array<{title: string; data: OptionData[]; sectionIndex: number}> = [];
    let headerMessage: string | undefined;

    if (areOptionsInitialized) {
        const trimmedSearchTerm = debouncedSearchTerm.trim().toLowerCase();
        const matchesSearchTerm = (option: OptionData) => !trimmedSearchTerm || doesPersonalDetailMatchSearchTerm(option, option.accountID ?? CONST.DEFAULT_NUMBER_ID, trimmedSearchTerm);
        const isCurrentUserSelected = !!currentUserAccountID && selectedOptions.some((option) => option.accountID === currentUserAccountID);
        const isCurrentUserFrozen = !!currentUserOption && isFrozen(currentUserOption);

        // Frozen section needs current user injected manually (they're never in Recents / Contacts).
        let frozenSectionsWithCurrentUser = frozenSections;
        if (isCurrentUserFrozen && currentUserOption) {
            const formattedCurrentUser: OptionData = {
                ...currentUserOption,
                text: getDisplayNameForParticipant({
                    accountID: currentUserOption.accountID,
                    shouldAddCurrentUserPostfix: true,
                    personalDetailsData: personalDetails,
                    formatPhoneNumber,
                }),
                isSelected: isCurrentUserSelected,
            };
            const existing = frozenSections.at(0);
            frozenSectionsWithCurrentUser = existing ? [{...existing, data: [...existing.data, formattedCurrentUser]}] : [{title: '', data: [formattedCurrentUser], sectionIndex: 0}];
        }
        for (const section of frozenSectionsWithCurrentUser) {
            sections.push({title: '', data: section.data, sectionIndex: section.sectionIndex});
        }

        // Selected items that don't show up in Recents / Contacts and weren't pre-selected — surface them but respect the search term.
        const visibleLogins = new Set([...personalDetailsWithoutCurrentUser.map((detail) => detail.login), ...recentReportsWithoutCurrentUser.map((report) => report.login)].filter(Boolean));
        const extraSelectedOptions = selectedOptions.filter(
            (option) => option.accountID !== currentUserAccountID && !visibleLogins.has(option.login) && !isFrozen(option) && matchesSearchTerm(option),
        );
        if (extraSelectedOptions.length > 0) {
            sections.push({
                title: '',
                data: extraSelectedOptions,
                sectionIndex: 1,
            });
        }

        // Current user goes above Recents / Contacts when they aren't already pinned at the top. Fall back to personalDetails if pagination dropped them.
        let currentUserOptionToShow = isCurrentUserFrozen ? undefined : currentUserOption;
        if (!currentUserOptionToShow && !isCurrentUserFrozen && currentUserAccountID && personalDetails?.[currentUserAccountID]) {
            const candidateOption = getParticipantsOption(personalDetails[currentUserAccountID], personalDetails) as OptionData;
            if (matchesSearchTerm(candidateOption)) {
                currentUserOptionToShow = candidateOption;
            }
        }
        if (currentUserOptionToShow) {
            const formattedName = getDisplayNameForParticipant({
                accountID: currentUserOptionToShow.accountID,
                shouldAddCurrentUserPostfix: true,
                personalDetailsData: personalDetails,
                formatPhoneNumber,
            });
            sections.push({
                title: '',
                data: [{...currentUserOptionToShow, text: formattedName, isSelected: isCurrentUserSelected}],
                sectionIndex: 2,
            });
        }

        for (const section of listSections) {
            sections.push({title: '', data: section.data, sectionIndex: section.sectionIndex});
        }

        const noResultsFound = sections.every((section) => section.data.length === 0);
        headerMessage = noResultsFound ? translate('common.noResultsFound') : undefined;
    }

    const resetChanges = () => {
        setSelectedOptions([]);
    };

    const applyChanges = () => {
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
    };

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
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot flag so the snapshot waits for hydration; derivable state isn't enough since the effect can resolve to an empty array.
        setHasAttemptedHydration(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- this should react only to changes in form data
    }, [initialAccountIDs, personalDetails, recentAttendees, shouldAllowNameOnlyOptions]);

    const handleParticipantSelection = (option: OptionData) => {
        toggleSelection(option);
    };

    const footerContent = (
        <SearchFilterPageFooterButtons
            applyChanges={applyChanges}
            resetChanges={resetChanges}
        />
    );

    const isLoadingNewOptions = !!isSearchingForReports;
    const shouldShowLoadingPlaceholder = !didScreenTransitionEnd || !areOptionsInitialized || !initialAccountIDs || !personalDetails;

    const textInputOptions = {
        value: searchTerm,
        label: translate('selectionList.nameEmailOrPhoneNumber'),
        onChangeText: setSearchTerm,
        headerMessage,
    };

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
            shouldClearInputOnSelect={false}
            onSelectRow={handleParticipantSelection}
            isLoadingNewOptions={isLoadingNewOptions}
            shouldShowLoadingPlaceholder={shouldShowLoadingPlaceholder}
            canSelectMultiple
            onEndReached={onListEndReached}
        />
    );
}

export default SearchFiltersParticipantsSelector;
