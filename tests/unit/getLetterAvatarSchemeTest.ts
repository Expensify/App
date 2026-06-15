import {LETTER_AVATAR_SCHEMES} from '@libs/Avatars/UserAvatarCatalog';
import {getLetterAvatarScheme} from '@libs/UserAvatarUtils';

const OPTIONS = Object.values(LETTER_AVATAR_SCHEMES);

describe('getLetterAvatarScheme', () => {
    it('returns the explicitly chosen scheme when the key is valid', () => {
        expect(getLetterAvatarScheme({avatarSchemeKey: 'pink400', accountEmail: 'a@b.com'})).toEqual(LETTER_AVATAR_SCHEMES.pink400);
    });

    it('falls back to a hashed default when the chosen key is unknown', () => {
        expect(OPTIONS).toContainEqual(getLetterAvatarScheme({avatarSchemeKey: 'not-a-real-key', accountEmail: 'a@b.com'}));
    });

    it('derives a stable default from the email (same email resolves to the same scheme)', () => {
        const a = getLetterAvatarScheme({accountEmail: 'george@expensify.com'});
        const b = getLetterAvatarScheme({accountEmail: 'george@expensify.com'});
        expect(a).toEqual(b);
        expect(OPTIONS).toContainEqual(a);
    });

    it('uses the accountID when there is no email', () => {
        expect(getLetterAvatarScheme({accountID: 7})).toEqual(OPTIONS.at(7 % OPTIONS.length));
    });

    it('returns a valid scheme when nothing is provided', () => {
        expect(OPTIONS).toContainEqual(getLetterAvatarScheme({}));
    });
});
