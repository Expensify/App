import {getMoneyRequestParticipantsFromReport} from '@libs/actions/IOU/MoneyRequest';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isMoneyRequestReport as isMoneyRequestReportReportUtils} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTagLists, Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useMoneyRequestPolicyTags from './useMoneyRequestPolicyTags';
import useOnyx from './useOnyx';

type UseMoneyRequestPolicyTagsForReportParams = {
    report: OnyxEntry<Report>;
    currentUserAccountID: number;
    existingIOUReportPolicyID?: string;
};

const selectReportPolicyID = (report: OnyxEntry<Report>) => report?.policyID;

function useMoneyRequestPolicyTagsForReport({report, currentUserAccountID, existingIOUReportPolicyID}: UseMoneyRequestPolicyTagsForReportParams): PolicyTagLists {
    const isMoneyRequestReport = isMoneyRequestReportReportUtils(report);
    const chatReportID = isMoneyRequestReport ? getNonEmptyStringOnyxID(report?.chatReportID) : undefined;

    // Subscribe reactively (the chat report may load after first render) and narrow to the primitive policyID to avoid re-renders on unrelated field changes.
    const [chatReportPolicyID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, {selector: selectReportPolicyID});
    const [chatReportDraftPolicyID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${chatReportID}`, {selector: selectReportPolicyID});

    const parentChatReportPolicyID = isMoneyRequestReport ? (chatReportPolicyID ?? chatReportDraftPolicyID) : report?.policyID;
    const moneyRequestReportID = isMoneyRequestReport ? report?.reportID : '';
    const participantReportID = getMoneyRequestParticipantsFromReport(report, currentUserAccountID).at(0)?.reportID;

    return useMoneyRequestPolicyTags({
        existingIOUReportPolicyID,
        moneyRequestReportID,
        parentChatReportPolicyID,
        participantReportID,
    });
}

export default useMoneyRequestPolicyTagsForReport;
