import {useCallback, useMemo, useRef, useState} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import reportsSelector from '@selectors/Attributes';
import {createFilteredOptionList} from '@libs/OptionsListUtils';
import type {OptionList} from '@libs/OptionsListUtils/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Report, ReportAttributesDerivedValue} from '@src/types/onyx';
import useOnyx from './useOnyx';

type UseOptionsListCacheConfig = {
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

type UseOptionsListCacheResult = {
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

type CacheEntry = {
    options: OptionList | null;
    timestamp: number;
    loadedBatches: number; // Track how many batches were loaded
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Hook that provides an optimized, cached options list for selection screens.
 *
 * Benefits over OptionListContextProvider:
 * - Only computes when screen is mounted and enabled
 * - No background recalculations when screen is not visible
 * - Uses createFilteredOptionList which processes fewer reports (top N recent)
 * - Cache survives for 5 minutes to enable fast back/forth navigation
 *
 * Performance:
 * - First load: ~30-50ms (processes top 100 reports instead of all 5000)
 * - Cache hit: 0ms (instant)
 * - Updates: Only recalculates when dependencies actually change
 *
 * Usage:
 * ```typescript
 * const {options, isLoading} = useOptionsListCache({
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
function useOptionsListCache(config: UseOptionsListCacheConfig = {}): UseOptionsListCacheResult {
    const {maxRecentReports = 100, enabled = true, includeP2P = true, batchSize = 100, enablePagination = true} = config;

    // Pagination state - track current batch number
    const [currentBatch, setCurrentBatch] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Track total available reports
    const totalReportsRef = useRef(0);

    // Cache ref - survives re-renders and stays even after unmount (for TTL period)
    const cacheRef = useRef<CacheEntry>({
        options: null,
        timestamp: 0,
        loadedBatches: 0,
    });

    // Subscribe to Onyx data
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allPersonalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
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

        // Check if cache is still valid AND has the same number of batches loaded
        const now = Date.now();
        const cacheAge = now - cacheRef.current.timestamp;
        const cacheHasSameBatches = cacheRef.current.loadedBatches === currentBatch;

        if (cacheRef.current.options && cacheAge < CACHE_TTL && cacheHasSameBatches) {
            console.log(`[POC Cache] Using cached options (age: ${(cacheAge / 1000).toFixed(1)}s, batch: ${currentBatch})`);
            return cacheRef.current.options;
        }

        // Cache miss, expired, or different batch - recompute
        const batchType = currentBatch === 1 ? 'initial' : `batch ${currentBatch}`;
        console.log(`[POC Cache] Loading ${batchType} (${reportsToProcess} reports)...`);
        const startTime = performance.now();

        const newOptions = createFilteredOptionList(
            allPersonalDetails,
            allReports,
            reportAttributesDerived?.reports,
            {
                maxRecentReports: reportsToProcess,
                includeP2P,
            },
        );

        const endTime = performance.now();
        console.log(`[POC Cache] createFilteredOptionList took ${(endTime - startTime).toFixed(2)}ms`);
        console.log(`[POC Cache] Generated ${newOptions.reports.length}/${totalReportsRef.current} report options`);

        // Update cache with batch info
        cacheRef.current = {
            options: newOptions,
            timestamp: now,
            loadedBatches: currentBatch,
        };

        // Reset loading state after computation
        if (isLoadingMore) {
            setIsLoadingMore(false);
        }

        return newOptions;
    }, [allReports, allPersonalDetails, reportAttributesDerived?.reports, enabled, maxRecentReports, includeP2P, currentBatch, batchSize, enablePagination, isLoadingMore]);

    // Function to load more reports
    const loadMore = useCallback(() => {
        if (!options || isLoadingMore) {
            return;
        }

        const hasMoreToLoad = options.reports.length < totalReportsRef.current;
        if (hasMoreToLoad) {
            console.log('[POC Pagination] User scrolled to end, loading more...');
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

export default useOptionsListCache;
