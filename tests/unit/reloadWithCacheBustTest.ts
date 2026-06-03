/**
 * Tests for reloadWithCacheBust.
 *
 * index.html is served with Cache-Control: max-age=86400, so a plain reload can be
 * handed a stale shell from Safari's HTTP cache (or the CDN edge) that still references
 * dead chunk hashes. reloadWithCacheBust navigates to a unique URL so the document is
 * fetched fresh from the network, breaking the ChunkLoadError loop.
 */
import reloadWithCacheBust from '@libs/reloadWithCacheBust';

const ORIGINAL_HREF = 'https://new.expensify.com/r/123';

describe('reloadWithCacheBust', () => {
    let replacedUrl: string | undefined;
    let replaceMock: jest.Mock;
    let reloadMock: jest.Mock;

    beforeEach(() => {
        replacedUrl = undefined;
        replaceMock = jest.fn((url: string) => {
            replacedUrl = url;
        });
        reloadMock = jest.fn();
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: {href: ORIGINAL_HREF, replace: replaceMock, reload: reloadMock},
        });
    });

    it('navigates to a unique cache-busting URL via replace (bypasses HTTP/edge cache)', () => {
        reloadWithCacheBust();

        expect(replaceMock).toHaveBeenCalledTimes(1);
        const target = new URL(replacedUrl ?? '');
        // Preserves the current route while adding a unique param that forces a cache miss.
        expect(target.pathname).toBe('/r/123');
        expect(target.searchParams.get('forceReload')).toBeTruthy();
        expect(reloadMock).not.toHaveBeenCalled();
    });

    it('falls back to a plain reload when navigation throws', () => {
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: {
                href: ORIGINAL_HREF,
                replace: () => {
                    throw new Error('replace blocked');
                },
                reload: reloadMock,
            },
        });

        reloadWithCacheBust();

        expect(reloadMock).toHaveBeenCalledTimes(1);
    });
});
