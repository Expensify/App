import CONST from '@src/CONST';

import {useState} from 'react';

/** Row cap for a live (to-do) search. Reset rides on `<Search key={queryJSON.hash}>` remounting, so there is no reset here. */
function useLiveRowLimit(offset = 0, isLoading = false): number {
    // offset is written when the request fires, so hold the cap there until isLoading clears
    const requestedRows = Math.max(CONST.SEARCH.RESULTS_PAGE_SIZE, isLoading ? offset : offset + CONST.SEARCH.RESULTS_PAGE_SIZE);

    // never lower the cap: a refresh rewinds offset to 0 but those rows are still in Onyx
    const [revealedRows, setRevealedRows] = useState<number>(requestedRows);
    if (revealedRows < requestedRows) {
        setRevealedRows(requestedRows);
    }

    return Math.max(revealedRows, requestedRows);
}

export default useLiveRowLimit;
