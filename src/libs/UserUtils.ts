import {Str} from 'expensify-common';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import type {LoginList, PrivatePersonalDetails, VacationDelegate} from '@src/types/onyx';
import type Login from '@src/types/onyx/Login';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import hashCode from './hashCode';
import {formatPhoneNumber} from './LocalePhoneNumber';
import type {AvatarSource} from './UserAvatarUtils';

type LoginListIndicator = ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS> | undefined;

/**
 * Searches through given loginList for any contact method / login with an error.
 *
 * Example that should return false:
 * {{
 *      test@test.com: {
 *          errorFields: {
 *              validateCodeSent: null
 *          }
 *      }
 * }}
 *
 * Example that should return true:
 * {{
 *      test@test.com: {
 *          errorFields: {
 *              validateCodeSent: { 18092081290: 'An error' }
 *          }
 *      }
 * }}
 */
function hasLoginListError(loginList: OnyxEntry<LoginList>): boolean {
    return Object.values(loginList ?? {}).some((loginData) => Object.values(loginData.errorFields ?? {}).some((field) => Object.keys(field ?? {}).length > 0));
}

/**
 * Searches through given loginList for any contact method / login that requires
 * an Info brick road status indicator. Currently this only applies if the user
 * has an unvalidated contact method.
 */
function hasLoginListInfo(loginList: OnyxEntry<LoginList>, email: string | undefined): boolean {
    return Object.values(loginList ?? {}).some((login) => login.partnerUserID && email !== login.partnerUserID && !login.validatedDate);
}

/**
 * Checks if the current user has a validated the primary contact method
 */
function isCurrentUserValidated(loginList: OnyxEntry<LoginList>, email: string | undefined): boolean {
    if (!loginList || !email) {
        return false;
    }

    return !!loginList?.[email]?.validatedDate;
}

/**
 * Gets the appropriate brick road indicator status for a given loginList.
 * Error status is higher priority, so we check for that first.
 */
function getLoginListBrickRoadIndicator(loginList: OnyxEntry<LoginList>, email: string | undefined): LoginListIndicator {
    if (hasLoginListError(loginList)) {
        return CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    }
    if (hasLoginListInfo(loginList, email)) {
        return CONST.BRICK_ROAD_INDICATOR_STATUS.INFO;
    }

    return undefined;
}

/**
 * Gets the appropriate brick road indicator status for the Profile section.
 * Error status is higher priority, so we check for that first.
 */
function getProfilePageBrickRoadIndicator(
    loginList: OnyxEntry<LoginList>,
    privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>,
    vacationDelegate: OnyxEntry<VacationDelegate>,
    email: string | undefined,
): LoginListIndicator {
    const hasPhoneNumberError = !!privatePersonalDetails?.errorFields?.phoneNumber;
    if (hasLoginListError(loginList) || hasPhoneNumberError || !isEmptyObject(vacationDelegate?.errors)) {
        return CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    }
    if (hasLoginListInfo(loginList, email)) {
        return CONST.BRICK_ROAD_INDICATOR_STATUS.INFO;
    }

    return undefined;
}

/**
 * Hashes provided string and returns a value between [0, range)
 */
function hashText(text: string, range: number): number {
    return Math.abs(hashCode(text.toLowerCase())) % range;
}

/**
 * Generate a random accountID base on searchValue.
 */
function generateAccountID(searchValue: string): number {
    return hashText(searchValue, 2 ** 32);
}

/**
 * Gets the secondary phone login number
 */
function getSecondaryPhoneLogin(loginList: OnyxEntry<Login>): string | undefined {
    const parsedLoginList = Object.keys(loginList ?? {}).map((login) => Str.removeSMSDomain(login));
    return parsedLoginList.find((login) => Str.isValidE164Phone(login));
}

/**
 * Gets the contact method
 */
function getContactMethod(primaryLogin: string | undefined, email: string | undefined): string {
    return primaryLogin ?? email ?? '';
}

/**
 * Gets details about contact methods to be displayed as MenuItems
 */
function getContactMethodsOptions(translate: LocalizedTranslate, loginList?: LoginList, defaultEmail?: string) {
    if (!loginList) {
        return [];
    }

    // Sort the login list by placing the one corresponding to the default contact method as the first item.
    // The default contact method is determined by checking against the session email (the current login).
    const sortedLoginList = Object.entries(loginList).sort(([, loginData]) => (loginData.partnerUserID === defaultEmail ? -1 : 1));

    return sortedLoginList.map(([loginName, login]) => {
        const isDefaultContactMethod = defaultEmail === login?.partnerUserID;
        const pendingAction = login?.pendingFields?.deletedLogin ?? login?.pendingFields?.addedLogin ?? undefined;
        if (!login?.partnerUserID && !pendingAction) {
            return null;
        }

        let description = '';
        if (defaultEmail === login?.partnerUserID) {
            description = translate('contacts.getInTouch');
        } else if (login?.errorFields?.addedLogin) {
            description = translate('contacts.failedNewContact');
        } else if (!login?.validatedDate) {
            description = translate('contacts.pleaseVerify');
        }
        let indicator;
        if (Object.values(login?.errorFields ?? {}).some((errorField) => !isEmptyObject(errorField))) {
            indicator = CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
        } else if (!login?.validatedDate && !isDefaultContactMethod) {
            indicator = CONST.BRICK_ROAD_INDICATOR_STATUS.INFO;
        } else if (!login?.validatedDate && isDefaultContactMethod && sortedLoginList.length > 1) {
            indicator = CONST.BRICK_ROAD_INDICATOR_STATUS.INFO;
        }

        // Default to using login key if we deleted login.partnerUserID optimistically
        // but still need to show the pending login being deleted while offline.
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const partnerUserID = login?.partnerUserID || loginName;
        const menuItemTitle = Str.isSMSLogin(partnerUserID) ? formatPhoneNumber(partnerUserID) : partnerUserID;

        return {
            partnerUserID,
            menuItemTitle,
            description,
            indicator,
            pendingAction,
        };
    });
}

export {
    generateAccountID,
    getLoginListBrickRoadIndicator,
    getProfilePageBrickRoadIndicator,
    getSecondaryPhoneLogin,
    hasLoginListError,
    hasLoginListInfo,
    hashText,
    getContactMethod,
    isCurrentUserValidated,
    getContactMethodsOptions,
};
export type {AvatarSource};
