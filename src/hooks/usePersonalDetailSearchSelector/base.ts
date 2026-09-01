import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalDetailOptions from '@hooks/usePersonalDetailOptions';

import memoize, {equivalentArgsComparator} from '@libs/memoize';
import {filterOption, getValidOptions} from '@libs/PersonalDetailOptionsListUtils';
import type {OptionData} from '@libs/PersonalDetailOptionsListUtils';
import {registerSessionCleanupCallback} from '@libs/SessionCleanup';
import {expensifyLoginsSelector} from '@libs/UserUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {PermissionStatus} from 'react-native-permissions';

import {useState} from 'react';

type SearchSelectorSelectionMode = (typeof CONST.SEARCH_SELECTOR)[keyof Pick<typeof CONST.SEARCH_SELECTOR, 'SELECTION_MODE_SINGLE' | 'SELECTION_MODE_MULTI'>];

type UseSearchSelectorConfig = {
    /** Selection mode - single or multiple selection */
    selectionMode: SearchSelectorSelectionMode;

    /** How many recent reports should be returned? The rest count from maxResultsPerPage will be with contacts. null value means CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW */
    maxRecentReportsToShow?: number;

    /** Max number of options to return in search results (including recent reports and personal details). null value means no limit */
    maxElements?: number;

    /** Whether to include user to invite option */
    includeUserToInvite?: boolean;

    /** Logins to exclude from results (hard exclusions - cannot be selected at all) */
    excludeLogins?: Record<string, boolean>;

    /** Logins to exclude from suggestions only (soft exclusions - can still be manually entered) */
    excludeFromSuggestionsOnly?: Record<string, boolean>;

    /** When set, only the logins in this set are turned into options */
    includeLoginsOnly?: Set<string>;

    /** Whether to include recent reports */
    includeRecentReports?: boolean;

    /** Whether to include current user */
    includeCurrentUser?: boolean;

    /** Whether to include domain emails */
    includeDomainEmail?: boolean;

    /** Enable phone contacts integration */
    enablePhoneContacts?: boolean;

    /** Callback when selection changes (multi-select mode). Receives the new selected accountIDs and the new selected options. */
    onSelectionChange?: (selected: string[], selectedOptions: OptionData[]) => void;

    /** Callback when single option is selected (single-select mode) */
    onSingleSelect?: (option: OptionData) => void;

    /** Initial selected options */
    initialSelected?: Set<string>;

    /** Initial extra options */
    initialExtraOptions?: OptionData[];

    /** Whether to initialize the hook */
    shouldInitialize?: boolean;

    /** Additional contact options to merge (used by platform-specific implementations) */
    contactOptions?: OptionData[];

    /** Whether to filter with recent attendees */
    recentAttendees?: string[];

    /** Whether to allow name-only options */
    shouldAllowNameOnlyOptions?: boolean;

    /** Whether to keep selected options in availableOptions instead of filtering them out */
    shouldKeepSelectedInAvailableOptions?: boolean;

    /** Whether to update selected options when in single select mode and a new option is selected */
    shouldUpdateSelectedOptionsOnSingleSelect?: boolean;

    /** Initial Search Phrase */
    initialSearchPhrase?: string;
};

type ContactState = {
    /** Current permission status */
    permissionStatus: PermissionStatus;

    /** Whether to show import UI */
    showImportUI: boolean;

    /** Function to trigger contact import */
    importContacts: () => void;

    /** Function to set permission state */
    setContactPermissionState: (status: PermissionStatus) => void;
};

type AvailableOptions = {
    selectedOptions: OptionData[];
    recentOptions: OptionData[];
    personalDetails: OptionData[];
    userToInvite: OptionData | null;
    extraOptions: OptionData[];
    currentUserOption: OptionData | null;
};

type UseSearchSelectorReturn = {
    /** Current search term */
    searchTerm: string;

    /** Debounced search term */
    debouncedSearchTerm: string;

    /** Function to update search term */
    setSearchTerm: (value: string) => void;

    /** Currently selected options */
    selectedOptions: OptionData[];

    /** Available (unselected) options */
    availableOptions: AvailableOptions;

    /* Total count of options (without filters) */
    totalOptionsCount: number;

    /** Function to toggle selection state of an option */
    toggleSelection: (option: OptionData) => void;

    /** Function to reset selection state of an option */
    resetSelection: () => void;

    /** Whether options are initialized */
    areOptionsInitialized: boolean;

    /** Contact-related state and functions (when enablePhoneContacts is true) */
    contactState?: ContactState;

    /** Selected options that don't exist in the personal details list (e.g. typed email addresses) */
    selectedNonExistingOptions: OptionData[];
};

const defaultListOptions = {
    userToInvite: null,
    recentOptions: [],
    personalDetails: [],
    selectedOptions: [],
};

/**
 * How many option lists the caches below hold. Consumers mount one selector at a time, except the Search filters
 * popover, which keeps its people filters alive next to each other - three of them, which is the most a single search
 * type offers at once (from, to and attendee, on expense searches). Fewer entries cost more than the memory they save:
 * the result of `buildSelectedOptions` is an argument of `getValidOptions` compared by identity, so an eviction in the
 * first cache makes the second one miss as well. What the entries cost in memory is bounded by
 * `useReleaseOptionListCaches`, which drops both caches once another tab takes over from Search, so this number only
 * has to cover how many lists are wanted at once rather than how long any of them lives.
 */
const MAX_CACHED_OPTION_LISTS = 3;

/** Filtering the whole option list is a pure derivation of its inputs, so remounting consumers reuse the result. */
const memoizedGetValidOptions = memoize(getValidOptions, {
    maxSize: MAX_CACHED_OPTION_LISTS,
    equality: equivalentArgsComparator,
    monitoringName: 'usePersonalDetailSearchSelector.getValidOptions',
});

/** Marks the options matching the selected accountIDs, so the copy of the list is reused while the inputs are unchanged. */
const buildSelectedOptions = (options: OptionData[], selectedAccountIDs: Set<string>) =>
    options.map((option) => ({
        ...option,
        isSelected: selectedAccountIDs.has(option.accountID.toString()),
    }));

const memoizedBuildSelectedOptions = memoize(buildSelectedOptions, {
    maxSize: MAX_CACHED_OPTION_LISTS,
    equality: equivalentArgsComparator,
    monitoringName: 'usePersonalDetailSearchSelector.buildSelectedOptions',
});

/** Releases the cached lists. The next consumer derives them again, so callers pay that price for the memory back. */
function clearPersonalDetailSearchSelectorCaches() {
    memoizedGetValidOptions.cache.clear();
    memoizedBuildSelectedOptions.cache.clear();
}

// Both caches hold option lists built for the signed-in account, released when Search is left
// (`useReleaseOptionListCaches`) and on sign-out.
registerSessionCleanupCallback(clearPersonalDetailSearchSelectorCaches);

/**
 * Base hook that provides search functionality with selection logic for option lists.
 * This contains the core logic without platform-specific dependencies.
 */
function usePersonalDetailSearchSelectorBase({
    selectionMode,
    maxElements,
    maxRecentReportsToShow,
    includeUserToInvite = false,
    includeDomainEmail = false,
    excludeLogins = CONST.EMPTY_OBJECT,
    excludeFromSuggestionsOnly = CONST.EMPTY_OBJECT,
    includeLoginsOnly,
    includeRecentReports = true,
    onSelectionChange,
    onSingleSelect,
    initialSelected = new Set<string>(),
    initialExtraOptions = [],
    shouldInitialize = true,
    contactOptions,
    includeCurrentUser = false,
    recentAttendees,
    shouldAllowNameOnlyOptions = false,
    shouldKeepSelectedInAvailableOptions = false,
    shouldUpdateSelectedOptionsOnSingleSelect = false,
    initialSearchPhrase = '',
}: UseSearchSelectorConfig): UseSearchSelectorReturn {
    const {translate, formatPhoneNumber} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {options: defaultOptions, currentOption, isLoading: isPersonalDetailsOptionsLoading} = usePersonalDetailOptions({enabled: shouldInitialize, includeLoginsOnly});
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [loginList] = useOnyx(ONYXKEYS.LOGINS, {selector: expensifyLoginsSelector});

    const [selectedAccountIDs, setSelectedAccountIDs] = useState<Set<string>>(initialSelected);
    const [extraOptions, setExtraOptions] = useState<OptionData[]>(initialExtraOptions);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState(initialSearchPhrase);
    const currentUserEmail = currentUserPersonalDetails.email ?? '';

    const optionsWithContacts = (() => {
        if (!contactOptions?.length || !shouldInitialize) {
            return defaultOptions;
        }
        // Phone contacts are built outside of usePersonalDetailOptions, so they need the allowlist applied here.
        const allowedContactOptions = includeLoginsOnly ? contactOptions.filter((option) => !!option.login && includeLoginsOnly.has(option.login)) : contactOptions;
        return (defaultOptions ?? []).concat(allowedContactOptions);
    })();
    const areOptionsInitialized = !isPersonalDetailsOptionsLoading;

    // With nothing selected the options already carry the right state, so the list is passed through instead of a copy
    // of every option being built and then held in the cache.
    const transformedOptions: OptionData[] = (() => {
        if (!optionsWithContacts) {
            return [];
        }
        if (selectedAccountIDs.size === 0) {
            return optionsWithContacts;
        }
        return memoizedBuildSelectedOptions(optionsWithContacts, selectedAccountIDs);
    })();

    const selectedOptions = (() => {
        const options: OptionData[] = [];
        for (const option of transformedOptions) {
            if (option.isSelected) {
                options.push(option);
            }
        }
        for (const option of extraOptions) {
            if (option.isSelected) {
                options.push(option);
            }
        }
        return options;
    })();

    const optionsList = !areOptionsInitialized
        ? defaultListOptions
        : memoizedGetValidOptions(transformedOptions, currentUserEmail, formatPhoneNumber, countryCode, loginList, {
              excludeLogins,
              excludeFromSuggestionsOnly,
              includeSelectedOptions: shouldKeepSelectedInAvailableOptions,
              includeRecentReports,
              recentAttendees,
              searchString: debouncedSearchTerm,
              maxElements,
              recentMaxElements: maxRecentReportsToShow,
              includeUserToInvite,
              includeCurrentUser,
              includeDomainEmail,
              extraOptions,
              shouldAcceptName: shouldAllowNameOnlyOptions,
          });

    const currentUserSearchTerms = [translate('common.you'), translate('common.me')];
    const filteredCurrentUserOption = (() => {
        const newOption = filterOption(currentOption, debouncedSearchTerm, currentUserSearchTerms);
        if (newOption) {
            return {
                ...newOption,
                isSelected: selectedAccountIDs.has(newOption.accountID.toString()),
            };
        }
        return newOption;
    })();

    const existingAccountIDs = new Set(optionsWithContacts?.map((option) => option.accountID.toString()));

    /**
     * Toggle selection state of option based on selection mode
     */
    const toggleSelection = (option: OptionData) => {
        if (selectionMode === CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE) {
            onSingleSelect?.(option);
            if (shouldUpdateSelectedOptionsOnSingleSelect) {
                if (selectedAccountIDs.has(option.accountID.toString())) {
                    setSelectedAccountIDs(new Set());
                    // If the option is selected, remove it from the selected logins
                    const isInExtraOption = extraOptions.some((extraOption) => extraOption.accountID === option.accountID);
                    if (isInExtraOption) {
                        setExtraOptions([]);
                    }
                } else {
                    setSelectedAccountIDs(new Set([option.accountID.toString()]));
                    if (!existingAccountIDs.has(option.accountID.toString())) {
                        setExtraOptions([{...option, isSelected: true}]);
                    } else if (extraOptions.length > 0) {
                        setExtraOptions([]);
                    }
                }
            }
            return;
        }

        const isSelected = selectedAccountIDs.has(option.accountID.toString());

        if (isSelected) {
            // If the option is selected, remove it from the selected logins
            const isInExtraOption = extraOptions.some((extraOption) => extraOption.accountID === option.accountID);
            if (isInExtraOption) {
                setExtraOptions((prev) => prev.filter((extraOption) => extraOption.accountID !== option.accountID));
            }
            const newSet = new Set([...selectedAccountIDs].filter((accountID) => accountID !== option.accountID.toString()));
            setSelectedAccountIDs(newSet);
            const newSelectedOptions = selectedOptions.filter((selected) => selected.accountID !== option.accountID);
            onSelectionChange?.(Array.from(newSet), newSelectedOptions);
        } else {
            const newSet = new Set(selectedAccountIDs).add(option.accountID.toString());
            setSelectedAccountIDs(newSet);
            const newSelectedOptions = [...selectedOptions, {...option, isSelected: true}];
            onSelectionChange?.(Array.from(newSet), newSelectedOptions);
            if (!existingAccountIDs.has(option.accountID.toString())) {
                setExtraOptions((prev) => [...prev, {...option, isSelected: true}]);
            }
        }
    };

    const resetSelection = () => {
        setExtraOptions([]);
        setSelectedAccountIDs(new Set());
    };

    const selectedNonExistingOptions = (() => {
        const filteredOptions: OptionData[] = [];
        for (const option of extraOptions) {
            const filteredOption = filterOption(option, debouncedSearchTerm);
            if (filteredOption) {
                filteredOptions.push(filteredOption);
            }
        }
        return filteredOptions;
    })();

    return {
        searchTerm,
        debouncedSearchTerm,
        setSearchTerm,
        selectedOptions,
        availableOptions: {
            ...optionsList,
            currentUserOption: filteredCurrentUserOption,
            extraOptions,
        },
        totalOptionsCount: optionsWithContacts?.length ?? 0,
        toggleSelection,
        resetSelection,
        areOptionsInitialized,
        contactState: undefined,
        selectedNonExistingOptions,
    };
}

export default usePersonalDetailSearchSelectorBase;
export {clearPersonalDetailSearchSelectorCaches};
export type {ContactState, UseSearchSelectorConfig, UseSearchSelectorReturn};
