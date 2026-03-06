import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import UserSelectionListItem from '@components/SelectionList/ListItem/UserSelectionListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportAttributes from '@hooks/useReportAttributes';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import memoize from '@libs/memoize';
import {filterAndOrderOptions, filterSelectedOptions, formatSectionsFromSearchTerm, getFilteredRecentAttendees, getValidOptions} from '@libs/OptionsListUtils';
import {getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import type {Option} from '@libs/OptionsListUtils';
import type {SelectionListSections} from '@libs/OptionsListUtils/types';
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
    const reportID = option.reportID ?? '-1';
    return {...option, selected: true, reportID, keyForList: option.keyForList ?? reportID};
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

    /** Whether to scope personal details to workspace members only and allow free text email input */
    shouldScopeToWorkspaceMembers?: boolean;
};

function SearchFiltersParticipantsSelector({
    initialAccountIDs,
    onFiltersUpdate,
    shouldAllowNameOnlyOptions = false,
    shouldScopeToWorkspaceMembers = false,
}: SearchFiltersParticipantsSelectorProps) {
    const {translate, formatPhoneNumber} = useLocalize();
    const personalDetails = usePersonalDetails();
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();
    const {options, areOptionsInitialized} = useOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});
    const reportAttributesDerived = useReportAttributes();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserPersonalDetails.accountID;
    const currentUserEmail = currentUserPersonalDetails.email ?? '';
    const [selectedOptions, setSelectedOptions] = useState<OptionData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const cleanSearchTerm = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);
    const [draftComments] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT);
    const [nvpDismissedProductTraining] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [recentAttendees] = useOnyx(ONYXKEYS.NVP_RECENT_ATTENDEES);

    // Transform raw recentAttendees into Option[] format for use with getValidOptions (only for attendee filter)
    const recentAttendeeLists = useMemo(
        () => (shouldAllowNameOnlyOptions ? getFilteredRecentAttendees(personalDetails, [], recentAttendees ?? [], currentUserEmail, currentUserAccountID) : []),
        [personalDetails, recentAttendees, currentUserEmail, currentUserAccountID, shouldAllowNameOnlyOptions],
    );

    // Collect all workspace member accountIDs across the user's policies to scope the filter suggestions
    const workspaceMemberAccountIDs = useMemo(() => {
        if (!shouldScopeToWorkspaceMembers || !allPolicies) {
            return undefined;
        }
        const memberIDs = new Set<number>();
        for (const policy of Object.values(allPolicies)) {
            if (!policy?.employeeList) {
                continue;
            }
            const members = getMemberAccountIDsForWorkspace(policy.employeeList);
            for (const accountID of Object.values(members)) {
                memberIDs.add(accountID);
            }
        }
        memberIDs.add(currentUserAccountID);
        return memberIDs;
    }, [shouldScopeToWorkspaceMembers, allPolicies, currentUserAccountID]);

    const allowFreeTextInput = shouldAllowNameOnlyOptions || shouldScopeToWorkspaceMembers;

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
            currentUserAccountID,
            currentUserEmail,
            {
                excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
                includeCurrentUser: true,
                shouldAcceptName: allowFreeTextInput,
                includeUserToInvite: allowFreeTextInput,
                recentAttendees: recentAttendeeLists,
                includeRecentReports: !allowFreeTextInput,
                personalDetails,
                countryCode,
            },
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
        allowFreeTextInput,
        personalDetails,
        currentUserAccountID,
        currentUserEmail,
    ]);

    // When shouldScopeToWorkspaceMembers is true, filter personalDetails to only workspace members
    const scopedDefaultOptions = useMemo(() => {
        if (!workspaceMemberAccountIDs) {
            return defaultOptions;
        }
        return {
            ...defaultOptions,
            personalDetails: defaultOptions.personalDetails.filter((pd) => pd.accountID && workspaceMemberAccountIDs.has(pd.accountID)),
        };
    }, [defaultOptions, workspaceMemberAccountIDs]);

    const unselectedOptions = useMemo(() => {
        if (!allowFreeTextInput) {
            return filterSelectedOptions(scopedDefaultOptions, new Set(selectedOptions.map((option) => option.accountID)));
        }

        // For free text input, filter by both accountID (for regular users) AND login (for name-only entries)
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
            ...scopedDefaultOptions,
            personalDetails: scopedDefaultOptions.personalDetails.filter((option) => !isSelected(option)),
            recentReports: scopedDefaultOptions.recentReports.filter((option) => !isSelected(option)),
        };
    }, [scopedDefaultOptions, selectedOptions, allowFreeTextInput]);

    const chatOptions = useMemo(() => {
        const filteredOptions = filterAndOrderOptions(unselectedOptions, cleanSearchTerm, countryCode, loginList, currentUserEmail, currentUserAccountID, personalDetails, {
            selectedOptions,
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
            canInviteUser: allowFreeTextInput,
            shouldAcceptName: allowFreeTextInput,
            searchInputValue: searchTerm,
        });

        const {currentUserOption} = unselectedOptions;

        // Ensure current user is not in personalDetails when they should be excluded
        if (currentUserOption) {
            filteredOptions.personalDetails = filteredOptions.personalDetails.filter((detail) => detail.accountID !== currentUserOption.accountID);
        }

        return filteredOptions;
    }, [unselectedOptions, cleanSearchTerm, countryCode, loginList, selectedOptions, allowFreeTextInput, searchTerm, currentUserEmail, currentUserAccountID, personalDetails]);

    const {sections, headerMessage} = useMemo(() => {
        const newSections: SelectionListSections = [];
        if (!areOptionsInitialized) {
            return {sections: [], headerMessage: undefined};
        }

        const formattedResults = formatSectionsFromSearchTerm(
            cleanSearchTerm,
            selectedOptions,
            chatOptions.recentReports,
            chatOptions.personalDetails,
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
                data: [chatOptions.currentUserOption],
                sectionIndex: 0,
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
            data: filteredRecentReports,
            sectionIndex: 1,
        });

        newSections.push({
            data: chatOptions.personalDetails,
            sectionIndex: 2,
        });

        // When free text input is enabled, show the userToInvite option so users can type arbitrary emails
        if (allowFreeTextInput && chatOptions.userToInvite) {
            newSections.push({
                data: [chatOptions.userToInvite],
                sectionIndex: 3,
            });
        }

        const noResultsFound =
            chatOptions.personalDetails.length === 0 && chatOptions.recentReports.length === 0 && !chatOptions.currentUserOption && !chatOptions.userToInvite;
        const message = noResultsFound ? translate('common.noResultsFound') : undefined;

        return {
            sections: newSections,
            headerMessage: message,
        };
    }, [areOptionsInitialized, cleanSearchTerm, selectedOptions, chatOptions, personalDetails, reportAttributesDerived, translate, formatPhoneNumber, currentUserAccountID, allowFreeTextInput]);

    const resetChanges = useCallback(() => {
        setSelectedOptions([]);
    }, []);

    const applyChanges = useCallback(() => {
        let selectedIdentifiers: string[];

        if (allowFreeTextInput) {
            selectedIdentifiers = selectedOptions
                .map((option) => {
                    // For real users (with valid accountID in personalDetails), use accountID
                    if (option.accountID && option.accountID !== CONST.DEFAULT_NUMBER_ID && personalDetails?.[option.accountID]) {
                        return option.accountID.toString();
                    }

                    // For free text entries, use displayName or login as identifier
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- need || to handle empty string
                    return option.displayName || option.login;
                })
                .filter(Boolean) as string[];
        } else {
            selectedIdentifiers = selectedOptions.map((option) => (option.accountID ? option.accountID.toString() : undefined)).filter(Boolean) as string[];
        }

        onFiltersUpdate(selectedIdentifiers);
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    }, [onFiltersUpdate, selectedOptions, personalDetails, allowFreeTextInput]);

    // This effect handles setting initial selectedOptions based on accountIDs (or displayNames/emails for free text filters)
    useEffect(() => {
        if (!initialAccountIDs || initialAccountIDs.length === 0 || !personalDetails) {
            return;
        }

        let preSelectedOptions: OptionData[];

        if (allowFreeTextInput) {
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
                    // free text filters across sessions (e.g., after cache clear or on another device)
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
    }, [initialAccountIDs, personalDetails, recentAttendees, allowFreeTextInput]);

    const handleParticipantSelection = useCallback(
        (option: Option) => {
            const foundOptionIndex = selectedOptions.findIndex((selectedOption: Option) => {
                if (allowFreeTextInput) {
                    // Match by accountID for real users (excluding DEFAULT_NUMBER_ID which is 0)
                    if (selectedOption.accountID && selectedOption.accountID !== CONST.DEFAULT_NUMBER_ID && selectedOption.accountID === option?.accountID) {
                        return true;
                    }

                    // Skip reportID match for default '-1' value (used by free text entries)
                    if (selectedOption.reportID && selectedOption.reportID !== '-1' && selectedOption.reportID === option?.reportID) {
                        return true;
                    }

                    // Match by login for free text entries
                    if (selectedOption.login && selectedOption.login === option?.login) {
                        return true;
                    }

                    return false;
                }

                // For non-free-text filters, use simple accountID and reportID matching
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
        [selectedOptions, allowFreeTextInput],
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
            label: translate('common.search'),
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
        />
    );
}

export default SearchFiltersParticipantsSelector;
