/** Tells which reports belong to a Concierge conversation: the Concierge DM, its threads, and the threads nested under them. */
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

// Threads nest, but never deeper than this in practice, so a broken parent chain can't loop forever
const MAX_THREAD_DEPTH = 10;

type ConciergeConversationReport = Pick<Report, 'parentReportID'> & Partial<Pick<Report, 'type'>>;

/** Whether the report is a direct thread of the Concierge DM, support tickets included */
function isConciergeThread(report: OnyxEntry<Pick<Report, 'parentReportID'>>, conciergeReportID: string | undefined): boolean {
    return !!conciergeReportID && report?.parentReportID === conciergeReportID;
}

/** Whether the report is a thread of the Concierge DM that the Concierge page lists. Support tickets stay in the Inbox. */
function isConciergePageThread(report: OnyxEntry<ConciergeConversationReport>, conciergeReportID: string | undefined): boolean {
    return isConciergeThread(report, conciergeReportID) && report?.type !== CONST.REPORT.TYPE.SUPPORT_TICKET;
}

/** The thread of the Concierge DM that the report is, or is nested under, or the DM itself. */
function getConciergeConversationReportID(reportID: string | undefined, conciergeReportID: string | undefined, reports: OnyxCollection<ConciergeConversationReport>): string | undefined {
    if (!reportID || !conciergeReportID) {
        return undefined;
    }
    let currentReportID: string | undefined = reportID;
    for (let depth = 0; currentReportID && depth <= MAX_THREAD_DEPTH; depth++) {
        if (currentReportID === conciergeReportID) {
            return currentReportID;
        }
        const currentReport: OnyxEntry<ConciergeConversationReport> = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${currentReportID}`];
        const parentReportID: string | undefined = currentReport?.parentReportID;
        if (parentReportID === conciergeReportID) {
            return isConciergePageThread(currentReport, conciergeReportID) ? currentReportID : undefined;
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
export {getConciergeConversationReportID, isConciergePageThread, isConciergeThread};
