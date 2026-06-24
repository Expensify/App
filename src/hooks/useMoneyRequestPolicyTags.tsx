import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTagLists} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import useOnyx from './useOnyx';

type UseMoneyRequestPolicyTagsParams = {
    existingIOUReportPolicyID?: string;
    moneyRequestReportID?: string;
    parentChatReportPolicyID?: string;
    participantReportID?: string;
};

function useMoneyRequestPolicyTags({existingIOUReportPolicyID, moneyRequestReportID, parentChatReportPolicyID, participantReportID}: UseMoneyRequestPolicyTagsParams): PolicyTagLists {
    const [moneyRequestReportPolicyID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReportID}`, {selector: (report) => report?.policyID});
    const [participantReportPolicyID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${participantReportID}`, {selector: (report) => report?.policyID});

    const iouReportPolicyID = existingIOUReportPolicyID ?? moneyRequestReportPolicyID ?? parentChatReportPolicyID ?? participantReportPolicyID;

    const [policyTags = getEmptyObject<PolicyTagLists>()] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${iouReportPolicyID}`);

    return policyTags;
}

export default useMoneyRequestPolicyTags;
