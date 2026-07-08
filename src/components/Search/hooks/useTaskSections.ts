import type {SearchListItem} from '@components/Search/SearchList/ListItem/types';
import type {SearchData, SearchQueryJSON} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportAttributes from '@hooks/useReportAttributes';

import {getSortedSections, getTaskSections} from '@libs/SearchUIUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type SearchResults from '@src/types/onyx/SearchResults';

import {useMemo} from 'react';

import type {SearchSections} from './useExpenseReportSections';
import type {SearchShell} from './useSearchShell';

import useSearchSectionColumns from './useSearchSectionColumns';
import useStableOptimisticSortedData from './useStableOptimisticSortedData';

type UseTaskSectionsParams = {
    /** Shared type-agnostic core (optimistic tracking + the compute gate). */
    shell: SearchShell;
    queryJSON: Readonly<SearchQueryJSON>;
    /** The current search snapshot, owned by the ancestor and passed in. */
    searchResults: SearchResults | undefined;
    /** Keys flagged for the post-create highlight animation. Unused for tasks (task rows carry no
     *  transaction/report-action key), kept for provider symmetry. */
    newSearchResultKeys: Set<string> | null | undefined;
};

const EMPTY_DATA: SearchListItem[] = [];
const EMPTY_FILTERED_DATA: SearchData = [];

/**
 * Section builder for the task search view (`type === TASK`).
 *
 * The task builder reads report NVPs, the concierge report id, and the report-attributes derived value (for
 * parent-report names/icons); it reads personal details straight off the snapshot, not a subscription. So
 * this hook subscribes to only that narrow slice and reads locale from context directly. Because it mounts
 * only inside `TaskSectionsContainer`, every other search type never opens these.
 */
function useTaskSections({shell, queryJSON, searchResults}: UseTaskSectionsParams): SearchSections {
    const {type, status, sortBy, sortOrder, hash} = queryJSON;
    const {shouldComputeSections, searchDataWithOptimisticTransaction, trackingState} = shell;

    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const reportAttributesDerivedValue = useReportAttributes();

    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);

    // Stage 1: base sections from the (optimistically augmented) snapshot.
    // Memoized explicitly: React Compiler caches the inline callbacks but NOT the getTaskSections call
    // result, so without useMemo each render returns a fresh array. An unstable `filteredData` reference
    // drives useStableOptimisticSortedData's setState effect into an infinite render loop during the
    // optimistic-create flow ("Maximum update depth exceeded").
    const {filteredData, filteredDataLength, allDataLength} = useMemo<{
        filteredData: SearchData;
        filteredDataLength: number;
        allDataLength: number;
    }>(() => {
        if (!shouldComputeSections || !searchDataWithOptimisticTransaction) {
            return {filteredData: EMPTY_FILTERED_DATA, filteredDataLength: 0, allDataLength: 0};
        }

        const [filtered, allLength] = getTaskSections(
            searchDataWithOptimisticTransaction,
            formatPhoneNumber,
            translate,
            conciergeReportID,
            reportNameValuePairs,
            reportAttributesDerivedValue,
        );

        return {
            filteredData: filtered as SearchData,
            filteredDataLength: filtered.length,
            allDataLength: allLength,
        };
    }, [shouldComputeSections, searchDataWithOptimisticTransaction, formatPhoneNumber, translate, conciergeReportID, reportNameValuePairs, reportAttributesDerivedValue]);

    // Stage 2: sort the task rows. Task rows have no transaction/report-action key, so the post-create
    // highlight never applies — every row is stamped with `shouldAnimateInHighlight: false` (matching the
    // monolith) plus the current query hash.
    const chartData = useMemo<SearchListItem[]>(() => {
        if (!shouldComputeSections) {
            return EMPTY_DATA;
        }
        const sortInput = filteredData as Parameters<typeof getSortedSections>[2];
        return getSortedSections(type, status, sortInput, localeCompare, translate, sortBy, sortOrder).map((item) => {
            if (item.shouldAnimateInHighlight === false && item.hash === hash) {
                return item;
            }
            return {...item, shouldAnimateInHighlight: false, hash};
        });
    }, [shouldComputeSections, filteredData, type, status, localeCompare, translate, sortBy, sortOrder, hash]);

    // Keep the optimistic row visible across a snapshot-replacement gap.
    const {stableSortedData, hasCachedOptimisticItem} = useStableOptimisticSortedData(chartData, searchResults, trackingState);

    const columns = useSearchSectionColumns(queryJSON, searchResults);

    return {
        data: stableSortedData,
        chartData,
        filteredData,
        filteredDataLength,
        allDataLength,
        // Task rows are never transactions, so nothing here can be a deleted transaction.
        hasDeletedTransaction: false,
        columns,
        // The task view is never grouped, so it is always fully loaded.
        hasLoadedAllTransactions: true,
        hasCachedOptimisticItem,
    };
}

export default useTaskSections;
export type {UseTaskSectionsParams};
