import type {OnyxEntry} from 'react-native-onyx';
import {isMoneyRequestReport as isMoneyRequestReportReportUtils} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTagLists, Report} from '@src/types/onyx';
import useMoneyRequestPolicyTags from './useMoneyRequestPolicyTags';
import useOnyx from './useOnyx';

type UseMoneyRequestPolicyTagsForReportParams = {
    report: OnyxEntry<Report>;
    participantReportID?: string;
    existingIOUReportPolicyID?: string;
};

// Report-centric wrapper around useMoneyRequestPolicyTags: derives moneyRequestReportID and the parent-chat policy ID from `report`.
function useMoneyRequestPolicyTagsForReport({report, participantReportID, existingIOUReportPolicyID}: UseMoneyRequestPolicyTagsForReportParams): PolicyTagLists {
    const isMoneyRequestReport = isMoneyRequestReportReportUtils(report);
    const chatReportID = isMoneyRequestReport ? report?.chatReportID : undefined;
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`);
    const [chatReportDraft] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${chatReportID}`);

    const currentChatReport = isMoneyRequestReport ? (chatReport ?? chatReportDraft) : report;
    const moneyRequestReportID = isMoneyRequestReport ? report?.reportID : '';

    return useMoneyRequestPolicyTags({
        existingIOUReportPolicyID,
        moneyRequestReportID,
        parentChatReportPolicyID: currentChatReport?.policyID,
        participantReportID,
    });
}

export default useMoneyRequestPolicyTagsForReport;
