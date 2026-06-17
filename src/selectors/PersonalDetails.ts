import type {OnyxEntry} from 'react-native-onyx';
import {getDisplayNameOrDefault, getLoginByAccountID, getPersonalDetailsByID, getPersonalDetailsListByIDs, newGetPersonalDetailsByIDs} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import type {PersonalDetailsList, Report} from '@src/types/onyx';

const personalDetailsSelector = (accountID: number | undefined) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) => getPersonalDetailsByID(accountID, personalDetailsList);

const multiPersonalDetailsSelector = (accountIDs: number[] | undefined) => (personalDetails: OnyxEntry<PersonalDetailsList>) => newGetPersonalDetailsByIDs(accountIDs, personalDetails);

const personalDetailsListSelector = (accountIDs: Array<number | undefined> | undefined) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) =>
    getPersonalDetailsListByIDs(accountIDs, personalDetailsList);

const personalDetailsLoginSelector = (accountID: number | undefined) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) => getLoginByAccountID(accountID, personalDetailsList);

const personalDetailsDisplayNameSelector = (accountID: number) => (personalDetails: OnyxEntry<PersonalDetailsList>) => getDisplayNameOrDefault(personalDetails?.[accountID]);

const conciergePersonalDetailSelector = personalDetailsSelector(CONST.ACCOUNT_ID.CONCIERGE);

const accountIDToLoginSelector = (reportsToArchive: Report[]) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) => {
    const map: Record<number, string> = {};
    for (const report of reportsToArchive) {
        const {ownerAccountID} = report;
        if (ownerAccountID && ownerAccountID !== CONST.POLICY.OWNER_ACCOUNT_ID_FAKE && personalDetailsList?.[ownerAccountID]?.login) {
            map[ownerAccountID] = personalDetailsList[ownerAccountID].login;
        }
    }
    return map;
};

export {
    personalDetailsSelector,
    multiPersonalDetailsSelector,
    personalDetailsListSelector,
    personalDetailsDisplayNameSelector,
    personalDetailsLoginSelector,
    conciergePersonalDetailSelector,
    accountIDToLoginSelector,
};
