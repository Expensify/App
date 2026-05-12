import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {getOriginalMessage, isClosedAction} from '@libs/ReportActionsUtils';
import {isOpenExpenseReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {Report, ReportActions} from '@src/types/onyx';
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

export {getArchiveReason, getReportChatType, getReportOwnerAccountID, getReportPolicyID, openExpenseReportIDsSelector};
