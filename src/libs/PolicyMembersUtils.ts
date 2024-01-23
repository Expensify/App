import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyMembers} from '@src/types/onyx';
import {getCurrentUserAccountID} from './actions/Report';

let policyMembers: OnyxCollection<PolicyMembers>;
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
