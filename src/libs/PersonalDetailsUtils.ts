import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, PersonalDetailsList, PrivatePersonalDetails} from '@src/types/onyx';
import type {OnyxData} from '@src/types/onyx/Request';
import * as LocalePhoneNumber from './LocalePhoneNumber';
import * as Localize from './Localize';
import * as UserUtils from './UserUtils';

let personalDetails: Array<PersonalDetails | null> = [];
let allPersonalDetails: OnyxEntry<PersonalDetailsList> = {};
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (val) => {
        personalDetails = Object.values(val ?? {});
        allPersonalDetails = val;
    },
});

function getDisplayNameOrDefault(passedPersonalDetails?: Partial<PersonalDetails> | null, defaultValue = '', shouldFallbackToHidden = true): string {
    const displayName = passedPersonalDetails?.displayName ? passedPersonalDetails.displayName.replace(CONST.REGEX.MERGED_ACCOUNT_PREFIX, '') : '';
    const fallbackValue = shouldFallbackToHidden ? Localize.translateLocal('common.hidden') : '';
    return displayName || defaultValue || fallbackValue;
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

/**
 * Given a list of logins, find the associated personal detail and return related accountIDs.
 *
 * @param logins Array of user logins
 * @returns Array of accountIDs according to passed logins
 */
function getAccountIDsByLogins(logins: string[]): number[] {
    return logins.reduce<number[]>((foundAccountIDs, login) => {
        const currentDetail = personalDetails.find((detail) => detail?.login === login);
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
 * Given a list of logins and accountIDs, return Onyx data for users with no existing personal details stored
 *
 * @param logins Array of user logins
 * @param accountIDs Array of user accountIDs
 * @returns Object with optimisticData, successData and failureData (object of personal details objects)
 */
function getNewPersonalDetailsOnyxData(logins: string[], accountIDs: number[]): Required<Pick<OnyxData, 'optimisticData' | 'finallyData'>> {
    const personalDetailsNew: PersonalDetailsList = {};
    const personalDetailsCleanup: PersonalDetailsList = {};

    logins.forEach((login, index) => {
        const accountID = accountIDs[index];

        if (allPersonalDetails && Object.keys(allPersonalDetails?.[accountID] ?? {}).length === 0) {
            personalDetailsNew[accountID] = {
                login,
                accountID,
                avatar: UserUtils.getDefaultAvatarURL(accountID),
                displayName: LocalePhoneNumber.formatPhoneNumber(login),
            };

            /**
             * Cleanup the optimistic user to ensure it does not permanently persist.
             * This is done to prevent duplicate entries (upon success) since the BE will return other personal details with the correct account IDs.
             */
            personalDetailsCleanup[accountID] = null;
        }
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
function getFormattedAddress(privatePersonalDetails: PrivatePersonalDetails): string {
    const {address} = privatePersonalDetails;
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

export {
    getDisplayNameOrDefault,
    getPersonalDetailsByIDs,
    getAccountIDsByLogins,
    getLoginsByAccountIDs,
    getNewPersonalDetailsOnyxData,
    getFormattedAddress,
    getFormattedStreet,
    getStreetLines,
    getEffectiveDisplayName,
};
