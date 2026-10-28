/** Personal details for non-React callers, and the one place the coming Onyx-collection reshape has to land */
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, PersonalDetailsList} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

let allPersonalDetails: PersonalDetailsList = {};
let loginToPersonalDetails: Record<string, PersonalDetails> = {};
let accountIDToName: Record<string, string> = {};
let allLogins: string[] = [];

function buildLoginMapping(personalDetailsList: PersonalDetailsList): Record<string, PersonalDetails> {
    const mapping: Record<string, PersonalDetails> = {};
    for (const personalDetail of Object.values(personalDetailsList)) {
        if (!personalDetail?.login) {
            continue;
        }
        const login = personalDetail.login.toLowerCase();
        const existing = mapping[login];
        if (!existing || existing.isClosed || existing.isOptimisticPersonalDetail) {
            mapping[login] = personalDetail;
        }
    }
    return mapping;
}

// Only sanctioned connectWithoutView for personal details, don't add another: React uses @hooks/usePersonalDetails, everything else uses this store
Onyx.connectWithoutView({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        allPersonalDetails = value ?? {};
        loginToPersonalDetails = buildLoginMapping(allPersonalDetails);
        accountIDToName = {};
        for (const personalDetail of Object.values(allPersonalDetails)) {
            if (personalDetail) {
                accountIDToName[personalDetail.accountID] = personalDetail.login ?? personalDetail.displayName ?? '';
            }
        }
        allLogins = Object.values(allPersonalDetails).map((personalDetail) => personalDetail?.login ?? '');
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

// Login, falling back to display name, per accountID, in the shape ExpensiMark expects for mentions
function getAccountIDToNameMap(): Record<string, string> {
    return accountIDToName;
}

// Every known login, in the shape `addDomainToShortMention` expects
function getAllPersonalDetailLogins(): string[] {
    return allLogins;
}

export {getAllPersonalDetails, getPersonalDetail, getPersonalDetailByLogin, getAccountIDToNameMap, getAllPersonalDetailLogins};
