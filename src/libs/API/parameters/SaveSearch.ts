import type {SearchQueryString} from '@components/Search/types';

type SaveSearchParams = {
    jsonQuery: SearchQueryString;
    newName?: string;

    /** Hash of a previously saved search this save should override (used when editing a saved view changes its query) */
    previousHash?: number;
};

export default SaveSearchParams;
