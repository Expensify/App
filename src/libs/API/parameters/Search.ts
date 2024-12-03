import type {SearchQueryString} from '@components/Search/types';

type SearchParams = {
    hash: number;
    jsonQuery: SearchQueryString;
    // Tod this is temporary, remove top level policyIDs as part of: https://github.com/Expensify/App/issues/46592
    policyIDs?: string;
};

export default SearchParams;
