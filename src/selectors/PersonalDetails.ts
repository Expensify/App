import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import {
    getLoginByAccountID,
    getLoginsByAccountIDs,
    getNewAccountIDsAndLogins,
    getPersonalDetailsByID,
    getPersonalDetailsListByIDs,
    newGetPersonalDetailsByIDs,
    temporaryGetDisplayNameOrDefault,
} from '@libs/PersonalDetailsUtils';

import CONST from '@src/CONST';
import type {InvitedEmailsToAccountIDs, PersonalDetails, PersonalDetailsList, Report} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

const personalDetailsSelector = (accountID: number | undefined) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) => getPersonalDetailsByID(accountID, personalDetailsList);

const multiPersonalDetailsSelector = (accountIDs: number[] | undefined) => (personalDetails: OnyxEntry<PersonalDetailsList>) => newGetPersonalDetailsByIDs(accountIDs, personalDetails);

const personalDetailsListSelector = (accountIDs: Array<number | undefined> | undefined) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) =>
    getPersonalDetailsListByIDs(accountIDs, personalDetailsList);

const personalDetailsLoginSelector = (accountID: number | undefined) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) => getLoginByAccountID(accountID, personalDetailsList);

const personalDetailsLoginsSelector = (accountIDs: number[] | undefined) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) => getLoginsByAccountIDs(accountIDs, personalDetailsList);

const personalDetailsDisplayNameSelector = (accountID: number, translate: LocalizedTranslate) => (personalDetails: OnyxEntry<PersonalDetailsList>) =>
    temporaryGetDisplayNameOrDefault({passedPersonalDetails: personalDetails?.[accountID], translate});

const conciergePersonalDetailSelector = personalDetailsSelector(CONST.ACCOUNT_ID.CONCIERGE);

type DisplayDetails = Pick<PersonalDetails, 'accountID' | 'displayName' | 'login' | 'avatar'>;

/**
 * Creates a selector returning only the display details (name, login, avatar) of the given accounts,
 * so subscribers don't re-render when anything else in the personal details list changes.
 */
const createDisplayDetailsByAccountIDsSelector =
    (accountIDs: number[]) =>
    (personalDetailsList: OnyxEntry<PersonalDetailsList>): Record<number, DisplayDetails> => {
        const result: Record<number, DisplayDetails> = {};
        for (const accountID of accountIDs) {
            const detail = personalDetailsList?.[accountID];
            if (!detail) {
                continue;
            }
            result[accountID] = {accountID: detail.accountID, displayName: detail.displayName, login: detail.login, avatar: detail.avatar};
        }
        return result;
    };

const doesPersonalDetailExistSelector =
    (accountID: number | undefined) =>
    (personalDetailsList: OnyxEntry<PersonalDetailsList>): boolean =>
        accountID !== undefined && !!personalDetailsList?.[accountID];

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

const isOptimisticPersonalDetailSelector =
    (accountID: number) =>
    (personalDetailsList: OnyxEntry<PersonalDetailsList>): boolean => {
        if (!personalDetailsList) {
            return true;
        }
        return isPersonalDetailOptimistic(personalDetailsList[accountID]);
    };

const newAccountIDsAndLoginsSelector = (invitedEmailsToAccountIDs: InvitedEmailsToAccountIDs | undefined) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) =>
    getNewAccountIDsAndLogins(invitedEmailsToAccountIDs, personalDetailsList);

export {
    personalDetailsSelector,
    multiPersonalDetailsSelector,
    personalDetailsListSelector,
    personalDetailsDisplayNameSelector,
    personalDetailsLoginSelector,
    personalDetailsLoginsSelector,
    conciergePersonalDetailSelector,
    doesPersonalDetailExistSelector,
    accountIDToLoginSelector,
    isOptimisticPersonalDetailSelector,
    createDisplayDetailsByAccountIDsSelector,
    newAccountIDsAndLoginsSelector,
};
