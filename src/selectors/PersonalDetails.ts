import type {OnyxEntry} from 'react-native-onyx';
import {getDisplayNameOrDefault, getLoginByAccountID, getPersonalDetailsByID, getPersonalDetailsListByIDs, newGetPersonalDetailsByIDs} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import type {PersonalDetailsList, Report} from '@src/types/onyx';
import type PersonalDetails from '@src/types/onyx/PersonalDetails';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

const personalDetailsSelector = (accountID: number | undefined) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) => getPersonalDetailsByID(accountID, personalDetailsList);

const multiPersonalDetailsSelector = (accountIDs: number[]) => (personalDetails: OnyxEntry<PersonalDetailsList>) => newGetPersonalDetailsByIDs(accountIDs, personalDetails);

const personalDetailsListSelector = (accountIDs: Array<number | undefined>) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) =>
    getPersonalDetailsListByIDs(accountIDs, personalDetailsList);

const personalDetailsLoginSelector = (accountID: number | undefined) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) => getLoginByAccountID(accountID, personalDetailsList);

const personalDetailsDisplayNameSelector = (accountID: number) => (personalDetails: OnyxEntry<PersonalDetailsList>) => getDisplayNameOrDefault(personalDetails?.[accountID]);

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

function isPersonalDetailOptimistic(personalDetail: PersonalDetails | null | undefined): boolean {
    return isEmptyObject(personalDetail) || !!personalDetail?.isOptimisticPersonalDetail;
}

const isOptimisticPersonalDetailSelector = (accountID: number) => (personalDetailsList: OnyxEntry<PersonalDetailsList>): boolean => {
    if (!personalDetailsList) {
        return true;
    }
    return isPersonalDetailOptimistic(personalDetailsList[accountID]);
};

export {
    personalDetailsSelector,
    multiPersonalDetailsSelector,
    personalDetailsListSelector,
    personalDetailsDisplayNameSelector,
    personalDetailsLoginSelector,
    personalDetailByAccountIDSelector,
    conciergePersonalDetailSelector,
    accountIDToLoginSelector,
    isOptimisticPersonalDetailSelector,
};
