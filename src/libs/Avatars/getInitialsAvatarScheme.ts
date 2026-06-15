import {md5} from 'expensify-common';
import CONST from '@src/CONST';
import {LETTER_AVATAR_SCHEMES} from './letterAvatarPalette';
import type {LetterAvatarScheme} from './letterAvatarPalette';

type InitialsAvatarSchemeArgs = {
    /** The user's login/email — primary input for the default scheme hash */
    login?: string;

    /** The user's account ID — fallback hash input when there's no login */
    accountID?: number;

    /** A scheme key the user explicitly picked (e.g. "blue100"); takes precedence over the hash */
    avatarSchemeKey?: string;
};

/** Picks a stable default scheme index from the login (or accountID) hash, mirroring the default-avatar bucket logic. */
function getDefaultSchemeIndex(login?: string, accountID: number = CONST.DEFAULT_NUMBER_ID): number {
    if (login) {
        return Number.parseInt(md5(login).substring(0, 4), 16) % LETTER_AVATAR_SCHEMES.length;
    }
    if (accountID > 0) {
        return accountID % LETTER_AVATAR_SCHEMES.length;
    }
    return 0;
}

/**
 * Resolves the colour scheme for a generated initials avatar: the explicitly picked key when present and valid,
 * otherwise a stable default derived from the login/accountID hash.
 */
function getInitialsAvatarScheme({login, accountID, avatarSchemeKey}: InitialsAvatarSchemeArgs): LetterAvatarScheme {
    const picked = avatarSchemeKey ? LETTER_AVATAR_SCHEMES.find((scheme) => scheme.key === avatarSchemeKey) : undefined;
    return picked ?? LETTER_AVATAR_SCHEMES[getDefaultSchemeIndex(login, accountID)];
}

export default getInitialsAvatarScheme;
export type {InitialsAvatarSchemeArgs};
