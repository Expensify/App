import reportsSelector from '@selectors/Attributes';
import {useEffect, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {createFilteredOptionList} from '@libs/OptionsListUtils';
import type {OptionList} from '@libs/OptionsListUtils/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type Beta from '@src/types/onyx/Beta';
import useOnyx from './useOnyx';
import usePrivateIsArchivedMap from './usePrivateIsArchivedMap';

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
    /** Search term for filtering - when present, builds full report map for personal details (default: '') */
    searchTerm?: string;
    /** Beta features the user has access to */
    betas?: OnyxEntry<Beta[]>;
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
 *   betas,
 * });
 *
 * <SelectionList
 *   sections={isLoading ? [] : sections}
 *   showLoadingPlaceholder={isLoading}
 * />
 */
function useFilteredOptions(config: UseFilteredOptionsConfig = {}): UseFilteredOptionsResult {
    const {maxRecentReports = 500, enabled = true, includeP2P = true, batchSize = 100, searchTerm = '', betas} = config;

    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [reportsLimit, setReportsLimit] = useState(maxRecentReports);

    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const [allPersonalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});
    const [reportAttributesDerived] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {
        canBeMissing: true,
        selector: reportsSelector,
    });
    const privateIsArchivedMap = usePrivateIsArchivedMap();

    const totalReports = allReports ? Object.keys(allReports).length : 0;

    const options: OptionList | null =
        enabled && allReports && allPersonalDetails
            ? createFilteredOptionList(allPersonalDetails, privateIsArchivedMap, allReports, reportAttributesDerived, {
                  maxRecentReports: reportsLimit,
                  includeP2P,
                  searchTerm,
                  betas,
              })
            : null;

    // Reset loading state after options are computed
    useEffect(() => {
        if (!isLoadingMore || !options) {
            return;
        }
        setIsLoadingMore(false);
    }, [options, isLoadingMore]);

    const loadMore = () => {
        if (!options || isLoadingMore) {
            return;
        }

        const hasMoreToLoad = options.reports.length < totalReports;
        if (hasMoreToLoad) {
            setIsLoadingMore(true);
            setReportsLimit((prev) => prev + batchSize);
        }
    };

    const hasMore = options ? options.reports.length < totalReports : false;

    return {
        options,
        isLoading: !options,
        loadMore,
        hasMore,
        isLoadingMore,
    };
}

export default useFilteredOptions;
