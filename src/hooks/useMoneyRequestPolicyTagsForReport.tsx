import type {OnyxEntry} from 'react-native-onyx';
import {getReportOrDraftReport, isMoneyRequestReport as isMoneyRequestReportReportUtils} from '@libs/ReportUtils';
import type {PolicyTagLists, Report} from '@src/types/onyx';
import useMoneyRequestPolicyTags from './useMoneyRequestPolicyTags';

type UseMoneyRequestPolicyTagsForReportParams = {
    report: OnyxEntry<Report>;
    participantReportID?: string;
    existingIOUReportPolicyID?: string;
};

// Report-centric wrapper around useMoneyRequestPolicyTags: derives moneyRequestReportID and the parent-chat policy ID from `report`.
function useMoneyRequestPolicyTagsForReport({report, participantReportID, existingIOUReportPolicyID}: UseMoneyRequestPolicyTagsForReportParams): PolicyTagLists {
    const isMoneyRequestReport = isMoneyRequestReportReportUtils(report);
    const currentChatReport = isMoneyRequestReport ? getReportOrDraftReport(report?.chatReportID) : report;
    const moneyRequestReportID = isMoneyRequestReport ? report?.reportID : '';

    return useMoneyRequestPolicyTags({
        existingIOUReportPolicyID,
        moneyRequestReportID,
        parentChatReportPolicyID: currentChatReport?.policyID,
        participantReportID,
    });
}

export default useMoneyRequestPolicyTagsForReport;
