import CONST from '@src/CONST';

import type {Dispatch, SetStateAction} from 'react';

import {useState} from 'react';

type LiveRowLimit = {
    liveRowLimit: number;

    /** Offset of the last page the server answered. Unlike the snapshot offset, which every search() caller rewrites, it only moves forward. */
    answeredOffset: number;

    setRevealedLiveRows: Dispatch<SetStateAction<number>>;
};

/** Row cap for a live (to-do) search. Reset rides on `<Search key={queryJSON.hash}>` remounting, so there is no reset here. */
function useLiveRowLimit(offset = 0, hasUnconfirmedPage = false): LiveRowLimit {
    // offset is written when the request fires, so a page still running or failed there only confirms the one before it
    const confirmedOffset = Math.max(0, hasUnconfirmedPage ? offset - CONST.SEARCH.RESULTS_PAGE_SIZE : offset);

    // a refresh rewinds offset to 0, but the pages past it already answered and their rows are still in Onyx
    const [answeredOffset, setAnsweredOffset] = useState(confirmedOffset);
    if (answeredOffset < confirmedOffset) {
        setAnsweredOffset(confirmedOffset);
    }
    const currentAnsweredOffset = Math.max(answeredOffset, confirmedOffset);
    const answeredRows = currentAnsweredOffset + CONST.SEARCH.RESULTS_PAGE_SIZE;

    const [revealedRows, setRevealedRows] = useState(answeredRows);
    if (revealedRows < answeredRows) {
        setRevealedRows(answeredRows);
    }

    return {liveRowLimit: Math.max(revealedRows, answeredRows), answeredOffset: currentAnsweredOffset, setRevealedLiveRows: setRevealedRows};
}

export default useLiveRowLimit;
