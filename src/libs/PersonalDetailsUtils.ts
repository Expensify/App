import Onyx, {OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import * as Localize from './Localize';
import * as UserUtils from './UserUtils';
import * as LocalePhoneNumber from './LocalePhoneNumber';
import * as OnyxTypes from '../types/onyx';

type PersonalDetailsList = Record<string, OnyxTypes.PersonalDetails | null>;

let personalDetails: OnyxTypes.PersonalDetails[] = [];
let allPersonalDetails: OnyxEntry<Record<string, OnyxTypes.PersonalDetails>> = {};
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (val) => {
        personalDetails = Object.values(val ?? {});
        allPersonalDetails = val;
    },
});

/**
 * @param [defaultValue] optional default display name value
 */
function getDisplayNameOrDefault(displayName: string, defaultValue?: string): string {
    return displayName ?? defaultValue ?? Localize.translateLocal('common.hidden');
}

/**
 * Given a list of account IDs (as number) it will return an array of personal details objects.
 * @param accountIDs  - Array of accountIDs
 * @param shouldChangeUserDisplayName - It will replace the current user's personal detail object's displayName with 'You'.
 * @returns Array of personal detail objects
 */
function getPersonalDetailsByIDs(accountIDs: number[], currentUserAccountID: number, shouldChangeUserDisplayName = false): OnyxTypes.PersonalDetails[] {
    const result: OnyxTypes.PersonalDetails[] = [];
    personalDetails
        .filter((detail) => accountIDs.includes(detail.accountID))
        .forEach((detail) => {
            if (shouldChangeUserDisplayName && currentUserAccountID === detail.accountID) {
                result.push({
                    ...detail,
                    displayName: Localize.translateLocal('common.you'),
                });
            } else {
                result.push(detail);
            }
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
    return logins.reduce((foundAccountIDs: number[], login) => {
        const currentDetail = personalDetails.find((detail) => detail.login === login);
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
        const currentDetail: Partial<OnyxTypes.PersonalDetails> = personalDetails.find((detail) => Number(detail.accountID) === Number(accountID)) ?? {};
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
function getNewPersonalDetailsOnyxData(logins: string[], accountIDs: number[]) {
    const optimisticData: PersonalDetailsList = {};
    const successData: PersonalDetailsList = {};
    const failureData: PersonalDetailsList = {};

    logins.forEach((login, index) => {
        const accountID = accountIDs[index];

        if (allPersonalDetails && Object.keys(allPersonalDetails[accountID]).length === 0) {
            optimisticData[accountID] = {
                login,
                accountID,
                avatar: UserUtils.getDefaultAvatarURL(accountID),
                displayName: LocalePhoneNumber.formatPhoneNumber(login),
            };

            /**
             * Cleanup the optimistic user to ensure it does not permanently persist.
             * This is done to prevent duplicate entries (upon success) since the BE will return other personal details with the correct account IDs.
             */
            successData[accountID] = null;
        }
    });

    return {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                value: optimisticData,
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                value: successData,
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                value: failureData,
            },
        ],
    };
}

export {getDisplayNameOrDefault, getPersonalDetailsByIDs, getAccountIDsByLogins, getLoginsByAccountIDs, getNewPersonalDetailsOnyxData};
