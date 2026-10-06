import getFormattedPostedDate from '@libs/TransactionUtils/getFormattedPostedDate';

describe('getFormattedPostedDate', () => {
    it('converts a raw YYYYMMDD card posted date to YYYY-MM-DD', () => {
        expect(getFormattedPostedDate('20260710')).toBe('2026-07-10');
        expect(getFormattedPostedDate('20251231')).toBe('2025-12-31');
    });

    it('converts a raw YYYYMMDDHHmmss card posted date to YYYY-MM-DD', () => {
        expect(getFormattedPostedDate('20261002153000')).toBe('2026-10-02');
        expect(getFormattedPostedDate('20251231235959')).toBe('2025-12-31');
    });

    it('passes an already-ISO date through unchanged (idempotent)', () => {
        expect(getFormattedPostedDate('2026-07-10')).toBe('2026-07-10');
    });

    it('drops the time from an ISO date with a time', () => {
        expect(getFormattedPostedDate('2026-10-02 15:30:00')).toBe('2026-10-02');
        expect(getFormattedPostedDate('2026-10-02T15:30:00Z')).toBe('2026-10-02');
    });

    it('returns an empty string for empty/undefined input', () => {
        expect(getFormattedPostedDate(undefined)).toBe('');
        expect(getFormattedPostedDate('')).toBe('');
    });

    it('returns an empty string for an unsupported format', () => {
        expect(getFormattedPostedDate('2026-7-1')).toBe('');
        expect(getFormattedPostedDate('not-a-date')).toBe('');
        expect(getFormattedPostedDate('202610021530')).toBe('');
    });

    it('returns an empty string for a date that does not exist', () => {
        expect(getFormattedPostedDate('20260230')).toBe('');
        expect(getFormattedPostedDate('20261340153000')).toBe('');
        expect(getFormattedPostedDate('2026-02-30')).toBe('');
    });
});
