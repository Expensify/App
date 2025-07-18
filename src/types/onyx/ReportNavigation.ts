import type {SearchParams} from '@components/Search/types';

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
    hasMoreResults: boolean;
} & SearchParams;

export default LastSearchParams;
