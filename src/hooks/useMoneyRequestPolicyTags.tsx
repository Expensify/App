import type {OnyxEntry} from 'react-native-onyx';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTagLists, Report} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import useOnyx from './useOnyx';

type UseMoneyRequestPolicyTagsParams = {
    existingIOUReportPolicyID?: string;
    moneyRequestReportID?: string;
    parentChatReportPolicyID?: string;
    participantReportID?: string;
};

const selectReportPolicyID = (report: OnyxEntry<Report>) => report?.policyID;

function useMoneyRequestPolicyTags({existingIOUReportPolicyID, moneyRequestReportID, parentChatReportPolicyID, participantReportID}: UseMoneyRequestPolicyTagsParams): PolicyTagLists {
    const [moneyRequestReportPolicyID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(moneyRequestReportID)}`, {selector: selectReportPolicyID});
    const [participantReportPolicyID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(participantReportID)}`, {selector: selectReportPolicyID});

    const iouReportPolicyID = existingIOUReportPolicyID ?? moneyRequestReportPolicyID ?? parentChatReportPolicyID ?? participantReportPolicyID;

    const [policyTags = getEmptyObject<PolicyTagLists>()] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(iouReportPolicyID)}`);

    return policyTags;
}

export default useMoneyRequestPolicyTags;
