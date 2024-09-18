import type {SearchQueryString} from '@components/Search/types';

type SaveSearchParams = {
    jsonQuery: SearchQueryString;
    name?: string;
};

export default SaveSearchParams;
