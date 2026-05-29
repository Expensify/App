import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import UserSelectionListItem from '@components/SelectionList/ListItem/UserSelectionListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
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

    // Frozen snapshot of pre-selected options captured on the first render where options are
    // initialized and the combined Recents + Contacts list is long enough to warrant pinning
    // pre-selected items at the top so they're not lost in a long list. `null` means we haven't
    // captured yet; an empty array means we evaluated and chose not to pin. Captured during
    // render (per React's "set state during render" pattern) so the snapshot is taken at the
    // same render where data first becomes available.
    const [frozenSelectedOptions, setFrozenSelectedOptions] = useState<OptionData[] | null>(null);
    if (
        frozenSelectedOptions === null &&
        areOptionsInitialized &&
        // Wait until pre-selected options have been hydrated from initialAccountIDs before capturing.
        (initialAccountIDs.length === 0 || selectedOptions.length > 0)
    ) {
        const totalVisible = availableOptions.recentReports.length + availableOptions.personalDetails.length;
        setFrozenSelectedOptions(totalVisible >= CONST.STANDARD_LIST_ITEM_LIMIT ? selectedOptions : []);
    }

    const {sections, headerMessage} = useMemo(() => {
        const newSections = [];
        if (!areOptionsInitialized) {
            return {sections: [], headerMessage: undefined};
        }

        const chatOptions = {...availableOptions};
        const currentUserOption = chatOptions.currentUserOption;

        // Ensure current user is not in personalDetails or recentReports to avoid duplication
        // with the dedicated currentUserOption section shown below.
        if (currentUserOption?.accountID) {
            chatOptions.personalDetails = chatOptions.personalDetails.filter((detail) => detail.accountID !== currentUserOption.accountID);
            chatOptions.recentReports = chatOptions.recentReports.filter((report) => report.accountID !== currentUserOption.accountID);
        }

        // Build the frozen "pre-selected" top section. Items keep their original position; their
        // `isSelected` flag tracks the current selection so toggling them in place updates the
        // checkmark without moving the row. The set used to dedupe Recents / Contacts is built
        // from the unfiltered snapshot so rows hidden by the current search term still don't
        // duplicate into the lists below.
        const frozenAccountIDs = new Set((frozenSelectedOptions ?? []).map((option) => option.accountID).filter((id): id is number => !!id && id !== CONST.DEFAULT_NUMBER_ID));
        const frozenLogins = new Set((frozenSelectedOptions ?? []).map((option) => option.login).filter((login): login is string => !!login));
        const isOptionFrozen = (option: Pick<OptionData, 'accountID' | 'login'>) =>
            (!!option.accountID && option.accountID !== CONST.DEFAULT_NUMBER_ID && frozenAccountIDs.has(option.accountID)) || (!!option.login && frozenLogins.has(option.login));

        const trimmedSearchTerm = debouncedSearchTerm.trim().toLowerCase();
        const matchesSearchTerm = (option: OptionData) => !trimmedSearchTerm || doesPersonalDetailMatchSearchTerm(option, option.accountID ?? CONST.DEFAULT_NUMBER_ID, trimmedSearchTerm);

        const frozenSection = (frozenSelectedOptions ?? [])
            .filter((option) => matchesSearchTerm(option))
            .map((option) => {
                const isSelected = selectedOptions.some(
                    (selected) =>
                        (!!selected.accountID && selected.accountID !== CONST.DEFAULT_NUMBER_ID && selected.accountID === option.accountID) ||
                        (!!selected.login && selected.login === option.login),
                );
                return {...option, isSelected};
            });
        if (frozenSection.length > 0) {
            newSections.push({
                title: '',
                data: frozenSection,
                sectionIndex: 0,
            });
        }

        // Selected options that aren't in the frozen section, current user section, or visible
        // Recents / Contacts sections (e.g. name-only attendees for the attendee filter). Show
        // them in a dedicated section so they remain visible when selected. Filtered by the
        // current search term so they don't appear when the user types something that doesn't
        // match.
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

        // Show the current user below the frozen and extra-selected sections, but above
        // Recents / Contacts. Falls back to creating from personal details to handle pagination
        // edge cases. The current user is skipped here if they were already pinned in the
        // frozen section above.
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

        // Filter frozen items out of Recents and Contacts to avoid duplication with the top section.
        const recentReports = frozenSection.length > 0 ? chatOptions.recentReports.filter((report) => !isOptionFrozen(report)) : chatOptions.recentReports;
        const contacts = frozenSection.length > 0 ? chatOptions.personalDetails.filter((detail) => !isOptionFrozen(detail)) : chatOptions.personalDetails;

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
    }, [areOptionsInitialized, availableOptions, debouncedSearchTerm, selectedOptions, frozenSelectedOptions, currentUserAccountID, personalDetails, translate, formatPhoneNumber]);

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
