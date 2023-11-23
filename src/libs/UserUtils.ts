import Str from 'expensify-common/lib/str';
import {SvgProps} from 'react-native-svg';
import {ValueOf} from 'type-fest';
import * as defaultAvatars from '@components/Icon/DefaultAvatars';
import {ConciergeAvatar, FallbackAvatar} from '@components/Icon/Expensicons';
import CONST from '@src/CONST';
import Login from '@src/types/onyx/Login';
import hashCode from './hashCode';

type AvatarRange = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24;

type AvatarSource = React.FC<SvgProps> | string;

type LoginListIndicator = ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS> | '';

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
function hasLoginListError(loginList: Record<string, Login>): boolean {
    return Object.values(loginList).some((loginData) => Object.values(loginData.errorFields ?? {}).some((field) => Object.keys(field ?? {}).length > 0));
}

/**
 * Searches through given loginList for any contact method / login that requires
 * an Info brick road status indicator. Currently this only applies if the user
 * has an unvalidated contact method.
 */
function hasLoginListInfo(loginList: Record<string, Login>): boolean {
    return !Object.values(loginList).every((field) => field.validatedDate);
}

/**
 * Gets the appropriate brick road indicator status for a given loginList.
 * Error status is higher priority, so we check for that first.
 */
function getLoginListBrickRoadIndicator(loginList: Record<string, Login>): LoginListIndicator {
    if (hasLoginListError(loginList)) {
        return CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    }
    if (hasLoginListInfo(loginList)) {
        return CONST.BRICK_ROAD_INDICATOR_STATUS.INFO;
    }
    return '';
}

/**
 * Hashes provided string and returns a value between [0, range)
 */
function hashText(text: string, range: number): number {
    return Math.abs(hashCode(text.toLowerCase())) % range;
}

/**
 * Helper method to return the default avatar associated with the given accountID
 * @param [accountID]
 * @returns
 */
function getDefaultAvatar(accountID = -1): React.FC<SvgProps> {
    if (accountID <= 0) {
        return FallbackAvatar;
    }
    if (Number(accountID) === CONST.ACCOUNT_ID.CONCIERGE) {
        return ConciergeAvatar;
    }

    // There are 24 possible default avatars, so we choose which one this user has based
    // on a simple modulo operation of their login number. Note that Avatar count starts at 1.
    const accountIDHashBucket = ((accountID % CONST.DEFAULT_AVATAR_COUNT) + 1) as AvatarRange;

    return defaultAvatars[`Avatar${accountIDHashBucket}`];
}

/**
 * Helper method to return default avatar URL associated with login
 */
function getDefaultAvatarURL(accountID: string | number = '', isNewDot = false): string {
    if (Number(accountID) === CONST.ACCOUNT_ID.CONCIERGE) {
        return CONST.CONCIERGE_ICON_URL;
    }

    // Note that Avatar count starts at 1 which is why 1 has to be added to the result (or else 0 would result in a broken avatar link)
    const accountIDHashBucket = (Number(accountID) % (isNewDot ? CONST.DEFAULT_AVATAR_COUNT : CONST.OLD_DEFAULT_AVATAR_COUNT)) + 1;
    const avatarPrefix = isNewDot ? `default-avatar` : `avatar`;

    return `${CONST.CLOUDFRONT_URL}/images/avatars/${avatarPrefix}_${accountIDHashBucket}.png`;
}

/**
 * Given a user's avatar path, returns true if user doesn't have an avatar or if URL points to a default avatar
 * @param [avatarURL] - the avatar source from user's personalDetails
 */
function isDefaultAvatar(avatarURL?: string): boolean {
    if (typeof avatarURL === 'string') {
        if (avatarURL.includes('images/avatars/avatar_') || avatarURL.includes('images/avatars/default-avatar_') || avatarURL.includes('images/avatars/user/default')) {
            return true;
        }

        // We use a hardcoded "default" Concierge avatar
        if (avatarURL === CONST.CONCIERGE_ICON_URL_2021 || avatarURL === CONST.CONCIERGE_ICON_URL) {
            return true;
        }
    }

    if (!avatarURL) {
        // If null URL, we should also use a default avatar
        return true;
    }

    return false;
}

/**
 * Provided a source URL, if source is a default avatar, return the associated SVG.
 * Otherwise, return the URL pointing to a user-uploaded avatar.
 *
 * @param avatarURL - the avatar source from user's personalDetails
 * @param accountID - the accountID of the user
 */
function getAvatar(avatarURL: string, accountID: number): React.FC<SvgProps> | string {
    return isDefaultAvatar(avatarURL) ? getDefaultAvatar(accountID) : avatarURL;
}

/**
 * Provided an avatar URL, if avatar is a default avatar, return NewDot default avatar URL.
 * Otherwise, return the URL pointing to a user-uploaded avatar.
 *
 * @param avatarURL - the avatar source from user's personalDetails
 * @param accountID - the accountID of the user
 */
function getAvatarUrl(avatarURL: string, accountID: number): string {
    return isDefaultAvatar(avatarURL) ? getDefaultAvatarURL(accountID, true) : avatarURL;
}

/**
 * Avatars uploaded by users will have a _128 appended so that the asset server returns a small version.
 * This removes that part of the URL so the full version of the image can load.
 */
function getFullSizeAvatar(avatarURL: string, accountID: number): React.FC<SvgProps> | string {
    const source = getAvatar(avatarURL, accountID);
    if (typeof source !== 'string') {
        return source;
    }
    return source.replace('_128', '');
}

/**
 * Small sized avatars end with _128.<file-type>. This adds the _128 at the end of the
 * source URL (before the file type) if it doesn't exist there already.
 */
function getSmallSizeAvatar(avatarURL: string, accountID: number): React.FC<SvgProps> | string {
    const source = getAvatar(avatarURL, accountID);
    if (typeof source !== 'string') {
        return source;
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
 * Generate a random accountID base on searchValue.
 */
function generateAccountID(searchValue: string): number {
    return hashText(searchValue, 2 ** 32);
}

/**
 * Gets the secondary phone login number
 */
function getSecondaryPhoneLogin(loginList: Record<string, Login>): string | undefined {
    const parsedLoginList = Object.keys(loginList).map((login) => Str.removeSMSDomain(login));
    return parsedLoginList.find((login) => Str.isValidPhone(login));
}

export {
    hashText,
    hasLoginListError,
    hasLoginListInfo,
    getLoginListBrickRoadIndicator,
    getDefaultAvatar,
    getDefaultAvatarURL,
    isDefaultAvatar,
    getAvatar,
    getAvatarUrl,
    getSmallSizeAvatar,
    getFullSizeAvatar,
    generateAccountID,
    getSecondaryPhoneLogin,
};
export type {AvatarSource};
