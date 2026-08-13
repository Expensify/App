import getFormattedPostedDate from '@libs/TransactionUtils/getFormattedPostedDate';

describe('getFormattedPostedDate', () => {
    it('converts a raw YYYYMMDD card posted date to YYYY-MM-DD', () => {
        expect(getFormattedPostedDate('20260710')).toBe('2026-07-10');
        expect(getFormattedPostedDate('20251231')).toBe('2025-12-31');
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
