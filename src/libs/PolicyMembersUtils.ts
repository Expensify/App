import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import {getCurrentUserAccountID} from './actions/Report';
import {getPolicyMembersByIdWithoutCurrentUser} from './PolicyUtils';

let allPolicies: OnyxCollection<Policy> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (value) => (allPolicies = value),
});

function getPolicyMemberAccountIDs(policyID?: string) {
    if (!policyID) {
        return [];
    }

    const currentUserAccountID = getCurrentUserAccountID();

    return getPolicyMembersByIdWithoutCurrentUser(allPolicies, policyID, currentUserAccountID);
}

export default getPolicyMemberAccountIDs;
