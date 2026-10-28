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

    it('alerts once for a malformed path, logging it without the query', () => {
        normalizePath('//settings/profile?q=secret');

        expect(mockLogAlert).toHaveBeenCalledTimes(1);
        expect(mockLogAlert).toHaveBeenCalledWith(expect.stringContaining('malformed path'), {path: '/settings/profile'});
        expect(JSON.stringify(mockLogAlert.mock.calls)).not.toContain('secret');
    });

    // Redaction relies on the `/v/:accountID/:validateCode` shape, which repeated slashes break, so the
    // collapsed path is what gets logged.
    it.each(['//v/123/CODE123', '/v//123/CODE123', '/v/123//CODE123', '//u/456/CODE123'])('redacts the validate code in %s', (input) => {
        normalizePath(input);

        expect(JSON.stringify(mockLogAlert.mock.calls)).not.toContain('CODE123');
        expect(JSON.stringify(mockLogAlert.mock.calls)).toContain('redacted');
    });

    it('keeps a fragment intact, including a slash pair inside it', () => {
        expect(normalizePath('//home#https://example.com')).toBe('/home#https://example.com');
    });

    it('does not alert for a fragment that contains a slash pair when the path is fine', () => {
        expect(normalizePath('/home#https://example.com')).toBe('/home#https://example.com');
        expect(mockLogAlert).not.toHaveBeenCalled();
    });

    it('keeps the query intact, including a slash pair inside a param', () => {
        expect(normalizePath('//search?q=a&backTo=https://example.com')).toBe('/search?q=a&backTo=https://example.com');
    });

    it('does not alert for a query that contains a slash pair when the path is fine', () => {
        expect(normalizePath('/search?backTo=https://example.com')).toBe('/search?backTo=https://example.com');
        expect(mockLogAlert).not.toHaveBeenCalled();
    });
});
