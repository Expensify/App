import Log from '@libs/Log';
import normalizePath from '@libs/Navigation/helpers/normalizePath';

const mockLogAlert = jest.spyOn(Log, 'alert').mockImplementation(() => {});

describe('normalizePath', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('adds the leading slash', () => {
        expect(normalizePath('settings/profile')).toBe('/settings/profile');
    });

    it('leaves a well-formed path untouched and does not alert', () => {
        expect(normalizePath('/settings/profile')).toBe('/settings/profile');
        expect(mockLogAlert).not.toHaveBeenCalled();
    });

    // A '//' path is protocol-relative to the browser, so pushState rejects it (#97470).
    it.each([
        ['//settings/profile', '/settings/profile'],
        ['///settings/profile', '/settings/profile'],
        ['////workspaces/ABC123/accounting', '/workspaces/ABC123/accounting'],
        ['/workspaces//ABC123/accounting', '/workspaces/ABC123/accounting'],
    ])('collapses repeated slashes: %s', (input, expected) => {
        expect(normalizePath(input)).toBe(expected);
    });

    it('alerts with the path and without the query when the path is malformed', () => {
        normalizePath('//workspaces/ABC123/accounting?q=secret');

        expect(mockLogAlert).toHaveBeenCalledTimes(1);
        expect(mockLogAlert).toHaveBeenCalledWith(expect.stringContaining('malformed path'), expect.objectContaining({path: '//workspaces/ABC123/accounting'}));
        expect(JSON.stringify(mockLogAlert.mock.calls)).not.toContain('secret');
    });

    it('keeps the query intact, including a slash pair inside a param', () => {
        expect(normalizePath('//search?q=a&backTo=https://example.com')).toBe('/search?q=a&backTo=https://example.com');
    });

    it('does not alert for a query that contains a slash pair when the path is fine', () => {
        expect(normalizePath('/search?backTo=https://example.com')).toBe('/search?backTo=https://example.com');
        expect(mockLogAlert).not.toHaveBeenCalled();
    });
});
