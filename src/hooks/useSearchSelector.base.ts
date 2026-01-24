import {useCallback, useMemo, useState} from 'react';
import type {PermissionStatus} from 'react-native-permissions';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import type {GetOptionsConfig, Options, SearchOption} from '@libs/OptionsListUtils';
import {getEmptyOptions, getSearchOptions, getSearchValueForPhoneOrEmail, getValidOptions} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails} from '@src/types/onyx';
import useDebounce from './useDebounce';
import useDebouncedState from './useDebouncedState';
import useOnyx from './useOnyx';

type SearchSelectorContext = (typeof CONST.SEARCH_SELECTOR)[keyof Pick<
    typeof CONST.SEARCH_SELECTOR,
    'SEARCH_CONTEXT_GENERAL' | 'SEARCH_CONTEXT_SEARCH' | 'SEARCH_CONTEXT_MEMBER_INVITE' | 'SEARCH_CONTEXT_SHARE_LOG' | 'SEARCH_CONTEXT_SHARE_DESTINATION' | 'SEARCH_CONTEXT_ATTENDEES'
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

    /** Logins to exclude from results */
    excludeLogins?: Record<string, boolean>;

    /** Whether to include recent reports (for getMemberInviteOptions) */
    includeRecentReports?: boolean;

    /** Whether to include current user */
    includeCurrentUser?: boolean;

    /** Enable phone contacts integration */
    enablePhoneContacts?: boolean;

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
    contactOptions?: Array<SearchOption<PersonalDetails>>;
};

type ContactState = {
    /** Current permission status */
    permissionStatus: PermissionStatus;

    /** Contact options from device */
    contactOptions: Array<SearchOption<PersonalDetails>>;

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
    includeRecentReports = false,
    getValidOptionsConfig = CONST.EMPTY_OBJECT,
    onSelectionChange,
    onSingleSelect,
    initialSelected,
    shouldInitialize = true,
    contactOptions,
    includeCurrentUser = false,
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
    const [betas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    const [reportAttributesDerived] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {canBeMissing: true});
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedOptions, setSelectedOptions] = useState<OptionData[]>(initialSelected ?? []);
    const [maxResults, setMaxResults] = useState(maxResultsPerPage);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [draftComments] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, {canBeMissing: true});
    const [nvpDismissedProductTraining] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {canBeMissing: true});
    const personalDetails = usePersonalDetails();

    const onListEndReached = useDebounce(
        useCallback(() => {
            setMaxResults((previous) => previous + maxResultsPerPage);
        }, [maxResultsPerPage]),
        CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME,
    );

    const computedSearchTerm = useMemo(() => {
        return getSearchValueForPhoneOrEmail(debouncedSearchTerm, countryCode);
    }, [debouncedSearchTerm, countryCode]);

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
                });
            case CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_MEMBER_INVITE:
                return getValidOptions(optionsWithContacts, allPolicies, draftComments, nvpDismissedProductTraining, loginList, {
                    betas: betas ?? [],
                    includeP2P: true,
                    includeSelectedOptions: false,
                    excludeLogins,
                    includeRecentReports,
                    maxElements: maxResults,
                    maxRecentReportElements: maxRecentReportsToShow,
                    searchString: computedSearchTerm,
                    includeUserToInvite,
                    personalDetails,
                }, countryCode, reportAttributesDerived?.reports);
            case CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL:
                return getValidOptions(optionsWithContacts, allPolicies, draftComments, nvpDismissedProductTraining, loginList, {
                    ...getValidOptionsConfig,
                    betas: betas ?? [],
                    searchString: computedSearchTerm,
                    maxElements: maxResults,
                    maxRecentReportElements: maxRecentReportsToShow,
                    includeUserToInvite,
                    excludeLogins,
                    personalDetails,
                }, countryCode, reportAttributesDerived?.reports);
            case CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_SHARE_LOG:
                return getValidOptions(
                    optionsWithContacts,
                    allPolicies,
                    draftComments,
                    nvpDismissedProductTraining,
                    loginList,
                    {
                        betas,
                        includeMultipleParticipantReports: true,
                        includeP2P: true,
                        forcePolicyNamePreview: true,
                        includeOwnedWorkspaceChats: true,
                        includeSelfDM: true,
                        includeThreads: true,
                        includeReadOnly: false,
                        searchString: computedSearchTerm,
                        maxElements: maxResults,
                        includeUserToInvite,
                        personalDetails,
                    },
                    countryCode,
                    reportAttributesDerived?.reports,
                );
            case CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_SHARE_DESTINATION:
                return getValidOptions(optionsWithContacts, allPolicies, draftComments, nvpDismissedProductTraining, loginList, {
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
                    maxElements: maxResults,
                    includeUserToInvite,
                    personalDetails,
                }, countryCode, reportAttributesDerived?.reports);
            case CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_ATTENDEES:
                return getValidOptions(optionsWithContacts, allPolicies, draftComments, nvpDismissedProductTraining, loginList, {
                    ...getValidOptionsConfig,
                    betas: betas ?? [],
                    includeP2P: true,
                    includeSelectedOptions: false,
                    excludeLogins,
                    loginsToExclude: excludeLogins,
                    includeRecentReports,
                    maxElements: maxResults,
                    maxRecentReportElements: maxRecentReportsToShow,
                    searchString: computedSearchTerm,
                    includeUserToInvite,
                    includeCurrentUser,
                    shouldAcceptName: true,
                    personalDetails,
                }, countryCode, reportAttributesDerived?.reports);
            default:
                return getEmptyOptions();
        }
    }, [
        areOptionsInitialized,
        searchContext,
        optionsWithContacts,
        draftComments,
        nvpDismissedProductTraining,
        betas,
        computedSearchTerm,
        maxResults,
        includeUserToInvite,
        countryCode,
        loginList,
        excludeLogins,
        includeRecentReports,
        maxRecentReportsToShow,
        getValidOptionsConfig,
        selectedOptions,
        includeCurrentUser,
        personalDetails,
        reportAttributesDerived,
    ]);

    const isOptionSelected = useMemo(() => {
        return (option: OptionData) =>
            selectedOptions.some(
                (selected) =>
                    (selected.accountID && selected.accountID === option.accountID) || // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing -- this is boolean comparison
                    (selected.reportID && selected.reportID === option.reportID) || // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing -- this is boolean comparison
                    (selected.login && selected.login === option.login),
            );
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

            const isSelected = selectedOptions.some(
                (selected) =>
                    (selected.accountID && selected.accountID === option.accountID) || // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing -- this is boolean comparison
                    (selected.reportID && selected.reportID === option.reportID) || // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing -- this is boolean comparison
                    (selected.login && selected.login === option.login),
            );

            const newSelected = isSelected
                ? selectedOptions.filter(
                      (selected) =>
                          !(
                              (selected.accountID && selected.accountID === option.accountID) || // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing -- this is boolean comparison
                              (selected.reportID && selected.reportID === option.reportID) || // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing -- this is boolean comparison
                              (selected.login && selected.login === option.login)
                          ),
                  )
                : [...selectedOptions, {...option, isSelected: true}];

            setSelectedOptions(newSelected);
            onSelectionChange?.(newSelected);
        },
        [selectedOptions, selectionMode, onSelectionChange, onSingleSelect],
    );

    const selectedOptionsForDisplay = useMemo(() => {
        return selectedOptions.filter((option) => {
            return !!option.text?.toLowerCase().includes(computedSearchTerm) || !!option.login?.toLowerCase().includes(computedSearchTerm);
        });
    }, [selectedOptions, computedSearchTerm]);

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
