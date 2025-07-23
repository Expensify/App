import {useCallback, useMemo, useState} from 'react';
import {useOptionsList} from '@components/OptionListContextProvider';
import type {Options} from '@libs/OptionsListUtils';
import {getAttendeeOptions, getEmptyOptions, getMemberInviteOptions, getSearchOptions, getShareDestinationOptions, getShareLogOptions, getValidOptions} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
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
    /** Callback when selection changes (multi-select mode) */
    onSelectionChange?: (selected: OptionData[]) => void;
    /** Callback when single option is selected (single-select mode) */
    onSingleSelect?: (option: OptionData) => void;
    /** Initial selected options */
    initialSelected?: OptionData[];
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
    onSelectionChange,
    onSingleSelect,
    initialSelected = [],
}: UseSearchSelectorConfig): UseSearchSelectorReturn {
    const {options, areOptionsInitialized} = useOptionsList();
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedOptions, setSelectedOptions] = useState<OptionData[]>(initialSelected);

    // Get optimized options with heap filtering and mark selection state
    const searchOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return getEmptyOptions();
        }

        let baseOptions: Options;
        switch (getOptionsFunction) {
            case 'getSearchOptions':
                baseOptions = getSearchOptions(options, betas ?? [], true, true, debouncedSearchTerm, maxResults, includeUserToInvite);
                break;
            case 'getMemberInviteOptions':
                baseOptions = getMemberInviteOptions(
                    options.personalDetails,
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
                    options.personalDetails,
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
                baseOptions = getShareLogOptions(options, betas ?? [], debouncedSearchTerm, maxResults, includeUserToInvite);
                break;
            case 'getShareDestinationOptions':
                baseOptions = getShareDestinationOptions(
                    options.reports,
                    options.personalDetails,
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
                baseOptions = getValidOptions(options, {
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
    }, [areOptionsInitialized, options, betas, debouncedSearchTerm, maxResults, getOptionsFunction, includeUserToInvite, excludeLogins, includeRecentReports, selectedOptions]);

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

    return {
        searchTerm,
        setSearchTerm,
        searchOptions,
        availableOptions,
        selectedOptions,
        setSelectedOptions,
        toggleOption,
        areOptionsInitialized,
    };
}

export default useSearchSelector;
export type {GetOptionsFunction, UseSearchSelectorConfig, UseSearchSelectorReturn};
