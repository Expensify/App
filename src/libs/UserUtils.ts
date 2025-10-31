import {md5, Str} from 'expensify-common';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import * as defaultAvatars from '@components/Icon/DefaultAvatars';
import {ConciergeAvatar, NotificationsAvatar} from '@components/Icon/Expensicons';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {LoginList, PrivatePersonalDetails, VacationDelegate} from '@src/types/onyx';
import type Login from '@src/types/onyx/Login';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';
import {ALL_CUSTOM_AVATARS, getAvatarLocal} from './Avatars/CustomAvatarCatalog';
import type {CustomAvatarID} from './Avatars/CustomAvatarCatalog.types';
import hashCode from './hashCode';
import {formatPhoneNumber} from './LocalePhoneNumber';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import {translateLocal} from './Localize';

type AvatarRange = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24;

type AvatarSource = IconAsset | string;

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

function getAccountIDHashBucket(accountID = -1, accountEmail?: string, avatarURL?: string) {
    // There are 24 possible default avatars, so we choose which one this user has based
    // on a simple modulo operation of their login number. Note that Avatar count starts at 1.

    // When creating a chat the backend response will return the actual user ID.
    // But the avatar link still corresponds to the original ID-generated link. So we extract the SVG image number from the backend's link instead of using the user ID directly
    let accountIDHashBucket: AvatarRange | undefined;
    if (avatarURL) {
        const match = avatarURL.match(/(default-avatar_|avatar_)(\d+)(?=\.)/);
        const lastDigit = match && parseInt(match[2], 10);
        accountIDHashBucket = lastDigit as AvatarRange;
    } else if (accountEmail) {
        const intVal = Number.parseInt(md5(accountEmail).substring(0, 4), 16);
        accountIDHashBucket = ((intVal % CONST.DEFAULT_AVATAR_COUNT) + 1) as AvatarRange;
    } else if (accountID > 0) {
        accountIDHashBucket = ((accountID % CONST.DEFAULT_AVATAR_COUNT) + 1) as AvatarRange;
    }
    return accountIDHashBucket;
}

/**
 * Helper method to return the default avatar associated with the given accountID
 */
function getDefaultAvatar(accountID: number = CONST.DEFAULT_NUMBER_ID, accountEmail?: string, avatarURL?: string): IconAsset | undefined {
    if (accountID === CONST.ACCOUNT_ID.CONCIERGE) {
        return ConciergeAvatar;
    }
    if (accountID === CONST.ACCOUNT_ID.NOTIFICATIONS) {
        return NotificationsAvatar;
    }

    const accountIDHashBucket = getAccountIDHashBucket(accountID, accountEmail, avatarURL);
    if (!accountIDHashBucket) {
        return;
    }

    return defaultAvatars[`Avatar${accountIDHashBucket}`];
}

/**
 * Helper method to return default avatar name associated with the accountID
 */
function getDefaultAvatarName(accountID: number = CONST.DEFAULT_NUMBER_ID, accountEmail?: string, avatarURL?: string): string {
    const accountIDHashBucket = getAccountIDHashBucket(accountID, accountEmail, avatarURL);
    const avatarPrefix = `default-avatar`;

    return `${avatarPrefix}_${accountIDHashBucket}`;
}

/**
 * Helper method to return default avatar URL associated with the accountID
 */
function getDefaultAvatarURL(accountID: number = CONST.DEFAULT_NUMBER_ID, accountEmail?: string, avatarURL?: string): string {
    if (Number(accountID) === CONST.ACCOUNT_ID.CONCIERGE) {
        return CONST.CONCIERGE_ICON_URL;
    }

    return `${CONST.CLOUDFRONT_URL}/images/avatars/${getDefaultAvatarName(accountID, accountEmail, avatarURL)}.png`;
}

/**
 * Helper method to extract the avatar name from a default avatar URL
 * @param avatarURL - the URL returned by getDefaultAvatarURL
 * @returns the avatar name (e.g., 'default-avatar_5', 'concierge') or undefined if not a valid default avatar URL
 */
function getDefaultAvatarNameFromURL(avatarURL?: AvatarSource): CustomAvatarID | undefined {
    if (!avatarURL || typeof avatarURL !== 'string' || avatarURL === CONST.CONCIERGE_ICON_URL) {
        return undefined;
    }

    // Extract avatar name from CloudFront URL and make sure it's one of defaults
    const match = (avatarURL.split('/').at(-1)?.split('.')?.[0] ?? '') as CustomAvatarID;
    if (ALL_CUSTOM_AVATARS[match]) {
        return match;
    }
}

/**
 * * Given a user's avatar path, returns true if URL points to a default avatar, false otherwise
 * @param avatarSource - the avatar source from user's personalDetails
 */
function isDefaultAvatar(avatarSource?: AvatarSource): avatarSource is string | undefined {
    if (typeof avatarSource === 'string') {
        if (avatarSource.includes('images/avatars/avatar_') || avatarSource.includes('images/avatars/default-avatar_') || avatarSource.includes('images/avatars/user/default')) {
            return true;
        }

        // We use a hardcoded "default" Concierge avatar
        if (avatarSource === CONST.CONCIERGE_ICON_URL_2021 || avatarSource === CONST.CONCIERGE_ICON_URL) {
            return true;
        }
    }

    return false;
}

/**
 * * Given a user's avatar path and originalFileName, returns true if URL points to a default avatar, false otherwise
 * @param avatarSource - the avatar source from user's personalDetails
 * @param originalFileName - the avatar original file name from user's personalDetails
 */
function isDefaultOrCustomDefaultAvatar(avatarSource?: AvatarSource, originalFileName?: string): boolean {
    if (
        (typeof avatarSource === 'string' && avatarSource.includes('images/avatars/custom-avatars')) || // F1 avatars
        (originalFileName && /^letter-avatar-#[0-9A-F]{6}-#[0-9A-F]{6}-[A-Z]\.png$/.test(originalFileName)) // Letter avatars
    ) {
        return true;
    }
    if (isDefaultAvatar(avatarSource)) {
        return true;
    }

    return false;
}

/**
 * Provided an avatar source, if source is a default avatar, return the associated SVG.
 * Otherwise, return the URL or SVG pointing to the user-uploaded avatar.
 *
 * @param avatarSource - the avatar source from user's personalDetails
 * @param accountID - the accountID of the user
 * @param accountEmail - the email of the user, for consistency with BE logic
 */
function getAvatar(avatarSource?: AvatarSource, accountID?: number, accountEmail?: string): AvatarSource | undefined {
    return isDefaultAvatar(avatarSource) ? getDefaultAvatar(accountID, accountEmail, avatarSource) : avatarSource;
}

/**
 * Provided an avatar URL, if avatar is a default avatar, return NewDot default avatar URL.
 * Otherwise, return the URL pointing to a user-uploaded avatar.
 *
 * @param avatarSource - the avatar source from user's personalDetails
 * @param accountID - the accountID of the user
 */
function getAvatarUrl(avatarSource: AvatarSource | undefined, accountID: number, accountEmail?: string): AvatarSource {
    return isDefaultAvatar(avatarSource) ? getDefaultAvatarURL(accountID, accountEmail, avatarSource) : avatarSource;
}

/**
 * Avatars uploaded by users will have a _128 appended so that the asset server returns a small version.
 * This removes that part of the URL so the full version of the image can load.
 */
function getFullSizeAvatar(avatarSource: AvatarSource | undefined, accountID?: number, accountEmail?: string): AvatarSource | undefined {
    const source = getAvatar(avatarSource, accountID, accountEmail);
    if (typeof source !== 'string') {
        return source;
    }
    return source.replace('_128', '');
}

/**
 * Small sized avatars end with _128.<file-type>. This adds the _128 at the end of the
 * source URL (before the file type) if it doesn't exist there already.
 */
function getSmallSizeAvatar(avatarSource?: AvatarSource, accountID?: number, accountEmail?: string): AvatarSource | undefined {
    const source = getAvatar(avatarSource, accountID, accountEmail);
    if (typeof source !== 'string') {
        return source;
    }
    const maybeDefaultAvatarName = getDefaultAvatarNameFromURL(avatarSource);
    if (maybeDefaultAvatarName) {
        return getAvatarLocal(maybeDefaultAvatarName);
    }

    // Because other urls than CloudFront do not support dynamic image sizing (_SIZE suffix), the current source is already what we want to use here.
    if (!CONST.CLOUDFRONT_DOMAIN_REGEX.test(source)) {
        return source;
    }

    // If image source already has _128 at the end, the given avatar URL is already what we want to use here.
    const lastPeriodIndex = source.lastIndexOf('.');
    if (source.substring(lastPeriodIndex - 4, lastPeriodIndex) === '_128') {
        return source;
    }
    return `${source.substring(0, lastPeriodIndex)}_128${source.substring(lastPeriodIndex)}`;
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
function getContactMethodsOptions(loginList?: LoginList, defaultEmail?: string) {
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
        if (login?.errorFields?.addedLogin) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            description = translateLocal('contacts.failedNewContact');
        } else if (!login?.validatedDate) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            description = translateLocal('contacts.pleaseVerify');
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
        const label: TranslationPaths = isDefaultContactMethod ? 'contacts.primary' : 'contacts.secondary';

        return {
            partnerUserID,
            menuItemTitle,
            description,
            indicator,
            pendingAction,
            label,
        };
    });
}

export {
    generateAccountID,
    getAvatar,
    getAvatarUrl,
    getDefaultAvatarName,
    getDefaultAvatarNameFromURL,
    getDefaultAvatarURL,
    getFullSizeAvatar,
    getLoginListBrickRoadIndicator,
    getProfilePageBrickRoadIndicator,
    getSecondaryPhoneLogin,
    getSmallSizeAvatar,
    hasLoginListError,
    hasLoginListInfo,
    hashText,
    isDefaultOrCustomDefaultAvatar,
    isDefaultAvatar,
    getContactMethod,
    isCurrentUserValidated,
    getContactMethodsOptions,
};
export type {AvatarSource};
