import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {getOriginalMessage, isClosedAction} from '@libs/ReportActionsUtils';
import {getPolicyIDsWithEmptyReportsForAccount, isOpenExpenseReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {Report, ReportActions, Transaction} from '@src/types/onyx';
import {getLastClosedReportAction} from './ReportAction';

type OpenExpenseReportIDMap = Record<string, true>;

function getArchiveReason(reportActions: OnyxEntry<ReportActions>): ValueOf<typeof CONST.REPORT.ARCHIVE_REASON> | undefined {
    const lastClosedReportAction = getLastClosedReportAction(reportActions);

    if (!lastClosedReportAction) {
        return undefined;
    }

    return isClosedAction(lastClosedReportAction) ? getOriginalMessage(lastClosedReportAction)?.reason : CONST.REPORT.ARCHIVE_REASON.DEFAULT;
}

function getReportChatType(report: OnyxEntry<Report>) {
    return report?.chatType;
}

function getReportPolicyID(report: OnyxEntry<Report>) {
    return report?.policyID;
}

function getReportOwnerAccountID(report: OnyxEntry<Report>) {
    return report?.ownerAccountID;
}

const policyIDsWithEmptyReportsSelector =
    (accountID: number | undefined, transactionsByReportID: Record<string, Transaction[]>, hasDismissedEmptyReportsConfirmation: boolean) => (reports: OnyxCollection<Report>) => {
        if (hasDismissedEmptyReportsConfirmation || !accountID) {
            return {};
        }
        return getPolicyIDsWithEmptyReportsForAccount(reports, accountID, transactionsByReportID);
    };

function openExpenseReportIDsSelector(reports: OnyxCollection<Report>): OpenExpenseReportIDMap {
    if (!reports) {
        return {};
    }

    const openExpenseReportIDMap: OpenExpenseReportIDMap = {};
    for (const currentReport of Object.values(reports)) {
        if (!isOpenExpenseReport(currentReport) || !currentReport?.reportID) {
            continue;
        }

        openExpenseReportIDMap[currentReport.reportID] = true;
    }

    return openExpenseReportIDMap;
}

const policyRoomNamesSelector =
    (policyID: string) =>
    (reports: OnyxCollection<Report>): string[] => {
        const names: string[] = [];
        for (const report of Object.values(reports ?? {})) {
            if (report?.policyID === policyID && report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_ROOM && report?.reportName) {
                names.push(report.reportName);
            }
        }
        return names;
    };

export {getArchiveReason, getReportChatType, getReportOwnerAccountID, getReportPolicyID, policyIDsWithEmptyReportsSelector, openExpenseReportIDsSelector, policyRoomNamesSelector};
