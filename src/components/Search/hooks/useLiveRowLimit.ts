import CONST from '@src/CONST';

import {useState} from 'react';

type LiveRowLimit = {
    liveRowLimit: number;

    /** Offset of the last page the server answered. Unlike the snapshot offset, which every search() caller rewrites, it only moves forward. */
    answeredOffset: number;

    /** Shows one more page of live rows without the server, for when it has no pages left. */
    revealNextPage: () => void;
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

    const revealNextPage = () => setRevealedRows((rows) => rows + CONST.SEARCH.RESULTS_PAGE_SIZE);

    return {liveRowLimit: Math.max(revealedRows, answeredRows), answeredOffset: currentAnsweredOffset, revealNextPage};
}

export default useLiveRowLimit;
