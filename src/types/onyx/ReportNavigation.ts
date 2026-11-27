import type {SearchQueryJSON} from '@components/Search/types';

import type {SearchKey} from '@libs/SearchKeyUtils';
/**
 * Represents the parameters from the previous search invocation.
 * This is used to persist search arguments between navigations within reports.
 */
type LastSearchParams = {
    queryJSON?: Readonly<SearchQueryJSON>;

    /**
     *Optional witch field contain search key for last search performed
     */
    searchKey?: SearchKey;
};

export default LastSearchParams;
