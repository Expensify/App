import type {SearchListItem} from '@components/Search/SearchList/ListItem/types';
import {getReportActionRowShouldAnimate, stampSearchHighlights} from '@components/Search/searchSectionHighlights';
import type {SearchData, SearchQueryJSON} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';
import useReportAttributes from '@hooks/useReportAttributes';

import {getReportActionsSections, getSortedSections} from '@libs/SearchUIUtils';

import type SearchResults from '@src/types/onyx/SearchResults';

import type {SearchSections} from './useExpenseReportSections';
import type {SearchShell} from './useSearchShell';

import useSearchSectionColumns from './useSearchSectionColumns';
import useStableOptimisticSortedData from './useStableOptimisticSortedData';

type UseChatSectionsParams = {
    /** Shared type-agnostic core (optimistic tracking + the compute gate). */
    shell: SearchShell;
    queryJSON: Readonly<SearchQueryJSON>;
    /** The current search snapshot, owned by the ancestor and passed in. */
    searchResults: SearchResults | undefined;
    /** Keys flagged for the post-create highlight animation. */
    newSearchResultKeys: Set<string> | null | undefined;
};

const EMPTY_DATA: SearchListItem[] = [];
const EMPTY_FILTERED_DATA: SearchData = [];

/**
 * Section builder for the chat search view (`type === CHAT`). Subscribes only to report attributes (for
 * report names) and reads locale from context — none of the transaction/card/policy slices.
 */
function useChatSections({shell, queryJSON, searchResults, newSearchResultKeys}: UseChatSectionsParams): SearchSections {
    const {type, sortBy, sortOrder, hash} = queryJSON;
    const {shouldComputeSections, searchDataWithOptimisticTransaction, trackingState} = shell;

    const {translate, localeCompare} = useLocalize();
    const reportAttributesDerivedValue = useReportAttributes();

    let filteredData: SearchData = EMPTY_FILTERED_DATA;
    let filteredDataLength = 0;
    let allDataLength = 0;
    if (shouldComputeSections && searchDataWithOptimisticTransaction) {
        const [filtered, allLength] = getReportActionsSections(searchDataWithOptimisticTransaction, reportAttributesDerivedValue, undefined);
        filteredData = filtered as SearchData;
        filteredDataLength = filtered.length;
        allDataLength = allLength;
    }

    const chartData: SearchListItem[] = !shouldComputeSections
        ? EMPTY_DATA
        : stampSearchHighlights(getSortedSections(type, filteredData as Parameters<typeof getSortedSections>[1], localeCompare, translate, sortBy, sortOrder), hash, (item) =>
              getReportActionRowShouldAnimate(item, newSearchResultKeys),
          );

    const {stableSortedData, hasCachedOptimisticItem} = useStableOptimisticSortedData(chartData, searchResults, trackingState);

    const columns = useSearchSectionColumns(queryJSON, searchResults);

    return {
        data: stableSortedData,
        chartData,
        filteredData,
        filteredDataLength,
        allDataLength,
        columns,
        hasCachedOptimisticItem,
    };
}

export default useChatSections;
