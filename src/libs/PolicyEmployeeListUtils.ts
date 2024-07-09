import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import {getCurrentUserAccountID} from './actions/Report';
import {getPolicyEmployeeListByIdWithoutCurrentUser} from './PolicyUtils';

let allPolicies: OnyxCollection<Policy> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (value) => (allPolicies = value),
});

function getPolicyEmployeeAccountIDs(policyID?: string) {
    if (!policyID) {
        return [];
    }

    const currentUserAccountID = getCurrentUserAccountID();

    return getPolicyEmployeeListByIdWithoutCurrentUser(allPolicies, policyID, currentUserAccountID);
}

export default getPolicyEmployeeAccountIDs;
