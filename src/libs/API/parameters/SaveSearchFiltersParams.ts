import type {SearchQueryString} from '@components/Search/types';

import type {InsightsSearchKey} from '@src/types/onyx';

type SaveSearchFiltersParams = {
    searchKey: InsightsSearchKey;
    inputQuery: SearchQueryString;
};

export default SaveSearchFiltersParams;
