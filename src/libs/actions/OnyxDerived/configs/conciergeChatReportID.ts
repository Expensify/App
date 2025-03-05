import {isThread} from '@libs/ReportUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.CONCIERGE_CHAT_REPORT_ID,
    dependencies: [ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.CONCIERGE_REPORT_ID],
    compute: ([reports, conciergeChatReportID]) => {
        if (!reports) {
            return undefined;
        }

        const conciergeReport = Object.values(reports).find((report) => {
            if (!report?.participants || isThread(report)) {
                return false;
            }

            const participantAccountIDs = new Set(Object.keys(report.participants));
            if (participantAccountIDs.size !== 2) {
                return false;
            }

            return participantAccountIDs.has(CONST.ACCOUNT_ID.CONCIERGE.toString()) || report?.reportID === conciergeChatReportID;
        });

        return conciergeReport?.reportID;
    },
});
