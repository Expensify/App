import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {createFilteredOptionList} from '@libs/OptionsListUtils';
import type {OptionList} from '@libs/OptionsListUtils/types';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import {useCallback, useMemo, useState} from 'react';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import usePrivateIsArchivedMap from './usePrivateIsArchivedMap';
import useReportAttributes from './useReportAttributes';
import useSortedActions from './useSortedActions';

type UseFilteredOptionsConfig = {
    /** Maximum number of recent reports to pre-filter and process (default: 500). */
    maxRecentReports?: number;
    /** Whether the hook should be enabled (default: true) */
    enabled?: boolean;
    /** Whether to build contact shells. This value must match the downstream `includeP2P` value. */
    includeP2P: boolean;
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
    /** Function to expand the window to every available report in a single step */
    loadAll: () => void;
    /** Whether there are more reports available to load */
    hasMore: boolean;
    /** Whether currently loading the next batch */
    isLoadingMore: boolean;
    /**
     * Resolves a single report from the same reports snapshot `options` was built from. Consumers that need an
     * option's related report (e.g. its parent chat report) pass this to the option builders instead of making them
     * read a module-level `Onyx.connect()` cache, and without opening a second reports-collection subscription.
     */
    getReportByID: (reportID: string | undefined) => OnyxEntry<Report>;
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
 *   includeP2P: true,
 * });
 *
 * <SelectionList
 *   sections={isLoading ? [] : sections}
 *   shouldShowLoadingPlaceholder={isLoading}
 * />
 */
function useFilteredOptions(config: UseFilteredOptionsConfig): UseFilteredOptionsResult {
    const {maxRecentReports = 500, enabled = true, includeP2P, batchSize = 100, isSearching = false, deferContactsUntilSearch = false} = config;

    const [reportsLimit, setReportsLimit] = useState(maxRecentReports);

    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allPersonalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const reportAttributesDerived = useReportAttributes();
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});

    // Option building is locale-dependent, so a consumer that stays mounted through a language switch recomputes.
    const {preferredLocale, dateFnsLocale} = useLocalize();

    // Sorted report actions from the RAM_ONLY_SORTED_REPORT_ACTIONS derived value; a new reference on
    // every recompute, so it doubles as the report-actions invalidation signal for the option-list cache.
    const sortedActions = useSortedActions();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const privateIsArchivedMap = usePrivateIsArchivedMap();

    const totalReports = allReports ? Object.keys(allReports).length : 0;

    // Kept referentially stable so consumers can pass it into memoized option builders without busting their caches.
    const getReportByID = useCallback((reportID: string | undefined): OnyxEntry<Report> => allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`], [allReports]);

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
                      {currentUserAccountID, dateFnsLocale, conciergeReportID, maxRecentReports: reportsLimit, includeP2P, isSearching, deferContactsUntilSearch, locale: preferredLocale},
                      undefined,
                      undefined,
                      isTrackIntentUser,
                      sortedActions,
                  )
                : null,
        [
            enabled,
            allReports,
            allPersonalDetails,
            reportAttributesDerived,
            privateIsArchivedMap,
            allPolicies,
            conciergeReportID,
            reportsLimit,
            includeP2P,
            isSearching,
            deferContactsUntilSearch,
            preferredLocale,
            isTrackIntentUser,
            sortedActions,
            currentUserAccountID,
            dateFnsLocale,
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

    // Expand the window to cover every report in a single step. Used when the visible list is empty so the
    // option list is rebuilt once to surface any surviving row, instead of paginating batch-by-batch.
    const loadAll = useCallback(() => {
        setReportsLimit((prev) => (prev < totalReports ? totalReports : prev));
    }, [totalReports]);

    return {
        options,
        isLoading: !options,
        loadMore,
        loadAll,
        hasMore,
        // Options are derived synchronously from reportsLimit, so there is no
        // intermediate "loading" state between calling loadMore and the recomputed options.
        isLoadingMore: false,
        getReportByID,
    };
}

export default useFilteredOptions;
