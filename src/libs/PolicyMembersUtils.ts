import Onyx, {OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {PolicyMember} from '@src/types/onyx';
import {getCurrentUserAccountID} from './actions/Report';

let policyMembers: OnyxEntry<PolicyMember>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY_MEMBERS,
    waitForCollectionCallback: true,
    callback: (value) => (policyMembers = value),
});

function getPolicyMemberAccountIDs(policyID: string) {
    const currentUserAccountID = getCurrentUserAccountID();
    return policyMembers
        ? Object.keys(policyMembers[`${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policyID}`] ?? {})
              .map((policyMemberAccountID) => Number(policyMemberAccountID))
              .filter((policyMemberAccountID) => policyMemberAccountID !== currentUserAccountID)
        : [];
}

export default getPolicyMemberAccountIDs;
