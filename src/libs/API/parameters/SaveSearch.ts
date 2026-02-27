import type {SearchQueryString} from '@components/Search/types';

type SaveSearchParams = {
    jsonQuery: SearchQueryString;
    newName?: string;
};

export default SaveSearchParams;
