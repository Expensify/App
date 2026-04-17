import passthroughPolicyTagListSelector from '@selectors/PolicyTagList';
import {useCallback, useMemo, useState} from 'react';
import type {PermissionStatus} from 'react-native-permissions';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import type {GetOptionsConfig, Option, Options, SearchOption} from '@libs/OptionsListUtils';
import {getEmptyOptions, getSearchOptions, getSearchValueForPhoneOrEmail, getValidOptions} from '@libs/OptionsListUtils';
import {getPersonalDetailSearchTerms} from '@libs/OptionsListUtils/searchMatchUtils';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDebounce from './useDebounce';
import useDebouncedState from './useDebouncedState';
import useOnyx from './useOnyx';
import useSortedActions from './useSortedActions';

type SearchSelectorContext = (typeof CONST.SEARCH_SELECTOR)[keyof Pick<
    typeof CONST.SEARCH_SELECTOR,
    'SEARCH_CONTEXT_GENERAL' | 'SEARCH_CONTEXT_SEARCH' | 'SEARCH_CONTEXT_MEMBER_INVITE' | 'SEARCH_CONTEXT_SHARE_DESTINATION' | 'SEARCH_CONTEXT_ATTENDEES'
>];
type SearchSelectorSelectionMode = (typeof CONST.SEARCH_SELECTOR)[keyof Pick<typeof CONST.SEARCH_SELECTOR, 'SELECTION_MODE_SINGLE' | 'SELECTION_MODE_MULTI'>];

type UseSearchSelectorConfig = {
    /** Selection mode - single or multiple selection */
    selectionMode: SearchSelectorSelectionMode;

    /** Maximum number of results to return (for heap optimization) */
    maxResultsPerPage?: number;

    /** How many recent reports should be returned? The rest count from maxResultsPerPage will be with contacts. null value means no limit */
    maxRecentReportsToShow?: number;

    /** What is the context that we are using this hook for */
    searchContext?: SearchSelectorContext;

    /** Whether to include user to invite option */
    includeUserToInvite?: boolean;

    /** Logins to exclude from results (hard exclusions - cannot be selected at all) */
    excludeLogins?: Record<string, boolean>;

    /** Logins to exclude from suggestions only (soft exclusions - can still be manually entered) */
    excludeFromSuggestionsOnly?: Record<string, boolean>;

    /** Whether to include recent reports (for getMemberInviteOptions) */
    includeRecentReports?: boolean;

    /** Whether to include current user */
    includeCurrentUser?: boolean;

    /** Enable phone contacts integration */
    enablePhoneContacts?: boolean;

    /** Whether to include self DM */
    includeSelfDM?: boolean;

    /** Additional configuration for getValidOptions function */
    getValidOptionsConfig?: Partial<GetOptionsConfig>;

    /** Callback when selection changes (multi-select mode) */
    onSelectionChange?: (selected: OptionData[]) => void;

    /** Callback when single option is selected (single-select mode) */
    onSingleSelect?: (option: OptionData) => void;

    /** Initial selected options */
    initialSelected?: OptionData[];

    /** Whether to initialize the hook */
    shouldInitialize?: boolean;

    /** Additional contact options to merge (used by platform-specific implementations) */
    contactOptions?: Array<SearchOption<OnyxTypes.PersonalDetails>>;

    /** Whether to filter with recent attendees */
    recentAttendees?: Array<Partial<OptionData>>;

    /** Whether to allow name-only options */
    shouldAllowNameOnlyOptions?: boolean;
};

type ContactState = {
    /** Current permission status */
    permissionStatus: PermissionStatus;

    /** Contact options from device */
    contactOptions: Array<SearchOption<OnyxTypes.PersonalDetails>>;

    /** Whether to show import UI */
    showImportUI: boolean;

    /** Function to trigger contact import */
    importContacts: () => void;

    /** Function to initiate contact import and set state */
    initiateContactImportAndSetState: () => void;

    /** Function to set permission state */
    setContactPermissionState: (status: PermissionStatus) => void;
};

type UseSearchSelectorReturn = {
    /** Current search term */
    searchTerm: string;

    /** Debounced search term */
    debouncedSearchTerm: string;

    /** Function to update search term */
    setSearchTerm: (value: string) => void;

    /** Filtered and optimized search options with selection state */
    searchOptions: Options;

    /** Available (unselected) options */
    availableOptions: Options;

    /** Currently selected options. This returns all selected options and are not affected by search term */
    selectedOptions: OptionData[];

    /** Currently selected options used for list display. This prop can be used in selection list to display selected options that are filtered by search term */
    selectedOptionsForDisplay: OptionData[];

    /** Function to set selected options */
    setSelectedOptions: (options: OptionData[]) => void;

    /** Function to toggle selection state of an option */
    toggleSelection: (option: OptionData) => void;

    /** Whether options are initialized */
    areOptionsInitialized: boolean;

    /** Contact-related state and functions (when enablePhoneContacts is true) */
    contactState?: ContactState;

    /** Callback to handle list end reached */
    onListEndReached: () => void;
};

const doOptionsMatch = (option1: OptionData, option2: OptionData) => {
    return (
        (option1.accountID && option1.accountID === option2.accountID) || // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing -- this is boolean comparison
        (option1.reportID && option1.reportID !== '-1' && option1.reportID === option2.reportID) || // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing -- this is boolean comparison
        (option1.login && option1.login === option2.login)
    );
};

/**
 * Base hook that provides search functionality with selection logic for option lists.
 * This contains the core logic without platform-specific dependencies.
 */
function useSearchSelectorBase({
    selectionMode,
    maxResultsPerPage = CONST.MAX_SELECTION_LIST_PAGE_LENGTH,
    maxRecentReportsToShow,
    searchContext = 'search',
    includeUserToInvite = true,
    excludeLogins = CONST.EMPTY_OBJECT,
    excludeFromSuggestionsOnly = CONST.EMPTY_OBJECT,
    includeRecentReports = false,
    getValidOptionsConfig = CONST.EMPTY_OBJECT,
    onSelectionChange,
    onSingleSelect,
    initialSelected,
    shouldInitialize = true,
    contactOptions,
    includeCurrentUser = false,
    includeSelfDM = false,
    recentAttendees,
    shouldAllowNameOnlyOptions = false,
}: UseSearchSelectorConfig): UseSearchSelectorReturn {
    const {options: defaultOptions, areOptionsInitialized} = useOptionsList({
        shouldInitialize,
    });

    const optionsWithContacts = useMemo(() => {
        if (!contactOptions?.length || !areOptionsInitialized) {
            return defaultOptions;
        }
        const personalDetailsWithContacts = defaultOptions.personalDetails.concat(contactOptions);
        return {
            ...defaultOptions,
            personalDetails: personalDetailsWithContacts,
        };
    }, [areOptionsInitialized, defaultOptions, contactOptions]);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [reportAttributesDerived] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedOptions, setSelectedOptions] = useState<OptionData[]>(initialSelected ?? []);
    const [maxResults, setMaxResults] = useState(maxResultsPerPage);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [draftComments] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT);
    const [nvpDismissedProductTraining] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING);
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS);
    const sortedActions = useSortedActions();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserPersonalDetails.accountID;
    const currentUserEmail = currentUserPersonalDetails.email ?? '';
    const personalDetails = usePersonalDetails();
    const [allPolicyTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {selector: passthroughPolicyTagListSelector});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const onListEndReached = useDebounce(
        useCallback(() => {
            setMaxResults((previous) => previous + maxResultsPerPage);
        }, [maxResultsPerPage]),
        CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME,
    );

    const computedSearchTerm = useMemo(() => {
        return getSearchValueForPhoneOrEmail(debouncedSearchTerm, countryCode);
    }, [debouncedSearchTerm, countryCode]);
    const trimmedSearchInput = debouncedSearchTerm.trim();

    const baseOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return getEmptyOptions();
        }

        switch (searchContext) {
            case CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_SEARCH:
                return getSearchOptions({
                    options: optionsWithContacts,
                    draftComments,
                    nvpDismissedProductTraining,
                    betas: betas ?? [],
                    isUsedInChatFinder: true,
                    includeReadOnly: true,
                    searchQuery: computedSearchTerm,
                    maxResults,
                    includeUserToInvite,
                    countryCode,
                    loginList,
                    visibleReportActionsData,
                    policyCollection: allPolicies,
                    currentUserAccountID,
                    currentUserEmail,
                    personalDetails,
                    sortedActions,
                    conciergeReportID,
                });
            case CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_MEMBER_INVITE:
                return getValidOptions(optionsWithContacts, allPolicies, draftComments, nvpDismissedProductTraining, loginList, currentUserAccountID, currentUserEmail, conciergeReportID, {
                    betas: betas ?? [],
                    includeP2P: true,
                    includeSelectedOptions: false,
                    excludeLogins,
                    excludeFromSuggestionsOnly,
                    includeRecentReports,
                    maxElements: maxResults,
                    maxRecentReportElements: maxRecentReportsToShow,
                    searchString: computedSearchTerm,
                    searchInputValue: trimmedSearchInput,
                    includeUserToInvite,
                    personalDetails,
                    includeCurrentUser,
                    includeSelfDM,
                    countryCode,
                    reportAttributesDerived: reportAttributesDerived?.reports,
                    allPolicyTags,
                    sortedActions,
                });
            case CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL:
                return getValidOptions(optionsWithContacts, allPolicies, draftComments, nvpDismissedProductTraining, loginList, currentUserAccountID, currentUserEmail, conciergeReportID, {
                    betas: betas ?? [],
                    searchString: computedSearchTerm,
                    searchInputValue: trimmedSearchInput,
                    maxElements: maxResults,
                    maxRecentReportElements: maxRecentReportsToShow,
                    includeUserToInvite,
                    excludeLogins,
                    excludeFromSuggestionsOnly,
                    personalDetails,
                    loginsToExclude: excludeLogins,
                    includeCurrentUser,
                    includeSelfDM,
                    shouldAcceptName: shouldAllowNameOnlyOptions,
                    recentAttendees,
                    includeRecentReports: !shouldAllowNameOnlyOptions,
                    countryCode,
                    reportAttributesDerived: reportAttributesDerived?.reports,
                    allPolicyTags,
                    sortedActions,
                    ...getValidOptionsConfig,
                });
            case CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_SHARE_DESTINATION:
                return getValidOptions(optionsWithContacts, allPolicies, draftComments, nvpDismissedProductTraining, loginList, currentUserAccountID, currentUserEmail, conciergeReportID, {
                    betas,
                    selectedOptions,
                    includeMultipleParticipantReports: true,
                    showChatPreviewLine: true,
                    forcePolicyNamePreview: true,
                    includeThreads: true,
                    includeMoneyRequests: true,
                    includeTasks: true,
                    excludeLogins,
                    loginsToExclude: excludeLogins,
                    includeOwnedWorkspaceChats: true,
                    includeSelfDM: true,
                    searchString: computedSearchTerm,
                    searchInputValue: trimmedSearchInput,
                    maxElements: maxResults,
                    includeUserToInvite,
                    personalDetails,
                    countryCode,
                    reportAttributesDerived: reportAttributesDerived?.reports,
                    allPolicyTags,
                    sortedActions,
                });
            case CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_ATTENDEES:
                return getValidOptions(optionsWithContacts, allPolicies, draftComments, nvpDismissedProductTraining, loginList, currentUserAccountID, currentUserEmail, conciergeReportID, {
                    betas: betas ?? [],
                    includeP2P: true,
                    includeSelectedOptions: false,
                    excludeLogins,
                    excludeFromSuggestionsOnly,
                    loginsToExclude: excludeLogins,
                    includeRecentReports,
                    maxElements: maxResults,
                    maxRecentReportElements: maxRecentReportsToShow,
                    searchString: computedSearchTerm,
                    searchInputValue: trimmedSearchInput,
                    includeUserToInvite,
                    includeCurrentUser,
                    shouldAcceptName: true,
                    personalDetails,
                    countryCode,
                    reportAttributesDerived: reportAttributesDerived?.reports,
                    allPolicyTags,
                    sortedActions,
                    ...getValidOptionsConfig,
                });
            default:
                return getEmptyOptions();
        }
    }, [
        areOptionsInitialized,
        searchContext,
        optionsWithContacts,
        allPolicies,
        draftComments,
        nvpDismissedProductTraining,
        betas,
        computedSearchTerm,
        maxResults,
        includeUserToInvite,
        countryCode,
        loginList,
        currentUserAccountID,
        currentUserEmail,
        conciergeReportID,
        personalDetails,
        excludeLogins,
        excludeFromSuggestionsOnly,
        includeRecentReports,
        maxRecentReportsToShow,
        trimmedSearchInput,
        includeCurrentUser,
        includeSelfDM,
        reportAttributesDerived?.reports,
        getValidOptionsConfig,
        shouldAllowNameOnlyOptions,
        recentAttendees,
        selectedOptions,
        visibleReportActionsData,
        allPolicyTags,
        sortedActions,
    ]);

    const isOptionSelected = useMemo(() => {
        return (option: OptionData) => selectedOptions.some((selected) => doOptionsMatch(selected, option));
    }, [selectedOptions]);

    const searchOptions = useMemo(() => {
        return {
            ...baseOptions,
            personalDetails: baseOptions.personalDetails.map((option) => ({
                ...option,
                isSelected: isOptionSelected(option),
            })),
            recentReports: baseOptions.recentReports.map((option) => ({
                ...option,
                isSelected: isOptionSelected(option),
            })),
            userToInvite: baseOptions.userToInvite
                ? {
                      ...baseOptions.userToInvite,
                      isSelected: isOptionSelected(baseOptions.userToInvite),
                  }
                : null,
        };
    }, [baseOptions, isOptionSelected]);

    const availableOptions = useMemo(() => {
        const unselectedRecentReports = searchOptions.recentReports.filter((option) => !option.isSelected);

        // Filter out people who appear in recent reports from personal details (recents take priority)
        const recentReportLogins = new Set(unselectedRecentReports.map((option) => option.login).filter(Boolean));
        const unselectedPersonalDetails = searchOptions.personalDetails.filter((option) => !option.isSelected && !recentReportLogins.has(option.login));

        return {
            ...searchOptions,
            personalDetails: unselectedPersonalDetails,
            recentReports: unselectedRecentReports,
            userToInvite: searchOptions.userToInvite?.isSelected ? null : searchOptions.userToInvite,
        };
    }, [searchOptions]);

    /**
     * Toggle selection state of option based on selection mode
     */
    const toggleSelection = useCallback(
        (option: OptionData) => {
            if (selectionMode === CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE) {
                onSingleSelect?.(option);
                return;
            }

            if (shouldAllowNameOnlyOptions) {
                const foundOptionIndex = selectedOptions.findIndex((selectedOption: Option) => {
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
                });

                if (foundOptionIndex >= 0) {
                    const newSelectedOptions = [...selectedOptions.slice(0, foundOptionIndex), ...selectedOptions.slice(foundOptionIndex + 1)];
                    setSelectedOptions(newSelectedOptions);
                    onSelectionChange?.(newSelectedOptions);
                    return;
                }
            }

            const isSelected = selectedOptions.some((selected) => doOptionsMatch(selected, option));
            const newlySelected = isSelected ? selectedOptions.filter((selected) => !doOptionsMatch(selected, option)) : [...selectedOptions, {...option, isSelected: true}];

            setSelectedOptions(newlySelected);
            onSelectionChange?.(newlySelected);
        },
        [selectionMode, selectedOptions, onSelectionChange, onSingleSelect, shouldAllowNameOnlyOptions],
    );

    const selectedOptionsForDisplay = useMemo(() => {
        return selectedOptions.filter((option) => {
            const personalDetailSearchTerms = getPersonalDetailSearchTerms(option, currentUserAccountID);
            return (
                !!option.text?.toLowerCase().includes(computedSearchTerm) ||
                !!option.login?.toLowerCase().includes(computedSearchTerm) ||
                personalDetailSearchTerms.some((term) => term.toLocaleLowerCase().includes(computedSearchTerm))
            );
        });
    }, [selectedOptions, computedSearchTerm, currentUserAccountID]);

    return {
        searchTerm,
        debouncedSearchTerm,
        setSearchTerm,
        searchOptions,
        availableOptions,
        selectedOptions,
        setSelectedOptions,
        toggleSelection,
        areOptionsInitialized,
        contactState: undefined,
        onListEndReached,
        selectedOptionsForDisplay,
    };
}

export default useSearchSelectorBase;
export type {ContactState, UseSearchSelectorConfig, UseSearchSelectorReturn, SearchSelectorContext, SearchSelectorSelectionMode};
