import {createFilteredOptionList} from '@libs/OptionsListUtils';
import type {OptionList} from '@libs/OptionsListUtils/types';

import ONYXKEYS from '@src/ONYXKEYS';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import {useMemo, useState} from 'react';

import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import usePrivateIsArchivedMap from './usePrivateIsArchivedMap';
import useReportAttributes from './useReportAttributes';

type UseFilteredOptionsConfig = {
    /** Maximum number of recent reports to pre-filter and process (default: 500). */
    maxRecentReports?: number;
    /** Whether the hook should be enabled (default: true) */
    enabled?: boolean;
    /** Whether to include P2P personal details (default: true) */
    includeP2P?: boolean;
    /** Number of reports to load per batch when paginating (default: 100) */
    batchSize?: number;
    /** Whether to enable dynamic loading/pagination (default: true) */
    enablePagination?: boolean;
    /** Whether search mode is active - when true, builds full report map for personal details (default: false) */
    isSearching?: boolean;
    /**
     * When true, contacts (personal details) are only built while searching. Use on screens whose
     * idle/empty state does not show standalone contacts (e.g. the SearchRouter) to avoid building
     * an option per contact on open. Leave false for contact pickers (default: false).
     */
    deferContactsUntilSearch?: boolean;
};

type UseFilteredOptionsResult = {
    /** The computed options list (reports and personal details) */
    options: OptionList | null;
    /** Whether the options are currently being loaded (initial load) */
    isLoading: boolean;
    /** Function to load the next batch of reports */
    loadMore: () => void;
    /** Whether there are more reports available to load */
    hasMore: boolean;
    /** Whether currently loading the next batch */
    isLoadingMore: boolean;
};

/**
 * Hook that provides options list for selection screens with optimized pre-filtering.
 *
 * Benefits over OptionListContextProvider:
 * - Only computes when screen is mounted and enabled
 * - No background recalculations when screen is not visible
 * - Smart pre-filtering for performance (top 500 recent reports)
 * - Recalculates only when dependencies change
 *
 * Pre-filtering strategy:
 * - Filters out null/undefined reports only
 * - Sorts by lastVisibleActionCreated (most recent first)
 * - Processes top N reports (default 500)
 * - Business logic filtering handled by shouldReportBeInOptionList
 *
 * Usage:
 * const {options, isLoading} = useFilteredOptions({
 *   maxRecentReports: 500,
 *   enabled: didScreenTransitionEnd,
 * });
 *
 * <SelectionList
 *   sections={isLoading ? [] : sections}
 *   shouldShowLoadingPlaceholder={isLoading}
 * />
 */
function useFilteredOptions(config: UseFilteredOptionsConfig = {}): UseFilteredOptionsResult {
    const {maxRecentReports = 500, enabled = true, includeP2P = true, batchSize = 100, isSearching = false, deferContactsUntilSearch = false} = config;

    const [reportsLimit, setReportsLimit] = useState(maxRecentReports);

    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allPersonalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const reportAttributesDerived = useReportAttributes();
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});

    // Option building is locale-dependent, so a consumer that stays mounted through a language switch recomputes.
    const {preferredLocale} = useLocalize();

    const privateIsArchivedMap = usePrivateIsArchivedMap();

    const totalReports = allReports ? Object.keys(allReports).length : 0;

    // React Compiler can't prove referential stability for the destructured `config` param with default values, so explicit useMemo is required here.
    const options: OptionList | null = useMemo(
        () =>
            enabled && allReports && allPersonalDetails
                ? createFilteredOptionList(
                      allPersonalDetails,
                      allReports,
                      reportAttributesDerived,
                      privateIsArchivedMap,
                      allPolicies,
                      {
                          maxRecentReports: reportsLimit,
                          includeP2P,
                          isSearching,
                          deferContactsUntilSearch,
                          locale: preferredLocale,
                      },
                      undefined,
                      undefined,
                      isTrackIntentUser,
                  )
                : null,
        [
            enabled,
            allReports,
            allPersonalDetails,
            reportAttributesDerived,
            privateIsArchivedMap,
            allPolicies,
            reportsLimit,
            includeP2P,
            isSearching,
            deferContactsUntilSearch,
            preferredLocale,
            isTrackIntentUser,
        ],
    );

    // When isSearching is set to true, the createFilteredOptionList returns all reports
    const hasMore = !isSearching && options ? reportsLimit < totalReports : false;

    const loadMore = () => {
        if (!hasMore) {
            return;
        }
        setReportsLimit((prev) => prev + batchSize);
    };

    return {
        options,
        isLoading: !options,
        loadMore,
        hasMore,
        // Options are derived synchronously from reportsLimit, so there is no
        // intermediate "loading" state between calling loadMore and the recomputed options.
        isLoadingMore: false,
    };
}

export default useFilteredOptions;
