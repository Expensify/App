import Log from '@libs/Log';
import {isArchivedReportWithID, isThread} from '@libs/ReportUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.CONCIERGE_CHAT_REPORT_ID,
    dependencies: [ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.CONCIERGE_REPORT_ID, ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS],
    compute: ([reports, conciergeChatReportID, allReportNameValuePair]) => {
        if (!reports || !allReportNameValuePair) {
            return undefined;
        }

        const conciergeReport = Object.values(reports).find((report) => {
            // Merged accounts can have multiple conceirge chats, exclude archived chats.
            if (!report?.participants || isThread(report) || isArchivedReportWithID(report?.reportID)) {
                return false;
            }

            const participantAccountIDs = new Set(Object.keys(report.participants));
            if (participantAccountIDs.size !== 2) {
                return false;
            }

            const hasConciergeInChat = participantAccountIDs.has(CONST.ACCOUNT_ID.CONCIERGE.toString());
            if (hasConciergeInChat && report?.reportID !== conciergeChatReportID) {
                Log.hmmm('Found concierge in a chat not matching conciergeChatReportID from Auth', {reportID: report?.reportID, conciergeChatReportID});
            }
            return hasConciergeInChat || report?.reportID === conciergeChatReportID;
        });

        return conciergeReport?.reportID;
    },
});
