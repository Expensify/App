import type {SearchQueryJSON} from '@components/Search/types';

/**
 *hehhehehe
 */
type LastSearchParams = {
    /**
     *
     */
    previousLengthOfResults?: number;
    /**
     *
     */
    hasMoreResults?: boolean;

    /**
     *
     */
    queryJSON: SearchQueryJSON;
    /**
     *
     */
    offset?: number;
};

export default LastSearchParams;
