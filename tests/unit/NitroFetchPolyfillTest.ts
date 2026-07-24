/**
 * Verifies the NitroFetch routing predicate: local-resource URIs (file/content/blob/data) must be
 * treated as local so the polyfill sends them to the platform's native fetch, while network URLs are
 * left for NitroFetch. NitroFetch is an HTTP(S) client that cannot read local URIs, so routing a
 * local URI to NitroFetch breaks features like the spreadsheet/tag importer that read a picked file with a bare
 * `fetch(fileURI)`.
 */
import isLocalFetchUri from '@src/polyfills/isLocalFetchUri';

describe('isLocalFetchUri', () => {
    it.each([
        ['file:///storage/emulated/0/tags.csv'],
        ['content://com.android.providers.downloads/document/123'],
        ['blob:https://example.com/abc'],
        ['data:text/csv;base64,YWJj'],
        ['FILE:///UPPER/CASE.csv'],
    ])('treats local URI %s as local (routes to native fetch)', (uri) => {
        expect(isLocalFetchUri(uri)).toBe(true);
    });

    it.each([['https://www.expensify.com/api'], ['http://localhost:8080/x']])('treats network URL %s as non-local (routes to NitroFetch)', (url) => {
        expect(isLocalFetchUri(url)).toBe(false);
    });

    it('reads the URL from a URL object', () => {
        expect(isLocalFetchUri(new URL('file:///tmp/a.csv'))).toBe(true);
        expect(isLocalFetchUri(new URL('https://www.expensify.com'))).toBe(false);
    });
});
