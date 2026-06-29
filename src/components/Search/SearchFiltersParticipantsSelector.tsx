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
import {getExpensifyTeamExclusions} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import {getDisplayNameForParticipant} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Attendee} from '@src/types/onyx/IOU';
import SearchFilterPageFooterButtons from './SearchFilterPageFooterButtons';

// Builds an OptionData row for a name-only attendee — one without a real accountID in personalDetails.
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
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    // Only the attendee filter feeds recentAttendees into the picker; other filters use empty list.
    const recentAttendeeLists = shouldAllowNameOnlyOptions ? getFilteredRecentAttendees(personalDetails, [], recentAttendees ?? [], currentUserEmail, currentUserAccountID) : [];

    const expensifyTeamExclusions = getExpensifyTeamExclusions(personalDetails, allPolicies, currentUserEmail);

    const {searchTerm, debouncedSearchTerm, setSearchTerm, availableOptions, selectedOptions, setSelectedOptions, toggleSelection, areOptionsInitialized, onListEndReached} =
        useSearchSelector({
            selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
            searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
            includeUserToInvite: true,
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            excludeFromSuggestionsOnly: expensifyTeamExclusions,
            includeRecentReports: true,
            shouldInitialize: didScreenTransitionEnd,
            includeCurrentUser: true,
            recentAttendees: recentAttendeeLists,
            shouldAllowNameOnlyOptions,
            shouldKeepSelectedInAvailableOptions: true,
        });

    // Flip to true once the hydration effect runs. Without this, a stale `initialAccountIDs` could let
    // the pinning snapshot fire on the first toggled row and pin it by mistake.
    const [hasAttemptedHydration, setHasAttemptedHydration] = useState(initialAccountIDs.length === 0);

    const trimmedSearchTerm = debouncedSearchTerm.trim().toLowerCase();
    const matchesSearchTerm = (option: OptionData) => !trimmedSearchTerm || doesPersonalDetailMatchSearchTerm(option, currentUserAccountID ?? CONST.DEFAULT_NUMBER_ID, trimmedSearchTerm);

    const currentUserOption = areOptionsInitialized ? availableOptions.currentUserOption : null;
    const isCurrentUserSelected = !!currentUserAccountID && selectedOptions.some((option) => option.accountID === currentUserAccountID);

    // Hide the current user from Recents / Contacts — they get their own row (or get pinned at the top).
    const recentReportsWithoutCurrentUser =
        areOptionsInitialized && currentUserOption?.accountID
            ? availableOptions.recentReports.filter((report) => report.accountID !== currentUserOption.accountID)
            : (availableOptions.recentReports ?? []);
    const personalDetailsWithoutCurrentUser =
        areOptionsInitialized && currentUserOption?.accountID
            ? availableOptions.personalDetails.filter((detail) => detail.accountID !== currentUserOption.accountID)
            : (availableOptions.personalDetails ?? []);

    // Selected items not visible in Recents / Contacts and not the current user — show them in a section above, but only if they match the search term.
    // Dedupe by accountID for real users and by login for name-only attendees (which all share DEFAULT_NUMBER_ID).
    const visibleAccountIDs = new Set<number>(
        [...personalDetailsWithoutCurrentUser, ...recentReportsWithoutCurrentUser].map((option) => option.accountID).filter((id): id is number => !!id && id !== CONST.DEFAULT_NUMBER_ID),
    );
    const visibleLogins = new Set([...personalDetailsWithoutCurrentUser.map((detail) => detail.login), ...recentReportsWithoutCurrentUser.map((report) => report.login)].filter(Boolean));
    const extraSelectedOptions = selectedOptions.filter(
        (option) =>
            option.accountID !== currentUserAccountID &&
            !(!!option.accountID && option.accountID !== CONST.DEFAULT_NUMBER_ID && visibleAccountIDs.has(option.accountID)) &&
            !(!!option.login && visibleLogins.has(option.login)) &&
            matchesSearchTerm(option),
    );

    // Current user row with the "(you)" suffix. Falls back to personalDetails when pagination drops them from availableOptions.
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

    // `initialAccountIDs` holds accountIDs (or displayName / login for name-only attendees), but for any
    // contact with a 1:1 DM, the default `keyForList` is the reportID. Use an explicit getKey so the hook
    // matches on the right identifier.
    const getKey = (option: OptionData) => {
        if (shouldAllowNameOnlyOptions) {
            if (option.accountID && option.accountID !== CONST.DEFAULT_NUMBER_ID && personalDetails?.[option.accountID]) {
                return option.accountID.toString();
            }
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- need || to handle empty string
            return option.displayName || option.login;
        }
        return option.accountID ? option.accountID.toString() : undefined;
    };

    // The list is lazy-loaded, so pinned rows aren't always present in baseSections — the hook keeps them
    // from the snapshot. Pass `matchesSearchTerm` so the pinned section still respects the search term.
    const sections = useFrozenPreSelection<OptionData>(baseSections, {
        initialSelectedValues: initialAccountIDs,
        // Wait for hydration so a toggled row isn't mistaken for a pre-selection.
        canCapture: areOptionsInitialized && hasAttemptedHydration,
        shouldRenderPinned: matchesSearchTerm,
        getKey,
    });

    const noResultsFound = areOptionsInitialized && sections.every((section) => section.data.length === 0);
    const headerMessage = noResultsFound ? translate('common.noResultsFound') : undefined;

    const resetChanges = () => {
        setSelectedOptions([]);
    };

    const applyChanges = () => {
        const selectedIdentifiers = selectedOptions.map(getKey).filter(Boolean) as string[];
        onFiltersUpdate(selectedIdentifiers);
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    };

    // Hydrate selectedOptions from initialAccountIDs (or displayNames for the attendee filter).
    useEffect(() => {
        if (!initialAccountIDs || initialAccountIDs.length === 0 || !personalDetails) {
            return;
        }

        let preSelectedOptions: OptionData[];

        if (shouldAllowNameOnlyOptions) {
            preSelectedOptions = initialAccountIDs
                .map((identifier) => {
                    // Look up the identifier as an accountID first.
                    const participant = personalDetails[identifier];
                    if (participant) {
                        const optionData = {
                            ...getParticipantsOption(participant, personalDetails),
                            isSelected: true,
                        };
                        return optionData as OptionData;
                    }

                    // Fall back to a name-only attendee match (by displayName or email).
                    const attendee = recentAttendees?.find((recentAttendee) => recentAttendee.displayName === identifier || recentAttendee.email === identifier);
                    if (attendee) {
                        return getOptionDataFromAttendee(attendee);
                    }

                    // Last resort: build a minimal option from the identifier so name-only filters survive
                    // a cache clear or a switch to another device.
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
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot flag the pinning snapshot waits on; derivable state doesn't work because hydration can resolve to an empty array.
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
