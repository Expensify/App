import {getRelativeUrl, isTravelLink} from '@libs/TravelUtils';

describe('TravelUtils', () => {
    describe('isTravelLink', () => {
        it('should return false for empty or undefined values', () => {
            expect(isTravelLink('')).toBe(false);
            expect(isTravelLink(undefined as unknown as string)).toBe(false);
        });

        it('should return true for direct travel domain links', () => {
            expect(isTravelLink('https://travel.expensify.com')).toBe(true);
            expect(isTravelLink('https://staging.travel.expensify.com')).toBe(true);
            expect(isTravelLink('https://dev.travel.expensify.com/some/path')).toBe(true);
        });

        it('should return true for trip links on expensify domains', () => {
            expect(isTravelLink('https://www.expensify.com/trips/123')).toBe(true);
            expect(isTravelLink('https://staging.expensify.com/trips/abc')).toBe(true);
            expect(isTravelLink('https://dev.expensify.com/trips/123/details')).toBe(true);
        });

        it('should return false for non-trip expensify links', () => {
            expect(isTravelLink('https://www.expensify.com')).toBe(false);
            expect(isTravelLink('https://www.expensify.com/settings')).toBe(false);
            expect(isTravelLink('https://www.expensify.com/trip/123')).toBe(false);
        });

        it('should return false for non-expensify domains', () => {
            expect(isTravelLink('https://example.com/trips/123')).toBe(false);
            expect(isTravelLink('https://travel.fake-expensify.com')).toBe(false);
        });

        it('should return false for invalid URLs', () => {
            expect(isTravelLink('not-a-url')).toBe(false);
            expect(isTravelLink('expensify.com/trips/123')).toBe(false);
        });

        it('should be case-insensitive', () => {
            expect(isTravelLink('HTTPS://TRAVEL.EXPENSIFY.COM')).toBe(true);
            expect(isTravelLink('https://www.expensify.com/TRIPS/123')).toBe(true);
        });
    });

    describe('getRelativeUrl', () => {
        it('should return the pathname for a valid URL', () => {
            expect(getRelativeUrl('https://staging.new.expensify.com/trips/3737539511')).toBe('/trips/3737539511');
        });

        it('should include query parameters if present', () => {
            expect(getRelativeUrl('https://www.expensify.com/trips/123?from=chat&env=staging')).toBe('/trips/123?from=chat&env=staging');
        });

        it('should include hash if present', () => {
            expect(getRelativeUrl('https://www.expensify.com/trips/123#details')).toBe('/trips/123#details');
        });

        it('should include both query parameters and hash if present', () => {
            expect(getRelativeUrl('https://www.expensify.com/trips/123?foo=bar#section')).toBe('/trips/123?foo=bar#section');
        });

        it('should work with different environments and subdomains', () => {
            expect(getRelativeUrl('https://travel.expensify.com/trips/1')).toBe('/trips/1');
            expect(getRelativeUrl('https://staging.travel.expensify.com/trips/2')).toBe('/trips/2');
            expect(getRelativeUrl('https://dev.new.expensify.com/settings/profile')).toBe('/settings/profile');
        });

        it('should return "/" for root URLs', () => {
            expect(getRelativeUrl('https://www.expensify.com')).toBe('/');
            expect(getRelativeUrl('https://www.expensify.com/')).toBe('/');
        });

        it('should preserve trailing slashes', () => {
            expect(getRelativeUrl('https://www.expensify.com/trips/123/')).toBe('/trips/123/');
        });

        it('should return an empty string for empty input', () => {
            expect(getRelativeUrl('')).toBe('');
        });

        it('should return an empty string for undefined or null values', () => {
            expect(getRelativeUrl(undefined as unknown as string)).toBe('');
            expect(getRelativeUrl(null as unknown as string)).toBe('');
        });

        it('should return an empty string for invalid URLs', () => {
            expect(getRelativeUrl('not-a-url')).toBe('');
            expect(getRelativeUrl('expensify.com/trips/123')).toBe('');
        });

        it('should handle URLs with encoded characters', () => {
            expect(getRelativeUrl('https://www.expensify.com/trips/%E2%9C%93')).toBe('/trips/%E2%9C%93');
        });

        it('should not be affected by protocol case', () => {
            expect(getRelativeUrl('HTTPS://WWW.EXPENSIFY.COM/TRIPS/123')).toBe('/TRIPS/123');
        });
    });
});
