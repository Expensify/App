import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import {getPolicyEmployeeListByIdWithoutCurrentUser} from './PolicyUtils';

let allPolicies: OnyxCollection<Policy> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (value) => (allPolicies = value),
});

let currentUserAccountID: number | undefined;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        currentUserAccountID = value?.accountID;
    },
});

function getPolicyEmployeeAccountIDs(policyID?: string) {
    if (!policyID) {
        return [];
    }

    if (!currentUserAccountID) {
        return [];
    }

    return getPolicyEmployeeListByIdWithoutCurrentUser(allPolicies, policyID, currentUserAccountID);
}

export default getPolicyEmployeeAccountIDs;
