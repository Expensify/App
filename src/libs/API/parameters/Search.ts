import type {SortOrder} from '@libs/SearchUtils';

type SearchParams = {
    hash: number;
    query: string;
    policyIDs?: string;
    sortBy?: string;
    sortOrder?: SortOrder;
    offset: number;
};

export default SearchParams;
