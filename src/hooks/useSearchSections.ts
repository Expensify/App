import {useMemo} from 'react';
import type {SearchColumnType, SearchGroupBy, SearchStatus, SortOrder} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import {getSortedSections} from '@libs/SearchUIUtils';
import type {ListItemDataType, SearchDataTypes} from '@src/types/onyx/SearchResults';

/**
 * Sorts search result sections. The sorted report IDs are persisted to Search context
 * by the caller so that MoneyRequestReportNavigation can read them without any recomputation.
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

    return useMemo(
        () => getSortedSections(type, status, data, localeCompare, translate, sortBy, sortOrder, groupBy),
        [type, status, data, localeCompare, translate, sortBy, sortOrder, groupBy],
    );
}

export default useSearchSections;
