import {md5} from 'expensify-common';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import {getAvatarLocal as avatarCatalogGetAvatarLocal, getAvatarURL as avatarCatalogGetAvatarURL, DEFAULT_AVATAR_PREFIX, PRESET_AVATAR_CATALOG} from './Avatars/PresetAvatarCatalog';
import type {DefaultAvatarIDs, PresetAvatarID} from './Avatars/PresetAvatarCatalog.types';

type AvatarRange = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24;

type AvatarSource = IconAsset | string;

const DEFAULT_AVATAR_URL_PATTERNS = ['images/avatars/avatar_', 'images/avatars/default-avatar_', 'images/avatars/user/default'];
const LETTER_AVATAR_NAME_REGEX = /^letter-avatar-#[0-9A-F]{6}-#[0-9A-F]{6}-[A-Z]\.png$/;

/**
 * User avatars naming convention
 *
 * Default Avatar - avatar auto generated based on users accountID or email. Default Avatars are a subset of Preset Avatars
 * Preset Avatar - pre-designed avatar from PresetAvatarCatalog.PRESET_AVATAR_CATALOG (includes default avatars & themed avatars like Season F1)
 * Letter Avatar - avatar with users' displayName first letter and color from PresetAvatarCatalog.LETTER_AVATAR_COLOR_OPTIONS
 * Uploaded Avatar - avatar uploaded by user
 *
 * When dealing with Default & Preset avatars we want to serve them as local SVGs for better user experience.
 * In that case `AvatarSource` will be an SVG, otherwise it's an url (string).
 */

type CommonAvatarArgsType = {
    /** The user's account ID (used for modulo calculation if email not provided) */
    accountID?: number;
    /** The user's email address (takes precedence over accountID for hash calculation) */
    accountEmail?: string;
};

type DefaultAvatarArgsType = CommonAvatarArgsType & {
    /** Existing avatar URL */
    avatarURL?: string;
};

type GetAvatarArgsType = CommonAvatarArgsType & {
    /** The avatar source - can be a URL string or SVG component */
    avatarSource?: AvatarSource;
};

type DefaultAvatarsType = {
    defaultAvatars: Record<'ConciergeAvatar' | 'NotificationsAvatar', IconAsset>;
};

/**
 * Calculates which avatar bucket an account belongs to based on accountID, email, or existing avatar URL.
 * There are 24 possible default avatars, distributed using modulo operation.
 *
 * @param args - Object containing parameters
 * @param args.accountID - The user's account ID
 * @param args.accountEmail - The user's email address (for consistency with backend logic, used for hash calculation if provided)
 * @param args.avatarURL - Existing avatar URL (parsed to extract avatar number if available)
 * @returns A number from 1-24 indicating which avatar bucket the account belongs to
 */
function getAccountIDHashBucket({accountID = CONST.DEFAULT_NUMBER_ID, accountEmail, avatarURL}: DefaultAvatarArgsType): AvatarRange {
    // There are 24 possible default avatars, so we choose which one this user has based
    // on a simple modulo operation of their login number. Note that Avatar count starts at 1.

    // When creating a chat the backend response will return the actual user ID.
    // But the avatar link still corresponds to the original ID-generated link. So we extract the SVG image number from the backend's link instead of using the user ID directly
    let accountIDHashBucket: AvatarRange = 1;
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
 * Returns the default avatar asset associated with the given accountID.
 * Special accounts (Concierge, Notifications) have dedicated avatars.
 * Other accounts get an avatar from the default avatar set based on their accountID hash bucket.
 *
 * @param args - Object containing avatar parameters
 * @param args.accountID - The user's account ID
 * @param args.accountEmail - The user's email address (for consistency with backend logic, used for avatar calculation if provided)
 * @param args.avatarURL - Existing avatar URL (parsed to extract avatar number if available)
 * @returns The avatar icon asset (SVG component), or undefined if no default avatar matches
 */
function getDefaultAvatar({accountID = CONST.DEFAULT_NUMBER_ID, accountEmail, avatarURL, defaultAvatars}: DefaultAvatarArgsType & DefaultAvatarsType): IconAsset | undefined {
    if (accountID === CONST.ACCOUNT_ID.CONCIERGE) {
        return defaultAvatars.ConciergeAvatar;
    }
    if (accountID === CONST.ACCOUNT_ID.NOTIFICATIONS) {
        return defaultAvatars.NotificationsAvatar;
    }

    return avatarCatalogGetAvatarLocal(getDefaultAvatarName({accountID, accountEmail, avatarURL}));
}

/**
 * Returns the custom avatar name (e.g., "default-avatar_5") associated with an account.
 * This name corresponds to assets in the PresetAvatarCatalog.
 *
 * @param args - Object containing avatar parameters
 * @param args.accountID - The user's account ID
 * @param args.accountEmail - The user's email address (for consistency with backend logic, used for hash calculation if provided)
 * @param args.avatarURL - Existing avatar URL (parsed to extract avatar number if available)
 * @returns The custom avatar name identifier (e.g., "default-avatar_5")
 */
function getDefaultAvatarName({accountID = CONST.DEFAULT_NUMBER_ID, accountEmail, avatarURL}: DefaultAvatarArgsType): DefaultAvatarIDs {
    return `${DEFAULT_AVATAR_PREFIX}_${getAccountIDHashBucket({accountID, accountEmail, avatarURL})}`;
}

/**
 * Returns the CloudFront CDN URL for a custom/default avatar.
 * This function is used when you need the actual URL string (e.g., for sharing, external display).
 * Concierge account gets a special hardcoded URL.
 *
 * @param args - Object containing avatar parameters
 * @param args.accountID - The user's account ID
 * @param args.accountEmail - The user's email address (for consistency with backend logic, used for avatar calculation if provided)
 * @param args.avatarURL - Existing avatar URL (parsed to extract avatar number if available)
 * @returns The CloudFront CDN URL for the avatar image
 *
 */
function getDefaultAvatarURL({accountID = CONST.DEFAULT_NUMBER_ID, accountEmail, avatarURL}: DefaultAvatarArgsType): string {
    if (Number(accountID) === CONST.ACCOUNT_ID.CONCIERGE) {
        return CONST.CONCIERGE_ICON_URL;
    }

    return avatarCatalogGetAvatarURL(getDefaultAvatarName({accountID, accountEmail, avatarURL}));
}

/**
 * Extracts the custom avatar name from a CloudFront avatar URL.
 * Useful for identifying which default avatar a URL points to.
 *
 * @param avatarURL - The avatar URL
 * @returns The avatar name (e.g., 'default-avatar_5') or undefined if not a valid custom avatar URL
 */
function getPresetAvatarNameFromURL(avatarURL?: AvatarSource): PresetAvatarID | undefined {
    if (!avatarURL || typeof avatarURL !== 'string' || avatarURL === CONST.CONCIERGE_ICON_URL) {
        return undefined;
    }

    // Extract avatar name from CloudFront URL and make sure it's one of defaults
    const match = (avatarURL.split('/').at(-1)?.split('.')?.[0] ?? '') as PresetAvatarID;
    if (PRESET_AVATAR_CATALOG[match]) {
        return match;
    }
}

/**
 * Determines if an avatar source points to a default avatar (not user-uploaded).
 * Default avatars include numbered avatars (avatar_X, default-avatar_X) and Concierge avatars.
 *
 * @param avatarSource - The avatar source (URL string or SVG asset)
 * @returns True if the avatar is a default avatar, false otherwise
 */
function isDefaultAvatar(avatarSource?: AvatarSource): avatarSource is string | undefined {
    if (typeof avatarSource === 'string') {
        for (const avatarPattern of DEFAULT_AVATAR_URL_PATTERNS) {
            if (avatarSource.includes(avatarPattern)) {
                return true;
            }
        }
        // We use a hardcoded "default" Concierge avatar
        if (avatarSource === CONST.CONCIERGE_ICON_URL_2021 || avatarSource === CONST.CONCIERGE_ICON_URL) {
            return true;
        }
    }

    return false;
}

/**
 * Determines if an avatar source is a custom avatar from the PresetAvatarCatalog.
 * Custom avatars are a specific set of default avatars that can be identified by their URL.
 *
 * @param avatarSource - The avatar source to check
 * @returns True if the avatar is a custom avatar from the catalog
 */
function isPresetAvatar(avatarSource?: AvatarSource): avatarSource is string {
    return !!getPresetAvatarNameFromURL(avatarSource);
}

/**
 * Determines if an avatar is a letter avatar based on its original filename.
 * Letter avatars follow the pattern: letter-avatar-#RRGGBB-#RRGGBB-X.png
 * where RRGGBB are hex colors and X is a letter.
 *
 * @param originalFileName - The original filename of the avatar
 * @returns True if the filename matches the letter avatar pattern
 */
function isLetterAvatar(originalFileName?: string): boolean {
    return !!(originalFileName && LETTER_AVATAR_NAME_REGEX.test(originalFileName));
}

/**
 * Returns the appropriate avatar source (SVG asset or URL) for rendering in React components.
 *
 * **This is the primary function for getting avatar sources throughout the application.**
 *
 * **Behavior**:
 * - For default/custom avatars: Returns local SVG component for optimal performance
 * - For uploaded avatars: Returns the URL string
 * - For undefined sources: Returns undefined
 *
 * **Performance**: Default avatars are served as local SVG assets to avoid network requests
 * and provide instant rendering.
 *
 * @param args - Object containing avatar parameters
 * @param args.accountID - The user's account ID
 * @param args.accountEmail - The user's email address (for consistency with backend logic, used for avatar calculation if provided)
 * @param args.avatarSource - The avatar source (URL or SVG component)
 * @returns The avatar source ready for rendering (SVG component for defaults, URL string for uploads)
 *
 */
function getAvatar({avatarSource, accountID = CONST.DEFAULT_NUMBER_ID, accountEmail, defaultAvatars}: GetAvatarArgsType & DefaultAvatarsType): AvatarSource | undefined {
    if (isDefaultAvatar(avatarSource)) {
        return getDefaultAvatar({accountID, accountEmail, avatarURL: avatarSource, defaultAvatars});
    }

    const maybePresetAvatarName = getPresetAvatarNameFromURL(avatarSource);
    if (maybePresetAvatarName) {
        return avatarCatalogGetAvatarLocal(maybePresetAvatarName);
    }

    return avatarSource;
}

/**
 * Returns the URL string for an avatar.
 * If the avatar is a custom avatar, returns the CloudFront CDN URL.
 * Otherwise, returns the original avatar source URL.
 *
 * @param args - Object containing avatar parameters
 * @param args.accountID - The user's account ID
 * @param args.accountEmail - The user's email address (for consistency with backend logic, used for avatar calculation if provided)
 * @param args.avatarSource - The avatar source (URL or SVG component)
 * @returns The avatar URL string
 */
function getAvatarURL({accountID = CONST.DEFAULT_NUMBER_ID, avatarSource, accountEmail}: GetAvatarArgsType): AvatarSource | undefined {
    if (isDefaultAvatar(avatarSource)) {
        return getDefaultAvatarURL({accountID, accountEmail, avatarURL: avatarSource});
    }
    const maybePresetAvatarName = getPresetAvatarNameFromURL(avatarSource);
    if (maybePresetAvatarName) {
        return avatarCatalogGetAvatarURL(maybePresetAvatarName);
    }
    return avatarSource;
}

/**
 * Returns the full-size version of an avatar by removing the _128 size suffix.
 * User-uploaded avatars have _128 appended for small versions returned by the asset server.
 * This function removes that suffix to load the full-resolution image.
 *
 * @param args - Object containing avatar parameters
 * @param args.accountID - The user's account ID
 * @param args.accountEmail - The user's email address (for consistency with backend logic, used for avatar calculation if provided)
 * @param args.avatarSource - The avatar source (URL or SVG component)
 * @returns The full-size avatar source
 */
function getFullSizeAvatar(args: GetAvatarArgsType & DefaultAvatarsType): AvatarSource | undefined {
    const source = getAvatar(args);
    if (typeof source !== 'string') {
        return source;
    }
    return source.replace('_128', '');
}

/**
 * Returns the small-size version of an avatar by adding _128 suffix before the file extension.
 * Small avatars are 128px versions used for better performance in lists and thumbnails.
 * Only works for CloudFront URLs; other URLs are returned as-is.
 *
 * @param args - Object containing avatar parameters
 * @param args.accountID - The user's account ID
 * @param args.accountEmail - The user's email address (for consistency with backend logic, used for avatar calculation if provided)
 * @param args.avatarSource - The avatar source (URL or SVG component)
 * @returns The small-size avatar source with _128 suffix (if applicable)
 */
function getSmallSizeAvatar(args: GetAvatarArgsType & DefaultAvatarsType): AvatarSource | undefined {
    const source = getAvatar(args);
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

export {
    getAvatar,
    getAvatarURL,
    getDefaultAvatar,
    getDefaultAvatarName,
    getDefaultAvatarURL,
    getPresetAvatarNameFromURL,
    getFullSizeAvatar,
    getSmallSizeAvatar,
    isPresetAvatar,
    isDefaultAvatar,
    isLetterAvatar,
};
export type {AvatarSource};
