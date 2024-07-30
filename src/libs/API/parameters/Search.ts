import type {SearchQueryString} from '@components/Search/types';

type SearchParams = {
    hash: number;
    jsonQuery: SearchQueryString;
    offset?: number;
};

export default SearchParams;
