import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyMembers} from '@src/types/onyx';
import {getCurrentUserAccountID} from './actions/Report';
import {getPolicyMembersByIdWithoutCurrentUser} from './PolicyUtils';

let policyMembers: OnyxCollection<PolicyMembers>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY_MEMBERS,
    waitForCollectionCallback: true,
    callback: (value) => (policyMembers = value),
});

function getPolicyMemberAccountIDs(policyID?: string) {
    if (!policyID) {
        return [];
    }

    const currentUserAccountID = getCurrentUserAccountID();

    return getPolicyMembersByIdWithoutCurrentUser(policyMembers, policyID, currentUserAccountID);
}

export default getPolicyMemberAccountIDs;
