import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy} from '@src/types/onyx';
import {getCurrentUserAccountID} from './actions/Report';
import {getPolicyMembersByIdWithoutCurrentUser} from './PolicyUtils';

let policies: OnyxCollection<Policy> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (value) => (policies = value),
});

let allPersonalDetails: OnyxEntry<PersonalDetailsList> = {};
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (val) => (allPersonalDetails = val),
});

function getPolicyMemberAccountIDs(policyID?: string) {
    if (!policyID) {
        return [];
    }

    const currentUserAccountID = getCurrentUserAccountID();

    return getPolicyMembersByIdWithoutCurrentUser(policies, allPersonalDetails, policyID, currentUserAccountID);
}

export default getPolicyMemberAccountIDs;
