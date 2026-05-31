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

    // Set once the hydration effect runs so the snapshot waits for it. Without this, a fully stale
    // initialAccountIDs list would let the snapshot fire on the first toggled row and pin it.
    const [hasAttemptedHydration, setHasAttemptedHydration] = useState(initialAccountIDs.length === 0);

    const trimmedSearchTerm = debouncedSearchTerm.trim().toLowerCase();
    const matchesSearchTerm = (option: OptionData) => !trimmedSearchTerm || doesPersonalDetailMatchSearchTerm(option, option.accountID ?? CONST.DEFAULT_NUMBER_ID, trimmedSearchTerm);

    const currentUserOption = areOptionsInitialized ? availableOptions.currentUserOption : null;
    const isCurrentUserSelected = !!currentUserAccountID && selectedOptions.some((option) => option.accountID === currentUserAccountID);

    // Drop the current user from Recents / Contacts so they only show in their dedicated section (or get pinned at top by the hook).
    const recentReportsWithoutCurrentUser =
        areOptionsInitialized && currentUserOption?.accountID
            ? availableOptions.recentReports.filter((report) => report.accountID !== currentUserOption.accountID)
            : (availableOptions.recentReports ?? []);
    const personalDetailsWithoutCurrentUser =
        areOptionsInitialized && currentUserOption?.accountID
            ? availableOptions.personalDetails.filter((detail) => detail.accountID !== currentUserOption.accountID)
            : (availableOptions.personalDetails ?? []);

    // Selected items that don't show up in Recents / Contacts and aren't the current user — surface them but respect the search term.
    const visibleLogins = new Set([...personalDetailsWithoutCurrentUser.map((detail) => detail.login), ...recentReportsWithoutCurrentUser.map((report) => report.login)].filter(Boolean));
    const extraSelectedOptions = selectedOptions.filter((option) => option.accountID !== currentUserAccountID && !visibleLogins.has(option.login) && matchesSearchTerm(option));

    // Render-ready current user row with the "(you)" suffix; falls back to personalDetails if pagination dropped them.
    let currentUserRow: OptionData | undefined;
    if (areOptionsInitialized) {
        let candidate = currentUserOption ?? undefined;
        if (!candidate && currentUserAccountID && personalDetails?.[currentUserAccountID]) {
            candidate = getParticipantsOption(personalDetails[currentUserAccountID], personalDetails) as OptionData;
        }
        if (candidate && matchesSearchTerm(candidate)) {
            currentUserRow = {
                ...candidate,
                text: getDisplayNameForParticipant({
                    accountID: candidate.accountID,
                    shouldAddCurrentUserPostfix: true,
                    personalDetailsData: personalDetails,
                    formatPhoneNumber,
                }),
                isSelected: isCurrentUserSelected,
            };
        }
    }

    const baseSections: Array<{title: string; data: OptionData[]; sectionIndex: number}> = [];
    if (areOptionsInitialized) {
        if (extraSelectedOptions.length > 0) {
            baseSections.push({title: '', data: extraSelectedOptions, sectionIndex: 1});
        }
        if (currentUserRow) {
            baseSections.push({title: '', data: [currentUserRow], sectionIndex: 2});
        }
        baseSections.push({title: '', data: recentReportsWithoutCurrentUser, sectionIndex: 3});
        baseSections.push({title: '', data: personalDetailsWithoutCurrentUser, sectionIndex: 4});
    }

    // Lazy-loaded list, so pinned rows may not be in current sections when a search filters them out.
    // The hook keeps them from the snapshot; we filter them through `matchesSearchTerm` so the pinned
    // section respects the current search term.
    const sections = useFrozenPreSelection<OptionData>(baseSections, {
        initialSelectedValues: initialAccountIDs,
        // Wait for hydration so a toggled row isn't mistaken for pre-selection.
        canCapture: areOptionsInitialized && hasAttemptedHydration,
        shouldRenderPinned: matchesSearchTerm,
    });

    const noResultsFound = areOptionsInitialized && sections.every((section) => section.data.length === 0);
    const headerMessage = noResultsFound ? translate('common.noResultsFound') : undefined;

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
