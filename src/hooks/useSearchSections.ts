import {useEffect, useMemo, useRef} from 'react';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {SearchColumnType, SearchGroupBy, SearchStatus, SortOrder} from '@components/Search/types';
import {saveSortedReportIDs} from '@libs/actions/ReportNavigation';
import {getSortedSections} from '@libs/SearchUIUtils';
import type {ListItemDataType, SearchDataTypes} from '@src/types/onyx/SearchResults';

/**
 * Sorts search result sections and persists the sorted report IDs to Onyx so that
 * useSearchSectionsState can read them in MoneyRequestReportNavigation without any recomputation.
 */
function useSearchSections<T extends SearchDataTypes, S extends SearchStatus>(
    type: T,
    status: S,
    data: ListItemDataType<T, S>,
    localeCompare: LocaleContextProps['localeCompare'],
    translate: LocaleContextProps['translate'],
    sortBy?: SearchColumnType,
    sortOrder?: SortOrder,
    groupBy?: SearchGroupBy,
) {
    const prevSortedKeyRef = useRef('');

    const sortedItems = useMemo(
        () => getSortedSections(type, status, data, localeCompare, translate, sortBy, sortOrder, groupBy),
        [type, status, data, localeCompare, translate, sortBy, sortOrder, groupBy],
    );

    useEffect(() => {
        const reportIDs = sortedItems.map((item) => item.reportID);
        const sortedKey = reportIDs.join(',');
        if (sortedKey === prevSortedKeyRef.current) {
            return;
        }
        prevSortedKeyRef.current = sortedKey;
        saveSortedReportIDs(reportIDs);
    }, [sortedItems]);

    return sortedItems;
}

export default useSearchSections;
