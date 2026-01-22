import reportsSelector from '@selectors/Attributes';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
// eslint-disable-next-line no-restricted-imports
import SelectionList from '@components/SelectionListWithSections';
import UserSelectionListItem from '@components/SelectionListWithSections/Search/UserSelectionListItem';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrivateIsArchivedMap from '@hooks/usePrivateIsArchivedMap';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import memoize from '@libs/memoize';
import {filterAndOrderOptions, filterSelectedOptions, formatSectionsFromSearchTerm, getFilteredRecentAttendees, getValidOptions} from '@libs/OptionsListUtils';
import type {Option, Section} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import {getDisplayNameForParticipant} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Attendee} from '@src/types/onyx/IOU';
import SearchFilterPageFooterButtons from './SearchFilterPageFooterButtons';

const defaultListOptions = {
    userToInvite: null,
    recentReports: [],
    personalDetails: [],
    currentUserOption: null,
    headerMessage: '',
};

const memoizedGetValidOptions = memoize(getValidOptions, {maxSize: 5, monitoringName: 'SearchFiltersParticipantsSelector.getValidOptions'});

function getSelectedOptionData(option: Option): OptionData {
    // eslint-disable-next-line rulesdir/no-default-id-values
    return {...option, selected: true, reportID: option.reportID ?? '-1'};
}

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
    const {options, areOptionsInitialized} = useOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {canBeMissing: false, initWithStoredValues: false});
    const [reportAttributesDerived] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {canBeMissing: true, selector: reportsSelector});
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});
    const [selectedOptions, setSelectedOptions] = useState<OptionData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const cleanSearchTerm = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);
    const [draftComments] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, {canBeMissing: true});
    const [nvpDismissedProductTraining] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {canBeMissing: true});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [recentAttendees] = useOnyx(ONYXKEYS.NVP_RECENT_ATTENDEES, {canBeMissing: true});
    const privateIsArchivedMap = usePrivateIsArchivedMap();

    // Transform raw recentAttendees into Option[] format for use with getValidOptions (only for attendee filter)
    const recentAttendeeLists = useMemo(
        () => (shouldAllowNameOnlyOptions ? getFilteredRecentAttendees(personalDetails, [], recentAttendees ?? []) : []),
        [personalDetails, recentAttendees, shouldAllowNameOnlyOptions],
    );

    const defaultOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return defaultListOptions;
        }

        return memoizedGetValidOptions(
            {
                reports: options.reports,
                personalDetails: options.personalDetails,
            },
            allPolicies,
            draftComments,
            nvpDismissedProductTraining,
            loginList,
            {
                excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
                includeCurrentUser: true,
                shouldAcceptName: shouldAllowNameOnlyOptions,
                includeUserToInvite: shouldAllowNameOnlyOptions,
                recentAttendees: recentAttendeeLists,
                includeRecentReports: false,
            },
            countryCode,
        );
    }, [
        areOptionsInitialized,
        options.reports,
        options.personalDetails,
        allPolicies,
        draftComments,
        nvpDismissedProductTraining,
        loginList,
        countryCode,
        recentAttendeeLists,
        shouldAllowNameOnlyOptions,
    ]);

    const unselectedOptions = useMemo(() => {
        if (!shouldAllowNameOnlyOptions) {
            return filterSelectedOptions(defaultOptions, new Set(selectedOptions.map((option) => option.accountID)));
        }

        // For name-only options, filter by both accountID (for regular users) AND login (for name-only attendees)
        const selectedAccountIDs = new Set(selectedOptions.map((option) => option.accountID).filter((id): id is number => !!id && id !== CONST.DEFAULT_NUMBER_ID));
        const selectedLogins = new Set(selectedOptions.map((option) => option.login).filter((login): login is string => !!login));

        const isSelected = (option: {accountID?: number; login?: string}) => {
            if (option.accountID && option.accountID !== CONST.DEFAULT_NUMBER_ID && selectedAccountIDs.has(option.accountID)) {
                return true;
            }
            if (option.login && selectedLogins.has(option.login)) {
                return true;
            }
            return false;
        };

        return {
            ...defaultOptions,
            personalDetails: defaultOptions.personalDetails.filter((option) => !isSelected(option)),
            recentReports: defaultOptions.recentReports.filter((option) => !isSelected(option)),
        };
    }, [defaultOptions, selectedOptions, shouldAllowNameOnlyOptions]);

    const chatOptions = useMemo(() => {
        const filteredOptions = filterAndOrderOptions(unselectedOptions, cleanSearchTerm, countryCode, loginList, {
            selectedOptions,
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
            canInviteUser: shouldAllowNameOnlyOptions,
            shouldAcceptName: shouldAllowNameOnlyOptions,
        });

        const {currentUserOption} = unselectedOptions;

        // Ensure current user is not in personalDetails when they should be excluded
        if (currentUserOption) {
            filteredOptions.personalDetails = filteredOptions.personalDetails.filter((detail) => detail.accountID !== currentUserOption.accountID);
        }

        return filteredOptions;
    }, [unselectedOptions, cleanSearchTerm, countryCode, loginList, selectedOptions, shouldAllowNameOnlyOptions]);

    const {sections, headerMessage} = useMemo(() => {
        const newSections: Section[] = [];
        if (!areOptionsInitialized) {
            return {sections: [], headerMessage: undefined};
        }

        const formattedResults = formatSectionsFromSearchTerm(
            cleanSearchTerm,
            selectedOptions,
            chatOptions.recentReports,
            chatOptions.personalDetails,
            privateIsArchivedMap[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${selectedOptions.at(0)?.reportID}`],
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
                shouldShow: true,
            });
        }

        newSections.push(formattedResults.section);

        // Filter current user from recentReports to avoid duplicate with currentUserOption section
        // Only filter if both the report and currentUserOption have valid accountIDs to avoid
        // accidentally filtering out name-only attendees (which have accountID: undefined)
        const filteredRecentReports = chatOptions.recentReports.filter(
            (report) => !report.accountID || !chatOptions.currentUserOption?.accountID || report.accountID !== chatOptions.currentUserOption.accountID,
        );

        newSections.push({
            title: '',
            data: filteredRecentReports,
            shouldShow: filteredRecentReports.length > 0,
        });

        newSections.push({
            title: '',
            data: chatOptions.personalDetails,
            shouldShow: chatOptions.personalDetails.length > 0,
        });

        const noResultsFound = chatOptions.personalDetails.length === 0 && chatOptions.recentReports.length === 0 && !chatOptions.currentUserOption;
        const message = noResultsFound ? translate('common.noResultsFound') : undefined;

        return {
            sections: newSections,
            headerMessage: message,
        };
    }, [areOptionsInitialized, cleanSearchTerm, selectedOptions, chatOptions, personalDetails, reportAttributesDerived, translate, formatPhoneNumber, privateIsArchivedMap]);

    const resetChanges = useCallback(() => {
        setSelectedOptions([]);
    }, []);

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
                        return getSelectedOptionData(participant);
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
                    return getSelectedOptionData(participant);
                })
                .filter((option): option is NonNullable<OptionData> => !!option);
        }

        setSelectedOptions(preSelectedOptions);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- this should react only to changes in form data
    }, [initialAccountIDs, personalDetails, recentAttendees, shouldAllowNameOnlyOptions]);

    const handleParticipantSelection = useCallback(
        (option: Option) => {
            const foundOptionIndex = selectedOptions.findIndex((selectedOption: Option) => {
                if (shouldAllowNameOnlyOptions) {
                    // Match by accountID for real users (excluding DEFAULT_NUMBER_ID which is 0)
                    if (selectedOption.accountID && selectedOption.accountID !== CONST.DEFAULT_NUMBER_ID && selectedOption.accountID === option?.accountID) {
                        return true;
                    }

                    // Skip reportID match for default '-1' value (used by name-only attendees)
                    if (selectedOption.reportID && selectedOption.reportID !== '-1' && selectedOption.reportID === option?.reportID) {
                        return true;
                    }

                    // Match by login for name-only attendees
                    if (selectedOption.login && selectedOption.login === option?.login) {
                        return true;
                    }

                    return false;
                }

                // For non-name-only filters, use simple accountID and reportID matching
                if (selectedOption.accountID && selectedOption.accountID === option?.accountID) {
                    return true;
                }

                if (selectedOption.reportID && selectedOption.reportID === option?.reportID) {
                    return true;
                }

                return false;
            });

            if (foundOptionIndex < 0) {
                setSelectedOptions([...selectedOptions, getSelectedOptionData(option)]);
            } else {
                const newSelectedOptions = [...selectedOptions.slice(0, foundOptionIndex), ...selectedOptions.slice(foundOptionIndex + 1)];
                setSelectedOptions(newSelectedOptions);
            }
        },
        [selectedOptions, shouldAllowNameOnlyOptions],
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
    const showLoadingPlaceholder = !didScreenTransitionEnd || !areOptionsInitialized || !initialAccountIDs || !personalDetails;

    return (
        <SelectionList
            canSelectMultiple
            sections={sections}
            ListItem={UserSelectionListItem}
            textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
            headerMessage={headerMessage}
            textInputValue={searchTerm}
            footerContent={footerContent}
            showScrollIndicator
            shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
            onChangeText={(value) => {
                setSearchTerm(value);
            }}
            onSelectRow={handleParticipantSelection}
            isLoadingNewOptions={isLoadingNewOptions}
            showLoadingPlaceholder={showLoadingPlaceholder}
        />
    );
}

export default SearchFiltersParticipantsSelector;
