import {Str} from 'expensify-common';
import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import * as defaultAvatars from '@components/Icon/DefaultAvatars';
import {ConciergeAvatar, NotificationsAvatar} from '@components/Icon/Expensicons';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Account, LoginList, Session} from '@src/types/onyx';
import type Login from '@src/types/onyx/Login';
import type IconAsset from '@src/types/utils/IconAsset';
import hashCode from './hashCode';

type AvatarRange = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24;

type AvatarSource = IconAsset | string;

type LoginListIndicator = ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS> | undefined;

let account: OnyxEntry<Account>;
Onyx.connect({
    key: ONYXKEYS.ACCOUNT,
    callback: (value) => {
        account = value ?? {};
    },
});

let session: OnyxEntry<Session>;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        session = value ?? {};
    },
});

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
function hasLoginListInfo(loginList: OnyxEntry<LoginList>): boolean {
    return !Object.values(loginList ?? {}).every((field) => field.validatedDate);
}

/**
 * Gets the appropriate brick road indicator status for a given loginList.
 * Error status is higher priority, so we check for that first.
 */
function getLoginListBrickRoadIndicator(loginList: OnyxEntry<LoginList>): LoginListIndicator {
    if (hasLoginListError(loginList)) {
        return CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    }
    if (hasLoginListInfo(loginList)) {
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
 * Helper method to return the default avatar associated with the given accountID
 */
function getDefaultAvatar(accountID = -1, avatarURL?: string): IconAsset | undefined {
    if (accountID === CONST.ACCOUNT_ID.CONCIERGE) {
        return ConciergeAvatar;
    }
    if (accountID === CONST.ACCOUNT_ID.NOTIFICATIONS) {
        return NotificationsAvatar;
    }

    // There are 24 possible default avatars, so we choose which one this user has based
    // on a simple modulo operation of their login number. Note that Avatar count starts at 1.

    // When creating a chat the backend response will return the actual user ID.
    // But the avatar link still corresponds to the original ID-generated link. So we extract the SVG image number from the backend's link instead of using the user ID directly
    let accountIDHashBucket: AvatarRange | undefined;
    if (avatarURL) {
        const match = avatarURL.match(/(default-avatar_|avatar_)(\d+)(?=\.)/);
        const lastDigit = match && parseInt(match[2], 10);
        accountIDHashBucket = lastDigit as AvatarRange;
    } else if (accountID > 0) {
        accountIDHashBucket = ((accountID % CONST.DEFAULT_AVATAR_COUNT) + 1) as AvatarRange;
    }

    if (!accountIDHashBucket) {
        return;
    }

    return defaultAvatars[`Avatar${accountIDHashBucket}`];
}

/**
 * Helper method to return default avatar URL associated with the accountID
 */
function getDefaultAvatarURL(accountID: string | number = ''): string {
    if (Number(accountID) === CONST.ACCOUNT_ID.CONCIERGE) {
        return CONST.CONCIERGE_ICON_URL;
    }

    // Note that Avatar count starts at 1 which is why 1 has to be added to the result (or else 0 would result in a broken avatar link)
    const accountIDHashBucket = (Number(accountID) % CONST.DEFAULT_AVATAR_COUNT) + 1;
    const avatarPrefix = 'default-avatar';

    return `${CONST.CLOUDFRONT_URL}/images/avatars/${avatarPrefix}_${accountIDHashBucket}.png`;
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
 * Provided an avatar source, if source is a default avatar, return the associated SVG.
 * Otherwise, return the URL or SVG pointing to the user-uploaded avatar.
 *
 * @param avatarSource - the avatar source from user's personalDetails
 * @param accountID - the accountID of the user
 */
function getAvatar(avatarSource?: AvatarSource, accountID?: number): AvatarSource | undefined {
    return isDefaultAvatar(avatarSource) ? getDefaultAvatar(accountID, avatarSource) : avatarSource;
}

/**
 * Provided an avatar URL, if avatar is a default avatar, return NewDot default avatar URL.
 * Otherwise, return the URL pointing to a user-uploaded avatar.
 *
 * @param avatarSource - the avatar source from user's personalDetails
 * @param accountID - the accountID of the user
 */
function getAvatarUrl(avatarSource: AvatarSource | undefined, accountID: number): AvatarSource {
    return isDefaultAvatar(avatarSource) ? getDefaultAvatarURL(accountID) : avatarSource;
}

/**
 * Avatars uploaded by users will have a _128 appended so that the asset server returns a small version.
 * This removes that part of the URL so the full version of the image can load.
 */
function getFullSizeAvatar(avatarSource: AvatarSource | undefined, accountID?: number): AvatarSource | undefined {
    const source = getAvatar(avatarSource, accountID);
    if (typeof source !== 'string') {
        return source;
    }
    return source.replace('_128', '');
}

/**
 * Small sized avatars end with _128.<file-type>. This adds the _128 at the end of the
 * source URL (before the file type) if it doesn't exist there already.
 */
function getSmallSizeAvatar(avatarSource?: AvatarSource, accountID?: number): AvatarSource | undefined {
    const source = getAvatar(avatarSource, accountID);
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
 * Gets the secondary phone login number
 */
function getSecondaryPhoneLogin(loginList: OnyxEntry<Login>): string | undefined {
    const parsedLoginList = Object.keys(loginList ?? {}).map((login) => Str.removeSMSDomain(login));
    return parsedLoginList.find((login) => Str.isValidE164Phone(login));
}

/**
 * Gets the contact method
 */
function getContactMethod(): string {
    return account?.primaryLogin ?? session?.email ?? '';
}

export {
    generateAccountID,
    getAvatar,
    getAvatarUrl,
    getDefaultAvatarURL,
    getFullSizeAvatar,
    getLoginListBrickRoadIndicator,
    getSecondaryPhoneLogin,
    getSmallSizeAvatar,
    hasLoginListError,
    hasLoginListInfo,
    hashText,
    isDefaultAvatar,
    getContactMethod,
};
export type {AvatarSource, LoginListIndicator};
