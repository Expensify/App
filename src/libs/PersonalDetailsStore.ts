/** Personal details for non-React callers, and the one place the coming Onyx-collection reshape has to land */
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, PersonalDetailsList} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

let allPersonalDetails: PersonalDetailsList = {};
let loginToPersonalDetails: Record<string, PersonalDetails> = {};

function buildLoginIndex(personalDetailsList: PersonalDetailsList): Record<string, PersonalDetails> {
    const index: Record<string, PersonalDetails> = {};
    for (const personalDetail of Object.values(personalDetailsList)) {
        if (!personalDetail?.login) {
            continue;
        }
        const login = personalDetail.login.toLowerCase();
        const existing = index[login];
        if (!existing || existing.isClosed || existing.isOptimisticPersonalDetail) {
            index[login] = personalDetail;
        }
    }
    return index;
}

// connectWithoutView: consumers are actions, middleware and pure libraries with no component to hang a hook off
Onyx.connectWithoutView({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        allPersonalDetails = value ?? {};
        loginToPersonalDetails = buildLoginIndex(allPersonalDetails);
    },
});

function getAllPersonalDetails(): PersonalDetailsList {
    return allPersonalDetails;
}

function getPersonalDetail(accountID: number | undefined): PersonalDetails | undefined {
    return accountID ? (allPersonalDetails[accountID] ?? undefined) : undefined;
}

function getPersonalDetailByLogin(login: string | undefined): PersonalDetails | undefined {
    if (!login) {
        return undefined;
    }
    return loginToPersonalDetails[login.toLowerCase()];
}

export {getAllPersonalDetails, getPersonalDetail, getPersonalDetailByLogin};
