import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

// Threads nest, but never deeper than this in practice, so a broken parent chain can't loop forever
const MAX_THREAD_DEPTH = 10;

/** The thread of the Concierge DM that the report is, or is nested under, or the DM itself. It imports nothing that parses paths, so path parsing can use it. */
function getConciergeConversationReportID(reportID: string | undefined, conciergeReportID: string | undefined, reports: OnyxCollection<Report>): string | undefined {
    if (!reportID || !conciergeReportID) {
        return undefined;
    }
    let currentReportID: string | undefined = reportID;
    for (let depth = 0; currentReportID && depth <= MAX_THREAD_DEPTH; depth++) {
        if (currentReportID === conciergeReportID) {
            return currentReportID;
        }
        const parentReportID: string | undefined = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${currentReportID}`]?.parentReportID;
        if (parentReportID === conciergeReportID) {
            return currentReportID;
        }
        currentReportID = parentReportID;
    }
    return undefined;
}

/** Whether the report is the Concierge DM or a thread under it at any depth */
function isInConciergeConversation(reportID: string | undefined, conciergeReportID: string | undefined, reports: OnyxCollection<Report>): boolean {
    return !!getConciergeConversationReportID(reportID, conciergeReportID, reports);
}

export default isInConciergeConversation;
export {getConciergeConversationReportID};
