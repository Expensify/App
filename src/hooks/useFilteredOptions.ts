import reportsSelector from '@selectors/Attributes';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {createFilteredOptionList} from '@libs/OptionsListUtils';
import type {OptionList} from '@libs/OptionsListUtils/types';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

type UseFilteredOptionsConfig = {
    /** Maximum number of recent reports to process for initial load (default: 100) */
    maxRecentReports?: number;
    /** Whether the hook should be enabled (default: true) */
    enabled?: boolean;
    /** Whether to include P2P personal details (default: true) */
    includeP2P?: boolean;
    /** Number of reports to load per batch when paginating (default: 100) */
    batchSize?: number;
    /** Whether to enable dynamic loading/pagination (default: true) */
    enablePagination?: boolean;
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
 * Hook that provides an optimized, filtered options list for selection screens.
 *
 * Benefits over OptionListContextProvider:
 * - Only computes when screen is mounted and enabled
 * - No background recalculations when screen is not visible
 * - Filters and limits reports before processing (processes top N recent only)
 * - Recalculates only when dependencies change
 *
 * Usage:
 * ```typescript
 * const {options, isLoading} = useFilteredOptions({
 *   maxRecentReports: 100,
 *   enabled: didScreenTransitionEnd,
 * });
 *
 * <SelectionList
 *   sections={isLoading ? [] : sections}
 *   showLoadingPlaceholder={isLoading}
 * />
 * ```
 */
function useFilteredOptions(config: UseFilteredOptionsConfig = {}): UseFilteredOptionsResult {
    const {maxRecentReports = 100, enabled = true, includeP2P = true, batchSize = 100, enablePagination = true} = config;

    // Pagination state - track current batch number
    const [currentBatch, setCurrentBatch] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Track total available reports
    const totalReportsRef = useRef(0);

    // Subscribe to Onyx data
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const [allPersonalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});
    const [reportAttributesDerived] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {
        canBeMissing: true,
        selector: reportsSelector,
    });

    const options = useMemo(() => {
        // If disabled or data not ready, return null
        if (!enabled || !allReports || !allPersonalDetails) {
            return null;
        }

        // Calculate total reports available
        totalReportsRef.current = Object.keys(allReports).length;

        // Calculate how many reports to process based on pagination
        const reportsToProcess = enablePagination ? currentBatch * batchSize : maxRecentReports;

        return createFilteredOptionList(allPersonalDetails, allReports, reportAttributesDerived, {
            maxRecentReports: reportsToProcess,
            includeP2P,
        });
    }, [allReports, allPersonalDetails, reportAttributesDerived, enabled, maxRecentReports, includeP2P, currentBatch, batchSize, enablePagination]);

    // Reset loading state after options are computed
    useEffect(() => {
        if (!isLoadingMore || !options) {
            return;
        }
        setIsLoadingMore(false);
    }, [options, isLoadingMore]);

    // Function to load more reports
    const loadMore = useCallback(() => {
        if (!options || isLoadingMore) {
            return;
        }

        const hasMoreToLoad = options.reports.length < totalReportsRef.current;
        if (hasMoreToLoad) {
            setIsLoadingMore(true);
            setCurrentBatch((prev) => prev + 1);
        }
    }, [options, isLoadingMore]);

    // Calculate if there are more reports to load
    const hasMore = options ? options.reports.length < totalReportsRef.current : false;

    return {
        options,
        isLoading: enabled && !options,
        loadMore,
        hasMore,
        isLoadingMore,
    };
}

export default useFilteredOptions;
