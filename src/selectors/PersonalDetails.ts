import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';

import {isEmailPublicDomain} from '@libs/LoginUtils';
import {
    getLoginByAccountID,
    getLoginsByAccountIDs,
    getNewAccountIDsAndLogins,
    getPersonalDetailsByID,
    getPersonalDetailsListByIDs,
    getPersonalDetailsByIDs,
    temporaryGetDisplayNameOrDefault,
} from '@libs/PersonalDetailsUtils';

import CONST from '@src/CONST';
import type {InvitedEmailsToAccountIDs, PersonalDetails, PersonalDetailsList, Report} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import {Str} from 'expensify-common';

const personalDetailsSelector = (accountID: number | undefined) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) => getPersonalDetailsByID(accountID, personalDetailsList);

const multiPersonalDetailsSelector = (accountIDs: number[] | undefined) => (personalDetails: OnyxEntry<PersonalDetailsList>) => getPersonalDetailsByIDs(accountIDs, personalDetails);

const personalDetailsListSelector = (accountIDs: Array<number | undefined> | undefined) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) =>
    getPersonalDetailsListByIDs(accountIDs, personalDetailsList);

const personalDetailsLoginSelector = (accountID: number | undefined) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) => getLoginByAccountID(accountID, personalDetailsList);

/**
 * Logins a short mention can resolve to: `@name` only matches `name@<current user's private domain>`. Phone logins are kept for
 * addDomainToShortMention's phone branch. A subscriber then skips writes that add or change anyone else.
 */
const shortMentionLoginsSelector =
    (currentUserLogin: string) =>
    (personalDetailsList: OnyxEntry<PersonalDetailsList>): string[] => {
        const userEmailDomain = isEmailPublicDomain(currentUserLogin) ? '' : Str.extractEmailDomain(currentUserLogin);
        const logins: string[] = [];
        for (const personalDetail of Object.values(personalDetailsList ?? {})) {
            const login = personalDetail?.login;
            if (!login) {
                continue;
            }
            const isOnUserDomain = !!userEmailDomain && login.endsWith(`@${userEmailDomain}`);
            const isPhoneLogin = login.endsWith(CONST.SMS.DOMAIN) || (!login.includes('@') && Str.isValidE164Phone(login));
            if (isOnUserDomain || isPhoneLogin) {
                logins.push(login);
            }
        }
        return logins;
    };

const personalDetailsLoginsSelector = (accountIDs: number[] | undefined) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) => getLoginsByAccountIDs(accountIDs, personalDetailsList);

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
            result[accountID] = {
                accountID: detail.accountID,
                displayName: detail.displayName,
                login: detail.login,
                avatar: detail.avatar,
            };
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

/**
 * Returns only the personal details that were created optimistically. The optimistic set is tiny compared to the whole
 * personal details list, so subscribers using it don't re-render every time an unrelated (server-backed) detail changes.
 */
const optimisticPersonalDetailsSelector = (personalDetailsList: OnyxEntry<PersonalDetailsList>): PersonalDetailsList => {
    const optimisticPersonalDetails: PersonalDetailsList = {};
    for (const [accountID, personalDetail] of Object.entries(personalDetailsList ?? {})) {
        if (!personalDetail?.isOptimisticPersonalDetail) {
            continue;
        }
        optimisticPersonalDetails[accountID] = personalDetail;
    }
    return optimisticPersonalDetails;
};

const newAccountIDsAndLoginsSelector = (invitedEmailsToAccountIDs: InvitedEmailsToAccountIDs | undefined) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) =>
    getNewAccountIDsAndLogins(invitedEmailsToAccountIDs, personalDetailsList);

const displayNameSelector = (personalDetails: PersonalDetails | undefined) => personalDetails?.displayName;

const accountIDSelector = (personalDetails: PersonalDetails | undefined) => personalDetails?.accountID;

const loginSelector = (personalDetails: PersonalDetails | undefined) => personalDetails?.login;

const avatarStyleColorSelector = (personalDetails: PersonalDetails | undefined) => personalDetails?.avatarStyle?.color;

const doesPersonalDetailExist = (personalDetails: PersonalDetails | undefined) => !!personalDetails;

const firstNameSelector = (personalDetails: PersonalDetails | undefined) => (personalDetails?.firstName?.trim() ? personalDetails.firstName : undefined);

const displayNameOrDefaultSelector = (translate: LocalizedTranslate, formatPhoneNumber: LocaleContextProps['formatPhoneNumber']) => (personalDetails: PersonalDetails | undefined) =>
    temporaryGetDisplayNameOrDefault({passedPersonalDetails: personalDetails, translate, formatPhoneNumber});

export {
    avatarStyleColorSelector,
    personalDetailsSelector,
    multiPersonalDetailsSelector,
    personalDetailsListSelector,
    personalDetailsLoginSelector,
    personalDetailsLoginsSelector,
    shortMentionLoginsSelector,
    doesPersonalDetailExistSelector,
    accountIDToLoginSelector,
    isPersonalDetailOptimistic,
    optimisticPersonalDetailsSelector,
    createDisplayDetailsByAccountIDsSelector,
    newAccountIDsAndLoginsSelector,
    displayNameSelector,
    accountIDSelector,
    loginSelector,
    firstNameSelector,
    displayNameOrDefaultSelector,
    doesPersonalDetailExist,
};
