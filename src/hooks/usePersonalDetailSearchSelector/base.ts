import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalDetailOptions from '@hooks/usePersonalDetailOptions';

import {filterOption, getValidOptions} from '@libs/PersonalDetailOptionsListUtils';
import type {OptionData} from '@libs/PersonalDetailOptionsListUtils';
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

    /** Whether to include recent reports (for getMemberInviteOptions) */
    includeRecentReports?: boolean;

    /** Whether to include current user */
    includeCurrentUser?: boolean;

    /** Whether to include domain emails */
    includeDomainEmail?: boolean;

    /** Enable phone contacts integration */
    enablePhoneContacts?: boolean;

    /** Callback when selection changes (multi-select mode) */
    onSelectionChange?: (selected: string[]) => void;

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
    const {options: defaultOptions, currentOption} = usePersonalDetailOptions({enabled: shouldInitialize});

    const optionsWithContacts = (() => {
        if (!contactOptions?.length || !shouldInitialize) {
            return defaultOptions;
        }
        return (defaultOptions ?? []).concat(contactOptions);
    })();
    const areOptionsInitialized = (optionsWithContacts?.length ?? 0) > 0;
    const [selectedAccountIDs, setSelectedAccountIDs] = useState<Set<string>>(initialSelected);
    const [extraOptions, setExtraOptions] = useState<OptionData[]>(initialExtraOptions);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState(initialSearchPhrase);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [loginList] = useOnyx(ONYXKEYS.LOGINS, {selector: expensifyLoginsSelector});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserEmail = currentUserPersonalDetails.email ?? '';

    const transformedOptions: OptionData[] =
        optionsWithContacts?.map((option) => ({
            ...option,
            isSelected: selectedAccountIDs.has(option.accountID.toString()),
        })) ?? [];

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
        : getValidOptions(transformedOptions, currentUserEmail, formatPhoneNumber, countryCode, loginList, {
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
            onSelectionChange?.(Array.from(newSet));
        } else {
            const newSet = new Set(selectedAccountIDs).add(option.accountID.toString());
            setSelectedAccountIDs(newSet);
            onSelectionChange?.(Array.from(newSet));
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
export type {ContactState, UseSearchSelectorConfig, UseSearchSelectorReturn};
