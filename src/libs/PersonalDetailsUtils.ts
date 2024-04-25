import Str from 'expensify-common/lib/str';
import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {CurrentUserPersonalDetails} from '@components/withCurrentUserPersonalDetails';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, PersonalDetailsList, PrivatePersonalDetails} from '@src/types/onyx';
import type {OnyxData} from '@src/types/onyx/Request';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import * as LocalePhoneNumber from './LocalePhoneNumber';
import * as Localize from './Localize';
import * as UserUtils from './UserUtils';

type FirstAndLastName = {
    firstName: string;
    lastName: string;
};

let personalDetails: Array<PersonalDetails | null> = [];
let allPersonalDetails: OnyxEntry<PersonalDetailsList> = {};
let emailToPersonalDetailsCache: Record<string, PersonalDetails> = {};
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (val) => {
        personalDetails = Object.values(val ?? {});
        allPersonalDetails = val;
        emailToPersonalDetailsCache = personalDetails.reduce((acc: Record<string, PersonalDetails>, detail) => {
            if (detail?.login) {
                acc[detail.login.toLowerCase()] = detail;
            }
            return acc;
        }, {});
    },
});

function getDisplayNameOrDefault(passedPersonalDetails?: Partial<PersonalDetails> | null, defaultValue = '', shouldFallbackToHidden = true, shouldAddCurrentUserPostfix = false): string {
    let displayName = passedPersonalDetails?.displayName ?? '';

    // If the displayName starts with the merged account prefix, remove it.
    if (displayName.startsWith(CONST.MERGED_ACCOUNT_PREFIX)) {
        // Remove the merged account prefix from the displayName.
        displayName = displayName.substring(CONST.MERGED_ACCOUNT_PREFIX.length);
    }

    // If the displayName is not set by the user, the backend sets the diplayName same as the login so
    // we need to remove the sms domain from the displayName if it is an sms login.
    if (displayName === passedPersonalDetails?.login && Str.isSMSLogin(passedPersonalDetails?.login)) {
        displayName = Str.removeSMSDomain(displayName);
    }

    if (shouldAddCurrentUserPostfix && !!displayName) {
        displayName = `${displayName} (${Localize.translateLocal('common.you').toLowerCase()})`;
    }

    if (displayName) {
        return displayName;
    }
    return defaultValue || (shouldFallbackToHidden ? Localize.translateLocal('common.hidden') : '');
}

/**
 * Given a list of account IDs (as number) it will return an array of personal details objects.
 * @param accountIDs  - Array of accountIDs
 * @param currentUserAccountID
 * @param shouldChangeUserDisplayName - It will replace the current user's personal detail object's displayName with 'You'.
 * @returns - Array of personal detail objects
 */
function getPersonalDetailsByIDs(accountIDs: number[], currentUserAccountID: number, shouldChangeUserDisplayName = false): PersonalDetails[] {
    const result: PersonalDetails[] = accountIDs
        .filter((accountID) => !!allPersonalDetails?.[accountID])
        .map((accountID) => {
            const detail = (allPersonalDetails?.[accountID] ?? {}) as PersonalDetails;

            if (shouldChangeUserDisplayName && currentUserAccountID === detail.accountID) {
                return {
                    ...detail,
                    displayName: Localize.translateLocal('common.you'),
                };
            }

            return detail;
        });

    return result;
}

function getPersonalDetailByEmail(email: string): PersonalDetails | undefined {
    return emailToPersonalDetailsCache[email.toLowerCase()];
}

/**
 * Given a list of logins, find the associated personal detail and return related accountIDs.
 *
 * @param logins Array of user logins
 * @returns Array of accountIDs according to passed logins
 */
function getAccountIDsByLogins(logins: string[]): number[] {
    return logins.reduce<number[]>((foundAccountIDs, login) => {
        const currentDetail = personalDetails.find((detail) => detail?.login === login?.toLowerCase());
        if (!currentDetail) {
            // generate an account ID because in this case the detail is probably new, so we don't have a real accountID yet
            foundAccountIDs.push(UserUtils.generateAccountID(login));
        } else {
            foundAccountIDs.push(Number(currentDetail.accountID));
        }
        return foundAccountIDs;
    }, []);
}

/**
 * Given a list of accountIDs, find the associated personal detail and return related logins.
 *
 * @param accountIDs Array of user accountIDs
 * @returns Array of logins according to passed accountIDs
 */
function getLoginsByAccountIDs(accountIDs: number[]): string[] {
    return accountIDs.reduce((foundLogins: string[], accountID) => {
        const currentDetail: Partial<PersonalDetails> = personalDetails.find((detail) => Number(detail?.accountID) === Number(accountID)) ?? {};
        if (currentDetail.login) {
            foundLogins.push(currentDetail.login);
        }
        return foundLogins;
    }, []);
}

/**
 * Provided a set of invited logins and optimistic accountIDs. Returns the ones which are not known to the user i.e. they do not exist in the personalDetailsList.
 */
function getNewAccountIDsAndLogins(logins: string[], accountIDs: number[]) {
    const newAccountIDs: number[] = [];
    const newLogins: string[] = [];
    logins.forEach((login, index) => {
        const accountID = accountIDs[index];
        if (isEmptyObject(allPersonalDetails?.[accountID])) {
            newAccountIDs.push(accountID);
            newLogins.push(login);
        }
    });

    return {newAccountIDs, newLogins};
}

/**
 * Given a list of logins and accountIDs, return Onyx data for users with no existing personal details stored. These users might be brand new or unknown.
 * They will have an "optimistic" accountID that must be cleaned up later.
 */
function getPersonalDetailsOnyxDataForOptimisticUsers(newLogins: string[], newAccountIDs: number[]): Required<Pick<OnyxData, 'optimisticData' | 'finallyData'>> {
    const personalDetailsNew: PersonalDetailsList = {};
    const personalDetailsCleanup: PersonalDetailsList = {};

    newLogins.forEach((login, index) => {
        const accountID = newAccountIDs[index];
        personalDetailsNew[accountID] = {
            login,
            accountID,
            displayName: LocalePhoneNumber.formatPhoneNumber(login),
        };

        /**
         * Cleanup the optimistic user to ensure it does not permanently persist.
         * This is done to prevent duplicate entries (upon success) since the BE will return other personal details with the correct account IDs.
         */
        personalDetailsCleanup[accountID] = null;
    });

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: personalDetailsNew,
        },
    ];

    const finallyData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: personalDetailsCleanup,
        },
    ];

    return {
        optimisticData,
        finallyData,
    };
}

/**
 * Applies common formatting to each piece of an address
 *
 * @param piece - address piece to format
 * @returns - formatted piece
 */
function formatPiece(piece?: string): string {
    return piece ? `${piece}, ` : '';
}

/**
 *
 * @param street1 - street line 1
 * @param street2 - street line 2
 * @returns formatted street
 */
function getFormattedStreet(street1 = '', street2 = '') {
    return `${street1}\n${street2}`;
}

/**
 *
 * @param - formatted address
 * @returns [street1, street2]
 */
function getStreetLines(street = '') {
    const streets = street.split('\n');
    return [streets[0], streets[1]];
}

/**
 * Formats an address object into an easily readable string
 *
 * @param privatePersonalDetails - details object
 * @returns - formatted address
 */
function getFormattedAddress(privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>): string {
    const {address} = privatePersonalDetails ?? {};
    const [street1, street2] = getStreetLines(address?.street);
    const formattedAddress =
        formatPiece(street1) + formatPiece(street2) + formatPiece(address?.city) + formatPiece(address?.state) + formatPiece(address?.zip) + formatPiece(address?.country);

    // Remove the last comma of the address
    return formattedAddress.trim().replace(/,$/, '');
}

/**
 * @param personalDetail - details object
 * @returns - The effective display name
 */
function getEffectiveDisplayName(personalDetail?: PersonalDetails): string | undefined {
    if (personalDetail) {
        return LocalePhoneNumber.formatPhoneNumber(personalDetail?.login ?? '') || personalDetail.displayName;
    }

    return undefined;
}

/**
 * Creates a new displayName for a user based on passed personal details or login.
 */
function createDisplayName(login: string, passedPersonalDetails: Pick<PersonalDetails, 'firstName' | 'lastName'> | OnyxEntry<PersonalDetails>): string {
    // If we have a number like +15857527441@expensify.sms then let's remove @expensify.sms and format it
    // so that the option looks cleaner in our UI.
    const userLogin = LocalePhoneNumber.formatPhoneNumber(login);

    if (!passedPersonalDetails) {
        return userLogin;
    }

    const firstName = passedPersonalDetails.firstName ?? '';
    const lastName = passedPersonalDetails.lastName ?? '';
    const fullName = `${firstName} ${lastName}`.trim();

    // It's possible for fullName to be empty string, so we must use "||" to fallback to userLogin.
    return fullName || userLogin;
}

/**
 * Gets the first and last name from the user's personal details.
 * If the login is the same as the displayName, then they don't exist,
 * so we return empty strings instead.
 */
function extractFirstAndLastNameFromAvailableDetails({login, displayName, firstName, lastName}: CurrentUserPersonalDetails): FirstAndLastName {
    // It's possible for firstName to be empty string, so we must use "||" to consider lastName instead.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (firstName || lastName) {
        return {firstName: firstName ?? '', lastName: lastName ?? ''};
    }
    if (login && Str.removeSMSDomain(login) === displayName) {
        return {firstName: '', lastName: ''};
    }

    if (displayName) {
        const firstSpaceIndex = displayName.indexOf(' ');
        const lastSpaceIndex = displayName.lastIndexOf(' ');
        if (firstSpaceIndex === -1) {
            return {firstName: displayName, lastName: ''};
        }

        return {
            firstName: displayName.substring(0, firstSpaceIndex).trim(),
            lastName: displayName.substring(lastSpaceIndex).trim(),
        };
    }

    return {firstName: '', lastName: ''};
}

/**
 * Whether personal details is empty
 */
function isPersonalDetailsEmpty() {
    return !personalDetails.length;
}

export {
    isPersonalDetailsEmpty,
    getDisplayNameOrDefault,
    getPersonalDetailsByIDs,
    getPersonalDetailByEmail,
    getAccountIDsByLogins,
    getLoginsByAccountIDs,
    getPersonalDetailsOnyxDataForOptimisticUsers,
    getFormattedAddress,
    getFormattedStreet,
    getStreetLines,
    getEffectiveDisplayName,
    createDisplayName,
    extractFirstAndLastNameFromAvailableDetails,
    getNewAccountIDsAndLogins,
};
