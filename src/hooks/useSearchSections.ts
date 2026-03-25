import {useEffect, useMemo, useRef} from 'react';
import type {SearchColumnType, SearchGroupBy, SearchStatus, SortOrder} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import {saveSortedReportIDs} from '@libs/actions/ReportNavigation';
import {getSortedSections} from '@libs/SearchUIUtils';
import type {ListItemDataType, SearchDataTypes} from '@src/types/onyx/SearchResults';

/**
 * Sorts search result sections and persists the sorted report IDs to Onyx so that
 * report navigation can read them without heavy recomputation.
 */
function useSearchSections<T extends SearchDataTypes, S extends SearchStatus>(
    type: T,
    status: S,
    data: ListItemDataType<T, S>,
    sortBy?: SearchColumnType,
    sortOrder?: SortOrder,
    groupBy?: SearchGroupBy,
) {
    const {translate, localeCompare} = useLocalize();
    const prevReportIDs = useRef<Array<string | undefined> | null>(null);

    const sortedItems = useMemo(
        () => getSortedSections(type, status, data, localeCompare, translate, sortBy, sortOrder, groupBy),
        [type, status, data, localeCompare, translate, sortBy, sortOrder, groupBy],
    );

    useEffect(() => {
        const reportIDs = sortedItems.map((item) => item.reportID);

        // Persist once on first run (including empty arrays), then only when order/content changes.
        const hasChanged =
            prevReportIDs.current === null ||
            prevReportIDs.current.length !== reportIDs.length ||
            prevReportIDs.current.some((prevID, index) => prevID !== reportIDs[index]);

        if (hasChanged) {
            saveSortedReportIDs(reportIDs);
            prevReportIDs.current = reportIDs;
        }
    }, [sortedItems]);

    return sortedItems;
}

export default useSearchSections;
