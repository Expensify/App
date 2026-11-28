import useHomeTodoAutoAdvance from '@hooks/useHomeTodoAutoAdvance';

import type {HomeTodoSearchKey} from '@src/types/onyx';

/**
 * Mounted only while a report from a Home to-do row is open, so the to-do data the auto-advance reads is subscribed to
 * only during the review.
 */
type HomeTodoReviewAutoAdvanceProps = {
    /** The report open on screen */
    reportID: string;

    /** The to-do row the review came from */
    searchKey: HomeTodoSearchKey;

    /** The row's reports, fixed when the user pressed `Begin` */
    reportIDs: string[];
};

function HomeTodoReviewAutoAdvance({reportID, searchKey, reportIDs}: HomeTodoReviewAutoAdvanceProps) {
    useHomeTodoAutoAdvance({reportID, searchKey, reportIDs});
    return null;
}

export default HomeTodoReviewAutoAdvance;
