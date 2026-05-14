import type {OnyxEntry} from 'react-native-onyx';
import {newGetPersonalDetailsByIDs} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import type {PersonalDetailsList, Report} from '@src/types/onyx';

const personalDetailsSelector = (accountID: number | undefined) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) => (accountID ? personalDetailsList?.[accountID] : undefined);

const multiPersonalDetailsSelector = (accountIDs: number[]) => (personalDetails: OnyxEntry<PersonalDetailsList>) => newGetPersonalDetailsByIDs(accountIDs, personalDetails);

const personalDetailsLoginSelector = (accountID: number) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) => personalDetailsList?.[accountID]?.login;

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

export {personalDetailsSelector, multiPersonalDetailsSelector, personalDetailsLoginSelector, accountIDToLoginSelector};
