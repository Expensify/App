import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {isThread} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {Session} from '@src/types/onyx';

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

const computeReportsByPolicy = (reports: OnyxCollection<Report>, session: OnyxEntry<Session>) => {
    const currentUserAccountID = session?.accountID;

    if (!reports || !currentUserAccountID) {
        return {};
    }

    // Group potential reports by policyID for faster lookups
    return Object.values(reports).reduce((acc, report) => {
        if (!report?.policyID || report.ownerAccountID !== currentUserAccountID || (report.stateNum ?? 0) > 1) {
            return acc;
        }

        if (!acc[report.policyID]) {
            acc[report.policyID] = [];
        }
        acc[report.policyID].push(report);

        return acc;
    }, {} as Record<string, Report[]>);
};

export {findConciergeChatReportID, computeReportsByPolicy};
