import type {LetterAvatarColorStyle, LetterAvatarSchemeKey} from '@libs/Avatars/letterAvatarPalette';
import {LETTER_AVATAR_COLOR_KEYS, LETTER_AVATAR_SCHEMES} from '@libs/Avatars/letterAvatarPalette';
import {getLetterAvatarInitials} from '@libs/UserAvatarUtils';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';

type LetterAvatarOption = {
    /** The color-scheme key, persisted when the user picks this option */
    id: LetterAvatarSchemeKey;

    /** Background and fill colors for the option */
    colors: LetterAvatarColorStyle;
};

type LetterAvatarsResult = {
    /** The current user's letter-avatar initials, or '' when no letter avatar applies */
    initials: string;

    /** One option per palette scheme, empty when there are no initials */
    options: LetterAvatarOption[];
};

/**
 * Returns the current user's letter-avatar initials and one pickable option per palette color scheme.
 */
function useLetterAvatars(): LetterAvatarsResult {
    const {firstName, lastName, login} = useCurrentUserPersonalDetails();
    const initials = getLetterAvatarInitials(firstName ?? '', lastName ?? '', login ?? '');

    if (initials === '') {
        return {initials, options: []};
    }

    return {
        initials,
        options: LETTER_AVATAR_COLOR_KEYS.map((id) => ({
            id,
            colors: LETTER_AVATAR_SCHEMES[id],
        })),
    };
}

export default useLetterAvatars;
export type {LetterAvatarOption};
