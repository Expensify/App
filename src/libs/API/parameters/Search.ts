import type {SortOrder} from '@components/Search/types';

type SearchParams = {
    hash: number;
    query: string;
    policyIDs?: string;
    sortBy?: string;
    sortOrder?: SortOrder;
    offset: number;
};

export default SearchParams;
