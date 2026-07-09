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
    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReportID}`);
    const [participantReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${participantReportID}`);

    const iouReportPolicyID = existingIOUReportPolicyID ?? moneyRequestReport?.policyID ?? parentChatReportPolicyID ?? participantReport?.policyID;

    const [policyTags = getEmptyObject<PolicyTagLists>()] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${iouReportPolicyID}`);

    return policyTags;
}

export default useMoneyRequestPolicyTags;
