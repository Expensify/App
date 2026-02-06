import getLastSuffixFromPath from '@libs/Navigation/helpers/getLastSuffixFromPath';

jest.mock('@libs/Log', () => ({
    warn: jest.fn(),
}));

describe('getLastSuffixFromPath', () => {
    it('should extract correct suffix from standard path', () => {
        const path = 'settings/profile/verify-account';
        const expected = 'verify-account';
        const result = getLastSuffixFromPath(path);

        expect(result).toBe(expected);
    });

    it('should handle path that is just the suffix', () => {
        const path = 'verify-account';
        const expected = 'verify-account';
        const result = getLastSuffixFromPath(path);

        expect(result).toBe(expected);
    });

    it('should ignore query params', () => {
        const path = 'settings/profile/verify-account?sortBy=date';
        const expected = 'verify-account';
        const result = getLastSuffixFromPath(path);

        expect(result).toBe(expected);
    });

    it('should handle trailing slashes', () => {
        const path = 'settings/profile/verify-account/';
        const expected = 'verify-account';
        const result = getLastSuffixFromPath(path);

        expect(result).toBe(expected);
    });
});
