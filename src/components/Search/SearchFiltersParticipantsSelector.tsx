import React, {useCallback, useEffect, useMemo} from 'react';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import UserSelectionListItem from '@components/SelectionList/ListItem/UserSelectionListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrivateIsArchivedMap from '@hooks/usePrivateIsArchivedMap';
import useReportAttributes from '@hooks/useReportAttributes';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useSearchSelector from '@hooks/useSearchSelector';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {formatSectionsFromSearchTerm, getFilteredRecentAttendees, getParticipantsOption} from '@libs/OptionsListUtils';
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
        // eslint-disable-next-line rulesdir/no-default-id-values
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
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});
    const reportAttributesDerived = useReportAttributes();
    const privateIsArchivedMap = usePrivateIsArchivedMap();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserPersonalDetails.accountID;
    const currentUserEmail = currentUserPersonalDetails.email ?? '';
    const [recentAttendees] = useOnyx(ONYXKEYS.NVP_RECENT_ATTENDEES);

    // Transform raw recentAttendees into Option[] format for use with getValidOptions (only for attendee filter)
    const recentAttendeeLists = useMemo(
        () => (shouldAllowNameOnlyOptions ? getFilteredRecentAttendees(personalDetails, [], recentAttendees ?? [], currentUserEmail, currentUserAccountID) : []),
        [personalDetails, recentAttendees, currentUserEmail, currentUserAccountID, shouldAllowNameOnlyOptions],
    );

    const {searchTerm, setSearchTerm, availableOptions, selectedOptions, setSelectedOptions, toggleSelection, areOptionsInitialized, onListEndReached} = useSearchSelector({
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
    });

    const {sections, headerMessage} = useMemo(() => {
        const newSections = [];
        if (!areOptionsInitialized) {
            return {sections: [], headerMessage: undefined};
        }

        const chatOptions = {...availableOptions};
        const currentUserOption = chatOptions.currentUserOption;

        // Ensure current user is not in personalDetails when they should be excluded
        if (currentUserOption) {
            chatOptions.personalDetails = chatOptions.personalDetails.filter((detail) => detail.accountID !== currentUserOption.accountID);
        }

        const formattedResults = formatSectionsFromSearchTerm(
            searchTerm.trim().toLowerCase(),
            selectedOptions,
            chatOptions.recentReports,
            chatOptions.personalDetails,
            privateIsArchivedMap,
            currentUserAccountID,
            personalDetails,
            true,
            undefined,
            reportAttributesDerived,
        );
        const selectedCurrentUser = formattedResults.section.data.find((option) => option.accountID === chatOptions.currentUserOption?.accountID);

        // If the current user is already selected, remove them from the recent reports and personal details
        if (selectedCurrentUser) {
            chatOptions.recentReports = chatOptions.recentReports.filter((report) => report.accountID !== selectedCurrentUser.accountID);
            chatOptions.personalDetails = chatOptions.personalDetails.filter((detail) => detail.accountID !== selectedCurrentUser.accountID);
        }

        // If the current user is not selected, add them to the top of the list
        if (!selectedCurrentUser && chatOptions.currentUserOption) {
            const formattedName = getDisplayNameForParticipant({
                accountID: chatOptions.currentUserOption.accountID,
                shouldAddCurrentUserPostfix: true,
                personalDetailsData: personalDetails,
                formatPhoneNumber,
            });
            chatOptions.currentUserOption.text = formattedName;

            newSections.push({
                title: '',
                data: [chatOptions.currentUserOption],
                sectionIndex: 0,
            });
        }

        newSections.push({
            ...formattedResults.section,
            data: formattedResults.section.data.map((option) => ({...option, isSelected: true})) as OptionData[],
        });

        // Filter current user from recentReports to avoid duplicate with currentUserOption section
        // Only filter if both the report and currentUserOption have valid accountIDs to avoid
        // accidentally filtering out name-only attendees (which have accountID: undefined)
        const filteredRecentReports = chatOptions.recentReports.filter(
            (report) => !report.accountID || !chatOptions.currentUserOption?.accountID || report.accountID !== chatOptions.currentUserOption.accountID,
        );

        newSections.push({
            title: '',
            data: filteredRecentReports,
            sectionIndex: 1,
        });

        newSections.push({
            title: '',
            data: chatOptions.personalDetails,
            sectionIndex: 2,
        });

        const noResultsFound = chatOptions.personalDetails.length === 0 && chatOptions.recentReports.length === 0 && !chatOptions.currentUserOption;
        const message = noResultsFound ? translate('common.noResultsFound') : undefined;

        return {
            sections: newSections,
            headerMessage: message,
        };
    }, [
        areOptionsInitialized,
        availableOptions,
        searchTerm,
        selectedOptions,
        privateIsArchivedMap,
        currentUserAccountID,
        personalDetails,
        reportAttributesDerived,
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
                        // eslint-disable-next-line rulesdir/no-default-id-values
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
            onSelectRow={handleParticipantSelection}
            isLoadingNewOptions={isLoadingNewOptions}
            shouldShowLoadingPlaceholder={shouldShowLoadingPlaceholder}
            canSelectMultiple
            onEndReached={onListEndReached}
        />
    );
}

export default SearchFiltersParticipantsSelector;
