import {DEFAULT_LETTER_AVATAR_SCHEME, LETTER_AVATAR_SCHEMES} from '@libs/Avatars/letterAvatarPalette';
import {getLetterAvatarScheme} from '@libs/UserAvatarUtils';

describe('getLetterAvatarScheme', () => {
    it('returns the scheme for a valid key', () => {
        expect(getLetterAvatarScheme('pink400')).toEqual(LETTER_AVATAR_SCHEMES.pink400);
    });

    it('falls back to the default scheme for an unknown key', () => {
        expect(getLetterAvatarScheme('not-a-real-key')).toEqual(DEFAULT_LETTER_AVATAR_SCHEME);
    });

    it('falls back to the default scheme for inherited Object keys', () => {
        expect(getLetterAvatarScheme('toString')).toEqual(DEFAULT_LETTER_AVATAR_SCHEME);
        expect(getLetterAvatarScheme('constructor')).toEqual(DEFAULT_LETTER_AVATAR_SCHEME);
    });

    it('falls back to the default scheme when no key is given', () => {
        expect(getLetterAvatarScheme()).toEqual(DEFAULT_LETTER_AVATAR_SCHEME);
    });
});
