import CONST from '@src/CONST';

import type {Dispatch, SetStateAction} from 'react';

import {useState} from 'react';

type LiveRowLimit = {
    liveRowLimit: number;
    setRevealedLiveRows: Dispatch<SetStateAction<number>>;
};

/** Row cap for a live (to-do) search. Reset rides on `<Search key={queryJSON.hash}>` remounting, so there is no reset here. */
function useLiveRowLimit(offset = 0, isLoading = false): LiveRowLimit {
    // offset is written when the request fires, so hold the cap there until isLoading clears
    const requestedRows = Math.max(CONST.SEARCH.RESULTS_PAGE_SIZE, isLoading ? offset : offset + CONST.SEARCH.RESULTS_PAGE_SIZE);

    // never lower the cap: a refresh rewinds offset to 0 but those rows are still in Onyx
    const [revealedRows, setRevealedRows] = useState<number>(requestedRows);
    if (revealedRows < requestedRows) {
        setRevealedRows(requestedRows);
    }

    return {liveRowLimit: Math.max(revealedRows, requestedRows), setRevealedLiveRows: setRevealedRows};
}

export default useLiveRowLimit;
