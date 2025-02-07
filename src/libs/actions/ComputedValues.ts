import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {isConciergeChatReport, isThread} from '@libs/ReportUtils';
import CONST from '@src/CONST';

const computeReports = (reports: OnyxCollection<Report>) => {
    if (!reports) {
        return {};
    }
    return Object.values(reports).reduce((acc, report) => {
        if (!report) {
            return acc;
        }

        const isConciergeChat = isConciergeChatReport(report);
        acc[report.reportID] = {
            isConciergeChat,
        };

        return acc;
    }, {} as Record<string, Report>);
};

const findConciergeChatReportID = (reports: OnyxCollection<Report>, conciergeChatReportID: OnyxEntry<string>) => {
    if (!reports) {
        return null;
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
};

export {computeReports, findConciergeChatReportID};
