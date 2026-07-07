import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

import {md5, Str} from 'expensify-common';

import type {LetterAvatarColorStyle} from './Avatars/letterAvatarPalette';
import type {DefaultAvatarIDs} from './Avatars/UserAvatarCatalog.types';

import {findAvatarIDFromURL, findCatalogMatchForURL, findLocalAvatarForURL} from './Avatars/AvatarLookup';
import {DEFAULT_LETTER_AVATAR_SCHEME, isLetterAvatarSchemeKey, LETTER_AVATAR_COLOR_KEYS, LETTER_AVATAR_SCHEMES} from './Avatars/letterAvatarPalette';
import {DEFAULT_AVATAR_PREFIX, USER_AVATARS} from './Avatars/UserAvatarCatalog';

type AvatarRange = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24;

type AvatarSource = IconAsset | string;

const DEFAULT_AVATAR_URL_PATTERNS = ['images/avatars/avatar_', 'images/avatars/default-avatar_', 'images/avatars/user/default'];
const LETTER_AVATAR_NAME_REGEX = /^letter-avatar-#[0-9A-F]{6}-#[0-9A-F]{6}-[A-Z]\.png$/;

/** Folds U+00C0-U+017F to the ASCII base letter; '.' entries have no fold. Index = codepoint - 0xC0. */
const LETTER_AVATAR_ACCENT_FOLD_TABLE =
    // cspell:disable-next-line
    'AAAAAAACEEEEIIIIDNOOOOO.OUUUUYTSAAAAAAACEEEEIIIIDNOOOOO.OUUUUYTYAAAAAACCCCCCCCDDDDEEEEEEEEEEGGGGGGGGHHHHIIIIIIIIIIIIJJKKKLLLLLLLLLLNNNNNNNNNOOOOOOOORRRRRRSSSSSSSSTTTTTTUUUUUUUUUUUUWWYYYZZZZZZS';

/**
 * Avatar naming convention
 *
 * Default Avatar - auto generated from accountID or email. A subset of User Avatars.
 * User Avatar - pre-designed avatar from UserAvatarCatalog.USER_AVATARS (defaults + Season F1).
 * Agent Avatar - bot avatar from AgentAvatarCatalog.AGENT_AVATARS, assigned to agent accounts.
 * Letter Avatar - first-letter avatar with color from letterAvatarPalette.LETTER_AVATAR_COLOR_OPTIONS.
 * Uploaded Avatar - user-uploaded image.
 *
 * Catalog-backed avatars (User + Agent) resolve to local SVGs at render time via AvatarLookup.findLocalAvatarForURL.
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
 * Returns the colors for a letter-avatar scheme key, falling back to the default scheme when the key is missing or unknown.
 *
 * @param avatarSchemeKey - A scheme key, e.g. "blue100"
 */
function getLetterAvatarScheme(avatarSchemeKey?: string): LetterAvatarColorStyle {
    if (avatarSchemeKey && isLetterAvatarSchemeKey(avatarSchemeKey)) {
        return LETTER_AVATAR_SCHEMES[avatarSchemeKey];
    }
    return DEFAULT_LETTER_AVATAR_SCHEME;
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
    if (accountID === CONST.ACCOUNT_ID.CONCIERGE || accountEmail === CONST.EMAIL.CONCIERGE || avatarURL === CONST.CONCIERGE_ICON_URL) {
        return defaultAvatars.ConciergeAvatar;
    }
    if (accountID === CONST.ACCOUNT_ID.NOTIFICATIONS || accountEmail === CONST.EMAIL.NOTIFICATIONS || avatarURL === CONST.NOTIFICATIONS_ICON_URL) {
        return defaultAvatars.NotificationsAvatar;
    }

    return USER_AVATARS.getLocal(getDefaultAvatarName({accountID, accountEmail, avatarURL}));
}

/**
 * Returns the user avatar name (e.g., "default-avatar_5") associated with an account.
 * This name corresponds to assets in the UserAvatarCatalog.
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
    if (Number(accountID) === CONST.ACCOUNT_ID.CONCIERGE || accountEmail === CONST.EMAIL.CONCIERGE) {
        return CONST.CONCIERGE_ICON_URL;
    }
    if (Number(accountID) === CONST.ACCOUNT_ID.NOTIFICATIONS || accountEmail === CONST.EMAIL.NOTIFICATIONS) {
        return CONST.NOTIFICATIONS_ICON_URL;
    }

    // The local default has no name to read initials from, so they come from the email. The backend emits
    // name-based initials on the avatar URL, which the client parses instead of recomputing here.
    const letterAvatarURL = getLetterAvatarURL(accountID, '', '', accountEmail ?? '');
    if (letterAvatarURL) {
        return letterAvatarURL;
    }

    return USER_AVATARS.getURL(getDefaultAvatarName({accountID, accountEmail, avatarURL})) ?? '';
}

/**
 * Extracts the catalog avatar name (user or agent) from a CloudFront avatar URL.
 *
 * @param avatarURL - The avatar URL
 * @returns The avatar name (e.g., 'default-avatar_5', 'bot-avatar--blue') or undefined if not a valid catalog URL
 */
function getCatalogAvatarNameFromURL(avatarURL?: AvatarSource): string | undefined {
    if (!avatarURL || typeof avatarURL !== 'string' || avatarURL === CONST.CONCIERGE_ICON_URL) {
        return undefined;
    }
    return findAvatarIDFromURL(avatarURL);
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
        if (avatarSource === CONST.NOTIFICATIONS_ICON_URL) {
            return true;
        }
    }

    return false;
}

/**
 * Determines if an avatar source is a catalog-backed avatar (user or agent).
 *
 * @param avatarSource - The avatar source to check
 * @returns True if the avatar URL maps to a known catalog entry
 */
function isCatalogAvatar(avatarSource?: AvatarSource): avatarSource is string {
    return !!getCatalogAvatarNameFromURL(avatarSource);
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
 * Determines if an avatar source is a backend-generated letter-avatar URL.
 * These URLs are served for photo-less users and contain the generated letter path segment.
 *
 * @param avatarSource - The avatar source to check
 * @returns True if the source is a string pointing to a generated letter avatar
 */
function isGeneratedLetterAvatarURL(avatarSource?: AvatarSource): boolean {
    return typeof avatarSource === 'string' && avatarSource.includes(CONST.GENERATED_LETTER_AVATAR_PATH);
}

/**
 * Returns the first alphanumeric character of a string uppercased, folding Latin accented letters
 * to their ASCII base letter, or '' when the string yields no initial.
 *
 * @param name - The string to read the first character from
 */
function firstLetterAvatarCharacter(name: string): string {
    for (const character of name) {
        const codePoint = character.codePointAt(0) ?? 0;
        if (codePoint < 0x80) {
            if (/[a-z0-9]/i.test(character)) {
                return character.toUpperCase();
            }
            continue;
        }
        // Latin accents fold to their ASCII base letter; any other non-ASCII codepoint contributes no
        // initial rather than substituting a later ASCII letter.
        if (codePoint >= 0xc0 && codePoint <= 0x17f) {
            const folded = LETTER_AVATAR_ACCENT_FOLD_TABLE.charAt(codePoint - 0xc0);
            return folded === '.' ? '' : folded;
        }
        return '';
    }
    return '';
}

/**
 * Builds the generated letter-avatar URL for an account from its name and login.
 * Initials come from the first alphanumeric character of the first and last name, falling back to the login
 * for non-SMS logins. The color key is picked by hashing the login, or by accountID modulo when there is no login.
 *
 * @param accountID - The user's account ID
 * @param firstName - The user's first name
 * @param lastName - The user's last name
 * @param login - The user's login (email or SMS), or '' when unknown
 * @returns The generated letter-avatar URL, or '' when no letter avatar applies
 */
function getLetterAvatarURL(accountID: number, firstName: string, lastName: string, login: string): string {
    // The displayed login has the merge prefix stripped, so derive the initial and color from the
    // stripped form to match what users see. This is a no-op for non-merged logins.
    const normalizedLogin = login.replace(CONST.REGEX.MERGED_ACCOUNT_PREFIX, '');
    if (
        accountID === CONST.ACCOUNT_ID.CONCIERGE ||
        accountID === CONST.ACCOUNT_ID.NOTIFICATIONS ||
        normalizedLogin === CONST.EMAIL.CONCIERGE ||
        normalizedLogin === CONST.EMAIL.NOTIFICATIONS
    ) {
        return '';
    }

    let initials = firstLetterAvatarCharacter(firstName) + firstLetterAvatarCharacter(lastName);
    // Only a real email seeds the initial. Phone numbers (raw or @expensify.sms) fall back to the illustrated default.
    if (initials === '' && !normalizedLogin.endsWith(CONST.SMS.DOMAIN) && Str.isValidEmail(normalizedLogin)) {
        initials = firstLetterAvatarCharacter(normalizedLogin);
    }
    if (initials === '') {
        return '';
    }

    const colorIndex = normalizedLogin !== '' ? parseInt(md5(normalizedLogin).substring(0, 4), 16) % LETTER_AVATAR_COLOR_KEYS.length : accountID % LETTER_AVATAR_COLOR_KEYS.length;
    const colorKey = LETTER_AVATAR_COLOR_KEYS.at(colorIndex) ?? LETTER_AVATAR_COLOR_KEYS.at(0);
    return `${CONST.CLOUDFRONT_URL}${CONST.GENERATED_LETTER_AVATAR_PATH}v1/${colorKey}/${initials}.png`;
}

/**
 * Parses a generated letter-avatar URL into its color scheme and initials.
 * The last two path segments before the extension are the color key and the initials.
 *
 * @param source - The avatar source to parse
 * @returns The colors and initials, or undefined when the source is not a generated letter-avatar URL
 */
function parseLetterAvatarURL(source: AvatarSource | undefined): {colors: LetterAvatarColorStyle; initials: string} | undefined {
    if (typeof source !== 'string' || !isGeneratedLetterAvatarURL(source)) {
        return undefined;
    }

    const fileName = source.split('?').at(0)?.split('/').slice(-2) ?? [];
    const colorKey = fileName.at(0);
    const rawInitials = fileName.at(1);
    if (colorKey === undefined || rawInitials === undefined) {
        return undefined;
    }

    const initials = rawInitials
        .replace(/\.png$/i, '')
        .replace(/_128$/, '')
        .toUpperCase();
    if (initials === '') {
        return undefined;
    }

    const colors = isLetterAvatarSchemeKey(colorKey) ? LETTER_AVATAR_SCHEMES[colorKey] : DEFAULT_LETTER_AVATAR_SCHEME;
    return {colors, initials};
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

    const localFromCatalog = findLocalAvatarForURL(avatarSource);
    if (localFromCatalog) {
        return localFromCatalog;
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
    const match = findCatalogMatchForURL(avatarSource);
    if (match) {
        return match.catalog.getURL(match.id);
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

    // Generated letter avatars are published at a single size, so they have no _SIZE variants.
    if (isGeneratedLetterAvatarURL(source)) {
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
 * Swaps a catalog-backed avatar URL for its bundled local SVG so it renders without a network request.
 * Non-catalog sources (uploaded image URLs, SVG components, or undefined) are returned unchanged.
 */
function optimizeAvatarSource(source?: AvatarSource): AvatarSource | undefined {
    return findLocalAvatarForURL(source) ?? source;
}

export {
    getAvatar,
    getAvatarURL,
    getDefaultAvatar,
    getDefaultAvatarName,
    getDefaultAvatarURL,
    getLetterAvatarScheme,
    getCatalogAvatarNameFromURL,
    getFullSizeAvatar,
    getSmallSizeAvatar,
    getLetterAvatarURL,
    parseLetterAvatarURL,
    isCatalogAvatar,
    isDefaultAvatar,
    isGeneratedLetterAvatarURL,
    isLetterAvatar,
    optimizeAvatarSource,
};
export type {AvatarSource};
