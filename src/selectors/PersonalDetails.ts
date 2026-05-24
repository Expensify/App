import type {OnyxEntry} from 'react-native-onyx';
import {getLoginByAccountID, newGetPersonalDetailsByIDs} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import type {PersonalDetailsList, Report} from '@src/types/onyx';
import type PersonalDetails from '@src/types/onyx/PersonalDetails';

const personalDetailsSelector = (accountID: number | undefined) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) => (accountID ? personalDetailsList?.[accountID] : undefined);

const multiPersonalDetailsSelector = (accountIDs: number[]) => (personalDetails: OnyxEntry<PersonalDetailsList>) => newGetPersonalDetailsByIDs(accountIDs, personalDetails);

const personalDetailsLoginSelector = (accountID: number | undefined) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) => getLoginByAccountID(accountID, personalDetailsList);

const personalDetailByAccountIDSelector =
    (accountID: number | undefined) =>
    (personalDetailsList: OnyxEntry<PersonalDetailsList>): OnyxEntry<PersonalDetails> =>
        accountID ? (personalDetailsList?.[accountID] ?? undefined) : undefined;

const conciergePersonalDetailSelector = personalDetailByAccountIDSelector(CONST.ACCOUNT_ID.CONCIERGE);

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

export {personalDetailsSelector, multiPersonalDetailsSelector, personalDetailsLoginSelector, personalDetailByAccountIDSelector, conciergePersonalDetailSelector, accountIDToLoginSelector};
