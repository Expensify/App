import getInitialsAvatarScheme from '@libs/Avatars/getInitialsAvatarScheme';
import {LETTER_AVATAR_SCHEMES} from '@libs/Avatars/letterAvatarPalette';

const KEYS = LETTER_AVATAR_SCHEMES.map((scheme) => scheme.key);

describe('getInitialsAvatarScheme', () => {
    it('returns the explicitly picked scheme when the key is valid', () => {
        expect(getInitialsAvatarScheme({avatarSchemeKey: 'pink400', login: 'a@b.com'}).key).toBe('pink400');
    });

    it('falls back to a hashed default when the picked key is unknown', () => {
        const result = getInitialsAvatarScheme({avatarSchemeKey: 'not-a-real-key', login: 'a@b.com'});
        expect(KEYS).toContain(result.key);
    });

    it('derives a stable default from the login (same login resolves to the same scheme)', () => {
        const a = getInitialsAvatarScheme({login: 'george@expensify.com'});
        const b = getInitialsAvatarScheme({login: 'george@expensify.com'});
        expect(a.key).toBe(b.key);
        expect(KEYS).toContain(a.key);
    });

    it('uses the accountID when there is no login', () => {
        const result = getInitialsAvatarScheme({accountID: 7});
        expect(result.key).toBe(LETTER_AVATAR_SCHEMES.at(7 % LETTER_AVATAR_SCHEMES.length)?.key);
    });

    it('returns a valid scheme when nothing is provided', () => {
        expect(KEYS).toContain(getInitialsAvatarScheme({}).key);
    });
});
