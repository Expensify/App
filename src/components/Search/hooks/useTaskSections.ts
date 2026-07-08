import type {SearchListItem} from '@components/Search/SearchList/ListItem/types';
import {stampSearchHighlights} from '@components/Search/searchSectionHighlights';
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
 */
function useTaskSections({shell, queryJSON, searchResults}: UseTaskSectionsParams): SearchSections {
    const {type, status, sortBy, sortOrder, hash} = queryJSON;
    const {shouldComputeSections, searchDataWithOptimisticTransaction, trackingState} = shell;

    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const reportAttributesDerivedValue = useReportAttributes();

    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);

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

    const chartData = useMemo<SearchListItem[]>(() => {
        if (!shouldComputeSections) {
            return EMPTY_DATA;
        }
        const sortInput = filteredData as Parameters<typeof getSortedSections>[2];
        return stampSearchHighlights(getSortedSections(type, status, sortInput, localeCompare, translate, sortBy, sortOrder), hash, () => false);
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
        hasDeletedTransaction: false,
        columns,
        hasLoadedAllTransactions: true,
        hasCachedOptimisticItem,
    };
}

export default useTaskSections;
