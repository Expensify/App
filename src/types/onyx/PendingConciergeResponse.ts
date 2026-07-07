import type ReportAction from './ReportAction';

/** Pending concierge response queued for delayed display in a report */
type PendingConciergeResponse = {
    /** The optimistic report action to add after the delay */
    reportAction: ReportAction;

    /** Timestamp (ms) after which the response should be displayed */
    displayAfter: number;
};

export default PendingConciergeResponse;
