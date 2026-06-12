import {getLocalizedVictoryChartLabelText, parseDateAsUTC} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/localizeVictoryChartLabelText';

describe('localizeVictoryChartLabelText', () => {
    describe('parseDateAsUTC', () => {
        it('parses server UTC chart timestamps', () => {
            const utcDate = parseDateAsUTC('Jun 5, 2026 at 06:47 PM');
            expect(utcDate?.toISOString()).toBe('2026-06-05T18:47:00.000Z');
        });

        it('parses server UTC chart timestamps without a leading zero on the hour', () => {
            const utcDate = parseDateAsUTC('Jun 12, 2026 at 8:48 AM');
            expect(utcDate?.toISOString()).toBe('2026-06-12T08:48:00.000Z');
        });

        it('returns null for unparseable timestamps', () => {
            expect(parseDateAsUTC('not a date')).toBeNull();
        });
    });

    describe('getLocalizedVictoryChartLabelText', () => {
        it('rewrites As of labels in the viewer timezone without a timezone label', () => {
            expect(getLocalizedVictoryChartLabelText('As of: Jun 5, 2026 at 06:47 PM', 'America/Los_Angeles')).toBe('As of: Jun 5, 2026 at 11:47 AM');
        });

        it('leaves non-As-of labels unchanged', () => {
            expect(getLocalizedVictoryChartLabelText('Top employees by spend', 'America/Los_Angeles')).toBe('Top employees by spend');
        });

        it('returns the original text when no timezone is provided', () => {
            expect(getLocalizedVictoryChartLabelText('As of: Jun 5, 2026 at 06:47 PM')).toBe('As of: Jun 5, 2026 at 06:47 PM');
        });

        it('returns the original text when the timestamp cannot be parsed', () => {
            expect(getLocalizedVictoryChartLabelText('As of: not a date', 'America/Los_Angeles')).toBe('As of: not a date');
        });
    });
});
