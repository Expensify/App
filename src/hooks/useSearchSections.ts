import {useEffect, useMemo} from 'react';
import {useSearchActionsContext} from '@components/Search/SearchContext';
import type {SearchColumnType, SearchGroupBy, SearchStatus, SortOrder} from '@components/Search/types';
import {getSortedSections} from '@libs/SearchUIUtils';
import type {ListItemDataType, SearchDataTypes} from '@src/types/onyx/SearchResults';
import useLocalize from './useLocalize';

/**
 * Sorts search result sections and persists the sorted report IDs to Search context
 * so that MoneyRequestReportNavigation can read them without any recomputation.
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
    const {setSortedReportIDs} = useSearchActionsContext();

    const sortedItems = useMemo(
        () => getSortedSections(type, status, data, localeCompare, translate, sortBy, sortOrder, groupBy),
        [type, status, data, localeCompare, translate, sortBy, sortOrder, groupBy],
    );

    useEffect(() => {
        const reportIDs = sortedItems.map((item) => item.reportID);

        setSortedReportIDs(reportIDs);
    }, [sortedItems, setSortedReportIDs]);

    return sortedItems;
}

export default useSearchSections;
