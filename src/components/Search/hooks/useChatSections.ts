import type {ReportActionListItemType, SearchListItem} from '@components/Search/SearchList/ListItem/types';
import type {SearchData, SearchQueryJSON} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';
import useReportAttributes from '@hooks/useReportAttributes';

import {getReportActionsSections, getSortedSections} from '@libs/SearchUIUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type SearchResults from '@src/types/onyx/SearchResults';

import {useMemo} from 'react';

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
 * Section builder for the chat search view (`type === CHAT`).
 *
 * The chat builder reads only report actions from the snapshot plus the report-attributes derived value (for
 * report names); it needs none of the transaction/card/policy slices. So this hook subscribes to almost
 * nothing — only the report attributes — and reads locale from context directly. Because it mounts only
 * inside `ChatSectionsContainer`, every other search type never opens even these.
 */
function useChatSections({shell, queryJSON, searchResults, newSearchResultKeys}: UseChatSectionsParams): SearchSections {
    const {type, status, sortBy, sortOrder, hash} = queryJSON;
    const {shouldComputeSections, searchDataWithOptimisticTransaction, trackingState} = shell;

    const {translate, localeCompare} = useLocalize();
    const reportAttributesDerivedValue = useReportAttributes();

    // Stage 1: base sections from the (optimistically augmented) snapshot.
    // Memoized explicitly: React Compiler caches the inline callbacks but NOT the getReportActionsSections
    // call result, so without useMemo each render returns a fresh array. An unstable `filteredData` reference
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

        // The monolith never wired `visibleReportActionsData`, so it stays undefined here to preserve behavior.
        const [filtered, allLength] = getReportActionsSections(searchDataWithOptimisticTransaction, reportAttributesDerivedValue, undefined);

        return {
            filteredData: filtered as SearchData,
            filteredDataLength: filtered.length,
            allDataLength: allLength,
        };
    }, [shouldComputeSections, searchDataWithOptimisticTransaction, reportAttributesDerivedValue]);

    // Stage 2: sort the chat rows by date, then stamp the post-create highlight on each row. Chat rows are
    // report actions, so the highlight matches on the report-action key.
    const chartData = useMemo<SearchListItem[]>(() => {
        if (!shouldComputeSections) {
            return EMPTY_DATA;
        }
        const sortInput = filteredData as Parameters<typeof getSortedSections>[2];
        return getSortedSections(type, status, sortInput, localeCompare, translate, sortBy, sortOrder).map((item) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- chat rows carry a reportActionID
            const reportActionID = (item as ReportActionListItemType).reportActionID;
            const baseKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportActionID}`;
            const shouldAnimateInHighlight = !!newSearchResultKeys?.has(baseKey);

            if (item.shouldAnimateInHighlight === shouldAnimateInHighlight && item.hash === hash) {
                return item;
            }
            return {...item, shouldAnimateInHighlight, hash};
        });
    }, [shouldComputeSections, filteredData, type, status, localeCompare, translate, sortBy, sortOrder, newSearchResultKeys, hash]);

    // Keep the optimistic row visible across a snapshot-replacement gap.
    const {stableSortedData, hasCachedOptimisticItem} = useStableOptimisticSortedData(chartData, searchResults, trackingState);

    const columns = useSearchSectionColumns(queryJSON, searchResults);

    return {
        data: stableSortedData,
        chartData,
        filteredData,
        filteredDataLength,
        allDataLength,
        // Chat rows are never transactions, so nothing here can be a deleted transaction.
        hasDeletedTransaction: false,
        columns,
        // The chat view is never grouped, so it is always fully loaded.
        hasLoadedAllTransactions: true,
        hasCachedOptimisticItem,
    };
}

export default useChatSections;
export type {UseChatSectionsParams};
