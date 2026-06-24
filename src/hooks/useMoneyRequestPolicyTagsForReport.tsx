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

    // Subscribe to the parent chat report's policyID (and its draft fallback) reactively, so the resolved policy tag key
    // updates if the chat report loads or changes after this hook first renders. Narrowed to the primitive policyID to
    // avoid re-rendering on unrelated report field changes (PERF-11).
    const [chatReportPolicyID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, {selector: (chatReport) => chatReport?.policyID});
    const [chatReportDraftPolicyID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${chatReportID}`, {selector: (chatReportDraft) => chatReportDraft?.policyID});

    const parentChatReportPolicyID = isMoneyRequestReport ? (chatReportPolicyID ?? chatReportDraftPolicyID) : report?.policyID;
    const moneyRequestReportID = isMoneyRequestReport ? report?.reportID : '';

    return useMoneyRequestPolicyTags({
        existingIOUReportPolicyID,
        moneyRequestReportID,
        parentChatReportPolicyID,
        participantReportID,
    });
}

export default useMoneyRequestPolicyTagsForReport;
