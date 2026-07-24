import {renderHook} from '@testing-library/react-native';

import useLetterAvatars from '@hooks/useLetterAvatars';

import {LETTER_AVATAR_COLOR_KEYS, LETTER_AVATAR_SCHEMES} from '@libs/Avatars/letterAvatarPalette';

const mockCurrentUserPersonalDetails = jest.fn<{firstName?: string; lastName?: string; login?: string; email?: string}, []>();
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => mockCurrentUserPersonalDetails());

describe('useLetterAvatars', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns one option per palette scheme with the user initials', () => {
        mockCurrentUserPersonalDetails.mockReturnValue({
            firstName: 'Sofia',
            lastName: 'Barbosa',
            login: 'sofia@example.com',
        });

        const {result} = renderHook(() => useLetterAvatars());

        expect(result.current.initials).toBe('SB');
        expect(result.current.options).toHaveLength(LETTER_AVATAR_COLOR_KEYS.length);
        for (const [index, option] of result.current.options.entries()) {
            const schemeKey = LETTER_AVATAR_COLOR_KEYS.at(index);
            expect(option.id).toBe(schemeKey);
            expect(option.colors).toEqual(schemeKey ? LETTER_AVATAR_SCHEMES[schemeKey] : undefined);
        }
    });

    it('falls back to the session email when personal details lack a login', () => {
        mockCurrentUserPersonalDetails.mockReturnValue({
            firstName: '',
            lastName: '',
            email: 'sofia@example.com',
        });

        const {result} = renderHook(() => useLetterAvatars());

        expect(result.current.initials).toBe('S');
        expect(result.current.options).toHaveLength(LETTER_AVATAR_COLOR_KEYS.length);
    });

    it('uses a single initial when there is only a first name', () => {
        mockCurrentUserPersonalDetails.mockReturnValue({
            firstName: 'Sofia',
            lastName: '',
            login: 'sofia@example.com',
        });

        const {result} = renderHook(() => useLetterAvatars());

        expect(result.current.initials).toBe('S');
    });

    it('falls back to the login initial when there is no name', () => {
        mockCurrentUserPersonalDetails.mockReturnValue({
            firstName: '',
            lastName: '',
            login: 'dave@example.com',
        });

        const {result} = renderHook(() => useLetterAvatars());

        expect(result.current.initials).toBe('D');
        expect(result.current.options).toHaveLength(LETTER_AVATAR_COLOR_KEYS.length);
    });

    it.each([
        ['an SMS login and no name', {firstName: '', lastName: '', login: '+15551234567@expensify.sms'}],
        ['no usable characters', {firstName: '!@#$%', lastName: '', login: ''}],
        ['empty personal details', {}],
    ])('returns no options for %s', (_, personalDetails) => {
        mockCurrentUserPersonalDetails.mockReturnValue(personalDetails);

        const {result} = renderHook(() => useLetterAvatars());

        expect(result.current.initials).toBe('');
        expect(result.current.options).toEqual([]);
    });
});
