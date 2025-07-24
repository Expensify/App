import {useCallback, useMemo, useState} from 'react';
import {InteractionManager} from 'react-native';
import {RESULTS} from 'react-native-permissions';
import type {PermissionStatus} from 'react-native-permissions';
import {useOptionsList} from '@components/OptionListContextProvider';
import type {Options, SearchOption} from '@libs/OptionsListUtils';
import {getAttendeeOptions, getEmptyOptions, getMemberInviteOptions, getSearchOptions, getShareDestinationOptions, getShareLogOptions, getValidOptions} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import contactImport from '@libs/ContactImport';
import type {ContactImportResult} from '@libs/ContactImport/types';
import useContactPermissions from '@libs/ContactPermission/useContactPermissions';
import getContacts from '@libs/ContactUtils';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails} from '@src/types/onyx';
import useDebouncedState from './useDebouncedState';
import useOnyx from './useOnyx';

type GetOptionsFunction = 'getSearchOptions' | 'getMemberInviteOptions' | 'getAttendeeOptions' | 'getShareLogOptions' | 'getShareDestinationOptions' | 'getValidOptions';

type UseSearchSelectorConfig = {
    /** Selection mode - single or multiple selection */
    selectionMode: 'single' | 'multi';
    /** Maximum number of results to return (for heap optimization) */
    maxResults?: number;
    /** Which options function to use for filtering */
    getOptionsFunction?: GetOptionsFunction;
    /** Whether to include user to invite option */
    includeUserToInvite?: boolean;
    /** Logins to exclude from results */
    excludeLogins?: Record<string, boolean>;
    /** Whether to include recent reports (for getMemberInviteOptions) */
    includeRecentReports?: boolean;
    /** Enable phone contacts integration */
    enablePhoneContacts?: boolean;
    /** Callback when selection changes (multi-select mode) */
    onSelectionChange?: (selected: OptionData[]) => void;
    /** Callback when single option is selected (single-select mode) */
    onSingleSelect?: (option: OptionData) => void;
    /** Initial selected options */
    initialSelected?: OptionData[];
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
    /** Function to update search term */
    setSearchTerm: (value: string) => void;
    /** Filtered and optimized search options with selection state */
    searchOptions: Options;
    /** Available (unselected) options */
    availableOptions: Options;
    /** Currently selected options */
    selectedOptions: OptionData[];
    /** Function to set selected options */
    setSelectedOptions: (options: OptionData[]) => void;
    /** Function to toggle option selection */
    toggleOption: (option: OptionData) => void;
    /** Whether options are initialized */
    areOptionsInitialized: boolean;
    /** Contact-related state and functions (when enablePhoneContacts is true) */
    contactState?: ContactState;
};

/**
 * Hook that combines search functionality with selection logic for option lists.
 * Leverages heap optimization for performance with large datasets.
 *
 * @param config - Configuration object for the hook
 * @returns Object with search and selection utilities
 */
function useSearchSelector({
    selectionMode,
    maxResults = 20,
    getOptionsFunction = 'getSearchOptions',
    includeUserToInvite = true,
    excludeLogins = {},
    includeRecentReports = false,
    enablePhoneContacts = false,
    onSelectionChange,
    onSingleSelect,
    initialSelected = [],
}: UseSearchSelectorConfig): UseSearchSelectorReturn {
    const {options, areOptionsInitialized} = useOptionsList();
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedOptions, setSelectedOptions] = useState<OptionData[]>(initialSelected);

    // Phone contacts logic
    const [contactPermissionState, setContactPermissionState] = useState<PermissionStatus>(RESULTS.UNAVAILABLE);
    const [contacts, setContacts] = useState<Array<SearchOption<PersonalDetails>>>([]);
    const platform = getPlatform();
    const isNative = platform === CONST.PLATFORM.ANDROID || platform === CONST.PLATFORM.IOS;
    const shouldEnableContacts = enablePhoneContacts && isNative;
    const showImportContacts = shouldEnableContacts && !(contactPermissionState === RESULTS.GRANTED || contactPermissionState === RESULTS.LIMITED);

    const importAndSaveContacts = useCallback(() => {
        if (!shouldEnableContacts) {
            return;
        }
        contactImport().then(({contactList, permissionStatus}: ContactImportResult) => {
            console.log('morwa importAndSaveContacts', contactList, permissionStatus);
            setContactPermissionState(permissionStatus);
            const usersFromContact = getContacts(contactList);
            setContacts(usersFromContact);
        });
    }, [shouldEnableContacts]);

    const initiateContactImportAndSetState = useCallback(() => {
        setContactPermissionState(RESULTS.GRANTED);
        InteractionManager.runAfterInteractions(importAndSaveContacts);
    }, [importAndSaveContacts]);

    useContactPermissions({
        importAndSaveContacts,
        setContacts,
        contactPermissionState,
        setContactPermissionState,
    });

    // Get optimized options with heap filtering and mark selection state
    const searchOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return getEmptyOptions();
        }

        // Integrate contacts into personalDetails if enabled
        const personalDetailsWithContacts = shouldEnableContacts 
            ? options.personalDetails.concat(contacts)
            : options.personalDetails;

        const optionsWithContacts = {
            ...options,
            personalDetails: personalDetailsWithContacts,
        };

        let baseOptions: Options;
        switch (getOptionsFunction) {
            case 'getSearchOptions':
                baseOptions = getSearchOptions(optionsWithContacts, betas ?? [], true, true, debouncedSearchTerm, maxResults, includeUserToInvite);
                break;
            case 'getMemberInviteOptions':
                baseOptions = getMemberInviteOptions(
                    personalDetailsWithContacts,
                    betas ?? [],
                    excludeLogins,
                    false,
                    options.reports,
                    includeRecentReports,
                    debouncedSearchTerm,
                    maxResults,
                    includeUserToInvite,
                );
                console.log('morwa baseOptions', baseOptions, options);
                break;
            case 'getAttendeeOptions':
                baseOptions = getAttendeeOptions(
                    options.reports,
                    personalDetailsWithContacts,
                    betas ?? [],
                    [],
                    [],
                    false,
                    true,
                    false,
                    undefined,
                    debouncedSearchTerm,
                    maxResults,
                    includeUserToInvite,
                );
                break;
            case 'getShareLogOptions':
                baseOptions = getShareLogOptions(optionsWithContacts, betas ?? [], debouncedSearchTerm, maxResults, includeUserToInvite);
                break;
            case 'getShareDestinationOptions':
                baseOptions = getShareDestinationOptions(
                    options.reports,
                    personalDetailsWithContacts,
                    betas ?? [],
                    [],
                    excludeLogins,
                    true,
                    debouncedSearchTerm,
                    maxResults,
                    includeUserToInvite,
                );
                break;
            case 'getValidOptions':
                baseOptions = getValidOptions(optionsWithContacts, {
                    betas: betas ?? [],
                    searchString: debouncedSearchTerm,
                    maxElements: maxResults,
                    includeUserToInvite,
                    loginsToExclude: excludeLogins,
                });
                break;
            default:
                baseOptions = getEmptyOptions();
        }

        // Mark selection state on all options
        const isOptionSelected = (option: OptionData) =>
            selectedOptions.some(
                (selected) =>
                    (selected.accountID && selected.accountID === option.accountID) ||
                    (selected.reportID && selected.reportID === option.reportID) ||
                    (selected.login && selected.login === option.login),
            );

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
    }, [areOptionsInitialized, options, betas, debouncedSearchTerm, maxResults, getOptionsFunction, includeUserToInvite, excludeLogins, includeRecentReports, selectedOptions, shouldEnableContacts, contacts]);

    // Available options (unselected items only with proper deduplication)
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
     * Toggle option selection based on selection mode
     */
    const toggleOption = useCallback(
        (option: OptionData) => {
            if (selectionMode === 'single') {
                onSingleSelect?.(option);
                return;
            }

            const isSelected = selectedOptions.some(
                (selected) =>
                    (selected.accountID && selected.accountID === option.accountID) ||
                    (selected.reportID && selected.reportID === option.reportID) ||
                    (selected.login && selected.login === option.login),
            );

            const newSelected = isSelected
                ? selectedOptions.filter(
                      (selected) =>
                          !(
                              (selected.accountID && selected.accountID === option.accountID) ||
                              (selected.reportID && selected.reportID === option.reportID) ||
                              (selected.login && selected.login === option.login)
                          ),
                  )
                : [...selectedOptions, {...option, isSelected: true}];

            setSelectedOptions(newSelected);
            onSelectionChange?.(newSelected);
        },
        [selectedOptions, selectionMode, onSelectionChange, onSingleSelect],
    );

    // Build contact state if enabled
    const contactState: ContactState | undefined = shouldEnableContacts
        ? {
              permissionStatus: contactPermissionState,
              contactOptions: contacts,
              showImportUI: showImportContacts,
              importContacts: importAndSaveContacts,
              initiateContactImportAndSetState,
              setContactPermissionState,
          }
        : undefined;

    return {
        searchTerm,
        setSearchTerm,
        searchOptions,
        availableOptions,
        selectedOptions,
        setSelectedOptions,
        toggleOption,
        areOptionsInitialized,
        contactState,
    };
}

export default useSearchSelector;
export type {GetOptionsFunction, UseSearchSelectorConfig, UseSearchSelectorReturn, ContactState};
