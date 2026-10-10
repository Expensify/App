import getFormattedPostedDate from '@libs/TransactionUtils/getFormattedPostedDate';

describe('getFormattedPostedDate', () => {
    it('converts a raw YYYYMMDD card posted date to YYYY-MM-DD', () => {
        expect(getFormattedPostedDate('20260710')).toBe('2026-07-10');
        expect(getFormattedPostedDate('20251231')).toBe('2025-12-31');
    });

    it('converts a raw YYYYMMDDHHmmss card posted date to YYYY-MM-DD', () => {
        // Given a posted value with a time suffix, as some card feeds (e.g. Amex) send it
        const posted = '20261002153000';

        // When it is formatted for display
        const result = getFormattedPostedDate(posted);

        // Then only the date is shown, so the Search "Posted" column doesn't show the raw value
        expect(result).toBe('2026-10-02');
    });

    it('passes an already-ISO date through unchanged (idempotent)', () => {
        expect(getFormattedPostedDate('2026-07-10')).toBe('2026-07-10');
    });

    it('returns an empty string for empty/undefined input', () => {
        expect(getFormattedPostedDate(undefined)).toBe('');
        expect(getFormattedPostedDate('')).toBe('');
    });

    it('passes any non-YYYYMMDD string through unchanged', () => {
        expect(getFormattedPostedDate('2026-7-1')).toBe('2026-7-1');
        expect(getFormattedPostedDate('not-a-date')).toBe('not-a-date');
    });
});
